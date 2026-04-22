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
  /item\.type === "image"[\s\S]*item\.thumbnail_url \|\| item\.url/,
  "Media items published as images should render thumbnails even when thumbnail_url is blank.",
);

assert.match(
  entry,
  /label:\s*item\.caption \|\| item\.title \|\|/,
  "Media item preview labels should prefer caption over title so media_caption is visible on cards.",
);

assert.match(
  entry,
  /thumbnailUrl:\s*type === "image" \? url : type === "youtube" \? getYouTubeThumbnailUrl\(url\) : undefined/,
  "Slot-based image and YouTube tiles should auto-derive usable thumbnail fallbacks.",
);

assert.match(
  entry,
  /function getYouTubeThumbnailUrl\(url: string\): string \| undefined \{/,
  "TimelineEntry should define a YouTube thumbnail derivation helper.",
);

assert.match(
  css,
  /\.entry__media-tile\.is-spotify\s*\{[\s\S]*background:/,
  "Spotify tiles without fetched thumbnails should still render with a branded visual treatment.",
);

assert.match(
  css,
  /\.entry__media-tile\.is-youtube\s*\{[\s\S]*background:/,
  "YouTube tiles without fetched thumbnails should still render with a branded visual treatment.",
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
