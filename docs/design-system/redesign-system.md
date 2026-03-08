# Redesign System

## Goal

The redesign should extend the direction established in `Refined 1A - Editorial Project Card`: editorial, architectural, quiet, and project-forward. The system should make the site feel more deliberate without turning it into a generic SaaS component library.

## Visual Source Of Truth

Figma should be the canonical design system file. That is the better long-term home for this redesign because it supports variables, components, auto layout, and a more durable handoff into code.

Use this file structure:

1. `00 Tokens`
2. `01 Core UI`
3. `02 Section Patterns`
4. `03 Page Flows`

Paper can stay as an exploration tool, but Figma should hold the approved system and the page-level redesigns.

## Foundations

### Color Tokens

| Token | Value | Role |
| --- | --- | --- |
| `canvas / light` | `#faf4ed` | Rose Pine Dawn page background |
| `canvas / dark` | `#191724` | Rose Pine base background |
| `surface / light` | `#fffaf3` | Elevated cards and overlays |
| `surface / dark` | `#1f1d2e` | Elevated cards and overlays |
| `surface-soft / light` | `#f2e9e1` | Quiet sections and rows |
| `surface-soft / dark` | `#26233a` | Quiet sections and rows |
| `text / light` | `#575279` | Primary text |
| `text / dark` | `#e0def4` | Primary text |
| `text-muted / light` | `#797593` | Secondary text |
| `text-muted / dark` | `#908caa` | Secondary text |
| `accent / light` | `#286983` | Pine accent |
| `accent / dark` | `#31748f` | Pine accent |
| `focus / light` | `#907aa9` | Iris ring and focus state |
| `focus / dark` | `#c4a7e7` | Iris ring and focus state |
| `line / light` | `#cecacd` | Borders and dividers |
| `line / dark` | `#524f67` | Borders and dividers |

### Type Scale

The system should stay on a single sans family until a deliberate font pairing is chosen. The current hero direction already proves the layout works with restrained sans typography.

| Style | Desktop | Mobile | Use |
| --- | --- | --- | --- |
| `display` | `112 / 0.92` | `68 / 0.94` | Homepage name lockup |
| `hero-title` | `72 / 0.96` | `44 / 1.0` | Large section titles |
| `h2` | `44 / 1.05` | `32 / 1.08` | Section headings |
| `h3` | `28 / 1.12` | `22 / 1.18` | Card titles |
| `body-lg` | `22 / 1.45` | `18 / 1.5` | Short introductions |
| `body` | `18 / 1.6` | `16 / 1.6` | Standard paragraph text |
| `meta` | `13 / 1.2` | `12 / 1.2` | Eyebrows, labels, timestamps |

### Spacing and Shape

| Token | Value | Use |
| --- | --- | --- |
| `space-2` | `8px` | Tight icon gaps |
| `space-4` | `16px` | Tag and label spacing |
| `space-6` | `24px` | Default card padding on mobile |
| `space-8` | `32px` | Default desktop card padding |
| `space-12` | `48px` | Split layouts and internal sections |
| `space-16` | `64px` | Section starts on mobile |
| `space-24` | `96px` | Section starts on desktop |
| `radius-sm` | `10px` | Inputs, badges |
| `radius-md` | `14px` | Cards and panels |
| `radius-lg` | `24px` | Feature modules |
| `radius-pill` | `999px` | Buttons, toggles |

### Grid

- Desktop: `12` columns, `max-width 1440px`, outer gutters `48-64px`
- Tablet: `8` columns, outer gutters `32px`
- Mobile: `4` columns, outer gutters `20px`
- Reading width: `60-68ch`
- Hero split ratio: start from `7 / 5`, not `8 / 4`

## Core UI

These are the first reusable pieces to standardize in Figma before page-by-page redesign work:

- `button / primary`: dark fill, pill radius, white text
- `button / secondary`: text link or bordered quiet button
- `badge / eyebrow`: uppercase, tracked, low-height labels
- `nav item`: understated default with crisp active rule
- `card / shell`: thin border, large radius, low-noise hover
- `field / text`: generous height, subtle border, quiet focus ring
- `social button`: compact icon button in the same border system
- `project frame`: large visual panel with caption strip

## Section Patterns

The redesign should be built from a small set of repeatable patterns:

- `hero / editorial split`: name, role line, short description, CTA, featured project
- `section / heading`: eyebrow, heading, optional supporting copy
- `cards / expertise triptych`: three capability blocks with equal rhythm
- `feature / project module`: large case-study card with image and short summary
- `content / editorial split`: left narrative, right supporting facts or media
- `list / article row`: date, tag, title, description in a high-signal row
- `band / CTA`: quiet full-width invitation with one strong action

## Homepage Rhythm

The redesigned English and Japanese homepages should follow this order:

1. Editorial hero with featured project card
2. Expertise triptych
3. Selected work feature
4. Short about split
5. Writing row
6. Contact CTA band

Each section should feel like part of one system, not a sequence of unrelated blocks. The hero sets the tone, and the later sections should become progressively calmer and denser.

## Implementation Notes

- Keep layout-heavy sections in Astro.
- Use React and shadcn for shared primitives, controls, dialogs, sheets, and forms.
- Preserve the bilingual route structure and keep pattern parity between `/en` and `/ja`.
- Treat Figma as the visual source of truth and `src/styles/global.css` as the implementation token layer.
