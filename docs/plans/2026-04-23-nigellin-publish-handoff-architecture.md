# Nigellin Publish Handoff Architecture Plan

> For Hermes: use this plan to implement the Nigel-owned publish flow in small verified steps. Preserve the current transition bridge until the new path is proven end-to-end.

Goal: replace the current Hermes cron-polled publish bridge with a Nigel-owned publishing path where the Google Sheet itself becomes the control surface and triggers a cloud-side rebuild/deploy flow without depending on Nova/Hermes being online.

Architecture:
- Keep the current sheet authoring model and publish status cells.
- Move the publish trigger into a sheet-bound Apps Script owned with the sheet.
- Apps Script will call GitHub Actions using a narrowly defined dispatch contract.
- GitHub Actions will rebuild the snapshot, commit/push if changed, and optionally update sheet status back through a simple callback or direct Sheets API credentials.
- The current `X2` checkbox + Hermes bridge remains the rollback path during cutover.

Tech stack:
- Google Sheets
- Google Apps Script (sheet-bound)
- GitHub Actions
- Existing Next.js repo at `/home/phoenix/.openclaw/workspace/projects/nigellin.com/site`
- Existing snapshot generator: `scripts/fetch_sheet_snapshot.ts`
- Existing transition bridge: `/home/phoenix/.hermes/scripts/nigellin_publish_button.py`

---

## Current verified baseline

Current live transition workflow:
1. Nigel/Charles edits the testing sheet.
2. User ticks `Sheet1!X2`.
3. Hermes cron runs `/home/phoenix/.hermes/scripts/nigellin_publish_button.py` every 5 minutes.
4. The bridge runs `pnpm snapshot`.
5. If `public/data/nigel-archive.json` changed, it commits and pushes to `main`.
6. It resets `X2`/`Z2` to `FALSE` and writes status back to `Z3:Z6`.

Current verified control cells:
- `X2` = user-facing publish request
- `Z2` = legacy/cleared compatibility checkbox
- `Z3` = status
- `Z4` = last published at
- `Z5` = last commit
- `Z6` = last error

Current verified parser boundary:
- content data = `A:W`
- publish controls/status = `X:Z`

Why this must change:
- current publish depends on Hermes/Nova infrastructure being online
- ownership is still partly on our machine
- handoff is cleaner if Nigel controls publish from the sheet side directly

---

## Target end state

Desired long-term flow:
1. Nigel edits the Google Sheet.
2. Nigel clicks a sheet-native Publish menu/button (Apps Script).
3. Apps Script writes `Publishing…` to status cells immediately.
4. Apps Script triggers a GitHub Actions workflow.
5. GitHub Actions checks out the repo and runs `pnpm snapshot` against the approved sheet.
6. If `public/data/nigel-archive.json` changed:
   - commit `content: refresh Nigel archive snapshot`
   - push to `main`
7. GitHub Actions reports back success/failure.
8. Sheet status cells update with:
   - status
   - published time
   - commit hash
   - error (if any)

Success condition:
- Nigel can publish from the Google Sheet
- no cron polling from Hermes is required for normal use
- if Hermes is offline, publish still works

---

## Design decisions to lock before coding

### Decision 1: Trigger method
Preferred: `repository_dispatch`

Reason:
- clean machine-to-machine trigger
- payload can include sheet ID, tab name, request timestamp, and caller version
- easier to keep the workflow private and explicit

Fallback:
- `workflow_dispatch` if repository_dispatch auth/payload handling becomes awkward

Recommendation:
- use `repository_dispatch` with event type `nigellin_publish_requested`

### Decision 2: Source of truth for status write-back
Preferred: Apps Script remains the source of truth for user-facing status transitions.

Pattern:
- Apps Script writes `Publishing…`
- GitHub Actions returns a final status signal
- Apps Script or a callback endpoint writes final state back

Two implementation choices:
A. GitHub Actions updates the sheet directly using Google credentials
B. GitHub Actions calls back into a small Apps Script web app endpoint to update the sheet

Preferred choice:
- B for cleaner sheet ownership and fewer Google service-account concerns inside GitHub

### Decision 3: Keep `X2` or replace it
Preferred final UI:
- keep the status panel in `X:Z`
- replace the checkbox-led mental model with a real Apps Script menu/button action
- keep `X2` only as transition fallback while cutover is underway

### Decision 4: Commit policy
Preferred:
- commit only if `public/data/nigel-archive.json` actually changed
- use message:
  `content: refresh Nigel archive snapshot`

### Decision 5: Rollback path
During cutover:
- do not remove `/home/phoenix/.hermes/scripts/nigellin_publish_button.py`
- do not remove cron job `nigellin-sheet-publish-button`
- instead pause it only after the new path is verified end-to-end

---

## Implementation tasks

### Task 1: Write the publish contract spec

Objective: define the exact payload and status lifecycle before touching any automation.

Files:
- Create: `docs/plans/nigellin-publish-contract.md`
- Reference: `USER_MANUAL.md`
- Reference: `OPERATIONS.md`

Define:
- event type: `nigellin_publish_requested`
- payload fields:
  - `sheet_id`
  - `sheet_tab`
  - `request_time`
  - `requested_by`
  - `request_id`
