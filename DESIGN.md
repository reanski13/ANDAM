# Cotcot Flood Alert — "Smart Sky" Design System

UI redesign: iOS Weather-inspired. One continuous sky gradient, frosted-glass cards, a top iOS-style tab bar. Light + dark appearances. UI only — no feature changes.

## Core principle

There is **one continuous background**: a vertical sky gradient driven by three CSS stops (`--sky-top`, `--sky-mid`, `--sky-bottom`). Everything else sits on top as translucent glass. No more color-clashing sidebar vs. hero vs. cards — every surface derives from the same sky.

## Sky conditions

The gradient hue shifts with the live weather via a `data-sky` attribute set on the page root:

| `data-sky` | Triggers |
| --- | --- |
| `clear` | OWM codes `01d/01n`, "clear sky" |
| `clouds` | `02–04`, scattered/broken/overcast |
| `rain` | `09/10`, rain descriptions |
| `storm` | `11`, thunderstorms |
| `night` | nightfall / low-light fallback |

- Dashboard uses the live condition: `skyFor(current.icon, current.description)` from `src/lib/sky.ts`.
- Map / Evacuation / Admin default to `data-sky="clouds"`.
- The `<html>` element carries `data-theme="dark" | "light"`, and Combo works — gradients have **both** dark and light stops.

Fallback when no condition attribute: default "stable blue" stops at `:root`.

## Theme switching

- `localStorage` key: `cotcot-theme` (`"dark"` or `"light"`).
- An inline script in `src/app/layout.tsx` sets `data-theme` **before first paint** (no flash of wrong theme).
- The header's Sun/Moon toggle flips it and persists; preference falls back to `prefers-color-scheme` on first visit.
- Dark is the default.
- `themeColor` in layout viewport = `#142a50` (dark mode clear-sky top).

## Tokens

`src/app/globals.css` — declared in `@theme inline`, resolved from theme vars so `bg-accent`, `text-on-sky`, etc. work in Tailwind v4.

### Core
- `--on-sky` / `--on-sky-dim` / `--on-sky-faint` — text hierarchy
- `--accent` / `--accent-strong` / `--accent-fill` — primary interactive hue
- `--glass-card` / `--glass-elevated` / `--glass-strong` / `--glass-border` — glass surfaces
- `--sky-shadow` + `--glass-inset` — card depth (inset top highlight = iOS)

### Flood status (semantic)
- `--st-safe` / `--st-watch` / `--st-warning` / `--st-danger` (+ `-fill` translucent tints)
- Tailwind: `text-safe`, `bg-watch-fill`, `border-danger`, etc.

### Legacy MD3 aliases
Old project tokens (`bg-surface-container-lowest`, `text-on-surface`, `bg-primary`, `text-secondary`, `text-tertiary`, `text-error`, …) are **remapped** onto Smart Sky equivalents so any untouched component still degrades to glass + sky text. New code should use the new tokens directly.

## Glass system

- `.glass-card` — blur + border + shadow + inset highlight (main cards)
- `.glass-card-flat` — same without shadow (toolbars, floating map panels)
- `.glass-chip` — pill, light blur (location chip, tiny labels)
- `.glass-btn` — secondary pill button
- `.pill-btn` / `.pill-btn-primary` — primary CTA pill (accent gradient)
- `.interactive-card` — hover lift + accent-tinted border + press scale
- `bg-glass` / `bg-glass-elevated` / `bg-glass-strong` — raw utility fills
- `.top-scrim` — gradient from `--sky-top` to transparent behind the sticky header so scrolled content melts into the sky

## Layout & navigation

- Sidebar is **gone**. Navigation lives in `TopTabBar` (a floating glass pill): **Dashboard / Flood Map / Evacuation / Officials**.
- Every page wraps content in `<div className="sky-surface min-h-screen" data-sky="...">`, then `<div className="top-scrim sticky top-0 z-40">` containing `TopTabBar` (dashboard also nests `DashboardHeader`).
- Content container: `max-w-[1400px] mx-auto` with responsive padding.
- Mobile: tab labels collapse to icons below `sm`; brand block hidden below `lg`.

## iOS Weather hero

`WeatherHeroCard` is the "now" moment:
- Borderless on the sky (only a station chip + live dot).
- Huge (5.25rem) extra-light temp, `tabular-nums`, unit + condition icon beside.
- Detail grid beneath uses `divide-glass-border` — humidity / wind / pressure / rainfall / visibility / feels-like.

## Typography

Custom utilities in globals.css (Geist + Material Symbols):
`font-display-lg`, `font-headline-lg/-md`, `font-title-lg/-sm`, `font-body-lg/-md`, `font-label-md/-sm`, `font-metric-huge/-lg` (tabular), `.tabular-nums`.

## Motion

- Duration 180–240ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`; prefer `transform`/`opacity`.
- Entrance: `animate-fade-in` with `delay-100…delay-400` staggering.
- Pulse dots for live telemetry; spin for reload; ping for active status.
- Respects `prefers-reduced-motion`.

### Motion library (Framer Motion / `motion`)

Animations use the `motion` package (`motion/react`). Tokens live in `src/lib/motion-tokens.ts`:

| Token | Value |
| --- | --- |
| `EASE` | `[0.2, 0.7, 0.2, 1]` (matches CSS transitions) |
| `DURATION_FAST` / `DURATION_BASE` / `DURATION_SLOW` | `0.2` / `0.45` / `0.6` s |
| `STAGGER_STEP` | `0.07` s |
| `REVEAL_DISTANCE` | `14` px |

Primitives in `src/components/motion/`:

- `MotionProvider` — mounted once in `layout.tsx`; forces `reducedMotion="user"` so the whole app honors the OS setting.
- `Reveal` — fade + 14px rise on scroll (`whileInView`, once). Default `delay=0`; pages pass `delay` steps of ~0.05 s.
- `Stagger` + `StaggerItem` — 70ms stagger rhythm for card grids and `whileInView` groups.
- `AnimatedNumber` — 0→value tween (spring-ish ease) for live readings; keeps `tabular-nums` so digits don't jitter.

Application rules:

- Tone is **subtle & calm**: no bounces, no spins; fades/rises 300–600ms, gauge/dial sweeps ~1s.
- Tab bar: active pill slides via `layoutId="top-tab-pill"` (`motion.span.top-tab-pill`), tab order preserved with early `layout` only on that pill.
- Home: sections decoupled with `Stagger` (hero pairs, telemetry trio) and `Reveal` (forecast, PAGASA, footer). Numbers that update from telemetry (temp, risk score, rainfall, wind) use `AnimatedNumber`.
- Alert banner: `AnimatePresence` entrance + exit; only banner instance animates (never looped).
- Data-driven number/ring changes are tweened; ambient decoration stays static so refreshing weather never looks jumpy.

## Map dark mode

Dark theme inverts + hue-shifts Leaflet tiles (`[data-theme="dark"] .leaflet-tile-pane`) so OSM stays legible on night gradients; popups and zoom controls re-skinned as glass.

## Rules

- No AI-gen look: no glass-over-dark-purple hero, no rigid three-card rows, no placeholder data — all copy is real Cotcot content.
- Always keep a semantic color on flood status (never text-only).
- New pages: start with the `sky-surface` + `top-scrim` + `TopTabBar` wrapper.
- Keep every component accessible: `aria-label` on icon-only buttons, visible focus outline, contrast ≥ 4.5:1 on `--on-sky` text.