# Daniel Malmqvist — Personal Site Spec & Development Plan

**Document Version:** 1.3  
**Date:** March 2026  
**Status:** LOCKED — Phase 7 (wow factor sprint) added

> **For AI assistants:** This is the authoritative spec for building `malmqvist.dev`. The framework is **Astro 5.x**, hosted on **Vercel**, with **Tailwind CSS**, **React islands** for interactivity, and **Cloudflare** for DNS/email. All architectural decisions below are final unless Daniel explicitly overrides them. Follow the phased build plan in Section 9. **Current focus: Phase 7 — visual and interaction upgrade ("wow factor" sprint).** Phase 7.7 covers upcoming CesiumJS/3D Tiles integration.

---

## 1. Project Overview

A bilingual (EN/JP) personal portfolio and online CV for Daniel Malmqvist (ダニエル マルムクビスト), positioning him as a BIM Manager, Agentic Programmer, and Tech Enthusiast — someone who bridges the gap between BIM workflows and emerging technology to build better solutions for the AEC industry.

**Core narrative:** Daniel's career spans the full arc from traditional architecture to cutting-edge digital twin technology. He spent 7 years at Tengbom — one of the Nordic region's leading architecture firms (est. 1906, ~600 employees) — including 3 years as BIM Manager on major institutional projects like the award-winning Ersta Sjukhus hospital in Stockholm and Arlanda Porten, the 330m Terminal 5 expansion at Stockholm Arlanda Airport. He then brought that deep architectural and BIM expertise to Tokyo, where he now creates the indoor navigable layer of the city's digital twin at JRE Consultants, building BIM models integrated with Japan's government-backed PLATEAU 3D city model and developing custom tools to streamline the data pipelines that make this possible. He is not a developer who learned some BIM — he is an architect-turned-BIM-manager who learned to code, and that distinction matters.

---

## 2. Framework: Astro (Confirmed)

### Why Astro

| Concern | Astro's Answer |
|---------|---------------|
| **Performance** | Static-first with zero JS by default. Portfolio/CV sites don't need client-side hydration for most content. |
| **i18n** | First-class support via `@astrojs/i18n` or manual routing (`/en/`, `/ja/`). Content collections make bilingual content management clean. |
| **Blog** | Built-in content collections with Markdown/MDX. Perfect for articles. |
| **Interactivity** | "Islands architecture" — drop in React/Vue/Svelte components only where needed (e.g., language toggle, contact form, image gallery). |
| **Vercel** | Official Astro adapter for Vercel. One-click deployment. |
| **DX** | File-based routing, TypeScript support, Tailwind integration out of the box. |
| **Ecosystem** | Growing fast, large community, excellent docs. |

### Alternatives Considered (rejected)

- **Next.js** — Overkill for a portfolio. Brings full React runtime, SSR complexity, and hydration cost that this site doesn't need. Would make sense if the site were a full web app.
- **Hugo** — Blazing fast, but Go templating is awkward for custom interactive components. i18n works but is config-heavy.
- **Nuxt** — Strong choice, but Vue ecosystem is smaller for component libraries. No clear advantage over Astro here.

### Tech Stack (Confirmed)

| Layer | Choice |
|-------|--------|
| Framework | **Astro 5.x** |
| Styling | Tailwind CSS 4.x |
| Interactive islands | React (for contact form, language toggle, theme toggle, image lightbox) |
| Content | Astro Content Collections (Markdown/MDX) |
| i18n | File-based routing (`/en/`, `/ja/`) + shared translation JSON |
| Hosting | **Vercel** |
| Domain | **`malmqvist.dev`** (registered, Namecheap) |
| DNS & Email | **Cloudflare** (DNS management + Email Routing → Gmail) |
| Contact email | **`daniel@malmqvist.dev`** |
| Analytics | Vercel Analytics or Plausible (privacy-friendly) |

---

## 3. Site Architecture

### 3.1 Page Structure

```
/
├── /en/                     → English root (default)
│   ├── index                → Home / Landing
│   ├── /projects/           → Project showcase
│   │   ├── shinjuku-nav     → Indoor Navigation case study
│   │   ├── imdf-converter   → Shapefile to IMDF tool
│   │   ├── revit-geopackage → Revit to GeoPackage plugin
│   │   └── ...              → Future projects
│   ├── /blog/               → Articles & writing
│   │   └── [slug]           → Individual posts
│   ├── /about/              → Extended bio, skills, experience
│   └── /contact/            → Contact form + links
│
├── /ja/                     → Japanese mirror (same structure)
│   ├── index
│   ├── /projects/
│   ├── /blog/
│   ├── /about/
│   └── /contact/
│
├── /resume.pdf              → Downloadable PDF resume (EN)
├── /resume-ja.pdf           → Downloadable PDF resume (JP)
└── /api/contact             → Serverless contact form handler (Vercel function)
```

### 3.2 Navigation

```
[DM logo/monogram]   Projects   Blog   About   Contact   [EN/JP toggle]   [GitHub] [LinkedIn]
```

- Sticky header, blurred dark background on scroll
- Mobile: hamburger menu with slide-in panel
- Language toggle persists selection to `localStorage` and updates URL prefix
- Active page indicator (subtle underline or accent color)

### 3.3 Home Page Sections

1. **Hero** — Name, tagline, one of the Shinjuku navigation screenshots as a full-width background or featured image. Subtle parallax or fade-in on scroll. Tagline should capture the arc: something like "From Stockholm's hospitals and airports to Tokyo's digital twin" or "Architect. BIM Manager. Agentic Programmer."
2. **What I Do** — Three-card summary: Architecture & BIM Management / Agentic Programming / Tech Integration. Brief, punchy descriptions. The first card grounds Daniel in real-world architecture (Tengbom, hospitals, airports). The second shows the evolution into code and automation. The third ties it together.
3. **Featured Project** — Shinjuku indoor navigation spotlight with both screenshots, brief description, and link to full case study.
4. **Tools & Skills** — Visual grid or tag cloud, grouped by category. Architecture: Revit, ArchiCAD (if applicable), BIM coordination, clash detection. Geospatial: CityGML, IFC, GeoPackage, IMDF, Shapefiles. Open-source: Blender, Bonsai. Programming: Python, C# (if applicable). Visualization: FBX, Unity, Blender renders. Project types: Healthcare, Airport/Infrastructure, Indoor Navigation, Digital Twins. Languages: English (native), Swedish (native), Japanese (JLPT N3, N2 in progress).
5. **Latest Posts** — 2–3 most recent blog entries.
6. **CTA** — "Get in touch" with link to contact page + social links.

---

## 4. Content Strategy

### 4.1 Project Case Studies

Each project page follows a consistent structure:

- **Problem** — What was inefficient or broken?
- **Solution** — What did you build?
- **Tech Stack** — Tools and formats involved
- **Impact** — Time saved, workflows improved, scale of use
- **Visuals** — Screenshots, renders, diagrams

#### Project: Shinjuku Indoor Navigation (flagship)

