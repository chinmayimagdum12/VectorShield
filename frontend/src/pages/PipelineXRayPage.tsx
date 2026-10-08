import React, { useState } from 'react';
import {
  GitFork,
  Shield,
  FileCheck,
  Database,
  Filter,
  FileCode,
  Lock,
  ArrowRight,
  CheckCircle,
  Info,
  ChevronRight,
  Zap
} from 'lucide-react';

interface StageData {
  id: string;
  name: string;
  phase: 'INGESTION' | 'STORAGE' | 'QUERY' | 'OUTPUT';
  icon: any;
  tagline: string;
  description: string;
  algorithms: string[];
  threatsNeutralized: string[];
  latencyP50: string;
}

export const PipelineXRayPage: React.FC = () => {
  const stages: StageData[] = [
    {
      id: 'L0',
      name: 'L0: Source Trust & Provenance',
      phase: 'INGESTION',
      icon: Shield,
      tagline: 'Trust Tiering & Cryptographic Hashing',
      description: 'Evaluates the incoming document origin, computes SHA-256 integrity digests, and assigns trust tiers (tier_0 to tier_3) to enforce strict down-weighting of untrusted third-party submissions.',
      algorithms: ['SHA-256 Content Digesting', 'Domain Whitelist Verification', 'Trust Tier Multipliers'],
      threatsNeutralized: ['Unverified Source Spoofing', 'Untrusted Web Uploads', 'Tampered Document Re-indexing'],
      latencyP50: '1.2 ms',
    },
    {
      id: 'L1',
      name: 'L1: Ingestion Sanitizer & Inspector',
      phase: 'INGESTION',
      icon: FileCheck,
      tagline: 'Deep Steganography & De-obfuscation',
      description: 'Executes Unicode NFKC normalization, scans for invisible zero-width characters and tag steganography, normalizes homoglyph substitutions to Latin skeletons, strips hidden HTML comments and CSS display:none text, and recursively decodes Base64/ROT13 payloads.',
      algorithms: ['NFKC Unicode Normalization', 'Zero-Width Steganography Scanner', 'Homoglyph Skeleton Mapping', 'Recursive Base64/ROT13 De-obfuscation', 'Noisy-OR Risk Aggregator'],
      threatsNeutralized: ['A1 Direct Overrides', 'A3 Steganography', 'A4 Base64 Encoded Payloads', 'A2 Persona Jailbreaks'],
      latencyP50: '8.4 ms',
    },
    {
      id: 'L2',
      name: 'L2: Indexer Security & Quarantine',
      phase: 'STORAGE',
      icon: Database,
      tagline: 'Pre-Index Isolation Gate',
      description: 'Acts as an automated airlock before documents are committed to the vector database. Documents with risk score >= 80 are routed directly to the Quarantine Vault, preventing hostile vectors from contaminating nearest-neighbor index spaces.',
      algorithms: ['Risk Threshold Gating', 'Quarantine Vault Isolation', 'Vector Metadata Cryptographic Sealing'],
      threatsNeutralized: ['Knowledge Base Contamination', 'Mass Ingestion Poisoning', 'Persistence of Malicious Chunks'],
      latencyP50: '3.1 ms',
    },
    {
      id: 'L3',
      name: 'L3: Retrieval Filter & Anomaly Check',
      phase: 'QUERY',
      icon: Filter,
      tagline: 'Runtime Post-Retrieval Verification',
      description: 'Intercepts chunks retrieved by top-k similarity. Calculates the retrieval score distribution to flag abnormal similarity outliers (z-score > 2.2 sigma), performs Jaccard duplicate cluster analysis to suppress repetition flood attacks, and caps maximum chunks per single document.',
      algorithms: ['Similarity Outlier Z-Score Detector', 'Jaccard Cluster Deduplication', 'Source Diversity Capping', 'Runtime Re-scan Engine'],
      threatsNeutralized: ['A8 Retrieval Gaming', 'A7 Knowledge Poisoning', 'A9 Split Payloads', 'Near-Duplicate Flood'],
      latencyP50: '12.6 ms',
    },
    {
      id: 'L4',
      name: 'L4: Delimiter Spotlighting & Hardening',
      phase: 'QUERY',
      icon: FileCode,
      tagline: 'Instruction Hierarchy & Context Isolation',
      description: 'Wraps all passed context chunks in explicit <<<UNTRUSTED_EXTERNAL_DATA>>> boundary tags, embeds strict Instruction Hierarchy Level 0 directives, injects runtime secret canary tokens, and applies sandwich defense reinforcement right before the user query.',
      algorithms: ['Modular Delimiter Spotlighting', 'Datamarking (Optional)', 'Instruction Hierarchy Level 0', 'Sandwich Defense Reinforcement', 'Dynamic Canary Injection'],
      threatsNeutralized: ['Indirect Prompt Injection', 'Context Hijacking', 'System Instruction Confusion', 'Delimiter Escapes'],
      latencyP50: '2.4 ms',
    },
    {
      id: 'L5',
      name: 'L5: Output Guard & Security Enforcer',
      phase: 'OUTPUT',
      icon: Lock,
      tagline: 'Egress Filtering & Cryptographic Report',
      description: 'Inspects outbound LLM generations before user delivery. Detects system canary leaks, strips unauthorized Markdown image beacons and exfiltration URLs, redacts API keys and PII tokens, verifies claim grounding against retrieved chunks, and seals the forensic audit log with SHA-256.',
      algorithms: ['Canary Leak Detector', 'Exfiltration URL & Markdown Beacon Sanitizer', 'Regex/Entropy Secret Scanner', 'Entity Grounding Claim Verifier', 'SHA-256 Audit Seal'],
      threatsNeutralized: ['A6 Data Exfiltration Beacons', 'Prompt Extraction / Canary Leak', 'API Key & Credential Leakage', 'Ungrounded Hallucinations'],
      latencyP50: '6.5 ms',
    },
  ];

  const [activeStageId, setActiveStageId] = useState<string>('L1');
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[1];

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="card-2d p-5">
        <div className="flex items-center space-x-2">
          <GitFork className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-extrabold text-white font-mono tracking-tight">
            PIPELINE X-RAY &bull; END-TO-END DEFENSE ARCHITECTURE
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Interactive forensic visualization of the six multi-layered defense stages safeguarding the RAG lifecycle.
        </p>
      </div>

      {/* Visual Pipeline Node Flow */}
      <div className="card-2d p-6 bg-slate-900/40">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = activeStageId === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setActiveStageId(stg.id)}
                className={`p-4 rounded text-left transition-all relative border-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-[3px_3px_0px_#10B981]'
                    : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">{stg.id}</span>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">
                    {stg.phase}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 w-fit mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{stg.name.split(':')[1]}</div>
                <div className="text-[10px] text-slate-400 mt-1">{stg.latencyP50}</div>

                {/* Arrow connector */}
                {idx < stages.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Inspection Card for Selected Stage */}
      <div className="card-2d p-6 border-slate-700 bg-[#0B111E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border-2 border-emerald-500 shadow-[2px_2px_0px_#10B981]">
              <activeStage.icon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white font-mono">{activeStage.name}</h3>
                <span className="badge-2d bg-emerald-500/20 text-emerald-300 border-emerald-500 text-[10px] px-2 py-0.5 rounded">
                  ARMED &bull; ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeStage.tagline}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Phase: </span>
              <span className="text-emerald-400 font-bold">{activeStage.phase}</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">P50 Latency: </span>
              <span className="text-amber-400 font-bold">{activeStage.latencyP50}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-xs text-slate-300 leading-relaxed font-sans">
          {activeStage.description}
        </div>

        {/* Two-Column Detailed Mechanics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Algorithms */}
          <div className="p-4 rounded bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Enforced Defense Algorithms</span>
            </h4>
            <ul className="space-y-2">
              {activeStage.algorithms.map((algo, i) => (
                <li key={i} className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{algo}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats Neutralized */}
          <div className="p-4 rounded bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Threat Vectors Neutralized</span>
            </h4>
            <ul className="space-y-2">
              {activeStage.threatsNeutralized.map((th, i) => (
                <li key={i} className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{th}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
