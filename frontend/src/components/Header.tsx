import React from 'react';
import { Shield, Activity, Lock, Database, Radio } from 'lucide-react';
import { HealthStatus } from '../services/api';

interface HeaderProps {
  health: HealthStatus | null;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ health }) => {
  return (
    <header className="border-b-2 border-slate-800 bg-[#0B111E]/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shadow-[3px_3px_0px_#10B981]">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                VECTOR<span className="text-emerald-400">SHIELD</span>
              </span>
              <span className="badge-2d bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] px-2 py-0.5 rounded">
                v1.0-DEFENSE
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide">
              Enterprise Multi-Layered Defense & Evaluation Platform for RAG
            </p>
          </div>
        </div>

        {/* Telemetry Status Pills */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Vector Store Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-900 border-2 border-slate-800 shadow-[2px_2px_0px_#000]">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Vector DB:</span>
            <span className="font-mono text-cyan-300 font-bold uppercase">
              {health?.vector_backend || 'Chroma-Native'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono font-bold">
              {health?.indexed_chunks ?? 5} Chunks
            </span>
          </div>

          {/* Canary Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-900 border-2 border-slate-800 shadow-[2px_2px_0px_#000]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Canary:</span>
            <span className="font-mono text-amber-300 font-semibold">ACTIVE</span>
          </div>

          {/* Real-time Sentinel Heartbeat */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-emerald-950/60 border-2 border-emerald-600/60 shadow-[2px_2px_0px_#064e3b]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono font-bold uppercase tracking-wider">
              SENTINEL: ARMED
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
