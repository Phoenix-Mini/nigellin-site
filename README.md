# Nigel Life Archive — Next.js Front-End

A personal archive website for Nigel Lin, designed as a birthday gift experience focused on reflection (past) and direction (future).

## What this project does
- Renders a timeline-style personal archive at `/`
- Reads cached snapshot data from `public/data/nigel-archive.json`
- Keeps private entries hidden from the public UI
- Supports media blocks (`image`, `youtube`, `spotify`)
- Includes reflection drawers for long-form notes

## Tech stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind/PostCSS for styling support (custom CSS in `src/app/globals.css`)
- Google Sheets API (`googleapis`) for snapshot ingestion

## Project structure
- `src/app/page.tsx` — homepage layout + timeline rendering
- `src/components/TimelineEntry.tsx` — entry card, media, reflection logic
- `src/types/archive.ts` — archive data types
- `scripts/fetch_sheet_snapshot.ts` — Sheet -> JSON snapshot pipeline
- `public/data/nigel-archive.json` — generated cache consumed by UI
- `SNAPSHOT.md` — snapshot pipeline reference
- `SETUP.md` — local environment setup notes

## Local development
1) Install dependencies
   pnpm install

2) Start dev server
   pnpm dev

3) Open
   http://localhost:3000

## Build and quality checks
- Production build: `pnpm build`
- Lint: `pnpm lint`
- Run app in production mode: `pnpm start`

## Snapshot pipeline
This project does not read Google Sheets directly at runtime.
Data is materialized into JSON via:

- Command: `pnpm snapshot`
- Script: `scripts/fetch_sheet_snapshot.ts`
- Output: `public/data/nigel-archive.json`

Environment variables supported:
- `GOOGLE_TOKENS_PATH` (optional; default `~/.openclaw/creds/google-oauth-phoenix-tokens.json`)
- `NIGEL_SHEET_ID` (optional)
- `NIGEL_SHEET_RANGE` (optional; default `Sheet1!A1:K1000`)
- `NIGEL_SNAPSHOT_PATH` (optional)

Fail-safe behavior:
- If sheet fetch fails and an existing snapshot file exists, the script keeps the previous snapshot and exits successfully with a fallback notice.
- If no prior snapshot exists, snapshot fails with an error.

## Content source contract
Expected sheet columns:
`id, date, category, title, body_main, body_reflection_short, body_reflection_long, media_type, media_url, visibility, order_index`

`visibility=private` entries are retained in JSON but filtered out in UI.

## Deployment status
- Codebase currently ready for deployment hardening.
- Domain `nigellin.com` is already registered in Network Solutions.
- Hosting + final DNS/connection steps should be executed when final QA sign-off is complete.
- Deployment runbook: `DEPLOYMENT.md`.
