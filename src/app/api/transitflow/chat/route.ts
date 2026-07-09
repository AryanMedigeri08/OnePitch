import { getModelWithFallback } from '@/lib/agents/fallback-model';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import { secureRouteHandler } from '@/lib/security/secure-route';
import transitHubsData from '@/data/transit_hubs.json';
import stadiumsData from '@/data/stadiums.json';

export async function POST(req: Request) {
  return secureRouteHandler(req, async ({ messages, stadiumId, origin, kickoffTime, needs, mode }) => {
    const sid = stadiumId || 'stad_nyc';

    const stadium = stadiumsData.find((s) => s.id === sid);
    const hubs = transitHubsData.filter((h) => h.stadium_id === sid);

    let context = `
STADIUM: ${JSON.stringify(stadium)}
TRANSIT HUBS:
${hubs.map((h) => `  ${h.name} (${h.type}) — Lines: ${h.lines.join(', ')} — Next departures: ${h.next_departures.join(', ')} — Walk to stadium: ${h.accessible ? h.walk_to_stadium_min : h.walk_to_stadium_min + 5} min — Accessible: ${h.accessible}`).join('\n')}
`;

    if (mode === 'crossborder') {
      context += `\nMODE: CROSS-BORDER CHECKLIST — Generate an illustrative checklist. ALWAYS include this prominent disclaimer: "⚠️ Demo content — not real travel/immigration advice."`;
    } else {
      context += `\nMODE: ITINERARY PLANNING
ORIGIN: ${origin || 'Hotel in city center'}
KICKOFF TIME: ${kickoffTime || '19:00'}
ACCESSIBILITY NEEDS: ${JSON.stringify(needs || [])}
INSTRUCTIONS: Build a multi-leg itinerary (Walk → Transit → Shuttle → Gate). Show PRIMARY route + FALLBACK. Recommend arriving 90 min before kickoff.`;
    }

    const systemPrompt = getSystemPrompt('transitflow', context);

    const result = streamText({
      model: getModelWithFallback(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
}
