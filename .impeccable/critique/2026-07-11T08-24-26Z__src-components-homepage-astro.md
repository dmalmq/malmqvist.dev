---
target: home
total_score: 21
p0_count: 1
p1_count: 2
timestamp: 2026-07-11T08-24-26Z
slug: src-components-homepage-astro
---
Method: dual-agent (A: DesignReview · B: DetectorEvidence)

# Critique: Home (`src/components/HomePage.astro`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | `Reveal.astro` keeps sections at `opacity: 0` until 80% intersection — mid-page folds render blank |
| 2 | Match System / Real World | 3 | AEC vocabulary lands; "What I Do" / "Let's build something together" is generic portfolio-speak |
| 3 | User Control and Freedom | 3 | No traps; content gated by reveal thresholds; no skip-to-content |
| 4 | Consistency and Standards | 2 | Same eyebrow on 6 sections; `01–03` on unrelated blocks; JA page leaks English "Contact" and "Built with Astro" |
| 5 | Error Prevention | 2 | Mostly static links; blank-until-reveal is an avoidable "is it broken?" state |
| 6 | Recognition Rather Than Recall | 3 | Labeled nav everywhere; mobile header is seal-only ("DM") below `sm` — identity relies on recall |
| 7 | Flexibility and Efficiency | 2 | 3 languages + theme; no résumé/demo deep links on home; reveals slow expert scanners |
| 8 | Aesthetic and Minimalist Design | 2 | Calm materials undermined by repeated kickers, duplicate "WHAT I DO"/"What I Do", identical card grid |
| 9 | Error Recovery | 1 | No recovery patterns on this surface |
| 10 | Help and Documentation | 1 | No contextual help, no résumé entry point despite PRODUCT proof stack |
| **Total** | | **21/40** | **Acceptable — solid materials, significant UX debt** |

## Anti-Patterns Verdict

**Does this look AI-generated? Yes — within one scroll**, despite genuinely good materials (Falu–Hanko red, EB Garamond, real BIM imagery).

**LLM assessment (A):** The section *grammar* is the tell, not the palette: six `.eyebrow` nodes (IBM Plex Mono 12px, 0.22em tracking, accent red) — `STOCKHOLM → TOKYO`, `Architecture × Code`, `What I Do`, `PROJECTS`, `About`, `Contact`; decorative `01/02/03` numbering on both Triptych and SelectedWork; Triptych renders the same string as eyebrow AND h2 ("WHAT I DO" over "What I Do"); a centered generic CTA band closes the page. Each individually violates DESIGN.md's own Annotation Rule and the skill's absolute bans. Credit: no gradient text, no side-stripes, no hero-metric template, and the Shinjuku model imagery is the strongest anti-slop asset on the page.

