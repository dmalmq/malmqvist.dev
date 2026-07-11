---
target: home
total_score: 29
p0_count: 0
p1_count: 2
timestamp: 2026-07-11T11-43-09Z
slug: src-components-homepage-astro
---
Method: dual-agent (A: DesignReview3 · B: DetectorEvidence3)

# Critique: Home (`src/components/HomePage.astro`) — run 3

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skip link focuses `#main-content`; scrolled-header edge; toggle states |
| 2 | Match System / Real World | 4 | Speaks AEC hiring language: positioning H1, role annotations, "Discuss a role" / 採用のご相談 |
| 3 | User Control and Freedom | 3 | Header/footer/bottom-nav exits, dual CTAs, no traps |
| 4 | Consistency and Standards | 3 | Tokens/seal/focus rings cohere; card layouts vary intentionally |
| 5 | Error Prevention | 3 | Static evidence page; simple link paths |
| 6 | Recognition Rather Than Recall | 3 | Role + impact + tags on-card; mono roles dense to scan |
| 7 | Flexibility and Efficiency | 3 | 3 locales, 2 themes, dual nav systems, dual conversion paths |
| 8 | Aesthetic and Minimalist Design | 3 | Clear hierarchy; card copy/tags thicken the middle |
| 9 | Error Recovery | 2 | No designed recovery surface (largely n/a on home) |
| 10 | Help and Documentation | 2 | Résumé PDFs in band; no gloss for tool jargon |
| **Total** | | **29/40** | **Good (28–35 band)** — first run out of "Acceptable" |

## Anti-Patterns Verdict

**Not AI-slop.** All hard tells verified absent by both assessments independently: no identical card grids (lead 21:9 + split followers), one deliberate kicker only, no numbered scaffolding, no hero-metric template, live-DOM scans measured **zero** gradient-text and **zero** side-stripe elements. Second-order editorial-lane risk acknowledged but mitigated by real project imagery and committed DESIGN.md identity.

**Deterministic scan:** CLI on home sources: **clean, exit 0**. Live in-page detector: 3 anti-patterns — `layout-transition` (ScrollProgress width fill: true positive, intentional, reduced-motion-guarded), `hero-eyebrow-chip` (the one deliberate kicker: rule fires correctly, brand-committed per DESIGN.md), `cream-palette` (Drawing Ground: brand-committed). Four body-level hits (`gradient-text` ×2, `bounce-easing`, body `layout-transition`) verified **false positives** against computed styles — unused Tailwind bundle tokens, zero consuming nodes. Supplemental copy scan: 5 em-dashes in body copy (house-style watch item).

## Overall Impression

The page now does what PRODUCT.md asked: positioning line at display scale, practice-led evidence with roles and outcomes on-card, role-shaped conversion with résumé fallback, and a disciplined material system measured at AA throughout. Remaining work is refinement, not repair: the hero image tells the systems story while the evidence list leads with practice, and the promised *interactive* proof still isn't touchable from home.

## What's Working

1. **Owned positioning, not résumé mush** — the H1 is the product line, dual-language, at 72px display scale; primary CTA is literally the PRODUCT.md ask.
2. **Evidence-first work stack** — role annotation → title → description → bold impact line → ≤5 tags; belief ladder on rails (Ersta practice → Shinjuku systems → GeoPackage tooling).
3. **Material discipline** — measured AA everywhere sampled (5.26:1 light body, 6.79:1 dark, 6.85:1/6.09:1 on filled CTAs); red confined to action/annotation.

## Priority Issues

- **[P1] Hero media fights the belief ladder.** Hero shows Shinjuku (systems); first card is Ersta (practice) — first visual promise ≠ first evidence chapter. **Fix:** practice-led hero still, or a bridge line opening Selected Work. (Note: an Ersta hero would also resolve the hero/Shinjuku-card asset relationship for good.)
- **[P1] Role annotations read as paragraphs, not notation.** Full clauses at 12px mono wrap hard on 390px; Annotation Rule wants sparse. **Fix:** short mono role title + pipeline as badges; cap ~45 chars.
- **[P2] Interactive proof missing from home.** PRODUCT.md lists the Cesium viewer as proof; home shows three static frames. **Fix:** promote a Cesium gate card into the three (pairs with the deferred real-cover work) or a compact "try a session" strip.
- **[P2] Desktop chrome overloads the first decision.** 4 nav + 3 langs + theme + 2 socials + 2 CTAs before evidence. **Fix:** socials to footer only on home.
- **[P3] "Fit" rung is thin.** Present-day Tokyo mandate is one inference away. **Fix:** one present-mandate sentence in About or a 3-bullet fit strip before the band.

## Persona Red Flags

- **Jordan:** first action obvious in 5s (pass); tool jargon unglossed on cards; hero image uncaptioned — could read as stock viz; Consulting-vs-candidate ambiguity in nav.
- **Casey:** bottom nav thumb-native (pass); hero CTA mid-column not thumb-zone; ~5,284px scroll with no interim conversion; JA お問い合わせ at 11px in a 78px cell is tight but unclipped.
- **Riley:** JA structural parity holds; skip link + `tabindex="-1"` work under keyboard; dark tokens swap cleanly; gaps: hero `alt` stays English on /ja/, Latin kicker on JA (aria-hidden, visual-only), long JA mono roles wrap aggressively.

## Minor Observations

21:9 lead media becomes a thin band on mobile (Ersta facade detail hard to inspect) · badges ~4.73:1 barely AA · em-dash density (5) in body copy · post-CTA footer chrome softens the peak-end slightly · other routes (About/Consulting/projects) still carry the eyebrow grammar the homepage dropped.

## Questions to Consider

1. If the hero must buy 3 seconds of belief with one image, should it be the award-winning hospital or the Tokyo system — and can the page stop asking visitors to reconcile both?
2. What would "deployable data" look like with one *operable* artifact on home instead of a third static card?
3. Would "Discuss a role" convert faster if it named the role family (BIM lead / digital-twin engineer / tools developer)?
