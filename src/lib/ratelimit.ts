import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// 1. Initialize Redis Client
// Pulls from UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN automatically
export const redis = Redis.fromEnv();

/**
 * Standard Limiter: 10 requests per 10 seconds.
 * Suitable for general dashboard/profile updates.
 */
export const standardLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit-standard",
});

/**
 * Strict Limiter: 5 attempts per 1 minute.
 * Specifically for mobile OTP generation and registration to prevent SMS/Auth abuse.
 */
export const strictLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit-strict",
});

/**
 * Utility to get client IP for rate limiting inside Server Actions.
 * Handles headers() requirement in Next.js.
 */
export async function getClientIp() {
    const { headers } = await import("next/headers");
    const headerInstance = await headers();
    const forwardedFor = headerInstance.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0];
    }
    return "127.0.0.1";
}

// Circuit Breaker State
let isRedisHealthy = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_COOLDOWN = 60000; // 60 seconds

export function markRedisUnhealthy() {
    if (isRedisHealthy) {
        console.warn(`[REDIS_CIRCUIT_BREAKER] Redis marked as UNHEALTHY. Bypassing Redis operations.`);
        isRedisHealthy = false;
        lastHealthCheck = Date.now();
    }
}

export function isRedisAvailable(): boolean {
    if (!isRedisHealthy) {
        // Periodically retry after cooldown to see if Redis recovered
        if (Date.now() - lastHealthCheck > HEALTH_CHECK_COOLDOWN) {
            console.log(`[REDIS_CIRCUIT_BREAKER] Cooldown finished. Retrying Redis health...`);
            isRedisHealthy = true;
            return true;
        }
        return false;
    }
    return true;
}

/**
 * Resilient rate limit wrapper that fails open if Upstash Redis is down or unreachable.
 * Implements a 1.0s timeout and utilizes the circuit breaker.
 */
export async function checkRateLimit(limiter: Ratelimit, key: string): Promise<{ success: boolean }> {
    if (!isRedisAvailable()) {
        return { success: true };
    }
    try {
        const limitPromise = limiter.limit(key);
        const timeoutPromise = new Promise<any>((resolve) => 
            setTimeout(() => {
                console.warn(`[RATELIMIT] Upstash Redis timed out. Failing open.`);
                markRedisUnhealthy();
                resolve({ success: true });
            }, 1000)
        );
        const result = await Promise.race([limitPromise, timeoutPromise]);
        return { success: result.success };
    } catch (error: any) {
        console.error(`[RATELIMIT_ERROR] Upstash rate limit connection failed: ${error.message}. Failing open.`);
        markRedisUnhealthy();
        return { success: true };
    }
}

