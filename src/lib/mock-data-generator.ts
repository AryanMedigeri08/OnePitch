import stadiumsData from '@/data/stadiums.json';
import gatesData from '@/data/gates.json';
import sustainabilityData from '@/data/sustainability_meters.json';

export interface GateDensity {
  id: string;
  stadium_id: string;
  name: string;
  status: 'open' | 'closed';
  capacity_per_min: number;
  current_density_ppl_m2: number;
  density_pct: number;
  trend: 'rising' | 'falling' | 'stable';
  position: { x: number; y: number };
  accessible: boolean;
}

export interface SustainabilityReading {
  stadium_id: string;
  timestamp: string;
  energy_kwh: number;
  water_l: number;
  waste_kg: { compost: number; recycle: number; landfill: number };
  solar_generation_kwh: number;
  carbon_offset_kg: number;
}

export interface Incident {
  id: string;
  type: 'weather' | 'medical' | 'security' | 'crowd' | 'infrastructure';
  location: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'monitoring';
  triggering_agent: string;
  description: string;
  cascade: string[];
}

// In-memory state
let incidentLog: Incident[] = [];
let closedGates: Set<string> = new Set();

// Generate a random float in range
function randFloat(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

// Generate realistic gate density that fluctuates around the base value
export function generateGateDensities(stadiumId?: string): GateDensity[] {
  const gates = stadiumId
    ? gatesData.filter((g) => g.stadium_id === stadiumId)
    : gatesData;

  return gates.map((gate) => {
    const isClosed = closedGates.has(gate.id);
    const baseDensity = gate.current_density_ppl_m2;
    // Add ±0.5 fluctuation
    const currentDensity = isClosed
      ? 0
      : Math.max(0.1, randFloat(baseDensity - 0.5, baseDensity + 0.8));
    const maxDensity = 4.5; // people per m2 — danger threshold
    const densityPct = Math.min(100, Math.round((currentDensity / maxDensity) * 100));

    // Determine trend
    const trendRoll = Math.random();
    const trend: 'rising' | 'falling' | 'stable' =
      trendRoll < 0.4 ? 'rising' : trendRoll < 0.7 ? 'stable' : 'falling';

    return {
      id: gate.id,
      stadium_id: gate.stadium_id,
      name: gate.name,
      status: isClosed ? ('closed' as const) : ('open' as const),
      capacity_per_min: gate.capacity_per_min,
      current_density_ppl_m2: currentDensity,
      density_pct: densityPct,
      trend,
      position: gate.position,
      accessible: gate.accessible,
    };
  });
}

// Generate sustainability readings that tick over time
export function generateSustainabilityReadings(
  stadiumId?: string
): SustainabilityReading[] {
  const baseData = stadiumId
    ? sustainabilityData.filter((s) => s.stadium_id === stadiumId)
    : sustainabilityData;

  return baseData.map((base) => ({
    stadium_id: base.stadium_id,
    timestamp: new Date().toISOString(),
    energy_kwh: Math.round(base.energy_kwh + randFloat(-20, 30)),
    water_l: Math.round(base.water_l + randFloat(-100, 150)),
    waste_kg: {
      compost: Math.round(base.waste_kg.compost + randFloat(-3, 5)),
      recycle: Math.round(base.waste_kg.recycle + randFloat(-5, 8)),
      landfill: Math.round(base.waste_kg.landfill + randFloat(-2, 4)),
    },
    solar_generation_kwh: Math.round(
      base.solar_generation_kwh + randFloat(-10, 15)
    ),
    carbon_offset_kg: Math.round(base.carbon_offset_kg + randFloat(-5, 10)),
  }));
}

// Gate management
export function closeGate(gateId: string): void {
  closedGates.add(gateId);
}

export function openGate(gateId: string): void {
  closedGates.delete(gateId);
}

export function getClosedGates(): string[] {
  return Array.from(closedGates);
}

// Incident management
export function addIncident(incident: Omit<Incident, 'id'>): Incident {
  const newIncident: Incident = {
    ...incident,
    id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
  };
  incidentLog.unshift(newIncident);
  return newIncident;
}

export function getIncidents(): Incident[] {
  return incidentLog;
}

export function updateIncidentStatus(
  incidentId: string,
  status: Incident['status']
): void {
  const incident = incidentLog.find((i) => i.id === incidentId);
  if (incident) {
    incident.status = status;
  }
}

export function appendToCascade(incidentId: string, event: string): void {
  const incident = incidentLog.find((i) => i.id === incidentId);
  if (incident) {
    incident.cascade.push(event);
  }
}

export function clearIncidents(): void {
  incidentLog = [];
}

// Get all stadiums
export function getStadiums() {
  return stadiumsData;
}

// Get stadium by ID
export function getStadium(id: string) {
  return stadiumsData.find((s) => s.id === id);
}

// Get gates for a stadium
export function getGatesForStadium(stadiumId: string) {
  return gatesData.filter((g) => g.stadium_id === stadiumId);
}
