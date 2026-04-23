# Nigellin Dry Trigger Execution Checklist

Goal: run the first safe no-content-change dry trigger for the Nigel-owned publish path and prove that the Apps Script -> GitHub Actions trigger chain works before attempting a real publish.

## Preconditions
- `.github/workflows/nigellin-publish.yml` is already pushed to `main`
- active sheet remains:
  `14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk`
- Hermes transition bridge remains available as rollback
- do not modify visible timeline content for this first dry run

## Phase 1: Confirm GitHub side is ready
- [ ] Open GitHub Actions for `Phoenix-Mini/nigellin-site`
- [ ] Confirm workflow `Nigellin Publish From Sheet` is visible
- [ ] Confirm no YAML parse or permissions error is shown for the workflow
- [ ] Confirm repository dispatch events are allowed for this repo/token path

## Phase 2: Prepare required values
- [ ] Generate or confirm a GitHub token for Apps Script with workflow-trigger capability
- [ ] Generate a callback token value for GitHub -> Apps Script write-back
- [ ] Confirm dispatch URL:
  `https://api.github.com/repos/Phoenix-Mini/nigellin-site/dispatches`

## Phase 3: Prepare Apps Script
- [ ] Open the active sheet
- [ ] Extensions -> Apps Script
- [ ] Paste `docs/plans/nigellin-apps-script-template.gs`
- [ ] Save project
- [ ] Set Script Properties:
  - `NIGELLIN_REPO_DISPATCH_URL`
  - `NIGELLIN_REPO_DISPATCH_TOKEN`
  - `NIGELLIN_STATUS_CALLBACK_URL`
  - `NIGELLIN_STATUS_CALLBACK_TOKEN`
- [ ] Run `publishNigellinSite` once from editor to authorize permissions
- [ ] Reload the sheet
- [ ] Confirm menu appears:
  - `Nigellin -> Publish site`

## Phase 4: Prepare GitHub secret
- [ ] Add GitHub Actions secret:
  - `NIGELLIN_STATUS_CALLBACK_TOKEN`
- [ ] If callback URL is not live yet, note that status write-back may remain incomplete in this first dry run

## Phase 5: Run the no-content-change dry trigger
- [ ] Do not edit any timeline content rows
- [ ] Click `Nigellin -> Publish site`
- [ ] Observe immediate sheet result:
  - `Z3 = Publishing…`
  - `Z6` cleared
- [ ] Capture request time

## Phase 6: Verify GitHub Actions run
- [ ] Confirm a new workflow run starts
- [ ] Confirm dispatch payload includes expected `sheet_id` and `request_id`
- [ ] Confirm workflow completes without syntax/auth errors
- [ ] Confirm diff step resolves to no content changes
- [ ] Confirm no new snapshot commit was created

## Phase 7: Verify final status behavior
Best-case expected final result:
- [ ] `Z3 = No content changes to publish`
- [ ] `Z4` updated
- [ ] `Z5` blank or unchanged according to final callback design
- [ ] `Z6` blank

If callback is not fully live yet:
- [ ] workflow still succeeds
- [ ] note that sheet may remain on `Publishing…`
- [ ] record manual update procedure and callback gap explicitly

## Phase 8: Document outcome
Capture:
- [ ] workflow run URL
- [ ] whether dispatch succeeded
- [ ] whether callback succeeded
- [ ] whether sheet status updated fully
- [ ] whether any commit was incorrectly created
- [ ] exact blocker, if any

## Go / No-Go rule after dry trigger
Proceed to real-content publish test only if:
- [ ] GitHub workflow starts correctly
- [ ] workflow completes correctly
- [ ] no accidental content commit occurs
- [ ] status path is understood, even if callback still needs finishing

If dry trigger fails:
- [ ] keep Hermes bridge as primary path
- [ ] do not attempt cutover
- [ ] fix the exact blocker first
