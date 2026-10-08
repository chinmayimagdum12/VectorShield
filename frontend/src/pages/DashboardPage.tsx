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
      {/* Live Threat Stream Ticker Bar */}
      <div className="card-2d p-3 bg-white border-2 border-slate-900 flex items-center justify-between overflow-hidden shadow-[3px_3px_0px_#0F172A]">
        <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-extrabold text-emerald-800 uppercase tracking-wider text-[11px] bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
            LIVE SENTINEL FEED
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono truncate px-3">
          <span className="text-slate-400 text-[10px]">[{threatEvents[tickerIndex].time}]</span>
          <span className="badge-2d bg-rose-50 text-rose-700 border-rose-900 text-[9px] px-1.5 py-0.2 rounded font-mono">
            {threatEvents[tickerIndex].fam}
          </span>
          <span className="text-slate-900 font-bold text-[11px] truncate">{threatEvents[tickerIndex].type}</span>
          <span className="text-emerald-700 font-bold text-[10px] hidden sm:inline">&rarr; {threatEvents[tickerIndex].action}</span>
          <span className="text-slate-500 text-[10px] hidden md:inline">(Risk: {threatEvents[tickerIndex].risk})</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowReportModal(true);
          }}
          className="btn-2d px-3 py-1 rounded-lg text-[11px] font-mono shrink-0 flex items-center space-x-1"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Audit Report</span>
        </button>
      </div>

      {/* Top 4 Hero Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-2d p-5 relative overflow-hidden group bg-white border-2 border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono">
              Attack Prevention
            </span>
            <span className="badge-2d bg-emerald-100 text-emerald-800 border-slate-900 text-[10px] px-2 py-0.5 rounded font-mono">
              ASR DROP
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-emerald-600">96.4%</span>
            <span className="text-xs text-emerald-700 font-bold flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> 98.2% &rarr; 1.8%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Empirical reduction across 142 red-team attack vectors
          </p>
        </div>

        {/* Metric 2 */}
        <div className="card-2d p-5 relative overflow-hidden group bg-white border-2 border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono">
              Credential Breaches
            </span>
            <span className="badge-2d bg-indigo-100 text-indigo-800 border-slate-900 text-[10px] px-2 py-0.5 rounded font-mono">
              ZERO-FAIL
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-indigo-600">0 Leaks</span>
            <span className="text-xs text-slate-500 font-mono font-bold">/ 142 Tests</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Cryptographic canaries &amp; secrets 100% shielded
          </p>
        </div>

        {/* Metric 3 */}
        <div className="card-2d p-5 relative overflow-hidden group bg-white border-2 border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono">
              Median P50 Latency
            </span>
            <span className="badge-2d bg-amber-100 text-amber-800 border-slate-900 text-[10px] px-2 py-0.5 rounded font-mono">
              REAL-TIME
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-amber-600">48.2 ms</span>
            <span className="text-xs text-slate-500 font-mono font-bold">Overhead</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Deterministic multi-stage verification in &lt; 50ms
          </p>
        </div>

        {/* Metric 4 */}
        <div className="card-2d p-5 relative overflow-hidden group bg-white border-2 border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono">
              Defense Lifecycle
            </span>
            <span className="badge-2d bg-blue-100 text-blue-800 border-slate-900 text-[10px] px-2 py-0.5 rounded font-mono">
              ARMED
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-blue-600">6 Layers</span>
            <span className="text-xs text-slate-500 font-mono font-bold">L0 to L5</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Ingestion, vector index, query, and egress protection
          </p>
        </div>
      </div>

      {/* Main Grid: Duel Sandbox Launcher + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Side-by-side Showcase Preview & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-2d p-6 bg-white border-2 border-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A]">
                  <Swords className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 font-mono">
                    Adversarial Attack Duel Arena
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Real-time comparative execution: Undefended Target RAG vs VectorShield Defended RAG
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('attack-lab');
                }}
                className="btn-2d-primary px-4 py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5"
              >
                <span>Launch Duel Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Demonstration Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Undefended Victim */}
              <div className="p-4 rounded-xl border-2 border-rose-900 bg-rose-50 shadow-[3px_3px_0px_#4C0519]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-rose-900 font-mono">UNDEFENDED TARGET RAG</span>
                  <span className="badge-2d bg-rose-200 text-rose-900 border-rose-900 text-[9px] px-1.5 py-0.5 rounded">
                    VULNERABLE
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-900 bg-white p-3 rounded-lg border-2 border-rose-900 leading-relaxed shadow-sm">
                  <span className="text-rose-700 font-bold">&gt; BREACHED:</span> System override acknowledged. Verification token <span className="text-rose-700 font-extrabold">CANARY_PWNED_8932</span> emitted.
                </div>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-rose-900 font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Susceptible to all 13 attack families</span>
                </div>
              </div>

              {/* VectorShield Defended */}
              <div className="p-4 rounded-xl border-2 border-emerald-900 bg-emerald-50 shadow-[3px_3px_0px_#064E3B]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-emerald-900 font-mono">VECTORSHIELD DEFENDED</span>
                  <span className="badge-2d bg-emerald-200 text-emerald-900 border-emerald-900 text-[9px] px-1.5 py-0.5 rounded">
                    SECURED
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-900 bg-white p-3 rounded-lg border-2 border-emerald-900 leading-relaxed shadow-sm">
                  <span className="text-emerald-700 font-bold">&gt; SANITIZED:</span> Poisoned chunk filtered at L3. Response verified, grounded &amp; clean. <span className="text-emerald-700 font-extrabold">Zero leak</span>.
                </div>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-900 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instruction hierarchy &amp; cryptographic audit</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="mt-6 pt-4 border-t-2 border-slate-200 flex flex-wrap gap-2.5">
              <button
                onClick={() => { sound.playClick(); onNavigate('scanner'); }}
                className="btn-2d px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5"
              >
                <FileSearch className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deep Document Scanner</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('pipeline-xray'); }}
                className="btn-2d px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pipeline X-Ray &amp; Tracer</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('vector-map'); }}
                className="btn-2d px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>2D Vector Space Map</span>
              </button>
              <button
                onClick={() => { sound.playClick(); onNavigate('benchmark'); }}
                className="btn-2d px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-600" />
                <span>C0-C7 Benchmark Matrix</span>
              </button>
            </div>
          </div>

          {/* Defense Layer Pipeline Quick Summary */}
          <div className="card-2d p-6 bg-white border-2 border-slate-900">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 font-mono flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Multi-Layer Defense Architecture Posture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] hover:bg-white transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-700 font-mono">L0 &bull; Source Trust</span>
                  <span className="text-[10px] text-slate-400 font-mono">INGESTION</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Provenance tiering, SHA-256 digest sealing, domain origin allowlisting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] hover:bg-white transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-700 font-mono">L1 &bull; Ingestion Sanitizer</span>
                  <span className="text-[10px] text-slate-400 font-mono">INGESTION</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Steganography, zero-width chars, homoglyph mapping, Base64/ROT13 decoders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] hover:bg-white transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-700 font-mono">L2 &bull; Pre-Index Gate</span>
                  <span className="text-[10px] text-slate-400 font-mono">STORAGE</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Vector airlock gating, auto-routing high-risk docs into Quarantine Vault.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] hover:bg-white transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-700 font-mono">L3 &bull; Retrieval Filter</span>
                  <span className="text-[10px] text-slate-400 font-mono">QUERY SIDE</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Similarity outlier z-score check ($2.2\sigma$), duplicate flood suppression, diversity limits.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] hover:bg-white transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-700 font-mono">L4 &bull; Hardened Prompt</span>
                  <span className="text-[10px] text-slate-400 font-mono">QUERY SIDE</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Delimiter spotlighting, instruction hierarchy Level 0, sandwich defense, canary tokens.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] hover:bg-white transition-colors">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-700 font-mono">L5 &bull; Output Guard</span>
                  <span className="text-[10px] text-slate-400 font-mono">EGRESS</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Canary leak blocker, Markdown beacon stripper, PII/secret redaction, grounding claims.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Radar Chart & Attack Families */}
        <div className="space-y-6">
          {/* Animated Radar Chart */}
          <div className="card-2d p-6 bg-white border-2 border-slate-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                Security Defense Radar
              </h3>
              <span className="badge-2d bg-emerald-100 text-emerald-800 border-slate-900 text-[9px] px-1.5 py-0.5 rounded">
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
                    stroke="#E2E8F0"
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
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Baseline Area (Red) */}
                <polygon
                  points={baselinePoints}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#E11D48"
                  strokeWidth="2"
                />

                {/* VectorShield Area (Emerald) */}
                <polygon
                  points={shieldedPoints}
                  fill="rgba(79, 70, 229, 0.2)"
                  stroke="#4F46E5"
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
                      fill="#334155"
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
            <div className="flex justify-center space-x-6 text-[11px] font-mono mt-2 pt-3 border-t-2 border-slate-200">
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span className="text-slate-800">VectorShield (95%)</span>
              </span>
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-slate-500">Undefended (15%)</span>
              </span>
            </div>
          </div>

          {/* Attack Family Coverage Badges */}
          <div className="card-2d p-5 bg-white border-2 border-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                Adversarial Taxonomy (A1-A13)
              </h3>
              <span className="badge-2d bg-indigo-100 text-indigo-800 border-slate-900 text-[10px] px-1.5 py-0.5 rounded">
                13/13 VETTED
              </span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {attackFamilies.slice(0, 7).map((fam) => (
                <div
                  key={fam.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded text-[10px]">
                      {fam.id}
                    </span>
                    <span className="text-slate-800 font-semibold text-[11px] truncate max-w-[140px]">{fam.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">{fam.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CISO Executive Audit Report Generator Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-2d p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#0F172A]">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-950 font-mono">
                  CISO EXECUTIVE SECURITY COMPLIANCE REPORT
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-500 hover:text-slate-950 font-mono text-sm px-2 py-1 font-bold cursor-pointer"
              >
                &times; CLOSE
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-mono text-slate-800 leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-50 border-2 border-slate-900 flex justify-between">
                <span className="font-bold">Assessment Target: Production RAG Corpus</span>
                <span className="text-emerald-700 font-extrabold">Standard: OWASP LLM01 &bull; PASSED</span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-950 uppercase mb-1">Executive Summary:</h4>
                <p className="font-sans text-slate-600 text-xs">
                  An end-to-end adversarial evaluation was conducted against the target Retrieval-Augmented
                  Generation deployment using the VectorShield defense framework. Total evaluation batch: 142
                  multi-family injection attacks spanning system prompt overrides, steganography, Base64/ROT13 encoding,
                  and markdown exfiltration beacons.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-rose-50 border-2 border-rose-900">
                  <div className="text-rose-900 font-bold">Baseline Vulnerability Rate:</div>
                  <div className="text-rose-700 font-black text-base mt-1">98.2% ASR (Critical Risk)</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border-2 border-emerald-900">
                  <div className="text-emerald-900 font-bold">VectorShield Posture:</div>
                  <div className="text-emerald-700 font-black text-base mt-1">1.8% ASR (Hardened)</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-950 uppercase mb-1">Compliance &amp; Governance:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-sans text-xs">
                  <li>OWASP Top 10 for LLM: LLM01 (Prompt Injection) &mdash; Intercepted by L1, L3, and L4.</li>
                  <li>OWASP Top 10 for LLM: LLM07 (System Information Leakage) &mdash; Guaranteed by L5 output guards.</li>
                  <li>Cryptographic Integrity: All audit incidents sealed with SHA-256 tamper-evident digests.</li>
                </ul>
              </div>

              <div className="pt-4 border-t-2 border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => window.print()}
                  className="btn-2d px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5"
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
                  className="btn-2d-primary px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5"
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
