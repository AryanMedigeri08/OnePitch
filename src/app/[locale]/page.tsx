'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ArrowRight, Shield, Navigation, Leaf, Zap, Users, Train } from 'lucide-react';
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
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand-navy text-white">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-brand-green/5 blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-purple/3 blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
            {/* Badge */}
            <div className="flex justify-center mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
                <Zap size={12} />
                FWC 2026 Operations Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight animate-slide-up">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                {t('landing.hero')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-center text-base sm:text-lg text-gray-400 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t('landing.heroSub')}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                href={`/${locale}/fan`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-green text-brand-navy font-semibold text-sm hover:bg-brand-green/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-green/20"
              >
                {t('common.viewDemo')}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${locale}/command`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-all"
              >
                {t('common.commandCenter')}
                <Shield size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* FWC 2026 Challenge & Problem Alignment Section */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Aligning AI with the FWC 2026 Operational Challenge
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                The FIFA World Cup 2026 spans 3 countries, 48 teams, and 104 matches. OnePitch AI maps direct operational solutions to the tournament's core logistical bottlenecks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <div className="bg-gradient-to-br from-brand-navy to-brand-navy-light rounded-2xl p-8 text-white flex flex-col justify-between border border-brand-navy-mid shadow-xl">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-crimson/25 text-brand-crimson border border-brand-crimson/30">
                    FWC 2026 Logistics Bottleneck
                  </span>
                  <h3 className="text-xl font-bold mt-4 mb-2">The Operational Complexity</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    Managing millions of fans across transit hubs, airport connections, security checkpoints, and accessible stadium seating presents unprecedented scaling problems. Outages, weather surges, and crowd bottlenecks demand instant, coordinated, multi-system responses.
                  </p>
                </div>
                <div className="border-t border-brand-navy-mid pt-4 mt-4">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Operational Goals Addressed:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="flex items-center gap-1.5"><span className="text-brand-green">✓</span> Wayfinding Navigation</span>
                    <span className="flex items-center gap-1.5"><span className="text-brand-green">✓</span> Transit Routing</span>
                    <span className="flex items-center gap-1.5"><span className="text-brand-green">✓</span> Accessible Concierge</span>
                    <span className="flex items-center gap-1.5"><span className="text-brand-green">✓</span> Sustainability Monitoring</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-green/10 text-brand-green border border-brand-green/20">
                    The OnePitch AI Solution
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Multi-Agent Intelligent Sync</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Instead of siloed apps, OnePitch orchestrates 6 specialized, cooperative AI agents. In a weather event or medical crisis, agents automatically pass context horizontally (e.g., closing a gate instantly re-routes transit arrivals, dispatches accessible volunteers, and cuts power in closed zones).
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Coordinated Agent Ecosystem</span>
                  <span className="font-semibold text-brand-navy font-mono">6 Agents • Real-Time Fallbacks</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Agents Section */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredAgents.map((agentId, i) => {
                const agent = AGENTS[agentId];
                const featureKeys = ['feature1', 'feature2', 'feature3'] as const;
                return (
                  <div
                    key={agentId}
                    className="agent-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                      style={{ background: `${agent.color}15`, color: agent.color }}
                    >
                      {FEATURE_ICONS[agentId]}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {t(`landing.${featureKeys[i]}Title`)}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {t(`landing.${featureKeys[i]}Desc`)}
                    </p>
                    <div className="mt-3 model-tag" style={{ color: agent.color }}>
                      {agent.modelTag}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Orchestration Highlight */}
        <section className="py-16 sm:py-24 bg-brand-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {t('landing.orchestration')}
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
              {t('landing.orchestrationDesc')}
            </p>

            {/* Agent chain visualization */}
            <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
              {allAgents.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}30`,
                    }}
                  >
                    <span>{agent.icon}</span>
                    <span>{agent.name}</span>
                  </div>
                  {i < allAgents.length - 1 && (
                    <ArrowRight size={14} className="text-gray-600" />
                  )}
                </div>
              ))}
            </div>

            <Link
              href={`/${locale}/command`}
              className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green/80 font-medium text-sm transition-colors"
            >
              {t('landing.tryScenario')}
            </Link>
          </div>
        </section>

        {/* All 6 Agents Grid */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
              Six Agents. One Mission.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="agent-card rounded-xl p-5 border border-gray-100 bg-gray-50/50 hover:bg-white"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-xs text-gray-500">{agent.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy text-gray-500 border-t border-brand-navy-mid py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs">
          <p>OnePitch AI — Hackathon Demo Build | All data is synthetic/simulated</p>
          <p className="mt-1">Powered by Gemini API | Built with Next.js</p>
        </div>
      </footer>
    </>
  );
}
