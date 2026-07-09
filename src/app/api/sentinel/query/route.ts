import { getModelWithFallback } from '@/lib/agents/fallback-model';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import { generateGateDensities, getIncidents } from '@/lib/mock-data-generator';
import { secureRouteHandler } from '@/lib/security/secure-route';

export async function POST(req: Request) {
  return secureRouteHandler(req, async ({ messages, stadiumId }) => {
    const sid = stadiumId || 'stad_nyc';
    const densities = generateGateDensities(sid);
    const incidents = getIncidents();

    const context = `
CURRENT GATE DENSITIES:
${densities.map((g) => `  ${g.name}: ${g.density_pct}% (${g.current_density_ppl_m2} ppl/m2) - Status: ${g.status}, Trend: ${g.trend}`).join('\n')}

ACTIVE INCIDENTS: ${incidents.length > 0 ? JSON.stringify(incidents.slice(0, 5)) : 'None'}

DENSITY THRESHOLDS: Green (<50%), Yellow (50-70%), Orange (70-85%), Red (>85%)
`;

    const systemPrompt = getSystemPrompt('sentinel', context);

    const result = streamText({
      model: getModelWithFallback(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
}
