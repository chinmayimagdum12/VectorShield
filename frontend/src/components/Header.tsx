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
    <header className="border-b-2 border-slate-900 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-slate-900 flex items-center justify-center shadow-[3px_3px_0px_#0F172A] transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-950 font-mono">
                VECTOR<span className="text-indigo-600">SHIELD</span>
              </span>
              <span className="badge-2d bg-indigo-50 text-indigo-700 border-indigo-900 text-[10px] px-2 py-0.5 rounded font-mono">
                ENTERPRISE SOC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
              Multi-Layered Defense &amp; Adversarial Evaluation Platform for RAG Systems
            </p>
          </div>
        </div>

        {/* Live Telemetry & Quick Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Vector Store */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A]">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-500 font-medium text-[11px]">Vector Engine:</span>
            <span className="font-mono text-slate-900 font-bold uppercase text-[11px]">
              {health?.vector_backend || 'Chroma-Native'}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-emerald-700 font-mono font-bold text-[11px]">
              {health?.indexed_chunks ?? 6} Chunks
            </span>
          </div>

          {/* Canary Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-50 border-2 border-amber-900/80 shadow-[2px_2px_0px_#78350F]">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-800 font-medium text-[11px]">Canary Token:</span>
            <span className="font-mono text-amber-950 font-bold text-[11px]">ARMED</span>
          </div>

          {/* Audio Haptic Feedback Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? "Tactile Audio: Enabled" : "Tactile Audio: Muted"}
            className={`btn-2d flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono ${
              audioEnabled ? 'bg-indigo-50 text-indigo-700 border-indigo-900 shadow-[2px_2px_0px_#312E81]' : 'text-slate-600'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline font-bold">{audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>

          {/* Sentinel Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border-2 border-emerald-900 shadow-[2px_2px_0px_#064E3B]">
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
