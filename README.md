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

2) Start the review server used during final QA
   pnpm dev:review

3) Open
   http://localhost:3099

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
- `NIGEL_SHEET_RANGE` (optional; default `Sheet1!A1:W1000` so parser data stays in A:W and publish controls remain in X:Z)
- `NIGEL_SNAPSHOT_PATH` (optional)

Fail-safe behavior:
- If sheet fetch fails and an existing snapshot file exists, the script keeps the previous snapshot and exits successfully with a fallback notice.
- If no prior snapshot exists, snapshot fails with an error.

## Content source contract
Current parser-compatible columns:
`id, date, category, title, body_main, body_reflection_short, body_reflection_long, media_type, media_url, visibility, order_index`

Current expanded authoring columns in the testing sheet:
`media_2_type, media_2_url, media_3_type, media_3_url, media_thumbnail_url, media_alt, media_caption, media_credit, media_source_url, media_items_json, media_2_caption, media_3_caption`

Important:
- the live parser remains backward-compatible around the original 11 fields
- the preferred human-editable multi-media authoring path is now slot-based:
  - primary item: `media_type` + `media_url`
  - second item: `media_2_type` + `media_2_url` + optional `media_2_caption`
  - third item: `media_3_type` + `media_3_url` + optional `media_3_caption`
- `media_items_json` remains supported as a backward-compatible advanced/fallback path
- testing sheet publish controls live in `X:Z`; keep parser data in `A:W`
- the expanded media fields are documented in:
  - `../README_sheet.md`
  - `../CONTENT_MEDIA_SCHEMA.md`

`visibility=private` entries are retained in JSON but filtered out in UI.

## Deployment status
- Codebase currently ready for deployment hardening.
- Domain `nigellin.com` is already registered in Network Solutions.
- Hosting + final DNS/connection steps should be executed when final QA sign-off is complete.
- Deployment runbook: `DEPLOYMENT.md`.
