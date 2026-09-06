import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from "lucide-react";

export function WeatherIcon({ code, className, night }: { code: string; className?: string; night?: boolean }) {
  const key = (code || "").slice(0, 2);
  const isNight = night ?? (code ? code.startsWith("0") && code.endsWith("n") : false);
  switch (key) {
    case "01":
      return isNight ? <Moon className={className} aria-hidden="true" /> : <Sun className={className} aria-hidden="true" />;
    case "02":
      return isNight ? <CloudMoon className={className} aria-hidden="true" /> : <CloudSun className={className} aria-hidden="true" />;
    case "03":
    case "04":
      return <Cloud className={className} aria-hidden="true" />;
    case "09":
      return <CloudDrizzle className={className} aria-hidden="true" />;
    case "10":
      return <CloudRain className={className} aria-hidden="true" />;
    case "11":
      return <CloudLightning className={className} aria-hidden="true" />;
    case "13":
      return <CloudSnow className={className} aria-hidden="true" />;
    case "50":
      return <CloudFog className={className} aria-hidden="true" />;
    default:
      return <Cloud className={className} aria-hidden="true" />;
  }
}