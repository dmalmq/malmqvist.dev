# Home Critique Score Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the open items from `.impeccable/critique/2026-07-11T09-50-24Z__src-components-homepage-astro.md` (24/40) so the homepage delivers PRODUCT.md's belief ladder (practice → systems → impact → fit) with truthful evidence, and the score's blockers (H4/H5 evidence integrity, H6 recognition, H7 flexibility, H8 noise) are gone.

**Architecture:** No new pages or components. A curated `featuredRank` ordering in the content schema puts three projects with real, unique imagery into the home top-3 (Ersta = practice lead, Shinjuku = systems bridge with a non-hero cover, Revit→GeoPackage = tooling), which fixes the P0 duplicate/placeholder covers *without* waiting for new screenshots. Small surgical edits handle résumé affordance, skip link, social de-duplication, tag caps, mobile kicker, and a reveal failsafe.

**Tech Stack:** Astro 5 (SSR, content collections + zod), Tailwind v4 tokens in `src/styles/global.css`, Playwright e2e in `e2e/`.

## Global Constraints

- Copy rules: primary CTA is "Discuss a role" (採用のご相談 / Diskutera en roll); hero line is "Architectural intent, deployable data." — do not regress these.
- One deliberate kicker on home: `STOCKHOLM → TOKYO`. Never reintroduce section eyebrows or `01/02/03` markers (DESIGN.md bans; `e2e/home-structure.spec.ts` enforces).
- Red (`--accent`) only on actions, active states, seal, and the kicker (Evidence Marker Rule).
- Accent-filled controls use `text-[var(--accent-ink)]`, never `text-white`.
- All UI strings go through `src/i18n/{en,ja,sv}.json`; keep parity (`node scripts/check-i18n-parity.mjs` must pass).
- All three locales change together for content frontmatter (`node scripts/check-projects-parity.mjs` must pass).
- Font sizes come from `global.css` tokens via `text-[length:var(--font-*)]`; never bare `text-[var(--font-*)]` (Tailwind parses it as color).
- Every task: run only the tests named in the task; the final task runs the full gate. No formatters/linters.
- Test commands assume port 4321 is free (no dev server running); Playwright starts its own.

---

### Task 1: Curated featured slate (belief-ladder order, unique covers)

**Files:**
- Modify: `src/content.config.ts` (projects schema)
- Modify: `src/content/projects/{en,ja,sv}/ersta-sjukhus.md`
- Modify: `src/content/projects/{en,ja,sv}/shinjuku-nav.md`
- Modify: `src/content/projects/{en,ja,sv}/revit-geopackage.md`
- Modify: `src/components/sections/SelectedWork.astro` (sort)
- Test: `e2e/home-structure.spec.ts`

**Interfaces:**
- Produces: `featuredRank?: number` on the projects collection (lower = earlier; unranked featured projects sort after ranked ones, then by `publishDate` desc). Consumed by `SelectedWork.astro` and available to any future featured surface.

- [ ] **Step 1: Write the failing tests** — append to `e2e/home-structure.spec.ts` inside the existing `test.describe` block:

```ts
  test("belief ladder: practice leads, covers are unique", async ({ page }) => {
    await page.goto("/en/");
    // Ladder order: Ersta (practice) → Shinjuku (systems bridge) → GeoPackage (tooling).
    const hrefs = await page.$$eval(".project-card a[href]", (links) =>
      links.map((a) => a.getAttribute("href")),
    );
    expect(hrefs[0]).toContain("/projects/ersta-sjukhus/");
    expect(hrefs[1]).toContain("/projects/shinjuku-nav/");
    expect(hrefs[2]).toContain("/projects/revit-geopackage/");
    // Evidence integrity: no image file may appear twice on the homepage.
    const sources = await page.$$eval("main img", (imgs) =>
      imgs.map((img) =>
        (img.currentSrc || img.src)
          .split("/")
          .pop()!
          // Responsive variants of one asset share a stem: strip -800w/-1600w etc.
          .replace(/-\d+w\./, "."),
      ),
    );
    expect(new Set(sources).size).toBe(sources.length);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: FAIL — `hrefs[0]` contains `/projects/3d-cesium-viewer/`, and the duplicate-source assertion fails (hero + Cesium + Shinjuku all resolve `shinjuku-nav-1-optimized` variants).

- [ ] **Step 3: Add `featuredRank` to the schema** — in `src/content.config.ts`, after the `role` line:

```ts
        role: z.string().optional(),
        featuredRank: z.number().optional(),
