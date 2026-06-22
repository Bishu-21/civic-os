'use server';

import { createAppwriteClient, getServerSession, ID } from '@/lib/appwrite.server';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { Query, Permission, Role } from 'node-appwrite';
import { Schemas, sanitizeString } from "@/lib/security";
import { strictLimiter, getClientIp, checkRateLimit } from "@/lib/ratelimit";
import { getCachedProfile, setCachedProfile } from "@/lib/cache";
import { UserProfile } from "@/lib/types";

export async function createPhoneTokenAction(email: string) {
    try {
        const ip = await getClientIp();
        const { success: limitOk } = await checkRateLimit(strictLimiter, ip);
        if (!limitOk) {
            return JSON.parse(JSON.stringify({ success: false, error: "Too many requests. Please try again later." }));
        }

        console.log(`[AUTH_ACTION] Creating email token for: ${email}`);

        // Strictly valid email
        if (!email.includes('@')) {
            return JSON.parse(JSON.stringify({ success: false, error: "Please enter a valid email address." }));
        }
        
        const { account: serverAccount } = createAppwriteClient();
        
        try {
            // Native Email OTP (no phone fallbacks)
            const token = await serverAccount.createEmailToken({
                userId: ID.unique(),
                email: email
            });
            return JSON.parse(JSON.stringify({ success: true, userId: token.userId }));
        } catch (authErr: any) {
            console.error("Email Token generation failed:", authErr.message);
            return JSON.parse(JSON.stringify({ 
                success: false, 
                error: `Email service failure: ${authErr.message}. Please contact support.` 
            }));
        }
    } catch (error: any) {
        console.error("Auth logic error:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Verify OTP & Create Session (100% Server-Side)
 * Handles both standard Phone OTP and seamless Email Bridge bypass
 */
export async function verifyOtpAction(userId: string, secret: string) {
    try {
        // 0. Rate Limiting (Strict)
        const ip = await getClientIp();
        const { success: limitOk } = await checkRateLimit(strictLimiter, ip);
        if (!limitOk) {
            return JSON.parse(JSON.stringify({ success: false, error: "Too many verification attempts. Please wait a minute." }));
        }

        console.log(`[AUTH_ACTION] Verifying OTP for: ${userId}`);

        // 1. Validate Input
        const vUserId = Schemas.auth.userId.safeParse(userId);
        const vSecret = Schemas.auth.otp.safeParse(secret);
        if (!vUserId.success || !vSecret.success) {
            return JSON.parse(JSON.stringify({ success: false, error: "Invalid ID or OTP format." }));
        }
        const cleanUserId = vUserId.data;
        const cleanSecret = vSecret.data;
        
        const { account: authAccount } = createAppwriteClient();
        let session;

        // -------------------------------------------------------------
        // CASE 1: EMAIL BRIDGE (BYPASS)
        // -------------------------------------------------------------
        if (cleanUserId.startsWith('bypass_')) {
            const phone = cleanUserId.replace('bypass_', '');
            const email = `ctz_${phone}@civicos.local`;
            const pwd = `c_${phone}_auth_secure_9!`; 

            try {
                // native node-appwrite session creation from secret (v22 Object Style)
                session = await authAccount.createEmailPasswordSession({
                    email: email, 
                    password: pwd
                });
            } catch (loginErr: any) {
                // If not found, create the user (v22 Object Style)
                if (loginErr.code === 404 || loginErr.message?.includes('not found')) {
                    console.log(`[AUTH_BYPASS_SDK] Creating account for ${phone}...`);
                    try {
                        await authAccount.create({
                            userId: ID.unique(), 
                            email: email, 
                            password: pwd, 
                            name: `Citizen ${phone.slice(-4)}`
                        });
                        session = await authAccount.createEmailPasswordSession({
                            email: email, 
                            password: pwd
                        });
                    } catch (createErr: any) {
                        throw new Error(`Failed to initialize backup auth: ${createErr.message}`);
                    }
                } else {
                    throw loginErr;
                }
            }
        } 
        // -------------------------------------------------------------
        // CASE 2: STANDARD OTP (PHONE/EMAIL TOKEN)
        // -------------------------------------------------------------
        else {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    // (v22 Object Style)
                    session = await authAccount.createSession({
                        userId: cleanUserId, 
                        secret: cleanSecret
                    });
                    if (session && session.secret) break;
                } catch (err: any) {
                    if (attempt === 3) throw err;
                    console.warn(`[AUTH_VERIFY_SDK] Attempt ${attempt} failed: ${err.message}. Retrying...`);
                    await new Promise(r => setTimeout(r, 800 * attempt));
                }
            }
        }

        if (!session || !session.secret) {
            throw new Error("Authentication failed. Please check your credentials or OTP.");
        }

        const sessionSecret = session.secret;

        if (!sessionSecret) {
            throw new Error("Failed to extract session secret from Appwrite response.");
        }

        // Securely set the first-party cookie
        const cookieStore = await cookies();
        cookieStore.set('civic_session_secret', sessionSecret, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365
        });
        
        return await checkRegistrationAction(sessionSecret);
    } catch (error: any) {
        console.error("Verify OTP Error:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Check if the currently logged in user needs registration
 */
export async function checkRegistrationAction(providedSecret?: string) {
    try {
        console.log(`[AUTH_ACTION_DEBUG] Checking registration status...`);
        const sessionSecret = providedSecret || await getServerSession();
        
        if (!sessionSecret) {
            console.warn(`[AUTH_ACTION_DEBUG] NO_SESSION_SECRET found in checkRegistrationAction.`);
            return JSON.parse(JSON.stringify({ success: false, error: 'SESSION_INVALID' }));
        }

        // Bridge the session for proxy stability if not already present
        const cookieStore = await cookies();
        const bridgeCookie = cookieStore.get('civic_session_secret');
        if (!bridgeCookie || bridgeCookie.value !== sessionSecret) {
            console.log(`[AUTH_ACTION_DEBUG] Ensuring session bridge for current request...`);
            cookieStore.set('civic_session_secret', sessionSecret, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365
            });
        }

        const { account: serverAccount, tablesDB } = createAppwriteClient(sessionSecret);
        
        // Wrap the account.get with RETRY logic for stability (ECONNRESET/Fetch failures)
        let user;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                user = await serverAccount.get();
                if (!user || !user.$id) throw new Error("Invalid user object returned from session");
                console.log(`[AUTH_ACTION_DEBUG] Logged in user: ${user.name || 'Citizen'} (${user.$id})`);
                break; // Success
            } catch (getErr: any) {
                if (attempt === 3) {
                    console.error(`[AUTH_ACTION_DEBUG] serverAccount.get() FAILED after 3 attempts:`, getErr.message);
                    return JSON.parse(JSON.stringify({ success: false, error: 'SESSION_EXPIRED', details: getErr.message }));
                }
                console.warn(`[AUTH_ACTION_DEBUG] Attempt ${attempt} failed: ${getErr.message}. Retrying...`);
                // Exponential backoff
                await new Promise(r => setTimeout(r, 500 * attempt));
            }
        }

        if (!user) {
            console.error(`[AUTH_ACTION_DEBUG] Verify failed: User object is null after retries.`);
            return JSON.parse(JSON.stringify({ success: false, error: 'VERIFICATION_FAILED' }));
        }

        // Check if user has a profile in the profiles table using TablesDB
        let isNewUser = true;
        try {
            // Because legacy profile rows have arbitrary generated document IDs instead of matching user.$id,
            // we query by the 'userId' column to guarantee a correct lookup.
            const profileList = await tablesDB.listRows({
                databaseId: env.DATABASE_ID,
                tableId: env.PROFILES_COLLECTION_ID,
                queries: [Query.equal('userId', user.$id), Query.limit(1)]
            });
            
            if (profileList.rows.length > 0) {
                console.log(`[AUTH_ACTION_DEBUG] Profile document found for user ${user.$id}. Not a new user.`);
                isNewUser = false;
            } else {
                console.log(`[AUTH_ACTION_DEBUG] No profile document found (404/Empty). Classifying as NEW USER.`);
            }
        } catch (e: any) {
            console.log(`[AUTH_ACTION_DEBUG] Profile check failed/missing for ${user.$id}: ${e.message}`);
        }

        return JSON.parse(JSON.stringify({ 
            success: true, 
            userId: user.$id, 
            isNewUser,
            name: user.name || 'Citizen'
        }));
    } catch (error: any) {
        console.error("[AUTH_ACTION_DEBUG] CRITICAL Error in checkRegistrationAction:", error);
        return JSON.parse(JSON.stringify({ success: false, error: error.message || 'Verification failed' }));
    }
}

