import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  css,
  /\.timeline__ending-fade\s*\{[\s\S]*display:\s*none;/,
  "Desktop endcap should remove the lower duplicate fade segment below 'To be continued…'.",
);

console.log("timeline-endcap-cleanup checks passed");
