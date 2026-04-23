# Nigellin Publish Hardening Implementation Plan

> For Hermes: implement this plan with strict TDD. No workflow/script changes before the guardrail tests fail.

Goal: make the Apps Script -> GitHub Actions -> sheet status loop truthful and production-usable by fixing Google credential injection, removing false-success snapshot fallback in CI, and adding a real Apps Script callback path.

Architecture:
- GitHub Actions will receive `repository_dispatch`, write a Google OAuth token JSON secret to a temporary file, and run `pnpm snapshot` with explicit fail-on-error semantics.
- The snapshot script will keep local fallback behavior for operator machines, but will fail hard in CI when fresh snapshot generation is required.
- GitHub Actions will POST final publish status back to an Apps Script web app endpoint using JSON body auth (`callback_token`) because Apps Script web apps can reliably read POST bodies, while custom header handling is not guaranteed in the bound-script callback path.

Tech stack:
- Next.js / Node / tsx snapshot script
- GitHub Actions workflow YAML
- Google Apps Script (`Code.gs` template)
- Node assert-based regression tests under `tests/*.test.mjs`

---

### Task 1: Add regression test for publish workflow hardening
Objective: lock the required behavior before touching workflow/script code.

Files:
- Create: `tests/nigellin-publish-hardening.test.mjs`
- Read: `.github/workflows/nigellin-publish.yml`
- Read: `docs/plans/nigellin-apps-script-template.gs`
- Read: `scripts/fetch_sheet_snapshot.ts`

Expected assertions:
- workflow writes Google token secret from `NIGELLIN_GOOGLE_TOKENS_JSON`
- workflow passes `GOOGLE_TOKENS_PATH` and `NIGEL_FAIL_ON_SNAPSHOT_ERROR=1`
- workflow has a real callback POST step instead of placeholder
- Apps Script template defines `doPost(e)`
- Apps Script callback validates `callback_token` from JSON payload and writes `Z3:Z6`
- snapshot script supports fail-hard mode instead of always retaining stale snapshot

Verification command:
- `node tests/nigellin-publish-hardening.test.mjs`
- Expected initially: FAIL

### Task 2: Harden the snapshot script
Objective: preserve safe local fallback while forcing honest failure in CI.

Files:
- Modify: `scripts/fetch_sheet_snapshot.ts`
- Test: `tests/nigellin-publish-hardening.test.mjs`

Implementation points:
- add `FAIL_ON_SNAPSHOT_ERROR` env handling
- keep existing snapshot only when fail-hard mode is disabled
- in fail-hard mode, throw the original error even if an old snapshot exists
- keep logs explicit about whether fallback was used or blocked

Verification:
- `node tests/nigellin-publish-hardening.test.mjs`
- snapshot-specific assertions pass

### Task 3: Fix GitHub Actions credential injection and callback behavior
Objective: make cloud publish runs capable of fetching fresh sheet data and reporting final result.

Files:
- Modify: `.github/workflows/nigellin-publish.yml`
- Test: `tests/nigellin-publish-hardening.test.mjs`

Implementation points:
- add step to write `${{ secrets.NIGELLIN_GOOGLE_TOKENS_JSON }}` into a temp JSON file
- fail early if that secret is absent
- set `GOOGLE_TOKENS_PATH` and `NIGEL_FAIL_ON_SNAPSHOT_ERROR=1`
- replace callback placeholder with a real POST callback step using request/result fields
- callback should send JSON body with `request_id`, `status`, `published_at`, `commit_hash`, `error`, `sheet_id`, `sheet_tab`, `callback_token`
- callback step should only run when callback URL and token are present

Verification:
- `node tests/nigellin-publish-hardening.test.mjs`
- workflow assertions pass

### Task 4: Implement Apps Script callback endpoint in the template
Objective: make the bound script capable of receiving final status from GitHub Actions.

Files:
- Modify: `docs/plans/nigellin-apps-script-template.gs`
- Test: `tests/nigellin-publish-hardening.test.mjs`

Implementation points:
- add `doPost(e)`
- parse JSON body safely
- validate `callback_token` against Script Properties `NIGELLIN_STATUS_CALLBACK_TOKEN`
- open target spreadsheet by `sheet_id`, load `sheet_tab`, write `Z3:Z6`
- return JSON acknowledgement through `ContentService`

Verification:
- `node tests/nigellin-publish-hardening.test.mjs`
- Apps Script assertions pass

### Task 5: Update setup and ops docs for the new secret + deployment steps
Objective: make the manual path explicit so the final handoff is actually executable.

Files:
- Modify: `docs/plans/nigellin-apps-script-setup.md`
- Modify: `docs/plans/nigellin-publish-secrets-checklist.md`
- Modify: `docs/plans/nigellin-publish-status-callback.md`
- Modify: `docs/plans/nigellin-dry-trigger-execution-checklist.md`

Required doc updates:
- new GitHub secret: `NIGELLIN_GOOGLE_TOKENS_JSON`
- callback auth uses JSON `callback_token`
- Apps Script must be deployed as a web app to obtain `.../exec` callback URL
- callback URL/token are required for full sheet status round-trip
- if callback is not deployed yet, workflow may still publish but sheet status will not auto-finish

Verification:
- read changed docs and ensure terminology matches implementation

### Task 6: Full verification gate
Objective: prove no regressions in site behavior and wrap-up docs.

Commands:
- `node tests/nigellin-publish-hardening.test.mjs`
- `pnpm verify:timeline`
- `pnpm lint`
- `pnpm build`

Success criteria:
- new hardening test passes
- existing timeline regression suite passes
- lint/build pass
- final report includes manual follow-up still required in Google UI:
  - paste updated Apps Script template
  - deploy web app
  - set callback URL/token properties
  - add `NIGELLIN_GOOGLE_TOKENS_JSON` secret in GitHub