- status values:
  - `Idle`
  - `Publishing…`
  - `Published`
  - `No content changes to publish`
  - `Publish failed`

Verification:
- spec file exists
- payload keys and status vocabulary are explicit and final

### Task 2: Add GitHub Actions workflow

Objective: create the cloud-side workflow skeleton.

Files:
- Create: `.github/workflows/nigellin-publish.yml`
- Reference: `package.json`
- Reference: `scripts/fetch_sheet_snapshot.ts`

Workflow should:
- trigger on `repository_dispatch`
- verify event type matches `nigellin_publish_requested`
- checkout repo
- setup Node
- install deps with pnpm
- write `.env.local` or env vars for the sheet ID if needed
- run `pnpm snapshot`
- detect diff on `public/data/nigel-archive.json`
- commit/push only when changed
- emit structured outputs for status, commit hash, and error text

Verification:
- workflow YAML validates
- workflow appears in GitHub Actions UI
- dry-run payload path is documented

### Task 3: Create Apps Script menu/button entrypoint

Objective: give Nigel a real in-sheet publish action.

Files:
- Create: `docs/plans/nigellin-apps-script-template.gs`
- Create: `docs/plans/nigellin-apps-script-setup.md`

Apps Script responsibilities:
- add custom menu on open, e.g. `Nigellin → Publish site`
- on publish click:
  - prevent duplicate concurrent publish requests
  - write `Publishing…` to `Z3`
  - write request timestamp somewhere stable
  - trigger GitHub dispatch

Verification:
- script template is complete and paste-ready
- setup doc explains exactly where to paste it in the sheet-bound project

### Task 4: Choose the callback/write-back strategy

Objective: define how final workflow results return to the sheet.

Files:
- Create: `docs/plans/nigellin-publish-status-callback.md`

Preferred design:
- Apps Script publishes request and stores a `request_id`
- GitHub Actions hits an Apps Script web app callback with:
  - request_id
  - final status
  - commit hash
  - published_at
  - error
- Apps Script validates a shared secret before writing to the sheet

Verification:
- callback URL/auth model documented
- expected request/response examples included

### Task 5: Define secrets and auth checklist

Objective: make deployment possible without guesswork.

Files:
- Create: `docs/plans/nigellin-publish-secrets-checklist.md`

Needed items likely include:
- GitHub secret for Apps Script to trigger repository dispatch
- Apps Script secret for callback verification
- Google auth strategy if GitHub needs direct sheet access (only if callback approach is abandoned)

Verification:
- checklist names each secret, where it lives, and who owns it

### Task 6: Add cutover checklist

Objective: migrate safely from transition bridge to final path.

Files:
- Create: `docs/plans/nigellin-publish-cutover-checklist.md`

Checklist should include:
- test dispatch from Apps Script without modifying content
- test content change publish
- verify commit lands on `main`
- verify public site updates
- verify status write-back updates `Z3:Z6`
- test duplicate click behavior
- test failure path messaging
- only after success: pause/remove Hermes cron bridge

Verification:
- checklist is explicit enough for a future session to execute without guessing

---

## Recommended status lifecycle

Initial:
- `Z3 = Idle`
- `Z4 = last published at`
- `Z5 = last commit`
- `Z6 = last error`

When user clicks publish:
- `Z3 = Publishing…`
- `Z6 = ''`

If changed and published:
- `Z3 = Published`
- `Z4 = timestamp`
- `Z5 = short commit hash`
- `Z6 = ''`

If no diff:
- `Z3 = No content changes to publish`
- `Z4 = timestamp`
- `Z5 = ''` or previous hash (must decide and document)
- `Z6 = ''`

If failure:
- `Z3 = Publish failed`
- `Z6 = concise error`

---

## Failure modes to design for

1. Apps Script fires twice
- need lock / duplicate suppression

2. GitHub Actions runs but snapshot has no diff
- should return a clean non-error status

3. GitHub Actions fails before commit
- status must show `Publish failed`
- error must be short enough for sheet cell visibility

4. Callback/write-back fails
- workflow may publish successfully while sheet still says `Publishing…`
- must document manual recovery step

5. Sheet schema changes unexpectedly
- parser may fail or produce wrong data
- workflow should surface clear parser error text

---

## Verification plan for the future implementation session

Minimum end-to-end proof:
1. Create a harmless content change in the testing sheet.
2. Trigger publish using the Apps Script menu/button.
3. Observe `Z3 = Publishing…`
4. Observe GitHub Actions run created.
5. Observe commit created or no-diff status.
6. Observe `Z3:Z6` final state updates correctly.
7. Verify live site reflects the change.
8. Disable Hermes cron bridge only after this passes.

---

## Immediate next action recommendation

For the next implementation session, do this in order:
1. write the dispatch contract spec
2. create `.github/workflows/nigellin-publish.yml`
3. create Apps Script template + setup guide
4. define callback auth/write-back
5. run one dry test before touching the existing cron bridge

---

## Success criteria

This handoff is successful only when:
- Nigel can trigger publish from the sheet without Hermes cron polling
- GitHub Actions performs the rebuild/deploy path
- sheet status cells update correctly
- public deployment is verified independently
- Hermes transition bridge can be paused without loss of publish capability
