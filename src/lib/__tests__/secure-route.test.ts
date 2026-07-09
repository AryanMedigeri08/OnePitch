import { describe, it, expect, vi, beforeEach } from 'vitest';
import { secureRouteHandler } from '../security/secure-route';
import { resetRateLimit } from '../security/rate-limiter';

describe('secureRouteHandler wrapper', () => {
  const url = 'http://localhost/api/chat';
  
  beforeEach(() => {
    resetRateLimit('127.0.0.1:/api/chat');
  });

  it('runs successfully for valid JSON request payloads', async () => {
    const req = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    const mockCallback = vi.fn().mockResolvedValue(new Response('Success'));
    const response = await secureRouteHandler(req, mockCallback);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Success');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(mockCallback).toHaveBeenCalled();
  });

  it('returns 400 Bad Request for malformed JSON request bodies', async () => {
    const req = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ malformed json ',
    });

    const mockCallback = vi.fn();
    const response = await secureRouteHandler(req, mockCallback);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid JSON request payload');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('returns 400 Bad Request if validateChatRequest schema fails', async () => {
    const req = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fanId: 'no-messages-array' }),
    });

    const mockCallback = vi.fn();
    const response = await secureRouteHandler(req, mockCallback);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('errors');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('returns 429 Too Many Requests if rate limit is exceeded', async () => {
    const mockCallback = vi.fn().mockResolvedValue(new Response('Success'));

    // Send 20 requests to hit the limit
    for (let i = 0; i < 20; i++) {
      const req = new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });
      await secureRouteHandler(req, mockCallback);
    }

    // 21st request should be blocked
    const blockedReq = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });
    const response = await secureRouteHandler(blockedReq, mockCallback);

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toContain('Too many requests');
  });
});
