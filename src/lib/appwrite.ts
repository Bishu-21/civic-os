import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69b02bf0001038d5437c');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = 'user_profiles';
export const PROFILES_COLLECTION_ID = 'user_profiles'; 
export const PROFILE_IMAGES_BUCKET_ID = '69b313a3001da90f7d33'; 

export { client };
