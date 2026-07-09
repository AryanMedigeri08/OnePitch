import { NextResponse } from 'next/server';
import { closeGate, openGate, getClosedGates } from '@/lib/mock-data-generator';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateRerouteRequest } from '@/lib/security/input-validator';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = rateLimit(`${ip}:gate-reroute`, 10);
    
    if (!limitRes.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limitRes.limit),
            'X-RateLimit-Remaining': String(limitRes.remaining),
            'X-RateLimit-Reset': String(limitRes.reset),
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    // 2. Input Validation
    const body = await req.json();
    const valRes = validateRerouteRequest(body);
    if (!valRes.success || !valRes.data) {
      return NextResponse.json(
        { errors: valRes.errors },
        { 
          status: 400, 
          headers: { 
            'X-Content-Type-Options': 'nosniff',
          } 
        }
      );
    }

    const { gateId, action } = valRes.data;

    if (action === 'close') {
      closeGate(gateId);
    } else if (action === 'open') {
      openGate(gateId);
    }

    return NextResponse.json(
      {
        success: true,
        closedGates: getClosedGates(),
        message: `Gate ${gateId} ${action === 'close' ? 'closed' : 'opened'} successfully.`,
      },
      {
        headers: {
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to process reroute' },
      { 
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}
