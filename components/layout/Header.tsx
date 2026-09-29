'use client';

import React from 'react';
import { CloudRain, Radio, ChevronDown, UserCheck, Zap, Sparkles } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface HeaderProps {
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  isSystemLive: boolean;
  onRefreshTelemetry: () => void;
  isRefreshing: boolean;
}

const DISTRICT_OPTIONS = [
  { value: 'all', label: 'All Monitoring Stations (National View)' },
  { value: 'East Khasi Hills', label: 'East Khasi Hills (Cherrapunji)' },
  { value: 'North Sikkim', label: 'North Sikkim (Mangan / Chungthang)' },
  { value: 'Uttarkashi', label: 'Uttarkashi (Bhagirathi River)' },
  { value: 'Mumbai Suburban', label: 'Mumbai Suburban (Mithi Basin)' },
  { value: 'Kamrup Metropolitan', label: 'Guwahati (Bharalu Basin)' },
  { value: 'Central Delhi', label: 'Central Delhi (Yamuna)' },
  { value: 'Noney / Imphal West', label: 'Noney / Tupul (Manipur)' },
  { value: 'Chennai', label: 'Chennai Coastal Plain (Adyar)' },
];

export default function Header({
  selectedDistrict,
  onDistrictChange,
  userRole,
  onUserRoleChange,
  isSystemLive,
  onRefreshTelemetry,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="bg-purple-950 text-white border-b border-purple-900 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded bg-purple-900 border border-purple-700 flex items-center justify-center text-white shrink-0 shadow-sm">
          <CloudRain className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight flex items-center gap-1.5">
              <span>MEGH-AI</span>
              <span className="text-amber-300 text-xs font-mono font-normal">| Nowcasting</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-900/90 text-purple-200 border border-purple-800">
              IMDAA & MOSDAC Live
            </span>
          </div>
          <p className="text-[11px] text-purple-200 leading-tight">
            AI-Driven Hyper-Local Severe Weather Nowcasting &bull; 2–6h Lead Time
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Real-Time Live Telemetry Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-purple-900/80 border border-purple-700 text-purple-200 px-2 py-1 rounded text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="font-medium font-mono">INSAT-3D & IMDAA ACTIVE</span>
        </div>

        {/* Selected District Dropdown */}
        <div className="flex items-center space-x-1.5">
          <label htmlFor="district-header-select" className="text-xs text-purple-200 font-medium hidden sm:inline">
            Station:
          </label>
          <div className="relative">
            <select
              id="district-header-select"
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="appearance-none bg-purple-900 hover:bg-purple-850 border border-purple-700 text-white text-xs font-medium py-1.5 pl-2.5 pr-7 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-300"
            >
              {DISTRICT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-purple-300 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Manual refresh trigger */}
        <button
          type="button"
          onClick={onRefreshTelemetry}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 bg-purple-900/80 hover:bg-purple-800 border border-purple-700 px-2.5 py-1.5 rounded text-xs text-purple-200 transition-colors cursor-pointer"
          title="Click to refresh satellite & nowcast feeds"
        >
          <Radio className={`w-3.5 h-3.5 ${isSystemLive ? 'text-emerald-400' : 'text-amber-400'} ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium hidden sm:inline">
            {isRefreshing ? 'Syncing...' : 'Live Feed'}
          </span>
        </button>

        {/* User Role Selector */}
        <div className="relative border-l border-purple-800 pl-3">
          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-purple-300" />
            <select
              id="user-role-select"
              value={userRole}
              onChange={(e) => onUserRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-purple-100 text-xs font-semibold focus:outline-none cursor-pointer py-1 pr-1 border-b border-dashed border-purple-700 hover:border-purple-400"
              title="Switch operational role"
            >
              <option value="district_officer" className="bg-slate-900">District Officer (DEOC)</option>
              <option value="disaster_management_authority" className="bg-slate-900">State Authority (SDMA)</option>
              <option value="imd_forecaster" className="bg-slate-900">IMD Nowcast Forecaster</option>
              <option value="field_official" className="bg-slate-900">Field Official</option>
              <option value="administrator" className="bg-slate-900">System Administrator</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
