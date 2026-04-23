# Nigellin Publish Secrets Checklist

Goal: list every secret/config item required to move from the current Hermes bridge to the Nigel-owned Apps Script -> GitHub Actions publish flow.

## 1. GitHub Secrets

### `NIGELLIN_STATUS_CALLBACK_TOKEN`
Used by:
- GitHub Actions
Purpose:
- authenticate callback requests into Apps Script web app
Owner:
- repo maintainer / Charles
Required for:
- final status write-back

### `NIGELLIN_GOOGLE_TOKENS_JSON` (only if callback path is abandoned)
Used by:
- GitHub Actions
Purpose:
- direct Google API access from GitHub Actions
Owner:
- Charles
Required for:
- only if GitHub writes to Sheets directly instead of using Apps Script callback
Preferred status:
- avoid if possible

### `NIGELLIN_GOOGLE_CLIENT_SECRET_JSON` (only if direct Google auth is needed)
Used by:
- GitHub Actions
Purpose:
- direct Google OAuth workflow if callback path is abandoned
Preferred status:
- avoid if possible

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
- self-reference or callback target URL for final status write-back flow
Can be blank initially:
- yes, until web app deployment exists

### `NIGELLIN_STATUS_CALLBACK_TOKEN`
Used by:
- Apps Script
Purpose:
- validate GitHub Actions callback requests
Must match GitHub secret:
- yes

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
- avoid giving GitHub direct Google write credentials unless strictly necessary

## 5. Minimum viable secret set
To implement the preferred callback design, minimum required secrets/config are:
- Apps Script script property: `NIGELLIN_REPO_DISPATCH_URL`
- Apps Script script property: `NIGELLIN_REPO_DISPATCH_TOKEN`
- Apps Script script property: `NIGELLIN_STATUS_CALLBACK_TOKEN`
- GitHub secret: `NIGELLIN_STATUS_CALLBACK_TOKEN`

## 6. Verification checklist
Before cutover, confirm:
- all required script properties exist
- callback token matches on both sides
- no secrets are present in visible sheet cells
- no unnecessary Google credentials were copied into GitHub
