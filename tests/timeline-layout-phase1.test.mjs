import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const page = readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
const entry = readFileSync(path.join(root, "src/components/TimelineEntry.tsx"), "utf8");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  page,
  /function getTimelineAlign\(index: number\): "center" \| "left" \| "right"/,
  "page.tsx should expose timeline alignment logic for center/left/right cards.",
);

assert.match(
  page,
  /if \(index === 0\) return "center";/,
  "First timeline card should be centered on desktop.",
);

assert.match(
  page,
  /if \(index === 1\) return "right";/,
  "Second timeline card should start on the right.",
);

assert.match(
  entry,
  /type TimelineAlign = "left" \| "right" \| "center";/,
  "TimelineEntry should support a center alignment mode.",
);

assert.match(
  page,
  /<div className="timeline__ending" aria-hidden="true">[\s\S]*className="timeline__ending-break"[\s\S]*className="timeline__ending-label">To be continued …<\/span>[\s\S]*className="timeline__ending-fade"/,
  "Timeline should render a separated ending break, label, and fade segment.",
);

assert.match(
  entry,
  /function formatTimelineDate\(value: string\): string/,
  "TimelineEntry should format entry dates for display.",
);

assert.match(
  entry,
  /toLocaleDateString\("en-AU", \{[\s\S]*month: "long",[\s\S]*year: "numeric"/,
  "Timeline timestamps should render as Month Year only.",
);

assert.match(
  entry,
  /className="entry__media-strip"/,
  "TimelineEntry should render a compact media preview strip.",
);

assert.match(
  entry,
  /className={`timeline__card \$\{align\}(?:\$\{isOpen \? " is-reflection-open" : ""\})?`}/,
  "TimelineEntry card class should continue reflecting left/right/center alignment.",
);

assert.match(
  css,
  /\.timeline__card\.center\s*\{/,
  "CSS should define a centered desktop card variant.",
);

assert.match(
  css,
  /@media \(max-width: 960px\)[\s\S]*\.timeline__card,\s*[\s\S]*\.timeline__card\.left,\s*[\s\S]*\.timeline__card\.right,\s*[\s\S]*\.timeline__card\.center/s,
  "Mobile CSS should collapse all timeline cards to the right-side layout.",
);

assert.match(
  css,
  /\.timeline__ending-label\s*\{/,
  "CSS should style the ending label.",
);

console.log("timeline-layout-phase1 checks passed");
