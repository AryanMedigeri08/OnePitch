'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/navbar';
import { AgentChat } from '@/components/agent-chat';
import { StadiumMap } from '@/components/stadium-map';
import { CascadeTimeline } from '@/components/cascade-timeline';
import {
  Shield, Zap, Activity, FileText, CloudLightning, Ambulance, Lock,
  Loader2, RefreshCw, BarChart3
} from 'lucide-react';
import type { GateDensity } from '@/lib/mock-data-generator';
import type { CascadeEvent, ScenarioType } from '@/lib/agents/types';
import { SCENARIOS } from '@/lib/agents/types';
import { getDensityColor, getDensityLabel } from '@/lib/utils';

const SCENARIO_ICONS: Record<ScenarioType, React.ReactNode> = {
  thunderstorm: <CloudLightning size={16} />,
  medical: <Ambulance size={16} />,
  vip: <Lock size={16} />,
};

export default function CommandPage() {
  const t = useTranslations();
  const [gates, setGates] = useState<GateDensity[]>([]);
  const [cascadeEvents, setCascadeEvents] = useState<CascadeEvent[]>([]);
  const [runningScenario, setRunningScenario] = useState<ScenarioType | null>(null);
  const [activePanel, setActivePanel] = useState<'sentinel' | 'scenario' | 'esg'>('sentinel');

  // Fetch gate densities
  const fetchDensities = useCallback(async () => {
    try {
      const res = await fetch('/api/sentinel/density?stadiumId=stad_nyc');
      const data = await res.json();
      setGates(data.densities || []);
    } catch (err) {
      console.error('Failed to fetch densities:', err);
    }
  }, []);

  // Auto-refresh densities every 3s
  useEffect(() => {
    fetchDensities();
    const interval = setInterval(fetchDensities, 3000);
    return () => clearInterval(interval);
  }, [fetchDensities]);

  // Trigger scenario
  async function triggerScenario(scenario: ScenarioType) {
    if (runningScenario) return;
    setRunningScenario(scenario);
    setCascadeEvents([]);
    setActivePanel('scenario');

    try {
      const res = await fetch('/api/scenario/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'complete') {
                  setRunningScenario(null);
                } else {
                  setCascadeEvents((prev) => [...prev, data as CascadeEvent]);
                }
              } catch { /* skip invalid JSON */ }
            }
          }
        }
      }
    } catch (err) {
      console.error('Scenario error:', err);
      setRunningScenario(null);
    }
  }

  // Handle gate toggle
  async function handleGateClick(gateId: string) {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return;

    const action = gate.status === 'closed' ? 'open' : 'close';
    await fetch('/api/compass/reroute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateId, action }),
    });
    fetchDensities();
  }

  return (
    <div data-theme="dark">
      <Navbar />
      <main className="flex-1 bg-brand-navy min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-amber/10 flex items-center justify-center">
                <Shield size={20} className="text-brand-amber" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{t('common.commandCenter')}</h1>
                <p className="text-xs text-gray-500">MetLife Stadium — Live Operations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
              <button
                onClick={fetchDensities}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Stadium Map + Gate Stats */}
            <div className="lg:col-span-1 space-y-4">
              {/* Stadium Map */}
              <div className="bg-brand-navy-light rounded-xl border border-brand-navy-mid p-4">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Activity size={14} className="text-brand-green" />
                  {t('sentinel.heatmap')}
                </h2>
                <StadiumMap
                  gates={gates}
                  onGateClick={handleGateClick}
                  isDark
                />
                <p className="text-[10px] text-gray-600 mt-2 text-center">Click a gate to toggle open/closed</p>
              </div>

              {/* Gate Density List */}
              <div className="bg-brand-navy-light rounded-xl border border-brand-navy-mid p-4">
                <h2 className="text-sm font-semibold text-white mb-3">{t('sentinel.density')}</h2>
                <div className="space-y-2">
                  {gates
                    .filter((g) => g.stadium_id === 'stad_nyc')
                    .map((gate) => (
                      <div
                        key={gate.id}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/3 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: getDensityColor(gate.density_pct) }}
                          />
                          <span className="text-xs text-gray-300">{gate.name.split('—')[0].trim()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-mono font-medium"
                            style={{ color: getDensityColor(gate.density_pct) }}
                          >
                            {gate.status === 'closed' ? 'CLOSED' : `${gate.density_pct}%`}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {gate.trend === 'rising' ? '↑' : gate.trend === 'falling' ? '↓' : '→'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right: Panel Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Panel Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActivePanel('sentinel')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activePanel === 'sentinel'
                      ? 'bg-brand-amber/15 text-brand-amber border border-brand-amber/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Shield size={14} />
                  Sentinel NLQ
                </button>
                <button
                  onClick={() => setActivePanel('scenario')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activePanel === 'scenario'
                      ? 'bg-brand-crimson/15 text-brand-crimson border border-brand-crimson/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Zap size={14} />
                  {t('scenario.title')}
                  {runningScenario && (
                    <Loader2 size={12} className="animate-spin ml-1" />
                  )}
                </button>
                <button
                  onClick={() => setActivePanel('esg')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activePanel === 'esg'
                      ? 'bg-brand-green/15 text-brand-green border border-brand-green/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <BarChart3 size={14} />
                  ESG
                </button>
              </div>

              {/* Sentinel Panel */}
              {activePanel === 'sentinel' && (
                <div className="animate-fade-in">
                  <AgentChat
                    agentId="sentinel"
                    apiEndpoint="/api/sentinel/query"
                    placeholder={t('sentinel.placeholder')}
                    isDark
                    extraBody={{ stadiumId: 'stad_nyc' }}
                    className="h-[550px]"
                  />
                </div>
              )}

              {/* Scenario Simulator Panel */}
              {activePanel === 'scenario' && (
                <div className="animate-fade-in space-y-4">
                  {/* Scenario Buttons */}
                  <div className="bg-brand-navy-light rounded-xl border border-brand-navy-mid p-4">
                    <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                      <Zap size={14} className="text-brand-crimson" />
                      {t('scenario.title')}
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">{t('scenario.subtitle')}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(Object.keys(SCENARIOS) as ScenarioType[]).map((scenario) => {
                        const meta = SCENARIOS[scenario];
                        const isRunning = runningScenario === scenario;
                        return (
                          <button
                            key={scenario}
                            onClick={() => triggerScenario(scenario)}
                            disabled={!!runningScenario}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              isRunning
                                ? 'bg-white/10 border-2 scale-[1.02]'
                                : runningScenario
                                  ? 'opacity-40 cursor-not-allowed bg-white/5 border border-white/5'
                                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                            style={{
                              borderColor: isRunning ? meta.color : undefined,
                              color: meta.color,
                            }}
                          >
                            {isRunning ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              SCENARIO_ICONS[scenario]
                            )}
                            <span className="text-left">
                              <div>{meta.name}</div>
                              <div className="text-[10px] text-gray-500 font-normal">{meta.description}</div>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cascade Timeline */}
                  {cascadeEvents.length > 0 && (
                    <div className="bg-brand-navy-light rounded-xl border border-brand-navy-mid p-4 max-h-[500px] overflow-y-auto">
                      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity size={14} className="text-brand-green" />
                        Live Cascade Timeline
                        {runningScenario && (
                          <span className="text-xs text-amber-400 animate-pulse ml-2">
                            {t('scenario.running')}
                          </span>
                        )}
                        {!runningScenario && cascadeEvents.length > 0 && (
                          <span className="text-xs text-green-400 ml-2">
                            ✓ {t('scenario.complete')}
                          </span>
                        )}
                      </h3>
                      <CascadeTimeline events={cascadeEvents} />
                    </div>
                  )}

                  {cascadeEvents.length === 0 && !runningScenario && (
                    <div className="bg-brand-navy-light rounded-xl border border-brand-navy-mid p-8 text-center">
                      <Zap size={32} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Select a scenario above to watch the cross-agent cascade</p>
                    </div>
                  )}
                </div>
              )}

              {/* ESG Panel */}
              {activePanel === 'esg' && (
                <div className="animate-fade-in">
                  <AgentChat
                    agentId="greengoal"
                    apiEndpoint="/api/greengoal/chat"
                    placeholder="Ask about sustainability data or generate an ESG report..."
                    isDark
                    extraBody={{ mode: 'esg', stadiumId: 'stad_nyc' }}
                    className="h-[550px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