```

- [ ] **Step 4: Update frontmatter in all three locales.**

`src/content/projects/{en,ja,sv}/ersta-sjukhus.md` — change `featured: false` to:

```yaml
featured: true
featuredRank: 1
role: "Architect & BIM modeler — IFC rebuild → production Revit, facade lead"
```

Locale role values (replace the `role` line per file): ja `role: "建築・BIMモデラー — IFC再構築 → 実施Revitモデル、ファサード担当"` · sv `role: "Arkitekt & BIM-modellör — IFC-ombyggnad → produktions-Revit, fasadansvarig"`.

`src/content/projects/{en,ja,sv}/shinjuku-nav.md` — add below `featured: true`, and switch the card cover off the hero image:

```yaml
featuredRank: 2
coverImage: "/images/projects/shinjuku-nav-2-optimized.jpg"
```

(replace the existing `coverImage` line; `shinjuku-nav-2-optimized` has full generated variants in `src/generated/image-manifest.mjs`).

`src/content/projects/{en,ja,sv}/revit-geopackage.md` — add below `featured: true`:

```yaml
featuredRank: 3
```

Cesium and IMDF keep `featured: true` with no rank: they stay on `/projects/` and re-enter home's top-3 only when they get real covers (see Deferred).

- [ ] **Step 5: Sort by rank in `SelectedWork.astro`** — replace the `projects` constant:

```ts
const projects = (await getCollection("projects", (entry) => entry.id.startsWith(`${lang}/`) && entry.data.featured))
  .sort((a, b) =>
    (a.data.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.data.featuredRank ?? Number.MAX_SAFE_INTEGER) ||
    b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
  .slice(0, 3);
```

- [ ] **Step 6: Run the tests**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: PASS (all tests in the file, including the pre-existing "role annotation" count of 3 — Ersta now carries `role`).

Run: `node scripts/check-projects-parity.mjs`
Expected: `OK slug parity ... all featured flags match`

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/projects src/components/sections/SelectedWork.astro e2e/home-structure.spec.ts
git commit -m "feat(home): curated featured slate — practice leads, unique covers"
```

---

### Task 2: Quiet the card noise (tag cap)

**Files:**
- Modify: `src/components/sections/SelectedWork.astro:71-73` (badge map)

**Interfaces:**
- Consumes: Task 1's featured slate (Shinjuku's 6 tags are the only over-cap case in the new top-3).

- [ ] **Step 1: Cap displayed tags at 5** — in `SelectedWork.astro`, replace the badge map line:

```astro
                      {project.data.tags.slice(0, 5).map((tag) => <Badge>{tag}</Badge>)}
```

