# Nigellin Publish Dispatch Contract

Goal: define the exact trigger payload, lifecycle states, and status semantics for the Nigel-owned publish flow before implementing Apps Script or GitHub Actions.

## 1. Event type
Preferred GitHub dispatch event type:
- `nigellin_publish_requested`

Why:
- explicit event identity
- easy to filter in GitHub Actions
- easy to extend later without colliding with other workflows

## 2. Trigger source
Primary trigger source:
- sheet-bound Google Apps Script attached to the Nigellin content sheet

Transition fallback source:
- Hermes bridge polling `Sheet1!X2`

## 3. Dispatch payload
Apps Script should send a JSON payload shaped like this:

```json
{
  "event_type": "nigellin_publish_requested",
  "client_payload": {
    "sheet_id": "14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk",
    "sheet_tab": "Sheet1",
    "request_time": "2026-04-23T10:00:00+10:00",
    "requested_by": "Nigel",
    "request_source": "apps_script_menu",
    "request_id": "nigellin-20260423-100000-abc123",
    "status_callback_mode": "apps_script_webapp",
    "status_callback_url": "https://script.google.com/macros/s/REPLACE_ME/exec",
    "status_callback_token": "REPLACE_ME"
  }
}
```

## 4. Required payload fields
- `sheet_id`
  - exact spreadsheet ID used for snapshot generation
- `sheet_tab`
  - currently `Sheet1`
- `request_time`
  - ISO 8601 timestamp including timezone offset
- `requested_by`
  - human-readable actor name or email
- `request_source`
  - expected initial value: `apps_script_menu`
- `request_id`
  - unique request identifier for correlation and idempotency

## 5. Optional payload fields
- `status_callback_mode`
  - current preferred value: `apps_script_webapp`
- `status_callback_url`
  - Apps Script web app endpoint for final write-back
- `status_callback_token`
  - shared secret/token for callback authentication

## 6. Status vocabulary
User-facing sheet status values must be limited to:
- `Idle`
- `Publishing…`
- `Published`
- `No content changes to publish`
- `Publish failed`

These values should be used consistently across:
- Apps Script
- GitHub Actions logs/outputs
- sheet write-back
- manual troubleshooting docs

## 7. Sheet write-back contract
Current status cells:
- `Z3` = status
- `Z4` = last published at
- `Z5` = last commit
- `Z6` = last error

Expected final write-back fields:
- `status`
- `published_at`
- `commit_hash`
- `error`
- `request_id`

If `request_id` is not written into the visible panel, it should still be logged somewhere recoverable by Apps Script for reconciliation.

## 8. Success result shape
Recommended normalized success payload from GitHub Actions back to Apps Script:

```json
{
  "ok": true,
  "request_id": "nigellin-20260423-100000-abc123",
  "status": "Published",
  "published_at": "2026-04-23T10:02:14+10:00",
  "commit_hash": "abc1234",
  "error": ""
}
```

## 9. No-diff result shape
```json
{
  "ok": true,
  "request_id": "nigellin-20260423-100000-abc123",
  "status": "No content changes to publish",
  "published_at": "2026-04-23T10:01:12+10:00",
  "commit_hash": "",
  "error": ""
}
```

## 10. Failure result shape
```json
{
  "ok": false,
  "request_id": "nigellin-20260423-100000-abc123",
  "status": "Publish failed",
  "published_at": "",
  "commit_hash": "",
  "error": "Snapshot failed: token file missing"
}
```

## 11. Idempotency rules
- every publish request must have a unique `request_id`
- Apps Script should refuse or debounce a second publish click while status is `Publishing…`
- GitHub Actions should log and echo the `request_id`
- callback handling should update only the matching request context

## 12. Security rules
- Apps Script -> GitHub trigger must use a secret token stored outside visible sheet cells
- GitHub Actions -> Apps Script callback must include a shared secret/token
- callback endpoint must reject unauthenticated writes
- no secrets should be stored in user-editable cells in `Sheet1`

## 13. Current verified sheet assumptions
- content data lives in `A:W`
- publish controls/status live in `X:Z`
- `X2` is current transition publish checkbox
- `Z2` is legacy/cleared compatibility checkbox
- `Z3:Z6` are current status cells

## 14. Verification checklist
A contract implementation is acceptable only if:
- event type is fixed and documented
- required payload fields are present
- status vocabulary is fixed and documented
- success/no-diff/failure responses are explicit
- idempotency and auth rules are documented
