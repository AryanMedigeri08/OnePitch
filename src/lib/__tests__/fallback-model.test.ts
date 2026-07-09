import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fallbackModel, getModelWithFallback } from '../agents/fallback-model';
import type { LanguageModelV4, LanguageModelV4CallOptions } from '@ai-sdk/provider';

type RejectableMock = {
  mockRejectedValueOnce: (error: Error) => unknown;
};

const modelCallOptions = {} as LanguageModelV4CallOptions;

// Mock the AI SDK providers
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelName) => ({
    specificationVersion: 'v4',
    provider: 'google',
    modelId: modelName,
    supportedUrls: {},
    doGenerate: vi.fn(),
    doStream: vi.fn(),
  })),
}));

vi.mock('@ai-sdk/groq', () => ({
  groq: vi.fn((modelName) => ({
    specificationVersion: 'v4',
    provider: 'groq',
    modelId: modelName,
    supportedUrls: {},
    doGenerate: vi.fn(),
    doStream: vi.fn(),
  })),
}));

describe('fallbackModel wrapper', () => {
  let primaryMock: LanguageModelV4;
  let fallbackMock: LanguageModelV4;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };

    primaryMock = {
      specificationVersion: 'v4',
      provider: 'google',
      modelId: 'gemini-2.0-flash',
      supportedUrls: {},
      doGenerate: vi.fn().mockResolvedValue({ text: 'primary response' }),
      doStream: vi.fn().mockResolvedValue({ stream: 'primary stream' }),
    };

    fallbackMock = {
      specificationVersion: 'v4',
      provider: 'groq',
      modelId: 'llama-3.3-70b-versatile',
      supportedUrls: {},
      doGenerate: vi.fn().mockResolvedValue({ text: 'fallback response' }),
      doStream: vi.fn().mockResolvedValue({ stream: 'fallback stream' }),
    };
  });

  it('correctly maps metadata properties from primary model', () => {
    const wrapped = fallbackModel(primaryMock, fallbackMock);
    expect(wrapped.specificationVersion).toBe('v4');
    expect(wrapped.provider).toBe('google');
    expect(wrapped.modelId).toBe('gemini-2.0-flash');
    expect(wrapped.supportedUrls).toEqual({});
  });

  it('delegates to primary doGenerate if API key is present and call succeeds', async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'valid-key';
    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doGenerate(modelCallOptions);

    expect(primaryMock.doGenerate).toHaveBeenCalled();
    expect(fallbackMock.doGenerate).not.toHaveBeenCalled();
    expect(result).toEqual({ text: 'primary response' });
  });

  it('falls back to secondary doGenerate if primary doGenerate throws an error', async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'valid-key';
    (primaryMock.doGenerate as unknown as RejectableMock).mockRejectedValueOnce(new Error('Rate Limit'));

    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doGenerate(modelCallOptions);

    expect(primaryMock.doGenerate).toHaveBeenCalled();
    expect(fallbackMock.doGenerate).toHaveBeenCalled();
    expect(result).toEqual({ text: 'fallback response' });
  });

  it('throws error if primary fails and no fallback API key is present, but lets fallback throw if it fails too', async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'valid-key';
    (primaryMock.doGenerate as unknown as RejectableMock).mockRejectedValueOnce(new Error('Primary failed'));
    (fallbackMock.doGenerate as unknown as RejectableMock).mockRejectedValueOnce(new Error('Fallback failed'));

    const wrapped = fallbackModel(primaryMock, fallbackMock);
    await expect(wrapped.doGenerate(modelCallOptions)).rejects.toThrow('Fallback failed');
  });

  it('skips primary entirely and uses fallback doGenerate if primary API key is missing', async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doGenerate(modelCallOptions);

    expect(primaryMock.doGenerate).not.toHaveBeenCalled();
    expect(fallbackMock.doGenerate).toHaveBeenCalled();
    expect(result).toEqual({ text: 'fallback response' });
  });

  it('skips primary entirely if primary API key is placeholder value', async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'your_api_key_here';
    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doGenerate(modelCallOptions);

    expect(primaryMock.doGenerate).not.toHaveBeenCalled();
    expect(fallbackMock.doGenerate).toHaveBeenCalled();
    expect(result).toEqual({ text: 'fallback response' });
  });

  it('skips primary doStream if API key is missing', async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doStream(modelCallOptions);

    expect(primaryMock.doStream).not.toHaveBeenCalled();
    expect(fallbackMock.doStream).toHaveBeenCalled();
    expect(result).toEqual({ stream: 'fallback stream' });
  });

  it('delegates to primary doStream if key is present and stream succeeds', async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'valid-key';
    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doStream(modelCallOptions);

    expect(primaryMock.doStream).toHaveBeenCalled();
    expect(fallbackMock.doStream).not.toHaveBeenCalled();
    expect(result).toEqual({ stream: 'primary stream' });
  });

  it('falls back to secondary doStream if primary doStream fails', async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'valid-key';
    (primaryMock.doStream as unknown as RejectableMock).mockRejectedValueOnce(new Error('Primary stream failed'));

    const wrapped = fallbackModel(primaryMock, fallbackMock);
    const result = await wrapped.doStream(modelCallOptions);

    expect(primaryMock.doStream).toHaveBeenCalled();
    expect(fallbackMock.doStream).toHaveBeenCalled();
    expect(result).toEqual({ stream: 'fallback stream' });
  });
});

describe('getModelWithFallback utility wrapper', () => {
  it('returns a LanguageModelV4 compliant object', () => {
    const model = getModelWithFallback();
    expect(model).toBeDefined();
    expect(model.specificationVersion).toBe('v4');
    expect(model.provider).toBe('google');
  });
});
