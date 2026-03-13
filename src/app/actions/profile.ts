'use server';

import { account, databases, storage, DATABASE_ID, PROFILES_COLLECTION_ID, PROFILE_IMAGES_BUCKET_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

export interface UserProfile {
    userId: string;
    name: string;
    govIdType: string;
    govIdNumber: string;
    profileImageUrl?: string;
}

/**
 * Get the current user's profile from Appwrite Database
 */
export async function getServerProfileAction() {
    try {
        const user = await account.get();
        const response = await databases.listDocuments(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal('userId', user.$id)]
        );

        if (response.documents.length > 0) {
            return { success: true, profile: response.documents[0] as unknown as UserProfile };
        }
        return { success: true, profile: null };
    } catch (error: any) {
        if (error?.code === 401) {
            return { success: false, error: 'NO_SESSION' };
        }
        console.error("Profile Action - Get Profile Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new user profile with optional image
 */
export async function createProfileWithImageAction(formData: FormData) {
    try {
        const userId = formData.get('userId') as string;
        const name = formData.get('name') as string;
        const govIdType = formData.get('govIdType') as string;
        const govIdNumber = formData.get('govIdNumber') as string;
        const imageFile = formData.get('image') as File | null;

        let profileImageUrl = '';

        // 1. Upload Image if exists
        if (imageFile && imageFile.size > 0) {
            const upload = await storage.createFile(
                PROFILE_IMAGES_BUCKET_ID,
                ID.unique(),
                imageFile
            );
            profileImageUrl = storage.getFileView(PROFILE_IMAGES_BUCKET_ID, upload.$id).toString();
        }

        // 2. Create Profile document
        const profile: UserProfile = {
            userId,
            name,
            govIdType,
            govIdNumber,
            profileImageUrl
        };

        const result = await databases.createDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            ID.unique(),
            profile
        );

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Profile Action - Create Profile Error:", error);
        return { success: false, error: error.message };
    }
}
