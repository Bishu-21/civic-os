import { Client, Account, Databases, Storage, ID, TablesDB } from 'appwrite';
import { env } from './env';

/**
 * Appwrite configuration for both client and server use.
 * Server-side uses base variables, client-side uses NEXT_PUBLIC_ prefixed ones.
 */
const PROJECT_ID = env.APPWRITE_PROJECT_ID || '';

/**
 * Client-side Appwrite singleton.
 * Uses relative proxy to fix Incognito cookie issues.
 */
const createBrowserClient = () => {
    const c = new Client();
    // Ensure relative endpoints get the full origin for the Appwrite SDK
    const rawEndpoint = env.APPWRITE_ENDPOINT || '/appwrite-proxy';
    const endpoint = (typeof window !== 'undefined' && rawEndpoint.startsWith('/')) 
        ? `${window.location.origin}${rawEndpoint}` 
        : rawEndpoint;
    c.setEndpoint(endpoint).setProject(PROJECT_ID);
    return c;
};

// Singleton for browser use
export const client = typeof window !== 'undefined' ? createBrowserClient() : new Client().setEndpoint(env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1').setProject(PROJECT_ID);
export const account = new Account(client);
export const databases = new Databases(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

export const DATABASE_ID = env.DATABASE_ID;
export const PROFILES_COLLECTION_ID = env.PROFILES_COLLECTION_ID; 
export const GRIEVANCES_COLLECTION_ID = env.GRIEVANCES_COLLECTION_ID;
export const PROFILE_IMAGES_BUCKET_ID = env.PROFILE_IMAGES_BUCKET_ID;
export const GRIEVANCE_IMAGES_BUCKET_ID = env.GRIEVANCE_IMAGES_BUCKET_ID;

export const APPWRITE_PROJECT_ID = PROJECT_ID;
export { ID };
