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
  Filter,
  FileText
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="card-2d p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-[2px_2px_0px_#4F46E5]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                KNOWLEDGE BASE &bull; 2D VECTOR SPACE EXPLORER
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Analyze 2D PCA vector cluster distributions, inspect active knowledge chunks, and manage quarantined threats.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { sound.playClick(); setSubTab('map'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all border-2 cursor-pointer ${
              subTab === 'map'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-[3px_3px_0px_#4F46E5]'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            2D Vector Map
          </button>
          <button
            onClick={() => { sound.playClick(); setSubTab('documents'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all border-2 cursor-pointer ${
              subTab === 'documents'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-[3px_3px_0px_#4F46E5]'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => { sound.playClick(); setSubTab('quarantine'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all border-2 cursor-pointer ${
              subTab === 'quarantine'
                ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-[3px_3px_0px_#E11D48]'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            Quarantine ({quarantineRecords.length})
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-50 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#0F172A]"
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
          <div className="lg:col-span-2 card-2d p-6 bg-white flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700 font-bold uppercase text-[11px]">Filter Cluster:</span>
                <select
                  value={filterCluster}
                  onChange={(e) => setFilterCluster(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm"
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
                  className="p-1.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.2))}
                  className="p-1.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale(1.0)}
                  className="p-1.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                  title="Reset Scale"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
                <span className="text-slate-600 font-bold pl-1">{Math.round(zoomScale * 100)}%</span>
              </div>
            </div>

            {/* Interactive Vector Canvas Area */}
            <div className="relative w-full h-[460px] bg-slate-50 rounded-xl border-2 border-slate-300 overflow-hidden flex items-center justify-center p-4 shadow-inner">
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '32px 32px'
                }}
              />

              {/* Origin Crosshairs */}
              <div className="absolute inset-x-0 top-1/2 border-t-2 border-slate-300/80 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 border-l-2 border-slate-300/80 pointer-events-none" />

              {/* Vector Scatter Points container with scale transform */}
              <div
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
                className="relative w-full h-full transition-transform duration-200"
              >
                {filteredPoints.map((pt) => {
                  const left = `${Math.min(95, Math.max(5, (pt.x + 100) / 2))}%`;
                  const top = `${Math.min(95, Math.max(5, (100 - pt.y) / 2))}%`;
                  const isSelected = selectedPoint?.id === pt.id;

                  let colorClass = 'bg-emerald-500 border-emerald-700 shadow-[1px_1px_3px_rgba(0,0,0,0.2)]';
                  if (pt.is_poisoned) {
                    colorClass = 'bg-rose-500 border-rose-800 shadow-[0_0_8px_#EF4444] animate-pulse';
                  } else if (pt.trust_tier === 'tier_0') {
                    colorClass = 'bg-indigo-600 border-indigo-900 shadow-[1px_1px_3px_rgba(0,0,0,0.2)]';
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
                        isSelected ? 'scale-150 ring-4 ring-indigo-300 z-30' : 'hover:scale-125 z-10'
                      }`}
                      title={`${pt.cluster} [Risk: ${pt.risk_score.toFixed(1)}]`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend row */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-600 mt-3 pt-3 border-t border-slate-200 gap-2">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700" />
                <span className="font-bold">Verified Corpus</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600 border border-indigo-900" />
                <span className="font-bold">System Tier 0</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-800 animate-pulse" />
                <span className="text-rose-700 font-extrabold">Poisoned Vectors</span>
              </span>
              <span className="font-bold text-slate-500">Showing: {filteredPoints.length} of {vectorPoints.length}</span>
            </div>
          </div>

          {/* Right: Selected Node Details Inspector */}
          <div className="card-2d p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-slate-100 font-mono">
                Vector Node Inspector
              </div>

              {selectedPoint ? (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Node Identifier:</span>
                      <span className="text-slate-900 font-extrabold font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-300">
                        {selectedPoint.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Cluster Group:</span>
                      <span className="text-indigo-600 font-extrabold">{selectedPoint.cluster}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Provenance Tier:</span>
                      <span className="badge-2d bg-indigo-50 text-indigo-700 border-indigo-300 text-[10px] px-2 py-0.5 rounded font-bold">
                        {selectedPoint.trust_tier}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">PCA Coordinates:</span>
                      <span className="text-slate-800 font-bold">
                        ({selectedPoint.x}, {selectedPoint.y})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Adversarial Risk:</span>
                      <span
                        className={`font-extrabold text-xs px-2 py-0.5 rounded border ${
                          selectedPoint.risk_score >= 65
                            ? 'text-rose-700 bg-rose-50 border-rose-300'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-300'
                        }`}
                      >
                        {selectedPoint.risk_score.toFixed(1)} / 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-700 font-extrabold mb-1.5 uppercase text-[11px]">
                      Embedded Chunk Context:
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-sans leading-relaxed text-xs max-h-[160px] overflow-y-auto shadow-inner">
                      {selectedPoint.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 text-xs font-mono bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  Click on any vector node in the 2D scatter space to inspect metadata.
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              Vector Database: Dual-Engine (ChromaDB + VectorShield NumPy Engine). 100% Persistence.
            </div>
          </div>
        </div>
      )}

      {/* 2. SubTab: Documents Management */}
      {subTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider font-mono">
              Indexed Corpus Repositories ({documents.length})
            </span>
            <button
              onClick={() => setShowAddDoc(!showAddDoc)}
              className="btn-2d-primary px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-[3px_3px_0px_#0F172A]"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          </div>

          {/* Ingest Form Drawer */}
          {showAddDoc && (
            <form onSubmit={handleIngest} className="card-2d p-6 space-y-4 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A] animate-scale-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 uppercase font-mono">Document Title:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q3 Security Architecture Whitepaper"
                    className="w-full px-3.5 py-2.5 mt-1.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-800 uppercase font-mono">Trust Tier:</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 mt-1.5 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="tier_0">Tier 0 (System / Verified Internal)</option>
                    <option value="tier_1">Tier 1 (Internal Corporate)</option>
                    <option value="tier_2">Tier 2 (Untrusted / External)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase font-mono">Document Text Content:</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter full text content..."
                  className="w-full p-3.5 mt-1.5 rounded-lg bg-slate-50 border-2 border-slate-300 font-mono text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoc(false)}
                  className="btn-2d px-4 py-2 text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-2d-primary px-5 py-2 rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0px_#0F172A]">
                  Scan &amp; Ingest
                </button>
              </div>
            </form>
          )}

          {/* Documents Table */}
          <div className="card-2d overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-900 text-slate-700 font-mono font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Trust Tier</th>
                  <th className="p-3.5">Chunks</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 font-sans">{doc.title}</td>
                    <td className="p-3.5">
                      <span className="badge-2d bg-indigo-50 text-indigo-700 border-indigo-400 text-[10px] px-2 py-0.5 rounded font-bold">
                        {doc.trust_tier}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{doc.chunk_count} Chunks</td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded border ${
                          doc.risk_score >= 65
                            ? 'text-rose-700 bg-rose-50 border-rose-300'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-300'
                        }`}
                      >
                        {doc.risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {doc.is_quarantined ? (
                        <span className="badge-2d bg-rose-100 text-rose-800 border-rose-500 text-[10px] px-2 py-0.5 rounded font-bold">
                          QUARANTINED
                        </span>
                      ) : (
                        <span className="badge-2d bg-emerald-100 text-emerald-800 border-emerald-500 text-[10px] px-2 py-0.5 rounded font-bold">
                          INDEXED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50"
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
          <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider font-mono">
            Quarantine Airlock Vault ({quarantineRecords.length} Items)
          </div>

          {quarantineRecords.length === 0 ? (
            <div className="card-2d p-12 text-center text-xs text-slate-600 font-mono bg-white">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2.5" />
              <span className="font-bold">Quarantine Vault clean &bull; No documents isolated.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {quarantineRecords.map((q) => (
                <div key={q.id} className="card-2d p-5 border-2 border-rose-300 bg-rose-50/40 space-y-3.5 shadow-[4px_4px_0px_#E11D48]">
                  <div className="flex items-center justify-between pb-2.5 border-b-2 border-rose-200">
                    <span className="font-mono text-xs font-extrabold text-rose-900">{q.filename}</span>
                    <span className="badge-2d bg-rose-100 text-rose-700 border-rose-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      RISK: {q.risk_score}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-rose-950 bg-white p-3 rounded-lg border border-rose-200 line-clamp-3 leading-relaxed">
                    {q.snippet}
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {q.reason_codes.map((rc, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-200/80 text-rose-900 rounded font-bold border border-rose-300">
                        {rc}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t-2 border-rose-200 flex justify-end space-x-2.5">
                    <button
                      onClick={() => handleReleaseQuarantine(q.id)}
                      className="btn-2d px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-[2px_2px_0px_#0F172A]"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Release &amp; Index</span>
                    </button>
                    <button
                      onClick={() => handlePurgeQuarantine(q.id)}
                      className="btn-2d-danger px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-[2px_2px_0px_#0F172A]"
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
