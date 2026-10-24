# Contributing To ANDAM

## Before You Start

1. Create a branch from `main`.
2. Copy `.env.local.example` to `.env.local` and provide your own credentials.
3. Run `npm ci`.
4. Read `PROJECT_OVERVIEW.md` and `DESIGN.md`.

## Development Rules

- Never commit `.env*`, keys, tokens, or production data.
- Keep real Barangay Cotcot content and do not fabricate sensor readings.
- Preserve working weather, PAGASA, Supabase, auth, map, and risk behavior unless the change explicitly requires otherwise.
- Use the Smart Sky tokens and existing motion primitives for UI work.
- Keep the Google Stitch export reference-only.

## Before Opening A Pull Request

```bash
npm run lint
npm run build
```

Describe the user-visible change, testing performed, data/provider effects, and any deployment or environment-variable changes. Use the pull-request template and include screenshots for visual work.
