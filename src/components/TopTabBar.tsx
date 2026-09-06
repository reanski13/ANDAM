"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Map as MapIcon,
  Siren,
  BarChart3,
  Droplets,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Flood Map", icon: MapIcon },
  { href: "/evacuation", label: "Evacuation", icon: Siren },
  { href: "/admin", label: "Officials", icon: BarChart3 },
];

export default function TopTabBar() {
  const pathname = usePathname();

  return (
    <div className="px-3 md:px-6 pt-3 md:pt-4">
      <div className="mx-auto w-full max-w-[1400px] flex items-center justify-between gap-3">
        <div className="hidden lg:flex items-center gap-2.5 min-w-0 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-glass text-accent-strong flex items-center justify-center shadow-sm">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-on-sky font-semibold text-sm truncate">Cotcot Flood Alert</div>
            <div className="text-on-sky-faint text-[11px] font-medium truncate">Brgy. Cotcot, Liloan</div>
          </div>
        </div>

        <nav aria-label="Primary" className="top-tabbar mx-auto lg:mx-0">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`top-tab ${isActive ? "top-tab-active" : ""}`}>
                {isActive && <motion.span layoutId="top-tab-pill" className="top-tab-pill" transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }} />}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <span className="glass-chip px-3 py-1.5 text-on-sky-dim font-label-sm text-label-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-slow" />
            Monitored
          </span>
        </div>
      </div>
    </div>
  );
}