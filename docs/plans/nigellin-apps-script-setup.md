# Nigellin Apps Script Setup Guide

Goal: attach a sheet-bound Apps Script to the Nigellin content sheet so Nigel can trigger publish directly from the spreadsheet UI.

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
  - GitHub token with permission to trigger repository dispatch and, if needed later, write workflow-related metadata
- `NIGELLIN_STATUS_CALLBACK_URL`
  - leave blank until callback implementation exists
- `NIGELLIN_STATUS_CALLBACK_TOKEN`
  - leave blank until callback implementation exists

## 5. Save and authorize
- Save the project
- Run `publishNigellinSite` once manually from the Apps Script editor
- Approve the OAuth prompts

Expected permissions include:
- spreadsheet access
- external URL fetch access

## 6. Reload the sheet
Reload the Google Sheet.
A new menu should appear:
- `Nigellin`
  - `Publish site`

## 7. Initial test
Click:
- Nigellin -> Publish site

Expected immediate behavior:
- `Z3` changes to `Publishing…`
- `Z6` clears
- a success alert appears saying the publish request was sent

## 8. Failure behavior
If dispatch configuration is missing or invalid:
- `Z3` becomes `Publish failed`
- `Z6` receives a short error message

## 9. Important notes
- this Apps Script is intended to replace the checkbox-led mental model, not to coexist forever as a second confusing publish surface
- during transition, keep the Hermes bridge as rollback only
- do not expose tokens in visible sheet cells
- store all auth/config in script properties only

## 10. Next implementation dependency
This setup becomes truly functional only after the GitHub Actions workflow exists and the callback/write-back path is defined.
