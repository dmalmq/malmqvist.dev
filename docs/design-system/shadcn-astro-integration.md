# shadcn + Astro Plan

## What Was Wired

The repo now has the minimum foundation needed to start using the shadcn CLI without forcing a redesign immediately:

- `components.json`
- `@/*` path alias in `tsconfig.json`
- `src/lib/utils.ts`
- shadcn support packages in `package.json`
- semantic CSS variables bridged into `src/styles/global.css`

## Why This Shape Fits This Repo

This project is Astro-first, not React-first. That means shadcn should be used for primitives and interactive islands, while page composition remains in `.astro` files.

Use shadcn for:

- buttons
- badges
- inputs
- textareas
- sheet or drawer navigation
- dialog
- separator
- tabs
- command palette if one is added later

Keep Astro for:

- page shells
- large content sections
- project and blog listing layouts
- bilingual page composition

## First Components To Add

Once the visual system is approved in Figma, add these components first:

1. `button`
2. `badge`
3. `input`
4. `textarea`
5. `sheet`
6. `dialog`
7. `separator`
8. `card`

That order gives the most immediate value for the navigation, contact form, CTA blocks, and shared shells.

## Migration Map

Map the current codebase in this order:

- `src/components/ui/Button.astro`
  Replace with a thin Astro wrapper around a shadcn `button.tsx` only after the final button styles are approved.
- `src/components/ui/Card.astro`
  Replace after the core card shell and project module are stabilized.
- `src/components/Header.astro`
  Migrate the mobile nav to a shadcn `sheet` instead of the current dropdown.
- `src/components/ContactForm.tsx`
  Move inputs and textarea to shadcn primitives first.
- `src/components/ImageLightbox.tsx`
  Evaluate against shadcn `dialog` once the gallery redesign starts.

## Styling Rules

- Do not ship default shadcn styling unchanged.
- Keep the Rose Pine token layer as the source of truth.
- Use shadcn component structure and accessibility, then restyle through the token layer.
- Prefer low-noise borders, large whitespace, and restrained hover states over glossy effects.

## Rollout Sequence

1. Build the Figma file with token, core UI, section pattern, and page flow pages.
2. Redesign the homepage against that system.
3. Replace shared primitives and the mobile nav.
4. Redesign About, Projects, Blog, and Contact with the same patterns.
5. Revisit dark mode only after the light mode redesign is stable.

## References

The current shadcn setup follows the official manual installation guidance for adding dependencies, configuring `components.json`, and setting up the `cn` helper. For this Astro repo, the important adaptation is that the alias resolves to `src`, not the project root.
