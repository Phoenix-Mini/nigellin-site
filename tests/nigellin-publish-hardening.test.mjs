import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const workflow = readFileSync(path.join(root, ".github/workflows/nigellin-publish.yml"), "utf8");
const appsScript = readFileSync(path.join(root, "docs/plans/nigellin-apps-script-template.gs"), "utf8");
const snapshot = readFileSync(path.join(root, "scripts/fetch_sheet_snapshot.ts"), "utf8");

assert.match(
  workflow,
  /NIGELLIN_GOOGLE_TOKENS_JSON/,
  "Workflow should require a GitHub secret containing Google token JSON for cloud snapshot refreshes.",
);

assert.match(
  workflow,
  /GOOGLE_TOKENS_PATH=/,
  "Workflow should export GOOGLE_TOKENS_PATH before running pnpm snapshot.",
);

assert.match(
  workflow,
  /NIGEL_FAIL_ON_SNAPSHOT_ERROR=1/,
  "Workflow should force fail-hard snapshot behavior in CI so stale snapshots do not produce false success.",
);

assert.doesNotMatch(
  workflow,
  /TODO: call Apps Script callback/,
  "Workflow should no longer leave callback handling as a placeholder.",
);

assert.match(
  workflow,
  /python3[\s\S]*CALLBACK_URL|CALLBACK_URL: \$\{\{ github\.event\.client_payload\.status_callback_url \}\}/,
  "Workflow should actively POST final publish status back to the Apps Script callback URL.",
);

assert.match(
  appsScript,
  /function doPost\(e\)/,
  "Apps Script template should expose doPost(e) for GitHub callback write-back.",
);

assert.match(
  appsScript,
  /callback_token/,
  "Apps Script callback should read callback_token from the POST payload.",
);

assert.match(
  appsScript,
  /getProperty\('NIGELLIN_STATUS_CALLBACK_TOKEN'\)/,
  "Apps Script callback should validate the configured callback token.",
);

assert.match(
  appsScript,
  /sheet\.getRange\('Z3'\)\.setValue\(status\)/,
  "Apps Script callback should write status into Z3.",
);

assert.match(
  appsScript,
  /sheet\.getRange\('Z4'\)\.setValue\(publishedAt\)/,
  "Apps Script callback should write published timestamp into Z4.",
);

assert.match(
  appsScript,
  /sheet\.getRange\('Z5'\)\.setValue\(commitHash\)/,
  "Apps Script callback should write commit hash into Z5.",
);

assert.match(
  appsScript,
  /sheet\.getRange\('Z6'\)\.setValue\(errorText\)/,
  "Apps Script callback should write error text into Z6.",
);

assert.match(
  snapshot,
  /const FAIL_ON_SNAPSHOT_ERROR = process\.env\.NIGEL_FAIL_ON_SNAPSHOT_ERROR === "1";/,
  "Snapshot script should support an explicit fail-hard mode for CI.",
);

assert.match(
  snapshot,
  /if \(existingSnapshot && !FAIL_ON_SNAPSHOT_ERROR\)/,
  "Snapshot fallback should only keep stale data when fail-hard mode is disabled.",
);

assert.match(
  snapshot,
  /if \(FAIL_ON_SNAPSHOT_ERROR\)[\s\S]*throw err;/,
  "Snapshot script should rethrow the original error in fail-hard mode.",
);

console.log("nigellin publish hardening guards passed");
