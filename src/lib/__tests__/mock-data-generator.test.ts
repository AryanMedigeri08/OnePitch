import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateGateDensities,
  generateSustainabilityReadings,
  closeGate,
  openGate,
  getClosedGates,
  addIncident,
  getIncidents,
  clearIncidents,
  updateIncidentStatus,
  appendToCascade,
  getStadiums,
  getStadium,
  getGatesForStadium,
} from '../mock-data-generator';

describe('generateGateDensities', () => {
  it('returns an array of gate densities', () => {
    const densities = generateGateDensities();
    expect(Array.isArray(densities)).toBe(true);
    expect(densities.length).toBeGreaterThan(0);
  });

  it('filters by stadium ID when provided', () => {
    const densities = generateGateDensities('stad_nyc');
    expect(densities.every((d) => d.stadium_id === 'stad_nyc')).toBe(true);
  });

  it('returns densities within valid ranges', () => {
    const densities = generateGateDensities('stad_nyc');
    for (const gate of densities) {
      expect(gate.density_pct).toBeGreaterThanOrEqual(0);
      expect(gate.density_pct).toBeLessThanOrEqual(100);
      expect(gate.current_density_ppl_m2).toBeGreaterThanOrEqual(0);
      expect(['rising', 'falling', 'stable']).toContain(gate.trend);
      expect(['open', 'closed']).toContain(gate.status);
    }
  });

  it('each gate has required properties', () => {
    const densities = generateGateDensities('stad_nyc');
    for (const gate of densities) {
      expect(gate).toHaveProperty('id');
      expect(gate).toHaveProperty('stadium_id');
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('status');
      expect(gate).toHaveProperty('capacity_per_min');
      expect(gate).toHaveProperty('density_pct');
      expect(gate).toHaveProperty('trend');
      expect(gate).toHaveProperty('position');
      expect(gate).toHaveProperty('accessible');
    }
  });
});

describe('generateSustainabilityReadings', () => {
  it('returns an array of sustainability readings', () => {
    const readings = generateSustainabilityReadings();
    expect(Array.isArray(readings)).toBe(true);
    expect(readings.length).toBeGreaterThan(0);
  });

  it('filters by stadium ID when provided', () => {
    const readings = generateSustainabilityReadings('stad_nyc');
    expect(readings.every((r) => r.stadium_id === 'stad_nyc')).toBe(true);
  });

  it('contains required properties with valid types', () => {
    const readings = generateSustainabilityReadings('stad_nyc');
    for (const reading of readings) {
      expect(reading).toHaveProperty('stadium_id');
      expect(reading).toHaveProperty('timestamp');
      expect(reading).toHaveProperty('energy_kwh');
      expect(reading).toHaveProperty('water_l');
      expect(reading).toHaveProperty('waste_kg');
      expect(reading).toHaveProperty('solar_generation_kwh');
      expect(reading).toHaveProperty('carbon_offset_kg');
      expect(typeof reading.energy_kwh).toBe('number');
      expect(typeof reading.water_l).toBe('number');
      expect(reading.waste_kg).toHaveProperty('compost');
      expect(reading.waste_kg).toHaveProperty('recycle');
      expect(reading.waste_kg).toHaveProperty('landfill');
    }
  });

  it('generates a valid ISO timestamp', () => {
    const readings = generateSustainabilityReadings('stad_nyc');
    for (const reading of readings) {
      expect(() => new Date(reading.timestamp)).not.toThrow();
      expect(new Date(reading.timestamp).toISOString()).toBe(reading.timestamp);
    }
  });
});

describe('gate management', () => {
  beforeEach(() => {
    // Reset state — open all gates
    for (const id of getClosedGates()) {
      openGate(id);
    }
  });

  it('closeGate marks a gate as closed', () => {
    closeGate('gate_1');
    expect(getClosedGates()).toContain('gate_1');
  });

  it('openGate removes a gate from closed list', () => {
    closeGate('gate_1');
    openGate('gate_1');
    expect(getClosedGates()).not.toContain('gate_1');
  });

  it('getClosedGates returns an array', () => {
    const closed = getClosedGates();
    expect(Array.isArray(closed)).toBe(true);
  });

  it('closed gate has density 0 in generation', () => {
    const gates = generateGateDensities('stad_nyc');
    if (gates.length > 0) {
      closeGate(gates[0].id);
      const updatedGates = generateGateDensities('stad_nyc');
      const closedGate = updatedGates.find((g) => g.id === gates[0].id);
      expect(closedGate?.status).toBe('closed');
      expect(closedGate?.current_density_ppl_m2).toBe(0);
    }
  });
});

describe('incident management', () => {
  beforeEach(() => {
    clearIncidents();
  });

  it('addIncident creates a new incident with an ID', () => {
    const incident = addIncident({
      type: 'weather',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'Test incident',
      cascade: [],
    });
    expect(incident).toHaveProperty('id');
    expect(incident.id).toBeTruthy();
    expect(incident.type).toBe('weather');
  });

  it('getIncidents returns added incidents', () => {
    addIncident({
      type: 'medical',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'Medical emergency',
      cascade: [],
    });
    const incidents = getIncidents();
    expect(incidents.length).toBe(1);
    expect(incidents[0].type).toBe('medical');
  });

  it('clearIncidents removes all incidents', () => {
    addIncident({
      type: 'security',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'Security sweep',
      cascade: [],
    });
    clearIncidents();
    expect(getIncidents().length).toBe(0);
  });

  it('updateIncidentStatus changes the status', () => {
    const incident = addIncident({
      type: 'crowd',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'Crowd surge',
      cascade: [],
    });
    updateIncidentStatus(incident.id, 'resolved');
    const updated = getIncidents().find((i) => i.id === incident.id);
    expect(updated?.status).toBe('resolved');
  });

  it('appendToCascade adds an event to the cascade log', () => {
    const incident = addIncident({
      type: 'weather',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'Storm',
      cascade: [],
    });
    appendToCascade(incident.id, 'Gate A closed');
    appendToCascade(incident.id, 'Fans rerouted');
    const updated = getIncidents().find((i) => i.id === incident.id);
    expect(updated?.cascade).toEqual(['Gate A closed', 'Fans rerouted']);
  });

  it('newest incident appears first (unshift)', () => {
    addIncident({
      type: 'weather',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'First',
      cascade: [],
    });
    addIncident({
      type: 'medical',
      location: 'stad_nyc',
      timestamp: new Date().toISOString(),
      status: 'active',
      triggering_agent: 'test',
      description: 'Second',
      cascade: [],
    });
    const incidents = getIncidents();
    expect(incidents[0].description).toBe('Second');
    expect(incidents[1].description).toBe('First');
  });
});

describe('stadium data accessors', () => {
  it('getStadiums returns an array of stadiums', () => {
    const stadiums = getStadiums();
    expect(Array.isArray(stadiums)).toBe(true);
    expect(stadiums.length).toBeGreaterThan(0);
  });

  it('getStadium returns a stadium by ID', () => {
    const stadium = getStadium('stad_nyc');
    expect(stadium).toBeDefined();
    expect(stadium?.id).toBe('stad_nyc');
  });

  it('getStadium returns undefined for invalid ID', () => {
    const stadium = getStadium('nonexistent');
    expect(stadium).toBeUndefined();
  });

  it('getGatesForStadium returns gates for a stadium', () => {
    const gates = getGatesForStadium('stad_nyc');
    expect(Array.isArray(gates)).toBe(true);
    expect(gates.every((g) => g.stadium_id === 'stad_nyc')).toBe(true);
  });
});
