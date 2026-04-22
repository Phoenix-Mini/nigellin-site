import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const parser = readFileSync(path.join(root, "scripts/fetch_sheet_snapshot.ts"), "utf8");
const types = readFileSync(path.join(root, "src/types/archive.ts"), "utf8");
const entry = readFileSync(path.join(root, "src/components/TimelineEntry.tsx"), "utf8");

assert.match(
  parser,
  /const RANGE = process\.env\.NIGEL_SHEET_RANGE \|\| "Sheet1!A1:W1000";/,
  "Snapshot parser should read the expanded sheet range through column W while leaving X+ for publish controls.",
);

assert.match(
  parser,
  /media_2_caption:/,
  "Snapshot parser should materialize media_2_caption from the sheet.",
);

assert.match(
  parser,
  /media_3_caption:/,
  "Snapshot parser should materialize media_3_caption from the sheet.",
);

assert.match(
  parser,
  /media_2_type:/,
  "Snapshot parser should materialize media_2_type from the sheet.",
);

assert.match(
  parser,
  /media_2_url:/,
  "Snapshot parser should materialize media_2_url from the sheet.",
);

assert.match(
  parser,
  /media_3_type:/,
  "Snapshot parser should materialize media_3_type from the sheet.",
);

assert.match(
  parser,
  /media_3_url:/,
  "Snapshot parser should materialize media_3_url from the sheet.",
);

assert.match(
  parser,
  /media_thumbnail_url:/,
  "Snapshot parser should materialize media_thumbnail_url from the sheet.",
);

assert.match(
  parser,
  /media_alt:/,
  "Snapshot parser should materialize media_alt from the sheet.",
);

assert.match(
  parser,
  /media_caption:/,
  "Snapshot parser should materialize media_caption from the sheet.",
);

assert.match(
  parser,
  /media_credit:/,
  "Snapshot parser should materialize media_credit from the sheet.",
);

assert.match(
  parser,
  /media_source_url:/,
  "Snapshot parser should materialize media_source_url from the sheet.",
);

assert.match(
  parser,
  /JSON\.parse\(.*media_items_json.*\)/s,
  "Snapshot parser should attempt to parse media_items_json when present.",
);

assert.match(
  parser,
  /media_items:/,
  "Snapshot parser should write parsed media_items into the snapshot.",
);

assert.match(
  parser,
  /const hasAdditionalSlotMedia = Boolean\(secondaryType && secondaryUrl\) \|\| Boolean\(tertiaryType && tertiaryUrl\);/,
  "Snapshot parser should detect when slot-based second or third media items are populated.",
);

assert.match(
  parser,
  /const mediaItems = hasAdditionalSlotMedia \? slotMediaItems \?\? parsedMediaItems : parsedMediaItems \?\? slotMediaItems;/,
  "Snapshot parser should prefer slot-based media over stale media_items_json when additional slot media is present.",
);

assert.match(
  parser,
  /caption: asString\(record\["media_caption"\]\) \|\| undefined/,
  "Snapshot parser should carry media_caption into the generated primary media item when building from slots.",
);

assert.match(
  parser,
  /alt: asString\(record\["media_alt"\]\) \|\| undefined/,
  "Snapshot parser should carry media_alt into the generated primary media item when building from slots.",
);

assert.match(
  parser,
  /credit: asString\(record\["media_credit"\]\) \|\| undefined/,
  "Snapshot parser should carry media_credit into the generated primary media item when building from slots.",
);

assert.match(
  parser,
  /thumbnail_url:\s*secondaryType === "image" \? secondaryUrl : undefined/,
  "Snapshot parser should auto-fill a thumbnail_url for media_2 image slots when publishing from sheet columns.",
);

assert.match(
  parser,
  /thumbnail_url:\s*tertiaryType === "image" \? tertiaryUrl : undefined/,
  "Snapshot parser should auto-fill a thumbnail_url for media_3 image slots when publishing from sheet columns.",
);

assert.match(
  types,
  /export type ArchiveMediaItem = \{/,
  "Archive types should declare a reusable ArchiveMediaItem type.",
);

assert.match(
  types,
  /media_2_type\??:\s*string;/,
  "ArchiveEntry should include media_2_type.",
);

assert.match(
  types,
  /media_2_url\??:\s*string;/,
  "ArchiveEntry should include media_2_url.",
);

assert.match(
  types,
  /media_3_type\??:\s*string;/,
  "ArchiveEntry should include media_3_type.",
);

assert.match(
  types,
  /media_3_url\??:\s*string;/,
  "ArchiveEntry should include media_3_url.",
);

assert.match(
  types,
  /media_2_caption\??:\s*string;/,
  "ArchiveEntry should include media_2_caption.",
);

assert.match(
  types,
  /media_3_caption\??:\s*string;/,
  "ArchiveEntry should include media_3_caption.",
);

assert.match(
  types,
  /media_thumbnail_url\??:\s*string;/,
  "ArchiveEntry should include media_thumbnail_url.",
);

assert.match(
  types,
  /media_items\??:\s*ArchiveMediaItem\[\];/,
  "ArchiveEntry should include parsed media_items.",
);

assert.match(
  entry,
  /entry\.media_items\??\.length|entry\.media_items\s*&&\s*entry\.media_items\.length/s,
  "TimelineEntry should prefer media_items when they exist.",
);

assert.match(
  entry,
  /entry\.media_2_url/,
  "TimelineEntry should consider media_2_url when building preview tiles.",
);

assert.match(
  entry,
  /entry\.media_3_url/,
  "TimelineEntry should consider media_3_url when building preview tiles.",
);

assert.match(
  entry,
  /entry\.media_2_caption/,
  "TimelineEntry should consider media_2_caption when building preview tiles.",
);

assert.match(
  entry,
  /entry\.media_3_caption/,
  "TimelineEntry should consider media_3_caption when building preview tiles.",
);

assert.match(
  entry,
  /type === "image"\s*\? "Image"/,
  "Image slot captions should default to 'Image' when left blank.",
);

assert.match(
  entry,
  /entry\.media_thumbnail_url/,
  "TimelineEntry should use media_thumbnail_url for primary image previews.",
);

assert.match(
  entry,
  /slice\(0, 3\)/,
  "TimelineEntry should cap rendered media previews at three items.",
);

console.log("timeline-media-schema checks passed");
