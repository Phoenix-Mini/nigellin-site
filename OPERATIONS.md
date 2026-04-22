# OPERATIONS — Nigel Life Archive

This runbook is for maintaining the Nigel Life Archive site after handoff.

## 1) Update content in Google Sheet
1. Open the Nigel Life Archive sheet.
2. Add or edit rows using the agreed schema.
3. Core parser-compatible columns remain:
   id, date, category, title, body_main, body_reflection_short, body_reflection_long, media_type, media_url, visibility, order_index
4. Expanded authoring columns now reserved for content/media linking:
   media_2_type, media_2_url, media_3_type, media_3_url,
   media_thumbnail_url, media_alt, media_caption, media_credit, media_source_url, media_items_json
5. Preferred human-editable multi-media entry pattern:
   - first item: `media_type` + `media_url`
   - second item: `media_2_type` + `media_2_url`
   - third item: `media_3_type` + `media_3_url`
6. `media_items_json` remains supported for advanced/backward-compatible cases, but should not be the default workflow for non-technical editors.
7. Use `visibility=private` for entries that should not appear on the public site.
8. For field-by-field rules and media formatting requirements, follow:
   - `../README_sheet.md`
   - `../CONTENT_MEDIA_SCHEMA.md`

## 2) Refresh snapshot cache
From project root `projects/nigellin.com/site`:

pnpm snapshot

Expected success output:
Wrote N entries to .../public/data/nigel-archive.json

Fail-safe behavior:
- If Google API fetch fails but snapshot file already exists, script keeps the previous JSON and exits with fallback message.
- If no snapshot exists and fetch fails, command returns error.

## 3) Validate before deploy
Run:

pnpm lint
pnpm build

Expected:
- lint exits 0
- build exits 0 and route `/` is generated

## 4) Deploy checklist
1. Confirm `public/data/nigel-archive.json` has latest generated_at timestamp.
2. Confirm content preview in local `pnpm dev`.
3. Follow `DEPLOYMENT.md` for Vercel + Network Solutions DNS setup.
4. Verify public URL after deployment.

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
- Do not expose private entries by removing visibility filter in `src/app/page.tsx`.
- Validate media URLs (YouTube/Spotify/image) before publishing.

## 7) Key files for maintainers
- UI entry point: `src/app/page.tsx`
- Timeline card behavior: `src/components/TimelineEntry.tsx`
- Snapshot script: `scripts/fetch_sheet_snapshot.ts`
- Snapshot output: `public/data/nigel-archive.json`
- Setup notes: `SETUP.md`
- Snapshot docs: `SNAPSHOT.md`
