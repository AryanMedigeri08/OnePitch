'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/navbar';
import { AgentChat } from '@/components/agent-chat';
import { Navigation, Accessibility, Train, Leaf, Camera, Upload, Loader2 } from 'lucide-react';
import fansData from '@/data/fans.json';

const TABS = [
  { id: 'compass', icon: <Navigation size={16} />, key: 'compass' },
  { id: 'accessall', icon: <Accessibility size={16} />, key: 'accessall' },
  { id: 'transitflow', icon: <Train size={16} />, key: 'transitflow' },
  { id: 'greengoal', icon: <Leaf size={16} />, key: 'greengoal' },
] as const;

export default function FanPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<string>('compass');
  const [selectedFan, setSelectedFan] = useState(fansData[0]);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Waste scanner handler
  async function handleImageUpload(file: File) {
    setScanning(true);
    setScanResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const res = await fetch('/api/greengoal/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'scan',
            image: base64,
            messages: [],
          }),
        });
        const data = await res.json();
        setScanResult(data.classification || data.error || 'Unable to classify');
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setScanResult('Failed to classify. Please try again.');
      setScanning(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Fan Persona Selector */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto">
            <span className="text-xs text-gray-500 shrink-0">Demo Persona:</span>
            {fansData.map((fan) => (
              <button
                key={fan.id}
                onClick={() => setSelectedFan(fan)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedFan.id === fan.id
                    ? 'bg-brand-navy text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {fan.name.replace(' (mock)', '').split('—')[1]?.trim() || fan.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-1 -mb-px overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${
                    activeTab === tab.id
                      ? 'border-brand-navy text-brand-navy'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {t(`${tab.key}.title`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Compass Tab */}
          {activeTab === 'compass' && (
            <div className="animate-fade-in">
              <AgentChat
                agentId="compass"
                apiEndpoint="/api/compass/route"
                placeholder={t('compass.placeholder')}
                extraBody={{ fanId: selectedFan.id, stadiumId: selectedFan.seat.stadium_id }}
                className="h-[600px]"
              />
            </div>
          )}

          {/* AccessAll Tab */}
          {activeTab === 'accessall' && (
            <div className="animate-fade-in space-y-4">
              {/* Current Needs Display */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('accessall.profileTitle')}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{t('accessall.profileDesc')}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFan.accessibility_needs.length > 0 ? (
                    selectedFan.accessibility_needs.map((need) => (
                      <span
                        key={need}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                      >
                        {need}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No specific needs selected</span>
                  )}
                </div>
              </div>

              <AgentChat
                agentId="accessall"
                apiEndpoint="/api/accessall/chat"
                placeholder={t('accessall.trainingPlaceholder')}
                extraBody={{
                  fanId: selectedFan.id,
                  stadiumId: selectedFan.seat.stadium_id,
                  needs: selectedFan.accessibility_needs,
                  mode: 'profile',
                }}
                className="h-[500px]"
              />
            </div>
          )}

          {/* TransitFlow Tab */}
          {activeTab === 'transitflow' && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>📍 Origin: <strong className="text-gray-900">{selectedFan.origin_hotel}</strong></span>
                  <span>⏰ Kickoff: <strong className="text-gray-900">19:00</strong></span>
                  <span>🏟️ Stadium: <strong className="text-gray-900">{selectedFan.seat.stadium_id}</strong></span>
                </div>
              </div>

              <AgentChat
                agentId="transitflow"
                apiEndpoint="/api/transitflow/chat"
                placeholder={t('transitflow.origin')}
                extraBody={{
                  stadiumId: selectedFan.seat.stadium_id,
                  origin: selectedFan.origin_hotel,
                  kickoffTime: '19:00',
                  needs: selectedFan.accessibility_needs,
                }}
                className="h-[500px]"
              />
            </div>
          )}

          {/* GreenGoal Tab */}
          {activeTab === 'greengoal' && (
            <div className="animate-fade-in space-y-4">
              {/* Waste Scanner */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Camera size={16} className="text-brand-green" />
                  {t('greengoal.scanner')}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{t('greengoal.scannerDesc')}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green/10 text-brand-green font-medium text-sm hover:bg-brand-green/20 transition-colors"
                    disabled={scanning}
                  >
                    {scanning ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {t('greengoal.upload')}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 animate-slide-up">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🌱</span>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">{scanResult}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Carbon Copilot Chat */}
              <AgentChat
                agentId="greengoal"
                apiEndpoint="/api/greengoal/chat"
                placeholder={t('greengoal.carbonPlaceholder')}
                extraBody={{ mode: 'carbon', stadiumId: selectedFan.seat.stadium_id }}
                className="h-[400px]"
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
