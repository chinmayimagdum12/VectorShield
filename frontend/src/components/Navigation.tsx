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

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidentCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, incidentCount = 0 }) => {
  const tabs = [
    { id: 'dashboard', label: 'Threat Command', icon: LayoutDashboard },
    { id: 'attack-lab', label: 'Attack Lab (Duel)', icon: Swords },
    { id: 'pipeline-xray', label: 'Pipeline X-Ray', icon: GitFork },
    { id: 'scanner', label: 'Document Scanner', icon: ScanEye },
    { id: 'vector-map', label: 'Vector & Knowledge', icon: Network },
    { id: 'benchmark', label: 'Benchmark Arena', icon: BarChart3 },
    { id: 'incidents', label: 'Incident Forensics', icon: AlertTriangle, badge: incidentCount > 0 ? incidentCount : undefined },
    { id: 'policies', label: 'Defense Policy', icon: Sliders },
  ];

  return (
    <div className="border-b-2 border-slate-800 bg-[#070B13]/80 px-6 pt-3 pb-0 sticky top-[61px] z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-t-2 border-x-2 ${
                isActive
                  ? 'border-emerald-500 bg-[#0B111E] text-emerald-400 shadow-[3px_0px_0px_#000] translate-y-[2px] pb-3'
                  : 'border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="badge-2d bg-rose-500/20 text-rose-400 border-rose-500 text-[10px] px-1.5 py-0.2 rounded-full ml-1">
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
