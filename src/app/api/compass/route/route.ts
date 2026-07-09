import { getModelWithFallback } from '@/lib/agents/fallback-model';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import type { AgentId } from '@/lib/agents/types';
import { generateGateDensities, getClosedGates } from '@/lib/mock-data-generator';
import { secureRouteHandler } from '@/lib/security/secure-route';
import gatesData from '@/data/gates.json';
import sectorsData from '@/data/sectors.json';
import fansData from '@/data/fans.json';

export async function POST(req: Request) {
  return secureRouteHandler(req, async ({ messages, fanId, stadiumId }) => {
    const sid = stadiumId || 'stad_nyc';
    const fan = fansData.find((f) => f.id === fanId) || fansData[0];
    const gates = gatesData.filter((g) => g.stadium_id === sid);
    const sectors = sectorsData.filter((s) => s.stadium_id === sid);
    const closedGates = getClosedGates();

    const context = `
STADIUM: ${sid}
FAN: ${JSON.stringify(fan)}
GATES: ${JSON.stringify(gates.map((g) => ({ id: g.id, name: g.name, status: closedGates.includes(g.id) ? 'CLOSED' : 'open', connected_sectors: g.connected_sectors, accessible: g.accessible, position: g.position })))}
SECTORS: ${JSON.stringify(sectors)}
CLOSED GATES: ${closedGates.length > 0 ? closedGates.join(', ') : 'None'}
`;

    const systemPrompt = getSystemPrompt('compass' as AgentId, context);

    const result = streamText({
      model: getModelWithFallback(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
}
