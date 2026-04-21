# Nigel Timeline Phase 1 Implementation Plan

> For Hermes: implement in small verified steps. Preserve current hero/banner/contact CTA placement.

Goal: redesign the timeline so desktop and mobile follow the new narrative structure while keeping the site light, elegant, and compatible with future spreadsheet/media expansion.

Architecture:
- Phase 1 focuses on layout, card hierarchy, visual polish, and a unified preview system.
- Existing sheet sync remains compatible in Phase 1 by treating current `media_type` + `media_url` as a single primary media item.
- A later Phase 2 will expand the sheet schema for multiple media items and richer external links.

Tech stack:
- Next.js 16 App Router
- React 19
- TypeScript
- CSS in `src/app/globals.css`
- Timeline card rendering in `src/components/TimelineEntry.tsx`
- Snapshot sync in `scripts/fetch_sheet_snapshot.ts`

---

## Locked product decisions from Charles

1. Desktop:
   - center spine
   - first card centered (intended birth card)
   - second card on the right
   - then alternate left/right downward
2. Mobile:
   - spine on the left
   - all cards on the right
6. Timeline ending:
   - do not attempt a single continuous dynamic spine fade through the label zone
   - use 3 separate blocks for stability:
     1) the main spine hard-stops above the label zone
     2) centered text: `To be continued …`
     3) a separate short fade-out tail below the label
   - visual goal: keep the line clearly broken around the label zone if that feels cleaner; it does not need to visually reconnect through the text
   - implementation should remain structurally separated for easier tuning
7. Timestamp format:

   - use a short horizontal connector line between card and spine
5. Reflection interaction:
   - long reflections must not expand inside the card and consume timeline height
   - desktop: open a small reading popover on hover/focus
   - mobile: open the same reflection content via tap-triggered popover/sheet/modal, because hover is not available
6. Timestamp format:
   - every visible timestamp should match the `Archive updated` style
   - display as `Month Year` only
   - do not show full day-level dates in the timeline card UI
7. Card content hierarchy:
   - Title = bold / larger
   - Thoughts = smaller supporting text
   - Media previews = thumbnails
7. Density requirement:
   - under the hero, viewport should show at least 1.5 cards on both desktop and mobile
7. Media previews:
   - use the same preview box size for photos and external media
   - non-photo media uses icon/logo treatment (music / video / Spotify / YouTube) inside the same tile system
8. Card chrome:
   - border/frame must stay refined and consistent with the site tone
9. New refinement:
   - a 3-up thumbnail row is preferred over a single large preview because it reduces card height

---

## Phase 1 scope

In scope:
- desktop timeline layout rewrite
- mobile timeline layout rewrite
- compact card design tuned for density
- 3-up preview row system
- unified preview tiles for image / youtube / spotify
- refined card border + spacing + connectors
- timeline fade tail + `To be continued …`

Out of scope for Phase 1:
- full lightbox / modal gallery
- multi-item media schema from sheet
- embedding spotify/youtube directly inside collapsed cards
- spreadsheet schema migration

---

## File targets

