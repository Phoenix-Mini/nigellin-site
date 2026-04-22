import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  css,
  /\.timeline__card\.left\s*\{[\s\S]*margin-left:\s*calc\(50% - 493px\);/,
  "When desktop cards widen, left cards should shift outward so both sides keep matching distance from the center spine.",
);

assert.match(
  css,
  /\.timeline__card\.right\s*\{[\s\S]*margin-left:\s*calc\(50% \+ 37px\);/,
  "Right cards should continue using the 37px gap from the center spine.",
);

console.log("timeline-card-alignment checks passed");
