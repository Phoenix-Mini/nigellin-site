# Nigel Life Archive — Front-End Setup

## Prerequisites
- Node.js 22.x (LTS OK)
- pnpm 10+
- Google OAuth credentials exported in `/home/phoenix/.openclaw/creds/google-oauth-phoenix-tokens.json` (used by snapshot script)

## Install
```bash
cd projects/nigellin.com/site
pnpm install
```

## Develop
```bash
pnpm dev:review
```
The review server runs at <http://localhost:3099>.

## Build
```bash
pnpm build
pnpm start
```

## Snapshot cache
Convert Google Sheet → JSON before deploying:
```bash
pnpm snapshot
```
Outputs to `public/data/nigel-archive.json`. The server component (`page.tsx`) reads this file directly, so rerun snapshot whenever the sheet changes.

Current local review defaults:
- `.env.local` points snapshot runs at the Nova testing sheet (`NIGEL_SHEET_ID=14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk`)
- the parser range is `Sheet1!A1:W1000`, leaving `X:Z` free for publish controls/status

## Artifacts
- Source: `projects/nigellin.com/site/`
- Snapshot script: `scripts/fetch_sheet_snapshot.ts`
- UI status notes: see `design/phase3/` + `UI_STATUS.md` (Drive copy).
