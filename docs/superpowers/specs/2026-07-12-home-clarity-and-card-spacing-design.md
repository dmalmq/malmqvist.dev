# Homepage Clarity and Project Card Spacing

**Date:** 2026-07-12  
**Status:** Proposed for approval  
**Target:** Homepage and project browsing surfaces across English, Japanese, and Swedish

## Goal

Resolve the remaining high-value findings from the 29/40 Impeccable homepage critique without redesigning the site. Improve the practice-to-systems narrative, make project roles faster to scan, complete hero-image localization, reduce first-fold navigation noise, state Daniel's present fit, and give peer cards enough visual separation on project indexes and project detail pages.

## Non-goals

- No Cesium homepage proof strip; that remains Phase 2 and requires real production media/data.
- No new card type, section, glossary, sticky CTA, or homepage grid.
- No hero-image replacement.
- No change to the deliberate `STOCKHOLM → TOKYO` marker, cream palette, or scroll-progress treatment.
- No broad typography, color, radius, animation, or project-detail redesign.
- No spacing changes to form labels and their controls; compact form grouping is intentional.

## Current evidence

The third Impeccable critique scored the homepage 29/40 with no P0 issues. Its remaining actionable findings were hero-to-work narrative discontinuity, dense mono role annotations, missing Japanese hero alternative text, overloaded desktop first-fold chrome, and a thin present-day fit statement.

A Playwright audit then crawled every canonical public route in EN/JA/SV: 3 homepages, 12 static locale pages, and 15 localized project detail pages. Each route was inspected at 1440×900 and 390×844 after incremental scrolling loaded lazy media. Screenshots are in `/tmp/malmqvist-card-audit` for the current session.

The audit found no card overlap or zero-gap layout. It measured:

- Project-detail overview cards: 20px peer gap at desktop and phone widths.
- Project-detail sidebar cards: 24px vertical peer gap.
- Related-project cards: 24px peer gap.
- Project-index cards: 20px peer gap from the existing `gap-5` grid.

At the cards' scale and radius, the 20–24px gaps read as attached, especially in a single-column phone stack. The design target is a 32px minimum between peer cards. Tag clusters and label/control pairs retain their compact internal gaps.

## Design

### 1. Bridge the hero to Selected Work

Keep the Shinjuku hero image and the Ersta-first featured ordering. Add one plain supporting sentence directly below the Selected Work heading:

- EN: `From delivery models to deployable city data.`
- JA: `実施設計モデルから、運用できる都市データへ。`
- SV: `Från leveransmodeller till användbar stadsdata.`

The bridge uses the existing body type and muted text color. It is not an eyebrow, badge, or new section. Add the copy as one parity-maintained i18n key.

### 2. Make role annotations sparse

Shorten only the three featured projects' `role` frontmatter in every locale. The role field names the professional function; existing project tags carry tools and pipeline terms.

Required English role labels:

- Ersta: `Architect & BIM modeler`
- Shinjuku: `BIM data pipeline lead`
- Revit to GeoPackage: `Plugin developer`

Japanese and Swedish labels convey the same roles naturally and remain concise. No role label may include an em dash, pipeline arrow, or delivery-detail clause. Delivery responsibility stays in the description and impact fields. No schema or component split is added.

### 3. Localize hero alternative text

Replace the hard-coded English hero `alt` string with one i18n key:

- EN: `Shinjuku indoor navigation Revit model`
- JA: `新宿屋内ナビゲーションのRevitモデル`
- SV: `Revit-modell för inomhusnavigering i Shinjuku`

The image remains meaningful, so the alternative text must not be empty.

### 4. Reduce homepage desktop chrome

On the locale homepage only, omit GitHub and LinkedIn from the desktop header. Preserve both links on non-home desktop pages, in the footer, and in the mobile More sheet. Use the existing normalized current path; do not add a new prop or a second header implementation.

Homepage detection is exact: `/${currentLang}/` after path normalization. Nested routes continue to show the social links.

### 5. State the present-day mandate

Add one lead sentence before the two existing AboutSplit paragraphs:

- EN: `In Tokyo, I work across BIM delivery, geospatial pipelines, and the tooling that connects authored models to operational systems.`
- JA: `東京では、BIMの実務、地理空間データのパイプライン、そして設計モデルを運用システムへつなぐツール開発に取り組んでいます。`
- SV: `I Tokyo arbetar jag med BIM-leveranser, geospatiala dataflöden och verktyg som kopplar projekterade modeller till operativa system.`

