import React from 'react';
import {
  LayoutDashboard,
  Swords,
  GitFork,
  ScanEye,
  Network,
  BarChart3,
  AlertTriangle,
  Sliders
} from 'lucide-react';
import { sound } from './SoundEffects';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidentCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, incidentCount = 0 }) => {
  const tabs = [
    { id: 'dashboard', label: 'Threat Command', icon: LayoutDashboard, shortcut: '1' },
    { id: 'attack-lab', label: 'Attack Duel Arena', icon: Swords, shortcut: '2' },
    { id: 'pipeline-xray', label: 'Pipeline X-Ray & Tracer', icon: GitFork, shortcut: '3' },
    { id: 'scanner', label: 'Deep Document Scanner', icon: ScanEye, shortcut: '4' },
    { id: 'vector-map', label: 'Vector & Knowledge', icon: Network, shortcut: '5' },
    { id: 'benchmark', label: 'Benchmark Arena', icon: BarChart3, shortcut: '6' },
    { id: 'incidents', label: 'Forensic Incidents', icon: AlertTriangle, shortcut: '7', badge: incidentCount > 0 ? incidentCount : undefined },
    { id: 'policies', label: 'Defense Policy Studio', icon: Sliders, shortcut: '8' },
  ];

  const handleTabClick = (id: string) => {
    sound.playClick();
    setActiveTab(id);
  };

  return (
    <div className="border-b border-slate-800 bg-[#0B1020]/95 px-4 sm:px-6 py-1.5 sticky top-[57px] z-40 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-start xl:justify-between space-x-1 overflow-x-auto scrollbar-none no-scrollbar py-0.5 overscroll-x-contain">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.45)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-mono uppercase tracking-wide text-[11px]">{tab.label}</span>
              <span className={`text-[9px] font-mono ml-0.5 hidden lg:inline ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                [{tab.shortcut}]
              </span>
              {tab.badge !== undefined && (
                <span className="badge-2d bg-rose-500 text-white border-rose-600 text-[10px] px-1.5 py-0.2 rounded-full ml-1 font-mono font-bold animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
