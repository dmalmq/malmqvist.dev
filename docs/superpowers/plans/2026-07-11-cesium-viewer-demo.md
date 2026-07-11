# 3D Cesium Viewer Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `3d-cesium-viewer` project (en/ja/sv) with a click-gated iframe demo of the published-session viewer from dmalmq/3D-Tiles-Viewer, with production “data pending” and local/dev manifest URL override.

**Architecture:** Tiny React gate island (`client:visible`) never imports Cesium. On click (only when a manifest URL is configured) it mounts an iframe to a curated static build of `viewer.html` under `public/demos/cesium-viewer/`. Viewer storage keys are namespaced so same-origin iframe cannot clobber portfolio `localStorage.theme`. Demo build allowlists public assets (no wholesale `public/` copy).

**Tech Stack:** Astro 5 content collections, React island, Vite-built Cesium viewer sub-app, env `PUBLIC_CESIUM_DEMO_MANIFEST_URL`, optional project frontmatter `demo`.

## Global Constraints

- Zero Cesium JS/network until the user clicks **Load interactive demo** and a demo URL is configured.
- Never use `client:only` as a load gate for Cesium; gate is separate from the viewer bundle.
- Do not copy viewer repo `public/` wholesale (excludes pptx and work artifacts).
- Namespace viewer localStorage: at least `theme` → `tiles-viewer:theme`, `language` → `tiles-viewer:language`, `section:*` → `tiles-viewer:section:*`, `leftPanelWidth` → `tiles-viewer:leftPanelWidth`.
- Tiles data may be absent: production gate stays pending; local override via env.
- Project parity: en/ja/sv for slug `3d-cesium-viewer`.
- Design language: paper/sumi tokens, hairline rules, `rounded-[var(--radius-feature)]`, mono eyebrows — match ProjectDetailPage.
- Spec: `docs/superpowers/specs/2026-07-11-cesium-viewer-demo-design.md`.

---

## File map

| Path | Role |
|---|---|
| `src/content.config.ts` | Optional `demo` schema on projects |
| `src/content/projects/{en,ja,sv}/3d-cesium-viewer.md` | New project content |
| `src/components/demos/CesiumViewerGate.tsx` | Tiny gate island (iframe mount/unmount) |
| `src/components/ProjectDetailPage.astro` | Render demo section after gallery |
| `src/lib/cesium-demo.ts` | Resolve manifest URL (env + frontmatter) |
| `scripts/build-cesium-viewer-demo.mjs` | Clone/build/patch/allowlist viewer into `public/demos/cesium-viewer` |
| `public/demos/cesium-viewer/**` | Built viewer assets (generated; gitignore optional large chunks) |
| `.env.example` | Document `PUBLIC_CESIUM_DEMO_MANIFEST_URL` |
| `package.json` | `build:demo-viewer` script |
| `e2e/cesium-demo.spec.ts` | Gate pending / no Cesium until click (when configured) |

---

### Task 1: Schema + project content (en/ja/sv)

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/projects/en/3d-cesium-viewer.md`
- Create: `src/content/projects/ja/3d-cesium-viewer.md`
- Create: `src/content/projects/sv/3d-cesium-viewer.md`
- Test: `node scripts/check-projects-parity.mjs`

**Interfaces:**
- Produces: project schema field  
  `demo?: { type: 'cesium-viewer'; manifestUrl?: string; poster?: string }`  
- Produces: slug `3d-cesium-viewer` in all three langs, `featured: true`

- [ ] **Step 1: Extend project schema**

In `src/content.config.ts`, add to the projects `z.object({...})`:

```ts
demo: z
  .object({
    type: z.literal("cesium-viewer"),
    manifestUrl: z.string().url().optional(),
    poster: z.string().optional(),
  })
  .optional(),
```

- [ ] **Step 2: Create English project MD**

`src/content/projects/en/3d-cesium-viewer.md`:

```md
---
title: "3D Cesium Viewer"
description: "A browser-based published-session viewer for 3D Tiles — venues, buildings, and layers without installing desktop GIS software."
publishDate: "2026-07-11"
lang: "en"
tags: ["CesiumJS", "3D Tiles", "Digital Twin", "PLATEAU"]
coverImage: "/images/projects/shinjuku-nav-1-optimized.jpg"
galleryImages: []
featured: true
problem: "Sharing indoor and city-scale 3D Tiles with stakeholders usually means desktop tools, heavy installs, or one-off exports that strip structure."
solution: "A published-session web viewer built on CesiumJS: load a venue manifest, switch buildings, filter layers, and navigate 3D Tiles in the browser."
techStack: ["CesiumJS", "3D Tiles", "Vite", "JavaScript"]
impact: "Colleagues open a link and review the same authored tileset session — no Revit or GIS install required."
demo:
  type: cesium-viewer
  poster: "/images/projects/shinjuku-nav-1-optimized.jpg"
