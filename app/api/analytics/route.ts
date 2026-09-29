import { NextRequest, NextResponse } from 'next/server';
import { generateDistrictHazardAnalytics } from '@/lib/analyticsDataGenerator';
import { getLiveTelemetryData } from '@/services/telemetryService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const district = searchParams.get('district') || 'all';
  const hazard = searchParams.get('hazard') || 'all';
  const period = searchParams.get('period') || '7d';

  const telemetry = await getLiveTelemetryData();
  const baseAnalytics = generateDistrictHazardAnalytics(district, hazard, period);

  // If live telemetry is active, override rainfall & soil moisture with live Open-Meteo readings
  if (telemetry) {
    baseAnalytics.rainfallTrend = telemetry.rainfallTrend;
    baseAnalytics.iwvTrend = telemetry.iwvTrend;
    baseAnalytics.riskTrend = telemetry.riskTrend;
    baseAnalytics.timestamp = new Date().toISOString();
  }

  return NextResponse.json({
    success: true,
    data: baseAnalytics,
    error: null,
  });
}
