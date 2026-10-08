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
    <div className="border-b border-slate-200/80 bg-white/95 px-6 py-2 sticky top-[57px] z-40 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="font-mono uppercase tracking-wide text-[11px]">{tab.label}</span>
              <span className={`text-[9px] font-mono ml-0.5 ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                [{tab.shortcut}]
              </span>
              {tab.badge !== undefined && (
                <span className="badge-2d bg-rose-500 text-white border-rose-600 text-[10px] px-1.5 py-0.2 rounded-full ml-1 font-mono font-bold">
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
