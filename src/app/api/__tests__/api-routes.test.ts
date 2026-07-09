import { describe, it, expect, vi } from 'vitest';
import { GET as getDensity } from '../sentinel/density/route';
import { POST as triggerScenario } from '../scenario/trigger/route';

describe('Sentinel Density API Route', () => {
  it('successfully returns gate densities in JSON format', async () => {
    const request = new Request('http://localhost/api/sentinel/density?stadiumId=stad_nyc');
    const response = await getDensity(request);
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('densities');
    expect(body).toHaveProperty('timestamp');
    expect(Array.isArray(body.densities)).toBe(true);
    expect(body.densities.length).toBeGreaterThan(0);
    expect(body.densities[0].stadium_id).toBe('stad_nyc');
  });

  it('gracefully handles missing or blank stadiumId', async () => {
    const request = new Request('http://localhost/api/sentinel/density');
    const response = await getDensity(request);
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.densities.length).toBeGreaterThan(0);
  });
});

describe('Scenario Trigger API Route', () => {
  it('returns 400 Bad Request if scenario is invalid', async () => {
    const request = new Request('http://localhost/api/scenario/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'invalid-scenario-name' }),
    });

    const response = await triggerScenario(request);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('errors');
    expect(Array.isArray(body.errors)).toBe(true);
  });

  it('triggers a valid scenario and starts SSE stream', async () => {
    const request = new Request('http://localhost/api/scenario/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'medical' }),
    });

    const response = await triggerScenario(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
    
    // Read the stream
    const reader = response.body?.getReader();
    expect(reader).toBeDefined();
    
    const decoder = new TextDecoder();
    let result = '';
    
    if (reader) {
      const { done, value } = await reader.read();
      expect(done).toBe(false);
      result = decoder.decode(value);
      expect(result).toContain('data:');
      expect(result).toContain('agentId');
      
      // Cancel reader to prevent infinite waiting/timing out in test runner
      await reader.cancel();
    }
  });
});
