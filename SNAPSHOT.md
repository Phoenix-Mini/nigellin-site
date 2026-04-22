# Snapshot Pipeline

Script: `pnpm snapshot`

## Purpose
Fetch the Nigel Life Archive Google Sheet and materialize a cached JSON file at `public/data/nigel-archive.json`. Front-end consumes this JSON instead of hitting Sheets live.

## Requirements
- Google OAuth token JSON at `~/.openclaw/creds/google-oauth-phoenix-tokens.json` (default path). Override with `GOOGLE_TOKENS_PATH` if needed.
- `.env.local` is loaded by the snapshot script, so local runs can point to the active testing sheet without exporting environment variables manually.
- Env vars (optional):
  - `NIGEL_SHEET_ID` (defaults to production sheet ID)
  - `NIGEL_SHEET_RANGE` (defaults `Sheet1!A1:W1000` so parser data stays in A:W while publish controls live in X:Z)
  - `NIGEL_SNAPSHOT_PATH` (defaults `public/data/nigel-archive.json`)

## Run
```bash
cd projects/nigellin.com/site
pnpm snapshot
```
Output example:
```json
{
  "generated_at": "2026-04-09T14:20:10.123Z",
  "total": 3,
  "entries": [ ... ]
}
```

## Automation Hook
- GitHub Action / cron can run `pnpm snapshot && git commit` daily.
- For manual refresh, run the command locally and deploy the updated JSON.
- Current transition workflow also supports an in-sheet publish control panel:
  - data range: `A:W`
  - user-facing publish checkbox: `X2`
  - legacy cleared checkbox: `Z2`
  - status cells: `Z3:Z6`
- The current local publish bridge script is `~/.hermes/scripts/nigellin_publish_button.py` and the scheduled job is `nigellin-sheet-publish-button` every 5 minutes.
