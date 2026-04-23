# Nigellin Publish Cutover Checklist

Goal: replace the Hermes cron bridge with the Nigel-owned Apps Script -> GitHub Actions publish flow without losing publish capability.

## Phase 0: Preserve rollback path
- [ ] Keep `/home/phoenix/.hermes/scripts/nigellin_publish_button.py` unchanged
- [ ] Keep cron job `nigellin-sheet-publish-button` enabled during initial testing
- [ ] Do not remove `X2` fallback behavior yet

## Phase 1: Deploy workflow assets
- [ ] Commit `.github/workflows/nigellin-publish.yml`
- [ ] Confirm workflow appears in GitHub Actions UI
- [ ] Add required GitHub secrets
- [ ] Create/update Apps Script project and script properties
- [ ] Deploy Apps Script as web app if callback mode is used

## Phase 2: Dry trigger test
- [ ] Use Apps Script menu/button without changing sheet content
- [ ] Confirm `Z3` becomes `Publishing…`
- [ ] Confirm a GitHub Actions run starts
- [ ] Confirm final status becomes `No content changes to publish`
- [ ] Confirm no accidental content commit was created

## Phase 3: Real content publish test
- [ ] Make one harmless visible content change in the sheet
- [ ] Trigger publish from Apps Script menu/button
- [ ] Confirm `Z3` becomes `Publishing…`
- [ ] Confirm workflow completes successfully
- [ ] Confirm new `content: refresh Nigel archive snapshot` commit lands on `main`
- [ ] Confirm `Z4` updates
- [ ] Confirm `Z5` shows new short commit hash
- [ ] Confirm `Z6` stays blank
- [ ] Confirm public site reflects the change

## Phase 4: Failure-path test
- [ ] Intentionally test one controlled failure mode (for example invalid callback token in non-production test)
- [ ] Confirm sheet eventually shows `Publish failed`
- [ ] Confirm `Z6` contains concise useful error text
- [ ] Confirm manual recovery steps are documented

## Phase 5: Duplicate-click protection test
- [ ] Trigger publish once
- [ ] Attempt to trigger again before completion
- [ ] Confirm duplicate request is blocked or safely ignored
- [ ] Confirm only one workflow run is treated as authoritative

## Phase 6: Cutover decision
Cutover is allowed only if all of these are true:
- [ ] dry no-diff test passed
- [ ] real content publish test passed
- [ ] failure-path test passed
- [ ] duplicate-click behavior is acceptable
- [ ] status write-back is reliable
- [ ] public site verification succeeded independently

## Phase 7: Retire transition bridge
Only after Phase 6 passes:
- [ ] pause `nigellin-sheet-publish-button`
- [ ] verify Apps Script path still works with Hermes bridge paused
- [ ] update `USER_MANUAL.md`
- [ ] update `OPERATIONS.md`
- [ ] update handoff file to state new primary publish path

## Rollback plan
If cutover fails:
- [ ] re-enable or keep enabled `nigellin-sheet-publish-button`
- [ ] instruct editors to use existing transition workflow (`X2`)
- [ ] document exact failure point
- [ ] fix and retest before attempting cutover again
