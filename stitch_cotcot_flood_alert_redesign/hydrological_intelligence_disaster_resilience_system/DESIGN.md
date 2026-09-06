---
name: Hydrological Intelligence & Disaster Resilience System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a60'
  primary: '#00685d'
  on-primary: '#ffffff'
  primary-container: '#008376'
  on-primary-container: '#f4fffb'
  inverse-primary: '#6fd8c8'
  secondary: '#306576'
  on-secondary: '#ffffff'
  secondary-container: '#b3e8fb'
  on-secondary-container: '#34697a'
  tertiary: '#006a46'
  on-tertiary: '#ffffff'
  tertiary-container: '#10855a'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8cf5e4'
  primary-fixed-dim: '#6fd8c8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#b6ebfe'
  secondary-fixed-dim: '#9acee1'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#114d5d'
  tertiary-fixed: '#92f7c3'
  tertiary-fixed-dim: '#75daa8'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005235'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-sm:
    fontFamily: geist
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
  body-lg:
    fontFamily: geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  metric-huge:
    fontFamily: geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  metric-lg:
    fontFamily: geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
  space-3xl: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-page: 2rem
---

## Brand & Style

This design system establishes a high-precision, trustworthy, and mission-critical visual language tailored for disaster risk reduction, real-time hydrological telemetry, and meteorological monitoring. Drawing from modern environmental dashboards and high-fidelity weather interfaces, the aesthetic balances atmospheric softness with scientific clarity. 

The aesthetic synthesizes:
- **Clean Tactical Modernism:** Crisp, pill-oriented metrics, immaculate data hierarchy, and high contrast against crisp white containers.
- **Glassmorphic Environmental Accents:** Frosted telemetry panels, subtle light reflections, and atmospheric depth inspired by specialized weather widgets.
- **Calm Resilience:** Anchored by deep oceanic teals and calming aqua foundations, removing panic-inducing clutter while highlighting risk status with surgical micro-badges.

The system communicates rapid situational awareness for municipal disaster dispatchers, hydrological engineers, and endangered community members alike, ensuring zero cognitive friction during urgent flood transitions.

## Colors

The palette is engineered around high legibility, hydrological association, and instantaneous chromatic risk categorization:

### Structural & Brand Foundations
- **Primary Brand Teal (`#2A9D8F`):** Drives interactive controls, selected states, sensor active tags, and trend graphs.
- **Deep Marine (`#0F4C5C`):** The grounding anchor for primary headings, tactical navigation rails, prominent numbers, and critical telemetry labels.
- **Subtle Aqua Canvas (`#F4F9FB`):** The primary light-mode background tint providing cool, anti-glare, oceanic airiness compared to harsh stark whites.
- **Crisp Surface Light (`#FFFFFF`):** High-clarity elevated containers that isolate charts, data gauges, and spatial maps.

### Environmental Tier Alert System
Status signaling relies on an unambiguous 4-tier alert standard:
- **Safe (`#16A34A`):** Normal river flow, low basin saturation, calm conditions.
- **Watch (`#EAB308`):** Elevated precipitation, catchment filling, advisory level.
- **Warning (`#EA580C`):** Rapid stage rise, spillway engagement, preparedness triggered.
- **Danger (`#DC2626`):** Flash flood imminent, critical crest breach, immediate evacuation.

Each tier maps to a corresponding 10% alpha tint for pill badge backdrops and chart area gradients to maintain readability without overwhelming the interface.

## Typography

The typography leverages **Geist** across all roles to achieve tabular technical precision, pristine legibility on monitors and rugged field mobile displays, and modern geometric balance. 

- **Numerical Hierarchy:** Hydrological sensor readouts (water level stage `m`, flow rate `m³/s`, rainfall rate `mm/h`) utilize `metric-huge` and `metric-lg` paired with tabular figure spacing (`font-variant-numeric: tabular-nums`) to prevent jittering during live streaming updates.
- **Labels and Metadata:** Micro-badges, timestamp pills, and geographic coordinates employ `label-md` and `label-sm` in all-caps or medium tracking to ensure instant scannability.
- **Headings & Body:** Reserved for analytical telemetry reports, sensor station identifiers, and warning narratives with tight letter-spacing that eliminates visual float.

## Layout & Spacing

The design system uses a responsive **Fluid Grid Model** based on an 8-point base rhythm, supplemented by 4-point steps for condensed telemetry tags and status chips.

### Grid Layout Architecture
- **Desktop (12 Columns, breakpoint ≥ 1200px):** Persistent slim navigation rail on the left (72px to 240px wide). Telemetry dashboard content distributes into a 12-column dynamic grid with `1.5rem` gutters. Wide cards (e.g., GIS Flood Inundation Map) occupy 8 columns, while telemetry sensor streams occupy 4 columns.
- **Tablet (8 Columns, breakpoint 768px – 1199px):** 2-column or 3-column stacked metric cards with `1rem` gutters. Map layers condense into full-width cards with slide-over telemetry trays.
- **Mobile (4 Columns, breakpoint < 768px):** Single-column stacked fluid layout with `1rem` page gutters. Critical flood level badges and evacuation switches pin to fixed glassmorphic viewport zones.

