import { getModelWithFallback } from '@/lib/agents/fallback-model';
import { streamText, convertToModelMessages } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import { secureRouteHandler } from '@/lib/security/secure-route';
import volunteersData from '@/data/volunteers.json';

export async function POST(req: Request) {
  return secureRouteHandler(req, async ({ messages, volunteerId, stadiumId, mode }) => {
    const sid = stadiumId || 'stad_nyc';
    const volunteer = volunteersData.find((v) => v.id === volunteerId) || volunteersData[0];

    let context = `
VOLUNTEER: ${JSON.stringify(volunteer)}
ALL VOLUNTEERS AT STADIUM: ${JSON.stringify(volunteersData.filter((v) => v.stadium_id === sid))}
`;

    if (mode === 'checkin') {
      context += '\nMODE: SENTIMENT PULSE — Analyze the volunteer check-in text for sentiment (Positive ✅, Neutral ➡️, Fatigue ⚠️, Negative 🔴). If fatigue/negative, flag for Command Center.';
    } else if (mode === 'handoff') {
      context += '\nMODE: SHIFT HANDOFF — Take the free-text notes and structure them into clean bullets: Key Events, Ongoing Issues, Fan Feedback, Equipment Status, Notes for Next Shift.';
    } else {
      context += '\nMODE: GENERAL — Answer volunteer procedure questions with concise, actionable guidance.';
    }

    const systemPrompt = getSystemPrompt('volunteeros', context);

    const result = streamText({
      model: getModelWithFallback(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
}
