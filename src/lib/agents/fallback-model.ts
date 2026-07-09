import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import type { LanguageModelV4 } from '@ai-sdk/provider';

/**
 * Creates a language model that attempts to use the primary model first,
 * and falls back to the secondary model if the primary fails.
 */
export function fallbackModel(
  primary: LanguageModelV4,
  fallback: LanguageModelV4
): LanguageModelV4 {
  return {
    specificationVersion: 'v4',
    get provider() {
      return primary.provider;
    },
    get modelId() {
      return primary.modelId;
    },
    get supportedUrls() {
      return primary.supportedUrls;
    },
    async doGenerate(options) {
      try {
        // Only try primary if key is not blank/placeholder
        if (
          primary.provider === 'google' &&
          (!process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'your_api_key_here' ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY.trim() === '')
        ) {
          throw new Error('Google Gemini API Key is not configured');
        }
        return await primary.doGenerate(options);
      } catch {
        return await fallback.doGenerate(options);
      }
    },
    async doStream(options) {
      try {
        // Only try primary if key is not blank/placeholder
        if (
          primary.provider === 'google' &&
          (!process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'your_api_key_here' ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY.trim() === '')
        ) {
          throw new Error('Google Gemini API Key is not configured');
        }
        return await primary.doStream(options);
      } catch {
        return await fallback.doStream(options);
      }
    },
  };
}

/**
 * Gets the operational model wrapped with a Groq fallback.
 */
export function getModelWithFallback(geminiModelName?: string) {
  const geminiModel = geminiModelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  return fallbackModel(
    google(geminiModel) as LanguageModelV4,
    groq(groqModel) as LanguageModelV4
  );
}
