# Nigellin Publish Status Callback Specification

Goal: define how GitHub Actions reports final publish results back to the Google Sheet through an Apps Script web app endpoint.

## 1. Preferred model
Preferred callback path:
- Apps Script triggers GitHub `repository_dispatch`
- GitHub Actions performs publish work
- GitHub Actions calls an Apps Script web app endpoint
- Apps Script validates the callback and writes final status into the sheet

Reason:
- keeps Google Sheet ownership on the Google side
- avoids storing direct Google write logic for status cells inside GitHub workflow code
- keeps visible status behavior aligned with sheet-native ownership

## 2. Endpoint shape
Suggested Apps Script web app endpoint:
- method: `POST`
- URL shape:
  `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`

## 3. Callback request payload
GitHub Actions should send JSON like this:

```json
{
  "request_id": "nigellin-20260423-100000-abc123",
  "status": "Published",
  "published_at": "2026-04-23T00:02:14Z",
  "commit_hash": "abc1234",
  "error": "",
  "sheet_id": "14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk",
  "sheet_tab": "Sheet1",
  "callback_token": "REPLACE_ME"
}
```

## 4. Authentication
Preferred authentication:
- shared secret in the JSON body

Required payload field:
- `callback_token`

Apps Script should compare that value to Script Property:
- `NIGELLIN_STATUS_CALLBACK_TOKEN`

If token mismatch:
- reject the request
- do not write to the sheet

Why JSON body auth here:
- Apps Script bound web apps reliably receive POST body content
- custom headers are less convenient and less predictable in this setup

## 5. Apps Script callback responsibilities
On valid callback:
1. parse JSON body
2. validate required fields
3. confirm target sheet exists
4. map fields into status cells
5. return JSON acknowledgement

Required write-back mapping:
- `Z3` = `status`
- `Z4` = `published_at`
- `Z5` = `commit_hash`
- `Z6` = `error`

## 6. Success response
Apps Script should return JSON like:

```json
{
  "ok": true,
  "request_id": "nigellin-20260423-100000-abc123"
}
```

## 7. Failure response
If callback is invalid:

```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

## 8. Required fields
GitHub Actions callback must include:
- `request_id`
- `status`
- `sheet_id`
- `sheet_tab`
- `callback_token`

Optional but recommended:
- `published_at`
- `commit_hash`
- `error`

## 9. Allowed status values
The callback must only send:
- `Published`
- `No content changes to publish`
- `Publish failed`

Apps Script itself owns the transitional `Publishing…` write.

## 10. Failure handling
If callback fails after a successful publish:
- GitHub Actions log must clearly show callback failure
- sheet may remain stuck on `Publishing…`
- manual recovery procedure should be:
  1. inspect GitHub Actions run result
  2. copy final commit/status/error
  3. manually update `Z3:Z6`
  4. fix callback config before next publish

## 11. Security constraints
- never store callback token in visible sheet cells
- store callback token only in Apps Script Script Properties and GitHub Secrets
- reject GET requests for state-changing operations
- reject callback writes without valid `callback_token`

## 12. Verification checklist
A callback implementation is acceptable only if:
- unauthorized callback is rejected
- valid callback writes correct cells
- success and no-diff statuses both update cleanly
- failure status writes concise error text into `Z6`
