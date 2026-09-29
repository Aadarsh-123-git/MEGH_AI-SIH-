'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { AnalyticsData } from '@/services/analyticsApi';
import { generateDistrictHazardAnalytics } from '@/lib/analyticsDataGenerator';
import {
  BarChart3,
  CloudRain,
  Waves,
  TrendingUp,
  Cpu,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Brain,
  Zap,
} from 'lucide-react';

interface AnalyticsChartsProps {
  data: AnalyticsData;
  selectedDistrict?: string;
  onDistrictChange?: (district: string) => void;
  selectedHazard?: string;
  onHazardChange?: (hazard: string) => void;
}

export default function AnalyticsCharts({
  data,
  selectedDistrict: externalDistrict,
  onDistrictChange,
  selectedHazard: externalHazard,
  onHazardChange,
}: AnalyticsChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [prevExternalDistrict, setPrevExternalDistrict] = useState(externalDistrict);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(externalDistrict || 'all');
  const [prevExternalHazard, setPrevExternalHazard] = useState(externalHazard);
  const [selectedHazard, setSelectedHazard] = useState<string>(externalHazard || 'all');

  // Keep internal state in sync with parent selection when external prop changes
  if (externalDistrict !== undefined && externalDistrict !== prevExternalDistrict) {
    setPrevExternalDistrict(externalDistrict);
    setSelectedDistrict(externalDistrict);
  }

  if (externalHazard !== undefined && externalHazard !== prevExternalHazard) {
    setPrevExternalHazard(externalHazard);
    setSelectedHazard(externalHazard);
  }

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    if (onDistrictChange) {
      onDistrictChange(district);
    }
  };

  const handleHazardSelect = (hazard: string) => {
    setSelectedHazard(hazard);
    if (onHazardChange) {
      onHazardChange(hazard);
    }
  };

  // Dynamically compute dataset for selected district, hazard, and time period
  const activeAnalytics = useMemo(() => {
    return generateDistrictHazardAnalytics(selectedDistrict, selectedHazard, selectedPeriod);
  }, [selectedDistrict, selectedHazard, selectedPeriod]);

  const { rainfallTrend, iwvTrend, instabilityTrend, riskTrend, hazardEvents, alertPerformance, modelInfo } = activeAnalytics;

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div>
          <h2 className="font-bold text-sm text-slate-900 flex items-center">
            <BarChart3 className="w-4 h-4 mr-1.5 text-purple-700" />
            Atmospheric Analytics & MTL Transformer Evaluation
          </h2>
          <div className="flex items-center space-x-2 mt-0.5">
            <p className="text-[11px] text-slate-500">
              Integrated Water Vapor (IWV), CAPE/CIN thermodynamic profile, and multi-task nowcasting head verification
            </p>
            <span className="inline-flex items-center text-[10px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
              <Filter className="w-3 h-3 mr-1 text-purple-600" />
              {selectedDistrict === 'all' ? 'All Monitoring Stations' : selectedDistrict} &bull;{' '}
              {selectedHazard === 'all'
                ? 'All Severe Hazards'
                : selectedHazard === 'cloudburst'
                ? 'Cloudbursts'
                : selectedHazard === 'flash_flood'
                ? 'Flash Floods'
                : 'Severe Thunderstorms'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictSelect(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-800"
          >
            <option value="all">All Stations / Basins</option>
            <option value="East Khasi Hills">East Khasi Hills (Cherrapunji)</option>
            <option value="North Sikkim">North Sikkim (Mangan)</option>
            <option value="Uttarkashi">Uttarkashi (Bhagirathi)</option>
            <option value="Mumbai Suburban">Mumbai Suburban (Mithi)</option>
            <option value="Kamrup Metropolitan">Guwahati (Bharalu Basin)</option>
            <option value="Central Delhi">Central Delhi (Yamuna)</option>
            <option value="Noney / Imphal West">Noney (Ijei River)</option>
            <option value="Chennai">Chennai Coastal Plain</option>
          </select>

          <select
            value={selectedHazard}
            onChange={(e) => handleHazardSelect(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-800"
          >
            <option value="all">All Severe Hazards</option>
            <option value="cloudburst">Cloudbursts</option>
            <option value="flash_flood">Flash Floods</option>
            <option value="severe_thunderstorm">Severe Thunderstorms</option>
          </select>

          <div className="flex rounded border border-slate-300 bg-slate-100 p-0.5">
            {(['24h', '7d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  selectedPeriod === period ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections 1 & 2: IWV Column Moisture Trend & CAPE/CIN Instability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: IWV Trend */}
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                1. Integrated Water Vapor (IWV) Column Load (kg/m²)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">INSAT-3D WV + IMDAA</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={iwvTrend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[20, 80]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <ReferenceLine y={55} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Cloudburst Threshold (55 kg/m²)', fill: '#dc2626', fontSize: 9 }} />
                <Area type="monotone" dataKey="forecastIwvKgM2" name="Forecast IWV" stroke="#8b5cf6" fill="#c084fc" fillOpacity={0.25} />
                <Line type="monotone" dataKey="observedIwvKgM2" name="Observed IWV" stroke="#2563eb" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: CAPE/CIN Instability */}
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-xs text-slate-900">
                2. Thermodynamic Instability (CAPE vs CIN Barrier) (J/kg)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Thermodynamic Sounding</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={instabilityTrend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" domain={[500, 3500]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 150]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <ReferenceLine yAxisId="left" y={2000} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Severe CAPE (2000 J/kg)', fill: '#d97706', fontSize: 9 }} />
                <Line yAxisId="left" type="monotone" dataKey="capeJkg" name="CAPE (J/kg)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="cinJkg" name="CIN (J/kg - Barrier)" stroke="#0284c7" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sections 3 & 4: Risk Trajectory & Hazard Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 3: Risk Trajectory */}
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                3. Composite Severe Weather Nowcast Trajectory
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">MTL Transformer Output</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <ReferenceLine y={75} stroke="#dc2626" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="peakRisk" name="Peak Sector Vulnerability" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="averageRisk" name="Regional Mean Risk" stroke="#7e22ce" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Hazard Event Breakdown */}
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <h3 className="font-semibold text-xs text-slate-900">
                4. Severe Weather Incident Occurrence Breakdown (Past 30 Days)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Verified Logs</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardEvents} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" name="Total Events" fill="#475569" radius={[3, 3, 0, 0]} />
                <Bar dataKey="critical" name="Critical Surge Triggers" fill="#7e22ce" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sections 5 & 6: Alert Performance & MTL Transformer Specification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 5: Alert Performance */}
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 mb-2.5">
              <Target className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                5. Nowcast Verification & Verification Matrix
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs mb-3">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Nowcasts</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {alertPerformance.totalAlertsGenerated}
                </span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">Confirmed Ground Truth</span>
                <span className="text-base font-bold font-mono text-emerald-800">
                  {alertPerformance.confirmedEvents}
                </span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                <span className="text-[10px] text-amber-700 block">False Alarms</span>
                <span className="text-base font-bold font-mono text-amber-800">
                  {alertPerformance.falseAlerts}
                </span>
              </div>
              <div className="bg-red-50 p-2.5 rounded border border-red-200">
                <span className="text-[10px] text-red-700 block">Missed Events</span>
                <span className="text-base font-bold font-mono text-red-800">
                  {alertPerformance.missedEvents}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Precision (PPV)</span>
                <span className="text-base font-bold font-mono text-purple-900">
                  {alertPerformance.precisionPct}%
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Recall Sensitivity</span>
                <span className="text-base font-bold font-mono text-purple-900">
                  {alertPerformance.recallPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Average Predictive Warning Lead Time:</span>
            <strong className="text-purple-900 font-mono">
              {alertPerformance.averageLeadTimeHours} Hours Advance Notice
            </strong>
          </div>
        </div>

        {/* Section 6: Model Specification & Per-Head Metrics */}
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 mb-2.5">
              <Cpu className="w-4 h-4 text-purple-700" />
              <h3 className="font-semibold text-xs text-slate-900">
                6. Multi-Task Spatiotemporal Transformer Specs
              </h3>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Architecture:</span>
                <span className="font-semibold text-slate-900">{modelInfo.activeModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Version Identifier:</span>
                <span className="font-mono text-slate-800">{modelInfo.modelVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Training Corpus:</span>
                <span className="text-slate-800">{modelInfo.trainingPeriod}</span>
              </div>
            </div>

            {/* Per-Head Metrics */}
            {modelInfo.perHeadMetrics && (
              <div>
                <span className="font-semibold text-[11px] text-slate-700 block mb-1.5">
                  Per-Hazard Head Performance (2-6h Lead Time Window):
                </span>
                <div className="space-y-1 text-[11px]">
                  {modelInfo.perHeadMetrics.map((head) => (
                    <div key={head.hazard} className="flex items-center justify-between bg-purple-50/60 p-1.5 rounded border border-purple-100 text-slate-700">
                      <span className="font-semibold capitalize text-purple-950">{head.hazard.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-3 font-mono text-[10px]">
                        <span>F1: <strong>{(head.f1Score * 100).toFixed(0)}%</strong></span>
                        <span>Median Lead: <strong className="text-purple-900">{head.leadTimeHoursMedian}h</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-2">
            Fused 3D Swin-Transformer backbone with cross-attention over IMDAA & MOSDAC satellite telemetry.
          </div>
        </div>
      </div>
    </div>
  );
}
