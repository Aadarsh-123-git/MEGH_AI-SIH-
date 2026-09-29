import { NextRequest, NextResponse } from 'next/server';
import { HazardType } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface NowcastSimulationInput {
  integratedWaterVaporKgM2: number;
  capeJkg: number;
  cinJkg: number;
  lowLevelConvergence: number;
  verticalWindShearMs: number;
  cttDropRateCPerMin: number;
  hazardType?: HazardType;
  district?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NowcastSimulationInput = await request.json();

    const iwv = body.integratedWaterVaporKgM2 ?? 45;
    const cape = body.capeJkg ?? 1500;
    const cin = body.cinJkg ?? 30;
    const conv = body.lowLevelConvergence ?? 0.0002;
    const shear = body.verticalWindShearMs ?? 15;
    const cttRate = body.cttDropRateCPerMin ?? -5;
    const hazardType = body.hazardType || 'cloudburst';
    const district = body.district || 'East Khasi Hills';

    // Weighted nowcast scoring algorithm (stand-in for production MTL transformer inference)
    // TODO: Replace with gRPC / REST call to http://${process.env.MODEL_INFERENCE_URL}/predict
    const iwvComponent = (iwv / 70) * 35;
    const capeComponent = (cape / 3500) * 25;
    const cinPenalty = (cin / 100) * -10;
    const cttComponent = (Math.abs(cttRate) / 15) * 25;
    const shearConvComponent = (shear / 35) * 15 + (conv / 0.0005) * 10;

    const rawScore = iwvComponent + capeComponent + cinPenalty + cttComponent + shearConvComponent;
    const riskScore = Math.min(98, Math.max(15, Math.round(rawScore)));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 55) riskLevel = 'HIGH';
    else if (riskScore >= 35) riskLevel = 'MODERATE';

    const probability = Math.round((riskScore / 100) * 100) / 100;

    let leadTimeHours = '3-6 Hours';
    if (riskLevel === 'CRITICAL') leadTimeHours = '1-2 Hours';
    else if (riskLevel === 'HIGH') leadTimeHours = '2-4 Hours';

    let primaryDriver = 'Integrated Water Vapor (IWV) Column Moisture';
    if (Math.abs(cttRate) > 8) primaryDriver = 'Rapid Cloud Top Temperature Drop (-' + Math.abs(cttRate) + '°C/15min)';
    else if (cape > 2200) primaryDriver = 'High Thermodynamic Instability (CAPE ' + cape + ' J/kg)';

    let recommendedAction = 'Routine AWS & INSAT-3D satellite telemetry monitoring.';
    if (riskLevel === 'CRITICAL') {
      recommendedAction = 'Sound emergency sirens for low-lying causeways & drainage basins. Pre-position NDRF/SDRF rescue teams.';
    } else if (riskLevel === 'HIGH') {
      recommendedAction = 'Issue DEOC advisory to municipal flood control cells & transport authorities.';
    }

    const factors = [
      `IWV Column Load: ${iwv} kg/m²`,
      `CAPE Instability: ${cape} J/kg (CIN barrier ${cin} J/kg)`,
      `Cloud Top Temp Drop Rate: ${cttRate}°C/min`,
      `Vertical Wind Shear: ${shear} m/s`,
    ];

    const xaiTopDrivers = [
      { factor: 'IWV Column Moisture Load', contributionPct: Math.round(Math.max(10, (iwvComponent / Math.max(1, rawScore)) * 100)) },
      { factor: 'Cloud Top Cooling Rate', contributionPct: Math.round(Math.max(10, (cttComponent / Math.max(1, rawScore)) * 100)) },
      { factor: 'CAPE Instability Profile', contributionPct: Math.round(Math.max(10, (capeComponent / Math.max(1, rawScore)) * 100)) },
      { factor: 'Low-Level Convergence & Shear', contributionPct: Math.round(Math.max(5, (shearConvComponent / Math.max(1, rawScore)) * 100)) },
    ];

    return NextResponse.json({
      success: true,
      data: {
        district,
        hazardType,
        riskScore,
        riskLevel,
        probability,
        leadTimeHours,
        primaryDriver,
        recommendedAction,
        factors,
        xaiTopDrivers,
        modelVersion: 'MEGH-MTL-Transformer-v2.4 (Simulated Inference)',
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'SIMULATION_ERROR', message: err?.message || 'Failed to compute nowcast simulation' } },
      { status: 400 }
    );
  }
}
