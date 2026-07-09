import { getCascadeEvents } from '@/lib/agents/orchestrator';
import { addIncident } from '@/lib/mock-data-generator';
import type { ScenarioType } from '@/lib/agents/types';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateScenarioRequest } from '@/lib/security/input-validator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = rateLimit(`${ip}:scenario-trigger`, 5);
    
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

    // 2. Input Validation
    const body = await req.json();
    const valRes = validateScenarioRequest(body);
    if (!valRes.success || !valRes.data) {
      return new Response(
        JSON.stringify({ errors: valRes.errors }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
          } 
        }
      );
    }

    const { scenario } = valRes.data;

    // Log the incident
    addIncident({
      type: scenario === 'thunderstorm' ? 'weather' : scenario === 'medical' ? 'medical' : 'security',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'ScenarioSimulator',
      description: `Scenario triggered: ${scenario}`,
      cascade: [],
    });

    // Get cascade events with timing
    const cascadeEvents = getCascadeEvents(scenario);

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const { event, delayMs } of cascadeEvents) {
          // Wait for the delay
          await new Promise((resolve) => setTimeout(resolve, delayMs));

          // Send event as SSE
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }

        // Send completion event
        controller.enqueue(encoder.encode(`data: {"type":"complete"}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Scenario trigger error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to trigger scenario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
