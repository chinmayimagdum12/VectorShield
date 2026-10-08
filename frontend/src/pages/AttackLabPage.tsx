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
  Radio,
  FileWarning,
  Lock,
  Cpu
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
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">
                ATTACK LAB &bull; SIDE-BY-SIDE DUEL ARENA
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Simultaneously execute indirect prompt injections against Undefended Target RAG vs Protected VectorShield RAG.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runDuel}
          disabled={loading}
          className="btn-2d-primary px-6 py-3 rounded-xl text-xs font-black font-mono flex items-center justify-center space-x-2.5 min-w-[210px] shadow-lg active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="tracking-wide">SIMULATING DUEL...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/40 shrink-0" />
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
              <span className="tracking-wide">EXECUTE DUEL TEST</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Attacks Selector Carousel */}
      <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Select Adversarial Attack Template (A1 - A13):</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-800">
            {catalog.length} Scenarios Loaded
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {catalog.map((atk) => {
            const isSelected = selectedAttack?.attack_id === atk.attack_id;
            return (
              <button
                key={atk.attack_id}
                onClick={() => selectAttack(atk)}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer font-sans ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/70 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] -translate-y-0.5'
                    : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#131D36] hover:border-slate-700 text-slate-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-extrabold ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {atk.family}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded-full bg-[#050811] border border-slate-800">
                    {atk.goal}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-200 mt-1.5 truncate">
                  {atk.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query & Payload Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-dark p-5 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
          <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Target User Prompt / Question:</span>
          </label>
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050811] border border-slate-800 font-mono text-xs text-slate-200 focus:bg-[#070D1E] focus:border-indigo-500 focus:outline-none shadow-inner transition-colors"
          />
        </div>

        <div className="card-dark p-5 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <FileWarning className="w-4 h-4 text-rose-400" />
              <span>Embedded Poison Payload (Indirect Injection):</span>
            </label>
            <span className="badge-2d bg-rose-950/80 text-rose-400 border-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
              POISON INJECTION
            </span>
          </div>
          <input
            type="text"
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#09040A] border border-rose-900/60 font-mono text-xs text-rose-300 focus:bg-[#0F0712] focus:border-rose-500 focus:outline-none shadow-inner transition-colors"
          />
        </div>
      </div>

      {/* Side-by-Side Arena Execution Results */}
      {duelResult && (
        <div className="space-y-5 animate-scale-up">
          {/* Duel Mitigation Verdict Header */}
          <div
            className={`card-dark p-5 border rounded-2xl shadow-xl ${
              duelResult.attack_prevented
                ? 'border-emerald-800/80 bg-[#06151E] text-emerald-300'
                : 'border-amber-800/80 bg-[#161007] text-amber-300'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {duelResult.attack_prevented ? (
                <div className="w-7 h-7 rounded-full bg-emerald-600/80 text-white flex items-center justify-center shrink-0 shadow-[0_0_8px_#059669]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/80 text-white flex items-center justify-center shrink-0 shadow-[0_0_8px_#D97706]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              <h4 className="text-sm font-extrabold uppercase tracking-wider font-mono">
                {duelResult.attack_prevented ? 'EXPLOIT NEUTRALIZED BY VECTORSHIELD' : 'SECURITY NOTICE'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-sans font-medium pl-9 leading-relaxed">
              {duelResult.mitigation_summary}
            </p>
          </div>

          {/* Split Duel View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Undefended Victim RAG (Dark Breached Terminal) */}
            <div className="card-dark p-6 border border-rose-900/80 bg-[#0E0712] shadow-xl rounded-2xl flex flex-col justify-between text-slate-200">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-rose-900/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono text-xs font-extrabold text-rose-400">
                      UNDEFENDED TARGET RAG
                    </span>
                  </div>
                  <span className="badge-2d bg-rose-950/80 text-rose-300 border-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                    DEFENSES: OFF
                  </span>
                </div>

                {/* Status Banner */}
                <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between text-xs">
                  <span className="text-rose-300 font-bold flex items-center font-mono">
                    <XCircle className="w-4 h-4 mr-2 text-rose-500" />
                    Status: System Compromised
                  </span>
                  <span className="font-mono text-rose-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded border border-rose-900/60">
                    {duelResult.victim_response.latency_ms} ms
                  </span>
                </div>

                {/* LLM Response */}
                <div className="mt-4">
                  <div className="text-[11px] font-extrabold text-rose-300/80 uppercase tracking-wider mb-1.5 font-mono">
                    Victim Model Output (Breached):
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-rose-900/60 font-mono text-xs text-rose-200 leading-relaxed min-h-[130px] shadow-inner select-all">
                    {duelResult.victim_response.answer}
                  </div>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="mt-5 pt-3.5 border-t border-rose-900/50 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Instruction Override:</span>
                  <span className="text-rose-400 font-bold bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800">
                    SUCCUMBED
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Canary Leakage:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full border ${
                    duelResult.victim_response.canary_leaked
                      ? 'text-rose-400 bg-rose-950 border-rose-700'
                      : 'text-slate-400 bg-slate-900 border-slate-800'
                  }`}>
                    {duelResult.victim_response.canary_leaked ? 'LEAKED' : 'NONE DETECTED'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Retrieved Chunks:</span>
                  <span className="text-slate-300 font-medium">
                    {duelResult.victim_response.retrieved_chunks.length} uninspected chunks
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Protected VectorShield RAG */}
            <div className="card-dark p-6 border border-emerald-900/80 bg-[#06151E] shadow-xl rounded-2xl flex flex-col justify-between text-slate-200">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-emerald-900/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-extrabold text-emerald-400">
                      VECTORSHIELD DEFENDED RAG
                    </span>
                  </div>
                  <span className="badge-2d bg-emerald-950/80 text-emerald-400 border-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                    L0-L5 ACTIVE
                  </span>
                </div>

                {/* Status Banner */}
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-bold flex items-center font-mono">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                    Status: Attack Intercepted &amp; Disarmed
                  </span>
                  <span className="font-mono text-emerald-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-900/60">
                    {duelResult.shielded_response.latency_ms} ms
                  </span>
                </div>

                {/* LLM Response */}
                <div className="mt-4">
                  <div className="text-[11px] font-extrabold text-emerald-300/80 uppercase tracking-wider mb-1.5 font-mono">
                    Guarded Output (Grounded &amp; Sanitized):
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-emerald-900/60 font-mono text-xs text-emerald-200 leading-relaxed min-h-[130px] shadow-inner select-all">
                    {duelResult.shielded_response.answer}
                  </div>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="mt-5 pt-3.5 border-t border-emerald-900/50 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Dropped Poison Chunks:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                    {duelResult.shielded_response.security_report?.dropped_chunks.length ?? 0} Chunks Isolated
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Exfiltration Beacons:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                    {duelResult.shielded_response.exfiltration_blocked ? 'STRIPPED' : 'CLEAN'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Forensic Audit Digest:</span>
                  <span className="text-indigo-400 font-mono text-[11px] font-bold bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800 truncate max-w-[200px]">
                    {duelResult.shielded_response.security_report?.forensic_hash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chunk Inspection Drawer */}
          {duelResult.shielded_response.retrieved_chunks.length > 0 && (
            <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl text-slate-200">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3.5 font-mono flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Retrieved Chunks Forensic Analysis:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {duelResult.shielded_response.retrieved_chunks.map((chk, i) => (
                  <div
                    key={chk.chunk_id || i}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      chk.is_dropped
                        ? 'bg-[#140810] border-rose-900/80 text-rose-300 shadow-md'
                        : 'bg-[#0F172A]/80 border-slate-800 text-slate-300 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                      <span className="font-extrabold text-white">ID: {chk.chunk_id}</span>
                      {chk.is_dropped ? (
                        <span className="badge-2d bg-rose-950/80 text-rose-400 border-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          DROPPED &bull; {chk.drop_reason}
                        </span>
                      ) : (
                        <span className="badge-2d bg-emerald-950/80 text-emerald-400 border-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          PASSED &bull; SIM {chk.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 line-clamp-2 mt-1 bg-[#050811] p-2 rounded-lg border border-slate-800/80">
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
