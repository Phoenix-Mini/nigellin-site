import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const mobileBlocks = [...css.matchAll(/@media \(max-width: 960px\) \{([\s\S]*?)\n\}/g)];

assert.ok(mobileBlocks.length > 0, "Mobile breakpoint block should exist in globals.css.");

const mobileBlock = mobileBlocks.at(-1)?.[1] ?? "";

assert.match(
  mobileBlock,
  /\.hero__card-meta\s*\{[\s\S]*font-size:\s*14px;/,
  "Mobile Archive updated text should keep the approved 14px size.",
);

assert.match(
  mobileBlock,
  /\.timeline__card h2\s*\{[\s\S]*font-size:\s*20px;/,
  "Mobile timeline titles should keep the approved 20px size.",
);

assert.match(
  mobileBlock,
  /\.entry__body\s*\{[\s\S]*font-size:\s*15px;/,
  "Mobile timeline body copy should keep the approved 15px size.",
);

console.log("timeline-mobile-typography checks passed");