Spacing inside sensor cards stays compact (`space-lg` padding on desktop, `space-md` on mobile) to retain high dashboard density without feeling cramped.

## Elevation & Depth

Visual hierarchy combines **crisp tactile container surfaces** with **glassmorphic environmental weather overlays**:

1. **Base Ground:** The background canvas (`#F4F9FB`) sits at ground level (`z-0`), serving as the subtle aquatic horizon.
2. **Elevated Surface Containers:** Cards and chart widgets are formed from `#FFFFFF` elevated with a double-drop ambient shadow: `0 1px 3px rgba(15, 76, 92, 0.04), 0 8px 24px -4px rgba(15, 76, 92, 0.06)`. This deep-marine tint removes the dirty gray cast of traditional neutral shadows.
3. **Glassmorphic Overlays (Weather & Filter Trays):** Quick-filter pills, map controls, and floating weather widgets employ frosted glass properties:
   - `background: rgba(255, 255, 255, 0.72)`
   - `backdrop-filter: blur(12px) saturate(180%)`
   - `border: 1px solid rgba(255, 255, 255, 0.8)`
   - Inner highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.9)`
4. **Alert Float Tier:** Emergency banners, warning drawers, and danger thresholds cast saturated alert shadows using the respective alert color (e.g., Crimson Danger cards carry `0 12px 32px -6px rgba(220, 38, 38, 0.25)`).

## Shapes

The design system utilizes an organic, contemporary roundness profile inspired by fluid flow and friendly weather interfaces:

- **Primary Cards & Containers:** Standardized on `rounded-2xl` (16px / 1rem) for secondary tiles, and `rounded-3xl` (24px / 1.5rem) for primary telemetry modules, charts, and GIS flood maps.
- **Controls, Search, & Telemetry Badges:** Fully pill-shaped (`rounded-full` / 9999px) for search inputs, sensor chips, risk-tier indicator pills, and segment toggles.
- **Micro-Elements:** Nested elements (sparkline backgrounds, sub-statistic containers) mirror outer curvature using proportional internal nesting (e.g., an internal tile inside a 24px parent uses a 12px or 16px radius).

## Components

### 1. Alert Micro-Badges & Status Pills
- **Structure:** Pill-shaped badge containing a pulsing live ping indicator (6px dot), uppercase status label (`label-sm`), and numerical delta.
- **Safe:** `#16A34A` text on `rgba(22, 163, 74, 0.1)` fill.
- **Watch:** `#B45309` text on `rgba(234, 179, 8, 0.12)` fill.
- **Warning:** `#C2410C` text on `rgba(234, 88, 12, 0.12)` fill.
- **Danger:** White text on `#DC2626` solid fill with outer pulsing aura ring.

### 2. Telemetry Metric Cards
- **Structure:** Crisp `#FFFFFF` card (`rounded-3xl`) with padding `1.5rem`.
- **Top Row:** Sensor station identifier, time since last reading (e.g., "Updated 2m ago"), and live signal icon.
- **Center:** Giant metric (`metric-huge`) in `#0F4C5C` alongside small inline unit label (`title-sm`).
- **Footer:** Inline interactive sparkline representing 12-hour sensor drift, bounded by a dashed danger water-level line.

### 3. Weather & Basin Glass Widgets
- Floating overlays with translucent backdrop blur (`rgba(255, 255, 255, 0.75)` + `blur(14px)`).
- Contains atmospheric gradients reflecting ambient conditions (clear teal sky gradient vs. stormy atmospheric dark-teal wash).
- Displays precipitation intensity (`mm/hr`), barometric pressure, wind vector dial, and expected crest time.

### 4. Interactive River Hydrograph & Sparklines
- Smooth Bezier curves rendered with brand teal stroke (`#2A9D8F`, 2.5px width) and an environmental vertical area gradient fading to `rgba(42, 157, 143, 0.0)`.
- Interactive hover tooltips styled with frosted glass and deep-marine typography showing timestamp and exact discharge volume.

### 5. Buttons & Segment Controls
- **Primary Button:** `#2A9D8F` fill, white text, pill-shaped (`rounded-full`), hover brightness 105%, active transform `scale(0.98)`.
- **Urgent Action Button:** `#DC2626` fill with high-contrast white text for "Initiate Siren" or "Evacuation Broadcast".
- **Segmented Control:** Enclosed pill track in `#E8F2F5` with a sliding crisp white pill selector thumb elevated by micro-shadow.

### 6. Inputs & Search Fields
- Rounded pill search bars (`rounded-full`) with subtle aqua surface `#EDF5F7`, deep-marine icons, and clear focus rings in `#2A9D8F` with 3px halo `rgba(42, 157, 143, 0.15)`.