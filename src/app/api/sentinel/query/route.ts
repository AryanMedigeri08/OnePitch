import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import { generateGateDensities, getIncidents } from '@/lib/mock-data-generator';

export async function POST(req: Request) {
  try {
    const { messages, stadiumId } = await req.json();
    const sid = stadiumId || 'stad_nyc';
    const densities = generateGateDensities(sid);
    const incidents = getIncidents();

    const context = `
CURRENT GATE DENSITIES:
${densities.map((g) => `  ${g.name}: ${g.density_pct}% (${g.current_density_ppl_m2} ppl/m²) — Status: ${g.status}, Trend: ${g.trend}`).join('\n')}

ACTIVE INCIDENTS: ${incidents.length > 0 ? JSON.stringify(incidents.slice(0, 5)) : 'None'}

DENSITY THRESHOLDS: Green (<50%), Yellow (50-70%), Orange (70-85%), Red (>85%)
`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const systemPrompt = getSystemPrompt('sentinel', context);

    const result = streamText({
      model: google(model),
      system: systemPrompt,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Sentinel query error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process query' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
