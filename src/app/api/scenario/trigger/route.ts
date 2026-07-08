import { getCascadeEvents } from '@/lib/agents/orchestrator';
import { addIncident } from '@/lib/mock-data-generator';
import type { ScenarioType } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { scenario } = await req.json() as { scenario: ScenarioType };

    if (!['thunderstorm', 'medical', 'vip'].includes(scenario)) {
      return new Response(
        JSON.stringify({ error: 'Invalid scenario type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
