import { google } from '@ai-sdk/google';
import { streamText, generateText, convertToModelMessages } from 'ai';
import { getSystemPrompt } from '@/lib/agents/system-prompts';
import { generateSustainabilityReadings } from '@/lib/mock-data-generator';

export async function POST(req: Request) {
  try {
    const { messages, stadiumId, mode, image } = await req.json();
    const sid = stadiumId || 'stad_nyc';
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    // Waste scanner mode — uses vision
    if (mode === 'scan' && image) {
      const systemPrompt = getSystemPrompt('greengoal',
        'MODE: WASTE SCANNER — Classify the uploaded image as COMPOST 🟤, RECYCLE ♻️, or LANDFILL ⬛. Explain why in one sentence. Award GreenPoints (Compost=10, Recycle=8, Landfill=2). Be encouraging.'
      );

      const result = await generateText({
        model: google(model),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please classify this waste item:' },
              { type: 'image', image: image },
            ],
          },
        ],
      });

      return new Response(
        JSON.stringify({ classification: result.text }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Carbon copilot or general chat
    const sustainability = generateSustainabilityReadings(sid);
    let context = `
SUSTAINABILITY DATA: ${JSON.stringify(sustainability)}
`;

    if (mode === 'carbon') {
      context += '\nMODE: CARBON COPILOT — Provide 3-5 concrete energy/water/waste reduction recommendations based on the sustainability data.';
    } else if (mode === 'esg') {
      context += '\nMODE: ESG REPORT — Compile the sustainability data into a structured ESG summary report with sections for Energy, Water, Waste Diversion, Carbon Offsets, and Solar Generation.';
    }

    const systemPrompt = getSystemPrompt('greengoal', context);

    const result = streamText({
      model: google(model),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('GreenGoal error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
