import { describe, it, expect } from 'vitest';
import { getSystemPrompt } from '../agents/system-prompts';
import { AGENTS } from '../agents/types';

describe('getSystemPrompt', () => {
  const agentIds = Object.keys(AGENTS) as Array<keyof typeof AGENTS>;

  it('returns a non-empty string prompt for all defined agents', () => {
    for (const agentId of agentIds) {
      const prompt = getSystemPrompt(agentId);
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    }
  });

  it('contains the agent model tag in the prompt text', () => {
    for (const agentId of agentIds) {
      const agent = AGENTS[agentId];
      const prompt = getSystemPrompt(agentId);
      expect(prompt).toContain(agent.modelTag);
    }
  });

  it('injects context data correctly when provided', () => {
    const customContext = 'STADIUM SECTOR D4 IS EXTREMELY BUSY';
    const prompt = getSystemPrompt('compass', customContext);
    expect(prompt).toContain(customContext);
  });

  it('uses default fallback text if no context is provided', () => {
    const prompt = getSystemPrompt('compass');
    expect(prompt).toContain('No additional context provided.');
  });

  it('adds FIFA World Cup 2026 problem alignment to every agent prompt', () => {
    for (const agentId of agentIds) {
      const prompt = getSystemPrompt(agentId);
      expect(prompt).toContain('FIFA WORLD CUP 2026 ALIGNMENT');
      expect(prompt).toContain('navigation');
      expect(prompt).toContain('crowd management');
      expect(prompt).toContain('accessibility');
      expect(prompt).toContain('transportation');
      expect(prompt).toContain('sustainability');
      expect(prompt).toContain('real-time decision support');
    }
  });

  it('requires English, Spanish, and French response matching', () => {
    const prompt = getSystemPrompt('volunteeros');
    expect(prompt).toContain('MULTILINGUAL ASSISTANCE');
    expect(prompt).toContain('English, Spanish, or French');
    expect(prompt).toContain('Respond in the same language');
  });
});
