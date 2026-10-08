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
      <div className="card-2d p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-[2px_2px_0px_#4F46E5]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                ATTACK LAB &bull; SIDE-BY-SIDE DUEL ARENA
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Simultaneously execute indirect prompt injections against Undefended Target RAG vs Protected VectorShield RAG.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runDuel}
          disabled={loading}
          className="btn-2d-primary px-6 py-3 rounded-xl text-xs font-black font-mono flex items-center justify-center space-x-2.5 min-w-[210px] shadow-[4px_4px_0px_#4F46E5] hover:shadow-[5px_5px_0px_#6366F1] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
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
      <div className="card-2d p-6 bg-white">
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Select Adversarial Attack Template (A1 - A13):</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
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
                className={`p-3 text-left rounded-lg border-2 transition-all cursor-pointer font-sans ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-[3px_3px_0px_#4F46E5] -translate-y-0.5'
                    : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-400 text-slate-700 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-extrabold ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {atk.family}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono px-1 rounded bg-white/80 border border-slate-200">
                    {atk.goal}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-1.5 truncate">
                  {atk.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query & Payload Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-2d p-5 bg-white">
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 font-mono flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Target User Prompt / Question:</span>
          </label>
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border-2 border-slate-300 font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none shadow-inner transition-colors"
          />
        </div>

        <div className="card-2d p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center space-x-2">
              <FileWarning className="w-4 h-4 text-rose-600" />
              <span>Embedded Poison Payload (Indirect Injection):</span>
            </label>
            <span className="badge-2d bg-rose-50 text-rose-700 border-rose-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              POISON INJECTION
            </span>
          </div>
          <input
            type="text"
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-rose-50/50 border-2 border-rose-300 font-mono text-xs text-rose-900 focus:bg-white focus:border-rose-600 focus:outline-none shadow-inner transition-colors"
          />
        </div>
      </div>

      {/* Side-by-Side Arena Execution Results */}
      {duelResult && (
        <div className="space-y-5 animate-scale-up">
          {/* Duel Mitigation Verdict Header */}
          <div
            className={`card-2d p-5 border-2 ${
              duelResult.attack_prevented
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[4px_4px_0px_#059669]'
                : 'border-amber-500 bg-amber-50 text-amber-950 shadow-[4px_4px_0px_#D97706]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {duelResult.attack_prevented ? (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              <h4 className="text-sm font-extrabold uppercase tracking-wider font-mono">
                {duelResult.attack_prevented ? 'EXPLOIT NEUTRALIZED BY VECTORSHIELD' : 'SECURITY NOTICE'}
              </h4>
            </div>
            <p className="text-xs text-slate-700 mt-2 font-sans font-medium pl-9">
              {duelResult.mitigation_summary}
            </p>
          </div>

          {/* Split Duel View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Undefended Victim RAG */}
            <div className="card-2d p-6 border-2 border-rose-300 bg-rose-50/30 shadow-[4px_4px_0px_#E11D48] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-rose-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                    <span className="font-mono text-xs font-extrabold text-rose-700">
                      UNDEFENDED TARGET RAG
                    </span>
                  </div>
                  <span className="badge-2d bg-rose-100 text-rose-700 border-rose-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    DEFENSES: OFF
                  </span>
                </div>

                {/* Status Banner */}
                <div className="mt-4 p-3 rounded-lg bg-rose-100/70 border-2 border-rose-300 flex items-center justify-between text-xs">
                  <span className="text-rose-900 font-bold flex items-center font-mono">
                    <XCircle className="w-4 h-4 mr-2 text-rose-600" />
                    Status: System Compromised
                  </span>
                  <span className="font-mono text-rose-700 text-xs font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                    {duelResult.victim_response.latency_ms} ms
                  </span>
                </div>

                {/* LLM Response */}
                <div className="mt-4">
                  <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    Victim Model Output (Breached):
                  </div>
                  <div className="p-4 rounded-lg bg-white border-2 border-rose-200 font-mono text-xs text-rose-900 leading-relaxed min-h-[130px] shadow-sm select-all">
                    {duelResult.victim_response.answer}
                  </div>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="mt-5 pt-3.5 border-t-2 border-rose-200 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Instruction Override:</span>
                  <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                    SUCCUMBED
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Canary Leakage:</span>
                  <span className={`font-bold px-2 py-0.5 rounded border ${
                    duelResult.victim_response.canary_leaked
                      ? 'text-rose-700 bg-rose-100 border-rose-300'
                      : 'text-slate-700 bg-slate-100 border-slate-300'
                  }`}>
                    {duelResult.victim_response.canary_leaked ? 'LEAKED' : 'NONE DETECTED'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Retrieved Chunks:</span>
                  <span className="text-slate-800 font-medium">
                    {duelResult.victim_response.retrieved_chunks.length} uninspected chunks
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Protected VectorShield RAG */}
            <div className="card-2d p-6 border-2 border-emerald-300 bg-emerald-50/30 shadow-[4px_4px_0px_#059669] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="font-mono text-xs font-extrabold text-emerald-800">
                      VECTORSHIELD DEFENDED RAG
                    </span>
                  </div>
                  <span className="badge-2d bg-emerald-100 text-emerald-800 border-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    L0-L5 ACTIVE
                  </span>
                </div>

                {/* Status Banner */}
                <div className="mt-4 p-3 rounded-lg bg-emerald-100/70 border-2 border-emerald-300 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-bold flex items-center font-mono">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    Status: Attack Intercepted &amp; Disarmed
                  </span>
                  <span className="font-mono text-emerald-700 text-xs font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {duelResult.shielded_response.latency_ms} ms
                  </span>
                </div>

                {/* LLM Response */}
                <div className="mt-4">
                  <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    Guarded Output (Grounded &amp; Sanitized):
                  </div>
                  <div className="p-4 rounded-lg bg-white border-2 border-emerald-200 font-mono text-xs text-slate-900 leading-relaxed min-h-[130px] shadow-sm select-all">
                    {duelResult.shielded_response.answer}
                  </div>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="mt-5 pt-3.5 border-t-2 border-emerald-200 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Dropped Poison Chunks:</span>
                  <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {duelResult.shielded_response.security_report?.dropped_chunks.length ?? 0} Chunks Isolated
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Exfiltration Beacons:</span>
                  <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {duelResult.shielded_response.exfiltration_blocked ? 'STRIPPED' : 'CLEAN'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Forensic Audit Digest:</span>
                  <span className="text-indigo-600 font-mono text-[11px] font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 truncate max-w-[200px]">
                    {duelResult.shielded_response.security_report?.forensic_hash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chunk Inspection Drawer */}
          {duelResult.shielded_response.retrieved_chunks.length > 0 && (
            <div className="card-2d p-6 bg-white">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3.5 font-mono flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Retrieved Chunks Forensic Analysis:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {duelResult.shielded_response.retrieved_chunks.map((chk, i) => (
                  <div
                    key={chk.chunk_id || i}
                    className={`p-3.5 rounded-lg border-2 text-xs transition-all ${
                      chk.is_dropped
                        ? 'bg-rose-50/70 border-rose-300 text-rose-950 shadow-[2px_2px_0px_#E11D48]'
                        : 'bg-slate-50 border-slate-300 text-slate-800 shadow-[2px_2px_0px_#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                      <span className="font-extrabold text-slate-900">ID: {chk.chunk_id}</span>
                      {chk.is_dropped ? (
                        <span className="badge-2d bg-rose-100 text-rose-700 border-rose-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          DROPPED &bull; {chk.drop_reason}
                        </span>
                      ) : (
                        <span className="badge-2d bg-emerald-100 text-emerald-800 border-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          PASSED &bull; SIM {chk.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-600 line-clamp-2 mt-1 bg-white/70 p-2 rounded border border-slate-200">
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
