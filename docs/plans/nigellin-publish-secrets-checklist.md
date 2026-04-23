# Nigellin Publish Secrets Checklist

Goal: list every secret/config item required to move from the current Hermes bridge to the Nigel-owned Apps Script -> GitHub Actions publish flow.

## 1. GitHub Secrets

### `NIGELLIN_STATUS_CALLBACK_TOKEN`
Used by:
- GitHub Actions
Purpose:
- authenticate callback requests into the Apps Script web app
Owner:
- repo maintainer / Charles
Required for:
- final status write-back
Must match:
- Apps Script Script Property `NIGELLIN_STATUS_CALLBACK_TOKEN`

### `NIGELLIN_GOOGLE_TOKENS_JSON`
Used by:
- GitHub Actions
Purpose:
- provide the Google OAuth token JSON required for `pnpm snapshot` on the GitHub runner
Owner:
- Charles
Required for:
- all cloud publish runs that need fresh Sheet -> JSON snapshot generation
Format:
- raw JSON content copied from the working local token file
- current source file on Hermes:
  `~/.openclaw/creds/google-oauth-phoenix-tokens.json`
Important:
- this is now required for the current GitHub Actions publish workflow
- without it, the workflow must fail instead of pretending success with stale snapshot data

## 2. Apps Script Script Properties

### `NIGELLIN_REPO_DISPATCH_URL`
Used by:
- Apps Script
Example:
- `https://api.github.com/repos/Phoenix-Mini/nigellin-site/dispatches`
Purpose:
- GitHub repository dispatch endpoint

### `NIGELLIN_REPO_DISPATCH_TOKEN`
Used by:
- Apps Script
Purpose:
- authenticate dispatch request to GitHub
Requirement:
- token must be scoped narrowly enough for workflow triggering

### `NIGELLIN_STATUS_CALLBACK_URL`
Used by:
- Apps Script
Purpose:
- Apps Script web app `/exec` URL for final status write-back
Can be blank initially:
- no, not if you want the full round-trip to complete
Setup note:
- if callback is not deployed yet, delete the property row instead of leaving an empty value

### `NIGELLIN_STATUS_CALLBACK_TOKEN`
Used by:
- Apps Script
Purpose:
- validate GitHub Actions callback requests
Must match GitHub secret:
- yes
Transport detail:
- GitHub sends this as JSON body field `callback_token`

## 3. Human-owned config facts

### Approved spreadsheet ID
Current value:
- `14td7VjK0DaPsn1aACAjGq4neojtX1vxwqjefYQbxRAk`
Purpose:
- sheet-bound Apps Script and workflow payload source

### Approved repo remote
Current value:
- `https://github.com/Phoenix-Mini/nigellin-site.git`
Purpose:
- dispatch target and workflow repo

## 4. Recommended token ownership model
Preferred:
- Apps Script owns the GitHub dispatch token
- GitHub Actions owns the Apps Script callback token
- GitHub Actions temporarily receives Google token JSON only for snapshot generation

## 5. Minimum viable secret set
To implement the current production workflow, minimum required secrets/config are:
- GitHub secret: `NIGELLIN_GOOGLE_TOKENS_JSON`
- GitHub secret: `NIGELLIN_STATUS_CALLBACK_TOKEN`
- Apps Script script property: `NIGELLIN_REPO_DISPATCH_URL`
- Apps Script script property: `NIGELLIN_REPO_DISPATCH_TOKEN`
- Apps Script script property: `NIGELLIN_STATUS_CALLBACK_URL`
- Apps Script script property: `NIGELLIN_STATUS_CALLBACK_TOKEN`

## 6. Verification checklist
Before cutover, confirm:
- all required GitHub secrets exist
- all required script properties exist
- callback token matches on both sides
- Apps Script has been deployed as a web app and the `/exec` URL is stored in script properties
- no secrets are present in visible sheet cells
