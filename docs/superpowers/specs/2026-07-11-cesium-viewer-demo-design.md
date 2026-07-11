# Design: 3D Cesium Viewer project demo

Date: 2026-07-11  
Status: approved  
Source app: [dmalmq/3D-Tiles-Viewer](https://github.com/dmalmq/3D-Tiles-Viewer) (`viewer.html` / `src/viewer.js` published-session shell)

## Goal

Add a new portfolio project **“3D Cesium Viewer”** (slug `3d-cesium-viewer`) in **en / ja / sv**, with an in-page interactive demo of the **published-session viewer** (venues, buildings, layers — not the authoring app).

Tiles data is **not available yet** (lives on the workstation). Production shows a pending gate; local/dev can override with a manifest URL to a CORS-enabled tiles host.

## Non-goals

- Porting the full authoring UI (`main.js` / `index.html`)
- Eager Cesium on any portfolio page
- Deploying the viewer repo’s entire `public/` tree
- Autoplay media or background WebGL
- Publishing tiles from this portfolio repo

## Architecture

```
Project page (SSR, static content)
  └─ DemoGate island (client:visible | client:idle)
       ├─ poster + copy + button
       ├─ if no configured demo URL → disabled / “data coming soon”
       └─ on click (only when URL configured)
            └─ create iframe → /demos/cesium-viewer/viewer.html?manifest=…
                 (Cesium JS loads only inside iframe after click)
```

### Why iframe, not React island

`viewer.js` is a DOM-id singleton (`new Viewer("cesiumContainer")`), pulls global Cesium + widgets CSS + large viewer modules, and has no teardown API. An iframe:

- Isolates CSS and WebGL
- Destroys cleanly when removed or on navigation
- Preserves real published-viewer UX without a rewrite

**Important:** Astro `client:only="react"` hydrates immediately and is **not** a load gate. The gate is a tiny island (or Astro + script); Cesium is loaded only by the iframe after click.

### Config

| Source | Behavior |
|---|---|
| Env `PUBLIC_CESIUM_DEMO_MANIFEST_URL` | If set, gate enables “Load interactive demo” and passes URL into iframe (query or hash). Local/dev override for workstation/CDN tiles. |
| Project frontmatter `demo.manifestUrl` (optional) | Per-project override once production data is published. |
| Neither set | Gate shows pending state; **no iframe, no Cesium**. |

Tiles/manifest host must send CORS headers for the portfolio origin when data is remote.

### Storage isolation (required)

The viewer currently uses `localStorage["theme"]` (and language keys) — the **same key** as the portfolio theme. A same-origin iframe would clobber portfolio theme on toggle.

**Demo build must namespace viewer storage**, e.g.:

- `tiles-viewer:theme`
- `tiles-viewer:language`
- any other viewer-only keys used for section state

Do this in the demo build of the viewer (patch or build-time replace), not by changing portfolio theme keys.

## Portfolio content

### New project (parity en/ja/sv)

- Path: `src/content/projects/{en,ja,sv}/3d-cesium-viewer.md`
- `featured`: decide at implement time (default **true** if it is a flagship tool; otherwise false — pick one in plan)
- Case-study copy: problem (sharing 3D tiles without installs), solution (browser published viewer), impact, tech stack (CesiumJS, 3D Tiles, Vite, …)
- Cover/poster: existing still or dedicated screenshot once available
- Optional frontmatter later:

```ts
demo: z.object({
  type: z.literal('cesium-viewer'),
  manifestUrl: z.string().url().optional(),
  poster: z.string().optional(),
}).optional()
```

### UI on project detail page

New section after gallery (hairline-ruled, editorial):

- Eyebrow: `INTERACTIVE DEMO` / JA/SV equivalents  
- Title + one-line description  
- Poster frame (`rounded-[var(--radius-feature)] border border-[var(--line)]`)  
- Primary button: **Load interactive demo** (enabled only when URL configured)  
- Pending copy when not configured  
- Optional secondary: open demo in new tab (same URL) once loaded path exists  

After click: replace poster with 16:9 (or min-height) iframe; “Close demo” removes iframe and restores poster (destroys WebGL).

### Gate island

- File: e.g. `src/components/demos/CesiumViewerGate.tsx`  
- Hydration: `client:visible` or `client:idle` — **tiny**, no Cesium import  
- On click: `import()` is **not** required for Cesium if iframe loads the sub-app; gate only creates/destroys iframe  
- Unmount / Close: `iframe.remove()`, clear refs  

## Viewer sub-app build

### Source

GitHub `dmalmq/3D-Tiles-Viewer`, **viewer entry only** (`viewer.html` + `src/viewer.js` graph).

### Output

`public/demos/cesium-viewer/` (or `public/demos/3d-tiles-viewer/`) containing:

- `viewer.html`
- hashed JS/CSS/workers from the viewer build
- **allowlisted** static assets only

### Public allowlist (hard requirement)

Do **not** copy the viewer repo `public/` wholesale. That tree currently includes work artifacts (e.g. `public/14_アイコン（共通）/.../*.pptx`).

Allowlist for the demo build, e.g.:

- `favicon.svg`
- `icons/marker/*` (if the published viewer needs markers)
- anything the viewer build explicitly requires after a dry-run

Script: `scripts/build-cesium-viewer-demo.mjs` (or similar) that:

1. Clones or uses a pinned path/version of the viewer repo  
2. Applies storage-key namespace patch  
3. Builds only the `viewer` Rollup/Vite input  
4. Copies allowlisted assets into the demo output  
5. Fails CI if unexpected files appear under the demo public root  

### Integration with portfolio build

- Documented manual or prebuild step; optional `npm run build:demo-viewer`  
- Portfolio `npm run build` must not fail if demo assets are missing — project page still renders pending gate  
- When demo assets missing and URL configured, gate shows error state rather than broken iframe  

## Performance & a11y

- Zero Cesium network until click  
- Poster is LCP-friendly still image  
- iframe `title` descriptive; focus moves into frame on load when feasible  
- Close control always available outside iframe  
- `prefers-reduced-motion`: no animated gate gimmicks  

## Locales

- Project MD: full en/ja/sv  
- Gate strings: either frontmatter/copy record on the project page component pattern or small keys in i18n — prefer **page-local copy record** matching Contact/Consulting precedent if not reused elsewhere  
- Viewer internal EN/JA UI remains the viewer’s own i18n (namespaced storage)  

## Testing

| Check | Pass criteria |
|---|---|
| No env / no frontmatter URL | Gate pending; no iframe; network has no Cesium |
| Env URL set + demo assets present | Click loads iframe; viewer shell appears |
| Close demo | iframe gone; WebGL context released |
| Theme toggle in viewer | Portfolio `localStorage.theme` unchanged |
| Language toggle portfolio | Demo iframe not required; portfolio theme/lang intact |
| `astro check` / build | Green with and without demo assets |
| Project parity | 3d-cesium-viewer in en/ja/sv |

## Implementation phases (for later plan)

1. Schema + en/ja/sv project content + cover/poster  
2. `CesiumViewerGate` + ProjectDetailPage section  
3. Viewer demo build script (allowlist + storage namespace)  
4. Env wiring + local smoke with workstation/CDN tiles  
5. Docs in README for “how to refresh the demo build / publish tiles”  

## Open decisions (non-blocking)

- `featured: true` vs `false` for the new project  
- Exact poster image asset path  
- Whether production eventually uses frontmatter `manifestUrl` only (drop env) once public tiles exist  

## Approval record

- Placement: **new project page** “3D Cesium Viewer”  
- Scope: **published-session style** from `viewer.js`  
- Data: **local/dev override only** until tiles published  
- Integration: **click-gated iframe + curated viewer build**  
- Locales: **en + ja + sv**  
- Design approved in conversation 2026-07-11 for writing this spec  
