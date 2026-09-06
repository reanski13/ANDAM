<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context — Cotcot Flood Alert

Community flood early-warning + officials command center for Barangay Cotcot, Liloan, Cebu. Next.js 16 App Router, React 19, Tailwind v4, Framer Motion (`motion`), Supabase, Leaflet.

Read these before editing anything:
1. `PROJECT_OVERVIEW.md` — architecture, routes, data flow, auth, env vars, gotchas.
2. `DESIGN.md` — the design system (sky/glass/tokens/motion). New UI must follow it.

`README.md` and `UI_STRUCTURE.md` are outdated — trust `PROJECT_OVERVIEW.md` + `DESIGN.md`.

After changes: `npm run lint` (baseline: 2 pre-existing font warnings in `src/app/layout.tsx`) and `npm run build`. Never commit or print secrets from `.env.local`.
