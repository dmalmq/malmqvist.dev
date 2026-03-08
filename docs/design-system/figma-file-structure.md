# Figma File Structure

## Pages

Use one Figma file for the redesign with these pages:

1. `00 Tokens`
2. `01 Core UI`
3. `02 Section Patterns`
4. `03 Page Flows`
5. `04 Archive`

## `00 Tokens`

Create variables for:

- color
- spacing
- radius
- stroke
- type size
- line height

Set up two color modes:

- `rose-pine-dawn`
- `rose-pine`

Use [rose-pine-figma-tokens.md](/home/apollo/malmqvist.dev/docs/design-system/rose-pine-figma-tokens.md) as the exact variable list and frame layout for this page.

## `01 Core UI`

Create component sets for:

- button
- nav item
- badge
- card shell
- input
- textarea
- social button
- language toggle shell
- theme toggle shell

Use auto layout everywhere. Avoid detached one-off frames unless they are exploratory.

## `02 Section Patterns`

Create reusable section frames for:

- editorial hero
- section heading
- expertise triptych
- featured project
- project card row
- article row
- about split
- contact CTA band

Each pattern should exist in desktop and mobile form before page composition starts.

## `03 Page Flows`

Assemble full pages from the approved section patterns:

- Home
- About
- Projects index
- Project detail
- Blog index
- Contact

This page should prove rhythm and consistency, not invent new primitives.

## `04 Archive`

Move discarded explorations here so the working pages stay clean.

## Rules

- Figma variables define the visual system.
- `src/styles/global.css` mirrors those variables in code.
- shadcn provides behavior and accessibility, not the brand styling.
- The remote Figma MCP flow is link-based, so use file URLs or selection URLs when asking Codex to inspect or implement from Figma.
