'use client';

import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/navbar';
import { AgentChat } from '@/components/agent-chat';
import { MapPin, Heart, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import volunteersData from '@/data/volunteers.json';

const TABS = [
  { id: 'shiftsync', icon: <MapPin size={16} />, labelKey: 'shiftSync' },
  { id: 'sentiment', icon: <Heart size={16} />, labelKey: 'sentiment' },
  { id: 'handoff', icon: <ArrowRightLeft size={16} />, labelKey: 'handoff' },
] as const;

export default function VolunteerPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('shiftsync');
  const [selectedVolunteer, setSelectedVolunteer] = useState(volunteersData[0]);

  // Filter to NYC volunteers for demo
  const nycVolunteers = volunteersData.filter((v) => v.stadium_id === 'stad_nyc');

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        {/* Volunteer Header */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white py-10 px-4 border-b border-brand-navy-mid/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(236,72,153,0.1),transparent_50%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest bg-brand-pink/25 text-brand-pink font-bold border border-brand-pink/30 uppercase">
                Volunteer Force Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">VolunteerOS Sync</h1>
              <p className="text-xs text-gray-400 mt-1 max-w-xl">
                Check shift times, monitor team sentiment logs, request guides, and construct structured shift handoffs.
              </p>
            </div>
            
            {/* Shift Summary Card */}
            <div className="glass-card rounded-xl p-4 border border-white/10 shadow-lg flex items-center gap-4 shrink-0 text-left bg-white/5">
              <span className="text-3xl">🤝</span>
              <div className="text-xs space-y-0.5">
                <div className="text-gray-400 font-mono tracking-wider">ACTIVE VOLUNTEER</div>
                <div className="font-bold text-white text-sm">{selectedVolunteer.name.replace(' (mock)', '')}</div>
                <div className="text-brand-pink font-semibold font-mono tracking-wider">{selectedVolunteer.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Volunteer Selector */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-14 z-40">
          <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-xs text-gray-500 font-semibold shrink-0 uppercase tracking-wider">Volunteer:</span>
            <div className="flex gap-2">
              {nycVolunteers.map((vol) => (
                <button
                  key={vol.id}
                  onClick={() => setSelectedVolunteer(vol)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    selectedVolunteer.id === vol.id
                      ? 'bg-brand-pink text-white shadow-md shadow-brand-pink/10 scale-105'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  {vol.name.replace(' (mock)', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200/60 sticky top-28 z-30 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 -mb-px overflow-x-auto pt-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                      isActive
                        ? 'border-brand-pink text-brand-pink scale-105'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="shrink-0">{tab.icon}</span>
                    <span>{t(`volunteeros.${tab.labelKey}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Shift-Sync Tab */}
          {activeTab === 'shiftsync' && (
            <div className="animate-fade-in space-y-6">
              {/* Volunteer Info Card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{selectedVolunteer.name.replace(' (mock)', '')}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedVolunteer.role}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    selectedVolunteer.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : selectedVolunteer.status === 'on_break'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                    {selectedVolunteer.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Post Assignment</span>
                    <strong className="text-slate-900 text-sm">{selectedVolunteer.current_post}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Shift Duration</span>
                    <strong className="text-slate-900 text-sm">{selectedVolunteer.shift_start} — {selectedVolunteer.shift_end}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Language Dialects</span>
                    <strong className="text-slate-900 text-sm">{selectedVolunteer.language.join(', ')}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Specialty Skills</span>
                    <strong className="text-slate-900 text-sm">{selectedVolunteer.skills.slice(0, 2).join(', ')}</strong>
                  </div>
                </div>
              </div>

              {/* Micro-training chat */}
              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
                <AgentChat
                  agentId="volunteeros"
                  apiEndpoint="/api/volunteeros/chat"
                  placeholder="Ask about volunteer procedures..."
                  extraBody={{ volunteerId: selectedVolunteer.id, mode: 'general' }}
                  className="h-[400px] border-none"
                />
              </div>
            </div>
          )}

          {/* Sentiment Pulse Tab */}
          {activeTab === 'sentiment' && (
            <div className="animate-fade-in space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-md">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Heart size={16} className="text-brand-pink" />
                  {t('volunteeros.sentiment')}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Share updates, check-ins, or report tiredness. Our Command Center will receive direct fatigue flags.
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
                <AgentChat
                  agentId="volunteeros"
                  apiEndpoint="/api/volunteeros/chat"
                  placeholder={t('volunteeros.sentimentPlaceholder')}
                  extraBody={{ volunteerId: selectedVolunteer.id, mode: 'checkin' }}
                  className="h-[450px] border-none"
                />
              </div>
            </div>
          )}

          {/* Shift Handoff Tab */}
          {activeTab === 'handoff' && (
            <div className="animate-fade-in space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-md">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-brand-purple" />
                  {t('volunteeros.handoff')}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Paste notes, issues, and checklist logs here to generate a formatted handover log.
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
                <AgentChat
                  agentId="volunteeros"
                  apiEndpoint="/api/volunteeros/chat"
                  placeholder={t('volunteeros.handoffPlaceholder')}
                  extraBody={{ volunteerId: selectedVolunteer.id, mode: 'handoff' }}
                  className="h-[450px] border-none"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