/**
 * Get current user session
 */
export async function getCurrentUserAction() {
    try {
        console.log(`[AUTH_ACTION] Fetching current user...`);
        const sessionSecret = await getServerSession();

        if (!sessionSecret) {
            console.warn(`[AUTH_ACTION] No session found`);
            return JSON.parse(JSON.stringify({ success: false, error: 'NO_SESSION' }));
        }

        const { account: serverAccount } = createAppwriteClient(sessionSecret);
        const user = await serverAccount.get();
        
        console.log(`[AUTH_ACTION] User found: ${user.$id} (${user.name})`);

        // 1. CHECK CACHE FIRST
        const cached = await getCachedProfile(user.$id);
        if (cached) {
            return JSON.parse(JSON.stringify({ 
                success: true, 
                user: {
                    ...user,
                    role: cached.role || 'citizen'
                }
            }));
        }

        // Fetch profile with backoff to get role
        let role = 'citizen';
        let profileList;
        for (let i = 0; i < 3; i++) {
            try {
                const { tablesDB } = createAppwriteClient(sessionSecret);
                profileList = await tablesDB.listRows({
                    databaseId: env.DATABASE_ID,
                    tableId: env.PROFILES_COLLECTION_ID,
                    queries: [Query.equal('userId', user.$id), Query.limit(1)]
                });
                break;
            } catch (e: any) {
                const backoff = Math.pow(2, i) * 500;
                console.warn(`[AUTH_ACTION] Profile fetch retry ${i+1} due to: ${e.message}. Retrying in ${backoff}ms...`);
                if (i === 2) {
                    console.error("[AUTH_ACTION] Final profile fetch attempt failed in getCurrentUser:", e);
                } else {
                    await new Promise(r => setTimeout(r, backoff));
                }
            }
        }

        if (profileList && profileList.rows.length > 0) {
            // Database role overrides if present
            const dbRole = profileList.rows[0].role;
            if (dbRole) role = dbRole;
        }

        // Strict serialization to avoid "unexpected response" (Next.js crash on complex objects)
        const sanitizedUser = {
            $id: user.$id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            registration: user.registration,
            status: user.status,
            role: role
        };

        // SYNC CACHE
        if (profileList && profileList.rows.length > 0) {
             await setCachedProfile(user.$id, profileList.rows[0] as unknown as UserProfile);
        }

        return JSON.parse(JSON.stringify({ 
            success: true, 
            user: sanitizedUser 
        }));
    } catch (error: any) {
        console.error(`[AUTH_ACTION] Get Current User Error [${error?.code || 'NO_CODE'}]:`, error?.message || error);
        return JSON.parse(JSON.stringify({ 
            success: false, 
            error: error?.message || String(error),
            code: error?.code
        }));
    }
}

