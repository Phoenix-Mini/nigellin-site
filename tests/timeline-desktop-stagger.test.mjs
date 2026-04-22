import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  css,
  /@media \(min-width: 961px\)\s*\{[\s\S]*\.timeline__item:nth-child\(n \+ 3\)\s*\{[\s\S]*margin-top:\s*-\d+px;/s,
  "Desktop timeline should pull cards from the third item onward upward to reduce vertical dead space.",
);

assert.match(
  css,
  /@media \(min-width: 961px\)\s*\{[\s\S]*\.timeline__item:nth-child\(3\)\s+\.timeline__card\.left\s*\{[\s\S]*margin-top:\s*-\d+px;/s,
  "The third desktop card on the left should start partway up alongside the second right card.",
);

console.log("timeline-desktop-stagger checks passed");
