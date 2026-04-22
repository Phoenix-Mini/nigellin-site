import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const entry = readFileSync(path.join(root, "src/components/TimelineEntry.tsx"), "utf8");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

assert.match(
  entry,
  /thumbnailUrl:\s*entry\.media_thumbnail_url \|\| entry\.media_url/,
  "Primary image tiles should fall back to media_url when media_thumbnail_url is blank.",
);

assert.match(
  entry,
  /thumbnailUrl:\s*item\.type === "image" \? item\.thumbnail_url \|\| item\.url : item\.thumbnail_url/,
  "Media items published as images should render thumbnails even when thumbnail_url is blank.",
);

assert.match(
  entry,
  /thumbnailUrl:\s*type === "image" \? url : undefined/,
  "Slot-based image tiles should use their own image URL as a thumbnail fallback.",
);

assert.match(
  entry,
  /className={`timeline__card \$\{align\}\$\{isOpen \? " is-reflection-open" : ""\}`}/,
  "Open reflections should elevate the card above neighboring cards.",
);

assert.match(
  css,
  /\.timeline__card:hover,\s*[\s\S]*\.timeline__card\.is-reflection-open\s*\{[\s\S]*z-index:\s*20;/,
  "Hovered or open cards should stack above neighboring cards.",
);

assert.match(
  css,
  /\.entry__reflection-wrap:hover\s+\.entry__reflection-popover[\s\S]*opacity:\s*1;/,
  "Desktop hover should reveal the reflection popover.",
);

assert.match(
  css,
  /\.entry__reflection-popover\s*\{[\s\S]*inset:\s*12px;[\s\S]*width:\s*auto;/,
  "Desktop reflection popover should overlay the card interior instead of sitting outside it.",
);

console.log("timeline-media-ux-regression checks passed");