Primary files:
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/TimelineEntry.tsx`
- `src/types/archive.ts`

Phase 1 optional tests:
- `tests/timeline-layout-phase1.test.mjs`
- `tests/timeline-endcap.test.mjs`
- `tests/timeline-media-preview-tiles.test.mjs`

Future Phase 2 files:
- `scripts/fetch_sheet_snapshot.ts`
- `public/data/nigel-archive.json`

---

## Proposed UI rules

### Desktop layout
- `.timeline__spine` remains centered
- entry index 0 => centered card modifier, for example `.timeline__card.center`
- entry index 1 => right
- entry index 2 => left
- entry index 3 => right
- continue alternating from there

### Mobile layout
- spine fixed left
- every card uses right-side layout
- connector line runs from spine to the card left edge

### Card sizing target
Collapsed card should fit this stack comfortably:
- date/meta
- title
- thoughts
- 3 preview tiles in one row
- action row / reflection teaser if retained

Visual target:
- card height reduced enough that hero-bottom viewport shows at least 1.5 cards

### Preview tile system
Each event gets up to 3 compact preview tiles in the same row.

Phase 1 behavior:
- if there is only one media source today, render one active tile and optionally leave remaining slots empty or hidden
- prepare component structure so future multi-media support can fill 2nd/3rd tiles later without redesign

Tile types:
- image => image thumbnail
- youtube => same tile dimensions, video icon or YouTube logo badge
- spotify => same tile dimensions, music icon or Spotify logo badge
- generic external => same tile dimensions, link badge/icon

Interaction in Phase 1:
- image tile: click opens source image in new tab or larger image target
- youtube / spotify: click opens source URL
- no inline embed in collapsed card

### Connector treatment
- keep a short horizontal connector between card and spine
- test connector lengths separately for desktop/mobile
- starting test values:
  - desktop: 36px
  - mobile: 24px

### Card styling direction
- thin elegant border
- subtle warm shadow
- preserve current off-white card tone
- do not make cards feel app-like or chunky

### Timeline ending
Below final card:
- short additional spine segment
- vertical fade to transparent
- centered text: `To be continued …`
- text style should feel editorial / understated, not decorative

---

## Implementation order

### Step 1 — Add tests for layout intent
Files:
- create `tests/timeline-layout-phase1.test.mjs`
- create `tests/timeline-endcap.test.mjs`

Assertions should verify:
- timeline supports a centered first card modifier
- timeline endcap text exists
- endcap fade/tail classes exist
- mobile rules place cards on the right of a left spine

### Step 2 — Adjust timeline alignment logic in page rendering
Files:
- modify `src/app/page.tsx`

Change mapping logic so align values are:
- first item => `center`
- second => `right`
- then alternate left/right

### Step 3 — Extend the `TimelineEntry` align type
Files:
- modify `src/components/TimelineEntry.tsx`

Support:
- `left`
- `right`
- `center`

### Step 4 — Rebuild card interior hierarchy
Files:
- modify `src/components/TimelineEntry.tsx`

Collapsed card should become:
- date/meta formatted as `Month Year`
- tag/category
- title
- thoughts text
- preview tile row
- lightweight reflection trigger only

Use `body_main` as current thoughts content in Phase 1.
Add a display formatter in the UI layer so entry dates like `2026-01-04` render as `January 2026`.
Do not expand long reflection text inline inside the card; keep the collapsed card height stable.

### Step 5 — Introduce preview tile model in component code
Files:
- modify `src/components/TimelineEntry.tsx`
- optional `src/types/archive.ts`

Implement a small mapper that converts current entry media into a preview tile object:
- `{ kind: 'image' | 'youtube' | 'spotify' | 'external', href, label, thumbnailUrl? }`

For current schema:
- image => one image tile
- youtube => one video tile
- spotify => one music tile
- none => no tiles

Component should be ready to accept an array later.

### Step 6 — Rewrite timeline/card CSS for density
Files:
- modify `src/app/globals.css`

Tasks:
- add center-card desktop rules
- tighten card spacing and internal rhythm
- reduce card height
- refine connector spacing
- keep border/shadow subtle
- ensure desktop shows 1.5 cards under hero
- ensure mobile shows 1.5 cards under hero

### Step 7 — Add 3-up preview row styling
Files:
- modify `src/app/globals.css`

Rules:
- compact equal-height preview tiles
- same dimensions across image/video/music tiles
- soft border and muted surface
- icons/logos centered for non-image media

### Step 8 — Reflection interaction rewrite
Files:
- modify `src/components/TimelineEntry.tsx`
- modify `src/app/globals.css`

Behavior:
- desktop: reflection opens as a compact hover/focus popover anchored to the card
- mobile: reflection opens via tap-triggered popover/sheet/modal because hover is unavailable
- long reflection text must never push the timeline card taller in collapsed flow

### Step 9 — Verify visually and tune density
Commands:
- `pnpm lint`
- `pnpm build`
- inspect on `http://localhost:3099`

Verification checklist:
- desktop first card centered
- second card right, third left
- mobile all cards right of spine
- all visible timeline timestamps render as `Month Year`
- reflection content does not expand card height inline
- desktop reflection opens as a compact hover/focus reading surface
- mobile reflection uses a tap-safe overlay pattern
- connector lines not too long
- preview row is compact
- under hero at least 1.5 cards visible
- endcap fade + copy read cleanly

---

## Phase 2 preview: spreadsheet/media sync expansion

Recommended future schema update:
- keep existing simple fields for backward compatibility
- add one new sheet column: `media_items_json`

Suggested format:
```json
[
  {
    "type": "image",
    "url": "https://...",
    "thumbnail_url": "https://...",
    "caption": "..."
  },
  {
    "type": "youtube",
    "url": "https://youtube.com/...",
    "thumbnail_url": "https://img.youtube.com/...",
    "title": "..."
  },
  {
    "type": "spotify",
    "url": "https://open.spotify.com/...",
    "thumbnail_url": "https://...",
    "title": "..."
  }
]
```

Phase 2 parser logic in `scripts/fetch_sheet_snapshot.ts`:
- if `media_items_json` exists and parses, use it
- otherwise fall back to legacy `media_type` + `media_url`

This keeps rollout safe.

---

## One important open question for implementation

The centered first card is intended to represent birth / opening of the life archive.
If the sheet will always contain a birth entry as the highest-priority visible item, current logic is enough.
If not, we may later want an explicit `display_style` or `is_opening_entry` field.

For Phase 1, assume current ordering controls it.
