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
      <main className="flex-1 bg-gray-50">
        {/* Volunteer Selector */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto">
            <span className="text-xs text-gray-500 shrink-0">Volunteer:</span>
            {nycVolunteers.map((vol) => (
              <button
                key={vol.id}
                onClick={() => setSelectedVolunteer(vol)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedVolunteer.id === vol.id
                    ? 'bg-brand-pink text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {vol.name.replace(' (mock)', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-1 -mb-px">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-pink text-brand-pink'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {t(`volunteeros.${tab.labelKey}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Shift-Sync Tab */}
          {activeTab === 'shiftsync' && (
            <div className="animate-fade-in space-y-4">
              {/* Volunteer Info Card */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedVolunteer.name.replace(' (mock)', '')}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedVolunteer.role}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedVolunteer.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : selectedVolunteer.status === 'on_break'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedVolunteer.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500">Post</div>
                    <div className="font-medium text-gray-900">{selectedVolunteer.current_post}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500">Shift</div>
                    <div className="font-medium text-gray-900">{selectedVolunteer.shift_start} — {selectedVolunteer.shift_end}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500">Languages</div>
                    <div className="font-medium text-gray-900">{selectedVolunteer.language.join(', ')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-500">Skills</div>
                    <div className="font-medium text-gray-900">{selectedVolunteer.skills.slice(0, 2).join(', ')}</div>
                  </div>
                </div>
              </div>

              {/* Micro-training chat */}
              <AgentChat
                agentId="volunteeros"
                apiEndpoint="/api/volunteeros/chat"
                placeholder="Ask about volunteer procedures..."
                extraBody={{ volunteerId: selectedVolunteer.id, mode: 'general' }}
                className="h-[400px]"
              />
            </div>
          )}

          {/* Sentiment Pulse Tab */}
          {activeTab === 'sentiment' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Heart size={16} className="text-brand-pink" />
                  {t('volunteeros.sentiment')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Share how you&apos;re feeling — your wellbeing matters to us.</p>
              </div>
              <AgentChat
                agentId="volunteeros"
                apiEndpoint="/api/volunteeros/chat"
                placeholder={t('volunteeros.sentimentPlaceholder')}
                extraBody={{ volunteerId: selectedVolunteer.id, mode: 'checkin' }}
                className="h-[450px]"
              />
            </div>
          )}

          {/* Shift Handoff Tab */}
          {activeTab === 'handoff' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-brand-purple" />
                  {t('volunteeros.handoff')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Paste your shift notes to generate a structured summary for the next volunteer.</p>
              </div>
              <AgentChat
                agentId="volunteeros"
                apiEndpoint="/api/volunteeros/chat"
                placeholder={t('volunteeros.handoffPlaceholder')}
                extraBody={{ volunteerId: selectedVolunteer.id, mode: 'handoff' }}
                className="h-[450px]"
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