Store it as a parity-maintained i18n key. Render it with the existing body typography and stronger text color or semibold weight, not as a card, list, eyebrow, or third generic paragraph.

### 6. Separate peer cards

Set a 32px minimum peer gap on these existing containers:

- Project index card grid in `ProjectsIndexPage.astro`.
- Challenge / Solution / Impact overview grid in `ProjectDetailPage.astro`.
- Project-detail sidebar stack (technology and next-step cards).
- Related-project grid in `ProjectDetailPage.astro`.

Use the existing Tailwind spacing step `gap-8`. Prefer `grid gap-8` for the two-card sidebar stack rather than margin-based `space-y-*`, so the gap is explicit and testable. Internal tag gaps, button gaps, and form field label/control gaps do not change.

The same spacing applies at phone and desktop widths. Desktop multi-column cards use a 32px column gap; phone stacks use a 32px row gap.

## Data and component boundaries

- `src/i18n/{en,ja,sv}.json`: three new parity keys for the Selected Work bridge, hero image alternative text, and current mandate.
- `src/components/HomePage.astro`: consume localized hero alternative text only.
- `src/components/sections/SelectedWork.astro`: render localized bridge copy.
- `src/components/sections/AboutSplit.astro`: render localized current mandate before existing paragraphs.
- `src/components/Header.astro`: conditionally omit desktop social links on the locale root.
- `src/content/projects/{en,ja,sv}/{ersta-sjukhus,shinjuku-nav,revit-geopackage}.md`: concise role frontmatter.
- `src/components/ProjectsIndexPage.astro`: 32px project-card grid gap.
- `src/components/ProjectDetailPage.astro`: 32px overview, sidebar, and related-card gaps.

No exported API, content schema, route, or new component is introduced.

## Accessibility and responsive behavior

- Localized hero alternative text follows the page language.
- Header social-link removal does not remove the footer or mobile More-sheet paths.
- Existing focus order, skip link, and navigation labels remain unchanged.
- Role annotations remain visible text and are not encoded only in badges.
- Card spacing remains 32px at 390px and 1440px widths.
- No content depends on animation or viewport intersection.

## Verification contract

### Automated behavioral tests

Extend focused Playwright coverage to assert:

1. The Selected Work bridge appears in EN/JA/SV.
2. All three homepage role annotations are concise, contain no `—` or `→`, and occupy at most two rendered lines at 390×844.
3. The Japanese hero image has Japanese alternative text.
4. Homepage desktop header has no GitHub or LinkedIn link; a non-home desktop page retains both.
5. The current-mandate sentence appears in EN/JA/SV.
6. On every localized project index and all 15 localized project-detail pages, peer-card gaps are at least 32px at 1440×900 and 390×844.
7. No peer cards overlap.

Use stable semantic/data selectors for card groups if class-based selection would couple tests to Tailwind implementation details.

### Visual Playwright audit

After implementation, repeat the full canonical-route crawl at desktop and phone widths. Incrementally scroll each page before the screenshot so lazy images and reveal content settle. Review every screenshot, with explicit attention to:

- project index card rows/stacks,
- Challenge / Solution / Impact cards,
- technology and next-step sidebar cards,
- related-project cards,
- Japanese role wrapping,
- header balance after social removal,
- absence of clipped or overlapping content.

### Release gate

- Focused new/updated Playwright specs pass.
- Existing full Playwright suite passes.
- `npx astro check` reports zero errors.
- i18n parity reports equal keys across EN/JA/SV.
- project parity remains clean.
- Impeccable detector runs on touched homepage sources; brand-committed cream/kicker findings remain accepted rather than redesigned around.

## Acceptance criteria

- The homepage story explicitly bridges delivery practice to city-scale data systems.
- Featured role annotations scan as role labels rather than technical paragraphs.
- Hero alternative text matches EN/JA/SV page language.
- Desktop homepage chrome is reduced without removing social access elsewhere.
- About states Daniel's current Tokyo mandate in one sentence.
- Every project-index and project-detail peer-card group has at least 32px separation at phone and desktop widths.
- All canonical public routes have been visually reviewed with Playwright after lazy content loads.
- No new section, card type, or design-system convention is introduced.
