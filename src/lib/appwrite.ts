import { Client, Account, Databases, Storage, ID } from 'appwrite';

// This file is now server-only. Do NOT export things that are used in client components
// except via Server Actions.

const client = new Client();

// Only initialize if we have the server-side environment variables
if (process.env.APPWRITE_ENDPOINT && process.env.APPWRITE_PROJECT_ID) {
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'user_profiles';
export const PROFILES_COLLECTION_ID = process.env.APPWRITE_PROFILES_COLLECTION_ID || 'user_profiles'; 
export const PROFILE_IMAGES_BUCKET_ID = process.env.APPWRITE_PROFILE_IMAGES_BUCKET_ID || '';

export { client, ID };
