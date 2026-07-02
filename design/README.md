# Alpha Software — Redesign Working Documents

This folder is the thinking and the rulebook behind the website redesign. It is
deliberately kept in the repo (but excluded from the Jekyll build — see
`_config.yml`) so the *reasoning* lives next to the *code* and never drifts from it.

> **One‑line thesis:** Alpha doesn't sell factory software. Alpha sells
> **precision** — and precision is what lets a Vietnamese dye house earn the
> trust of the world's most demanding brands.

## How these documents fit together

| # | Document | Question it answers |
|---|----------|--------------------|
| 00 | `README.md` (this file) | What are we doing and why, at a glance? |
| 01 | `01-strategy-and-positioning.md` | What is the business *really* selling, to whom, and how do we say it? |
| 02 | `02-design-principles.md` | What does "precision" mean as design — the rules every screen must obey? |
| 03 | `03-information-architecture.md` | What sections exist, in what order, and what is each one's job? |
| 04 | `04-design-system.md` | The concrete visual system: color, type, space, grid, motion, components. *(written after art direction is chosen)* |
| 05 | `05-build-notes.md` | How the redesign maps onto the existing Jekyll/Bootstrap stack and pipeline. *(living doc, updated during implementation)* |
| 06 | `06-spacing-and-class-audit.md` | Measured spacing/class audit of the live page (the evidence behind passes 5–7). |
| 07 | `07-alpha-design-language.md` | **«Đúng» — Alpha's own named design language.** The self-contained reference distilled from 01–04 as built; start here when styling anything new. |

Read them in order. 01 → 02 → 03 is the spine: **strategy decides principles,
principles decide architecture, architecture decides the system.**

## What we are keeping vs. rebuilding

"Redesign from the ground up" means the **design language, narrative, and
information architecture** — not the machinery underneath, which is already
excellent and carries real equity.

**Keep (it's an asset):**
- Jekyll + the bilingual VI/EN i18n system (`_data/i18n/*.yml`)
- The production pipeline (PurgeCSS, esbuild, asset fingerprinting, AVIF, minify)
- SEO/structured data (schema.org Organization/Review/AggregateRating, hreflang, OG)
- The brand name **Alpha Software** and domain (SEO + legal + schema equity)
- The signature warm "dye" accent as *equity to refine*, not discard

**Rebuild:**
- The positioning and every word of copy (product‑led → precision/outcome‑led)
- The information architecture and narrative arc
- The visual design system (color roles, type scale, spacing, components, motion)
- The hero and the proof/credibility sections — the heart of the trust argument

## Guardrail we will not cross

The brands **Decathlon, Uniqlo, Nike, Adidas** are the *aspiration*, not clients
or endorsers. Every mention must be framed as **"meet the precision standards
these brands demand of their suppliers"** — never as association or endorsement.
Integrity is part of the product story (traceability, honesty), so the site must
embody it. See 01 for the exact framing.
