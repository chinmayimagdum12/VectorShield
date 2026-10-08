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
    <div className="border-b-2 border-slate-900 bg-white/95 px-6 pt-3 pb-0 sticky top-[65px] z-40 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`group flex items-center space-x-2 px-3.5 py-2 rounded-t-lg font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-t-2 border-x-2 cursor-pointer ${
                isActive
                  ? 'border-slate-900 bg-indigo-600 text-white shadow-[3px_0px_0px_#0F172A] translate-y-[2px] pb-3'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 hover:border-slate-400'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-600'}`} />
              <span>{tab.label}</span>
              <span className={`text-[9px] font-mono ml-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                [{tab.shortcut}]
              </span>
              {tab.badge !== undefined && (
                <span className="badge-2d bg-rose-500 text-white border-rose-900 text-[10px] px-1.5 py-0.2 rounded-full ml-1 font-mono">
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
