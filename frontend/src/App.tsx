import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CyberBackground } from './components/CyberBackground';
import { DashboardPage } from './pages/DashboardPage';
import { AttackLabPage } from './pages/AttackLabPage';
import { PipelineXRayPage } from './pages/PipelineXRayPage';
import { ScannerPage } from './pages/ScannerPage';
import { VectorExplorerPage } from './pages/VectorExplorerPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { PolicyStudioPage } from './pages/PolicyStudioPage';
import { api, HealthStatus } from './services/api';
import { sound } from './components/SoundEffects';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [incidentCount, setIncidentCount] = useState<number>(0);

  useEffect(() => {
    fetchHealthAndIncidents();
    const interval = setInterval(fetchHealthAndIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation shortcuts (keys 1 to 8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const keyMap: Record<string, string> = {
        '1': 'dashboard',
        '2': 'attack-lab',
        '3': 'pipeline-xray',
        '4': 'scanner',
        '5': 'vector-map',
        '6': 'benchmark',
        '7': 'incidents',
        '8': 'policies',
      };
      if (keyMap[e.key]) {
        sound.playClick();
        setActiveTab(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative selection:bg-slate-900 selection:text-white">
      {/* Animated Clean Particle Mesh Background */}
      <CyberBackground />

      {/* Global Security Header */}
      <Header health={health} activeTab={activeTab} />

      {/* 2D Neo-Cyber Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        incidentCount={incidentCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 relative z-10">
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

      {/* Clean White 2D Footer */}
      <footer className="border-t-2 border-slate-900 bg-white py-4 px-6 text-xs text-slate-600 font-mono mt-auto relative z-10 shadow-[0_-4px_10px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-slate-900" />
            <span className="font-bold text-slate-900">VectorShield Enterprise Defense Platform</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-500">v1.0.0 Production</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-600">
            <span className="font-semibold">OWASP Top 10 for LLM: LLM01 &amp; LLM07 Hardened</span>
            <span className="text-slate-300">&bull;</span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 font-bold hover:underline"
            >
              Interactive API /docs &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
