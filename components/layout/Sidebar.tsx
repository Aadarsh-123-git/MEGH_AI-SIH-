'use client';

import React from 'react';
import {
  LayoutDashboard,
  Map,
  BellRing,
  FileText,
  BarChart3,
  Server,
  HelpCircle,
  ShieldCheck,
  Activity,
  Brain,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export type ActiveNavTab = 'dashboard' | 'risk-map' | 'alerts' | 'reports' | 'analytics' | 'integrations' | 'system';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  activeAlertCount: number;
  pendingReportCount: number;
  userRole: UserRole;
  onOpenHelp: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  activeAlertCount,
  pendingReportCount,
  userRole,
  onOpenHelp,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as ActiveNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'risk-map' as ActiveNavTab,
      label: 'Risk Map & DEM',
      icon: Map,
      badge: null,
    },
    {
      id: 'alerts' as ActiveNavTab,
      label: 'Nowcast Alerts',
      icon: BellRing,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
      badgeColor: 'bg-red-600 text-white',
    },
    {
      id: 'reports' as ActiveNavTab,
      label: 'Field Reports',
      icon: FileText,
      badge: pendingReportCount > 0 ? pendingReportCount : null,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'analytics' as ActiveNavTab,
      label: 'Analytics & XAI',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'integrations' as ActiveNavTab,
      label: 'MOSDAC / IMDAA Feeds',
      icon: Activity,
      badge: null,
    },
    {
      id: 'system' as ActiveNavTab,
      label: 'System & MTL Engine',
      icon: Server,
      badge: null,
    },
  ];

  return (
    <aside className="w-56 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-53px)] border-r border-slate-800">
      {/* Primary Navigation Menu */}
      <div className="p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-3 py-1.5 mb-1">
          Operational Nowcast Views
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-purple-900/80 text-white font-semibold border-l-2 border-amber-300 pl-2.5'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center ${
                      item.badgeColor || 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Operational Status Box */}
      <div className="mx-3 mt-auto mb-3 p-2.5 rounded bg-purple-950/60 border border-purple-900/80 text-[11px] text-slate-300">
        <div className="flex items-center space-x-1.5 text-slate-200 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Duty Desk Active</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Role: <span className="text-purple-200 font-medium capitalize">{userRole.replace(/_/g, ' ')}</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
          Emergency Hotline: <span className="text-amber-300 font-mono">1070 (NDMA)</span>
        </div>
      </div>

      {/* Bottom links */}
      <div className="border-t border-slate-900 p-3 space-y-1">
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded text-xs text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Nowcast SOP & Help</span>
        </button>
        <div className="px-3 py-1 text-[10px] text-slate-500 font-mono">
          MEGH-AI Engine v2.4.0
        </div>
      </div>
    </aside>
  );
}
