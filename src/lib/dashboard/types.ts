import type { AlertLevel } from "@/lib/constants";

export interface CurrentLocation {
  name: string;
  municipality: string;
  province: string;
}

export interface CurrentReading {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rainfall1h: number;
  condition: string;
  description: string;
  icon: string;
  visibility: number;
}

export interface CurrentResource {
  location: CurrentLocation;
  current: CurrentReading;
}

export interface CumulativeRainMm {
  h6: number;
  h12: number;
  h24: number;
}

export interface RiskResource {
  level: AlertLevel;
  riskScore: number;
  reasons: string[];
  cumulativeRainMm: CumulativeRainMm;
  hourlySamples: number;
}

export interface RainfallStats {
  cumulativeRainMm: CumulativeRainMm;
  hourlySamples: number;
}

export interface ForecastHour {
  timestamp: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pop: number;
  rainMm: number;
  condition: string;
  description: string;
  icon: string;
}

export interface ForecastResource {
  forecast: ForecastHour[];
}

export interface PagasaForecastRow {
  place: string;
  condition: string;
  causedBy: string;
  impacts: string;
}

export interface PagasaWindRow {
  place: string;
  speed: string;
  direction: string;
  coastalWater: string;
}

export interface PagasaResource {
  synopsis: string;
  issuedAt: string | null;
  forecast: PagasaForecastRow[];
  windConditions: PagasaWindRow[];
}

export interface ResourceOk<T> {
  status: "ok";
  data: T;
  fetchedAt: string;
}

export interface ResourceUnavailable {
  status: "unavailable";
  message: string;
  fetchedAt: string;
}

export type ResourcePayload<T> = ResourceOk<T> | ResourceUnavailable;

export type ResourceState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T; fetchedAt: string }
  | { status: "unavailable"; message: string; fetchedAt: string };

export function mapResourceState<T, U>(
  state: ResourceState<T>,
  project: (data: T) => U
): ResourceState<U> {
  if (state.status === "ready") {
    return { status: "ready", data: project(state.data), fetchedAt: state.fetchedAt };
  }
  if (state.status === "unavailable") {
    return { status: "unavailable", message: state.message, fetchedAt: state.fetchedAt };
  }
  return { status: "loading" };
}
