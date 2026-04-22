import test from 'node:test';
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

test('hero fade zone CSS', () => {
  const cssPath = path.join(process.cwd(), 'src/app/globals.css');
  const css = readFileSync(cssPath, 'utf8');

  assert.match(css, /\.hero::before\s*\{[\s\S]*content:\s*none;/s);
  assert.match(css, /\.hero::after\s*\{[\s\S]*content:\s*none;/s);
  assert.match(css, /\.timeline__spine\s*\{[\s\S]*top:\s*-120px;[\s\S]*rgba\(183, 120, 80, 0\) 0%[\s\S]*rgba\(183, 120, 80, 0\.04\) 24%[\s\S]*rgba\(183, 120, 80, 0\.82\) 80%/s);
  assert.match(css, /\.hero__banner-picture\s*\{[\s\S]*z-index:\s*20;/s);
  assert.match(css, /\.hero__card-meta\s*\{[\s\S]*z-index:\s*80;/s);
  assert.match(css, /\.timeline-mask-window\s*\{[\s\S]*position:\s*fixed;[\s\S]*--timeline-mask-top:\s*200px;[\s\S]*--timeline-mask-height:\s*340px;/s);
  assert.match(css, /\.timeline-mask-window::after\s*\{[\s\S]*var\(--color-bg-base\) 0%[\s\S]*rgba\(243, 243, 245, 0\.88\) 34%[\s\S]*rgba\(243, 243, 245, 0\) 100%/s);
  assert.match(css, /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*\.timeline-mask-window\s*\{[\s\S]*--timeline-mask-top:\s*300px;[\s\S]*--timeline-mask-height:\s*170px;/s);
  assert.match(css, /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*\.timeline-mask-window::after\s*\{[\s\S]*rgba\(243, 243, 245, 0\.74\) 0%[\s\S]*rgba\(243, 243, 245, 0\.4\) 36%[\s\S]*rgba\(243, 243, 245, 0\.12\) 72%[\s\S]*rgba\(243, 243, 245, 0\) 100%/s);
  assert.doesNotMatch(css, /\.hero::before\s*\{[^}]*backdrop-filter\s*:|\.hero::after\s*\{[^}]*backdrop-filter\s*:|\.timeline-mask-window::after\s*\{[^}]*backdrop-filter\s*:/s);
});
