export type SkyCondition = "clear" | "clouds" | "rain" | "storm" | "night";

export function skyFor(icon?: string | null, description?: string | null): SkyCondition {
  const d = (description || "").toLowerCase();
  if (d.includes("thunder") || d.includes("ligthing")) return "storm";
  if (d.includes("rain") || d.includes("shower") || d.includes("drizzle")) return "rain";

  if (!icon) return "clouds";
  const code = icon.toLowerCase();

  if (code.startsWith("11")) return "storm";
  if (code.startsWith("09") || code.startsWith("10")) return "rain";
  if (code.startsWith("01")) {
    return code.endsWith("n") ? "night" : "clear";
  }
  if (code.startsWith("02")) {
    return code.endsWith("n") ? "night" : "clouds";
  }
  if (code.startsWith("03") || code.startsWith("04") || code.startsWith("50") || code.startsWith("13")) return "clouds";

  if (d.includes("clear")) return "clear";
  return "clouds";
}

const SKY_ICON: Record<SkyCondition, string> = {
  clear: "wb_sunny",
  clouds: "partly_cloudy_day",
  rain: "rainy",
  storm: "thunderstorm",
  night: "nights_stay",
};

export function skyLabel(cond: SkyCondition): string {
  return SKY_ICON[cond];
}