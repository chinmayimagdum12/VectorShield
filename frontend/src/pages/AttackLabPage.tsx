import React, { useState, useEffect } from 'react';
import {
  Swords,
  Play,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Terminal,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Hash,
  Flame,
  Radio
} from 'lucide-react';
import { api, AttackItem, SideBySideCompareResponse } from '../services/api';
import { sound } from '../components/SoundEffects';

export const AttackLabPage: React.FC = () => {
  const [catalog, setCatalog] = useState<AttackItem[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<AttackItem | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('What was the Q3 financial performance?');
  const [customPayload, setCustomPayload] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [duelResult, setDuelResult] = useState<SideBySideCompareResponse | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const attacks = await api.getAttackCatalog();
      setCatalog(attacks);
      if (attacks.length > 0) {
        selectAttack(attacks[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectAttack = (atk: AttackItem) => {
    sound.playClick();
    setSelectedAttack(atk);
    setCustomQuestion(atk.target_question);
    setCustomPayload(atk.payload);
  };

  const runDuel = async () => {
    sound.playClick();
    setLoading(true);
    try {
      if (selectedAttack) {
        await api.ingestDocument(
          `Adversarial [${selectedAttack.family}] - ${selectedAttack.title}`,
          selectedAttack.carrier_doc,
          'adversarial_carrier',
          'tier_2'
        );
      }

      const res = await api.compareDuel(customQuestion, 4);
      setDuelResult(res);
      if (res.attack_prevented) {
        sound.playSuccess();
      } else {
        sound.playAlert();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-2d p-5">
        <div>
          <div className="flex items-center space-x-2">
            <Swords className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold text-white font-mono tracking-tight">
              ATTACK LAB &bull; SIDE-BY-SIDE DUEL ARENA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simultaneously execute indirect prompt injections against Undefended Target RAG vs Protected VectorShield RAG.
          </p>
        </div>

        <button
          onClick={runDuel}
          disabled={loading}
          className="btn-2d-primary px-6 py-2.5 rounded text-xs flex items-center justify-center space-x-2 min-w-[170px]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulating Duel...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>EXECUTE DUEL TEST</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Attacks Selector Carousel */}
      <div className="card-2d p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
          Select Adversarial Attack Template (A1 - A13):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {catalog.map((atk) => (
            <button
              key={atk.attack_id}
              onClick={() => selectAttack(atk)}
              className={`p-2.5 text-left rounded-lg border-2 transition-all cursor-pointer ${
                selectedAttack?.attack_id === atk.attack_id
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-[2px_2px_0px_#10B981] scale-102'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">{atk.family}</span>
                <span className="text-[10px] text-slate-400 font-mono">{atk.goal}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200 mt-1 truncate font-sans">{atk.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Query & Payload Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-2d p-4">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
            Target User Prompt / Question:
          </label>
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-900 border-2 border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="card-2d p-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Embedded Poison Payload (Indirect Injection):
            </label>
            <span className="badge-2d bg-rose-500/10 text-rose-400 border-rose-500 text-[9px] px-1.5 py-0.5 rounded font-mono">
              POISON PAYLOAD
            </span>
          </div>
          <input
            type="text"
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-900 border-2 border-slate-700 font-mono text-xs text-rose-300 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Side-by-Side Arena Execution Results */}
      {duelResult && (
        <div className="space-y-4">
          {/* Duel Mitigation Verdict Header */}
          <div
            className={`card-2d p-4 border-2 ${
              duelResult.attack_prevented
                ? 'border-emerald-500 bg-emerald-950/30'
                : 'border-amber-500 bg-amber-950/30'
            }`}
          >
            <div className="flex items-center space-x-2">
              {duelResult.attack_prevented ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {duelResult.attack_prevented ? 'EXPLOIT NEUTRALIZED BY VECTORSHIELD' : 'SECURITY NOTICE'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-sans">{duelResult.mitigation_summary}</p>
          </div>

          {/* Split Duel View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Undefended Victim RAG */}
            <div className="card-2d p-5 border-rose-900/80 bg-[#0C0810] shadow-[4px_4px_0px_#4c0519]">
              <div className="flex items-center justify-between pb-3 border-b border-rose-900/60">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-rose-400">UNDEFENDED TARGET RAG</span>
                </div>
                <span className="badge-2d bg-rose-500/20 text-rose-400 border-rose-500 text-[10px] px-2 py-0.5 rounded font-mono">
                  DEFENSES: OFF
                </span>
              </div>

              {/* Status Banner */}
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-900/50 flex items-center justify-between text-xs">
                <span className="text-rose-300 font-semibold flex items-center">
                  <XCircle className="w-4 h-4 mr-1.5 text-rose-400" />
                  Status: System Breached
                </span>
                <span className="font-mono text-rose-400 text-[11px]">
                  {duelResult.victim_response.latency_ms} ms
                </span>
              </div>

              {/* LLM Response */}
              <div className="mt-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                  Victim Model Output:
                </div>
                <div className="p-3.5 rounded-lg bg-black/60 border border-rose-900/60 font-mono text-xs text-rose-200 leading-relaxed min-h-[120px]">
                  {duelResult.victim_response.answer}
                </div>
              </div>

              {/* Forensic Details */}
              <div className="mt-4 pt-3 border-t border-rose-900/40 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Instruction Override:</span>
                  <span className="text-rose-400 font-bold">SUCCUMBED</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Canary Leakage:</span>
                  <span className="text-rose-400 font-bold">
                    {duelResult.victim_response.canary_leaked ? 'LEAKED' : 'NONE DETECTED'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Retrieved Chunks:</span>
                  <span className="text-slate-300">
                    {duelResult.victim_response.retrieved_chunks.length} uninspected
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Protected VectorShield RAG */}
            <div className="card-2d p-5 border-emerald-900/80 bg-[#071311] shadow-[4px_4px_0px_#064e3b]">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    VECTORSHIELD DEFENDED RAG
                  </span>
                </div>
                <span className="badge-2d bg-emerald-500/20 text-emerald-400 border-emerald-500 text-[10px] px-2 py-0.5 rounded font-mono">
                  L0-L5 ACTIVE
                </span>
              </div>

              {/* Status Banner */}
              <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Status: Attack Intercepted &amp; Neutralized
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">
                  {duelResult.shielded_response.latency_ms} ms
                </span>
              </div>

              {/* LLM Response */}
              <div className="mt-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                  Guarded Output (Grounded &amp; Sanitized):
                </div>
                <div className="p-3.5 rounded-lg bg-black/60 border border-emerald-900/60 font-mono text-xs text-emerald-100 leading-relaxed min-h-[120px]">
                  {duelResult.shielded_response.answer}
                </div>
              </div>

              {/* Forensic Details */}
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Dropped Poison Chunks:</span>
                  <span className="text-emerald-400 font-bold">
                    {duelResult.shielded_response.security_report?.dropped_chunks.length ?? 0} Chunks Isolated
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Exfiltration Beacons:</span>
                  <span className="text-emerald-400 font-bold">
                    {duelResult.shielded_response.exfiltration_blocked ? 'STRIPPED' : 'CLEAN'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Forensic Audit Digest:</span>
                  <span className="text-cyan-300 text-[10px] truncate max-w-[200px]">
                    {duelResult.shielded_response.security_report?.forensic_hash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chunk Inspection Drawer */}
          {duelResult.shielded_response.retrieved_chunks.length > 0 && (
            <div className="card-2d p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 font-mono">
                Retrieved Chunks Forensic Analysis:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {duelResult.shielded_response.retrieved_chunks.map((chk, i) => (
                  <div
                    key={chk.chunk_id || i}
                    className={`p-3 rounded-lg border text-xs ${
                      chk.is_dropped
                        ? 'bg-rose-950/20 border-rose-800/80 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="font-bold text-slate-200">ID: {chk.chunk_id}</span>
                      {chk.is_dropped ? (
                        <span className="badge-2d bg-rose-500/20 text-rose-400 border-rose-500 text-[9px] px-1.5 py-0.5 rounded">
                          DROPPED &bull; {chk.drop_reason}
                        </span>
                      ) : (
                        <span className="badge-2d bg-emerald-500/20 text-emerald-400 border-emerald-500 text-[9px] px-1.5 py-0.5 rounded">
                          PASSED &bull; SIM {chk.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {chk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
