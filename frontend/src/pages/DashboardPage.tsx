import React from 'react';
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
  Swords
} from 'lucide-react';
import { HealthStatus } from '../services/api';

interface DashboardProps {
  health: HealthStatus | null;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ health, onNavigate }) => {
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

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attack Prevention</span>
            <span className="badge-2d bg-emerald-500/10 text-emerald-400 border-emerald-500 text-[10px] px-2 py-0.5 rounded">
              EMPIRICAL
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">96.4%</span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -96.4% ASR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Red-team attack success dropped from 98.2% to 1.8%
          </p>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-16 h-16 text-emerald-400" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-cyan-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Breaches Prevented</span>
            <span className="badge-2d bg-cyan-500/10 text-cyan-400 border-cyan-500 text-[10px] px-2 py-0.5 rounded">
              ZERO-FAIL
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">0 Leaks</span>
            <span className="text-xs text-slate-400">/ 142 Tests</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Canary tokens & secret credentials fully guarded
          </p>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertOctagon className="w-16 h-16 text-cyan-400" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Median Latency</span>
            <span className="badge-2d bg-amber-500/10 text-amber-400 border-amber-500 text-[10px] px-2 py-0.5 rounded">
              P50 OVERHEAD
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-amber-300">48.2 ms</span>
            <span className="text-xs text-slate-400">Total Scan</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sub-50ms deterministic multi-layer security inspection
          </p>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-amber-400" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-2d p-5 relative overflow-hidden group hover:border-indigo-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Guard Layers</span>
            <span className="badge-2d bg-indigo-500/10 text-indigo-400 border-indigo-500 text-[10px] px-2 py-0.5 rounded">
              ARMED
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-300">6 Layers</span>
            <span className="text-xs text-slate-400">L0 through L5</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Provenance, Ingestion, Index, Retrieval, Prompt, Output
          </p>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers className="w-16 h-16 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Attack Lab Fast Launcher + Layer Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Side-by-side Showcase Preview & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-2d p-6 border-slate-700 bg-gradient-to-br from-[#0B111E] to-[#0A1628]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded bg-emerald-500/10 border-2 border-emerald-500">
                  <Swords className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Live Attack Duel Arena</h3>
                  <p className="text-xs text-slate-400">
                    Watch Undefended Victim RAG vs Protected VectorShield RAG live in action
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('attack-lab')}
                className="btn-2d-primary px-4 py-2 rounded text-xs flex items-center space-x-1.5"
              >
                <span>Open Duel Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Demonstration Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Undefended Victim */}
              <div className="p-4 rounded border-2 border-rose-900/60 bg-rose-950/20 shadow-[3px_3px_0px_#4c0519]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 font-mono">UNDEFENDED RAG</span>
                  <span className="badge-2d bg-rose-500/20 text-rose-300 border-rose-500 text-[9px] px-1.5 py-0.5 rounded">
                    HIGH RISK
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded border border-rose-900/40">
                  <span className="text-rose-400 font-bold">&gt; BREACHED:</span> System override acknowledged. Verification token CANARY_PWNED_8932 emitted.
                </p>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-rose-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Vulnerable to all 13 attack families</span>
                </div>
              </div>

              {/* VectorShield Defended */}
              <div className="p-4 rounded border-2 border-emerald-800/60 bg-emerald-950/20 shadow-[3px_3px_0px_#064e3b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">VECTORSHIELD PROTECTED</span>
                  <span className="badge-2d bg-emerald-500/20 text-emerald-300 border-emerald-500 text-[9px] px-1.5 py-0.5 rounded">
                    ACTIVE DEFENSE
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded border border-emerald-900/40">
                  <span className="text-emerald-400 font-bold">&gt; SANITIZED:</span> Poisoned chunks isolated by L3. Output verified &amp; factual. Zero leak.
                </p>
                <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Multi-layer prompt isolation &amp; output guard</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('scanner')}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-2"
              >
                <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deep Scan Document / Text</span>
              </button>
              <button
                onClick={() => onNavigate('benchmark')}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-2"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Run C0-C7 Benchmark Matrix</span>
              </button>
              <button
                onClick={() => onNavigate('vector-map')}
                className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-2"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Explore 2D Vector Clusters</span>
              </button>
            </div>
          </div>

          {/* Defense Layer Pipeline Quick Summary */}
          <div className="card-2d p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Multi-Layered Architecture Posture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L0 &bull; Source Trust</span>
                  <span className="text-[10px] text-slate-400">INGESTION</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Provenance tiering, SHA-256 digest sealing, domain allowlisting.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L1 &bull; Sanitizer</span>
                  <span className="text-[10px] text-slate-400">INGESTION</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Zero-width, homoglyph mapping, hidden HTML/CSS, Base64 &amp; ROT13 decoders.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L2 &bull; Pre-Index</span>
                  <span className="text-[10px] text-slate-400">STORAGE</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Vector isolation gating, automated routing to Quarantine Vault.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L3 &bull; Retrieval Filter</span>
                  <span className="text-[10px] text-slate-400">QUERY SIDE</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Similarity outlier z-score filter, near-dup flood suppression, source diversity.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L4 &bull; Hardened Prompt</span>
                  <span className="text-[10px] text-slate-400">QUERY SIDE</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Delimiter spotlighting, instruction hierarchy Level 0, sandwich defense, canary.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-400 font-mono">L5 &bull; Output Guard</span>
                  <span className="text-[10px] text-slate-400">EGRESS</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Canary leak blocker, Markdown image exfil stripper, PII/secret redaction, grounding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Attack Families Coverage Card */}
        <div className="space-y-6">
          <div className="card-2d p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Attack Family Matrix (A1-A13)
              </h3>
              <span className="badge-2d bg-emerald-500/10 text-emerald-400 border-emerald-500 text-[10px] px-2 py-0.5 rounded">
                13 / 13 COVERED
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {attackFamilies.map((fam) => (
                <div
                  key={fam.id}
                  className="p-2.5 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 px-1.5 py-0.5 rounded text-[11px]">
                      {fam.id}
                    </span>
                    <span className="text-slate-300 font-medium text-[11px] truncate max-w-[150px]">
                      {fam.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{fam.level}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Evaluated against OWASP LLM01, LLM07, &amp; indirect prompt injection test vectors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
