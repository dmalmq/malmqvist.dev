---
target: home
total_score: 24
p0_count: 1
p1_count: 2
timestamp: 2026-07-11T09-50-24Z
slug: src-components-homepage-astro
---
Method: dual-agent (A: DesignReview2 · B: DetectorEvidence2)

# Critique: Home (`src/components/HomePage.astro`) — run 2

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Toggle states, scrolled header, focus outlines; home never marks a nav location |
| 2 | Match System / Real World | 2 | Hero/CTA copy misses "architectural intent, deployable data" and role-shaped CTA; JA 選考作品 wrong register |
| 3 | User Control and Freedom | 3 | Sticky header + bottom tabs + footer nav; no traps |
| 4 | Consistency and Standards | 2 | Cesium lead card reuses the Shinjuku cover; IMDF ships a placeholder SVG |
| 5 | Error Prevention | 2 | Duplicate/wrong covers create preventable misreading of the work |
| 6 | Recognition Rather Than Recall | 3 | Role annotations + labeled nav; outcomes still require leaving the page |
| 7 | Flexibility and Efficiency | 2 | 3 locales + theme; no skip-link, no role-fit deep links |
| 8 | Aesthetic and Minimalist Design | 3 | Calm evidence-led composition; tag piles (7 on IMDF) and triple social clusters add noise |
| 9 | Error Recovery | 2 | No recovery patterns applicable on this surface |
| 10 | Help and Documentation | 2 | No guidance for evaluating role/decisions/outcomes |
| **Total** | | **24/40** | **Acceptable — craft solid; evidence integrity and product voice now the gap** |

## Anti-Patterns Verdict

**Not obvious AI-slop anymore.** The hard tells are gone: no identical card grids (lead 21:9 exhibit + compact followers), one deliberate kicker (`STOCKHOLM → TOKYO`), no numbered scaffolding, no hero-metric template, no gradient text, no side-stripes. Mono now appears only as project role annotations — Annotation Rule-aligned. Residual risk is second-order: committed editorial lane + generic conversion copy ("Get in touch" / "Let's build something together").

**Deterministic scan:** CLI 1 advisory — `BottomNav.astro:42` 11px label off the type ramp (known, harden scope). Live detector: 4 banner rules — `cream-palette`, `gradient-text` ×2, `bounce-easing` all **false positives** (brand-committed Drawing Ground; token-presence-only, zero consuming nodes); true hits: `line-length` (AboutSplit ~85ch vs DESIGN.md 68ch; SelectedWork ~80–83ch borderline) and a narrow `layout-transition` (`ScrollProgress` width fill, intentional, reduced-motion-guarded).

**Agreement:** A and B independently flagged nothing structural — the prior P1s verify as fixed. **Detector-only:** line-length overrun. **LLM-only:** evidence integrity, conversion copy, dark CTA contrast.

## Overall Impression

The template skeleton is gone; what remains is a real editorial portfolio whose weakest link is now the evidence itself: the lead project wears another project's image, and a placeholder SVG sits above the Tengbom practice story. Fix the media truthfulness and the copy contract and this page starts converting.

## What's Working

1. Material brand system with voice — accent red confined to action/annotation (Evidence Marker Rule); measured contrast: light body ~5.26:1, dark ~6.79:1.
2. Project-led composition — lead exhibit vs compact followers, role annotations in mono, no feature grid; no horizontal overflow at 390px.
3. Mobile IA — labeled bottom tabs in the thumb zone (56×78 targets, safe-area padding).

## Priority Issues

- **[P0] Evidence integrity: duplicate + placeholder covers.** Cesium (lead exhibit) uses `/images/projects/shinjuku-nav-1-optimized.jpg` — the same still as the hero and the Shinjuku card; IMDF uses `imdf-placeholder.svg`. Three stories collapse into one picture. **Fix:** unique truthful covers (Cesium session capture; real IMDF wizard screenshot), or demote Cesium from lead until it has media. → needs real assets from Daniel + `/impeccable polish`
- **[P1] Hero + primary CTA miss the product voice.** H1 is a résumé category; CTAs are "Get in touch"/"Let's build something together" — not "discuss a specialized AEC technology role"; the footer tagline is currently closer to the positioning than the hero is. **Fix:** rewrite hero to the positioning line; role-shaped primary CTA. → `/impeccable clarify`
- **[P1] Outcomes absent on home; ladder still starts at systems.** Cards expose role + description; decisions/outcomes live only in project MD; Tengbom practice (Ersta, `featured: false`) appears only in About, below tool teasers. **Fix:** surface one outcome line per card from frontmatter; consider featuring Ersta for the practice rung. → `/impeccable clarify` + content
- **[P2] Dark primary CTA contrast ~2.99:1.** White on Kiln `#DE7A57` at 14px bold — AA large-text needs ≥3:1; borderline fail on the primary conversion control. **Fix:** darker kiln fill or charcoal ink on kiln. → `/impeccable harden`
- **[P2] JA 選考作品 mistranslation + 85ch body copy.** "Selection/audition works" reads wrong to a Japanese hiring leader; AboutSplit `max-w-3xl` at 18px ≈ 85ch vs DESIGN.md 68ch. **Fix:** 主な実績/プロジェクト; cap prose at 68ch. → `/impeccable harden`
- **[P3] Reveal hardening.** Stealth clients (webdriver spoofed) + instant jump-scroll can catch `.is-pending` mid-transition. **Fix:** optional timeout fallback to force-unhide. → `/impeccable polish`

## Persona Red Flags

- **Jordan:** hero assumes AEC literacy ("AEC", "3D Tiles") with no gloss; first action is a contact commitment, no guided "start here."
- **Casey:** bottom nav in thumb zone (good); primary conversion appears only mid-hero and again ~4,090px down — long thumb travel with no interim CTA.
- **Riley:** JA 選考作品; dark CTA 2.99:1; duplicate Shinjuku imagery reads as "broken" under stress scanning.
- **AEC hiring leader (90s):** role ✓ (mono annotations); decisions ✗; outcomes ✗ — still must open project pages; CTA not role-shaped. Principle 4 not yet met.

## Minor Observations

Footer tagline outranks the hero for positioning · featured sort by `publishDate` puts the weakest-media project (Cesium) in the lead slot · social links repeat in three clusters · vertical kicker hidden below `lg` so mobile loses the route marker · light badge contrast ~4.73:1 barely AA · `ScrollProgress` width transition is a narrow intentional exception.

## Questions to Consider

1. If the only image anyone remembers is Shinjuku-with-GOAL-pin, is Cesium ready to lead — or is the site accidentally a one-project monologue?
2. What would the page be if the primary CTA could not be misread as a freelance contact form?
3. If Tengbom practice is the root of the ladder, why does a placeholder SVG tool sit above it?
