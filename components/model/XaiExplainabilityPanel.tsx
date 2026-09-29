'use client';

import React from 'react';
import { Sparkles, Brain, Cpu, Info } from 'lucide-react';

interface XaiDriver {
  factor: string;
  contributionPct: number;
}

interface XaiExplainabilityPanelProps {
  drivers: XaiDriver[];
  hazardType?: string;
  leadTime?: string;
  className?: string;
}

export default function XaiExplainabilityPanel({
  drivers,
  hazardType = 'severe_weather',
  leadTime = '2-6 Hours',
  className = '',
}: XaiExplainabilityPanelProps) {
  if (!drivers || drivers.length === 0) {
    return null;
  }

  // Sort drivers by contribution percentage descending
  const sortedDrivers = [...drivers].sort((a, b) => b.contributionPct - a.contributionPct);

  return (
    <div className={`bg-slate-900 text-white border border-slate-800 rounded-md p-3.5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-xs tracking-tight text-slate-100 flex items-center gap-1.5">
            <span>Explainable AI (XAI) Feature Attribution</span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/60">
              Integrated Gradients
            </span>
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 font-mono">
          Lead Time: {leadTime}
        </span>
      </div>

      <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
        Meteorological predictor contribution weights driving the current nowcast prediction for{' '}
        <strong className="text-purple-300 capitalize">{hazardType.replace('_', ' ')}</strong>:
      </p>

      {/* Driver Bars */}
      <div className="space-y-2.5">
        {sortedDrivers.map((driver, idx) => (
          <div key={driver.factor} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 font-medium text-slate-200 truncate pr-2">
                <span className="text-[10px] font-mono text-purple-400 font-bold">#{idx + 1}</span>
                <span className="truncate">{driver.factor}</span>
              </div>
              <span className="font-mono font-bold text-purple-300 shrink-0">
                {driver.contributionPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, driver.contributionPct))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-start space-x-1.5 text-[10px] text-slate-400">
        <Info className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
        <span>
          Attribution weights are computed in real-time from the 3D Swin-Transformer cross-attention layers using IMDAA reanalysis and INSAT-3D/3DR satellite channels.
        </span>
      </div>
    </div>
  );
}
