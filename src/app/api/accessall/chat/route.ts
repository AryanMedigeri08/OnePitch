import { getModelWithFallback } from '@/lib/agents/fallback-model';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import fansData from '@/data/fans.json';
import volunteersData from '@/data/volunteers.json';
import sectorsData from '@/data/sectors.json';

export async function POST(req: Request) {
  try {
    const { messages, fanId, needs, stadiumId, mode } = await req.json();
    const sid = stadiumId || 'stad_nyc';

    const fan = fansData.find((f) => f.id === fanId) || fansData[0];
    const volunteers = volunteersData.filter((v) => v.stadium_id === sid);
    const sectors = sectorsData.filter((s) => s.stadium_id === sid);

    let context = `
FAN: ${JSON.stringify(fan)}
ACCESSIBILITY NEEDS: ${JSON.stringify(needs || fan.accessibility_needs)}
SECTORS: ${JSON.stringify(sectors)}
AVAILABLE VOLUNTEERS: ${JSON.stringify(volunteers.filter((v) => v.status === 'available'))}
`;

    if (mode === 'assist-now') {
      context += `\nMODE: ASSIST NOW — Find the nearest available volunteer who can help with: ${JSON.stringify(needs || fan.accessibility_needs)}. Provide their name, current post, ETA, and skills.`;
    } else if (mode === 'training') {
      context += `\nMODE: STAFF MICRO-TRAINING — Provide a concise, actionable training script.`;
    } else {
      context += `\nMODE: GENERATE MATCH-DAY PLAN — Create a personalized, detailed match-day accessibility plan.`;
    }

    const systemPrompt = getSystemPrompt('accessall', context);

    const result = streamText({
      model: getModelWithFallback(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AccessAll error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