---

This project is the **published-session viewer** side of my 3D Tiles tooling: the read path used after authoring venues and layers. The portfolio embeds that viewer behind a click gate so Cesium only loads when you ask for the demo.

Tiles for the live demo are published separately; until a manifest URL is configured, the page shows a pending state.
```

- [ ] **Step 3: Create Japanese and Swedish MDs**

Mirror frontmatter with `lang: "ja"` / `lang: "sv"`, same `tags`, `coverImage`, `featured: true`, `demo` block, translated title/description/problem/solution/impact/body. Keep image paths byte-identical.

JA title: `3D Cesiumビューア`  
SV title: `3D Cesium-visare`

- [ ] **Step 4: Verify parity and content load**

```bash
node scripts/check-projects-parity.mjs
npx astro check
```

Expected: parity OK including `3d-cesium-viewer`; 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/projects/en/3d-cesium-viewer.md src/content/projects/ja/3d-cesium-viewer.md src/content/projects/sv/3d-cesium-viewer.md
git commit -m "feat(content): add 3d-cesium-viewer project in en/ja/sv"
```

---

### Task 2: Resolve demo config helper

**Files:**
- Create: `src/lib/cesium-demo.ts`
- Modify: `.env.example`
- Test: unit-style node assert or small vitest-less node script inline

**Interfaces:**
- Produces:

```ts
export type CesiumDemoConfig = {
  type: "cesium-viewer";
  manifestUrl?: string;
  poster?: string;
};

/** Frontmatter wins over env; empty string treated as unset. */
export function resolveCesiumDemoManifestUrl(
  frontmatterUrl?: string,
  envUrl: string | undefined = import.meta.env.PUBLIC_CESIUM_DEMO_MANIFEST_URL,
): string | null;

export function buildViewerIframeSrc(manifestUrl: string): string;
// → `/demos/cesium-viewer/viewer.html?manifest=${encodeURIComponent(manifestUrl)}`
```

- [ ] **Step 1: Implement helper**

```ts
// src/lib/cesium-demo.ts
export type CesiumDemoConfig = {
  type: "cesium-viewer";
  manifestUrl?: string;
  poster?: string;
};

export function resolveCesiumDemoManifestUrl(
  frontmatterUrl?: string,
  envUrl: string | undefined = import.meta.env.PUBLIC_CESIUM_DEMO_MANIFEST_URL,
): string | null {
  const fromFm = frontmatterUrl?.trim();
  if (fromFm) return fromFm;
  const fromEnv = envUrl?.trim();
  if (fromEnv) return fromEnv;
  return null;
}

export function buildViewerIframeSrc(manifestUrl: string): string {
  const base = "/demos/cesium-viewer/viewer.html";
  return `${base}?manifest=${encodeURIComponent(manifestUrl)}`;
}

export const VIEWER_ASSET_INDEX = "/demos/cesium-viewer/viewer.html";
```

- [ ] **Step 2: Document env**

Append to `.env.example`:

```
# Optional: venue manifest URL for the Cesium project demo (local/dev or CDN)
PUBLIC_CESIUM_DEMO_MANIFEST_URL=
```

- [ ] **Step 3: Smoke the pure functions**

```bash
node --input-type=module -e "
import { resolveCesiumDemoManifestUrl, buildViewerIframeSrc } from './src/lib/cesium-demo.ts';
// If TS import fails under node, temporarily duplicate the two functions in the -e script.
console.log(resolveCesiumDemoManifestUrl(undefined, undefined) === null);
console.log(resolveCesiumDemoManifestUrl(undefined, 'https://example.com/venues.json') === 'https://example.com/venues.json');
console.log(resolveCesiumDemoManifestUrl('https://fm.example/m.json', 'https://env.example/m.json') === 'https://fm.example/m.json');
console.log(buildViewerIframeSrc('https://example.com/venues.json').includes('manifest='));
"
```

