export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitWindow {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitWindow>();

// Clean up old entries every 5 minutes to prevent memory leaks
if (typeof globalThis !== 'undefined') {
  const intervalId = 'rateLimitCleanupInterval';
  if (!(globalThis as any)[intervalId]) {
    (globalThis as any)[intervalId] = setInterval(() => {
      const now = Date.now();
      for (const [key, window] of rateLimitMap.entries()) {
        const validTimestamps = window.timestamps.filter((ts) => now - ts < 60000);
        if (validTimestamps.length === 0) {
          rateLimitMap.delete(key);
        } else {
          window.timestamps = validTimestamps;
        }
      }
    }, 300000);
  }
}

/**
 * In-memory sliding window rate limiter.
 * @param key Unique key to rate limit (e.g. IP + route)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds (default: 60000 / 1 minute)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60000
): RateLimitResult {
  const now = Date.now();
  let window = rateLimitMap.get(key);

  if (!window) {
    window = { timestamps: [] };
    rateLimitMap.set(key, window);
  }

  // Filter out expired timestamps
  window.timestamps = window.timestamps.filter((ts) => now - ts < windowMs);

  if (window.timestamps.length >= limit) {
    const oldestTimestamp = window.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
    };
  }

  window.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - window.timestamps.length,
    reset: now + windowMs,
  };
}

/**
 * Resets the rate limiter for a specific key (useful in testing)
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}
