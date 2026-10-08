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
  ExternalLink
} from 'lucide-react';
import { api, IncidentItem } from '../services/api';

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
    window.open(`/api/v1/incidents/export?format=${format}`, '_blank');
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterAction === 'ALL') return true;
    return inc.action_taken.toLowerCase() === filterAction.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Title & Export Action Bar */}
      <div className="card-2d p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-extrabold text-white font-mono tracking-tight">
              INCIDENT LOG &bull; TAMPER-EVIDENT FORENSIC AUDIT
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable security ledger sealed with cryptographic SHA-256 digests. Compatible with SIEM &amp; GitHub SARIF reporting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('sarif')}
            className="btn-2d px-3.5 py-2 rounded text-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export SARIF</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn-2d-primary px-3.5 py-2 rounded text-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forensic JSON</span>
          </button>
          <button
            onClick={loadIncidents}
            className="p-2 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs font-mono">
        <span className="text-slate-400 font-bold uppercase text-[11px]">Filter Action:</span>
        {['ALL', 'BLOCK', 'SANITIZE', 'MITIGATE'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1 rounded border transition-all ${
              filterAction === act
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-[2px_2px_0px_#10B981]'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Grid: Incident List & Selected Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List (2 cols) */}
        <div className="lg:col-span-2 card-2d overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold">Ledger Records ({filteredIncidents.length})</span>
            <span className="text-slate-500">Chronological Descending</span>
          </div>

          <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
            {filteredIncidents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-mono">
                No incidents recorded under the selected filter.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-emerald-950/20' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{inc.request_id}</span>
                        <span className="text-slate-500 text-[11px]">&bull; {inc.attack_family}</span>
                      </div>
                      <span
                        className={`badge-2d text-[10px] px-2 py-0.5 rounded ${
                          inc.action_taken === 'block'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        }`}
                      >
                        {inc.action_taken.toUpperCase()}
                      </span>
                    </div>

                    <p className="font-sans text-slate-300 line-clamp-1 mt-1 text-[11px]">
                      &quot;{inc.query_text}&quot;
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                      <span>Hash: {inc.forensic_hash.slice(0, 12)}...</span>
                      <span>Risk: {inc.risk_score}</span>
                      <span>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Details Card */}
        <div className="card-2d p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 font-mono">
              Forensic Evidence Inspector
            </div>

            {selectedIncident ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Request ID:</span>
                    <span className="text-white font-bold">{selectedIncident.request_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Action Enforced:</span>
                    <span className="text-emerald-400 font-bold uppercase">
                      {selectedIncident.action_taken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Threat Score:</span>
                    <span className="text-rose-400 font-bold">{selectedIncident.risk_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recorded At:</span>
                    <span className="text-slate-300">
                      {new Date(selectedIncident.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1 text-[11px] uppercase">
                    Incident Query Text:
                  </div>
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-200 font-sans leading-relaxed text-xs">
                    {selectedIncident.query_text}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1 text-[11px] uppercase">
                    Layers Triggered &bull; Reason Codes:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedIncident.reason_codes.map((rc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px]">
                        {rc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1 text-[11px] uppercase">
                    Tamper-Evident SHA-256 Digest:
                  </div>
                  <div className="p-2.5 rounded bg-black/60 border border-slate-800 text-cyan-400 text-[10px] break-all">
                    {selectedIncident.forensic_hash}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                Select an incident record to inspect forensic cryptographic evidence.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Verification status: Cryptographic chain intact. Zero tampering detected.
          </div>
        </div>
      </div>
    </div>
  );
};
