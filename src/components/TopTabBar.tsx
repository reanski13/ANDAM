"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Map as MapIcon, Siren, BarChart3 } from "lucide-react";
import styles from "./TopTabBar.module.css";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const NAV_ITEMS = [
  { key: "/", label: "Dashboard", icon: <LayoutDashboard /> },
  { key: "/map", label: "Flood Map", icon: <MapIcon /> },
  { key: "/evacuation", label: "Evacuation", icon: <Siren /> },
  { key: "/admin", label: "Officials", icon: <BarChart3 /> },
];

// The Officials route guards itself: a non-official visiting /admin is
// redirected to /admin/login (a child path with no tab of its own). Resolve
// every /admin* path to the /admin tab so the pill and active state follow
// the whole Officials flow instead of freezing on the previous tab.
const getActiveKey = (path: string) =>
  path === "/admin" || path.startsWith("/admin/") ? "/admin" : path;

// This component now mounts once, in the root layout, and stays alive across
// every route change. `pathname` just changes on an already-mounted element,
// so the pill's CSS transition animates smoothly between two real positions —
// no "remember where it was and replay on mount" workaround needed anymore.
export default function TopTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeKey = getActiveKey(pathname);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    const active = buttonRefs.current[activeKey];
    if (!container || !pill || !active) return;
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const x = activeRect.left - containerRect.left;
    const w = activeRect.width;
    pill.style.setProperty("--pill-to-x", `${x}px`);
    pill.style.setProperty("--pill-to-w", `${w}px`);
  }, [activeKey]);

  // Runs once on the real mount (app start), and again whenever pathname
  // changes on the still-mounted component. `data-ready` gates the CSS
  // transition so the very first paint snaps into place instead of
  // animating in from 0.
  useIsomorphicLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (container && !container.dataset.ready) {
      // Defer marking ready by a frame so the initial position is committed
      // without a transition, and only subsequent moves animate.
      requestAnimationFrame(() => {
        if (container) container.dataset.ready = "true";
      });
    }
  }, [measure]);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handle = () => measure();
    window.addEventListener("resize", handle);
    const observer = new ResizeObserver(handle);
    observer.observe(container);
    const active = buttonRefs.current[activeKey];
    if (active) observer.observe(active);
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("resize", handle);
      observer.disconnect();
    };
  }, [measure, activeKey]);

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Image
              src="/icon-192.png"
              alt="ANDAM logo"
              width={36}
              height={36}
              className={styles.brandLogo}
            />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>ANDAM</div>
            <div className={styles.brandSub}>Para sa Kaugmaon</div>
          </div>
        </div>

        <nav ref={containerRef} aria-label="Primary" className={styles.nav}>
          <span ref={pillRef} className={styles.pill} aria-hidden="true" />
          {NAV_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                ref={(el) => {
                  buttonRefs.current[item.key] = el;
                }}
                aria-current={isActive ? "page" : undefined}
                className={`${styles.tab} ${isActive ? styles.active : ""}`}
                onClick={() => router.push(item.key)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.status}>
          <span className={styles.statusChip}>
            <span className={styles.statusDot} />
            Monitored
          </span>
        </div>
      </div>
    </div>
  );
}