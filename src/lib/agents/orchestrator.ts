import { AGENTS, type AgentId, type CascadeEvent, type ScenarioType } from './types';

const SCENARIO_CASCADES: Record<ScenarioType, Array<{
  agentId: AgentId;
  delayMs: number;
  title: string;
  messageTemplate: string;
  type: CascadeEvent['type'];
}>> = {
  thunderstorm: [
    {
      agentId: 'sentinel',
      delayMs: 0,
      title: 'Weather Alert Received',
      messageTemplate: 'SEVERE WEATHER WARNING: Thunderstorm approaching MetLife Stadium. Lightning detected within 8km radius. Initiating weather protocol.',
      type: 'alert',
    },
    {
      agentId: 'sentinel',
      delayMs: 2000,
      title: 'Queue Rerouting - Indoor Channels',
      messageTemplate: 'DISPATCH: All gate marshals - redirect outdoor queues to covered concourse areas. Gate B1 outdoor queue to Tunnel 3. Gate A1 queue to North Concourse.',
      type: 'action',
    },
    {
      agentId: 'transitflow',
      delayMs: 4000,
      title: 'Departure Schedule Adjusted',
      messageTemplate: 'Post-match departures delayed 20 minutes pending weather clearance. Shuttle services paused. Rail departures from Secaucus Junction holding at platform. Fans advised to remain in covered areas.',
      type: 'action',
    },
    {
      agentId: 'accessall',
      delayMs: 6000,
      title: 'Accessible Routes Prioritized',
      messageTemplate: 'All step-free routes verified for covered alternatives. Wheelchair users in Section 200 redirected to South Concourse covered exit via Ramp C. Sensory rooms remain available at Level 2.',
      type: 'action',
    },
    {
      agentId: 'greengoal',
      delayMs: 8000,
      title: 'Energy Optimization - Empty Zones',
      messageTemplate: 'HVAC reduced in evacuated outdoor hospitality zones (Zones 4, 7, 9) - estimated savings: 45 kWh/hr. Lighting maintained for safety in transition corridors. Solar panels secured.',
      type: 'info',
    },
    {
      agentId: 'compass',
      delayMs: 10000,
      title: 'Fan-Facing Weather Alert Pushed',
      messageTemplate: 'ATTENTION FANS: Due to approaching thunderstorm, please move to the nearest covered area. Follow the orange signs to covered concourses. Your seat location will be held. Estimated delay: 20 minutes.',
      type: 'action',
    },
  ],

  medical: [
    {
      agentId: 'sentinel',
      delayMs: 0,
      title: 'Medical Incident Logged',
      messageTemplate: 'MEDICAL ALERT: Incident reported in Section 105, Row 12. Type: Unresponsive fan. Medical team dispatched. Logging incident #MED-2026-0708.',
      type: 'alert',
    },
    {
      agentId: 'sentinel',
      delayMs: 2000,
      title: 'Corridor Cleared for Medical Access',
      messageTemplate: 'DISPATCH: Clear Corridor 3 between Section 105 and Medical Bay North. Stewards in Sections 105-110 create 3-meter buffer zone. Restrict fan movement in adjacent aisles.',
      type: 'action',
    },
    {
      agentId: 'compass',
      delayMs: 4000,
      title: 'Fastest Medical Route Calculated',
      messageTemplate: 'ROUTE: Section 105 -> Aisle 12 -> Corridor 3 (CLEARED) -> Medical Bay North. Distance: 120m. Estimated transit time: 2 minutes with stretcher. Elevator B reserved.',
      type: 'action',
    },
    {
      agentId: 'volunteeros',
      delayMs: 6000,
      title: 'Trained Volunteers Alerted',
      messageTemplate: 'VOLUNTEER ALERT: CPR/First-Aid trained volunteers dispatched. Alex Rivera (Section 100, 45m away, ETA: 90s) and Priya Patel (Section 200, Medical Response, ETA: 3 min) en route.',
      type: 'action',
    },
    {
      agentId: 'sentinel',
      delayMs: 9000,
      title: 'Incident Report Auto-Generated',
      messageTemplate: 'INCIDENT REPORT #MED-2026-0708:\n- Location: Section 105, Row 12\n- Time: 19:05 UTC\n- Type: Medical - Unresponsive Fan\n- Response: Medical team + 2 volunteers dispatched\n- Corridor 3 cleared\n- Status: ACTIVE - awaiting medical team assessment',
      type: 'resolution',
    },
  ],

  vip: [
    {
      agentId: 'sentinel',
      delayMs: 0,
      title: 'Security Protocol Initiated',
      messageTemplate: 'SECURITY SWEEP: VIP movement through Section 300 corridor. Security perimeter established. Affects: Sections 300, 205 corridor only. NOT a full-stadium alert.',
      type: 'alert',
    },
    {
      agentId: 'compass',
      delayMs: 2500,
      title: 'Targeted Fan Rerouting',
      messageTemplate: 'REROUTE (Sections 300 & 205 ONLY): Fans in affected sections - please use alternate corridor via West Concourse. Section 300 fans exit via Gate C1 instead of usual Corridor 5. This does NOT affect other sections.',
      type: 'action',
    },
    {
      agentId: 'transitflow',
      delayMs: 5000,
      title: 'Perimeter Traffic Adjusted',
      messageTemplate: 'West parking lot access point temporarily restricted (15 min). Shuttle pickup relocated from Stop W1 to Stop W3 (200m south). Alternative: North exit via Gate A1 unaffected.',
      type: 'action',
    },
    {
      agentId: 'compass',
      delayMs: 7500,
      title: 'Fan Notification - Targeted',
      messageTemplate: 'NOTICE (Sections 300 & 205 only): A temporary security measure requires a brief detour. Please follow staff directions to the West Concourse. All other sections are unaffected. Thank you for your patience.',
      type: 'info',
    },
  ],
};

let cascadeEventId = 0;

export function getCascadeEvents(scenario: ScenarioType): Array<{
  event: CascadeEvent;
  delayMs: number;
}> {
  const cascade = SCENARIO_CASCADES[scenario];
  const now = new Date();

  return cascade.map((step) => {
    cascadeEventId++;
    const eventTime = new Date(now.getTime() + step.delayMs);
    const agent = AGENTS[step.agentId];

    return {
      delayMs: step.delayMs,
      event: {
        id: `cascade_${cascadeEventId}`,
        agentId: step.agentId,
        agentName: agent.name,
        agentIcon: agent.icon,
        agentColor: agent.color,
        timestamp: eventTime.toISOString(),
        title: step.title,
        message: step.messageTemplate,
        type: step.type,
      },
    };
  });
}
