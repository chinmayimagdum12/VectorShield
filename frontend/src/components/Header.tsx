import React, { useState } from 'react';
import { Shield, Activity, Lock, Database, Radio, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { HealthStatus } from '../services/api';
import { sound } from './SoundEffects';

interface HeaderProps {
  health: HealthStatus | null;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ health }) => {
  const [audioEnabled, setAudioEnabled] = useState(sound.enabled);

  const toggleAudio = () => {
    const newState = sound.toggle();
    setAudioEnabled(newState);
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-slate-900 font-mono">
                VECTOR<span className="text-indigo-600">SHIELD</span>
              </span>
              <span className="badge-2d bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                ENTERPRISE SOC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-Layered Defense &amp; Adversarial Evaluation Platform for RAG Systems
            </p>
          </div>
        </div>

        {/* Live Telemetry & Quick Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Vector Store */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-500 font-medium text-[11px]">Vector:</span>
            <span className="font-mono text-slate-900 font-bold uppercase text-[11px]">
              {health?.vector_backend || 'Chroma-Native'}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-emerald-700 font-mono font-bold text-[11px]">
              {health?.indexed_chunks ?? 6} Chunks
            </span>
          </div>

          {/* Canary Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-800 font-medium text-[11px]">Canary:</span>
            <span className="font-mono text-amber-950 font-bold text-[11px]">ARMED</span>
          </div>

          {/* Audio Haptic Feedback Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? "Tactile Audio: Enabled" : "Tactile Audio: Muted"}
            className={`btn-2d flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono ${
              audioEnabled ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline font-bold">{audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>

          {/* Sentinel Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-emerald-900 font-mono font-extrabold text-[11px] uppercase tracking-wider">
              ARMED: L0-L5
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
