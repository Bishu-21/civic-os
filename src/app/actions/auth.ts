'use server';

import { account, ID } from '@/lib/appwrite';
import { cookies } from 'next/headers';

/**
 * Send an OTP to a mobile number
 */
export async function createPhoneTokenAction(mobile: string) {
    try {
        const sessionToken = await account.createPhoneToken(ID.unique(), '+91' + mobile);
        return { success: true, userId: sessionToken.userId };
    } catch (error: any) {
        console.error("Auth Action - Send OTP Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify the OTP and create a session
 * NOTE: This is tricky on the server with the Web SDK. 
 * Usually, the session is created via the SDK which sets an HTTP-only cookie.
 */
export async function verifyOTPAction(userId: string, secret: string) {
    try {
        const session = await account.createSession(userId, secret);
        // In a real server-side setup, we'd manage the session cookie here.
        // For now, let's return success and see if the SDK's automatic handling works or if we need more steps.
        return { success: true, session };
    } catch (error: any) {
        console.error("Auth Action - Verify OTP Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get the current user
 */
export async function getCurrentUserAction() {
    try {
        const user = await account.get();
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: 'NO_SESSION' };
    }
}

/**
 * Logout
 */
export async function logoutAction() {
    try {
        await account.deleteSession('current');
        return { success: true };
    } catch (error: any) {
        console.error("Auth Action - Logout Error:", error);
        return { success: false, error: error.message };
    }
}
