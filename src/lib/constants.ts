export const COTCOT = {
  name: "Barangay Cotcot",
  municipality: "Liloan",
  province: "Cebu",
  region: "Central Visayas",
  lat: 10.3000,
  lon: 123.9833,
} as const;

export const PAGASA_REGIONS = {
  visayas: "https://bagong.pagasa.dost.gov.ph/visayas",
  visayasRSS: "https://jakewarren.github.io/pagasa-feeds/visprsd.rss",
} as const;

export const OPENWEATHER = {
  baseUrl: "https://api.openweathermap.org/data/2.5",
  forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
};

export const FLOOD_THRESHOLDS = {
  rainfall: {
    light: 1,
    moderate: 7.5,
    heavy: 15,
    intense: 30,
    torrential: 50,
  },
  cumulative: {
    watch: 30,
    warning: 60,
    danger: 100,
  },
  windSpeed: {
    strong: 39,
    gale: 62,
    stormForce: 88,
  },
} as const;

export type AlertLevel = "safe" | "watch" | "warning" | "danger";

export const ALERT_LEVELS: Record<AlertLevel, { label: string; color: string; bgColor: string; icon: string }> = {
  safe: {
    label: "Safe",
    color: "text-green-700",
    bgColor: "bg-green-500",
    icon: "✓",
  },
  watch: {
    label: "Watch",
    color: "text-yellow-700",
    bgColor: "bg-yellow-500",
    icon: "⚠",
  },
  warning: {
    label: "Warning",
    color: "text-orange-700",
    bgColor: "bg-orange-500",
    icon: "⚡",
  },
  danger: {
    label: "Danger",
    color: "text-red-700",
    bgColor: "bg-red-500",
    icon: "🚨",
  },
};

export const EVACUATION_CENTERS = [
  { name: "Cotcot Barangay Hall", address: "Barangay Cotcot, Liloan, Cebu", lat: 10.3010, lon: 123.9840 },
  { name: "Cotcot Elementary School", address: "Purok Masagana, Cotcot, Liloan", lat: 10.2990, lon: 123.9820 },
  { name: "Liloan Municipal Gymnasium", address: "Poblacion, Liloan, Cebu", lat: 10.3167, lon: 123.9667 },
  { name: "Sacred Heart School - Cotcot", address: "Cotcot, Liloan, Cebu", lat: 10.3005, lon: 123.9835 },
] as const;

export const EMERGENCY_CONTACTS = [
  { name: "Liloan DRRMO", number: "(032) 273-4321" },
  { name: "Cebu Provincial DRRMO", number: "(032) 253-4891" },
  { name: "Bureau of Fire Protection - Liloan", number: "(032) 273-0000" },
  { name: "Philippine Red Cross - Cebu", number: "(032) 255-7018" },
  { name: "NDRRMC Hotline", number: "911" },
] as const;