If Node cannot import TS, run the same assertions by pasting the functions into the `-e` script. Expected: all `true` / includes pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cesium-demo.ts .env.example
git commit -m "feat(demo): resolve Cesium manifest URL from frontmatter or env"
```

---

### Task 3: CesiumViewerGate island

**Files:**
- Create: `src/components/demos/CesiumViewerGate.tsx`
- Test: manual + later e2e

**Interfaces:**
- Consumes: `resolveCesiumDemoManifestUrl`, `buildViewerIframeSrc` from Task 2  
- Produces: React component  

```tsx
type Props = {
  lang: "en" | "ja" | "sv";
  posterSrc: string;
  posterAlt: string;
  manifestUrl: string | null; // already resolved by server
};
```

- [ ] **Step 1: Implement gate (no Cesium imports)**

```tsx
// src/components/demos/CesiumViewerGate.tsx
import { useEffect, useRef, useState } from "react";
import { buildViewerIframeSrc } from "@/lib/cesium-demo";

type Props = {
  lang: "en" | "ja" | "sv";
  posterSrc: string;
  posterAlt: string;
  manifestUrl: string | null;
};

const copy = {
  en: {
    eyebrow: "Interactive demo",
    title: "Published-session 3D Tiles viewer",
    pending:
      "Demo tiles are not published on this site yet. When a manifest URL is configured, you can load the viewer here.",
    load: "Load interactive demo",
    close: "Close demo",
    openTab: "Open in new tab",
    loading: "Loading viewer…",
  },
  ja: {
    eyebrow: "インタラクティブデモ",
    title: "公開セッション用 3D Tiles ビューア",
    pending:
      "デモ用タイルはこのサイトにはまだ公開されていません。マニフェストURLが設定されると、ここでビューアを読み込めます。",
    load: "インタラクティブデモを読み込む",
    close: "デモを閉じる",
    openTab: "新しいタブで開く",
    loading: "ビューアを読み込み中…",
  },
  sv: {
    eyebrow: "Interaktiv demo",
    title: "Publicerad 3D Tiles-visare",
    pending:
      "Demodata är inte publicerad på den här sajten ännu. När en manifest-URL är konfigurerad kan du ladda visaren här.",
    load: "Ladda interaktiv demo",
    close: "Stäng demo",
    openTab: "Öppna i ny flik",
    loading: "Laddar visare…",
  },
} as const;

export default function CesiumViewerGate({
  lang,
  posterSrc,
  posterAlt,
  manifestUrl,
}: Props) {
  const t = copy[lang];
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    return () => {
      // Drop iframe on unmount (navigation) so WebGL dies with the document.
      iframeRef.current = null;
    };
  }, []);

  const canLoad = Boolean(manifestUrl);
  const iframeSrc = manifestUrl ? buildViewerIframeSrc(manifestUrl) : null;

  return (
    <div className="border-t border-[var(--line)] pt-8">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 className="mt-3 text-[var(--font-h3)]">{t.title}</h2>

      {!open && (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-feature)] border border-[var(--line)] bg-[var(--surface)]">
          <img
            src={posterSrc}
            alt={posterAlt}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
          <div className="space-y-4 p-5 md:p-6">
            {!canLoad && (
              <p className="text-sm leading-7 text-[var(--text-muted)]">{t.pending}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canLoad}
                onClick={() => setOpen(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.load}
              </button>
            </div>
          </div>
        </div>
      )}

      {open && iframeSrc && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--line)] px-6 py-3 text-sm font-bold text-[var(--text)]"
            >
              {t.close}
            </button>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--line)] px-6 py-3 text-sm font-bold text-[var(--text)]"
            >
              {t.openTab}
            </a>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-feature)] border border-[var(--line)] bg-[var(--surface-soft)]">
            <iframe
              ref={iframeRef}
              title={t.title}
              src={iframeSrc}
              className="aspect-video w-full min-h-[28rem] border-0"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Confirm no cesium import**

```bash
rg -n "cesium|Cesium" src/components/demos/CesiumViewerGate.tsx || echo "clean"
```

Expected: `clean`.

- [ ] **Step 3: Commit**

```bash
git add src/components/demos/CesiumViewerGate.tsx
git commit -m "feat(demo): add click-gated CesiumViewerGate island"
```

---

### Task 4: Wire gate into ProjectDetailPage

**Files:**
- Modify: `src/components/ProjectDetailPage.astro`
- Test: open `/en/projects/3d-cesium-viewer/` in dev

**Interfaces:**
- Consumes: `project.data.demo`, `resolveCesiumDemoManifestUrl`, `CesiumViewerGate`

- [ ] **Step 1: Import and resolve**

