import { FLOOD_THRESHOLDS, type AlertLevel } from "./constants";

export function calculateFloodRisk(params: {
  rainfall1h: number;
  rainfallCumulative6h: number;
  rainfallCumulative12h: number;
  rainfallCumulative24h: number;
  windSpeedKmh: number;
  humidity: number;
}): { level: AlertLevel; reasons: string[]; riskScore: number } {
  const reasons: string[] = [];
  let score = 0;

  if (params.rainfall1h >= FLOOD_THRESHOLDS.rainfall.torrential) {
    score += 40;
    reasons.push(
      `Torrential rainfall: ${params.rainfall1h.toFixed(1)} mm/hr`
    );
  } else if (params.rainfall1h >= FLOOD_THRESHOLDS.rainfall.intense) {
    score += 30;
    reasons.push(
      `Intense rainfall: ${params.rainfall1h.toFixed(1)} mm/hr`
    );
  } else if (params.rainfall1h >= FLOOD_THRESHOLDS.rainfall.heavy) {
    score += 20;
    reasons.push(`Heavy rainfall: ${params.rainfall1h.toFixed(1)} mm/hr`);
  } else if (params.rainfall1h >= FLOOD_THRESHOLDS.rainfall.moderate) {
    score += 10;
    reasons.push(
      `Moderate rainfall: ${params.rainfall1h.toFixed(1)} mm/hr`
    );
  }

  if (params.rainfallCumulative6h >= FLOOD_THRESHOLDS.cumulative.danger) {
    score += 25;
    reasons.push(
      `Extreme cumulative rainfall (6h): ${params.rainfallCumulative6h.toFixed(1)} mm`
    );
  } else if (
    params.rainfallCumulative6h >= FLOOD_THRESHOLDS.cumulative.warning
  ) {
    score += 15;
    reasons.push(
      `High cumulative rainfall (6h): ${params.rainfallCumulative6h.toFixed(1)} mm`
    );
  } else if (params.rainfallCumulative6h >= FLOOD_THRESHOLDS.cumulative.watch) {
    score += 8;
    reasons.push(
      `Moderate cumulative rainfall (6h): ${params.rainfallCumulative6h.toFixed(1)} mm`
    );
  }

  if (params.rainfallCumulative24h >= 150) {
    score += 20;
    reasons.push(
      `Extreme 24h rainfall: ${params.rainfallCumulative24h.toFixed(1)} mm`
    );
  } else if (params.rainfallCumulative24h >= 100) {
    score += 12;
    reasons.push(
      `Heavy 24h rainfall: ${params.rainfallCumulative24h.toFixed(1)} mm`
    );
  }

  if (params.windSpeedKmh >= FLOOD_THRESHOLDS.windSpeed.stormForce) {
    score += 15;
    reasons.push(`Storm-force winds: ${params.windSpeedKmh.toFixed(0)} km/h`);
  } else if (params.windSpeedKmh >= FLOOD_THRESHOLDS.windSpeed.gale) {
    score += 10;
    reasons.push(`Gale-force winds: ${params.windSpeedKmh.toFixed(0)} km/h`);
  } else if (
    params.windSpeedKmh >= FLOOD_THRESHOLDS.windSpeed.strong
  ) {
    score += 5;
    reasons.push(`Strong winds: ${params.windSpeedKmh.toFixed(0)} km/h`);
  }

  if (params.humidity >= 95) {
    score += 5;
    reasons.push("Near-saturated air (high humidity)");
  }

  score = Math.min(score, 100);

  let level: AlertLevel;
  if (score >= 60) {
    level = "danger";
  } else if (score >= 40) {
    level = "warning";
  } else if (score >= 20) {
    level = "watch";
  } else {
    level = "safe";
  }

  if (reasons.length === 0) {
    reasons.push("No significant weather threats detected");
  }

  return { level, reasons, riskScore: score };
}
