import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  css,
  /\.timeline__card h2\s*\{[\s\S]*margin:\s*0 0 6px;/,
  "Title spacing should tighten to 6px below the heading.",
);

assert.match(
  css,
  /\.entry__body\s*\{[\s\S]*margin-bottom:\s*12px;/,
  "Body copy should use a tighter 12px bottom margin for denser cards.",
);

assert.match(
  css,
  /\.entry__media-strip\s*\{[\s\S]*margin-bottom:\s*12px;/,
  "Media strip spacing should tighten to 12px for a cleaner rhythm.",
);

assert.match(
  css,
  /\.entry__media-tile\.is-empty\s*\{[\s\S]*border:\s*1px dashed rgba\(218, 198, 180, 0\.72\);/,
  "Empty media tiles should use a dashed border treatment instead of a flat block.",
);

assert.match(
  css,
  /\.reflection__teaser\s*\{[\s\S]*font-size:\s*12px;[\s\S]*color:\s*rgba\(108, 88, 74, 0\.78\);/,
  "Reflection teaser should become slightly smaller and more muted for better hierarchy.",
);

console.log("timeline-card-polish checks passed");
