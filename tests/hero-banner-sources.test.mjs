import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pagePath = new URL('../src/app/page.tsx', import.meta.url);
const cssPath = new URL('../src/app/globals.css', import.meta.url);

test('page uses responsive picture sources for desktop and mobile hero banners', () => {
  const page = readFileSync(pagePath, 'utf8');

  assert.match(page, /<picture[^>]*className="hero__banner-picture"/s);
  assert.match(page, /<source\s+media="\(max-width: 960px\)"\s+srcSet="\/images\/nigel-hero-mobile\.jpg"/s);
  assert.match(page, /<source\s+media="\(min-width: 961px\)"\s+srcSet="\/images\/nigel-hero-desktop\.jpg"/s);
  assert.match(page, /<img[\s\S]*className="hero__banner-img"/s);
});

test('css locks hero banner aspect ratios so fade positioning does not change with viewport cropping', () => {
  const css = readFileSync(cssPath, 'utf8');

  assert.match(css, /\.hero__banner-picture\s*\{[\s\S]*aspect-ratio:\s*16\s*\/\s*5;/s);
  assert.match(css, /\.hero__banner-img\s*\{[\s\S]*height:\s*auto;/s);
  assert.match(css, /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*\.hero__banner-picture\s*\{[\s\S]*aspect-ratio:\s*4\s*\/\s*3;/s);
});
