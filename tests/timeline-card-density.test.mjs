import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const entry = readFileSync(path.join(root, "src/components/TimelineEntry.tsx"), "utf8");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  entry,
  /<div className="entry__meta-row">[\s\S]*<p className="entry__date">[\s\S]*<p className="entry__tag">/,
  "TimelineEntry should render date and category inside a compact meta row.",
);

assert.match(
  entry,
  /<span className="entry__reflection-label">[\s\S]*Read reflection[\s\S]*<\/span>[\s\S]*<span className="reflection__teaser">/,
  "Reflection trigger should place label and teaser on the same horizontal row.",
);

assert.match(
  css,
  /\.entry__meta-row\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*baseline;/,
  "CSS should lay out date and category in a single compact flex row.",
);

assert.match(
  css,
  /\.timeline__card h2\s*\{[\s\S]*font-size:\s*20px;/,
  "Timeline titles should be reduced to a 20px desktop size.",
);

assert.match(
  css,
  /\.entry__body\s*\{[\s\S]*font-size:\s*15px;/,
  "Thought/body copy should remain at 15px.",
);

assert.match(
  css,
  /\.entry__reflection-label\s*\{[\s\S]*font-size:\s*15px;/,
  "Read reflection label should use a fixed 15px size to match the thought text.",
);

assert.match(
  css,
  /\.timeline__card\s*\{[\s\S]*width:\s*min\(432px, calc\(60vw - 104px\)\);/,
  "Desktop card width should be widened to roughly 20% more than the previous 360px baseline.",
);

assert.match(
  css,
  /\.timeline__card\s*\{[\s\S]*border-radius:\s*12px;/,
  "Card corners should be tightened to a 12px radius.",
);

assert.match(
  css,
  /\.entry__media-tile\s*\{[\s\S]*border-radius:\s*7px;/,
  "Preview tiles should use a tighter 7px radius.",
);

assert.match(
  css,
  /\.timeline__card::before\s*\{[\s\S]*width:\s*39px;/,
  "Connector line should extend slightly to close the 2-3px gap to the spine.",
);

console.log("timeline-card-density checks passed");
