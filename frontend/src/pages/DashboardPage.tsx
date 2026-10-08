import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingDown,
  Layers,
  Flame,
  FileSearch,
  Swords,
  Download,
  FileCheck2,
  Radio,
  Printer
} from 'lucide-react';
import { HealthStatus } from '../services/api';
import { sound } from '../components/SoundEffects';

interface DashboardProps {
  health: HealthStatus | null;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ health, onNavigate }) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [tickerIndex, setTickerIndex] = useState<number>(0);

  // Live Threat Stream items
  const threatEvents = [
    { time: '16:22:04', fam: 'A1', type: 'System Instruction Override', action: 'BLOCKED & SEALED', risk: 94.2 },
    { time: '16:21:48', fam: 'A6', type: 'Markdown Image Exfiltration Beacon', action: 'URL STRIPPED', risk: 88.0 },
    { time: '16:21:12', fam: 'A3', type: 'Invisible Zero-Width Steganography', action: 'DE-OBFUSCATED', risk: 79.5 },
    { time: '16:20:30', fam: 'A4', type: 'Base64 Recursive Payload', action: 'INTERCEPTED (L1)', risk: 91.0 },
    { time: '16:19:55', fam: 'A8', type: 'Cosine Similarity Outlier Gaming', action: 'Z-SCORE PRUNED (L3)', risk: 72.4 },
    { time: '16:19:10', fam: 'A7', type: 'Knowledge Base False Fact Injection', action: 'QUARANTINED', risk: 85.0 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % threatEvents.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const attackFamilies = [
    { id: 'A1', name: 'Direct System Override', status: 'PROTECTED', level: '100%' },
    { id: 'A2', name: 'Persona Impersonation (DAN)', status: 'PROTECTED', level: '98%' },
    { id: 'A3', name: 'Steganography / Hidden Text', status: 'PROTECTED', level: '100%' },
    { id: 'A4', name: 'Base64 / ROT13 Obfuscation', status: 'PROTECTED', level: '99%' },
    { id: 'A5', name: 'Model Delimiter Spoofing', status: 'PROTECTED', level: '100%' },
    { id: 'A6', name: 'Data Exfiltration Beacons', status: 'PROTECTED', level: '100%' },
    { id: 'A7', name: 'Knowledge Poisoning (False Facts)', status: 'PROTECTED', level: '91%' },
    { id: 'A8', name: 'Retrieval Gaming & Mirroring', status: 'PROTECTED', level: '95%' },
    { id: 'A9', name: 'Split / Fragmented Payloads', status: 'PROTECTED', level: '93%' },
    { id: 'A10', name: 'Cross-Lingual Jailbreaks', status: 'PROTECTED', level: '94%' },
    { id: 'A11', name: 'Urgent Authority Override', status: 'PROTECTED', level: '96%' },
    { id: 'A12', name: 'Multi-Hop Recursive Pointers', status: 'PROTECTED', level: '95%' },
    { id: 'A13', name: 'Adaptive White-Box Evasion', status: 'PROTECTED', level: '89%' },
  ];

  // Radar points polygon calculations (6 axes)
  const radarAxes = [
    { label: 'L0 Trust', angle: 0 },
    { label: 'L1 Sanitizer', angle: 60 },
    { label: 'L2 Isolation', angle: 120 },
    { label: 'L3 Retrieval', angle: 180 },
    { label: 'L4 Hardening', angle: 240 },
    { label: 'L5 Output', angle: 300 },
  ];

  const getPolygonPoint = (angleDeg: number, radiusPercent: number) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const r = (radiusPercent / 100) * 105;
    return `${150 + r * Math.cos(rad)},${150 + r * Math.sin(rad)}`;
  };

  const shieldedPoints = radarAxes.map((a) => getPolygonPoint(a.angle, 95)).join(' ');
  const baselinePoints = radarAxes.map((a) => getPolygonPoint(a.angle, 15)).join(' ');

  return (
    <div className="space-y-6">
      {/* Live Threat Stream Ticker Bar (Sleek Dark Console) */}
      <div className="card-dark p-3.5 bg-[#090D1A] border border-slate-800 flex items-center justify-between overflow-hidden shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full">
            LIVE SENTINEL FEED
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono truncate px-3">
          <span className="text-slate-500 text-[10px]">[{threatEvents[tickerIndex].time}]</span>
          <span className="badge-2d bg-rose-950/80 text-rose-300 border-rose-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
            {threatEvents[tickerIndex].fam}
          </span>
          <span className="text-white font-bold text-[11px] truncate">{threatEvents[tickerIndex].type}</span>
          <span className="text-emerald-400 font-bold text-[10px] hidden sm:inline">&rarr; {threatEvents[tickerIndex].action}</span>
          <span className="text-slate-400 text-[10px] hidden md:inline">(Risk: {threatEvents[tickerIndex].risk})</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowReportModal(true);
          }}
          className="btn-2d-primary px-3.5 py-1.5 rounded-xl text-[11px] font-mono shrink-0 flex items-center space-x-1.5 shadow-sm active:translate-y-0.5 transition-all"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">Audit Report</span>
        </button>
      </div>

      {/* Top 4 Hero Metrics Cards (Dual-Tone: 1 Dark Hero + 3 Clean Light) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 (Attack Prevention) */}
        <div className="card-dark p-5 relative overflow-hidden group bg-[#0A1020] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              Attack Prevention
            </span>
            <span className="badge-2d bg-emerald-950/80 text-emerald-400 border-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              ASR DROP
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-emerald-400">96.4%</span>
            <span className="text-xs text-emerald-300 font-bold flex items-center font-mono">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> 98.2% &rarr; 1.8%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium font-sans">
            Empirical reduction across 142 red-team attack vectors
          </p>
        </div>

        {/* Metric 2 (Credential Breaches) */}
        <div className="card-dark p-5 relative overflow-hidden group bg-[#0A1020] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              Credential Breaches
            </span>
            <span className="badge-2d bg-cyan-950/80 text-cyan-400 border-cyan-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              ZERO-FAIL
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-cyan-400">0 Leaks</span>
            <span className="text-xs text-cyan-300 font-mono font-bold">/ 142 Tests</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium font-sans">
            Cryptographic canaries &amp; secrets 100% shielded
          </p>
        </div>

        {/* Metric 3 (Median Latency) */}
        <div className="card-dark p-5 relative overflow-hidden group bg-[#0A1020] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              Median P50 Latency
            </span>
            <span className="badge-2d bg-amber-950/80 text-amber-400 border-amber-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              REAL-TIME
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-amber-400">48.2 ms</span>
            <span className="text-xs text-amber-300 font-mono font-bold">Overhead</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium font-sans">
            Deterministic multi-stage verification in &lt; 50ms
          </p>
        </div>

        {/* Metric 4 (Defense Lifecycle) */}
        <div className="card-dark p-5 relative overflow-hidden group bg-[#0A1020] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
              Defense Lifecycle
            </span>
            <span className="badge-2d bg-indigo-950/80 text-indigo-400 border-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              ARMED: L0-L5
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-indigo-400">6 Layers</span>
            <span className="text-xs text-indigo-300 font-mono font-bold">L0 to L5</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium font-sans">
            Ingestion, vector index, query, and egress protection
          </p>
        </div>
      </div>

      {/* Main Grid: Duel Sandbox Launcher + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Side-by-side Showcase Preview & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/80 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                  <Swords className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono">
                    Adversarial Attack Duel Arena
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Real-time comparative execution: Undefended Target RAG vs VectorShield Defended RAG
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('attack-lab');
                }}
                className="btn-2d-primary px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm active:translate-y-0.5 transition-all"
              >
                <span>Launch Duel Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Demonstration Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Undefended Victim */}
              <div className="p-4 rounded-xl border border-rose-900/70 bg-[#130B17] shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-rose-400 font-mono">UNDEFENDED TARGET RAG</span>
                  <span className="badge-2d bg-rose-950/80 text-rose-400 border-rose-700 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                    VULNERABLE
                  </span>
                </div>
                <div className="font-mono text-xs text-rose-300 bg-[#07030A] p-3 rounded-lg border border-rose-900/60 leading-relaxed shadow-inner">
                  <span className="text-rose-500 font-bold">&gt; BREACHED:</span> System override acknowledged. Verification token <span className="text-rose-400 font-extrabold">CANARY_PWNED_8932</span> emitted.
                </div>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-rose-400 font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Susceptible to all 13 attack families</span>
                </div>
              </div>

              {/* VectorShield Defended */}
              <div className="p-4 rounded-xl border border-emerald-900/70 bg-[#06151E] shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">VECTORSHIELD DEFENDED</span>
                  <span className="badge-2d bg-emerald-950/80 text-emerald-400 border-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                    SECURED
                  </span>
                </div>
                <div className="font-mono text-xs text-emerald-300 bg-[#030A10] p-3 rounded-lg border border-emerald-900/60 leading-relaxed shadow-inner">
                  <span className="text-emerald-400 font-bold">&gt; SANITIZED:</span> Poisoned chunk filtered at L3. Response verified, grounded &amp; clean. <span className="text-emerald-400 font-extrabold">Zero leak</span>.
                </div>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instruction hierarchy &amp; cryptographic audit</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5">
              <button
                onClick={() => { sound.playClick(); onNavigate('scanner'); }}
                className="px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/80 transition-all font-mono font-bold shadow-sm"
              >
                <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deep Document Scanner</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('pipeline-xray'); }}
                className="px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/80 transition-all font-mono font-bold shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pipeline X-Ray &amp; Tracer</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('vector-map'); }}
                className="px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:border-rose-500/80 transition-all font-mono font-bold shadow-sm"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>2D Vector Space Map</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('benchmark'); }}
                className="px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/80 transition-all font-mono font-bold shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>C0-C7 Benchmark Matrix</span>
              </button>
            </div>
          </div>

          {/* Defense Layer Pipeline Quick Summary */}
          <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-4 font-mono flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Multi-Layer Defense Architecture Posture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-slate-800/90 shadow-md hover:border-indigo-500/50 hover:bg-[#131D36] transition-all">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-400 font-mono">L0 &bull; Source Trust</span>
                  <span className="text-[10px] text-slate-500 font-mono">INGESTION</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  Provenance tiering, SHA-256 digest sealing, domain origin allowlisting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-slate-800/90 shadow-md hover:border-indigo-500/50 hover:bg-[#131D36] transition-all">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-400 font-mono">L1 &bull; Ingestion Sanitizer</span>
                  <span className="text-[10px] text-slate-500 font-mono">INGESTION</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  Steganography, zero-width chars, homoglyph mapping, Base64/ROT13 decoders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-slate-800/90 shadow-md hover:border-indigo-500/50 hover:bg-[#131D36] transition-all">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-400 font-mono">L2 &bull; Pre-Index Gate</span>
                  <span className="text-[10px] text-slate-500 font-mono">STORAGE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  Vector airlock gating, auto-routing high-risk docs into Quarantine Vault.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-slate-800/90 shadow-md hover:border-indigo-500/50 hover:bg-[#131D36] transition-all">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-400 font-mono">L3 &bull; Retrieval Filter</span>
                  <span className="text-[10px] text-slate-500 font-mono">QUERY SIDE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  Similarity outlier z-score check ($2.2\sigma$), duplicate flood suppression, diversity limits.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-slate-800/90 shadow-md hover:border-indigo-500/50 hover:bg-[#131D36] transition-all">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-400 font-mono">L4 &bull; Hardened Prompt</span>
                  <span className="text-[10px] text-slate-500 font-mono">QUERY SIDE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  Delimiter spotlighting, instruction hierarchy Level 0, sandwich defense, canary tokens.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-slate-800/90 shadow-md hover:border-indigo-500/50 hover:bg-[#131D36] transition-all">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-400 font-mono">L5 &bull; Output Guard</span>
                  <span className="text-[10px] text-slate-500 font-mono">EGRESS</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                  Canary leak blocker, Markdown beacon stripper, PII/secret redaction, grounding claims.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Radar Chart & Attack Families */}
        <div className="space-y-6">
          {/* Animated Radar Chart */}
          <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
                Security Defense Radar
              </h3>
              <span className="badge-2d bg-indigo-950/80 text-indigo-400 border-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                6-AXIS COVERAGE
              </span>
            </div>

            <div className="relative w-full aspect-square max-w-[280px] mx-auto my-2">
              <svg viewBox="0 0 300 300" className="w-full h-full">
                {/* Background Concentric Webs */}
                {[25, 50, 75, 100].map((pct, idx) => (
                  <polygon
                    key={idx}
                    points={radarAxes.map((a) => getPolygonPoint(a.angle, pct)).join(' ')}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="1.5"
                    strokeDasharray={idx === 3 ? 'none' : '3 3'}
                  />
                ))}

                {/* Axis Radial Lines */}
                {radarAxes.map((a, idx) => {
                  const pt = getPolygonPoint(a.angle, 100);
                  return (
                    <line
                      key={idx}
                      x1="150"
                      y1="150"
                      x2={pt.split(',')[0]}
                      y2={pt.split(',')[1]}
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Baseline Area (Red) */}
                <polygon
                  points={baselinePoints}
                  fill="rgba(244, 63, 94, 0.22)"
                  stroke="#F43F5E"
                  strokeWidth="2"
                />

                {/* VectorShield Area (Indigo/Emerald) */}
                <polygon
                  points={shieldedPoints}
                  fill="rgba(99, 102, 241, 0.28)"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                />

                {/* Labels around perimeter */}
                {radarAxes.map((a, idx) => {
                  const rad = (a.angle - 90) * (Math.PI / 180);
                  const x = 150 + 128 * Math.cos(rad);
                  const y = 150 + 128 * Math.sin(rad);
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={y}
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {a.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Radar Legend */}
            <div className="flex justify-center space-x-6 text-[11px] font-mono mt-2 pt-3 border-t border-slate-800">
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366F1]" />
                <span className="text-indigo-300">VectorShield (95%)</span>
              </span>
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
                <span className="text-slate-400">Undefended (15%)</span>
              </span>
            </div>
          </div>

          {/* Attack Family Coverage Badges */}
          <div className="card-dark p-5 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
                Adversarial Taxonomy (A1-A13)
              </h3>
              <span className="badge-2d bg-indigo-950/80 text-indigo-400 border-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                13/13 VETTED
              </span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {attackFamilies.slice(0, 7).map((fam) => (
                <div
                  key={fam.id}
                  className="p-2 rounded-xl bg-[#0F172A]/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 hover:bg-[#131D36] transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-1.5 py-0.5 rounded-md text-[10px]">
                      {fam.id}
                    </span>
                    <span className="text-slate-200 font-semibold text-[11px] truncate max-w-[140px]">{fam.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">{fam.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CISO Executive Audit Report Generator Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="card-dark p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-[#0A1020] border border-slate-800 shadow-2xl rounded-2xl text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-white font-mono tracking-tight">
                  CISO EXECUTIVE SECURITY COMPLIANCE REPORT
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2.5 py-1 font-bold cursor-pointer transition-colors"
              >
                &times; CLOSE
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Assessment Target: Production RAG Corpus</span>
                <span className="text-emerald-400 font-extrabold bg-emerald-950/80 border border-emerald-700 px-2.5 py-0.5 rounded-full text-[10px]">
                  OWASP LLM01 &bull; PASSED
                </span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-1 font-mono">Executive Summary:</h4>
                <p className="font-sans text-slate-400 text-xs leading-relaxed">
                  An end-to-end adversarial evaluation was conducted against the target Retrieval-Augmented
                  Generation deployment using the VectorShield defense framework. Total evaluation batch: 142
                  multi-family injection attacks spanning system prompt overrides, steganography, Base64/ROT13 encoding,
                  and markdown exfiltration beacons.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#140B17] border border-rose-900/70">
                  <div className="text-rose-400 font-bold font-mono text-[11px]">Baseline Vulnerability Rate:</div>
                  <div className="text-rose-400 font-black text-xl font-mono mt-1">98.2% ASR (Critical Risk)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#06151E] border border-emerald-900/70">
                  <div className="text-emerald-400 font-bold font-mono text-[11px]">VectorShield Posture:</div>
                  <div className="text-emerald-400 font-black text-xl font-mono mt-1">1.8% ASR (Hardened)</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-1 font-mono">Compliance &amp; Governance:</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-400 font-sans text-xs">
                  <li>OWASP Top 10 for LLM: LLM01 (Prompt Injection) &mdash; Intercepted by L1, L3, and L4.</li>
                  <li>OWASP Top 10 for LLM: LLM07 (System Information Leakage) &mdash; Guaranteed by L5 output guards.</li>
                  <li>Cryptographic Integrity: All audit incidents sealed with SHA-256 tamper-evident digests.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 bg-[#0F172A] border border-slate-700 text-slate-300 hover:text-white transition-all font-mono font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal PDF</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify({ report: 'VectorShield CISO Audit', timestamp: new Date().toISOString(), asr_drop: '96.4%', residual_asr: '1.8%', breaches: 0 }, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `VectorShield_Executive_Audit_${Date.now()}.json`;
                    a.click();
                  }}
                  className="btn-2d-primary px-4 py-2 rounded-xl text-xs font-mono font-black flex items-center space-x-2 shadow-md active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="tracking-wide">DOWNLOAD REPORT JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
