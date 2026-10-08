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
    <header className="border-b border-slate-800/90 bg-[#090D1A] sticky top-0 z-50 px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090D1A] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                VECTOR<span className="text-indigo-400">SHIELD</span>
              </span>
              <span className="badge-2d bg-indigo-950/70 text-indigo-300 border-indigo-700/60 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">
                ENTERPRISE SOC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-Layered Defense &amp; Adversarial Evaluation Platform for RAG Systems
            </p>
          </div>
        </div>

        {/* Live Telemetry & Quick Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Vector Store */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium text-[11px]">Vector:</span>
            <span className="font-mono text-white font-bold uppercase text-[11px]">
              {health?.vector_backend || 'Chroma-Native'}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">
              {health?.indexed_chunks ?? 6} Chunks
            </span>
          </div>

          {/* Canary Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-700/60 text-xs">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-medium text-[11px]">Canary:</span>
            <span className="font-mono text-amber-200 font-bold text-[11px]">ARMED</span>
          </div>

          {/* Audio Haptic Feedback Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? "Tactile Audio: Enabled" : "Tactile Audio: Muted"}
            className={`btn-2d flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all ${
              audioEnabled
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden md:inline font-bold">{audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>

          {/* Sentinel Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-600/70 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-mono font-extrabold text-[11px] uppercase tracking-wider">
              ARMED: L0-L5
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
