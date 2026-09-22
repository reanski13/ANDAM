export const COTCOT = {
  name: "Barangay Cotcot",
  municipality: "Liloan",
  province: "Cebu",
  region: "Central Visayas",
  lat: 10.4276,
  lon: 124.0017,
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
  { name: "Tiltilon Elementary School", address: "Tiltilon, Barangay Cotcot, Liloan, Cebu", lat: 10.43316, lon: 123.99296 },
  { name: "Liloan Central School", address: "Cebu North Road, Poblacion, Liloan, Cebu", lat: 10.40224, lon: 123.99742 },
  { name: "Panphil B. Francisco Gymnasium", address: "Municipal compound, Poblacion, Liloan, Cebu", lat: 10.3996, lon: 124.0 },
  { name: "Weber Hotel", address: "Poblacion, Liloan, Cebu", lat: 10.401, lon: 124.0 },
  { name: "Yati Elementary School", address: "Cebu North Road, Yati, Liloan, Cebu", lat: 10.39352, lon: 123.98301 },
  { name: "Calero Integrated School", address: "J. Pepito Street, Calero, Liloan, Cebu", lat: 10.36374, lon: 123.99849 },
] as const;

export type EmergencyContact = {
  name: string;
  number: string;
  altNumber: string | null;
  source: string;
};

export const EMERGENCY_CONTACTS: readonly EmergencyContact[] = [
  {
    name: "Liloan MDRRMO",
    number: "0956 271 1967",
    altNumber: "0923 905 9077",
    source: "Cebu PDRRMO hotline list, GMA News (Oct 2025)",
  },
  {
    name: "Cebu Provincial DRRMO",
    number: "(032) 255-0046",
    altNumber: null,
    source: "CPDRRMO Public Service Directory (2025)",
  },
  {
    name: "Bureau of Fire Protection - Liloan",
    number: "0905 350 3109",
    altNumber: null,
    source: "Verified municipal fire contact",
  },
  {
    name: "Philippine Red Cross - Cebu",
    number: "143",
    altNumber: "(032) 328-9238",
    source: "Philippine Red Cross (redcross.org.ph)",
  },
  {
    name: "NDRRMC Hotline",
    number: "911",
    altNumber: null,
    source: "NDRRMC nationwide emergency hotline",
  },
];
