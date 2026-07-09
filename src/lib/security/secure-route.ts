import { NextResponse } from 'next/server';
import { rateLimit } from './rate-limiter';
import { validateChatRequest, sanitizeString } from './input-validator';

export interface SecureRouteContext {
  messages: any[];
  fanId?: string;
  volunteerId?: string;
  stadiumId?: string;
  mode?: string;
  needs?: string[];
  origin?: string;
  kickoffTime?: string;
  image?: string;
}

/**
 * Higher-order helper function to wrap next.js route handlers with security verification.
 * Checks rate limits, validates input body, and sanitizes strings.
 */
export async function secureRouteHandler(
  req: Request,
  handler: (context: SecureRouteContext) => Promise<Response>
): Promise<Response> {
  try {
    // 1. Rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const route = new URL(req.url).pathname;
    const limitRes = rateLimit(`${ip}:${route}`, 20); // 20 requests per minute limit

    if (!limitRes.success) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(limitRes.limit),
            'X-RateLimit-Remaining': String(limitRes.remaining),
            'X-RateLimit-Reset': String(limitRes.reset),
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    // 2. Body Validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request payload' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    const valRes = validateChatRequest(body);
    if (!valRes.success || !valRes.data) {
      return new Response(
        JSON.stringify({ errors: valRes.errors }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    // 3. Execution
    const response = await handler(valRes.data);
    
    // 4. Secure Headers Addition
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  } catch (error) {
    console.error('Secure route handler exception:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected security event occurred' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}