In the frontmatter of `ProjectDetailPage.astro`:

```ts
import CesiumViewerGate from "./demos/CesiumViewerGate";
import { resolveCesiumDemoManifestUrl } from "../lib/cesium-demo";

// after props destructure:
const demo = project.data.demo;
const isCesiumDemo = demo?.type === "cesium-viewer";
const demoManifestUrl = isCesiumDemo
  ? resolveCesiumDemoManifestUrl(demo.manifestUrl)
  : null;
const demoPoster =
  (isCesiumDemo && demo.poster) ||
  project.data.coverImage ||
  "/images/projects/shinjuku-nav-1-optimized.jpg";
```

- [ ] **Step 2: Insert section after Gallery, before Related**

```astro
{isCesiumDemo && (
  <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-10">
    <CesiumViewerGate
      client:visible
      lang={lang}
      posterSrc={demoPoster}
      posterAlt={project.data.title}
      manifestUrl={demoManifestUrl}
    />
  </section>
)}
```

Note: `lang` may be typed as `Language` including `sv` — gate accepts `en|ja|sv`.

- [ ] **Step 3: Smoke**

```bash
npm run dev -- --host 127.0.0.1 --port 4321
# browser: /en/projects/3d-cesium-viewer/
```

Expected: case study renders; Interactive demo section shows poster + pending (no env); Load button disabled; DevTools network has no Cesium.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectDetailPage.astro
git commit -m "feat(demo): show Cesium gate on 3d-cesium-viewer project page"
```

---

### Task 5: Viewer demo build script (allowlist + storage namespace)

**Files:**
- Create: `scripts/build-cesium-viewer-demo.mjs`
- Modify: `package.json` (add `build:demo-viewer`)
- Create: `.gitignore` entries if large generated assets should not ship (prefer committing a thin `viewer.html` stub note OR documenting generate-on-demand)

**Interfaces:**
- Produces: `public/demos/cesium-viewer/viewer.html` + assets  
- Env: optional `CESIUM_VIEWER_REPO` path override (default clone to `.cache/3d-tiles-viewer`)

- [ ] **Step 1: Write build script outline**

`scripts/build-cesium-viewer-demo.mjs` must:

1. Resolve source: `process.env.CESIUM_VIEWER_REPO` or clone `https://github.com/dmalmq/3D-Tiles-Viewer.git` to `.cache/3d-tiles-viewer` (shallow).
2. Apply storage namespace patch to viewer sources (copy tree to `.cache/3d-tiles-viewer-demo-build` first):
   - In `src/viewer.js` and any imported modules used by the viewer graph that touch storage: replace keys as specified in Global Constraints.
   - Practical approach: run a codemod over `src/**/*.js` in the build copy:

