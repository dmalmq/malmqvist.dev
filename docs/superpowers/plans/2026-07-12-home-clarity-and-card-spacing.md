# Homepage Clarity and Project Card Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve homepage narrative clarity and guarantee 32px separation between peer project cards across every localized project index and project detail page.

**Architecture:** Extend the existing i18n dictionary and content-frontmatter patterns; do not add components or schema. Keep layout changes at the current container level, expose stable `data-*` hooks only where Playwright needs a semantic contract, and verify all 30 canonical public routes at desktop and phone widths after lazy content loads.

**Tech Stack:** Astro 5, Tailwind CSS 4, Astro content collections, TypeScript, Playwright.

## Global Constraints

- EN/JA/SV locale dictionaries remain key-for-key identical.
- No Cesium homepage proof strip, hero replacement, new section, card type, glossary, sticky CTA, or design primitive.
- Keep `STOCKHOLM → TOKYO`, the cream palette, scroll progress, focus order, skip link, and reveal behavior unchanged.
- Hero social-link suppression applies only to the exact locale root; footer, mobile More, and non-home desktop headers retain social access.
- Featured role labels contain no em dash, pipeline arrow, or delivery-detail clause.
- Project-index and project-detail peer-card groups render a minimum 32px row/column gap at 390×844 and 1440×900.
- Form label/control spacing, tag gaps, and button gaps remain unchanged.

---

### Task 1: Localized homepage clarity and desktop chrome

**Files:**
- Modify: `e2e/home-structure.spec.ts`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/ja.json`
- Modify: `src/i18n/sv.json`
- Modify: `src/components/HomePage.astro`
- Modify: `src/components/sections/SelectedWork.astro`
- Modify: `src/components/sections/AboutSplit.astro`
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: existing `useTranslations(lang)` and normalized `currentPath` in `Header.astro`.
- Produces: i18n keys `home.selected.bridge`, `hero.image.alt`, and `home.about.current`; semantic hooks `[data-selected-work-bridge]` and `[data-current-mandate]`.

- [ ] **Step 1: Write failing Playwright contracts**

Replace the obsolete em-dash assertion in the existing role test later in Task 2. Add these tests to `e2e/home-structure.spec.ts`:

```ts
const localeCopy = {
  en: {
    bridge: "From delivery models to deployable city data.",
    heroAlt: "Shinjuku indoor navigation Revit model",
    mandate: "In Tokyo, I work across BIM delivery, geospatial pipelines, and the tooling that connects authored models to operational systems.",
  },
  ja: {
    bridge: "実施設計モデルから、運用できる都市データへ。",
    heroAlt: "新宿屋内ナビゲーションのRevitモデル",
    mandate: "東京では、BIMの実務、地理空間データのパイプライン、そして設計モデルを運用システムへつなぐツール開発に取り組んでいます。",
  },
  sv: {
    bridge: "Från leveransmodeller till användbar stadsdata.",
    heroAlt: "Revit-modell för inomhusnavigering i Shinjuku",
    mandate: "I Tokyo arbetar jag med BIM-leveranser, geospatiala dataflöden och verktyg som kopplar projekterade modeller till operativa system.",
  },
} as const;

for (const [lang, copy] of Object.entries(localeCopy)) {
  test(`${lang} localizes the bridge, hero image, and current mandate`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    await expect(page.locator("[data-selected-work-bridge]")).toHaveText(copy.bridge);
    await expect(page.locator('.hero-section img')).toHaveAttribute("alt", copy.heroAlt);
    await expect(page.locator("[data-current-mandate]")).toHaveText(copy.mandate);
  });
}

