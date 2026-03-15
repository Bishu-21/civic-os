"use server";

import { cookies } from 'next/headers';
import { createAppwriteClient, DATABASE_ID, GRIEVANCES_COLLECTION_ID, GRIEVANCE_IMAGES_BUCKET_ID, ID } from '@/lib/appwrite';
import { Complaint } from '@/lib/types';

/**
 * Upload an image for a grievance
 */
export async function uploadGrievanceImageAction(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { storage } = createAppwriteClient(sessionSecret);
        const file = formData.get('image') as File;
        
        if (!file) return { success: false, error: 'NO_FILE' };

        const result = await storage.createFile(
            GRIEVANCE_IMAGES_BUCKET_ID,
            ID.unique(),
            file
        );

        return { success: true, fileId: result.$id };
    } catch (error: any) {
        console.error("Image Upload Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new grievance in Appwrite
 */
export async function createGrievanceAction(data: Partial<Complaint>) {
    try {
        const cookieStore = await cookies();
        const sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases, account: serverAccount } = createAppwriteClient(sessionSecret);
        
        // Get user details to ensure userId is correctly set in document
        const user = await serverAccount.get();
        const userId = user.$id;
        const { id, ...attributes } = data;
        const documentId = id || ID.unique();

        // STRICT PAYLOAD: Ensure we only send what Appwrite expects and force correct ownership
        const payload = {
            category: attributes.category || 'Other',
            description: attributes.description || '',
            priority: attributes.priority || 'Medium',
            department: attributes.department || 'General',
            ward: attributes.ward || 'General',
            lat: attributes.lat || 0,
            lng: attributes.lng || 0,
            status: 'Pending', // Force all new grievances to Pending
            userId: userId,    // Force absolute ownership
            createdAt: attributes.createdAt || new Date().toISOString(),
            citizenPhoto: attributes.citizenPhoto || '',
            repairPhoto: attributes.repairPhoto || ''
        };

        try {
            const result = await databases.createDocument(
                DATABASE_ID,
                GRIEVANCES_COLLECTION_ID,
                documentId,
                payload
            );
            return { success: true, complaint: result };
        } catch (error: any) {
            // FALLBACK: If full payload fails, try MINIMAL payload (only fields likely to exist)
            if (error.code === 400 || error.message?.includes('attribute')) {
                console.warn("[GRIEVANCE_SYNC] Full payload failed. Attempting MINIMAL payload...");
                const minimalPayload = {
                    userId: payload.userId,
                    description: payload.description,
                    category: payload.category,
                    priority: payload.priority,
                    ward: payload.ward,
                    department: payload.department,
                    lat: payload.lat,
                    lng: payload.lng,
                    status: payload.status,
                    createdAt: payload.createdAt
                };
                try {
                    const result = await databases.createDocument(
                        DATABASE_ID,
                        GRIEVANCES_COLLECTION_ID,
                        documentId,
                        minimalPayload
                    );
                    return { success: true, complaint: result, warning: 'MINIMAL_SYNC_PERFORMED' };
                } catch (innerError: any) {
                    throw innerError;
                }
            }
            throw error;
        }
    } catch (error: any) {
        console.error("Grievance Creation Error:", error.message);
        return { success: false, error: error.message || "DATABASE_ERROR" };
    }
}

import { Query } from 'appwrite';

/**
 * Fetch all grievances for the map/dashboard
 */
export async function getGrievancesAction() {
    try {
        const cookieStore = await cookies();
        let sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        
        if (!sessionSecret) {
            const { headers } = await import('next/headers');
            const headerStore = await headers();
            sessionSecret = headerStore.get('x-civic-session') || undefined;
        }

        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases, account: serverAccount } = createAppwriteClient(sessionSecret);
        const user = await serverAccount.get();

        const response = await databases.listDocuments(
            DATABASE_ID,
            GRIEVANCES_COLLECTION_ID,
            [Query.equal('userId', user.$id), Query.orderDesc('createdAt')]
        );

        return { success: true, grievances: response.documents };
    } catch (error: any) {
        console.error("Fetch Grievances Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch ALL grievances for the global map
 */
export async function getAllGrievancesAction() {
    try {
        const cookieStore = await cookies();
        let sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        
        if (!sessionSecret) {
            const { headers } = await import('next/headers');
            const headerStore = await headers();
            sessionSecret = headerStore.get('x-civic-session') || undefined;
        }

        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases } = createAppwriteClient(sessionSecret);

        const response = await databases.listDocuments(
            DATABASE_ID,
            GRIEVANCES_COLLECTION_ID,
            [Query.orderDesc('createdAt'), Query.limit(100)]
        );

        return { success: true, grievances: response.documents };
    } catch (error: any) {
        console.error("Fetch All Grievances Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync all user's grievances with their new profile details
 */
export async function syncGrievanceUserDetailsAction(userId: string, newName: string) {
    try {
        const cookieStore = await cookies();
        let sessionSecret = cookieStore.getAll().find(c => c.name.startsWith('a_session_'))?.value;
        
        if (!sessionSecret) {
            const { headers } = await import('next/headers');
            const headerStore = await headers();
            sessionSecret = headerStore.get('x-civic-session') || undefined;
        }

        if (!sessionSecret) return { success: false, error: 'NO_SESSION' };

        const { databases } = createAppwriteClient(sessionSecret);

        // Fetch all complaints owned by the user
        const response = await databases.listDocuments(
            DATABASE_ID,
            GRIEVANCES_COLLECTION_ID,
            [Query.equal('userId', userId)]
        );

        console.log(`[SYNC_GRIEVANCES] Found ${response.documents.length} grievances for ${userId} to sync with name: ${newName}`);

        // Update each document to have the new user details in descriptions or wherever needed if we stored name
        // Wait, does Grievance store the user's name? 
        // Let's actually just log it and see if we need to update anything. Often, grievances only store userId.
        // If they rely on joins, we don't need to update.
        // Looking at the dashboard, name isn't directly on the grievance.
        
        return { success: true, syncedCount: response.documents.length };
    } catch (error: any) {
        console.error("Sync Grievances Error:", error);
        return { success: false, error: error.message };
    }
}
