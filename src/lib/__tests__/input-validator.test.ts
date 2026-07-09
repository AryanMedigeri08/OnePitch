import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateChatRequest,
  validateScenarioRequest,
  validateRerouteRequest,
} from '../security/input-validator';

describe('sanitizeString', () => {
  it('strips html-like brackets to prevent XSS injection', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  it('caps string length to maxLength parameter', () => {
    const longString = 'a'.repeat(20);
    expect(sanitizeString(longString, 5)).toBe('aaaaa');
  });

  it('returns empty string for nullish values', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });
});

describe('validateChatRequest', () => {
  it('fails if body is empty or not an object', () => {
    const res = validateChatRequest(null);
    expect(res.success).toBe(false);
    expect(res.errors?.[0].message).toContain('JSON object');
  });

  it('fails if messages is missing or not an array', () => {
    const res = validateChatRequest({ fanId: '123' });
    expect(res.success).toBe(false);
    expect(res.errors?.[0].field).toBe('messages');
  });

  it('succeeds for valid payload and returns sanitized strings', () => {
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      fanId: '  fan-id-123  ',
      stadiumId: 'stad_nyc',
      mode: 'assist-now',
      needs: ['wheelchair', 'sensory'],
    };

    const res = validateChatRequest(payload);
    expect(res.success).toBe(true);
    expect(res.data?.fanId).toBe('fan-id-123'); // trimmed
    expect(res.data?.mode).toBe('assist-now');
    expect(res.data?.needs).toEqual(['wheelchair', 'sensory']);
  });

  it('accepts AI SDK text parts and sanitizes message text', () => {
    const payload = {
      messages: [
        {
          role: 'user',
          parts: [{ type: 'text', text: '<b>show crowded gates</b>' }],
        },
      ],
    };

    const res = validateChatRequest(payload);
    expect(res.success).toBe(true);
    expect(res.data?.messages[0].parts).toEqual([
      { type: 'text', text: '&lt;b&gt;show crowded gates&lt;/b&gt;' },
    ]);
  });

  it('validates message items role and parts', () => {
    const payload = {
      messages: [{ role: 'invalid-role', content: 'hello' }],
    };
    const res = validateChatRequest(payload);
    expect(res.success).toBe(false);
    expect(res.errors?.[0].field).toBe('messages[0].role');
  });
});

describe('validateScenarioRequest', () => {
  it('accepts valid scenarios', () => {
    expect(validateScenarioRequest({ scenario: 'medical' }).success).toBe(true);
    expect(validateScenarioRequest({ scenario: 'thunderstorm' }).success).toBe(true);
    expect(validateScenarioRequest({ scenario: 'vip' }).success).toBe(true);
  });

  it('fails for invalid scenario type', () => {
    const res = validateScenarioRequest({ scenario: 'hurricane' });
    expect(res.success).toBe(false);
    expect(res.errors?.[0].field).toBe('scenario');
  });
});

describe('validateRerouteRequest', () => {
  it('accepts valid reroutes', () => {
    const res = validateRerouteRequest({ gateId: 'gate_a', action: 'open' });
    expect(res.success).toBe(true);
    expect(res.data?.action).toBe('open');
  });

  it('rejects invalid action values', () => {
    const res = validateRerouteRequest({ gateId: 'gate_a', action: 'delete' });
    expect(res.success).toBe(false);
  });
});
