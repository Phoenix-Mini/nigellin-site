# OPERATIONS — Nigel Life Archive

This runbook is for maintaining the Nigel Life Archive site after handoff.

## 1) Update content in Google Sheet
1. Open the Nigel testing sheet: https://docs.google.com/spreadsheets/d/14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk/edit?usp=drivesdk
2. Work inside `Sheet1` for timeline rows and `Quick Start` for the editor cheat sheet.
3. Add or edit rows using the agreed schema.
4. Core parser-compatible columns remain:
   id, date, category, title, body_main, body_reflection_short, body_reflection_long, media_type, media_url, visibility, order_index
5. Current expanded authoring columns in the live testing sheet are:
   media_2_type, media_2_url, media_3_type, media_3_url,
   media_thumbnail_url, media_alt, media_caption, media_credit, media_source_url, media_items_json,
   media_2_caption, media_3_caption
6. Preferred human-editable multi-media entry pattern:
   - first item: `media_type` + `media_url`
   - second item: `media_2_type` + `media_2_url` + optional `media_2_caption`
   - third item: `media_3_type` + `media_3_url` + optional `media_3_caption`
7. `media_items_json` remains supported for advanced/backward-compatible cases, but should not be the default workflow for non-technical editors.
8. Use `visibility=private` for entries that should not appear on the public site.
9. For field-by-field rules and media formatting requirements, follow:
   - `../README_sheet.md`
   - `../CONTENT_MEDIA_SCHEMA.md`
10. Do not type over the publish control panel in columns `X:Z`; user interaction only happens at checkbox `X2`.

## 2) Refresh snapshot cache
From project root `projects/nigellin.com/site`:

pnpm snapshot

Notes:
- `.env.local` currently points local snapshot runs at the Nova testing sheet (`NIGEL_SHEET_ID=14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk`).
- The parser reads `Sheet1!A1:W1000`, leaving `X:Z` free for publish controls and status cells.

Expected success output:
Wrote N entries to .../public/data/nigel-archive.json

Fail-safe behavior:
- If Google API fetch fails but snapshot file already exists, script keeps the previous JSON and exits with fallback message.
- If no snapshot exists and fetch fails, command returns error.

## 3) Validate before deploy
Run:

pnpm verify:wrapup

Expected:
- all timeline regression tests exit 0
- lint exits 0
- build exits 0 and route `/` is generated

If you only changed sheet content and want a fast confidence pass before publishing, this shorter sequence is acceptable:

pnpm snapshot
pnpm build

## 4) Deploy checklist
1. Confirm `public/data/nigel-archive.json` has latest generated_at timestamp and the expected `source_sheet` value.
2. Confirm content preview in local `pnpm dev:review` at `http://localhost:3099/`.
3. If using the in-sheet publish checkbox, tick `X2` and wait for status cells in `Z3:Z6` to update.
4. Follow `DEPLOYMENT.md` for hosting behavior and public-site verification.
5. Verify public URL after deployment.
6. If live content or CSS appears stale, verify the live site separately instead of assuming `git push` proved the deploy.

## 5) Rollback plan
If deploy introduces issues:
1. Revert to previous Git commit.
2. Re-run:
   pnpm install
   pnpm build
3. Redeploy previous known-good build.

If snapshot is bad:
1. Restore previous `public/data/nigel-archive.json` from Git history.
2. Commit restore.
3. Redeploy.

## 6) Operational guardrails
- Do not change sheet column headers without updating snapshot parser + types.
- Do not overwrite content columns with control panel text; parser data lives in `A:W`, publish controls in `X:Z`.
- `X2` is the only user-facing publish checkbox. `Z2` is legacy/compatibility only and should remain cleared.
- Do not expose private entries by removing visibility filter in `src/app/page.tsx`.
- Validate media URLs (YouTube/Spotify/image/external) before publishing.
- If using slot-based media (`media_2_*` / `media_3_*`), leave `media_items_json` blank unless you intentionally need the advanced JSON path.
- Charles may seed title, body, and images; Nigel should own reflection writing/refinement unless a specific polish request says otherwise.

## 7) Key files for maintainers
- UI entry point: `src/app/page.tsx`
- Timeline card behavior: `src/components/TimelineEntry.tsx`
- Snapshot script: `scripts/fetch_sheet_snapshot.ts`
- Snapshot output: `public/data/nigel-archive.json`
- Setup notes: `SETUP.md`
- Snapshot docs: `SNAPSHOT.md`
- Editor workflow + wrap-up runbook: `USER_MANUAL.md`