- **Problem:** Tokyo's complex underground station networks are nearly impossible to navigate with traditional 2D maps. PLATEAU provides city-scale 3D data but stops at building exteriors.
- **Solution:** Create detailed Revit models of station interiors, underground walkways, and surrounding shopping malls. Convert to FBX for use as 3D assets in a Unity-based indoor navigation application. Integrate with PLATEAU's CityGML digital twin for seamless indoor-outdoor continuity.
- **Tech:** Revit → FBX → Unity | PLATEAU CityGML | Blender + Bonsai (CityGML → IFC)
- **Role clarity:** BIM modeling and data pipeline (not the Unity development)
- **Visuals:** The two Shinjuku screenshots (aerial transparent view + street-level navigation)
  - **NEW: Full Revit model screenshot** (`shinjuku-revit-full-model.png`): Isometric 3D viewport export from Revit showing the entire Shinjuku station BIM model — multiple underground levels, branching walkways, connected commercial buildings, station platforms, all as one interconnected model. The scale is immediately striking. This is the single most impressive image in the portfolio.
  - **Image strategy:** Lead the Shinjuku case study with the full Revit model (this is what Daniel built), then show the PLATEAU-integrated navigation views (this is what it becomes). The arc is: raw BIM → integrated digital twin → navigable 3D environment. When 3D Tiles / Cesium embed is ready, this model becomes the interactive viewer — "Explore in 3D" button below the static screenshot., plus a full Revit 3D viewport export (`shinjuku-revit-full-model.png`) showing the complete station model — platforms, underground concourses, connecting walkways, and surrounding multi-level buildings. This is the most impressive single image in the portfolio: it shows the raw scale of what Daniel built in Revit before any of it was converted to Unity or integrated with PLATEAU. Should be featured prominently on the Shinjuku case study page, and is a strong candidate for the homepage hero or an alternate hero image.

#### Project: Shapefile to IMDF Converter

- **Problem:** Converting spatial data to Apple's Indoor Mapping Data Format was manual and error-prone.
- **Solution:** Built a tool to automate Shapefile → IMDF conversion.
- **Tech:** (add specifics: Python? What libraries?)

#### Project: Revit to GeoPackage Plugin

- **Problem:** Legacy workflow required Revit → DWG → Shapefile, a three-step process with data loss at each conversion.
- **Solution:** Revit plugin for direct GeoPackage export, collapsing the pipeline to one step. The plugin includes an Export Preview window that visualizes the floor plan with spaces color-coded by IMDF category (elevator, escalator, restroom, walkway, stairs, nonpublic, etc.), with filter toggles and feature counts — allowing validation before export.
- **Tech:** C#, Revit API, SQLite, Ogr2Ogr
- **Key detail:** Exports aren't raw geometry — the plugin applies IMDF-standard semantic categories to each space, meaning the GeoPackage output is pre-classified for indoor mapping workflows. This bridges the BIM authoring environment directly to the indoor navigation data pipeline.
- **Visuals available:**
  - Export Dialog screenshot (`revit-plugin-export-dialog.png`): Main plugin window showing plan view selection with Japanese floor names (B1FL, 1FL_ホーム, 2FL_コンコース, 3FL), feature type filters (unit, detail, opening, level), language selector, CRS/EPSG selection (EPSG:6677 Zone IX for Japan), output directory, and Preview/Export buttons. Version v1.3.3.0.
  - Export Preview screenshot (`revit-plugin-export-preview.png`): Validation window showing a station concourse (2FL_コンコース) with 65 features color-coded by IMDF category (elevator, escalator, restroom, walkway, stairs, etc.), legend with counts, and filter toggles.
  - **Image strategy:** Use the Export Dialog as the project card thumbnail (it immediately reads as "a tool I built"). On the case study page, show both screenshots in sequence: dialog → preview, demonstrating the full export workflow.

#### Project: Ersta Sjukhus — New Hospital, Stockholm (Tengbom)

- **Context:** Ersta Nya Sjukhus is a ~23,000 m² hospital on Södermalm in central Stockholm, built on a steep hillside between Folkungagatan and Fjällgatan. Winner of Best Healthcare at the Monocle Design Awards 2024 and finalist for Årets Stockholmsbyggnad 2024. Tengbom took over the project in 2017 from Nyréns Arkitektkontor to develop the function and design through to completion in 2023.
- **Role — Architect / BIM Modeler (3 years):**
  - Rebuilt the entire Revit model from scratch based on an IFC model received from Nyréns — effectively reverse-engineering the design intent from another firm's export and creating a production-ready Revit model.
  - Primary modeler responsible for the building's facade — the ocher brown anodized aluminum and metal cladding system that became one of the building's defining features.
  - Participated in regular interdisciplinary coordination meetings with electrical, HVAC, and structural engineers to ensure spatial coordination and clash-free integration across systems.
  - Involved in facade fabrication coordination meetings to validate that the designed facade solution could be manufactured and installed as specified.
  - Contributed to an Enscape VR walkthrough of the hospital used for stakeholder engagement — doctors and nurses visited the Tengbom office to experience the building and hospital rooms in VR before construction, providing direct feedback on layouts and spatial design. The client was so impressed that they purchased their own VR headset to continue showing staff and visitors the virtual hospital independently.
- **Scale:** Six-to-eight stories, complex topography (38,000 m³ of rock blasted), integration of new build with listed heritage structures.
- **Narrative angle:** This project shows the full arc from data translation (IFC → Revit rebuild) through design development (facade modeling) to fabrication coordination — all on a single, award-winning building. It's the clearest proof that Daniel understands the entire lifecycle of a BIM model, not just the software.
- **Visuals available:**
  - **Revit model screenshots (x3) — PRIMARY:** Direct 3D viewport exports from Daniel's Revit model showing the full hospital from three angles. These are the most important images for this case study — raw, unrendered BIM views that immediately communicate the complexity and detail of the facade system, window assemblies, terraces, rooftop elements, and hillside topography. Any BIM professional will instantly recognize and respect these.
  - Construction photos (x3): The completed facade from multiple angles during construction, showing the ocher brown anodized aluminum cladding, horizontal banding, and large window systems. Includes a striking golden-hour close-up.
  - Facade design review (x2): Photos from inside the Tengbom office showing facade material and color study boards — technical section drawings alongside rendered visualizations of different zone and color options. Excellent "process" images.
  - BIM render (x1): 3D visualization with sky background of the new hospital building alongside the listed heritage structure, showing the "Ersta Sjukhus" entrance.
