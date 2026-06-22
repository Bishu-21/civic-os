import { redis, isRedisAvailable, markRedisUnhealthy } from "./ratelimit";
import { UserProfile } from "./types";

export const CACHE_KEYS = {
    // profile:userId
    PROFILE: (userId: string) => `profile:${userId}`,
};

export const CACHE_TIMES = {
    PROFILE: 60 * 60 * 24, // 24 hours
};

/**
 * Get cached profile from Redis
 */
export async function getCachedProfile(userId: string) {
    if (!isRedisAvailable()) {
        return null;
    }
    try {
        const getPromise = redis.get(CACHE_KEYS.PROFILE(userId));
        const timeoutPromise = new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Redis get timeout")), 1000)
        );
        const cached = await Promise.race([getPromise, timeoutPromise]);
        
        if (cached) {
            console.log(`[CACHE] Hit for profile:${userId}`);
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (e: any) {
        console.error(`[CACHE] Get error for ${userId}:`, e.message);
        markRedisUnhealthy();
    }
    return null;
}

/**
 * Set profile in Redis cache
 */
export async function setCachedProfile(userId: string, profile: UserProfile) {
    if (!isRedisAvailable()) {
        return;
    }
    try {
        if (!profile) return;
        const setPromise = redis.set(CACHE_KEYS.PROFILE(userId), JSON.stringify(profile), {
            ex: CACHE_TIMES.PROFILE
        });
        const timeoutPromise = new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Redis set timeout")), 1000)
        );
        await Promise.race([setPromise, timeoutPromise]);
        console.log(`[CACHE] Set for profile:${userId}`);
    } catch (e: any) {
        console.error(`[CACHE] Set error for ${userId}:`, e.message);
        markRedisUnhealthy();
    }
}

/**
 * Invalidate profile cache
 */
export async function invalidateProfileCache(userId: string) {
    if (!isRedisAvailable()) {
        return;
    }
    try {
        const delPromise = redis.del(CACHE_KEYS.PROFILE(userId));
        const timeoutPromise = new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Redis del timeout")), 1000)
        );
        await Promise.race([delPromise, timeoutPromise]);
        console.log(`[CACHE] Invalidated profile:${userId}`);
    } catch (e: any) {
        console.error(`[CACHE] Invalidate error for ${userId}:`, e.message);
        markRedisUnhealthy();
    }
}