- [ ] **Step 2: Verify render**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: PASS (no test counts tags; this is a guard that nothing broke).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SelectedWork.astro
git commit -m "fix(home): cap card tags at 5"
```

---

### Task 3: CTA band — résumé affordance in, third social cluster out

**Files:**
- Modify: `src/components/sections/CtaBand.astro`
- Modify: `src/i18n/{en,ja,sv}.json` (remove `home.cta.links`)
- Test: `e2e/home-structure.spec.ts`

**Interfaces:**
- Consumes: existing i18n keys `about.resume.en` ("English PDF" / "英語版PDF" / "Engelsk PDF") and `about.resume.ja`; PDFs at `/cv/resume-en.pdf` and `/cv/resume-jp.pdf`.

- [ ] **Step 1: Write the failing test** — append to `e2e/home-structure.spec.ts`:

```ts
  test("CTA band offers the resume as a secondary path", async ({ page }) => {
    await page.goto("/en/");
    const band = page.locator(".cta-band");
    await expect(band.getByRole("link", { name: "Discuss a role" })).toBeVisible();
    await expect(band.locator('a[href="/cv/resume-en.pdf"]')).toBeAttached();
    // Social links live in header and footer only — not a third cluster here.
    await expect(band.locator('a[href*="github.com"]')).toHaveCount(0);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: FAIL — no resume link in the band; GitHub link present via `SocialLinks`.

- [ ] **Step 3: Rewrite the band tail** — in `CtaBand.astro`, remove the `SocialLinks` import and replace everything after the button `</div>` (the `home.cta.links` paragraph + `<SocialLinks ... />`) with:

```astro
    <p class="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--text-muted)]">
      <span>{t("about.resume")}</span>
      <a class="font-bold text-[var(--text)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--accent)]" href="/cv/resume-en.pdf" download>{t("about.resume.en")}</a>
      <a class="font-bold text-[var(--text)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--accent)]" href="/cv/resume-jp.pdf" download>{t("about.resume.ja")}</a>
    </p>
```

- [ ] **Step 4: Remove the dead key** — delete `"home.cta.links"` from `src/i18n/en.json`, `ja.json`, `sv.json` (it has no other consumers; verify with a grep for `home.cta.links` under `src/` — only CtaBand used it).

- [ ] **Step 5: Run the tests**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: PASS.
Run: `node scripts/check-i18n-parity.mjs`
Expected: `parity OK 43 keys over 3 locales`

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/CtaBand.astro src/i18n e2e/home-structure.spec.ts
git commit -m "feat(home): resume links in CTA band; drop third social cluster"
```

---

### Task 4: Skip-to-content link

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (body top + main id)
- Modify: `src/styles/global.css` (skip-link style)
- Modify: `src/i18n/{en,ja,sv}.json` (`nav.skip`)
- Test: `e2e/home-structure.spec.ts`

**Interfaces:**
- Produces: `#main-content` anchor on the layout `<main>`; `nav.skip` i18n key.

- [ ] **Step 1: Write the failing test** — append to `e2e/home-structure.spec.ts`:

```ts
  test("first tab stop is a skip link that targets main content", async ({ page }) => {
    await page.goto("/en/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "#main-content");
    await expect(focused).toBeVisible();
    await expect(page.locator("main#main-content")).toBeAttached();
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: FAIL — first focus lands on the brand link.

- [ ] **Step 3: Add the i18n key** after `"nav.menu.close"` in each locale: en `"nav.skip": "Skip to content"` · ja `"nav.skip": "本文へスキップ"` · sv `"nav.skip": "Hoppa till innehåll"`.

- [ ] **Step 4: Add the link and anchor** — in `BaseLayout.astro`, first child of `<body>` (before `<ScrollProgress />`):

```astro
    <a href="#main-content" class="skip-link">{t("nav.skip")}</a>
```

Add the translator to the frontmatter (`import { useTranslations, type Language } ...` already imports the type; extend it):

```ts
import { useTranslations, type Language } from "../i18n/utils";
// ...after props destructuring:
const t = useTranslations(lang);
```

And give the layout `<main>` the id: `<main id="main-content" class="flex-grow w-full" transition:animate="fade">`.

- [ ] **Step 5: Style it (visually hidden until focus)** — in `global.css`, after the `.container` rule:

```css
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-input);
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transform: translateY(-200%);
}

.skip-link:focus-visible {
  transform: none;
}
```

- [ ] **Step 6: Run the tests**

Run: `npx playwright test e2e/home-structure.spec.ts e2e/bottom-nav.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: PASS (bottom-nav suite guards the layout change).
Run: `node scripts/check-i18n-parity.mjs`
Expected: `parity OK 44 keys over 3 locales`

- [ ] **Step 7: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css src/i18n e2e/home-structure.spec.ts
git commit -m "feat(a11y): skip-to-content link"
```

---

### Task 5: Mobile keeps the route kicker

**Files:**
- Modify: `src/components/HomePage.astro:20` (kicker span)
- Test: `e2e/home-structure.spec.ts`

**Interfaces:**
- Consumes: the existing one-kicker regression test (DOM count must stay 1 — use responsive CSS on a single element, not a second span).

- [ ] **Step 1: Write the failing test** — append to `e2e/home-structure.spec.ts`:

```ts
  test("route kicker is visible on phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/");
    await expect(page.locator("main .eyebrow")).toBeVisible();
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: FAIL — the kicker is `hidden lg:block`.

- [ ] **Step 3: Make the single span responsive** — in `HomePage.astro`, move the kicker span to be the first child *inside* the copy `<div class="flex flex-col gap-6">` (so it flows horizontally above the h1 on mobile) and change its classes to:

```astro
          <span
            class="eyebrow lg:absolute lg:left-0 lg:top-0 lg:[writing-mode:vertical-rl] lg:[text-orientation:mixed]"
            aria-hidden="true"
          >STOCKHOLM → TOKYO</span>
```

Delete the old absolute span at the container top. Remove the now-unused `.eyebrow-vertical` class from `global.css` only if nothing else uses it (grep `eyebrow-vertical` first; as of writing, HomePage is the sole consumer).

- [ ] **Step 4: Run the tests**

