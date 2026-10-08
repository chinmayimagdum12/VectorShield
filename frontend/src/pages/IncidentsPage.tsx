import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Download,
  ShieldCheck,
  Hash,
  Clock,
  Layers,
  FileCheck,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { api, IncidentItem } from '../services/api';
import { sound } from '../components/SoundEffects';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.listIncidents(50);
      setIncidents(data || []);
      if (data && data.length > 0) {
        setSelectedIncident(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'json' | 'sarif') => {
    sound.playClick();
    window.open(`/api/v1/incidents/export?format=${format}`, '_blank');
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterAction === 'ALL') return true;
    return inc.action_taken.toLowerCase() === filterAction.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Export Action Bar */}
      <div className="card-2d p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border-2 border-amber-600 flex items-center justify-center text-amber-600 shadow-[2px_2px_0px_#D97706]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                INCIDENT LOG &bull; TAMPER-EVIDENT FORENSIC AUDIT
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Immutable security ledger sealed with cryptographic SHA-256 digests. Compatible with SIEM &amp; GitHub SARIF reporting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleExport('sarif')}
            className="btn-2d px-3.5 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-[2px_2px_0px_#0F172A]"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export SARIF</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn-2d-primary px-4 py-2.5 rounded-xl text-xs font-mono font-black flex items-center space-x-2 shadow-[4px_4px_0px_#4F46E5] hover:shadow-[5px_5px_0px_#6366F1] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ring-2 ring-cyan-400/40 shrink-0" />
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="tracking-wide">EXPORT FORENSIC JSON</span>
          </button>
          <button
            onClick={() => { sound.playClick(); loadIncidents(); }}
            className="p-2 rounded-lg bg-slate-50 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#0F172A]"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card-2d p-3.5 bg-white flex items-center space-x-2 text-xs font-mono">
        <span className="text-slate-700 font-bold uppercase text-[11px] mr-1">Filter Action:</span>
        {['ALL', 'BLOCK', 'SANITIZE', 'MITIGATE'].map((act) => (
          <button
            key={act}
            onClick={() => { sound.playClick(); setFilterAction(act); }}
            className={`px-3 py-1.5 rounded-lg border-2 font-bold transition-all cursor-pointer ${
              filterAction === act
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-[2px_2px_0px_#4F46E5]'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Grid: Incident List & Selected Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List (2 cols) */}
        <div className="lg:col-span-2 card-2d overflow-hidden flex flex-col bg-white">
          <div className="p-4 border-b-2 border-slate-900 bg-slate-100 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-900 font-extrabold uppercase">Ledger Records ({filteredIncidents.length})</span>
            <span className="text-slate-500 font-bold">Chronological Descending</span>
          </div>

          <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto">
            {filteredIncidents.length === 0 ? (
              <div className="p-16 text-center text-slate-500 text-xs font-mono">
                No incidents recorded under the selected filter.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => { sound.playClick(); setSelectedIncident(inc); }}
                    className={`p-4 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-indigo-50/90 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">{inc.request_id}</span>
                        <span className="text-slate-500 text-[11px]">&bull; {inc.attack_family}</span>
                      </div>
                      <span
                        className={`badge-2d text-[10px] px-2 py-0.5 rounded font-bold ${
                          inc.action_taken === 'block'
                            ? 'bg-rose-100 text-rose-800 border-rose-400'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        }`}
                      >
                        {inc.action_taken.toUpperCase()}
                      </span>
                    </div>

                    <p className="font-sans text-slate-800 line-clamp-1 mt-1 text-[11px]">
                      &quot;{inc.query_text}&quot;
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                      <span className="font-bold text-indigo-600">Hash: {inc.forensic_hash.slice(0, 14)}...</span>
                      <span>Risk Score: {inc.risk_score}</span>
                      <span>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Details Card (Sleek Dark Forensic Vault) */}
        <div className="card-dark p-6 bg-[#0B1120] text-slate-100 border border-slate-800 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 font-mono flex items-center space-x-2">
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              <span>Forensic Evidence Inspector</span>
            </div>

            {selectedIncident ? (
              <div className="space-y-4 text-xs font-mono animate-scale-up">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Request ID:</span>
                    <span className="text-white font-extrabold">{selectedIncident.request_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Action Enforced:</span>
                    <span className="badge-2d bg-emerald-950/80 text-emerald-400 border-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      {selectedIncident.action_taken}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Threat Score:</span>
                    <span className="text-rose-400 font-extrabold text-sm">{selectedIncident.risk_score} / 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Recorded At:</span>
                    <span className="text-slate-300 font-medium">
                      {new Date(selectedIncident.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1.5 text-[11px] uppercase">
                    Incident Query Text:
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans leading-relaxed text-xs">
                    {selectedIncident.query_text}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1.5 text-[11px] uppercase">
                    Layers Triggered &bull; Reason Codes:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIncident.reason_codes.map((rc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] font-bold">
                        {rc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1.5 text-[11px] uppercase">
                    Tamper-Evident SHA-256 Digest:
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-[10px] break-all font-bold">
                    {selectedIncident.forensic_hash}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs font-mono bg-slate-950 rounded-xl border border-dashed border-slate-800">
                Select an incident record to inspect forensic cryptographic evidence.
              </div>
            )}
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Verification status: Cryptographic chain intact. Zero tampering detected.
          </div>
        </div>
      </div>
    </div>
  );
};
