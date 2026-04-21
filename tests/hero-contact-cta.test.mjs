import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const pagePath = path.join(projectRoot, "src/app/page.tsx");
const cssPath = path.join(projectRoot, "src/app/globals.css");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");

assert.match(
  page,
  /href="mailto:niggle99@gmail\.com"[\s\S]*?>\s*<span>Drop me a line<\/span>/,
  "Hero should include a mailto CTA for Nigel with the label 'Drop me a line'.",
);

assert.match(
  page,
  /className="hero__overlay-copy"[\s\S]*className="hero__contact"/,
  "Hero should place the contact CTA inside a dedicated overlay copy layer.",
);

assert.match(
  css,
  /\.hero__contact\s*\{[\s\S]*left:\s*clamp\(280px,\s*25vw,\s*352px\);[\s\S]*top:\s*clamp\(28px,\s*8vw,\s*44px\);/,
  "Desktop hero CTA should sit above the baked-in name block, not at the far-left margin.",
);

assert.match(
  css,
  /\.hero__contact:hover[\s\S]*\.hero__contact:focus-visible/,
  "Hero contact CTA should define hover and focus-visible interaction states.",
);

assert.match(
  css,
  /@media \(max-width:\s*960px\)[\s\S]*\.hero__contact\s*\{/,
  "Hero contact CTA should have mobile-specific positioning rules.",
);

console.log("hero-contact-cta checks passed");