test("homepage desktop header removes socials without removing other paths", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator('header a[href*="github.com"]')).toHaveCount(0);
  await expect(page.locator('header a[href*="linkedin.com"]')).toHaveCount(0);
  await expect(page.locator('footer a[href*="github.com"]')).toHaveCount(1);

  await page.goto("/en/about/");
  await expect(page.locator('header a[href*="github.com"]')).toHaveCount(1);
  await expect(page.locator('header a[href*="linkedin.com"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line
```

Expected: new localization tests fail because the semantic hooks/copy do not exist; header test fails because homepage desktop socials still render.

- [ ] **Step 3: Add exact parity-maintained copy**

Add these flattened keys to each JSON dictionary. Do not relocate unrelated keys.

`src/i18n/en.json`:

```json
"hero.image.alt": "Shinjuku indoor navigation Revit model",
"home.selected.bridge": "From delivery models to deployable city data.",
"home.about.current": "In Tokyo, I work across BIM delivery, geospatial pipelines, and the tooling that connects authored models to operational systems."
```

`src/i18n/ja.json`:

```json
"hero.image.alt": "新宿屋内ナビゲーションのRevitモデル",
"home.selected.bridge": "実施設計モデルから、運用できる都市データへ。",
"home.about.current": "東京では、BIMの実務、地理空間データのパイプライン、そして設計モデルを運用システムへつなぐツール開発に取り組んでいます。"
```

`src/i18n/sv.json`:

```json
"hero.image.alt": "Revit-modell för inomhusnavigering i Shinjuku",
"home.selected.bridge": "Från leveransmodeller till användbar stadsdata.",
"home.about.current": "I Tokyo arbetar jag med BIM-leveranser, geospatiala dataflöden och verktyg som kopplar projekterade modeller till operativa system."
```

- [ ] **Step 4: Render localized bridge, alt text, and mandate**

In `HomePage.astro`, replace the hard-coded hero alt:

```astro
alt={t("hero.image.alt")}
```

In `SelectedWork.astro`, render immediately after the H2 Reveal and before the card container:

```astro
<p data-selected-work-bridge class="mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
  {t("home.selected.bridge")}
</p>
```

In `AboutSplit.astro`, render before the existing paragraph container:

```astro
<p data-current-mandate class="mt-6 max-w-[68ch] text-base font-semibold leading-8 text-[var(--text)] md:text-lg">
  {t("home.about.current")}
</p>
```

Change the existing paragraph container from `mt-6` to `mt-4` so the mandate and supporting history form one text group without adding a new card.

- [ ] **Step 5: Suppress desktop header socials only on locale roots**

After `normalizedPath`, define:

```ts
const isLocaleHome = normalizedPath === `/${currentLang}/`;
```

Wrap the existing GitHub and LinkedIn anchors in:

```astro
{!isLocaleHome && (
  <>
    <!-- existing GitHub anchor unchanged -->
    <!-- existing LinkedIn anchor unchanged -->
  </>
)}
```

Do not change footer or `BottomNavMore.tsx`.

- [ ] **Step 6: Run focused tests and parity check; verify GREEN**

Run:

```bash
npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line
node scripts/check-i18n-parity.mjs
```

Expected: homepage tests pass; parity reports 47 keys across 3 locales.

- [ ] **Step 7: Commit Task 1**

```bash
git add e2e/home-structure.spec.ts src/i18n/en.json src/i18n/ja.json src/i18n/sv.json src/components/HomePage.astro src/components/sections/SelectedWork.astro src/components/sections/AboutSplit.astro src/components/Header.astro
git commit -m "feat(home): clarify evidence path and current fit"
```

---

### Task 2: Concise featured role annotations

**Files:**
- Modify: `e2e/home-structure.spec.ts`
- Modify: `src/content/projects/en/ersta-sjukhus.md`
- Modify: `src/content/projects/en/shinjuku-nav.md`
- Modify: `src/content/projects/en/revit-geopackage.md`
- Modify: `src/content/projects/ja/ersta-sjukhus.md`
- Modify: `src/content/projects/ja/shinjuku-nav.md`
- Modify: `src/content/projects/ja/revit-geopackage.md`
- Modify: `src/content/projects/sv/ersta-sjukhus.md`
- Modify: `src/content/projects/sv/shinjuku-nav.md`
- Modify: `src/content/projects/sv/revit-geopackage.md`

**Interfaces:**
- Consumes: existing `role?: string` project frontmatter and `.project-card .font-mono` rendering.
- Produces: three concise localized role labels per locale; no schema change.

- [ ] **Step 1: Replace the old role test with a failing scanability contract**

Replace `each featured project carries a role annotation` with:

```ts
test("featured role annotations stay concise on phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  const roles = page.locator(".project-card .font-mono");
  await expect(roles).toHaveCount(3);

  for (const role of await roles.all()) {
    const text = (await role.textContent())?.trim() ?? "";
    expect(text).not.toMatch(/[—→]/);
    expect(text.length).toBeLessThanOrEqual(50);
    const lines = await role.evaluate((element) => {
      const style = getComputedStyle(element);
      return Math.round(element.getBoundingClientRect().height / parseFloat(style.lineHeight));
    });
    expect(lines).toBeLessThanOrEqual(2);
  }
});
```

Add a locale loop that repeats the punctuation and rendered-line constraints for `/ja/` and `/sv/`.

- [ ] **Step 2: Run the focused role test and verify RED**

Run:

```bash
npx playwright test e2e/home-structure.spec.ts -g "role annotations" --timeout=20000 --retries=0 --reporter=line
```

Expected: fail because current English and localized roles include em dashes/arrows and long delivery clauses.

- [ ] **Step 3: Shorten role frontmatter in all nine files**

Use these exact role concepts:

```text
EN
Ersta: Architect & BIM modeler
Shinjuku: BIM data pipeline lead
GeoPackage: Plugin developer

JA
Ersta: 建築設計・BIMモデラー
Shinjuku: BIMデータパイプライン担当
GeoPackage: プラグイン開発

SV
Ersta: Arkitekt och BIM-modellerare
Shinjuku: Ansvarig för BIM-dataflöden
GeoPackage: Pluginutvecklare
```

Only change the `role:` line in each file. Existing descriptions, impacts, and tags retain the pipeline and responsibility evidence.

- [ ] **Step 4: Run focused tests and project parity; verify GREEN**

Run:

```bash
npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line
node scripts/check-projects-parity.mjs
```

Expected: all home tests pass; project parity reports 5 projects per locale with matching featured flags.

- [ ] **Step 5: Commit Task 2**

```bash
git add e2e/home-structure.spec.ts src/content/projects/en/ersta-sjukhus.md src/content/projects/en/shinjuku-nav.md src/content/projects/en/revit-geopackage.md src/content/projects/ja/ersta-sjukhus.md src/content/projects/ja/shinjuku-nav.md src/content/projects/ja/revit-geopackage.md src/content/projects/sv/ersta-sjukhus.md src/content/projects/sv/shinjuku-nav.md src/content/projects/sv/revit-geopackage.md
git commit -m "fix(home): make featured roles scannable"
```

---

### Task 3: Project peer-card spacing and full visual contract

**Files:**
- Create: `e2e/project-spacing.spec.ts`
- Modify: `src/components/ProjectsIndexPage.astro`
- Modify: `src/components/ProjectDetailPage.astro`

**Interfaces:**
- Consumes: existing project routes and card containers.
- Produces: semantic group hooks `[data-project-grid]`, `[data-project-overview-grid]`, `[data-project-sidebar]`, and `[data-related-project-grid]`; each has a computed 32px peer gap.

- [ ] **Step 1: Write the failing all-route spacing test**

Create `e2e/project-spacing.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

const languages = ["en", "ja", "sv"] as const;
const projectSlugs = [
  "3d-cesium-viewer",
  "ersta-sjukhus",
  "imdf-converter",
  "revit-geopackage",
  "shinjuku-nav",
] as const;
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const;

async function expectPeerGap(page: Page, selector: string) {
  const groups = page.locator(selector);
  for (const group of await groups.all()) {
    const result = await group.evaluate((element) => {
      const children = [...element.children].filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      const style = getComputedStyle(element);
      const gap = Math.min(parseFloat(style.rowGap), parseFloat(style.columnGap));
      const overlaps = children.some((child, index) => {
        const a = child.getBoundingClientRect();
        return children.slice(index + 1).some((other) => {
          const b = other.getBoundingClientRect();
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      });
      return { gap, overlaps };
    });
    expect(result.gap).toBeGreaterThanOrEqual(32);
    expect(result.overlaps).toBe(false);
  }
}

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const lang of languages) {
      test(`${lang} project index separates cards`, async ({ page }) => {
        await page.goto(`/${lang}/projects/`);
        await expectPeerGap(page, "[data-project-grid]");
      });

      for (const slug of projectSlugs) {
        test(`${lang}/${slug} separates detail cards`, async ({ page }) => {
          await page.goto(`/${lang}/projects/${slug}/`);
          await expectPeerGap(page, "[data-project-overview-grid]");
          await expectPeerGap(page, "[data-project-sidebar]");
          await expectPeerGap(page, "[data-related-project-grid]");
        });
      }
    }
  });
}
```

- [ ] **Step 2: Run the spacing spec and verify RED**

Run:

```bash
npx playwright test e2e/project-spacing.spec.ts --timeout=20000 --retries=0 --reporter=line
```

Expected: fail because semantic hooks are absent; after hooks are added without spacing changes, fail with measured 20px/24px gaps.

- [ ] **Step 3: Add semantic hooks and 32px gaps**

In `ProjectsIndexPage.astro`, change the card grid to:

```astro
<div data-project-grid class="grid grid-cols-1 gap-8 sm:grid-cols-2">
```

In `ProjectDetailPage.astro`, change only these peer containers:

```astro
<div data-project-overview-grid class="grid gap-8 lg:grid-cols-3">

