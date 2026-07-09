'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/navbar';
import { AgentChat } from '@/components/agent-chat';
import { StadiumMap } from '@/components/stadium-map';
import { CascadeTimeline } from '@/components/cascade-timeline';
import {
  Shield, Zap, Activity, CloudLightning, Ambulance, Lock,
  Loader2, RefreshCw, BarChart3
} from 'lucide-react';
import type { GateDensity } from '@/lib/mock-data-generator';
import type { CascadeEvent, ScenarioType } from '@/lib/agents/types';
import { SCENARIOS } from '@/lib/agents/types';
import { getDensityColor } from '@/lib/utils';

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
      <main className="flex-1 bg-brand-navy min-h-screen pb-16 text-slate-100">
        {/* Operations Top Toolbar */}
        <div className="border-b border-brand-navy-mid/60 bg-brand-navy-light/40 backdrop-blur-md py-4 px-4 sticky top-14 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                <Shield size={20} className="text-brand-green animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  {t('common.commandCenter')}
                </h1>
                <p className="text-xs text-gray-400">MetLife Arena Operations Center • Live Status</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
                <span className="text-[10px] text-brand-green font-mono font-bold tracking-widest uppercase">SYSTEMS ONLINE</span>
              </div>
              
              <button
                onClick={fetchDensities}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
                title="Force Refresh Data"
                aria-label="Refresh densities data"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Stadium Map + Gate Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stadium Map */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 shadow-2xl relative overflow-hidden">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={15} className="text-brand-green" />
                  {t('sentinel.heatmap')}
                </h2>
                <div className="bg-brand-navy/60 rounded-xl p-2 border border-brand-navy-mid/60 shadow-inner">
                  <StadiumMap
                    gates={gates}
                    onGateClick={handleGateClick}
                    isDark
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-3 text-center italic">Click a gate marker to override open/closed status</p>
              </div>

              {/* Gate Density List */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 shadow-2xl">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={15} className="text-brand-teal" />
                  {t('sentinel.density')}
                </h2>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {gates
                    .filter((g) => g.stadium_id === 'stad_nyc')
                    .map((gate) => (
                      <div
                        key={gate.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-md"
                            style={{ background: getDensityColor(gate.density_pct) }}
                          />
                          <span className="text-xs font-semibold text-gray-300">{gate.name.split('—')[0].trim()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-mono font-bold"
                            style={{ color: getDensityColor(gate.density_pct) }}
                          >
                            {gate.status === 'closed' ? 'CLOSED' : `${gate.density_pct}%`}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {gate.trend === 'rising' ? '↑' : gate.trend === 'falling' ? '↓' : '→'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right: Panel Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Panel Tabs */}
              <div className="flex gap-2 bg-brand-navy-light/60 p-1.5 rounded-xl border border-brand-navy-mid/60 backdrop-blur-sm self-start">
                <button
                  onClick={() => setActivePanel('sentinel')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activePanel === 'sentinel'
                      ? 'bg-brand-green text-brand-navy shadow-lg shadow-brand-green/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield size={14} />
                  Sentinel NLQ
                </button>
                <button
                  onClick={() => setActivePanel('scenario')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
                    activePanel === 'scenario'
                      ? 'bg-brand-crimson text-white shadow-lg shadow-brand-crimson/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap size={14} />
                  {t('scenario.title')}
                  {runningScenario && (
                    <Loader2 size={12} className="animate-spin ml-1 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setActivePanel('esg')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activePanel === 'esg'
                      ? 'bg-brand-teal text-brand-navy shadow-lg shadow-brand-teal/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 size={14} />
                  ESG
                </button>
              </div>

              {/* Sentinel Panel */}
              {activePanel === 'sentinel' && (
                <div className="animate-fade-in">
                  <div className="glass-card rounded-2xl p-1 shadow-2xl border border-white/5">
                    <AgentChat
                      agentId="sentinel"
                      apiEndpoint="/api/sentinel/query"
                      placeholder={t('sentinel.placeholder')}
                      isDark
                      extraBody={{ stadiumId: 'stad_nyc' }}
                      className="h-[550px] border-none"
                    />
                  </div>
                </div>
              )}

              {/* Scenario Simulator Panel */}
              {activePanel === 'scenario' && (
                <div className="animate-fade-in space-y-6">
                  {/* Scenario Buttons */}
                  <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-2xl">
                    <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Zap size={15} className="text-brand-crimson" />
                      {t('scenario.title')}
                    </h2>
                    <p className="text-xs text-gray-400 mb-6">{t('scenario.subtitle')}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(Object.keys(SCENARIOS) as ScenarioType[]).map((scenario) => {
                        const meta = SCENARIOS[scenario];
                        const isRunning = runningScenario === scenario;
                        return (
                          <button
                            key={scenario}
                            onClick={() => triggerScenario(scenario)}
                            disabled={!!runningScenario}
                            className={`flex flex-col items-start text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                              isRunning
                                ? 'bg-white/10 border-white/20 shadow-lg scale-[1.02]'
                                : runningScenario
                                  ? 'opacity-30 cursor-not-allowed bg-white/2 border-white/5'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                            style={{
                              borderColor: isRunning ? meta.color : undefined,
                            }}
                          >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/2 rounded-full blur-xl pointer-events-none" />
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                              style={{ background: `${meta.color}20`, color: meta.color }}
                            >
                              {isRunning ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                SCENARIO_ICONS[scenario]
                              )}
                            </div>
                            <span className="font-bold text-white text-sm block mb-1">{meta.name}</span>
                            <span className="text-[10px] text-gray-400 leading-normal">{meta.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cascade Timeline */}
                  {cascadeEvents.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-2xl max-h-[500px] overflow-y-auto">
                      <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <Activity size={15} className="text-brand-green" />
                        Live Cascade Incident Log
                        {runningScenario && (
                          <span className="text-[10px] font-mono tracking-widest text-amber-400 animate-pulse ml-3 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {t('scenario.running')}
                          </span>
                        )}
                        {!runningScenario && cascadeEvents.length > 0 && (
                          <span className="text-[10px] font-mono tracking-widest text-emerald-400 ml-3 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {t('scenario.complete')}
                          </span>
                        )}
                      </h3>
                      <CascadeTimeline events={cascadeEvents} />
                    </div>
                  )}

                  {cascadeEvents.length === 0 && !runningScenario && (
                    <div className="glass-card rounded-2xl p-12 border border-white/5 text-center shadow-2xl flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Zap size={28} className="text-gray-500 animate-pulse-glow" />
                      </div>
                      <p className="text-sm font-semibold text-gray-300">Operational Simulator Idle</p>
                      <p className="text-xs text-gray-500 mt-1">Select a crisis scenario from the toolbar above to watch the cross-agent cascade</p>
                    </div>
                  )}
                </div>
              )}

              {/* ESG Panel */}
              {activePanel === 'esg' && (
                <div className="animate-fade-in">
                  <div className="glass-card rounded-2xl p-1 shadow-2xl border border-white/5">
                    <AgentChat
                      agentId="greengoal"
                      apiEndpoint="/api/greengoal/chat"
                      placeholder="Ask about sustainability data or generate an ESG report..."
                      isDark
                      extraBody={{ mode: 'esg', stadiumId: 'stad_nyc' }}
                      className="h-[550px] border-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
