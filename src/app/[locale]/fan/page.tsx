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
      <main className="flex-1 bg-slate-50/50 pb-16">
        {/* Fan Header Hero */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white py-10 px-4 border-b border-brand-navy-mid/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest bg-brand-green/20 text-brand-green font-bold border border-brand-green/30 uppercase">
                Fan Concierge Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Your FWC 2026 Companion</h1>
              <p className="text-xs text-gray-400 mt-1 max-w-xl">
                Get real-time wayfinding directions, personalized accessibility services, multi-modal travel itineraries, and sustainability classification.
              </p>
            </div>
            
            {/* Live Ticket Details */}
            <div className="glass-card rounded-xl p-4 border border-white/10 shadow-lg flex items-center gap-4 shrink-0 text-left bg-white/5">
              <span className="text-3xl">🎫</span>
              <div className="text-xs space-y-0.5">
                <div className="text-gray-400 font-mono tracking-wider">MATCH SEAT</div>
                <div className="font-bold text-white text-sm">{selectedFan.seat.sector} • Row {selectedFan.seat.row}</div>
                <div className="text-brand-green font-semibold font-mono tracking-wider">{selectedFan.seat.stadium_id.replace('stad_', '').toUpperCase()} Arena</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fan Persona Selector */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-14 z-40">
          <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-xs text-gray-500 font-semibold shrink-0 uppercase tracking-wider">Demo Persona:</span>
            <div className="flex gap-2">
              {fansData.map((fan) => (
                <button
                  key={fan.id}
                  onClick={() => setSelectedFan(fan)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    selectedFan.id === fan.id
                      ? 'bg-brand-navy text-white shadow-md shadow-brand-navy/10 scale-105'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  {fan.name.replace(' (mock)', '').split('—')[1]?.trim() || fan.name}
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
                        ? 'border-brand-navy text-brand-navy scale-105'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="shrink-0">{tab.icon}</span>
                    <span>{t(`${tab.key}.title`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Compass Tab */}
          {activeTab === 'compass' && (
            <div className="animate-fade-in">
              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
                <AgentChat
                  agentId="compass"
                  apiEndpoint="/api/compass/route"
                  placeholder={t('compass.placeholder')}
                  extraBody={{ fanId: selectedFan.id, stadiumId: selectedFan.seat.stadium_id }}
                  className="h-[600px] border-none"
                />
              </div>
            </div>
          )}

          {/* AccessAll Tab */}
          {activeTab === 'accessall' && (
            <div className="animate-fade-in space-y-6">
              {/* Current Needs Display */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-md">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('accessall.profileTitle')}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{t('accessall.profileDesc')}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFan.accessibility_needs.length > 0 ? (
                    selectedFan.accessibility_needs.map((need) => (
                      <span
                        key={need}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-100 flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                        {need}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No specific accessibility preferences declared.</span>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
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
                  className="h-[500px] border-none"
                />
              </div>
            </div>
          )}

          {/* TransitFlow Tab */}
          {activeTab === 'transitflow' && (
            <div className="animate-fade-in space-y-6">
              {/* Travel parameters details card */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Origin Hotel</span>
                    <strong className="text-slate-900 text-sm">{selectedFan.origin_hotel}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Suggested Arrival</span>
                    <strong className="text-slate-900 text-sm">17:30 (90m pre-kickoff)</strong>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-gray-500 block uppercase font-mono tracking-wider mb-1">Destination</span>
                    <strong className="text-slate-900 text-sm">MetLife Stadium Gate {selectedFan.seat.sector.slice(0, 1)}</strong>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
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
                  className="h-[500px] border-none"
                />
              </div>
            </div>
          )}

          {/* GreenGoal Tab */}
          {activeTab === 'greengoal' && (
            <div className="animate-fade-in space-y-6">
              {/* Waste Scanner */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-md">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Camera size={16} className="text-brand-green" />
                  {t('greengoal.scanner')}
                </h3>
                <p className="text-xs text-gray-500 mb-6">{t('greengoal.scannerDesc')}</p>

                {/* Dropzone container */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-brand-green/50 bg-slate-50/50 hover:bg-green-50/10 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{t('greengoal.upload')}</span>
                  <span className="text-xs text-gray-400 mt-1">Select an image of your trash to classify (supports JPG, PNG)</span>
                  
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

                {/* Scan Loading Status */}
                {scanning && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                    <Loader2 size={16} className="animate-spin text-brand-green" />
                    <span>Analyzing trash items via Gemini Vision...</span>
                  </div>
                )}

                {/* Scan Result */}
                {scanResult && !scanning && (
                  <div className="mt-6 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 animate-slide-up shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5" role="img" aria-label="eco emoji">🌱</span>
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold tracking-wider text-brand-green-dim uppercase">Gemini Vision Result</span>
                        <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-medium">{scanResult}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Carbon Copilot Chat */}
              <div className="glass-card rounded-2xl p-1 shadow-xl border border-slate-200/50">
                <AgentChat
                  agentId="greengoal"
                  apiEndpoint="/api/greengoal/chat"
                  placeholder={t('greengoal.carbonPlaceholder')}
                  extraBody={{ mode: 'carbon', stadiumId: selectedFan.seat.stadium_id }}
                  className="h-[400px] border-none"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
