---
name: malmqvist.dev
description: Architectural intent carried into deployable data through project-led, cinematic evidence.
colors:
  accent-falu-hanko: "#9C3B26"
  accent-kiln: "#DE7A57"
  drawing-ground: "#F5F1E8"
  studio-surface: "#FBF8F1"
  soft-ground: "#ECE5D6"
  charcoal-ink: "#221F1A"
  pencil-grey: "#6B6355"
  construction-line: "#D8D0BF"
  night-ground: "#181511"
  night-surface: "#1F1B15"
  night-soft: "#26211A"
  light-ink: "#ECE6D9"
  night-pencil: "#A79D8B"
  night-line: "#373127"
  action-ink: "#FFFFFF"
typography:
  display:
    fontFamily: "EB Garamond, Shippori Mincho, serif"
    fontSize: "clamp(4.5rem, 10vw, 7rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "EB Garamond, Shippori Mincho, serif"
    fontSize: "clamp(3rem, 7vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  title:
    fontFamily: "EB Garamond, Shippori Mincho, serif"
    fontSize: "clamp(2rem, 4vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, Noto Sans JP, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.65
  action:
    fontFamily: "Schibsted Grotesk, Noto Sans JP, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.22em"
  tab:
    fontFamily: "Schibsted Grotesk, Noto Sans JP, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  control: "4px"
  card: "4px"
  feature: "8px"
  seal: "2px"
  pill: "999px"
spacing:
  "1": "8px"
  "2": "16px"
  "3": "24px"
  "4": "32px"
  "5": "48px"
  "6": "64px"
  "7": "96px"
  "8": "128px"
  "9": "192px"
  "10": "256px"
components:
  button-primary:
    backgroundColor: "{colors.accent-falu-hanko}"
    textColor: "{colors.action-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.drawing-ground}"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.studio-surface}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  field:
    backgroundColor: "{colors.drawing-ground}"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "4px 12px"
  badge:
    backgroundColor: "{colors.soft-ground}"
    textColor: "{colors.pencil-grey}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
  seal:
    backgroundColor: "{colors.drawing-ground}"
    textColor: "{colors.accent-falu-hanko}"
    rounded: "{rounded.seal}"
    height: "40px"
    width: "40px"
---

# Design System: malmqvist.dev

## Overview

**Creative North Star: "The Cross-Section in Motion"**

The interface behaves like a precise architectural cross-section that becomes legible layer by layer. Its ground is calm and materially warm; its typography, rules, media frames, and annotations establish technical credibility. Large project images and interactive models then provide the dramatic reveal. The composition is project-led, not personality-led: direct work is the visual center of gravity.

Cinematic ambition belongs in transitions between evidence, changes of scale, and the passage from authored model to operational system. It must never obscure Daniel’s role, decisions, tools, or outcomes. The system explicitly rejects the interchangeable structure and styling of a generic SaaS landing page.

**Key Characteristics:**
- Architectural linework and low-chroma working surfaces.
- Falu–Hanko red used as a decisive action and annotation color.
- Serif display type against direct, highly readable grotesk body copy.
- Project imagery, model views, and technical interfaces at meaningful scale.
- Controlled reveals with complete reduced-motion alternatives.
- A 1440px maximum canvas, fluid gutters, 68ch reading width, and mobile-first composition.

## Colors

The Falu–Hanko studio palette combines Swedish material memory, Japanese seal-like emphasis, and neutral architectural working surfaces without turning either culture into decoration.

### Primary
- **Falu–Hanko Red:** Primary action, active state, focus cue, seal, and high-value annotation in the light theme.
- **Kiln Red:** The brighter dark-theme counterpart; it preserves action contrast against the night ground.

### Neutral
- **Drawing Ground:** Light-theme page canvas.
- **Studio Surface:** Cards, framed media, and elevated content in the light theme.
- **Soft Ground:** Quiet bands, tag fills, and restrained hover surfaces.
- **Charcoal Ink:** Primary light-theme text and heading color.
- **Pencil Grey:** Secondary copy, metadata, and supporting labels.
- **Construction Line:** Dividers, card edges, and field strokes.
- **Night Ground:** Dark-theme page canvas.
- **Night Surface:** Dark-theme cards and framed media.
- **Night Soft:** Quiet dark-theme bands and controls.
- **Light Ink:** Primary dark-theme text and headings.
- **Night Pencil:** Secondary copy in the dark theme.
- **Night Line:** Dark-theme dividers and strokes.
- **Action Ink:** Text on filled red actions only.

### Named Rules

**The Evidence Marker Rule.** Red marks an action, current state, authored seal, or evidence annotation. It never becomes ambient decoration or a generic section background.

**The Paired Theme Rule.** Light and dark themes preserve the same hierarchy and content. Theme changes alter material contrast, not information priority.

## Typography

**Display Font:** EB Garamond with Shippori Mincho for Japanese display text.
**Body Font:** Schibsted Grotesk with Noto Sans JP for Japanese body text.
**Label/Mono Font:** IBM Plex Mono for technical annotations only.

**Character:** The serif face carries spatial confidence and human craft; the grotesk keeps technical claims direct and contemporary. Japanese fallbacks preserve the same contrast between expressive headings and practical body copy rather than forcing one Latin-first voice across scripts.

