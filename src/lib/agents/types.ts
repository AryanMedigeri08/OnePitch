export type AgentId =
  | 'compass'
  | 'sentinel'
  | 'accessall'
  | 'transitflow'
  | 'greengoal'
  | 'volunteeros';

export interface AgentMeta {
  id: AgentId;
  name: string;
  tagline: string;
  modelTag: string;
  icon: string;
  color: string;
  description: string;
}

export const AGENTS: Record<AgentId, AgentMeta> = {
  compass: {
    id: 'compass',
    name: 'Compass',
    tagline: 'Navigation & Wayfinding',
    modelTag: 'Compass-Nav-Edge',
    icon: 'NAV',
    color: '#00E676',
    description: 'Real-time navigation and wayfinding through the stadium',
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    tagline: 'Crowd Management & Decision Support',
    modelTag: 'Sentinel-Vision-Edge',
    icon: 'CMD',
    color: '#FF6D00',
    description: 'AI-powered crowd management and command center intelligence',
  },
  accessall: {
    id: 'accessall',
    name: 'AccessAll',
    tagline: 'Accessibility Concierge',
    modelTag: 'AccessAll-Care-1',
    icon: 'ACC',
    color: '#448AFF',
    description: 'Personalized accessibility support and volunteer matching',
  },
  transitflow: {
    id: 'transitflow',
    name: 'TransitFlow',
    tagline: 'Transit & Itinerary Planning',
    modelTag: 'TransitFlow-Route-2',
    icon: 'TRN',
    color: '#7C4DFF',
    description: 'Multi-modal transit planning and cross-border guidance',
  },
  greengoal: {
    id: 'greengoal',
    name: 'GreenGoal',
    tagline: 'Sustainability Intelligence',
    modelTag: 'GreenGoal-Eco-1',
    icon: 'ECO',
    color: '#00C853',
    description: 'Waste classification, carbon copilot, and ESG reporting',
  },
  volunteeros: {
    id: 'volunteeros',
    name: 'VolunteerOS',
    tagline: 'Volunteer Force Multiplier',
    modelTag: 'VolunteerOS-Sync-1',
    icon: 'VOL',
    color: '#FF4081',
    description: 'Shift management, sentiment monitoring, and handoff tools',
  },
};

export interface CascadeEvent {
  id: string;
  agentId: AgentId;
  agentName: string;
  agentIcon: string;
  agentColor: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'alert' | 'action' | 'info' | 'resolution';
}

export type ScenarioType = 'thunderstorm' | 'medical' | 'vip';

export interface ScenarioMeta {
  type: ScenarioType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const SCENARIOS: Record<ScenarioType, ScenarioMeta> = {
  thunderstorm: {
    type: 'thunderstorm',
    name: 'Sudden Thunderstorm',
    description: 'Severe weather forces indoor rerouting across all systems',
    icon: 'WX',
    color: '#FFB300',
  },
  medical: {
    type: 'medical',
    name: 'Medical Emergency',
    description: 'Medical incident triggers corridor clearing and volunteer response',
    icon: 'MED',
    color: '#FF3D00',
  },
  vip: {
    type: 'vip',
    name: 'VIP Movement / Security Sweep',
    description: 'Security perimeter change with targeted fan rerouting',
    icon: 'SEC',
    color: '#7C4DFF',
  },
};

export type UserRole = 'fan' | 'volunteer' | 'command';

export interface AccessibilityNeed {
  id: string;
  label: string;
  icon: string;
}

export const ACCESSIBILITY_NEEDS: AccessibilityNeed[] = [
  { id: 'wheelchair', label: 'Wheelchair / Mobility', icon: 'WC' },
  { id: 'sensory', label: 'Sensory Sensitivity', icon: 'SEN' },
  { id: 'visual', label: 'Visual Impairment', icon: 'VIS' },
  { id: 'hearing', label: 'Hearing Impairment', icon: 'HEAR' },
  { id: 'medical', label: 'Medical Condition', icon: 'MED' },
];
