import { account, databases, DATABASE_ID, PROFILES_COLLECTION_ID } from "./appwrite";
import { Query } from "appwrite";

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
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
        const user = await account.get();
        const response = await databases.listDocuments(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal('userId', user.$id)]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as UserProfile;
        }
        return null;
    } catch (error: any) {
        // If account.get() fails, it's a 401 (unauthorized)
        if (error?.code === 401) {
            throw new Error('NO_SESSION');
        }
        
        if (error?.code === 404 || error?.message?.includes('Collection with the requested ID')) {
            console.warn("Appwrite Warning: 'user_profiles' collection is missing.");
            return null;
        }
        if (error?.code === 403) {
            console.warn("Appwrite Warning: Missing permissions on 'user_profiles' collection.");
            return null;
        }
        console.error("Error fetching user profile:", error);
        return null;
    }
}

/**
 * Create a new user profile
 */
export async function createUserProfile(profile: UserProfile) {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            'unique()',
            profile
        );
    } catch (error: any) {
        if (error?.code === 404 || error?.message?.includes('Collection with the requested ID')) {
            throw new Error("Appwrite Setup Error: The 'user_profiles' collection is missing in your Database (69b30cf8000f4a8baeb3). Please create it in the Appwrite Console with the ID 'user_profiles'.");
        }
        if (error?.code === 403) {
            throw new Error("Appwrite Permission Error: You haven't granted 'Create' permissions on the 'user_profiles' collection. Go to Collection Settings -> Permissions and add 'Any' or 'Users' with Create/Read/Update/Delete rights.");
        }
        console.error("Error creating user profile:", error);
        throw error;
    }
}
