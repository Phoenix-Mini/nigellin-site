# Nigellin Apps Script Setup Guide

Goal: attach a sheet-bound Apps Script to the Nigellin content sheet so Nigel can trigger publish directly from the spreadsheet UI and receive final status write-back from GitHub Actions.

## 1. Open the sheet
Use the active testing/content sheet:
- https://docs.google.com/spreadsheets/d/14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk/edit?usp=drivesdk

## 2. Open the Apps Script editor
In Google Sheets:
- Extensions
- Apps Script

This should create or open a sheet-bound Apps Script project.

## 3. Replace the default script
Copy the contents of:
- `docs/plans/nigellin-apps-script-template.gs`

Paste it into the Apps Script editor, replacing the default file contents.

## 4. Set required script properties
In Apps Script:
- Project Settings
- Script Properties

Create these keys:
- `NIGELLIN_REPO_DISPATCH_URL`
  - example: `https://api.github.com/repos/Phoenix-Mini/nigellin-site/dispatches`
- `NIGELLIN_REPO_DISPATCH_TOKEN`
  - GitHub token with permission to trigger repository dispatch
- `NIGELLIN_STATUS_CALLBACK_URL`
  - required for final status write-back
  - set this only after you deploy the Apps Script as a web app and receive the `.../exec` URL
- `NIGELLIN_STATUS_CALLBACK_TOKEN`
  - shared secret used by GitHub Actions callback POSTs
  - must match the GitHub secret `NIGELLIN_STATUS_CALLBACK_TOKEN`

Important:
- Apps Script settings UI may reject blank values
- if callback is not ready yet, delete the callback property rows instead of leaving them blank

## 5. Save and authorize
- Save the project
- Run `publishNigellinSite` once manually from the Apps Script editor
- Approve the OAuth prompts

Expected permissions include:
- spreadsheet access
- external URL fetch access

## 6. Deploy the callback web app
The final status round-trip requires `doPost(e)` to be reachable through an Apps Script web app URL.

In Apps Script:
- Deploy
- New deployment
- Select type: Web app
- Execute as: Me
- Who has access: Anyone with the link
- Deploy

Copy the resulting `/exec` URL and save it into Script Properties as:
- `NIGELLIN_STATUS_CALLBACK_URL`

## 7. Reload the sheet
Reload the Google Sheet.
A new menu should appear:
- `Nigellin`
  - `Publish site`

## 8. Initial test
Click:
- Nigellin -> Publish site

Expected immediate behavior:
- `Z3` changes to `Publishing…`
- `Z6` clears
- a success alert appears saying the publish request was sent

If callback URL/token are not configured yet:
- publish dispatch can still be sent
- but final status may remain on `Publishing…`

## 9. Failure behavior
If dispatch configuration is missing or invalid:
- `Z3` becomes `Publish failed`
- `Z6` receives a short error message

If callback auth is wrong:
- GitHub Actions may publish successfully
- but `Z3:Z6` will not update at the end

## 10. Important notes
- this Apps Script is intended to replace the checkbox-led mental model, not to coexist forever as a second confusing publish surface
- during transition, keep the Hermes bridge as rollback only
- do not expose tokens in visible sheet cells
- store all auth/config in script properties only
- the final callback authenticates with JSON body field `callback_token`, not a custom header

## 11. GitHub-side dependency
For cloud snapshot refresh to work, GitHub must also contain:
- `NIGELLIN_GOOGLE_TOKENS_JSON`
- `NIGELLIN_STATUS_CALLBACK_TOKEN`

Without the Google token JSON secret, the workflow can start but will fail before producing a fresh snapshot.