**Deterministic scan (B):** CLI scan of home sources: **1 finding** — `design-system-font-size` at `BottomNav.astro:42` (`0.6875rem` label off the DESIGN.md type ramp; true positive, intentional compact chrome that should be documented or normalized). Live in-page detector: 5 anti-patterns — `hero-eyebrow-chip` (agrees with A), `line-length` ×2 (~85ch body paragraphs, soft), `cream-palette` (**false positive vs. brand** — Drawing Ground is the named identity), `gradient-text` ×2 and `bounce-easing` on `<body>` (**noisy/false** — token presence from tw-animate-css, no visible gradient text; A's source scan found zero `background-clip: text` uses).

**Agreement:** A and B independently converged on the eyebrow scaffolding. **Detector-only catch:** the 11px bottom-nav label. **LLM-only catches:** reveal-gating, belief-ladder inversion, i18n leaks — all invisible to the detector.

## Overall Impression

A well-built studio material system wearing a SaaS template's skeleton. The paint (palette, type, seal, project frames) is distinctive; the composition (kicker–heading–card-grid–CTA-band) is the exact grammar the design system bans in its own Do/Don't list. Single biggest opportunity: make the Shinjuku/Cesium evidence the opening argument and delete the scaffolding around it.

## What's Working

1. **Project media as center of gravity** — hero `ResponsivePicture` (Shinjuku Revit/Unity, red GOAL pin) and `SelectedWork` covers show deployable spatial work, fulfilling "project-led, not personality-led."
2. **Material system** — Falu–Hanko `#9C3B26`/Kiln `#DE7A57`, DM seal, 1px construction lines, serif/grotesk pairing, and correctly paired dark tokens feel studio-specific, not template.
3. **Mobile architecture** — bottom tab bar (56px cells, icon+label, no hamburger, safe-area padding) serves one-handed navigation better than most portfolios.

## Priority Issues

- **[P0] Reveal gates content off-screen.** `Reveal.astro` defaults `.reveal { opacity: 0; translateY(20px) }` and only shows at `intersectionRatio ≥ 0.8`. Slow devices, background tabs, and mid-scroll bounces see blank cream/night panels. **Why:** a hiring leader who sees a broken page never sees the work. **Fix:** default fully visible; animate transform only as enhancement (or `@starting-style`); content must be complete without JS/motion. **Command:** `/impeccable polish` (or `/impeccable animate` to redo the motion system properly).
- **[P1] Belief ladder inverted — claims before evidence.** `HomePage.astro` order is Hero → Triptych claim cards → SelectedWork → About → CTA. PRODUCT.md demands practice → systems → impact shown, not described. **Fix:** promote SelectedWork above the Triptych; recast capabilities as annotations on projects; demote or delete the 3-card grid. **Command:** `/impeccable layout`.
- **[P1] Eyebrow + numbered scaffolding on every section.** Six mono kickers, decorative `01–03`, duplicate kicker/heading in Triptych. Burns accent red on decoration (Evidence Marker Rule) and is the primary AI-slop fingerprint. **Fix:** keep at most one deliberate kicker; remove section eyebrows and non-sequential numbering. **Command:** `/impeccable quieter` (scaffolding) + `/impeccable typeset` (rebuild section-heading hierarchy).
- **[P2] Copy misses the conversion contract.** Hero is a job title; CTAs are "Get in touch"/"Let's build something together" — not "discuss a specialized AEC role," and the 10-second line "architectural intent, deployable data" appears nowhere. **Fix:** rewrite hero + CtaBand toward PRODUCT positioning and role-shaped CTA. **Command:** `/impeccable clarify`.
- **[P2] i18n and system-ramp holes.** `CtaBand.astro` hardcodes English "Contact"; footer "Built with Astro" untranslated on /ja/; JA "選考作品" reads as "screening works"; `BottomNav.astro:42` 11px label off the documented type ramp. **Fix:** route strings through `t(...)`, correct the JA title, add a documented tab-label step (or use 0.75rem). **Command:** `/impeccable harden`.

## Persona Red Flags

**Jordan (first-timer):** scrolls into opacity-0 blank panels → assumes broken site; "WHAT I DO"/"What I Do" duplication reads as filler; mobile header is seal-only so whose-site-is-this depends on the footer; no résumé affordance anywhere on home.

**Casey (mobile, one-handed):** primary CTA sits mid/upper hero, not in the thumb zone (the bottom bar is site nav, not contact); ~6,269px page height at 390×844 is a long commitment after an interruption; 5 bottom-bar items is at the working-memory edge.

**Riley (stress tester):** dark theme holds up (tokens swap cleanly); JA locale leaks English in CtaBand eyebrow and footer; reveal threshold is a deterministic "appears broken" bug under automation and slow connections.

**AEC hiring leader (90 seconds):** cannot answer "what was Daniel's role and outcome on Shinjuku?" without leaving the page — project cards carry tags but no role line; no résumé PDF entry; end CTA isn't role-shaped. Fails PRODUCT Design Principle 4 (fast expert evaluation).

## Minor Observations

- Two red mono elements in the hero fold alone (vertical `STOCKHOLM → TOKYO` + `Architecture × Code`).
- Uneven tag density in SelectedWork (6–7 badges vs 4) creates ragged card rhythm; light-mode badge contrast ≈4.73:1 — barely AA.
- Global `* { transition: … 200ms }` is a broad paint tax.
- `latestPosts`/`featuredTools` props on HomePage are accepted and discarded — dead API surface.
- Home route shows no active state in primary nav (acceptable, but interior pages do more).
- Body paragraphs run ~85ch in places (aim ≤75ch).

## Questions to Consider

1. If the Shinjuku model is the argument, why does the first full section after the hero still look like a SaaS feature grid?
2. What would this page be if the only mono type allowed were coordinate callouts on drawings — never section labels?
3. Can a 90-second AEC lead answer "role, decisions, outcome" from the home page alone? If not, it's a poster, not a hiring tool.
