import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Copy,
  Check,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Activity,
  Maximize2,
  Info,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api, VectorPoint, DocumentItem, QuarantineRecord } from '../services/api';
import { sound } from '../components/SoundEffects';

export const VectorExplorerPage: React.FC = () => {
  const [subTab, setSubTab] = useState<'map' | 'documents' | 'quarantine'>('map');
  const [vectorPoints, setVectorPoints] = useState<VectorPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<VectorPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<VectorPoint | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterCluster, setFilterCluster] = useState<string>('ALL');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // In-canvas semantic search simulation
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simulatedQueryPoint, setSimulatedQueryPoint] = useState<{ x: number; y: number } | null>(null);

  // Ingest Document Form
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

  // Distinct cluster names for filtering
  const clusterNames = useMemo(() => {
    return ['ALL', ...Array.from(new Set(vectorPoints.map((p) => p.cluster)))];
  }, [vectorPoints]);

  const filteredPoints = useMemo(() => {
    if (filterCluster === 'ALL') return vectorPoints;
    return vectorPoints.filter((p) => p.cluster === filterCluster);
  }, [vectorPoints, filterCluster]);

  // Compute dynamic bounding box to spread out all points across the canvas
  const bounds = useMemo(() => {
    if (!vectorPoints || vectorPoints.length === 0) {
      return { minX: -10, maxX: 10, minY: -10, maxY: 10, rangeX: 20, rangeY: 20 };
    }
    const xs = vectorPoints.map((p) => p.x);
    const ys = vectorPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padX = Math.max((maxX - minX) * 0.18, 1.5);
    const padY = Math.max((maxY - minY) * 0.18, 1.5);

    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY,
      rangeX: maxX - minX + 2 * padX,
      rangeY: maxY - minY + 2 * padY,
    };
  }, [vectorPoints]);

  // Normalization functions (0% to 100%)
  const getPointPercentX = (x: number) => {
    return ((x - bounds.minX) / bounds.rangeX) * 100;
  };

  const getPointPercentY = (y: number) => {
    // Top 0% is highest Y, Bottom 100% is lowest Y
    return ((bounds.maxY - y) / bounds.rangeY) * 100;
  };

  // Compute Cluster Halos (centroids and radius)
  const clusterHalos = useMemo(() => {
    const map = new Map<string, { count: number; sumX: number; sumY: number; isPoisoned: boolean }>();
    filteredPoints.forEach((p) => {
      const existing = map.get(p.cluster) || { count: 0, sumX: 0, sumY: 0, isPoisoned: false };
      existing.count += 1;
      existing.sumX += p.x;
      existing.sumY += p.y;
      if (p.is_poisoned) existing.isPoisoned = true;
      map.set(p.cluster, existing);
    });

    return Array.from(map.entries()).map(([clusterName, data]) => {
      const cx = data.sumX / data.count;
      const cy = data.sumY / data.count;
      return {
        cluster: clusterName,
        count: data.count,
        cx,
        cy,
        left: getPointPercentX(cx),
        top: getPointPercentY(cy),
        isPoisoned: data.isPoisoned,
      };
    });
  }, [filteredPoints, bounds]);

  // Nearest neighbors to selected point
  const nearestNeighbors = useMemo(() => {
    if (!selectedPoint || vectorPoints.length <= 1) return [];
    return vectorPoints
      .filter((p) => p.id !== selectedPoint.id)
      .map((p) => {
        const dx = p.x - selectedPoint.x;
        const dy = p.y - selectedPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Estimate cosine similarity approx from 2D distance
        const sim = Math.max(0.1, 1 - dist / (bounds.rangeX * 0.8));
        return { point: p, dist, sim };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
  }, [selectedPoint, vectorPoints, bounds]);

  // Handle semantic search simulation
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSimulatedQueryPoint(null);
      return;
    }
    // Calculate synthetic query coordinate based on query text hash
    let hash = 0;
    for (let i = 0; i < q.length; i++) hash = (hash << 5) - hash + q.charCodeAt(i);
    const pseudoX = bounds.minX + ((Math.abs(hash) % 1000) / 1000) * bounds.rangeX;
    const pseudoY = bounds.minY + ((Math.abs(hash * 31) % 1000) / 1000) * bounds.rangeY;
    setSimulatedQueryPoint({ x: pseudoX, y: pseudoY });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    sound.playClick();
    setTimeout(() => setCopiedId(false), 2000);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Toolbar */}
      <div className="card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">
                  KNOWLEDGE BASE &bull; 2D VECTOR SPACE EXPLORER
                </h2>
                <span className="badge-2d bg-indigo-950/80 text-indigo-400 border-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                  PCA 2D PROJECTION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Analyze dense embedding cluster topologies, evaluate adversarial proximity, and inspect indexed chunks.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab pills & Main Ingest button */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center p-1 bg-[#0F172A] rounded-xl border border-slate-800">
            <button
              onClick={() => { sound.playClick(); setSubTab('map'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                subTab === 'map'
                  ? 'bg-[#050811] text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Vector Map
            </button>
            <button
              onClick={() => { sound.playClick(); setSubTab('documents'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                subTab === 'documents'
                  ? 'bg-[#050811] text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Documents ({documents.length})
            </button>
            <button
              onClick={() => { sound.playClick(); setSubTab('quarantine'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                subTab === 'quarantine'
                  ? 'bg-[#050811] text-rose-400 shadow-sm border border-rose-900/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quarantine ({quarantineRecords.length})
            </button>
          </div>

          {/* Main Action Button (Dark with pulsing emerald beacon) */}
          <button
            onClick={() => setShowAddDoc(true)}
            className="btn-2d-primary px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/40 shrink-0" />
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Ingest Document</span>
          </button>

          <button
            onClick={loadData}
            className="px-2.5 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Knowledge Base"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="card-dark p-4 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Total Vectors</div>
            <div className="text-2xl font-black font-mono text-white mt-0.5">{vectorPoints.length}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="card-dark p-4 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Verified Corpus</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {vectorPoints.filter((p) => !p.is_poisoned).length}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="card-dark p-4 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Poisoned Vectors</div>
            <div className="text-2xl font-black font-mono text-rose-400 mt-0.5">
              {vectorPoints.filter((p) => p.is_poisoned).length}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="card-dark p-4 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Projection Mode</div>
            <div className="text-sm font-bold font-mono text-indigo-400 mt-1">384-D &rarr; 2D PCA</div>
          </div>
          <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. SubTab: 2D Vector Map */}
      {subTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Interactive 2D Vector Space Canvas (2 cols) */}
          <div className="lg:col-span-2 card-dark p-6 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl flex flex-col justify-between">
            {/* Canvas Toolbar: Search + Filter + Zoom */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-xs font-mono">
              {/* Semantic Query Search in Canvas */}
              <div className="flex-1 relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Test semantic query vector (e.g. 'quarterly revenue')..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#050811] border border-slate-800 text-xs font-mono text-slate-200 focus:bg-[#070D1E] focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                {/* Cluster filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 text-[11px] font-bold uppercase">Cluster:</span>
                  <select
                    value={filterCluster}
                    onChange={(e) => setFilterCluster(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-[#050811] border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {clusterNames.map((cn) => (
                      <option key={cn} value={cn}>
                        {cn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center space-x-1 bg-[#0F172A] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setZoomScale((prev) => Math.min(2.2, prev + 0.2))}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#050811]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.2))}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#050811]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomScale(1.0)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#050811]"
                    title="Reset Scale"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-300 px-1">{Math.round(zoomScale * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div className="relative w-full h-[520px] bg-[#060913] rounded-2xl border border-slate-800/90 overflow-hidden flex items-center justify-center p-6 shadow-inner select-none">
              {/* Subtle grid background */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Grid origin lines */}
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-800 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-800 pointer-events-none" />

              {/* Coordinates Scale markers */}
              <div className="absolute left-3 top-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                +Y ({bounds.maxY.toFixed(1)})
              </div>
              <div className="absolute left-3 bottom-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                -Y ({bounds.minY.toFixed(1)})
              </div>
              <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                +X ({bounds.maxX.toFixed(1)})
              </div>

              {/* Scalable Container */}
              <div
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
                className="relative w-full h-full transition-transform duration-200"
              >
                {/* 1. Cluster Halos & Region Labels */}
                {clusterHalos.map((halo, i) => (
                  <div
                    key={i}
                    style={{ left: `${halo.left}%`, top: `${halo.top}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
                  >
                    <div
                      className={`w-36 h-36 rounded-full border border-dashed animate-pulse duration-1000 ${
                        halo.isPoisoned
                          ? 'bg-rose-500/10 border-rose-500/40 ring-8 ring-rose-500/5'
                          : 'bg-indigo-500/10 border-indigo-500/40 ring-8 ring-indigo-500/5'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-1 border shadow-xs ${
                        halo.isPoisoned
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                          : 'bg-[#0A1020] text-slate-300 border-slate-700'
                      }`}
                    >
                      {halo.cluster} ({halo.count})
                    </span>
                  </div>
                ))}

                {/* 2. Simulated Query Vector Point with distance lines */}
                {simulatedQueryPoint && (
                  <>
                    {/* Query Crosshair */}
                    <div
                      style={{
                        left: `${getPointPercentX(simulatedQueryPoint.x)}%`,
                        top: `${getPointPercentY(simulatedQueryPoint.y)}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-lg ring-4 ring-indigo-400/40 animate-bounce">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md mt-1 shadow-md">
                        Query: &quot;{searchQuery.slice(0, 16)}...&quot;
                      </span>
                    </div>

                    {/* SVG lines to closest nodes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      {filteredPoints.slice(0, 3).map((pt, idx) => (
                        <line
                          key={idx}
                          x1={`${getPointPercentX(simulatedQueryPoint.x)}%`}
                          y1={`${getPointPercentY(simulatedQueryPoint.y)}%`}
                          x2={`${getPointPercentX(pt.x)}%`}
                          y2={`${getPointPercentY(pt.y)}%`}
                          stroke="#6366F1"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="opacity-70"
                        />
                      ))}
                    </svg>
                  </>
                )}

                {/* 3. Scatter Vector Nodes */}
                {filteredPoints.map((pt) => {
                  const left = `${getPointPercentX(pt.x)}%`;
                  const top = `${getPointPercentY(pt.y)}%`;
                  const isSelected = selectedPoint?.id === pt.id;
                  const isHovered = hoveredPoint?.id === pt.id;

                  let nodeColor = 'bg-emerald-500 border-white text-white shadow-sm';
                  if (pt.is_poisoned) {
                    nodeColor = 'bg-rose-500 border-white text-white shadow-sm ring-2 ring-rose-400/50 animate-pulse';
                  } else if (pt.trust_tier === 'tier_0') {
                    nodeColor = 'bg-indigo-600 border-white text-white shadow-sm';
                  }

                  return (
                    <div
                      key={pt.id}
                      style={{ left, top }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-150"
                    >
                      <button
                        onClick={() => {
                          sound.playClick();
                          setSelectedPoint(pt);
                        }}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${nodeColor} ${
                          isSelected
                            ? 'scale-150 ring-4 ring-slate-900/40 z-30 shadow-md'
                            : isHovered
                            ? 'scale-135 z-20 shadow-md'
                            : 'hover:scale-125 z-10'
                        }`}
                        title={`${pt.id}: ${pt.cluster}`}
                      />

                      {/* Concentric highlight ring when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 -m-1.5 rounded-full border border-slate-900/40 animate-ping pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Floating Tooltip when hovering over a node */}
              {hoveredPoint && (
                <div
                  style={{
                    left: `${Math.min(75, Math.max(15, getPointPercentX(hoveredPoint.x)))}%`,
                    top: `${Math.max(15, getPointPercentY(hoveredPoint.y) - 15)}%`,
                  }}
                  className="absolute pointer-events-none z-40 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-mono max-w-xs border border-slate-700 animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
                    <span className="font-bold text-indigo-400">{hoveredPoint.id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        hoveredPoint.is_poisoned
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {hoveredPoint.is_poisoned ? 'POISONED' : 'SAFE'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate font-sans">
                    {hoveredPoint.cluster} &bull; {hoveredPoint.source}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 italic">
                    &quot;{hoveredPoint.text}&quot;
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 mt-4 pt-3 border-t border-slate-800 gap-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                  <span className="font-semibold text-slate-300">Verified Corpus</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366F1]" />
                  <span className="font-semibold text-slate-300">Tier 0 System</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E] animate-pulse" />
                  <span className="font-bold text-rose-400">Poisoned Injections</span>
                </span>
              </div>

              <div className="text-slate-400 font-medium">
                Rendered: <span className="font-bold text-white font-mono">{filteredPoints.length}</span> of{' '}
                <span className="font-bold text-white font-mono">{vectorPoints.length}</span> vectors
              </div>
            </div>
          </div>

          {/* Right: Forensic Intelligence Node Inspector (Sleek Dark Console) */}
          <div className="card-dark p-6 bg-[#0B1120] text-slate-100 border border-slate-800 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                    Forensic Node Inspector
                  </span>
                </div>

                {selectedPoint && (
                  <span
                    className={`badge-2d text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      selectedPoint.is_poisoned
                        ? 'bg-rose-950/80 text-rose-400 border-rose-700'
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                    }`}
                  >
                    {selectedPoint.is_poisoned ? 'MALICIOUS ADVERSARIAL' : 'VERIFIED IN KNOWLEDGE'}
                  </span>
                )}
              </div>

              {selectedPoint ? (
                <div className="space-y-4 text-xs font-mono">
                  {/* Node Identity Card */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Node Identifier:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white font-mono">{selectedPoint.id}</span>
                        <button
                          onClick={() => handleCopyId(selectedPoint.id)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Copy ID"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cluster Group:</span>
                      <span className="text-indigo-400 font-extrabold">{selectedPoint.cluster}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Provenance Tier:</span>
                      <span className="badge-2d bg-slate-800 text-slate-200 border-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">
                        {selectedPoint.trust_tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">PCA Coordinates:</span>
                      <span className="text-slate-200 font-bold">
                        ({selectedPoint.x.toFixed(2)}, {selectedPoint.y.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  {/* Risk Score Progress Bar */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-400 font-bold text-[11px] uppercase">Adversarial Threat Score:</span>
                      <span
                        className={`font-black text-sm ${
                          selectedPoint.risk_score >= 65 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {selectedPoint.risk_score.toFixed(1)} / 100
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(4, selectedPoint.risk_score)}%` }}
                        className={`h-full rounded-full transition-all ${
                          selectedPoint.risk_score >= 65 ? 'bg-rose-500 shadow-[0_0_8px_#EF4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10B981]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Nearest Semantic Neighbors */}
                  {nearestNeighbors.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-slate-400 font-bold text-[11px] uppercase mb-2 flex items-center justify-between">
                        <span>Nearest Neighbors (2D Cosine):</span>
                        <span className="text-[10px] text-slate-500">Euclidean Proximity</span>
                      </div>
                      <div className="space-y-1.5">
                        {nearestNeighbors.map((nb, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedPoint(nb.point)}
                            className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-colors"
                          >
                            <span className="font-mono text-[11px] text-slate-300 truncate max-w-[140px]">
                              {nb.point.id}
                            </span>
                            <span className="badge-2d bg-indigo-950/80 text-indigo-300 border-indigo-700/60 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              Sim: {(nb.sim * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Embedded Chunk Context Reader */}
                  <div>
                    <div className="flex items-center justify-between text-slate-400 font-bold mb-1.5 uppercase text-[11px]">
                      <span>Chunk Text Payload:</span>
                      <span className="text-slate-500 font-normal">
                        {selectedPoint.text.length} chars &bull; {selectedPoint.text.split(/\s+/).filter(Boolean).length} tokens
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans leading-relaxed text-xs max-h-[140px] overflow-y-auto select-all">
                      {selectedPoint.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs font-mono bg-slate-950 rounded-xl border border-dashed border-slate-800">
                  Click on any vector node in the 2D scatter space to inspect metadata.
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            {selectedPoint && (
              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => alert(`Node ${selectedPoint.id} queued for adversarial validation.`)}
                  className="btn-2d px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send to Duel</span>
                </button>

                <div className="text-[10px] text-slate-500 font-mono">
                  Engine: ChromaDB + NumPy Fallback
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SubTab: Documents Management */}
      {subTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
              Indexed Corpus Repositories ({documents.length} Files)
            </span>
            <button
              onClick={() => setShowAddDoc(!showAddDoc)}
              className="btn-2d-primary px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Ingest Document</span>
            </button>
          </div>

          {/* Ingest Form Drawer */}
          {showAddDoc && (
            <form onSubmit={handleIngest} className="card-dark p-6 space-y-4 bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl animate-scale-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase font-mono">Document Title:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q3 Security Architecture Whitepaper"
                    className="w-full px-3.5 py-2.5 mt-1.5 rounded-xl bg-[#050811] border border-slate-800 text-xs font-mono text-slate-200 focus:bg-[#070D1E] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase font-mono">Trust Tier:</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 mt-1.5 rounded-xl bg-[#050811] border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="tier_0">Tier 0 (System / Verified Internal)</option>
                    <option value="tier_1">Tier 1 (Internal Corporate)</option>
                    <option value="tier_2">Tier 2 (Untrusted / External)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase font-mono">Document Text Content:</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter full text content..."
                  className="w-full p-3.5 mt-1.5 rounded-xl bg-[#050811] border border-slate-800 font-mono text-xs text-slate-200 focus:bg-[#070D1E] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoc(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-2d-primary px-5 py-2 rounded-xl text-xs font-mono font-bold">
                  Scan &amp; Ingest
                </button>
              </div>
            </form>
          )}

          {/* Documents Table */}
          <div className="card-dark overflow-hidden bg-[#0A1020] border border-slate-800 shadow-xl rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] border-b border-slate-800 text-slate-400 font-mono font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Trust Tier</th>
                  <th className="p-3.5">Chunks</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#131D36] transition-colors">
                    <td className="p-3.5 font-bold text-white font-sans">{doc.title}</td>
                    <td className="p-3.5">
                      <span className="badge-2d bg-indigo-950/80 text-indigo-400 border-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        {doc.trust_tier}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{doc.chunk_count} Chunks</td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full border text-[10px] ${
                          doc.risk_score >= 65
                            ? 'text-rose-400 bg-rose-950/80 border-rose-800'
                            : 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                        }`}
                      >
                        {doc.risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {doc.is_quarantined ? (
                        <span className="badge-2d bg-rose-950/80 text-rose-400 border-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          QUARANTINED
                        </span>
                      ) : (
                        <span className="badge-2d bg-emerald-950/80 text-emerald-400 border-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          INDEXED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-950/40"
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

      {/* 5. SubTab: Quarantine Vault */}
      {subTab === 'quarantine' && (
        <div className="space-y-4">
          <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-mono">
            Quarantine Airlock Vault ({quarantineRecords.length} Isolated Items)
          </div>

          {quarantineRecords.length === 0 ? (
            <div className="card-dark p-12 text-center text-xs text-slate-400 font-mono bg-[#0A1020] border border-slate-800 rounded-2xl shadow-xl">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2.5" />
              <span className="font-bold">Quarantine Vault clean &bull; No threats quarantined.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quarantineRecords.map((q) => (
                <div key={q.id} className="card-dark p-5 border border-rose-900/70 bg-[#120912] shadow-xl rounded-2xl space-y-3.5 text-slate-200">
                  <div className="flex items-center justify-between pb-2.5 border-b border-rose-900/60">
                    <span className="font-mono text-xs font-extrabold text-rose-400">{q.filename}</span>
                    <span className="badge-2d bg-rose-950/80 text-rose-400 border-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                      RISK: {q.risk_score}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-rose-300 bg-[#07030A] p-3 rounded-xl border border-rose-900/60 line-clamp-3 leading-relaxed shadow-inner">
                    {q.snippet}
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {q.reason_codes.map((rc, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-950/80 text-rose-400 rounded-full font-bold border border-rose-800">
                        {rc}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-rose-900/60 flex justify-end space-x-2.5">
                    <button
                      onClick={() => handleReleaseQuarantine(q.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 bg-[#0F172A] border border-slate-700 text-slate-300 hover:text-white"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Release &amp; Index</span>
                    </button>
                    <button
                      onClick={() => handlePurgeQuarantine(q.id)}
                      className="btn-2d-danger px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm"
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
