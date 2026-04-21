import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const entry = readFileSync(path.join(root, "src/components/TimelineEntry.tsx"), "utf8");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  entry,
  /className="entry__reflection-wrap"/,
  "TimelineEntry should wrap the reflection trigger and overlay in a dedicated reflection container.",
);

assert.match(
  entry,
  /aria-haspopup="dialog"/,
  "Reflection trigger should advertise dialog-style overlay behavior.",
);

assert.match(
  entry,
  /className={`entry__reflection-popover \$\{isOpen \? "open" : ""\}`}/,
  "TimelineEntry should render a reflection popover that opens without expanding card height.",
);

assert.match(
  entry,
  /className="entry__reflection-backdrop"/,
  "TimelineEntry should render a dismiss backdrop for tap-based reflection overlays.",
);

assert.match(
  css,
  /\.entry__reflection-popover\s*\{[\s\S]*position:\s*absolute;/,
  "Desktop CSS should place the reflection popover absolutely so cards keep a stable height.",
);

assert.match(
  css,
  /@media \(max-width: 960px\)[\s\S]*\.entry__reflection-popover\s*\{[\s\S]*position:\s*fixed;/s,
  "Mobile CSS should switch the reflection popover to a fixed overlay/sheet.",
);

assert.match(
  css,
  /\.entry__reflection-backdrop\s*\{[\s\S]*display:\s*none;/,
  "Backdrop should stay hidden by default outside the mobile overlay experience.",
);

console.log("timeline-reflection-overlay checks passed");
