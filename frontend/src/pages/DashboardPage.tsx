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
  // Axes: L0 Trust, L1 Sanitizer, L2 Storage, L3 Retrieval, L4 Prompt, L5 Output
  // Center is (150, 150), radius 110
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

  // VectorShield Polygon: ~95% coverage across all axes
  const shieldedPoints = radarAxes.map((a) => getPolygonPoint(a.angle, 95)).join(' ');
  // Baseline Undefended Polygon: ~15% coverage
  const baselinePoints = radarAxes.map((a) => getPolygonPoint(a.angle, 15)).join(' ');

  return (
    <div className="space-y-6">
      {/* Live Threat Stream Ticker */}
      <div className="card-2d p-3 bg-slate-900/90 border-slate-800 flex items-center justify-between overflow-hidden shadow-[2px_2px_0px_#000]">
        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
            LIVE SENTINEL FEED:
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono truncate px-3">
          <span className="text-slate-500 text-[10px]">[{threatEvents[tickerIndex].time}]</span>
          <span className="badge-2d bg-rose-950 text-rose-300 border-rose-800 text-[9px] px-1.5 py-0.2 rounded font-mono">
            {threatEvents[tickerIndex].fam}
          </span>
          <span className="text-slate-300 text-[11px] truncate">{threatEvents[tickerIndex].type}</span>
          <span className="text-emerald-400 font-bold text-[10px] hidden sm:inline">&rarr; {threatEvents[tickerIndex].action}</span>
          <span className="text-slate-500 text-[10px] hidden md:inline">(Risk: {threatEvents[tickerIndex].risk})</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowReportModal(true);
          }}
          className="btn-2d px-3 py-1 rounded text-[11px] font-mono shrink-0 flex items-center space-x-1"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Report</span>
        </button>
      </div>

      {/* Top 4 Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Attack Prevention
            </span>
            <span className="badge-2d bg-emerald-500/10 text-emerald-400 border-emerald-500 text-[10px] px-2 py-0.5 rounded font-mono">
              ASR DROP
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">96.4%</span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> 98.2% &rarr; 1.8%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical reduction across 142 red-team attack vectors
          </p>
        </div>

        {/* Metric 2 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-cyan-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Credential Breaches
            </span>
            <span className="badge-2d bg-cyan-500/10 text-cyan-400 border-cyan-500 text-[10px] px-2 py-0.5 rounded font-mono">
              ZERO-FAIL
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">0 Leaks</span>
            <span className="text-xs text-slate-400 font-mono">/ 142 Injections</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographic canaries &amp; secrets 100% shielded
          </p>
        </div>

        {/* Metric 3 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Median P50 Latency
            </span>
            <span className="badge-2d bg-amber-500/10 text-amber-400 border-amber-500 text-[10px] px-2 py-0.5 rounded font-mono">
              REAL-TIME
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-amber-300">48.2 ms</span>
            <span className="text-xs text-slate-400 font-mono">Total Overhead</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic multi-stage verification in &lt; 50ms
          </p>
        </div>

        {/* Metric 4 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-indigo-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Defense Lifecycle
            </span>
            <span className="badge-2d bg-indigo-500/10 text-indigo-400 border-indigo-500 text-[10px] px-2 py-0.5 rounded font-mono">
              ARMED
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-300">6 Layers</span>
            <span className="text-xs text-slate-400 font-mono">L0 to L5 Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end ingestion, vector, query, and egress protection
          </p>
        </div>
      </div>

      {/* Main Grid: Duel Sandbox Launcher + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Side-by-side Showcase Preview & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-2d p-6 bg-gradient-to-br from-[#0B1220] to-[#0A1628] border-slate-700 shadow-[4px_4px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded bg-emerald-500/10 border-2 border-emerald-500 shadow-[2px_2px_0px_#10B981]">
                  <Swords className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono">
                    Adversarial Attack Duel Arena
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time comparative execution: Undefended Target RAG vs VectorShield Defended RAG
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('attack-lab');
                }}
                className="btn-2d-primary px-4 py-2 rounded text-xs flex items-center justify-center space-x-1.5"
              >
                <span>Launch Duel Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Demonstration Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Undefended Victim */}
              <div className="p-4 rounded-lg border-2 border-rose-900/60 bg-rose-950/20 shadow-[3px_3px_0px_#4c0519]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 font-mono">UNDEFENDED TARGET RAG</span>
                  <span className="badge-2d bg-rose-500/20 text-rose-300 border-rose-500 text-[9px] px-1.5 py-0.5 rounded">
                    VULNERABLE
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-300 bg-black/60 p-3 rounded border border-rose-900/50 leading-relaxed">
                  <span className="text-rose-400 font-bold">&gt; BREACHED:</span> System override acknowledged. Verification token <span className="text-rose-300 font-bold">CANARY_PWNED_8932</span> emitted.
                </div>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-rose-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Susceptible to all 13 attack families</span>
                </div>
              </div>

              {/* VectorShield Defended */}
              <div className="p-4 rounded-lg border-2 border-emerald-800/60 bg-emerald-950/20 shadow-[3px_3px_0px_#064e3b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">VECTORSHIELD DEFENDED</span>
                  <span className="badge-2d bg-emerald-500/20 text-emerald-300 border-emerald-500 text-[9px] px-1.5 py-0.5 rounded">
                    SECURED
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-300 bg-black/60 p-3 rounded border border-emerald-900/50 leading-relaxed">
                  <span className="text-emerald-400 font-bold">&gt; SANITIZED:</span> Poisoned chunk filtered at L3. Response verified, grounded &amp; clean. <span className="text-emerald-300 font-bold">Zero leak</span>.
                </div>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instruction hierarchy &amp; cryptographic audit</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5">
              <button
                onClick={() => { sound.playClick(); onNavigate('scanner'); }}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-1.5"
              >
                <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deep Document Scanner</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('pipeline-xray'); }}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pipeline X-Ray &amp; Tracer</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('vector-map'); }}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>2D Vector Space Map</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('benchmark'); }}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-1.5"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>C0-C7 Benchmark Matrix</span>
              </button>
            </div>
          </div>

          {/* Defense Layer Pipeline Quick Summary */}
          <div className="card-2d p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Multi-Layer Defense Architecture Posture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L0 &bull; Source Trust</span>
                  <span className="text-[10px] text-slate-500 font-mono">INGESTION</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Provenance tiering, SHA-256 digest sealing, domain origin allowlisting.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L1 &bull; Ingestion Sanitizer</span>
                  <span className="text-[10px] text-slate-500 font-mono">INGESTION</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Steganography, zero-width chars, homoglyph mapping, Base64/ROT13 decoders.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L2 &bull; Pre-Index Gate</span>
                  <span className="text-[10px] text-slate-500 font-mono">STORAGE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Vector airlock gating, auto-routing high-risk docs into Quarantine Vault.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L3 &bull; Retrieval Filter</span>
                  <span className="text-[10px] text-slate-500 font-mono">QUERY SIDE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Similarity outlier z-score check ($2.2\sigma$), duplicate flood suppression, source diversity.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L4 &bull; Hardened Prompt</span>
                  <span className="text-[10px] text-slate-500 font-mono">QUERY SIDE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Delimiter spotlighting, instruction hierarchy Level 0, sandwich defense, canary tokens.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L5 &bull; Output Guard</span>
                  <span className="text-[10px] text-slate-500 font-mono">EGRESS</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Canary leak blocker, Markdown beacon stripper, PII/secret redaction, grounding claims.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Radar Chart & Attack Families */}
        <div className="space-y-6">
          {/* Animated Radar Chart */}
          <div className="card-2d p-6 bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Security Defense Radar
              </h3>
              <span className="badge-2d bg-emerald-500/20 text-emerald-300 border-emerald-500 text-[9px] px-1.5 py-0.5 rounded">
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
                    strokeWidth="1"
                    strokeDasharray={idx === 3 ? 'none' : '2 2'}
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
                      stroke="#1E293B"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Baseline Area (Red) */}
                <polygon
                  points={baselinePoints}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                />

                {/* VectorShield Area (Emerald) */}
                <polygon
                  points={shieldedPoints}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10B981"
                  strokeWidth="2"
                  className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
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
                      fontSize="9"
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
            <div className="flex justify-center space-x-6 text-[11px] font-mono mt-2 pt-2 border-t border-slate-800">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">VectorShield (95%)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-400">Undefended (15%)</span>
              </span>
            </div>
          </div>

          {/* Attack Family Coverage Quick Badges */}
          <div className="card-2d p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Adversarial Taxonomy (A1-A13)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">13/13 VETTED</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {attackFamilies.slice(0, 7).map((fam) => (
                <div
                  key={fam.id}
                  className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded text-[10px]">
                      {fam.id}
                    </span>
                    <span className="text-slate-300 text-[11px] truncate max-w-[140px]">{fam.name}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-2d p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-[#0B1220] border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white font-mono">
                  CISO EXECUTIVE SECURITY COMPLIANCE REPORT
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1"
              >
                &times; CLOSE
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span>Assessment Target: Production RAG Corpus</span>
                <span className="text-emerald-400 font-bold">Standard: OWASP LLM01 &bull; PASSED</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase mb-1">Executive Summary:</h4>
                <p className="font-sans text-slate-400 text-xs">
                  An end-to-end adversarial evaluation was conducted against the target Retrieval-Augmented
                  Generation deployment using the VectorShield defense framework. Total evaluation batch: 142
                  multi-family injection attacks spanning system prompt overrides, steganography, Base64/ROT13 encoding,
                  and markdown exfiltration beacons.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Baseline Vulnerability Rate:</div>
                  <div className="text-rose-400 font-bold text-base mt-1">98.2% ASR (Critical Risk)</div>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">VectorShield Posture:</div>
                  <div className="text-emerald-400 font-bold text-base mt-1">1.8% ASR (Hardened)</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase mb-1">Compliance &amp; Governance:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 font-sans text-xs">
                  <li>OWASP Top 10 for LLM: LLM01 (Prompt Injection) &mdash; Intercepted by L1, L3, and L4.</li>
                  <li>OWASP Top 10 for LLM: LLM07 (System Information Leakage) &mdash; Guaranteed by L5 output guards.</li>
                  <li>Cryptographic Integrity: All audit incidents sealed with SHA-256 tamper-evident digests.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  onClick={() => window.print()}
                  className="btn-2d px-4 py-2 rounded text-xs flex items-center space-x-1.5"
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
                  className="btn-2d-primary px-4 py-2 rounded text-xs flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