- **Image strategy:** Lead with the Revit model screenshots (Daniel's direct work product). Then the Tengbom office facade review photos (the design process). Then construction photography (the built result). Optionally close with the rendered visualization for context. This creates the full arc: **model → design review → construction → completed building.**

#### Project: Arlanda Porten — Terminal 5 Expansion, Stockholm (Tengbom) — *CV/Timeline item only*

> **Note:** This project will appear on the About page career timeline and PDF resume rather than as a standalone case study page, as the BIM Manager role was process-focused without strong visual portfolio material.

- **Context:** Project Porten is a 330-meter extension of Terminal 5 at Stockholm Arlanda Airport. The project included a new security checkpoint, commercial marketplace, and a new outward-facing facade.
- **Role — BIM Manager:**
  - Managed weekly model exports and deliverables, ensuring quality and consistency before client deadlines.
  - Served as the go-to BIM resource for the project team — supporting colleagues with modeling questions, workflow issues, and best practices.
  - Quality-controlled all BIM deliverables to ensure they met project standards before submission.
- **Scale:** Major airport infrastructure with stringent security, operational, and functional requirements.

### 4.4 Blog Topics (Suggested Starters)

- "Why BIM Managers Should Learn to Code"
- "From Hospital BIM to Digital Twins: Lessons from Tengbom to Tokyo"
- "Bridging PLATEAU's City-Scale Twin with Indoor BIM Models"
- "CityGML to IFC: A Practical Workflow with Blender and Bonsai"
- "Building Agentic Tools for AEC Workflows"
- "The Case for GeoPackage Over Shapefiles in BIM Pipelines"
- "What Designing Hospitals Taught Me About Data Pipelines"
- "Obsidian + Claude Code: Building a BIM Manager's Second Brain" — Exploring the integration of Obsidian for notes/documentation with Claude Code for agentic task execution, and how this could streamline calendar management, task tracking, and project documentation for BIM workflows. This sits right at the intersection of Daniel's interests: knowledge management, AI agents, and BIM process improvement.
- "Studying for JLPT N2 While Working as a BIM Manager in Tokyo"

### 4.5 About Page

- **Career arc:** Architecture → BIM Management → Agentic Programming. The journey from Tengbom in Sweden to JRE Consultants in Tokyo.
- **Tengbom years (7 years):** Worked as architect and BIM Manager at one of the Nordic region's oldest and most respected firms. Highlight the scale and complexity of projects: hospitals, schools, airports.
- **Tokyo chapter:** The move to Japan, working with PLATEAU, building indoor navigation systems, developing custom tools.
- **Language:** Japanese Language Proficiency Test (JLPT) N3 certified, currently studying for N2 (scheduled July 2026). This should be visible — it signals commitment to working in Japan long-term and the ability to collaborate with Japanese teams, clients, and engineers. On the Japanese version of the site, this can be stated as 日本語能力試験N3合格、N2取得に向けて勉強中.
- **Philosophy:** Merging architectural thinking with modern tech — the belief that the best BIM solutions come from people who understand both the design intent and the data pipeline.
- **Skills breakdown** (categorized: Architecture & BIM, Geospatial, Programming, Visualization, Languages)
- **Timeline or career path visualization** — Strongly recommended given the clear arc. Could be a horizontal timeline or a vertical scroll-through.

---

## 5. Internationalization (i18n) Strategy

### Approach: File-Based Routing with Auto-Detection

```
src/
├── content/
│   ├── projects/
│   │   ├── en/
│   │   │   ├── shinjuku-nav.md
│   │   │   └── ...
│   │   └── ja/
│   │       ├── shinjuku-nav.md
│   │       └── ...
│   └── blog/
│       ├── en/
│       └── ja/
├── i18n/
│   ├── en.json          → UI strings (nav, buttons, labels)
│   └── ja.json
```

### Detection Logic

1. First visit: check `navigator.language` / `Accept-Language` header
2. If `ja` or `ja-JP` → redirect to `/ja/`
3. Otherwise → redirect to `/en/`
4. Store preference in `localStorage`
5. Subsequent visits: use stored preference
6. Manual toggle always overrides

### Translation Notes

- All UI chrome (navigation, buttons, footer, form labels) translated via JSON files
- Project and blog content are separate Markdown files per language (not machine-translated — allows natural, native-quality writing in each language)
- Meta tags (`<title>`, `<meta description>`, `og:` tags) translated per language
- `hreflang` tags for SEO: `<link rel="alternate" hreflang="en" href="..." />` and `<link rel="alternate" hreflang="ja" href="..." />`

---

## 6. Design System — Dual Theme

### 6.1 Theme Philosophy: Two Sides of the Same Profile

The site ships with two distinct visual modes, each reflecting a different facet of Daniel's work:

| Mode | Identity | Mood | Inspiration |
|------|----------|------|-------------|
| **Dark — "Code"** | Agentic Programmer, Tech Enthusiast | Futuristic, precise, digital | Terminal UIs, VS Code, developer portfolios, neon-on-dark dashboards |
| **Light — "Blueprint"** | BIM Manager, Architectural Thinker | Clean, structured, material | Architectural drawings, Swiss typography, Monocle magazine, concrete + steel |

This isn't just a color inversion — the two modes have subtly different accent colors, card treatments, and typographic emphasis. The content is identical; the *feel* shifts. Visitors who find Daniel via GitHub see the coder. Visitors who find him via a BIM conference see the architect. Both are real.

This duality is grounded in Daniel's actual career: 7 years of architecture and BIM management at Tengbom in Sweden (hospitals, airports) followed by a move to Tokyo where he builds digital twin navigation systems and writes custom tools. The "Blueprint" mode reflects that architectural foundation; the "Code" mode reflects where he's taken it since.

**Default behavior:**
1. Check `prefers-color-scheme` media query on first visit
2. Default to Dark if no preference is set
3. Store selection in `localStorage`
4. Toggle accessible in the header (sun/moon icon, or a custom toggle — see Component Patterns)

### 6.2 Color Palettes

All colors are mapped to CSS custom properties on `:root` (light) and `.dark` (or `[data-theme="dark"]`), consumed via Tailwind's theme config.

#### Dark Mode — "Code"

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | Page background — near-black with a faint blue undertone |
| `--bg-secondary` | `#12121a` | Card/section backgrounds |
| `--bg-elevated` | `#1a1a2e` | Hover states, modals, elevated surfaces |
| `--bg-surface` | `#0f0f18` | Subtle alternating section background |
| `--text-primary` | `#e4e4e7` | Body text |
| `--text-secondary` | `#a1a1aa` | Muted text, captions, metadata |
| `--text-heading` | `#fafafa` | Headings — near-white, high contrast |
| `--accent` | `#3b82f6` | Primary accent — electric blue |
| `--accent-hover` | `#60a5fa` | Accent hover/focus state |
| `--accent-muted` | `#1e3a5f` | Accent tint for backgrounds, tag fills |
| `--accent-glow` | `rgba(59, 130, 246, 0.15)` | Box-shadow glow on hover (cards, buttons) |
| `--border` | `#27272a` | Dividers, card borders |
| `--border-hover` | `#3b82f6` | Border accent on interactive hover |
| `--code-bg` | `#1e1e2e` | Code block background (Catppuccin Mocha-adjacent) |
| `--code-text` | `#cdd6f4` | Code block text |
| `--success` | `#22c55e` | Form success states |
| `--error` | `#ef4444` | Form error states |

#### Light Mode — "Blueprint"

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#fafaf9` | Page background — warm off-white, not sterile |
| `--bg-secondary` | `#f5f5f0` | Card/section backgrounds — paper-like warmth |
| `--bg-elevated` | `#ffffff` | Elevated surfaces (modals, dropdowns) |
| `--bg-surface` | `#efefe8` | Alternating section background — subtle stone/linen tint |
| `--text-primary` | `#1c1c1e` | Body text — soft black, not pure #000 |
| `--text-secondary` | `#6b7280` | Muted text, captions |
| `--text-heading` | `#111111` | Headings — high contrast, confident |
| `--accent` | `#2563a0` | Primary accent — muted steel blue (architectural, not techy) |
| `--accent-hover` | `#1e4f80` | Accent hover — darker, more intentional |
| `--accent-muted` | `#e8f0f8` | Accent tint for backgrounds, tag fills |
| `--accent-glow` | none | No glow effects in light mode — relies on shadow instead |
| `--border` | `#d4d4cd` | Dividers — warm gray, like pencil lines |
| `--border-hover` | `#2563a0` | Border accent on interactive hover |
| `--code-bg` | `#f4f4f0` | Code block background — paper-toned |
| `--code-text` | `#1c1c1e` | Code block text |
| `--success` | `#16a34a` | Form success (slightly deeper green for contrast) |
| `--error` | `#dc2626` | Form error |

#### Accent Color Rationale

The accent shift between modes is intentional:
- **Dark mode `#3b82f6`** — Electric, vibrant, visible against dark backgrounds. Reads as "tech."
- **Light mode `#2563a0`** — Desaturated, deeper. Reads as "professional" and "architectural." Evokes blueprint ink.

Both are in the blue family so the brand feels cohesive, but the temperature and saturation shift with the mode.

### 6.3 Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Geist Sans | 600–700 | 2rem–3rem (responsive, clamp-based) |
| Body | Geist Sans | 400 | 1rem (16px) / 1.6 line-height |
| Code / monospace | Geist Mono | 400 | 0.875rem |
| Japanese fallback | Noto Sans JP | 400/700 | inherits |

**Note:** Geist is Vercel's open-source typeface. It pairs well with the tech aesthetic in dark mode and has enough neutrality to work for the architectural feel in light mode. Noto Sans JP handles Japanese text cleanly and is available via Google Fonts or self-hosted.

#### Typography Variations by Theme

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Heading letter-spacing | `0` (default) | `0.02em` (slightly tracked out — architectural precision) |
| Body line-height | `1.6` | `1.7` (more breathing room, like a printed document) |
| Heading text-transform | None | Optional `uppercase` on section labels/overlines only |
| Code blocks | Catppuccin Mocha syntax theme | GitHub Light or Solarized Light syntax theme |

### 6.4 Component Patterns — Per Theme

#### Cards

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Background | `--bg-secondary` | `--bg-elevated` (white) |
| Border | 1px `--border` | 1px `--border` |
| Border radius | `12px` | `8px` (slightly sharper — more geometric) |
| Hover effect | Border shifts to `--accent`, faint `--accent-glow` box-shadow | Subtle upward `translateY(-2px)` + soft drop shadow, no glow |
| Shadow | None at rest | `0 1px 3px rgba(0,0,0,0.06)` at rest |

#### Buttons

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Primary | Filled `--accent`, white text | Filled `--accent`, white text |
| Secondary | Ghost/outline with `--accent` border | Outline with `--border`, `--text-primary` text |
| Border radius | `9999px` (pill) | `6px` (rect — more architectural) |
| Hover | Glow + slight brightness | Darken + subtle shadow |

#### Tags/Chips (Tech Stack Labels)

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Background | `--accent-muted` | `--accent-muted` |
| Text | `--accent` | `--accent` |
| Border | None | 1px `--border` |
| Style feel | Glowing badges | Printed labels / stamps |

#### Images (Project Screenshots)

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Treatment | Full-bleed or generous width, faint border, slight glow on hover | Contained in a card frame with `--border`, subtle shadow, like a mounted print |
| Border radius | `8px` | `4px` (crisper) |
| Background behind image | `--bg-secondary` | `--bg-surface` |

#### Navigation Header

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Background | `--bg-primary` with backdrop blur | `--bg-primary` with subtle bottom border |
| Style | Transparent → solid on scroll | Clean solid bar from the start |
| Active indicator | Accent-colored underline | Bold weight shift (no underline) or thin bottom border |

#### Section Dividers

| Property | Dark "Code" | Light "Blueprint" |
|----------|-------------|-------------------|
| Style | Gradient fade (transparent → `--border` → transparent) | Thin 1px `--border` line, full width — like a drawing grid |

#### Theme Toggle

The toggle should sit in the header alongside the language switch. Suggested design:
- **Icon pair:** Sun (light) / Moon (dark), or a custom icon that hints at the duality (e.g., a pencil/terminal cursor flip)
- **Transition:** Smooth 200ms color transition on `background-color`, `color`, `border-color`, and `box-shadow` across all themed elements. Not instant — feels intentional.

### 6.5 Tailwind Implementation

```javascript
// tailwind.config.mjs
export default {
  darkMode: 'class', // Controlled via JS, not media query (allows manual toggle)
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
          surface: 'var(--bg-surface)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          heading: 'var(--text-heading)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
        },
      },
    },
  },
}
```

CSS custom properties are defined in `global.css`:

```css
:root {
  /* Light "Blueprint" — default in CSS, dark applied via .dark class */
  --bg-primary: #fafaf9;
  --bg-secondary: #f5f5f0;
  /* ... all light tokens */
}

.dark {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  /* ... all dark tokens */
}

/* Smooth theme transition */
*,
*::before,
*::after {
  transition: background-color 200ms ease, color 200ms ease,
              border-color 200ms ease, box-shadow 200ms ease;
}
```

### 6.6 Mobile-First Design

**The phone is the primary viewport.** Most visitors will first see the site via a shared link at meetups, on LinkedIn, or in messaging apps. The desktop version is the expanded layout, not the other way around.

#### Design Approach

- All layouts designed mobile-first in CSS (`min-width` media queries to scale *up*, not `max-width` to scale down)
- Touch targets minimum 44x44px (Apple HIG standard)
- No hover-dependent interactions — hover effects are enhancements, never the only way to access information
- Test on real devices, not just browser dev tools (especially iOS Safari, which has quirks with `100vh`, fixed positioning, and safe area insets)

#### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, hamburger nav, stacked cards |
| Tablet | 640–1024px | Two-column grids, expanded nav |
| Desktop | > 1024px | Full layout, max-width container ~1200px |

#### Mobile-Specific Considerations

| Element | Mobile Treatment |
|---------|-----------------|
| **Navigation** | Hamburger menu with slide-in panel. Language + theme toggles accessible inside the menu, not hidden. |
| **Hero** | Full-width image, shorter headline. Avoid parallax on mobile (performance + motion sensitivity). |
| **Project images** | Full-bleed, swipeable gallery or vertical scroll. Lightbox should feel native (pinch-to-zoom, swipe-to-close). |
| **Ersta Revit screenshots** | These are wide landscape images — on mobile, allow horizontal scroll within a container or show a cropped/zoomed detail with tap-to-expand. Don't just squash them into a narrow column. |
| **Shinjuku navigation screenshots** | Same treatment — these are ultra-wide and lose all detail if scaled to fit a phone width. |
| **Cards** | Full-width stacked. No side-by-side on mobile. |
| **Skills/Tags** | Wrap naturally into rows. Keep tags compact enough that 3–4 fit per row. |
| **Blog posts** | Generous line-height (1.7+), comfortable reading width. Body text 16px minimum (prevents iOS zoom on input focus). |
| **Contact form** | Full-width inputs, large tap targets, native keyboard hints (`type="email"`, `inputmode`). |
| **Timeline** | Vertical scroll (not horizontal) on mobile. |
| **Code blocks** | Horizontal scroll within the block, not page-level overflow. Slightly smaller font size (14px). |
| **Footer** | Stacked columns, social links prominent and tappable. |

#### Performance (Mobile Networks)

- Images: Serve responsive sizes via `<picture>` / Astro `<Image />` with `srcset`. No 4000px images on a phone.
- Fonts: Subset Geist and Noto Sans JP to reduce payload. Consider `font-display: swap` to avoid invisible text on slow connections.
- Target: < 200KB initial page load (excluding images below the fold)
- Lazy load all images below the fold
- Prefetch linked pages on hover/tap for instant transitions

#### iPad / Tablet Specifics

- The tablet breakpoint (640–1024px) should feel like a designed layout, not an awkward in-between. Two-column grids for project cards and blog listings.
- Test both portrait and landscape orientations — iPad users switch frequently.
- The Ersta and Shinjuku images will actually look best on tablet — enough width to show detail, enough height for comfortable browsing.
- Navigation can show the full horizontal nav bar (no hamburger needed) at 768px+.

#### Share Preview (Critical for Meetup Sharing)

When someone shares `malmqvist.dev` in a messaging app or on social media, the link preview is often the actual first impression, even before the site loads:

- Open Graph image: Design a dedicated OG image (1200x630px) for the home page — name, tagline, maybe a subtle Shinjuku screenshot background. This is what shows up in iMessage, LINE, Slack, LinkedIn, etc.
- Per-project OG images: Each case study should have its own OG image (e.g., the Revit model screenshot for Ersta, the aerial nav view for Shinjuku).
- Test with [opengraph.xyz](https://opengraph.xyz) or similar tools before launch.
- `<meta name="theme-color">` should match the current theme (dark bg for dark mode, light bg for light mode) so the browser chrome looks intentional.

---

## 7. Features Detail

### 7.1 Contact Form

- Fields: Name, Email, Subject (dropdown: Job Inquiry / Collaboration / General), Message
- Backend: Vercel serverless function → forwards to `daniel@malmqvist.dev`
- Alternative: Formspree or Resend for simpler setup
- Honeypot field + rate limiting for spam prevention
- Success/error states with clear feedback

### 7.2 PDF Resume Download

- Two versions: English and Japanese
- Download button in the nav or About page
- PDFs stored in `/public/` and versioned in git
- Consider auto-generating from structured data (future enhancement)

### 7.3 Blog

- Markdown/MDX with frontmatter (title, date, tags, language, description, cover image)
- Tag-based filtering
- Reading time estimate
- Syntax highlighting for code snippets (Shiki, built into Astro)
- RSS feed for each language
- **Voice:** Casual, informative, technically grounded but approachable. Write like you're explaining something to a smart colleague over coffee — not presenting at a conference, not writing a textbook. "Here's a problem I hit, here's how I solved it, here's what I learned." In Japanese, use ですます form but keep it conversational, not stiff.
- **Cadence:** No fixed schedule initially. Publish when there's something worth sharing. Quality over frequency — one solid post a month is better than forced weekly content. The blog structure should be ready at launch even if only one post is live.

### 7.4 GitHub & LinkedIn Links

- Icon links in header (persistent) and footer
- GitHub can also appear contextually on project pages linking to specific repos

### 7.5 Image Handling

- Project screenshots served as optimized WebP via Astro's built-in `<Image />` component
- Lazy loading below the fold
- Lightbox for gallery views (React island component)
- Blender renders included in project pages

---

## 8. SEO & Performance

- **Meta tags:** Per-page, per-language title and description
- **Open Graph / Twitter cards:** Per page with project images
- **hreflang:** Proper alternate links for EN/JP
- **Sitemap:** Auto-generated via `@astrojs/sitemap`
- **Lighthouse target:** 95+ across all categories
- **Core Web Vitals:** Static-first approach should hit good scores natively
- **Structured data:** JSON-LD for Person schema on the About page

---

## 9. Development Phases

### Phase 1 — Foundation (Week 1–2)

**Goal:** Scaffolding, design system, and core layout.

- [ ] Initialize Astro project with Tailwind, TypeScript, React integration
- [ ] Set up Vercel deployment (connect repo, preview deploys on PR)
- [ ] Implement file-based i18n routing (`/en/`, `/ja/`)
- [ ] Create translation JSON files with UI strings
- [ ] Build layout components: Header, Footer, Navigation, Language Toggle
- [ ] Implement dual-theme system: CSS custom properties, `.dark` class toggle, `prefers-color-scheme` detection, `localStorage` persistence
- [ ] Build theme toggle component (header placement, sun/moon or custom icon)
- [ ] Implement mobile-responsive navigation (hamburger menu with slide-in panel, language + theme toggles inside)
- [ ] All component development follows mobile-first CSS approach (`min-width` queries)
- [ ] Set up Tailwind theme config consuming CSS custom properties (see §6.5)
- [ ] Create base components in both theme variants: Card, Button, Tag, Section container
- [ ] Browser language auto-detection with `localStorage` persistence
- [ ] Verify smooth 200ms theme transition across all elements

**Deliverable:** Navigable shell in both languages, deployed to Vercel preview.

### Phase 2 — Home & About (Week 2–3)

**Goal:** Landing page and personal brand.

- [ ] Build Hero section with Shinjuku screenshot (theme-aware treatment: full-bleed dark, framed light)
- [ ] Create "What I Do" three-card section (verify both theme variants)
- [ ] Build Skills/Tools grid component
- [ ] Write and integrate About page content (EN + JP)
- [ ] Add PDF resume download functionality
- [ ] Implement scroll animations (fade-in via Intersection Observer)
- [ ] Social/GitHub/LinkedIn links in header and footer
- [ ] CTA section

**Deliverable:** Complete home and about pages in both languages.

### Phase 3 — Projects (Week 3–4)

**Goal:** Project case studies with full visual support.

- [ ] Set up Content Collections for projects (bilingual)
- [ ] Build project card component (for listing)
- [ ] Build project detail layout (problem/solution/tech/impact/visuals)
- [ ] Write Shinjuku Indoor Navigation case study (EN + JP)
- [ ] Write Shapefile → IMDF Converter case study (EN + JP)
- [ ] Write Revit → GeoPackage Plugin case study (EN + JP)
- [ ] Integrate project images with Astro `<Image />` optimization
- [ ] Image lightbox component (React island)
- [ ] Featured project section on homepage wired to content

**Deliverable:** Three complete project case studies, bilingual.

### Phase 4 — Blog & Contact (Week 4–5)

**Goal:** Blog infrastructure and contact functionality.

- [ ] Set up Content Collections for blog posts (bilingual)
- [ ] Blog listing page with tag filtering
- [ ] Blog post layout with reading time, date, tags
- [ ] Syntax highlighting configuration (Shiki)
- [ ] RSS feed generation per language
- [ ] Contact form UI component
- [ ] Vercel serverless function for form submission
- [ ] Spam prevention (honeypot, rate limit)
- [ ] Write first blog post (EN + JP) — suggested: "Why BIM Managers Should Learn to Code"

**Deliverable:** Working blog and contact form, first post published.

### Phase 5 — Polish & Launch (Week 5–6)

**Goal:** Production-ready quality.

- [ ] SEO meta tags, Open Graph images, hreflang tags
- [ ] Design dedicated OG images: home page (1200x630px with name + tagline) and per-project (Ersta Revit screenshot, Shinjuku aerial)
- [ ] Test share previews in LINE, iMessage, Slack, LinkedIn using opengraph.xyz
- [ ] Sitemap generation
- [ ] JSON-LD structured data
- [ ] Lighthouse audit and performance optimization
- [ ] Cross-browser testing (Chrome, Firefox, Safari, mobile Safari, Chrome Android)
- [ ] Real device testing: iPhone (Safari), Android phone (Chrome), iPad portrait + landscape
- [ ] Theme QA: verify both modes across all pages, check contrast ratios, test toggle persistence across sessions
- [ ] Accessibility audit (keyboard nav, screen reader, color contrast)
- [ ] 404 page (bilingual, on-brand)
- [ ] Favicon and web manifest
- [ ] Final content review (both languages)
- [ ] DNS setup and custom domain
- [ ] Analytics integration
- [ ] Launch

**Deliverable:** Live site on custom domain.

### Phase 6 — Post-Launch Review Fixes (Week 6–7)

**Goal:** Address all issues identified in the first-version site review (March 2026).

#### 🔴 Critical (Fix Immediately)

- [ ] **Fix footer social links** — GitHub and LinkedIn currently point to `github.com` and `linkedin.com` instead of Daniel's actual profile URLs
- [ ] **Update meta descriptions on ALL pages** — Google is still indexing the old site description ("As a full-stack developer..."). Update `<meta name="description">` and `og:description` on every page. Homepage suggestion: *"Daniel Malmqvist — BIM Manager & Agentic Programmer in Tokyo. From award-winning hospitals and airports in Sweden to digital twin navigation systems in Japan."*
- [ ] **Submit updated sitemap to Google Search Console** and request re-indexing of homepage
- [ ] **Remove or replace old `resume.pdf`** — the old PDF describing "software developer ruby rails typescript go react tailwind" is still accessible at `/resume.pdf` and contradicts the entire site narrative. Replace with current resume or delete.

#### 🟡 Important (Noticeably Improves the Site)

- [ ] **Add Ersta Sjukhus project case study** — This is the strongest case study in the portfolio. Write the case study page following the spec (§4.1): IFC→Revit rebuild, 3-year facade modeling, interdisciplinary coordination, fabrication meetings. Use all 9 available images: 3 Revit viewport screenshots (primary), 3 construction photos, 2 Tengbom office facade review photos, 1 BIM render.
- [ ] **Add Ersta project card to projects listing** — Even before the full case study, a card with one Revit screenshot and tags `Revit · Facade · Healthcare` would add visual weight to the projects page.
- [ ] **Fix "// missing visual" placeholder text** on IMDF Converter project card. The Revit→GeoPackage card now has two screenshots available: Export Dialog (`revit-plugin-export-dialog.png`) and Export Preview (`revit-plugin-export-preview.png`). For the IMDF Converter, options include: tool screenshots, terminal output, pipeline diagrams, or styled placeholder graphics matching the site aesthetic.
- [ ] **Flesh out About page:**
  - Add profile photo (same as GitHub/LinkedIn — see SOCIAL-PROFILES-GUIDE.md §5)
  - Add JLPT N3 passed / N2 in progress (July 2026)
  - Add brief personal note ("Based in Tokyo with my family")
  - Add categorized skills breakdown (currently only on homepage)
  - Consider splitting Tengbom entry into two roles: Architect (Ersta) and BIM Manager (Arlanda) as per LinkedIn guide
  - Implement career timeline component (currently plain text blocks — a visual timeline would be more scannable)
- [ ] **Replace blog post cover image** — "Why BIM Managers Should Learn to Code" reuses `shinjuku-nav-1.png` which already appears as the homepage hero AND featured project card. Use a different image (code + Revit screenshot, Ersta Revit viewport, or a simple graphic).

#### 🟢 Polish (Refinements)

- [ ] **Copy refinements — Homepage:**
  - "What I Do" Agentic Programming card: change "directly synthesize complex spatial data formats" → "bridge BIM models directly to geospatial formats"
  - Featured Project: change "we integrated" → "I created detailed Revit models of station interiors and converted them for Unity, integrating..." (clarify Daniel's role vs Unity developer)
- [ ] **Copy refinements — About page:**
  - Change "Developing bespoke agentic pipelines to directly synthesize complex spatial data formats" → "Developing custom agentic pipelines to convert and connect complex spatial data formats"
- [ ] **Copy refinements — Shinjuku case study:**
  - "Bridging the Extents" section: simplify "piped our modeled station interiors outward into correct CityGML topologies" for non-specialist visitors
- [ ] **Copy refinements — IMDF Converter:**
  - Impact statement: change "compilation time" → "conversion time" (avoids confusion with code compilation)
- [ ] **Copy refinements — Revit→GeoPackage:**
  - Impact statement: change "Reduced conversion stages strictly to software execution, retaining direct properties securely through SQLite standards" → "Eliminated two manual conversion steps, preserving all BIM metadata through direct SQLite/GeoPackage export"
  - Add the IMDF categorization detail: the plugin applies IMDF-standard semantic categories (elevator, escalator, restroom, walkway, stairs, etc.) to each space during export, with a visual preview window for validation before export. This is a major differentiator — it's not just a geometry converter, it's a semantically-aware export pipeline.
  - Add both plugin screenshots to the project page: Export Dialog (`revit-plugin-export-dialog.png`) showing view selection + export options, followed by Export Preview (`revit-plugin-export-preview.png`) showing IMDF-categorized floor plan validation
- [ ] **Blog post — "Why BIM Managers Should Learn to Code":**
  - Link "Ersta Sjukhus" reference to the project page (once live)
  - Consider a punchier, more personal closing line
- [ ] **Contact page:** Add a note about response time (e.g., "I usually reply within a few days")
- [ ] **Blog listing:** Implement tag filtering as more posts are added

#### Verification Checklist (Manual Testing Required)

- [ ] Dark ↔ Light mode: smooth 200ms transition, both palettes correct per spec §6.2
- [ ] Light "Blueprint" mode: feels distinctly architectural, not just inverted dark mode
- [ ] Mobile layout: hamburger menu, stacked cards, image handling for ultra-wide screenshots
- [ ] iPad layout: two-column grids, portrait + landscape orientations
- [ ] Image lightbox: click-to-expand on project pages
- [ ] Shinjuku/Ersta wide images on mobile: horizontal scroll container or tap-to-expand (not squashed)
- [ ] OG share preview: paste URL into LINE, iMessage, Slack — verify image + description
- [ ] Japanese version: content quality, navigation, language toggle round-trip
- [ ] Contact form: submit test → verify email arrives at `daniel@malmqvist.dev`
- [ ] Page load performance on mobile network (target < 200KB initial load)
- [ ] 404 page: exists, bilingual, on-brand

**Deliverable:** All critical and important issues resolved, copy polished, Ersta case study live, About page complete.

### Phase 7 — "Wow Factor" Visual & Interaction Upgrade (Weekend Sprint)

**Goal:** Transform the site from "solid portfolio" to "this person clearly cares about craft." Focus on motion, interaction, and visual polish that creates an immediate impression within the first 3 seconds of landing.

#### 7.1 Hero Section — Animated Entry

The hero is the first thing anyone sees. Make it feel alive:

- [ ] **Staggered text reveal:** Name fades/slides in first (~0.3s), then tagline (~0.6s), then subline (~0.9s), then CTA buttons (~1.2s). Use CSS `@keyframes` or Framer Motion.
- [ ] **Subtle hero image motion:** Slow Ken Burns zoom (scale 1.0 → 1.05 over ~20s) or gentle parallax on scroll. Keep it subtle — this is a portfolio, not a music video.
- [ ] **Consider using the full Shinjuku Revit model screenshot** (`shinjuku-revit-full-model.png`) as an alternate or replacement hero image. It shows the raw scale of the BIM work and is visually unlike anything on other portfolios. The current navigation screenshots show the Unity output; this shows *your* work directly. Could also rotate between both images or use the Revit model on the projects page hero.
- [ ] **Consider a gradient overlay** that transitions from the dark background into the image, giving the text more breathing room and a cinematic feel.
- [ ] **On mobile:** Disable parallax (performance + motion sensitivity). Keep the staggered text reveal — it works even better on small screens.

#### 7.2 Scroll-Triggered Animations (Site-Wide)

Content should reveal itself as the visitor scrolls, not all be present at once:

- [ ] **"What I Do" cards:** Slide up + fade in, staggered (first card, then second, then third, ~150ms delay between each)
- [ ] **Skills/Tags:** Cascade in with a stagger — each tag appearing 50ms after the previous. Creates a "typing" or "building" feel.
- [ ] **Project cards (listing page):** Fade in + slight upward translate as they enter the viewport.
- [ ] **Ersta case study images:** Reveal one by one as you scroll through the sections. Each image fading in when it hits ~80% viewport.
- [ ] **Timeline on About page:** Each entry slides in from the side or fades as you scroll to it.
- [ ] **Implementation:** Use Intersection Observer API (lightweight, no library needed) or Framer Motion's `useInView` if already using React islands. Add a utility CSS class like `.reveal` that triggers on intersection.
- [ ] **Respect `prefers-reduced-motion`:** All animations should be disabled for users who have reduced motion enabled in their OS settings.

#### 7.3 Theme Toggle — Make It a Feature

The dark/light switch should feel designed, not functional:

- [ ] **Smooth 200ms transition** on all themed properties (background, text, borders, shadows) — verify this is working globally, not just on some elements.
- [ ] **Toggle icon animation:** Sun → Moon morph or rotate transition, not just a static icon swap.
- [ ] **Accent color shift should be perceptible** — electric blue (#3b82f6) in dark → steel blue (#2563a0) in light. If the change is too subtle, consider making it slightly more pronounced.
- [ ] **Card treatment should visibly change:** Dark mode glow → Light mode shadow lift. If both modes look the same except for color inversion, it won't feel like two designed experiences.
- [ ] **Button shape shift (if feasible):** Pill (dark) → rectangular (light) as spec'd in §6.4. This is a subtle but powerful signal that the two modes are intentionally different.
- [ ] **Test the toggle rapidly** — ensure no flickering, no flash of wrong theme on page load (use an inline `<script>` in `<head>` to set the class before first paint).

#### 7.4 Project Case Study Pages — Interactive Image Presentation

Static image stacks are fine, but interactive presentation creates engagement:

- [ ] **Ersta images:** Consider a horizontal scrolling gallery or a masonry/grid layout for the Revit screenshots, construction photos, and review boards instead of a vertical stack. Horizontal scroll feels more like a portfolio presentation.
- [ ] **Image comparison slider (if feasible):** For Ersta, a before/after slider showing the original IFC geometry vs the finished Revit model would be extremely compelling. Libraries: `react-compare-slider` or CSS-only implementations exist.
- [ ] **Revit→GeoPackage plugin:** Present the two screenshots (Export Dialog → Export Preview) as a stepped flow — click or scroll to advance from step 1 to step 2, with a subtle transition between them.
- [ ] **Image hover state:** On desktop, a subtle scale (1.0 → 1.02) + brightness shift on hover before opening lightbox. Signals interactivity.
- [ ] **Lightbox improvements:** Swipe navigation between images in a project, pinch-to-zoom on mobile, keyboard arrow navigation on desktop.

#### 7.5 Navigation & Micro-Interactions

Small details that signal quality:

- [ ] **Header:** Backdrop blur + slight transparency shift on scroll (if not already implemented). The nav should feel like it's floating above the content.
- [ ] **Active page indicator:** Smooth underline slide animation when switching between nav items (CSS `transition` on a pseudo-element).
- [ ] **Link hover effects:** Accent-colored underline that slides in from left on hover, rather than instant underline.
- [ ] **CTA buttons:** Subtle pulse or glow animation on the primary CTA ("Get in touch") to draw attention without being obnoxious. Only on first appearance, not continuously.
- [ ] **"Back to Projects" link:** Add a slight arrow animation on hover (arrow moves left a few pixels).
- [ ] **Page transitions:** If Astro supports it (View Transitions API), add smooth cross-fade between pages. This single change makes the entire site feel like an app rather than a collection of pages.

#### 7.6 Typography & Spacing Polish

- [ ] **Heading entrance:** Consider a subtle clip/reveal animation on main page headings (`<h1>`) — text slides up from behind a mask. Elegant and architectural.
- [ ] **Pull quotes or highlight text:** In the Ersta case study, the line "It's one thing to model a building; it's another to ensure it can actually be constructed" deserves visual emphasis — larger font, different color, or set apart as a pull quote.
- [ ] **Section spacing review:** Ensure generous whitespace between sections (especially in light "Blueprint" mode where spacing is key to the architectural feel).

#### 7.7 3D Tiles / Cesium Integration (Coming Next Week)

Daniel is preparing 3D Tiles models of his work to upload to Cesium Ion. Once ready, this becomes the ultimate wow factor:

- [ ] **Embed CesiumJS viewer** on the Shinjuku case study page showing the PLATEAU city model with Daniel's indoor navigation layer visible. The full Revit model (`shinjuku-revit-full-model.png`) serves as the static preview — clicking "Explore in 3D" loads the interactive Cesium viewer where visitors can orbit through the entire station complex.
- [ ] **Presentation flow on Shinjuku page:** Static Revit model screenshot (what Daniel built) → "Explore in 3D" button → CesiumJS viewer (interactive) → PLATEAU navigation screenshots (what it becomes in production). This is the complete story arc from BIM authoring to digital twin deployment.. The full Revit model (`shinjuku-revit-full-model.png` shows the scope) is the primary candidate for 3D Tiles conversion — platforms, concourses, walkways, and surrounding buildings spanning the entire Shinjuku station area.
- [ ] **Interactive exploration:** Visitors can orbit, zoom, and fly through the 3D model directly on the project page
- [ ] **Consider a dedicated "3D Viewer" page or section** that showcases multiple models (Shinjuku station, Ersta, or other BIM work)
- [ ] **Technical approach:** CesiumJS can be loaded as a React island in Astro. The Cesium Ion token handles auth. 3D Tiles stream efficiently so the viewer doesn't require downloading the full model.
- [ ] **Mobile consideration:** CesiumJS works on mobile but can be GPU-heavy. Consider a static screenshot fallback with a "Load 3D Model" button rather than auto-loading on mobile.
- [ ] **This is the single biggest differentiator** from every other BIM portfolio on the internet. Nobody else is letting visitors fly through their actual project data in the browser.

**Deliverable:** A site that makes people pause, explore, and remember. Motion-rich but tasteful, interactive but performant, and visually distinct in both themes.

---

## 10. Future Enhancements (Post-Launch)

- **3D Tiles / Cesium expansion** — Once the initial Cesium embeds are live (Phase 7.7), expand to multiple models: Ersta exterior, other station models, and potentially a full Shinjuku area flythrough combining PLATEAU data with indoor layers. Consider a dedicated `/3d` or `/viewer` page as a standalone showcase.
- **Project filtering** — As the portfolio grows, add category/tech-based filtering
- **Obsidian integration showcase** — As Daniel develops his Obsidian + Claude Code workflow for BIM project management (calendar, tasks, documentation), this could become a dedicated project page or interactive demo showing how agentic AI can streamline BIM management processes
- **Auto-generated resume** — Build PDF from structured YAML/JSON data so updates propagate to both site and downloadable PDF
- **CMS integration** — If blog frequency increases, consider a headless CMS (Sanity, Contentlayer) for easier editing
- **Blender render gallery** — Dedicated section for architectural visualization work

---

## 11. Repository Structure

```
site/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── vercel.json
├── public/
│   ├── fonts/
│   ├── images/
│   │   ├── projects/
│   │   │   ├── shinjuku-nav-1.png
│   │   │   └── shinjuku-nav-2.png
│   │   └── ...
│   ├── resume-en.pdf
│   └── resume-ja.pdf
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── LanguageToggle.tsx       ← React island
│   │   ├── ThemeToggle.tsx          ← React island (sun/moon, persists to localStorage)
│   │   ├── ContactForm.tsx          ← React island
│   │   ├── ImageLightbox.tsx        ← React island
│   │   ├── CesiumViewer.tsx         ← React island (3D Tiles viewer, lazy-loaded)
│   │   ├── ProjectCard.astro
│   │   ├── BlogPostCard.astro
│   │   ├── SkillTag.astro
│   │   └── ...
│   ├── content/
│   │   ├── config.ts                ← Content collection schemas
│   │   ├── projects/
│   │   │   ├── en/
│   │   │   └── ja/
│   │   └── blog/
│   │       ├── en/
│   │       └── ja/
│   ├── i18n/
│   │   ├── en.json
│   │   ├── ja.json
│   │   └── utils.ts                 ← Translation helper functions
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ProjectLayout.astro
│   │   └── BlogLayout.astro
│   ├── pages/
│   │   ├── en/
│   │   │   ├── index.astro
│   │   │   ├── about.astro
│   │   │   ├── contact.astro
│   │   │   ├── projects/
│   │   │   │   └── [slug].astro
│   │   │   └── blog/
│   │   │       ├── index.astro
│   │   │       └── [slug].astro
│   │   └── ja/
│   │       └── ... (mirrors /en/)
│   ├── styles/
│   │   └── global.css               ← CSS custom properties for both themes
│   └── utils/
│       ├── theme.ts                 ← Theme detection, toggle, persistence logic
│       └── ...
└── api/
    └── contact.ts                   ← Vercel serverless function
```

---

## 12. Open Questions

- [x] ~~**Domain registration**~~ — `malmqvist.dev` purchased via Namecheap ✓
- [x] ~~**Email setup**~~ — `daniel@malmqvist.dev` via Cloudflare Email Routing → Gmail forwarding ✓
- [ ] **Shapefile → IMDF tool details** — What language/stack? Open source or internal?
- [ ] **Revit → GeoPackage plugin details** — C#/Revit API? Stage of development?
- [ ] **Other Tengbom projects** — You mentioned schools as well. Any worth mentioning on the timeline, or keep it to Ersta + Arlanda?
- [ ] **Additional Blender renders** — Available for the site now?
- [ ] **Existing branding** — Any logo, monogram, or color preferences to carry over?

---

## 13. Infrastructure Setup Checklist

### DNS & Email (do first)

- [ ] Transfer DNS management from Namecheap to Cloudflare (add site in Cloudflare dashboard, update nameservers at Namecheap)
- [ ] Set up Cloudflare Email Routing: add `daniel@malmqvist.dev` → forward to Gmail
- [ ] Configure Gmail "Send mail as" for `daniel@malmqvist.dev` (Settings → Accounts → Add another email address) so replies go out from the custom domain
- [ ] Verify email works both directions (receive + send)

### Hosting & Deployment

- [ ] Create GitHub repo for the site
- [ ] Connect repo to Vercel
- [ ] Add `malmqvist.dev` as custom domain in Vercel project settings
- [ ] Add Vercel's DNS records in Cloudflare (A record / CNAME as Vercel specifies)
- [ ] Verify SSL certificate is issued (Cloudflare + Vercel both handle this automatically)
- [ ] Confirm preview deploys work on PRs
