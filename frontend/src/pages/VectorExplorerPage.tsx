import React, { useState, useEffect } from 'react';
import {
  Network,
  Database,
  ShieldAlert,
  Trash2,
  CheckCircle,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Unlock,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Filter
} from 'lucide-react';
import { api, VectorPoint, DocumentItem, QuarantineRecord } from '../services/api';
import { sound } from '../components/SoundEffects';

export const VectorExplorerPage: React.FC = () => {
  const [subTab, setSubTab] = useState<'map' | 'documents' | 'quarantine'>('map');
  const [vectorPoints, setVectorPoints] = useState<VectorPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<VectorPoint | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterCluster, setFilterCluster] = useState<string>('ALL');
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // New Document Form
  const [showAddDoc, setShowAddDoc] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newTier, setNewTier] = useState<string>('tier_1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, docs, quar] = await Promise.all([
        api.getVectorSpace(),
        api.listDocuments(),
        api.listQuarantine(),
      ]);
      setVectorPoints(vData.points || []);
      setDocuments(docs || []);
      setQuarantineRecords(quar || []);
      if (vData.points && vData.points.length > 0) {
        setSelectedPoint(vData.points[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    sound.playClick();
    try {
      await api.ingestDocument(newTitle, newContent, 'user_upload', newTier);
      setShowAddDoc(false);
      setNewTitle('');
      setNewContent('');
      sound.playSuccess();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and remove its indexed vectors?')) return;
    sound.playClick();
    try {
      await api.deleteDocument(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReleaseQuarantine = async (id: string) => {
    sound.playClick();
    try {
      await api.releaseQuarantine(id);
      sound.playSuccess();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurgeQuarantine = async (id: string) => {
    if (!confirm('Permanently purge this quarantined threat?')) return;
    sound.playClick();
    try {
      await api.purgeQuarantine(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Distinct cluster names for filtering
  const clusterNames = ['ALL', ...Array.from(new Set(vectorPoints.map((p) => p.cluster)))];

  const filteredPoints = vectorPoints.filter((p) => {
    if (filterCluster === 'ALL') return true;
    return p.cluster === filterCluster;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="card-2d p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold text-white font-mono tracking-tight">
              KNOWLEDGE BASE &bull; 2D VECTOR SPACE EXPLORER
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze 2D PCA vector cluster distributions, inspect active knowledge chunks, and manage quarantined threats.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { sound.playClick(); setSubTab('map'); }}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
              subTab === 'map'
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-[2px_2px_0px_#10B981]'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            2D Vector Map
          </button>
          <button
            onClick={() => { sound.playClick(); setSubTab('documents'); }}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
              subTab === 'documents'
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-[2px_2px_0px_#10B981]'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => { sound.playClick(); setSubTab('quarantine'); }}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
              subTab === 'quarantine'
                ? 'border-rose-500 bg-rose-950/40 text-rose-400 shadow-[2px_2px_0px_#EF4444]'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Quarantine ({quarantineRecords.length})
          </button>

          <button
            onClick={loadData}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. SubTab: 2D Vector Map */}
      {subTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Canvas: Interactive 2D Vector Map */}
          <div className="lg:col-span-2 card-2d p-5 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 font-bold uppercase text-[11px]">Filter Cluster:</span>
                <select
                  value={filterCluster}
                  onChange={(e) => setFilterCluster(e.target.value)}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  {clusterNames.map((cn) => (
                    <option key={cn} value={cn}>
                      {cn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center space-x-2 text-[11px]">
                <button
                  onClick={() => setZoomScale((prev) => Math.min(2.0, prev + 0.2))}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.2))}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomScale(1.0)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  title="Reset Scale"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-400">{Math.round(zoomScale * 100)}%</span>
              </div>
            </div>

            {/* Interactive Vector Canvas Area */}
            <div className="relative w-full h-[460px] bg-slate-950 rounded border-2 border-slate-800 cyber-grid overflow-hidden flex items-center justify-center p-4">
              {/* Origin Crosshairs */}
              <div className="absolute inset-x-0 top-1/2 border-t border-slate-800/80 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 border-l border-slate-800/80 pointer-events-none" />

              {/* Vector Scatter Points container with scale transform */}
              <div
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
                className="relative w-full h-full transition-transform duration-200"
              >
                {filteredPoints.map((pt) => {
                  const left = `${Math.min(95, Math.max(5, (pt.x + 100) / 2))}%`;
                  const top = `${Math.min(95, Math.max(5, (100 - pt.y) / 2))}%`;
                  const isSelected = selectedPoint?.id === pt.id;

                  let colorClass = 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#10B981]';
                  if (pt.is_poisoned) {
                    colorClass = 'bg-rose-500 border-rose-300 shadow-[0_0_12px_#EF4444] animate-pulse';
                  } else if (pt.trust_tier === 'tier_0') {
                    colorClass = 'bg-cyan-400 border-cyan-200 shadow-[0_0_8px_#06B6D4]';
                  }

                  return (
                    <button
                      key={pt.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedPoint(pt);
                      }}
                      style={{ left, top }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all cursor-pointer ${colorClass} ${
                        isSelected ? 'scale-150 ring-4 ring-white/40 z-30' : 'hover:scale-125 z-10'
                      }`}
                      title={`${pt.cluster} [Risk: ${pt.risk_score.toFixed(1)}]`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend row */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Verified Corpus</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>System Tier 0</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-400 font-bold">Poisoned Vectors</span>
              </span>
              <span>Showing: {filteredPoints.length} of {vectorPoints.length}</span>
            </div>
          </div>

          {/* Right: Selected Node Details Inspector */}
          <div className="card-2d p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 font-mono">
                Vector Node Inspector
              </div>

              {selectedPoint ? (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Node Identifier:</span>
                      <span className="text-white font-bold">{selectedPoint.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cluster Group:</span>
                      <span className="text-emerald-400 font-bold">{selectedPoint.cluster}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provenance Tier:</span>
                      <span className="text-cyan-400 font-bold">{selectedPoint.trust_tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PCA Coordinates:</span>
                      <span className="text-slate-300">
                        ({selectedPoint.x}, {selectedPoint.y})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Adversarial Risk:</span>
                      <span
                        className={`font-bold ${
                          selectedPoint.risk_score >= 65 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {selectedPoint.risk_score.toFixed(1)} / 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-bold mb-1 uppercase text-[11px]">
                      Embedded Chunk Context:
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs max-h-[160px] overflow-y-auto">
                      {selectedPoint.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs font-mono">
                  Click on any vector node in the 2D scatter space to inspect metadata.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Vector Database: Dual-Engine (ChromaDB + VectorShield NumPy Engine). 100% Persistence.
            </div>
          </div>
        </div>
      )}

      {/* 2. SubTab: Documents Management */}
      {subTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Indexed Corpus Repositories ({documents.length})
            </span>
            <button
              onClick={() => setShowAddDoc(!showAddDoc)}
              className="btn-2d-primary px-3 py-1.5 rounded text-xs flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          </div>

          {/* Ingest Form Drawer */}
          {showAddDoc && (
            <form onSubmit={handleIngest} className="card-2d p-4 space-y-3 bg-slate-900/90">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase font-mono">Document Title:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q3 Security Architecture Whitepaper"
                    className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase font-mono">Trust Tier:</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="tier_0">Tier 0 (System / Verified Internal)</option>
                    <option value="tier_1">Tier 1 (Internal Corporate)</option>
                    <option value="tier_2">Tier 2 (Untrusted / External)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase font-mono">Document Text Content:</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter full text content..."
                  className="w-full p-2.5 mt-1 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoc(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-2d-primary px-4 py-1.5 rounded text-xs">
                  Scan &amp; Ingest
                </button>
              </div>
            </form>
          )}

          {/* Documents Table */}
          <div className="card-2d overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Trust Tier</th>
                  <th className="p-3">Chunks</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-semibold text-white font-sans">{doc.title}</td>
                    <td className="p-3">
                      <span className="badge-2d bg-cyan-500/10 text-cyan-400 border-cyan-500 text-[10px] px-2 py-0.5 rounded">
                        {doc.trust_tier}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{doc.chunk_count} Chunks</td>
                    <td className="p-3">
                      <span
                        className={doc.risk_score >= 65 ? 'text-rose-400 font-bold' : 'text-emerald-400'}
                      >
                        {doc.risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      {doc.is_quarantined ? (
                        <span className="badge-2d bg-rose-500/20 text-rose-400 border-rose-500 text-[10px] px-2 py-0.5 rounded">
                          QUARANTINED
                        </span>
                      ) : (
                        <span className="badge-2d bg-emerald-500/20 text-emerald-400 border-emerald-500 text-[10px] px-2 py-0.5 rounded">
                          INDEXED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SubTab: Quarantine Vault */}
      {subTab === 'quarantine' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Quarantine Airlock Vault ({quarantineRecords.length} Items)
          </div>

          {quarantineRecords.length === 0 ? (
            <div className="card-2d p-12 text-center text-xs text-slate-400 font-mono">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>Quarantine Vault clean &bull; No documents isolated.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quarantineRecords.map((q) => (
                <div key={q.id} className="card-2d p-4 border-rose-900/60 bg-rose-950/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
                    <span className="font-mono text-xs font-bold text-rose-300">{q.filename}</span>
                    <span className="badge-2d bg-rose-500/20 text-rose-400 border-rose-500 text-[10px] px-2 py-0.5 rounded font-mono">
                      RISK: {q.risk_score}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-slate-300 bg-black/60 p-2.5 rounded border border-rose-900/40 line-clamp-3">
                    {q.snippet}
                  </p>

                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    {q.reason_codes.map((rc, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-rose-900/40 text-rose-300 rounded">
                        {rc}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-rose-900/40 flex justify-end space-x-2">
                    <button
                      onClick={() => handleReleaseQuarantine(q.id)}
                      className="btn-2d px-3 py-1 rounded text-xs flex items-center space-x-1"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Release &amp; Index</span>
                    </button>
                    <button
                      onClick={() => handlePurgeQuarantine(q.id)}
                      className="btn-2d-danger px-3 py-1 rounded text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge Threat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
