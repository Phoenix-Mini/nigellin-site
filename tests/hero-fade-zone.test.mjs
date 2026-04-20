import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cssPath = new URL('../src/app/globals.css', import.meta.url);

test('hero fade uses neck-level guide anchors and the timeline spine extends upward with a soft fade-in cap instead of a hard start', () => {
  const css = readFileSync(cssPath, 'utf8');

  assert.match(css, /\.hero::before\s*\{[\s\S]*56\.25%[\s\S]*82%[\s\S]*92%[\s\S]*100%/s);
  assert.match(css, /\.hero::after\s*\{[\s\S]*top:\s*56\.25%;[\s\S]*height:\s*43\.75%;[\s\S]*38%[\s\S]*72%[\s\S]*100%/s);
  assert.match(css, /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*\.hero::before\s*\{[\s\S]*58\.33%[\s\S]*84%[\s\S]*93%[\s\S]*100%/s);
  assert.match(css, /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*\.hero::after\s*\{[\s\S]*top:\s*58\.33%;[\s\S]*height:\s*41\.67%;[\s\S]*42%[\s\S]*76%[\s\S]*100%/s);
  assert.match(css, /\.timeline__spine\s*\{[\s\S]*top:\s*-120px;[\s\S]*rgba\(183, 120, 80, 0\) 0%[\s\S]*rgba\(183, 120, 80, 0\.04\) 24%[\s\S]*rgba\(183, 120, 80, 0\.82\) 80%/s);
  assert.match(css, /\.hero__banner-picture\s*\{[\s\S]*z-index:\s*20;/s);
  assert.match(css, /\.hero__card-meta\s*\{[\s\S]*z-index:\s*80;/s);
  assert.doesNotMatch(css, /\.hero::before\s*\{[^}]*backdrop-filter\s*:|\.hero::after\s*\{[^}]*backdrop-filter\s*:/s);
});