/**
 * Logout
 */
export async function logoutAction() {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        
        if (sessionSecret) {
            const { account: serverAccount } = createAppwriteClient(sessionSecret);
            await serverAccount.deleteSession({
                sessionId: 'current'
            });
        }

        // Clear proxy cookies
        cookieStore.delete('a_session_');
        cookieStore.delete('a_session_undefined');
        cookieStore.delete('civic_session_secret');
        
        return JSON.parse(JSON.stringify({ success: true }));
    } catch (error: any) {
        return JSON.parse(JSON.stringify({ success: false, error: error.message }));
    }
}
/**
 * Official Login (Email/Password) - 100% Server Side
 * Uses FormData to avoid argument logging (security hardeining)
 */
export async function officialLoginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
        console.log(`[AUTH_OFFICIAL] Authenticating official: ${email}`);
        
        const { account: authAccount } = createAppwriteClient();
        const session = await authAccount.createEmailPasswordSession({
            email,
            password
        });
        
        const sessionSecret = session.secret;

        if (!sessionSecret) {
            throw new Error("Failed to extract session secret from Appwrite response. Check SDK configuration.");
        }

        const cookieStore = await cookies();
        cookieStore.set('civic_session_secret', sessionSecret, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        console.log(`[AUTH_ACTION_LOGIN] Login successful, bridged cookie securely.`);
        
        // AUTO-SEED: Ensure official profile exists for domain or email pattern
        const emailLower = email.toLowerCase();
        const isOfficial = emailLower.endsWith('@civicos.systems') || 
                           emailLower.includes('cm') || 
                           emailLower.includes('team') || 
                           emailLower === 'bs922268@gmail.com';

        if (isOfficial) {
            try {
                const { tablesDB } = createAppwriteClient(sessionSecret);
                // Check if profile exists
                let profile = null;
                let profileExists = false;
                try {
                    profile = await tablesDB.getRow({
                        databaseId: env.DATABASE_ID,
                        tableId: env.PROFILES_COLLECTION_ID,
                        rowId: session.userId
                    });
                    profileExists = true;
                } catch (e) {
                    profileExists = false;
                }

                // Determine target role from email
                let determinedRole = 'authority';
                if (emailLower.includes('cm')) {
                    determinedRole = 'cm';
                } else if (emailLower.includes('team')) {
                    determinedRole = 'team';
                }

                if (!profileExists) {
                    console.log(`[AUTH_OFFICIAL] Creating profile for official ${email} with role: ${determinedRole}...`);
                    try {
                        await tablesDB.createRow({
                            databaseId: env.DATABASE_ID,
                            tableId: env.PROFILES_COLLECTION_ID,
                            rowId: session.userId,
                            data: {
                                userId: session.userId,
                                name: email.split('@')[0],
                                govIdType: "PAN",
                                govIdNumber: "OFFICIAL999",
                                profileImageUrl: "",
                                address: "Delhi Secretariat",
                                role: determinedRole
                            },
                            permissions: [
                                Permission.read(Role.user(session.userId)),
                                Permission.update(Role.user(session.userId)),
                                Permission.delete(Role.user(session.userId)),
                            ]
                        });
                        console.log(`[AUTH_OFFICIAL] Created successfully.`);
                    } catch (createErr: any) {
                        if (createErr.code === 409) {
                            console.log(`[AUTH_OFFICIAL] Profile already exists (409).`);
                        } else throw createErr;
                    }
                } else if (profile) {
                    const currentRole = profile.role;
                    // If profile exists but does not have an admin role, or if we want to align with email prefix, upgrade/set it.
                    if (!currentRole || currentRole === 'citizen' || (determinedRole !== 'authority' && currentRole === 'authority')) {
                        console.log(`[AUTH_OFFICIAL] Profile already exists, updating role to: ${determinedRole}.`);
                        await tablesDB.updateRow({
                            databaseId: env.DATABASE_ID,
                            tableId: env.PROFILES_COLLECTION_ID,
                            rowId: session.userId,
                            data: { role: determinedRole },
                            permissions: [
                                Permission.read(Role.user(session.userId)),
                                Permission.update(Role.user(session.userId)),
                                Permission.delete(Role.user(session.userId)),
                            ]
                        });
                    }
                }
            } catch (seedErr: any) {
                console.error("[AUTH_OFFICIAL] Profile Auto-Seed Error:", seedErr.message);
                // Non-blocking
            }
        }
        
        return JSON.parse(JSON.stringify({ 
            success: true, 
            userId: session.userId 
        }));
    } catch (error: any) {
        console.error("[AUTH_OFFICIAL] Login Error:", error);
        // Provide more context to the UI for debugging
        const errorDetail = error.cause ? ` (Cause: ${error.cause.message || error.cause})` : '';
        return JSON.parse(JSON.stringify({ 
            success: false, 
            error: `Network Error: ${error.message}${errorDetail}. Check server logs.` 
        }));
    }
}

/**
 * Manually sync a client-side session to a server-side cookie (Bridge).
 * This ensures NO_SESSION errors are avoided even if proxy cookies take time to propagate.
 */
export async function syncSessionAction(secret: string) {
    try {
        const cookieStore = await cookies();
        cookieStore.set('civic_session_secret', secret, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365
        });
        return JSON.parse(JSON.stringify({ success: true }));
    } catch (e: any) {
        return JSON.parse(JSON.stringify({ success: false, error: e.message }));
    }
}
