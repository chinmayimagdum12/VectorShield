import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { AttackLabPage } from './pages/AttackLabPage';
import { PipelineXRayPage } from './pages/PipelineXRayPage';
import { ScannerPage } from './pages/ScannerPage';
import { VectorExplorerPage } from './pages/VectorExplorerPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { PolicyStudioPage } from './pages/PolicyStudioPage';
import { api, HealthStatus } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [incidentCount, setIncidentCount] = useState<number>(0);

  useEffect(() => {
    fetchHealthAndIncidents();
    const interval = setInterval(fetchHealthAndIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthAndIncidents = async () => {
    try {
      const [h, inc] = await Promise.all([
        api.getHealth(),
        api.listIncidents(100),
      ]);
      setHealth(h);
      setIncidentCount(inc?.length || 0);
    } catch (e) {
      console.error('Telemetry polling notice:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex flex-col font-sans">
      {/* Global Security Header */}
      <Header health={health} activeTab={activeTab} />

      {/* 2D Neo-Cyber Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        incidentCount={incidentCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && (
          <DashboardPage health={health} onNavigate={setActiveTab} />
        )}
        {activeTab === 'attack-lab' && <AttackLabPage />}
        {activeTab === 'pipeline-xray' && <PipelineXRayPage />}
        {activeTab === 'scanner' && <ScannerPage />}
        {activeTab === 'vector-map' && <VectorExplorerPage />}
        {activeTab === 'benchmark' && <BenchmarkPage />}
        {activeTab === 'incidents' && <IncidentsPage />}
        {activeTab === 'policies' && <PolicyStudioPage />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-800/80 bg-[#0B111E] py-4 px-6 text-xs text-slate-400 font-mono mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>VectorShield v1.0.0 &bull; Multi-Layered Defense &amp; Evaluation Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>OWASP Top 10 for LLM: LLM01 &amp; LLM07 Hardened</span>
            <span>&bull;</span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline"
            >
              OpenAPI /docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
