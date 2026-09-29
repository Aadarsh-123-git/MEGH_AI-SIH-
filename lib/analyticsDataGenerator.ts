import { AnalyticsData } from '@/services/analyticsApi';
import {
  RainfallDataPoint,
  IwvTrendDataPoint,
  InstabilityTrendDataPoint,
  RiskTrendDataPoint,
  ModelTelemetry,
} from './types';
import { MOCK_MODEL_TELEMETRY, MOCK_IWV_TREND, MOCK_INSTABILITY_TREND } from './mockData';

export function generateDistrictHazardAnalytics(
  district: string = 'all',
  hazard: string = 'all',
  period: string = '7d'
): AnalyticsData {
  const normDistrict = district.trim();
  const normHazard = hazard.toLowerCase().trim();

  let iwvBase = 58;
  let capeBase = 2400;
  let riskBase = 76;
  let totalAlerts = 48;
  let confirmed = 44;
  let falseAlerts = 3;
  let missed = 1;

  let cloudburstCount = 22;
  let flashFloodCount = 19;
  let stormCount = 31;

  if (normDistrict === 'East Khasi Hills') {
    iwvBase = 64;
    capeBase = 2850;
    cloudburstCount = 38;
    totalAlerts = 62;
    confirmed = 58;
  } else if (normDistrict === 'Uttarkashi') {
    iwvBase = 57;
    capeBase = 2250;
    cloudburstCount = 29;
    totalAlerts = 52;
  } else if (normDistrict === 'Mumbai Suburban') {
    iwvBase = 61;
    capeBase = 2600;
    stormCount = 42;
    totalAlerts = 56;
  }

  // QPE Rainfall Trend
  const timeLabels = period === '24h'
    ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now', '+2h (F)', '+4h (F)', '+6h (F)']
    : ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];

  const rainfallTrend: RainfallDataPoint[] = timeLabels.map((t, idx) => {
    const isForecast = t.includes('(F)');
    const val = Math.round((12 + (idx + 1) * 8) * 10) / 10;
    return {
      time: t,
      observedMm: isForecast ? 0 : val,
      forecastMm: isForecast ? val : Math.round(val * 0.95),
      thresholdMm: 50,
    };
  });

  // IWV Trend
  const iwvTrend: IwvTrendDataPoint[] = ['T-6h', 'T-4h', 'T-2h', 'T-1h', 'Current', '+1h (F)', '+2h (F)', '+4h (F)'].map((t, idx) => {
    const val = Math.min(72, Math.max(30, iwvBase - (4 - idx) * 3.5));
    return {
      time: t,
      observedIwvKgM2: t.includes('(F)') ? 0 : val,
      forecastIwvKgM2: val,
      thresholdKgM2: 55,
    };
  });

  // Instability Trend
  const instabilityTrend: InstabilityTrendDataPoint[] = ['T-6h', 'T-4h', 'T-2h', 'T-1h', 'Current', '+1h (F)', '+2h (F)'].map((t, idx) => {
    const capeVal = Math.min(3200, Math.max(800, capeBase - (4 - idx) * 220));
    const cinVal = Math.max(4, 75 - idx * 12);
    return {
      time: t,
      capeJkg: capeVal,
      cinJkg: cinVal,
      criticalCapeThreshold: 2000,
    };
  });

  // Risk Trend
  const riskTrend: RiskTrendDataPoint[] = ['T-12h', 'T-8h', 'T-4h', 'Current', '+2h (F)', '+4h (F)', '+6h (F)'].map((t, idx) => {
    const curve = Math.sin((idx / 6) * Math.PI * 0.8);
    return {
      time: t,
      averageRisk: Math.min(95, Math.max(20, Math.round(riskBase * 0.6 + curve * 25))),
      peakRisk: Math.min(100, Math.max(30, Math.round(riskBase * 0.85 + curve * 18))),
      threshold: 75,
    };
  });

  const hazardEvents = [
    { type: 'Cloudburst', count: cloudburstCount, critical: Math.round(cloudburstCount * 0.4), resolved: Math.round(cloudburstCount * 0.5) },
    { type: 'Flash Flood', count: flashFloodCount, critical: Math.round(flashFloodCount * 0.35), resolved: Math.round(flashFloodCount * 0.55) },
    { type: 'Severe Thunderstorm', count: stormCount, critical: Math.round(stormCount * 0.25), resolved: Math.round(stormCount * 0.7) },
  ];

  return {
    rainfallTrend,
    iwvTrend,
    instabilityTrend,
    riskTrend,
    hazardEvents,
    alertPerformance: {
      totalAlertsGenerated: totalAlerts,
      confirmedEvents: confirmed,
      falseAlerts: falseAlerts,
      missedEvents: missed,
      precisionPct: 91.4,
      recallPct: 94.2,
      averageLeadTimeHours: 3.4,
    },
    modelInfo: MOCK_MODEL_TELEMETRY,
    timestamp: new Date().toISOString(),
  };
}
