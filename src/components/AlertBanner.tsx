"use client";

import { motion } from "motion/react";
import { AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";
import { EASE } from "@/lib/motion-tokens";

interface AlertBannerProps {
  level: "info" | "watch" | "warning" | "danger";
  title: string;
  message: string;
  timestamp?: string;
  dismissible?: boolean;
}

const alertStyles = {
  info: {
    accent: "bg-accent",
    icon: Info,
    iconBg: "bg-accent-fill",
    iconColor: "text-accent-strong",
    pillBg: "bg-accent-fill",
    pillText: "text-accent-strong",
    glow: "bg-accent/20",
  },
  watch: {
    accent: "bg-watch",
    icon: AlertTriangle,
    iconBg: "bg-watch-fill",
    iconColor: "text-watch",
    pillBg: "bg-watch-fill",
    pillText: "text-watch",
    glow: "bg-watch/15",
  },
  warning: {
    accent: "bg-warning",
    icon: AlertTriangle,
    iconBg: "bg-warning-fill",
    iconColor: "text-warning",
    pillBg: "bg-warning-fill",
    pillText: "text-warning",
    glow: "bg-warning/15",
  },
  danger: {
    accent: "bg-danger",
    icon: AlertTriangle,
    iconBg: "bg-danger-fill",
    iconColor: "text-danger",
    pillBg: "bg-danger-fill",
    pillText: "text-danger",
    glow: "bg-danger/15",
  },
};

const levelLabels = {
  info: "INFO",
  watch: "WATCH LEVEL",
  warning: "WARNING LEVEL",
  danger: "DANGER LEVEL",
};

export default function AlertBanner({ level, title, message, timestamp, dismissible = true }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const styles = alertStyles[level];
  const Icon = styles.icon;

  if (dismissed) return null;

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: -12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative overflow-hidden rounded-2xl bg-glass border border-glass-border p-4"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.accent}`} />
      {/* Soft glow */}
      <div className={`absolute -right-10 -top-16 w-48 h-48 rounded-full ${styles.glow} blur-3xl pointer-events-none`} />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pl-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${styles.iconBg} ${styles.iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-title-sm text-title-sm text-on-sky font-semibold">{title}</span>
              <span className={`status-chip font-semibold ${styles.pillBg} ${styles.pillText}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "currentColor" }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: "currentColor" }} />
                </span>
                {levelLabels[level]}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-sky-dim mt-0.5 leading-snug">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          {timestamp && (
            <span className="font-label-sm text-label-sm text-on-sky-faint flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              Updated {formatTime(timestamp)}
            </span>
          )}
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-glass hover:bg-glass-elevated text-on-sky-dim transition-all active:scale-95"
              aria-label="Dismiss Advisory"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}