```js
const replacements = [
  [/localStorage\.getItem\(["']theme["']\)/g, 'localStorage.getItem("tiles-viewer:theme")'],
  [/localStorage\.setItem\(["']theme["']/g, 'localStorage.setItem("tiles-viewer:theme"'],
  [/localStorage\.getItem\(["']language["']\)/g, 'localStorage.getItem("tiles-viewer:language")'],
  [/localStorage\.setItem\(["']language["']/g, 'localStorage.setItem("tiles-viewer:language"'],
  [/localStorage\.getItem\(["']leftPanelWidth["']\)/g, 'localStorage.getItem("tiles-viewer:leftPanelWidth")'],
  [/localStorage\.setItem\(["']leftPanelWidth["']/g, 'localStorage.setItem("tiles-viewer:leftPanelWidth"'],
  // section keys:
  [/localStorage\.getItem\(`section:\$\{/g, 'localStorage.getItem(`tiles-viewer:section:${'],
  [/localStorage\.setItem\(`section:\$\{/g, 'localStorage.setItem(`tiles-viewer:section:${'],
  [/localStorage\.getItem\(key\)/g, '/* review section key */ localStorage.getItem(key)'], // prefer patching the key construction: `tiles-viewer:${key}` when key is `section:…`
];
```

Prefer patching where the key is built:

```js
// before
const key = section.id ? `section:${section.id}:collapsed` : null;
// after
const key = section.id ? `tiles-viewer:section:${section.id}:collapsed` : null;
```

3. **Public allowlist only** when preparing static files for Vite:

```js
const PUBLIC_ALLOWLIST = [
  "favicon.svg",
  "icons/marker/", // directory prefix
];
```

Copy only allowlisted paths into a staging `public/` for the demo build. Fail if a required marker is missing after dry-run.

4. Build **viewer entry only** (`vite build` with `viewer.html` input — match viewer `vite.config.js` multi-page `viewer` input). Output to `public/demos/cesium-viewer/` of the **portfolio** repo.

5. Fail if output contains `.pptx` or paths matching `14_`.

- [ ] **Step 2: package.json script**

```json
"build:demo-viewer": "node scripts/build-cesium-viewer-demo.mjs"
```

- [ ] **Step 3: Run build (network required for clone)**

```bash
npm run build:demo-viewer
test -f public/demos/cesium-viewer/viewer.html && echo OK
find public/demos/cesium-viewer -name '*.pptx' | wc -l   # expect 0
```

- [ ] **Step 4: Manual iframe smoke**

With demo assets present:

```bash
# optional
echo 'PUBLIC_CESIUM_DEMO_MANIFEST_URL=https://YOUR_CORS_HOST/sessions/venues.json' >> .env
npm run dev -- --host 127.0.0.1 --port 4321
```

Open project page → Load demo → iframe loads viewer shell. Without manifest, viewer may show empty/default; with bad URL, error banner inside viewer is OK.

Theme toggle inside iframe must not change portfolio `localStorage.theme` (check in console before/after).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-cesium-viewer-demo.mjs package.json public/demos/cesium-viewer
# If assets are huge, commit script only and document generate step in README snippet below
git commit -m "feat(demo): script to build allowlisted Cesium viewer sub-app"
```

---

### Task 6: E2E + verification

**Files:**
- Create: `e2e/cesium-demo.spec.ts`
- Modify: none required for playwright.config

- [ ] **Step 1: Write e2e for pending gate**

```ts
import { test, expect } from "@playwright/test";

test("cesium demo gate shows pending without loading Cesium", async ({ page }) => {
  const cesiumRequests: string[] = [];
  page.on("request", (req) => {
    const u = req.url();
    if (/cesium|Cesium|cesium-viewer\/assets/i.test(u)) cesiumRequests.push(u);
  });

  await page.goto("/en/projects/3d-cesium-viewer/");
  await expect(page.getByRole("heading", { name: /3D Cesium Viewer/i })).toBeVisible();

  const loadBtn = page.getByRole("button", { name: /Load interactive demo/i });
  // Without PUBLIC_CESIUM_DEMO_MANIFEST_URL in CI, button is disabled
  if (await loadBtn.isDisabled()) {
    await expect(page.getByText(/not published|not published on this site/i)).toBeVisible();
    expect(cesiumRequests).toEqual([]);
    return;
  }

  // If env is set in CI later: click and expect iframe
  await loadBtn.click();
  await expect(page.locator("iframe[title]")).toBeVisible();
});
```

- [ ] **Step 2: Run suite**

```bash
env -u CI npx playwright test
```

Expected: existing contact tests + new test pass (pending path).

- [ ] **Step 3: Full verification**

```bash
npx astro check
npm run build
node scripts/check-projects-parity.mjs
env -u CI npx playwright test
```

- [ ] **Step 4: Commit**

```bash
git add e2e/cesium-demo.spec.ts
git commit -m "test(e2e): Cesium demo gate does not load Cesium while pending"
```

---

### Task 7: README note for refreshing the demo

**Files:**
- Modify: `README.md` (short section only)

- [ ] **Step 1: Add operator docs**

```md
### Cesium project demo

1. Build the allowlisted viewer: `npm run build:demo-viewer`
2. Optional local tiles: set `PUBLIC_CESIUM_DEMO_MANIFEST_URL` to a CORS-enabled venue manifest (`?manifest=` is passed to the viewer).
3. Open `/en/projects/3d-cesium-viewer/` → **Load interactive demo**.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: how to build and wire the Cesium project demo"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| New project en/ja/sv | 1 |
| Optional demo frontmatter | 1 |
| Env + frontmatter URL resolution | 2 |
| Click gate, no eager Cesium | 3–4 |
| iframe published viewer | 3–5 |
| Allowlisted public assets | 5 |
| Storage namespace | 5 |
| Pending without data | 3–4, 6 |
| Local/dev override | 2, 5 |
| E2E / check / build | 6 |
| Operator docs | 7 |

## Placeholder scan

None intentional. Open non-blocking: production poster art may stay shinjuku still until a dedicated screenshot exists.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-11-cesium-viewer-demo.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — this session with executing-plans and checkpoints  

Which approach?
