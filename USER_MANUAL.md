# Nigel Life Archive — Final User Manual

Last updated: 2026-04-23

## 1. Purpose
This manual is the final wrap-up guide for nigellin.com.

It explains:
- who edits what
- how the sheet workflow works
- how publishing currently works
- what to verify before calling something done
- what to do if the live site does not update as expected

This document is written for practical handoff, not for internal experimentation.

---

## 2. Current working setup

Project repo:
- `/home/phoenix/.openclaw/workspace/projects/nigellin.com/site`

Public site:
- `https://www.nigellin.com/`

Local review URL:
- `http://localhost:3099/`

Active testing sheet:
- `https://docs.google.com/spreadsheets/d/14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk/edit?usp=drivesdk`

Current local sheet source:
- `.env.local` points local snapshot runs at the Nova testing sheet above.

Current publish bridge:
- script: `~/.hermes/scripts/nigellin_publish_button.py`
- cron job: `nigellin-sheet-publish-button`
- schedule: every 5 minutes

Important boundary:
- project/site files live under `.openclaw`
- Nova/Hermes automation files live under `.hermes`
- do not mix those two roots casually

---

## 3. Roles and editorial ownership

### Charles should mainly do:
- seed timeline entries
- add title
- add body text
- add image/media links
- set visibility
- check basic ordering

### Nigel should mainly do:
- refine voice and reflection
- rewrite or expand `body_reflection_short`
- rewrite or expand `body_reflection_long`
- do final editorial shaping of personal meaning

### Important rule
Missing or placeholder reflections should not block structural completion unless Charles explicitly requests a reflection-polish pass.

---

## 4. The content model

One row = one timeline moment.

Required fields:
- `id`
- `date`
- `category`
- `title`
- `body_main`
- `visibility`

Core compatibility fields:
- `media_type`
- `media_url`

Expanded fields currently used in the testing sheet:
- `media_2_type`
- `media_2_url`
- `media_3_type`
- `media_3_url`
- `media_thumbnail_url`
- `media_alt`
- `media_caption`
- `media_credit`
- `media_source_url`
- `media_items_json`
- `media_2_caption`
- `media_3_caption`

Publish-control area:
- parser/content data lives in `A:W`
- publish controls live in `X:Z`
- do not overwrite the control panel with content text

---

## 5. Recommended editing workflow

### For a simple text-only moment
1. Add a new row.
2. Fill `id`, `date`, `category`, `title`, `body_main`, `visibility`.
3. Set `media_type = none`.
4. Leave media fields blank.

### For one media item
1. Fill the main text fields.
2. Set:
   - `media_type`
   - `media_url`
3. Optionally fill:
   - `media_thumbnail_url`
   - `media_alt`
   - `media_caption`
   - `media_credit`
   - `media_source_url`

### For two or three media items
Use the slot-based path:
- first item: `media_type` + `media_url`
- second item: `media_2_type` + `media_2_url` + optional `media_2_caption`
- third item: `media_3_type` + `media_3_url` + optional `media_3_caption`

This is the preferred human-editable workflow.

### Advanced path
`media_items_json` is still supported, but it should not be the normal editor workflow.
Use it only if there is a specific advanced reason.

---

## 6. Media rules that matter

### Allowed media types
Primary media:
- `none`
- `image`
- `youtube`
- `spotify`

Second/third slot media:
- `none`
- `image`
- `youtube`
- `spotify`
- `external`

### Stable URL rule
Use stable public `https://` URLs only.

Do not use:
- Google Drive share links as site media URLs
- Google Photos share links
- expiring signed URLs
- chat attachment URLs

### Current recommended long-term host
Cloudinary is the recommended long-term public media host for nigellin.com.

### Quick rule of thumb
- `media_url` = where the click goes
- `media_thumbnail_url` = what the preview tile shows

These are not the same thing.

---

## 7. Known parser behavior and traps

### Important range rule
The snapshot parser reads:
- `Sheet1!A1:W1000`

This is deliberate.
It keeps content data in `A:W` and leaves `X:Z` free for publish controls.

### Important stale-JSON trap
If `media_items_json` contains valid old JSON, it can override slot-based fields in confusing ways.

Typical symptom:
- title/body updates appear
- but visible media still looks old

What to do:
1. inspect `media_items_json`
2. if you are using the slot-based workflow, clear `media_items_json`
3. run snapshot again
4. verify `public/data/nigel-archive.json`
5. verify live output

