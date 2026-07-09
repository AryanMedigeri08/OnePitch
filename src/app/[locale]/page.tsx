'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ArrowRight, Shield, Navigation, Leaf } from 'lucide-react';
import { AGENTS, type AgentId } from '@/lib/agents/types';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  compass: <Navigation size={28} />,
  sentinel: <Shield size={28} />,
  greengoal: <Leaf size={28} />,
};

export default function LandingPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const featuredAgents: AgentId[] = ['compass', 'sentinel', 'greengoal'];
  const allAgents = Object.values(AGENTS);

  return (
    <div data-theme="dark" className="dark min-h-screen flex flex-col bg-brand-navy">
      <Navbar />
      <main className="flex-1 bg-brand-navy overflow-hidden text-white">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-navy-mid/40">
          {/* Tech Mesh & Neon Radial Blobs */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(26,43,80,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(26,43,80,0.07)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-brand-green/10 blur-[120px] pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-brand-blue/10 blur-[120px] pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-purple/5 blur-[150px] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Animated Pill Badge */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping" />
                <span className="text-gray-300 font-mono tracking-wider">FIFA WORLD CUP 2026</span>
              </span>
            </div>

            {/* Headline with Neo Gradients */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] animate-slide-up">
              <span className="bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                {t('landing.hero').split('—')[0]}
              </span>
              <br />
              <span className="bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                Multi-Agent Operations
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.15s' }}>
              {t('landing.heroSub')}
            </p>

            {/* Premium CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href={`/${locale}/fan`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-green hover:bg-brand-green-dim text-brand-navy font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-green/20"
              >
                {t('common.viewDemo')}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${locale}/command`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                {t('common.commandCenter')}
                <Shield size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* FWC 2026 Challenge & Problem Alignment Section */}
        <section className="py-24 relative border-b border-brand-navy-mid/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Addressing Tournament Scale Challenges
              </h2>
              <p className="mt-4 text-base sm:text-lg text-gray-400 leading-relaxed">
                The massive 48-team format in 2026 requires continuous operations. Here is how OnePitch synchronizes logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Bottleneck Card */}
              <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-crimson/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-crimson/10 transition-colors" />
                <div>
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-crimson/15 text-brand-crimson border border-brand-crimson/20">
                    The Problem
                  </span>
                  <h3 className="text-2xl font-bold mt-6 mb-3 text-white">Logistical Bottlenecks</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    Siloed operations cause chaos during sudden emergencies. Standard alerts get ignored, transit routes clog up, and wheelchair-bound fans get stranded at gridlocked entrances.
                  </p>
                </div>
                <div className="border-t border-brand-navy-mid/60 pt-6 mt-8">
                  <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-3">Target Areas:</div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-200">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-crimson" /> Wayfinding Detours</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-crimson" /> Transit Gridlocks</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-crimson" /> Accessibility Gaps</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-crimson" /> Volunteer Fatigue</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-crimson" /> Language Barriers</span>
                  </div>
                </div>
              </div>

              {/* Solution Card */}
              <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-green/10 transition-colors" />
                <div>
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/20">
                    The Solution
                  </span>
                  <h3 className="text-2xl font-bold mt-6 mb-3 text-white">OnePitch Cooperative Agents</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    6 specialized AI agents running on a shared real-time status layer. An incident logged by one agent cascades down to the rest, automatically adjusting walking signs, transit schedules, and emergency response teams.
                  </p>
                </div>
                <div className="border-t border-brand-navy-mid/60 pt-6 mt-8">
                  <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-3">Key Solutions:</div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-200">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Smart Wayfinding</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Real-time Crowd Flow</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Inclusive Paths</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Multilingual Assist</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Active GreenGoal BMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Agents Section */}
        <section className="py-24 relative bg-black/20 border-b border-brand-navy-mid/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredAgents.map((agentId, i) => {
                const agent = AGENTS[agentId];
                const featureKeys = ['feature1', 'feature2', 'feature3'] as const;
                return (
                  <div
                    key={agentId}
                    className="glass-card rounded-2xl p-8 border border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full blur-xl group-hover:bg-white/5 transition-colors" />
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg"
                      style={{ background: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}25` }}
                    >
                      {FEATURE_ICONS[agentId]}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t(`landing.${featureKeys[i]}Title`)}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {t(`landing.${featureKeys[i]}Desc`)}
                    </p>
                    <div className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-medium tracking-wider" style={{ background: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}25` }}>
                      {agent.modelTag}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Orchestration Highlight */}
        <section className="py-24 relative border-b border-brand-navy-mid/40 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-purple/15 text-brand-purple border border-brand-purple/20 mb-6 inline-block">
              Intelligent Cascade
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {t('landing.orchestration')}
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10 text-sm sm:text-base">
              {t('landing.orchestrationDesc')}
            </p>

            {/* Agent chain visualization */}
            <div className="flex items-center justify-center flex-wrap gap-3 mb-10">
              {allAgents.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all duration-300"
                    style={{
                      background: `rgba(255, 255, 255, 0.04)`,
                      color: agent.color,
                      border: `1px solid ${agent.color}30`,
                    }}
                  >
                    <span>{agent.icon}</span>
                    <span className="text-gray-200">{agent.name}</span>
                  </div>
                  {i < allAgents.length - 1 && (
                    <ArrowRight size={14} className="text-gray-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <Link
              href={`/${locale}/command`}
              className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dim font-bold text-sm transition-all hover:translate-x-1"
            >
              {t('landing.tryScenario')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* All 6 Agents Grid */}
        <section className="py-24 relative bg-black/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight">
                6 Cooperative Agents. One System.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-400 leading-relaxed">
                Each agent manages a distinct operational sector, feeding information back into the central command panel.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300" role="img" aria-label={agent.name}>{agent.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{agent.name}</h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{agent.tagline}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 text-[9px] font-mono tracking-wider text-right" style={{ color: agent.color }}>
                    {agent.modelTag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy text-gray-500 border-t border-brand-navy-mid/40 py-10 z-10 relative">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs space-y-2">
          <p className="tracking-wide">OnePitch AI — FWC 2026 Hackathon Showcase Build</p>
          <p className="opacity-60">All simulation parameters and logs are fully synthetic. Powered by Gemini & Groq APIs.</p>
        </div>
      </footer>
    </div>
  );
}