### Hierarchy
- **Display** (500, fluid 72–112px, 1.08): Exceptional name or page-scale statements; never ordinary section copy.
- **Headline** (500, fluid 48–72px, 1.08): Hero and major page claims.
- **Title** (500, fluid 32–44px, 1.08): Section headings and major case-study transitions.
- **Body** (400, fluid 16–18px, 1.65): Narrative and explanatory copy, capped at 68ch.
- **Action** (700, 14px, 1.43): Buttons and high-confidence navigation labels.
- **Label** (400, 12px, 0.22em tracking): Short technical annotations, locations, or metadata; uppercase only when the label is genuinely schematic.
- **Tab** (700, 11px, 1.0): Bottom tab-bar labels only — compact mobile chrome sized to fit six-character Japanese labels; never body or section text.

### Named Rules

**The Two-Voice Rule.** Serif establishes the architectural argument; grotesk explains and proves it. Do not swap their roles casually.

**The Annotation Rule.** Monospace labels are sparse technical notation, not repeated eyebrows above every section.

## Elevation

The system is flat and structural. Depth comes from tonal changes, one-pixel construction lines, media framing, and spacing before it comes from shadow. Light-theme cards may use a minimal ambient shadow; dark-theme surfaces remain shadowless because tonal separation already provides depth. Overlays and dialogs may exceed this baseline only to establish an actual interaction layer.

### Shadow Vocabulary
- **Paper Lift** (`0 1px 3px rgba(0, 0, 0, 0.06)`): Light-theme cards at rest.
- **Field Edge** (`0 1px 2px rgba(0, 0, 0, 0.05)`): Inputs and text areas where a subtle edge improves affordance.

### Named Rules

**The Flat-by-Default Rule.** If a shadow becomes part of the composition rather than an affordance, remove it and restore hierarchy with tone, border, or spacing.

## Components

Components are precise and tactile: crisp 4–8px corners, restrained linework, clear state changes, and small physical movement. Pill geometry is reserved for navigation clusters, language/theme toggles, and true compact controls.

### Buttons
- **Shape:** Crisp control corners (4px); minimum 40–44px touch height in primary journeys.
- **Primary:** Falu–Hanko Red with Action Ink; standard hero padding is 12px × 24px.
- **Hover / Focus:** A slight upward movement or brightness shift; focus uses the accent border plus a three-pixel mixed-color ring. Active state returns to the baseline and may compress subtly.
- **Secondary / Ghost:** Transparent surface with a Construction Line border and Charcoal Ink; hover shifts the line and text toward the accent or Soft Ground.

### Chips
- **Style:** Soft Ground fill, Pencil Grey text, compact 4px corners, and optional Construction Line border.
- **State:** Interactive chips use the same accent focus ring as buttons. Tags remain informational and do not imitate primary actions.

### Cards / Containers
- **Corner Style:** Cards use 4px corners; featured media frames use 8px.
- **Background:** Studio Surface in light mode and Night Surface in dark mode.
- **Shadow Strategy:** Paper Lift in light mode; no resting dark-mode shadow.
- **Border:** One-pixel Construction Line or Night Line.
- **Internal Padding:** 24px by default; 32px only for major editorial modules.

### Inputs / Fields
- **Style:** Transparent light-theme field or Night Soft dark-theme field, one-pixel line, 4px corners, 36px compact control height with larger text areas as content requires.
- **Focus:** Accent border and a three-pixel translucent accent ring.
- **Error / Disabled:** Errors use a clear red border and ring plus written guidance; disabled controls retain legible text and expose their state without relying on opacity alone.

### Navigation

The sticky header begins transparent and gains a Construction Line edge plus a lightly mixed background and 12px backdrop blur after scroll. Desktop (≥1024px) links sit in a single compact pill cluster; the active item receives a two-pixel accent marker. The DM seal and Tokyo / Stockholm origin line remain the persistent identity. Below 1024px (phone and iPad portrait), navigation is a fixed, safe-area-aware bottom tab bar — four icon-and-label destinations plus a More sheet holding language, theme, and profile controls — styled with the same mixed background, blur, and Construction Line edge; the active destination reads in accent red. There is no hamburger menu.

### Project Media Frame

The signature frame presents screenshots, Revit models, diagrams, and interactive viewers as work product. It uses a one-pixel line, 8px corners, responsive image sources, and a truthful caption or interaction label. Large spatial models must remain inspectable on small screens rather than being reduced to illegible thumbnails.

## Do's and Don'ts

### Do:
- **Do** lead with direct project imagery, model views, tool interfaces, and interactive technical proof.
- **Do** clarify Daniel’s exact role, decisions, tools, and outcomes beside the relevant evidence.
- **Do** preserve the practice → systems → impact → fit sequence across page-level narratives.
- **Do** use Falu–Hanko Red for decisive actions and annotations, never as decorative noise.
- **Do** use purposeful 600ms reveal motion only when the content remains present and complete without it.
- **Do** provide keyboard access, visible focus, WCAG 2.2 AA contrast, and reduced-motion alternatives.

### Don't:
- **Don't** resemble a generic SaaS landing page: no interchangeable feature grids, pill-heavy styling, startup framing, or decorative product-marketing effects.
- **Don't** turn every section into the same icon-heading-copy card.
- **Don't** repeat tiny uppercase tracked eyebrows above every section; monospace is technical notation, not a template signal.
- **Don't** use red as an ambient wash, gradient-text effect, or ornamental glow.
- **Don't** hide evidence behind autoplay, mandatory motion, hover-only behavior, or an unloaded interactive viewer.
- **Don't** compress wide BIM imagery until its spatial detail becomes unreadable on mobile.
