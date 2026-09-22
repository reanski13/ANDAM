"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, RefreshCw, Bell, Sun, Moon } from "lucide-react";

interface DashboardHeaderProps {
  lastUpdated?: string | null;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function DashboardHeader({ lastUpdated, onRefresh, loading = false }: DashboardHeaderProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "light" ? "light" : "dark");
      if (lastUpdated == null && !updatedAt) {
        setUpdatedAt(new Date());
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [lastUpdated, updatedAt]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cotcot-theme", next);
    } catch {
      /* ignore */
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    setUpdatedAt(new Date());
    router.refresh();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const updatedText =
    typeof lastUpdated === "string"
      ? formatTime(new Date(lastUpdated))
      : updatedAt
        ? formatTime(updatedAt)
        : null;

  const iconBtn =
    "w-9 h-9 rounded-full flex items-center justify-center bg-glass border border-glass-border text-on-sky-dim hover:text-on-sky hover:bg-glass-elevated transition active:scale-95";

  return (
    <header className="px-3 md:px-6 pt-3 md:pt-4">
      <div className="mx-auto w-full max-w-[1400px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="glass-chip px-3 py-1.5 text-on-sky font-label-sm font-semibold flex items-center gap-1.5 inline-flex">
            <MapPin className="w-3.5 h-3.5 text-accent-strong" />
            <span className="truncate">Brgy. Cotcot, Liloan</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {updatedText && (
            <span className="hidden sm:flex font-label-sm text-label-sm text-on-sky-dim items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              Updated {updatedText}
            </span>
          )}
          <button onClick={toggleTheme} className={iconBtn} title="Toggle light / dark" aria-label="Toggle light or dark appearance">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={handleRefresh} disabled={loading} className={iconBtn} title="Refresh data" aria-label="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className={`${iconBtn} relative`} title="Notifications" aria-label="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}