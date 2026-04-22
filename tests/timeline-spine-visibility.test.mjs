import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  css,
  /\.timeline__spine\s*\{[\s\S]*rgba\(183, 120, 80, 0\.08\) 18%[\s\S]*rgba\(183, 120, 80, 0\.24\) 36%[\s\S]*rgba\(183, 120, 80, 0\.46\) 58%[\s\S]*rgba\(183, 120, 80, 0\.74\) 78%/s,
  "Timeline spine should become visible earlier in the upper section instead of disappearing until far down the page.",
);

console.log("timeline-spine-visibility checks passed");
