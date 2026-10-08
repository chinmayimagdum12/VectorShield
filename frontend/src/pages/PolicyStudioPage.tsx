import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  CheckCircle,
  Shield,
  Key,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api, PolicyData } from '../services/api';

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

    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updatePolicy(policy);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!policy) {
    return (
      <div className="card-2d p-12 text-center text-xs font-mono text-slate-400">
        Loading defense policy engine configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="card-2d p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold text-white font-mono tracking-tight">
              DEFENSE POLICY &bull; RUNTIME CONFIGURATION STUDIO
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure risk thresholds, outlier sigmas, active defense layers, canary signatures, and egress whitelists.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-2d-primary px-6 py-2.5 rounded text-xs flex items-center space-x-2 min-w-[170px]"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Deploying Rules...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>DEPLOYED &bull; ACTIVE</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>SAVE &amp; DEPLOY POLICY</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Layer Toggles & Sensitivity Sliders */}
        <div className="space-y-6">
          {/* Layer Arming Toggles */}
          <div className="card-2d p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
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
                    className="p-3 rounded bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200 font-mono">{lyr.label}</div>
                      <div className="text-[11px] text-slate-400">{lyr.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPolicy({ ...policy, [lyr.key]: !isEnabled })}
                      className={`px-3 py-1 rounded font-mono font-bold text-xs transition-all border ${
                        isEnabled
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400 shadow-[2px_2px_0px_#10B981]'
                          : 'border-slate-700 bg-slate-950 text-slate-500'
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
          <div className="card-2d p-5 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Threshold &amp; Sensitivity Tuning
            </h3>

            {/* Block Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 font-bold">Block Threat Risk Threshold:</span>
                <span className="text-emerald-400 font-bold">{policy.block_threshold} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="1"
                value={policy.block_threshold}
                onChange={(e) => setPolicy({ ...policy, block_threshold: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Documents exceeding this score are blocked from direct RAG retrieval.
              </p>
            </div>

            {/* Quarantine Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 font-bold">Quarantine Airlock Threshold:</span>
                <span className="text-rose-400 font-bold">{policy.quarantine_threshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={policy.quarantine_threshold}
                onChange={(e) => setPolicy({ ...policy, quarantine_threshold: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Documents exceeding this score are quarantined with cryptographic evidence.
              </p>
            </div>

            {/* Outlier Sigma Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 font-bold">Similarity Outlier Sigma (&sigma;):</span>
                <span className="text-cyan-400 font-bold">{policy.similarity_sigma} &sigma;</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="3.5"
                step="0.1"
                value={policy.similarity_sigma}
                onChange={(e) => setPolicy({ ...policy, similarity_sigma: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Retrieval score distribution z-score cutoff to flag gaming/poisoning outliers.
              </p>
            </div>
          </div>

          {/* Canary & Egress Whitelist Card */}
          <div className="card-2d p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Credentials &amp; Domain Boundaries
            </h3>

            {/* Canary Token */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 mb-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Canary Security Token:</span>
              </label>
              <input
                type="text"
                value={policy.canary_token}
                onChange={(e) => setPolicy({ ...policy, canary_token: e.target.value })}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Embedded in system prompts. If detected in output, immediate execution halt is triggered.
              </p>
            </div>

            {/* Allowed Outbound Domains */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center space-x-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Allowed Egress Domains (Whitelist):</span>
              </label>
              <input
                type="text"
                value={policy.allowed_domains}
                onChange={(e) => setPolicy({ ...policy, allowed_domains: e.target.value })}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Comma-separated list of safe outbound domains. All unlisted image beacons are stripped.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