### Category consistency note
The older docs mention `life`, `work`, `other`, but the live testing sheet and current snapshot also use `study`.
Do not blindly “correct” that in the sheet without intentionally aligning parser/docs/editor choices first.

---

## 8. Current publish workflow

### What the user sees in the sheet
The testing sheet includes a publish control panel.

Key cells:
- `X2` = the only user-facing publish checkbox
- `Z2` = legacy compatibility checkbox, should remain cleared
- `Z3` = status
- `Z4` = last published at
- `Z5` = last commit
- `Z6` = last error

### What currently happens when publishing works
1. User ticks `X2`
2. The bridge script checks the sheet
3. It runs `pnpm snapshot`
4. If snapshot JSON changed, it commits `public/data/nigel-archive.json`
5. It pushes to `main`
6. It resets the checkbox
7. It writes status/commit/time back into the sheet

### Important limitation
This is the current transition workflow.
It works, but it is not the ideal final ownership model.

---

## 9. Recommended final long-term publishing model

Best long-term model for Nigel:
- Google Sheet
- sheet-bound Apps Script
- Apps Script triggers GitHub Actions
- GitHub Actions rebuilds snapshot and deploys site

Why this is better:
- does not depend on Nova/Hermes machine being online
- works from Nigel’s own Google Sheet environment
- cleaner ownership after handoff
- easier long-term maintenance

So:
- current checkbox bridge = working transition infrastructure
- Apps Script + GitHub Actions = recommended final architecture

---

## 10. Local review workflow

When reviewing changes locally:
1. go to the site repo
2. run `pnpm dev:review`
3. open `http://localhost:3099/`
4. inspect the hero, timeline, media strip, reflection overlay, and endcap

For wrap-up verification:
- `pnpm verify:timeline`
- `pnpm lint`
- `pnpm build`

Or all together:
- `pnpm verify:wrapup`

---

## 11. What to verify before publishing

Minimum checklist:
- the new/edited row has the correct date
- title is correct
- body text is correct
- visibility is correct
- media types match the linked URLs
- no accidental content was typed into `X:Z`
- `media_items_json` is blank unless intentionally used
- local snapshot updated
- local build passes

Visual checklist:
- no broken preview tile
- no obviously wrong image crop
- no broken reflection overlay
- no duplicated bottom fade
- timeline spacing still feels correct on desktop
- mobile still reads cleanly

---

## 12. What to verify after publishing

Do not stop at “git push succeeded”.
That is not enough.

Check all of these:
1. sheet status cells changed as expected
2. `Last commit` updated if content changed
3. local snapshot JSON contains the expected content
4. live site shows the expected content
5. if the change was layout/CSS-related, verify the live CSS bundle and real rendered layout, not just visible text

---

## 13. If live site looks stale

This happened before and is now a known workflow lesson.

If live still looks old after push:
1. do not assume deployment completed
2. compare local review site vs live site
3. inspect live CSS bundle if the change was style/layout related
4. confirm whether the new rules actually exist in the live CSS asset
5. confirm whether computed layout on live matches local geometry
6. only then decide whether hosting propagation/redeploy is stale

Bottom line:
- `git push` proves repo state
- it does not prove public deployment state

---

## 14. Repo state at final wrap-up start

Verified at session start:
- branch: `main`
- untracked file present: `tests/timeline-endcap-cleanup.test.mjs`
- live cron job present: `nigellin-sheet-publish-button`
- Google Workspace auth: valid
- local `.env.local` points to the Nova testing sheet

This matters because future sessions should start by checking repo cleanliness before assuming wrap-up is complete.

---

## 15. Recommended ongoing workflow

For content-only updates:
1. edit the sheet
2. publish via `X2`
3. verify `Z3:Z6`
4. verify live result

For structural/UI/code updates:
1. update repo code
2. run `pnpm verify:wrapup`
3. review on `http://localhost:3099/`
4. push code
5. verify public site separately

---

## 16. Final plain-English summary

Use the sheet for content.
Use slot-based media fields for normal editing.
Keep reflections as Nigel’s editorial space.
Use `X2` if you are using the current temporary publish bridge.
Always verify live separately from git.
Do not treat temporary transition automation as the final architecture.

The current system works.
The long-term best version is still:
Google Sheet -> Apps Script -> GitHub Actions -> deployment.
