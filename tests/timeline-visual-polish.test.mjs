import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  css,
  /\.hero__card-meta\s*\{[\s\S]*font-family:\s*var\(--font-display\);[\s\S]*font-style:\s*italic;[\s\S]*letter-spacing:\s*0\.04em;/,
  "Archive updated meta should use a more editorial display treatment instead of default system-like styling.",
);

assert.match(
  css,
  /\.entry__body\s*\{[\s\S]*letter-spacing:\s*0\.01em;/,
  "Timeline body text should use slightly looser tracking for easier reading.",
);

assert.match(
  css,
  /\.timeline__card\s*\{[\s\S]*width:\s*min\(456px, calc\(62vw - 104px\)\);/,
  "Desktop cards should widen beyond the previous 432px baseline.",
);

assert.match(
  css,
  /\.timeline__card\.center\s*\{[\s\S]*width:\s*min\(480px, calc\(100vw - 48px\)\);/,
  "The centered opening card should widen with the desktop cards.",
);

console.log("timeline-visual-polish checks passed");
