import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, resetRateLimit } from '../security/rate-limiter';

describe('rateLimit helper', () => {
  const ip = '127.0.0.1';
  const route = '/api/chat';
  const key = `${ip}:${route}`;

  beforeEach(() => {
    resetRateLimit(key);
  });

  it('allows requests within limit', () => {
    const result1 = rateLimit(key, 2, 1000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(1);

    const result2 = rateLimit(key, 2, 1000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(0);
  });

  it('blocks requests exceeding limit', () => {
    rateLimit(key, 2, 1000);
    rateLimit(key, 2, 1000);
    
    const result = rateLimit(key, 2, 1000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it('sliding window expires entries and resets count', async () => {
    rateLimit(key, 1, 50);
    
    // Immediate block
    const block = rateLimit(key, 1, 50);
    expect(block.success).toBe(false);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 60));

    const pass = rateLimit(key, 1, 50);
    expect(pass.success).toBe(true);
  });
});
