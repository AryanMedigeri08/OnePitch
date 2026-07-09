import { describe, it, expect } from 'vitest';
import { getCascadeEvents } from '../agents/orchestrator';
import type { ScenarioType } from '../agents/types';

describe('getCascadeEvents', () => {
  const scenarios: ScenarioType[] = ['thunderstorm', 'medical', 'vip'];

  for (const scenario of scenarios) {
    describe(`scenario: ${scenario}`, () => {
      it('returns an array of cascade events', () => {
        const events = getCascadeEvents(scenario);
        expect(Array.isArray(events)).toBe(true);
        expect(events.length).toBeGreaterThan(0);
      });

      it('each event has required properties', () => {
        const events = getCascadeEvents(scenario);
        for (const { event, delayMs } of events) {
          expect(typeof delayMs).toBe('number');
          expect(delayMs).toBeGreaterThanOrEqual(0);
          expect(event).toHaveProperty('id');
          expect(event).toHaveProperty('agentId');
          expect(event).toHaveProperty('agentName');
          expect(event).toHaveProperty('agentIcon');
          expect(event).toHaveProperty('agentColor');
          expect(event).toHaveProperty('timestamp');
          expect(event).toHaveProperty('title');
          expect(event).toHaveProperty('message');
          expect(event).toHaveProperty('type');
        }
      });

      it('events have valid types', () => {
        const events = getCascadeEvents(scenario);
        const validTypes = ['alert', 'action', 'info', 'resolution'];
        for (const { event } of events) {
          expect(validTypes).toContain(event.type);
        }
      });

      it('first event has delayMs of 0', () => {
        const events = getCascadeEvents(scenario);
        expect(events[0].delayMs).toBe(0);
      });

      it('events are ordered by increasing delay', () => {
        const events = getCascadeEvents(scenario);
        for (let i = 1; i < events.length; i++) {
          expect(events[i].delayMs).toBeGreaterThanOrEqual(events[i - 1].delayMs);
        }
      });

      it('event IDs are unique', () => {
        const events = getCascadeEvents(scenario);
        const ids = events.map(({ event }) => event.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('timestamps are valid ISO strings', () => {
        const events = getCascadeEvents(scenario);
        for (const { event } of events) {
          expect(() => new Date(event.timestamp)).not.toThrow();
          const d = new Date(event.timestamp);
          expect(d.getFullYear()).toBeGreaterThanOrEqual(2026);
        }
      });
    });
  }

  it('thunderstorm cascade involves at least 5 agents', () => {
    const events = getCascadeEvents('thunderstorm');
    const agents = new Set(events.map(({ event }) => event.agentId));
    expect(agents.size).toBeGreaterThanOrEqual(4);
  });

  it('medical cascade first event is from sentinel', () => {
    const events = getCascadeEvents('medical');
    expect(events[0].event.agentId).toBe('sentinel');
  });

  it('vip cascade includes compass rerouting', () => {
    const events = getCascadeEvents('vip');
    const compassEvents = events.filter(({ event }) => event.agentId === 'compass');
    expect(compassEvents.length).toBeGreaterThanOrEqual(1);
  });
});
