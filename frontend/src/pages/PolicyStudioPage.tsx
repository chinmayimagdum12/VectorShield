import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  CheckCircle,
  Shield,
  Key,
  Globe,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { api, PolicyData } from '../services/api';
import { sound } from '../components/SoundEffects';

export const PolicyStudioPage: React.FC = () => {
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    setLoading(true);
    try {
      const data = await api.getPolicy();
      setPolicy(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    sound.playClick();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updatePolicy(policy);
      setSaveSuccess(true);
      sound.playSuccess();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!policy) {
    return (
      <div className="card-2d p-12 text-center text-xs font-mono text-slate-500 bg-white">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading defense policy engine configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="card-2d p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-[2px_2px_0px_#4F46E5]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                DEFENSE POLICY &bull; RUNTIME CONFIGURATION STUDIO
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Configure risk thresholds, outlier sigmas, active defense layers, canary signatures, and egress whitelists.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-2d-primary px-6 py-3 rounded-xl text-xs font-mono font-black flex items-center space-x-2.5 min-w-[210px] justify-center shadow-[4px_4px_0px_#4F46E5] hover:shadow-[5px_5px_0px_#6366F1] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="tracking-wide">DEPLOYING RULES...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="tracking-wide">DEPLOYED &bull; ACTIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/40 shrink-0" />
              <Save className="w-4 h-4 text-emerald-400" />
              <span className="tracking-wide">SAVE &amp; DEPLOY POLICY</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Layer Toggles */}
        <div className="space-y-6">
          <div className="card-2d p-6 bg-white space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2 pb-3 border-b-2 border-slate-100">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Defense Layer Runtime Arming</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { key: 'l0_enabled', label: 'L0: Source Trust & Provenance Digesting', desc: 'Enforces source tier weighting & SHA-256 integrity' },
                { key: 'l1_enabled', label: 'L1: Ingestion Deep Sanitizer', desc: 'Steganography, NFKC normalization & de-obfuscation' },
                { key: 'l2_enabled', label: 'L2: Indexer Isolation Gate', desc: 'Blocks high-risk vectors from entering knowledge base' },
                { key: 'l3_enabled', label: 'L3: Retrieval Anomaly Filter', desc: 'Outlier z-score detection & duplicate flood suppression' },
                { key: 'l4_enabled', label: 'L4: Delimiter Spotlighting & Hardening', desc: 'Context isolation & instruction hierarchy framing' },
                { key: 'l5_enabled', label: 'L5: Output Egress Guard', desc: 'Canary leak protection, beacon strip & secret redaction' },
              ].map((lyr) => {
                const isEnabled = (policy as any)[lyr.key];
                return (
                  <div
                    key={lyr.key}
                    className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between transition-all hover:bg-slate-100/70"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 font-mono text-xs">{lyr.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{lyr.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPolicy({ ...policy, [lyr.key]: !isEnabled });
                      }}
                      className={`px-3.5 py-1.5 rounded-lg font-mono font-extrabold text-xs transition-all border-2 cursor-pointer ${
                        isEnabled
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_#059669]'
                          : 'border-slate-300 bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isEnabled ? 'ARMED' : 'BYPASS'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sliders & Credential Controls */}
        <div className="space-y-6">
          {/* Sliders Card */}
          <div className="card-2d p-6 bg-white space-y-5">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono pb-3 border-b-2 border-slate-100 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Threshold &amp; Sensitivity Tuning</span>
            </h3>

            {/* Block Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-700 font-bold">Block Threat Risk Threshold:</span>
                <span className="text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {policy.block_threshold} / 100
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="1"
                value={policy.block_threshold}
                onChange={(e) => setPolicy({ ...policy, block_threshold: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Documents exceeding this score are blocked from direct RAG retrieval.
              </p>
            </div>

            {/* Quarantine Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-700 font-bold">Quarantine Airlock Threshold:</span>
                <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {policy.quarantine_threshold} / 100
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={policy.quarantine_threshold}
                onChange={(e) => setPolicy({ ...policy, quarantine_threshold: parseFloat(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Documents exceeding this score are quarantined with cryptographic evidence.
              </p>
            </div>

            {/* Outlier Sigma Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-700 font-bold">Similarity Outlier Sigma (&sigma;):</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {policy.similarity_sigma} &sigma;
                </span>
              </div>
              <input
                type="range"
                min="1.2"
                max="3.5"
                step="0.1"
                value={policy.similarity_sigma}
                onChange={(e) => setPolicy({ ...policy, similarity_sigma: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Retrieval score distribution z-score cutoff to flag gaming/poisoning outliers.
              </p>
            </div>
          </div>

          {/* Canary & Egress Whitelist Card */}
          <div className="card-2d p-6 bg-white space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono pb-3 border-b-2 border-slate-100 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Credentials &amp; Domain Boundaries</span>
            </h3>

            {/* Canary Token */}
            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase font-mono flex items-center space-x-1.5 mb-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Active Canary Security Token:</span>
              </label>
              <input
                type="text"
                value={policy.canary_token}
                onChange={(e) => setPolicy({ ...policy, canary_token: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-amber-50/50 border-2 border-amber-300 font-mono text-xs text-amber-950 focus:bg-white focus:border-amber-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Embedded in system prompts. If detected in output, immediate execution halt is triggered.
              </p>
            </div>

            {/* Allowed Outbound Domains */}
            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase font-mono flex items-center space-x-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Allowed Egress Domains (Whitelist):</span>
              </label>
              <input
                type="text"
                value={policy.allowed_domains}
                onChange={(e) => setPolicy({ ...policy, allowed_domains: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border-2 border-slate-300 font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Comma-separated list of safe outbound domains. All unlisted image beacons are stripped.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