<div data-project-sidebar class="grid gap-8 xl:sticky xl:top-28 self-start">

<div data-related-project-grid class="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
```

Do not change inner tag/button/form gaps.

- [ ] **Step 4: Run spacing tests and verify GREEN**

Run:

```bash
npx playwright test e2e/project-spacing.spec.ts --timeout=20000 --retries=0 --reporter=line
```

Expected: 36 tests pass (18 canonical route assertions × 2 viewports), every computed peer gap ≥32px, zero overlap.

- [ ] **Step 5: Run the full suite and static checks**

Run:

```bash
npx playwright test --timeout=20000 --retries=0 --reporter=line
npx astro check
node scripts/check-i18n-parity.mjs
node scripts/check-projects-parity.mjs
```

Expected: all Playwright tests pass; Astro reports zero errors; i18n parity reports 47 keys over 3 locales; project parity remains clean.

- [ ] **Step 6: Perform the post-change Playwright visual crawl**

Use Playwright Chromium, not static HTML inspection. Visit the 30 canonical routes (3 home, 12 static locale pages, 15 localized project details) at 1440×900 and 390×844. For each route:

1. Wait for `networkidle`.
2. Scroll incrementally by 75% of viewport height through `document.documentElement.scrollHeight`.
3. Wait until all `document.images` report `complete` or 10 seconds elapse.
4. Return to the top.
5. Capture a full-page screenshot.
6. Review project index grids, overview cards, detail sidebar cards, related cards, Japanese role wrapping, header balance, and clipping/overlap.

Expected: all 60 canonical screenshots reviewed; peer cards visibly separated; no blank lazy-media regions, overlaps, clipped copy, or broken locale layouts.

- [ ] **Step 7: Run the Impeccable detector on touched UI sources**

Run:

```bash
node skill://impeccable/scripts/detect.mjs --json src/components/HomePage.astro src/components/sections/SelectedWork.astro src/components/sections/AboutSplit.astro src/components/Header.astro src/components/ProjectsIndexPage.astro src/components/ProjectDetailPage.astro
```

Expected: no new unapproved findings. Existing brand-committed cream/kicker signals, if surfaced live rather than statically, remain accepted.

- [ ] **Step 8: Commit Task 3**

```bash
git add e2e/project-spacing.spec.ts src/components/ProjectsIndexPage.astro src/components/ProjectDetailPage.astro
git commit -m "fix(projects): separate peer cards consistently"
```
