'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  CloudRain,
  Zap,
  Waves,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Brain,
} from 'lucide-react';
import { HazardType, AlertItem } from '@/lib/types';
import XaiExplainabilityPanel from '@/components/model/XaiExplainabilityPanel';

interface AiNowcastSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateAlert?: (simulatedAlert: Partial<AlertItem>) => void;
  onGenerateSimulatedAlert?: (simulatedAlert: Partial<AlertItem>) => void;
  onOpenSmsDispatch?: (simulatedAlert: Partial<AlertItem>) => void;
}

export default function AiNowcastSimulatorModal({
  isOpen,
  onClose,
  onGenerateAlert,
  onGenerateSimulatedAlert,
  onOpenSmsDispatch,
}: AiNowcastSimulatorModalProps) {
  const [district, setDistrict] = useState<string>('East Khasi Hills');
  const [hazardType, setHazardType] = useState<HazardType>('cloudburst');

  // 6 Core Predictor Sliders
  const [iwv, setIwv] = useState<number>(62); // integratedWaterVaporKgM2
  const [cape, setCape] = useState<number>(2600); // capeJkg
  const [cin, setCin] = useState<number>(10); // cinJkg
  const [conv, setConv] = useState<number>(0.00045); // lowLevelConvergence
  const [shear, setShear] = useState<number>(24); // verticalWindShearMs
  const [cttDropRate, setCttDropRate] = useState<number>(-11); // cttDropRateCPerMin

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  if (!isOpen) return null;

  // Real-time calculation formula matching backend nowcast simulator API
  const computeNowcastRisk = () => {
    const iwvComponent = (iwv / 70) * 38;
    const capeComponent = (cape / 3500) * 26;
    const cinPenalty = (cin / 100) * -12;
    const cttComponent = (Math.abs(cttDropRate) / 15) * 26;
    const shearConvComponent = (shear / 35) * 12 + (conv / 0.0005) * 10;

    const raw = iwvComponent + capeComponent + cinPenalty + cttComponent + shearConvComponent;
    const riskScore = Math.min(98, Math.max(15, Math.round(raw)));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 55) riskLevel = 'HIGH';
    else if (riskScore >= 35) riskLevel = 'MODERATE';

    const probability = Math.round((riskScore / 100) * 100) / 100;
    const leadTime = riskLevel === 'CRITICAL' ? '1-2 Hours' : riskLevel === 'HIGH' ? '2-4 Hours' : '3-6 Hours';

    const xaiTopDrivers = [
      { factor: `Integrated Water Vapor (${iwv} kg/m²)`, contributionPct: Math.round(Math.max(10, (iwvComponent / Math.max(1, raw)) * 100)) },
      { factor: `Rapid Cloud Top Cooling (${cttDropRate}°C/min)`, contributionPct: Math.round(Math.max(10, (cttComponent / Math.max(1, raw)) * 100)) },
      { factor: `Convective Energy (CAPE ${cape} J/kg)`, contributionPct: Math.round(Math.max(10, (capeComponent / Math.max(1, raw)) * 100)) },
      { factor: `Low-Level Shear & Convergence`, contributionPct: Math.round(Math.max(5, (shearConvComponent / Math.max(1, raw)) * 100)) },
    ];

    return { riskScore, riskLevel, probability, leadTime, xaiTopDrivers };
  };

  const currentCalc = computeNowcastRisk();

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/nowcast/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integratedWaterVaporKgM2: iwv,
          capeJkg: cape,
          cinJkg: cin,
          lowLevelConvergence: conv,
          verticalWindShearMs: shear,
          cttDropRateCPerMin: cttDropRate,
          hazardType,
          district,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSimulationResult(json.data);
      } else {
        setSimulationResult(currentCalc);
      }
    } catch {
      setSimulationResult(currentCalc);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDispatchDrillAlert = () => {
    const result = simulationResult || currentCalc;
    const alertData: Partial<AlertItem> = {
      severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : result.riskLevel === 'HIGH' ? 'WARNING' : 'WATCH',
      title: `[AI NOWCAST DRILL] ${hazardType.toUpperCase().replace('_', ' ')}: ${district}`,
      location: `${district} (Simulated Basin)`,
      district,
      state: district.includes('Khasi') ? 'Meghalaya' : district.includes('Sikkim') ? 'Sikkim' : 'Assam',
      locationId: 'loc-001',
      hazardType,
      riskScore: result.riskScore,
      probability: result.probability,
      forecastWindow: `Lead Time: ${result.leadTime}`,
      factors: [
        `Simulated IWV: ${iwv} kg/m²`,
        `Simulated CAPE: ${cape} J/kg (CIN ${cin} J/kg)`,
        `Simulated CTT Drop Rate: ${cttDropRate}°C/min`,
      ],
      recommendedAction: 'Simulated Nowcast Protocol: Sound emergency sirens & pre-position rescue teams.',
      modelVersion: 'MEGH-MTL-Transformer-v2.4 (Simulator)',
      recipientGroup: 'DEOC Officers, NDRF/SDRF Duty Desk, IMD Nowcast Unit',
      isSimulated: true,
      simulationVariables: {
        integratedWaterVaporKgM2: iwv,
        capeJkg: cape,
        cinJkg: cin,
        lowLevelConvergence: conv,
        verticalWindShearMs: shear,
        cttDropRateCPerMin: cttDropRate,
      },
    };

    if (onGenerateAlert) onGenerateAlert(alertData);
    if (onGenerateSimulatedAlert) onGenerateSimulatedAlert(alertData);
    if (onOpenSmsDispatch) onOpenSmsDispatch(alertData);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-purple-950 text-white p-3.5 flex items-center justify-between border-b border-purple-900">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <div>
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>AI Nowcast Predictor Simulator</span>
                <span className="text-[10px] bg-purple-900 border border-purple-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                  MEGH-MTL-v2.4
                </span>
              </h2>
              <p className="text-[11px] text-purple-200">
                Adjust atmospheric predictors & simulate 2–6h lead-time hazard outputs with Explainable AI attribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-purple-300 hover:text-white hover:bg-purple-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Top Controls: Location & Hazard Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Monitoring Zone / District:</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-700"
              >
                <option value="East Khasi Hills">East Khasi Hills (Cherrapunji / Sohra)</option>
                <option value="North Sikkim">North Sikkim (Mangan / Chungthang)</option>
                <option value="Uttarkashi">Uttarkashi (Bhagirathi Escarpment)</option>
                <option value="Mumbai Suburban">Mumbai Suburban (Mithi River Basin)</option>
                <option value="Kamrup Metropolitan">Kamrup Metro (Guwahati Basin)</option>
                <option value="Central Delhi">Central Delhi (Yamuna Floodplain)</option>
                <option value="Noney / Imphal West">Noney / Imphal West (Ijei Basin)</option>
                <option value="Chennai">Chennai Coastal Plain (Adyar River)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target MTL Hazard Output Head:</label>
              <div className="grid grid-cols-3 gap-1">
                {(['cloudburst', 'severe_thunderstorm', 'flash_flood'] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHazardType(h)}
                    className={`py-1.5 px-2 rounded text-[11px] font-bold cursor-pointer transition-colors text-center ${
                      hazardType === h
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {h === 'cloudburst' ? 'Cloudburst' : h === 'severe_thunderstorm' ? 'Storm' : 'Flash Flood'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6 Core Predictor Sliders */}
          <div>
            <h3 className="font-bold text-xs text-slate-800 mb-2 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Atmospheric & Satellite Predictor Variables (IMDAA + INSAT-3D)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Slider 1: IWV */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">Integrated Water Vapor (IWV):</span>
                  <span className="font-mono text-purple-700 font-bold">{iwv} kg/m²</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="75"
                  step="0.5"
                  value={iwv}
                  onChange={(e) => setIwv(parseFloat(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>20 (Dry)</span>
                  <span>55 (Threshold)</span>
                  <span>75 (Extreme)</span>
                </div>
              </div>

              {/* Slider 2: CAPE */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">CAPE Instability:</span>
                  <span className="font-mono text-purple-700 font-bold">{cape} J/kg</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3800"
                  step="50"
                  value={cape}
                  onChange={(e) => setCape(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>200 (Weak)</span>
                  <span>2000 (Severe)</span>
                  <span>3800 (Extreme)</span>
                </div>
              </div>

              {/* Slider 3: CIN */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">CIN Inhibition Barrier:</span>
                  <span className="font-mono text-purple-700 font-bold">{cin} J/kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={cin}
                  onChange={(e) => setCin(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (Eroded / Explosive)</span>
                  <span>120 (Capped)</span>
                </div>
              </div>

              {/* Slider 4: Low Level Convergence */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">Low-Level Convergence:</span>
                  <span className="font-mono text-purple-700 font-bold">{(conv * 10000).toFixed(1)} × 10⁻⁴ s⁻¹</span>
                </div>
                <input
                  type="range"
                  min="0.00005"
                  max="0.00060"
                  step="0.00001"
                  value={conv}
                  onChange={(e) => setConv(parseFloat(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.5 (Weak)</span>
                  <span>6.0 (Intense)</span>
                </div>
              </div>

              {/* Slider 5: Wind Shear */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">0-6km Vertical Wind Shear:</span>
                  <span className="font-mono text-purple-700 font-bold">{shear} m/s</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="35"
                  step="1"
                  value={shear}
                  onChange={(e) => setShear(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>4 m/s (Unorganized)</span>
                  <span>35 m/s (Supercell)</span>
                </div>
              </div>

              {/* Slider 6: CTT Drop Rate */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">Cloud Top Temp Drop Rate:</span>
                  <span className="font-mono text-purple-700 font-bold">{cttDropRate} °C/min</span>
                </div>
                <input
                  type="range"
                  min="-18"
                  max="0"
                  step="0.5"
                  value={cttDropRate}
                  onChange={(e) => setCttDropRate(parseFloat(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>-18 °C/min (Explosive Updraft)</span>
                  <span>0 °C/min (Stable)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-6 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Executing Transformer Nowcast Inference...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-amber-300" />
                  <span>Run Multi-Task Transformer Inference</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Display */}
          {(simulationResult || currentCalc) && (
            <div className="space-y-3 pt-2">
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-200">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-purple-700" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Predicted Hazard Output: {(simulationResult || currentCalc).riskLevel}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {hazardType.toUpperCase().replace('_', ' ')} Nowcast Lead Time:{' '}
                        <strong>{(simulationResult || currentCalc).leadTime}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="bg-white px-2.5 py-1 rounded border border-purple-300 text-purple-900 font-bold">
                      Score: {(simulationResult || currentCalc).riskScore}/100
                    </span>
                    <span className="bg-purple-700 text-white px-2.5 py-1 rounded font-bold">
                      P: {((simulationResult || currentCalc).probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* XAI Attribution Panel */}
                <XaiExplainabilityPanel
                  drivers={(simulationResult || currentCalc).xaiTopDrivers}
                  hazardType={hazardType}
                  leadTime={(simulationResult || currentCalc).leadTime}
                />
              </div>

              {/* Dispatch Drill Alert Button */}
              <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-md">
                <span className="text-[11px] text-slate-300">
                  Broadcast this simulated nowcast scenario to the live alert queue for drill testing.
                </span>
                <button
                  type="button"
                  onClick={handleDispatchDrillAlert}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <span>Dispatch Nowcast Drill Alert</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