Run: `npx playwright test e2e/home-structure.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: PASS — including "exactly one deliberate kicker" (DOM count still 1).

- [ ] **Step 5: Commit**

```bash
git add src/components/HomePage.astro src/styles/global.css e2e/home-structure.spec.ts
git commit -m "fix(home): route kicker visible on phone"
```

---

### Task 6: Reveal failsafe (P3)

**Files:**
- Modify: `src/components/animation/Reveal.astro` (script)
- Modify: `src/components/ui/ScrollReveal.astro` (script)
- Test: `e2e/reveal.spec.ts`

**Interfaces:**
- Produces: pending reveal state always clears within 4s of setup, even if IntersectionObserver never fires.

- [ ] **Step 1: Write the failing test** — append to `e2e/reveal.spec.ts`:

```ts
test.describe("reveal failsafe (broken IntersectionObserver)", () => {
  test.use({ viewport: PHONE });

  test("pending content force-reveals within the failsafe window", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      // IO exists but never reports intersections.
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
      } as unknown as typeof IntersectionObserver;
    });
    await page.goto("/en/");
    const last = page.locator(".reveal").last();
    await expect(last).toHaveClass(/is-pending/); // enhancement engaged, IO is dead
    await expect(last).toHaveCSS("opacity", "1", { timeout: 7000 }); // failsafe cleared it
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test e2e/reveal.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: FAIL on the new test — pending never clears (timeout).

- [ ] **Step 3: Add the failsafe to `Reveal.astro`** — at the end of the `setup()` function, after the `for` loop that observes elements:

```ts
    // Failsafe: motion is enhancement, never a correctness dependency.
    // If IO never fires (broken polyfill, exotic client), unhide everything.
    setTimeout(() => {
      for (const el of document.querySelectorAll('.reveal.is-pending')) {
        el.classList.remove('is-pending');
        observer.unobserve(el);
      }
    }, 4000);
```

- [ ] **Step 4: Add the same failsafe to `ScrollReveal.astro`** — at the end of `initScrollReveal()`, after its observe loop:

```ts
    setTimeout(() => {
      for (const el of document.querySelectorAll('.scroll-reveal.opacity-0')) {
        el.classList.remove(...classesFor(el));
        observer.unobserve(el);
      }
    }, 4000);
```

- [ ] **Step 5: Run the reveal suite**

Run: `npx playwright test e2e/reveal.spec.ts --timeout=20000 --retries=0 --reporter=line`
Expected: PASS (all 6 tests — the scroll-reveal enhancement tests must not regress: the failsafe only clears still-pending elements).

- [ ] **Step 6: Commit**

```bash
git add src/components/animation/Reveal.astro src/components/ui/ScrollReveal.astro e2e/reveal.spec.ts
git commit -m "fix(motion): 4s failsafe force-reveals pending content"
```

---

### Task 7: Full verification gate

**Files:**
- No source changes; fix regressions here if any gate fails.

- [ ] **Step 1: Full e2e + types + parity**

Run: `npx playwright test --timeout=20000 --retries=0 --reporter=line`
Expected: all tests pass (26 = 21 existing + 5 new).
Run: `npx astro check`
Expected: 0 errors, 0 warnings.
Run: `node scripts/check-i18n-parity.mjs && node scripts/check-projects-parity.mjs`
Expected: both `OK`.

- [ ] **Step 2: Detector gate**

Run: `node .claude/skills/impeccable/scripts/detect.mjs src/components/HomePage.astro src/components/sections src/components/Header.astro src/components/BottomNav.astro src/components/Footer.astro src/layouts/BaseLayout.astro`
Expected: exit 0 (no findings).

- [ ] **Step 3: Visual smoke (manual or browser tool)** — dev server, then check `/en/`, `/ja/` at 390px and 1440px, light + dark: Ersta leads with the Revit facade render; hero and Shinjuku card show different images; CTA band shows résumé links and no social icons; Tab once → skip link appears.

- [ ] **Step 4: Commit anything the gate fixed, then re-critique**

```bash
git status --short   # expect clean
```

Run `/impeccable critique home` for a fresh dual-agent score against the 21 → 24 trend.

---

## Deferred (blocked on assets from Daniel)

Not tasks — wiring notes for when real screenshots land:

- **Cesium cover:** drop a real viewer capture at `public/images/projects/cesium-viewer-cover.{jpg,png}`, run `npm run images:optimize` (regenerates `src/generated/image-manifest.mjs` + `_generated` variants), set `coverImage` in `src/content/projects/{en,ja,sv}/3d-cesium-viewer.md`, and give it `featuredRank: 2` or `3` if it should re-enter the home top-3 (bump others accordingly; keep the practice → systems ladder).
- **IMDF cover:** same flow with a real wizard screenshot replacing `imdf-placeholder.svg` in the three `imdf-converter.md` files.
- **Decisions on home (H6 → 4):** if evaluation speed needs more, consider surfacing a one-line `problem →  solution` distillation on the lead card only — decide after seeing the re-critique score; don't preempt (YAGNI).
