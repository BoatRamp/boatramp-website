# Handoff: boatramp.dev — launch site home page

## Overview
This package contains the design for the **boatramp.dev** marketing home page. boatramp
is a self-hosted, streaming-first platform for publishing the web, shipped as one Rust
binary (web server + publishing API + CLI). The home page's job is to make three things
felt in seconds: **you own it · one binary, everywhere · streaming and atomic by design**,
under the positioning line *"Launch the web from your own shore."*

Full brand strategy is in the bundled **`design-brief.md`** — read it; it is the source of
truth for voice, metaphor, and guardrails.

## About the design files
The bundled file **`boatramp.dev.dc.html`** is a **design reference created in HTML** — a
prototype showing intended look, copy, and behavior. It is **not production code to copy
directly.** It uses an internal component runtime (`<x-dc>` / inline styles) purely so the
mock could be authored quickly; ignore that machinery.

The task is to **recreate these designs in the target codebase.** Per `design-brief.md §9`
and `tech-and-deploy.md`, the target is an **Astro** repo with a **tokens-driven** system
and a hard **zero-required-JS-for-content** budget (islands only for the theme toggle, copy
buttons, terminal typing, and hero motion). Do not ship the prototype's inline styles or its
runtime — rebuild with Astro components + a real `tokens.css`, self-hosted fonts, and small
progressive-enhancement islands.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final-intent.
Recreate the UI to match, mapping the literal values below into `tokens.css` variables (the
prototype inlines hex literals because its runtime required it — in the real build these
must become tokens, matching the names already stubbed in the repo's `tokens.css`).

## The three options in the file
Open `boatramp.dev.dc.html`; it presents three home-page directions side by side on a canvas,
each a full page. Badges (top center of each) identify them:

- **2a — Depth + Organized** *(recommended — build this one)*. The "Depth" aesthetic with a
  tightly organized, topic-grouped information architecture. **This is the direction to
  implement.** Everything below documents 2a unless noted.
- **1a — Depth**. Same aesthetic, looser/more editorial section flow. Reference only.
- **1b — Blueprint**. A schematic/monospace-forward alternative treatment. Reference only —
  useful as a source for the "launch sequence" figure idea and the spec-sheet table styling
  that 2a adopts.

Everything in 2a is assembled from 1a's visual language + 1b's structure, so 1a/1b are just
context.

---

## Design tokens
These match the structure in `design-brief.md §4`. Put them in `tokens.css`. Dark theme only
was built this round; the light theme ("foam & paper") still needs designing per the brief.

### Color — marine depth scale
| Token | Hex | Role |
| --- | --- | --- |
| `--depth-900` | `#05141f` | Page background (dark) |
| `--depth-abyss` | `#02090f` | Desk/canvas behind cards; deepest footer |
| `--depth-850` | `#041018` | Lower page gradient stop |
| `--depth-800` | `#072436` | Upper page gradient stop / surface |
| `--surface` | `#0a1c28` | Terminal title bar |
| `--surface-2` | `#020c13` | Terminal body / inset code |
| `--depth-100` | `#cfe6ef` | Light theme bg (to design) |
| `--depth-050` | `#eef7fb` | Foam/paper — primary text on dark |

### Color — accents
| Token | Hex | Role |
| --- | --- | --- |
| `--tide` | `#2088c1` | Mid blue; bridge to docs badge color; wave fill |
| `--launch` | `#ff6b35` | **PRECIOUS.** Primary CTA + the single "flip to live" moment. Never body text. |
| `--launch-2` | `#ffd23f` | Buoy yellow; sparing secondary highlight (pre-1.0 badge, rollback note) |
| `--seafoam` | `#35e0c4` | Streaming/success accent; links on dark; mono labels |

### Text colors (on dark)
| Use | Hex |
| --- | --- |
| Heading / high-emphasis | `#eef7fb` |
| Body | `#a9c6d4` |
| Muted / captions | `#7fa6b8` |
| Faint / footer meta | `#546e7c` |

### Hairlines / borders
- Neutral hairline: `rgba(207,230,239,0.08)` (nav/section rules), `0.1`–`0.14` for card borders.
- Seafoam hairline (blueprint/1b + accents): `rgba(53,224,196,0.12 → 0.24)`.

### Typography (self-host all three — no Google CDN, per brief §5)
- **Display / headline:** `Space Grotesk` (700). Letter-spacing `-0.02em` to `-0.03em`.
- **Body:** `IBM Plex Sans` (400/500/600). System-stack fallback acceptable.
- **Mono:** `JetBrains Mono` (400/500/700). First-class — the product is a CLI; code and
  commands are hero content.

Type scale used (px): hero h1 **66/1.02**; section h2 **32–38/1.08**; payoff numbers **24–30**;
body **19** (hero sub) / **15–16** (prose); captions/mono **11–14**; eyebrow mono **12** with
`letter-spacing:0.14em`.

### Radius / shadow / motion
- Radius: cards/panels **14px**, buttons **9–10px**, pills **100px**, chips **6–8px**, outer card **20px**.
- Elevation: CTA glow `0 10px 30px -8px rgba(255,107,53,0.55)`; panels `0 30px 80px -30px rgba(0,0,0,0.7)`.
- Easing: brief defines `--ease-launch`; transitions ~200ms; keep quiet, no parallax.

---

## Layout
- Grid: 12-col, `--content-max ≈ 1120px`, generous gutters, mobile-first.
- The mock cards are 1180px wide with 44px horizontal section padding — treat 44px as the
  desktop gutter inside a ~1120px content column.
- Section rhythm in 2a is **numbered modules** (see below), each a clearly separated topic
  block with a mono eyebrow (`NN / LABEL`) + a Space Grotesk h2 on the same baseline row.

## Screens / views — 2a home page, top to bottom

### 1. Nav (sticky, condenses on scroll — condense not yet built)
- Left: glyph (see Assets) + `boatramp` wordmark, Space Grotesk 700, 20px, `#eef7fb`.
- Right: text links `Features · Install · Docs↗ · Community` (`#cfe6ef`, 14.5px) + a solid
  **Star** pill (bg `#eef7fb`, text `#05141f`, GitHub mark, count `2.4k` in mono `#1b566f`).
- Bottom border `rgba(207,230,239,0.08)`, `backdrop-filter: blur(6px)`, padding 22px/44px.

### 2. Hero
- Eyebrow pill: mono 12px `#ffd23f`, dot with slow blink, text `pre-1.0 · come crew it early`.
- H1: `Launch the web from your own shore.` — "shore" in `--launch` `#ff6b35`. 66px/1.02, `-0.03em`.
- Sub: 19px `#a9c6d4`, max-width 560px (exact copy in the file).
- **Actions (two items):**
  - Primary `Read the docs →` — bg `#ff6b35`, text `#05141f`, 700, radius 10px, launch glow.
    Links to `https://docs.boatramp.dev`.
  - Secondary `View on GitHub ↗` — ghost, 1px `rgba(207,230,239,0.2)`, text `#eef7fb`, GitHub
    mark inline. Links to `https://github.com/boatramp/boatramp`, `target=_blank rel=noopener`.
- One-liner install: mono row `$ curl -sSf boatramp.dev/launch | sh` on `#020c13`, seafoam
  border, with a **copy button** (seafoam bg, `#05141f` text) → copies command, shows `copied ✓` 1.4s.
- Dogfood badge: `⚓ served by boatramp` (seafoam pill, anchor gently bobs) + mono meta
  `deploy 7f3a2c1 · live 3h ago · 41ms cold start`. Wire the deploy id/age to real data later.
- **Motion A — hero waterline + streaming bytes:** two layered SVG wave paths at the hero
  base drifting horizontally (`translateX`, 9s & 6.5s loops, tide/seafoam at ~0.1–0.16 alpha);
  6 small colored squares fall diagonally "down the ramp" (staggered 3.1–4.6s). Subtle, cheap,
  60fps, **off under `prefers-reduced-motion`**.

### 3. Three-truths bar
- 3 equal columns, top border seafoam-tint, bg `rgba(2,10,17,0.5)`.
- Each: mono index (`01` launch / `02` launch-2 / `03` seafoam) + Space Grotesk 17px title +
  `#7fa6b8` one-liner. Copy: You own it / One binary, everywhere / Streaming & atomic.

### 4. Module 01 / QUICKSTART (terminal + annotation, grouped)
- Header row: mono eyebrow `01 / QUICKSTART` (seafoam) + h2 `Cast off in three commands.`
- Terminal card: title bar with 3 traffic-light dots (launch/launch-2/seafoam), a **platform
  tab group** (`macOS · Linux · Docker`; active tab = seafoam bg `rgba(53,224,196,0.16)` +
  seafoam text, inactive `#7fa6b8`), and a copy button (copies all 3 commands).
- Body is a 2-column grid:
  - Left (mono, 13.5px): **Motion C — self-typing terminal.** Types the 3 commands in
    sequence with a blinking caret, revealing each `↳` output line, then ends on **Motion B —
    the atomic flip:** the `it's live — boatramp.dev · 41ms` badge (launch bg) flips in on the
    X axis (`rotateX(88deg)→0`, ~420ms). Under `prefers-reduced-motion` show the final typed
    state immediately.
  - Right (mono, 12px, `#7fa6b8`): `// what just happened` list — content-addressed build ·
    0 bytes buffered · atomic pointer flip · prev launch still afloat · `rollback → boatramp back`.
- Tabs currently only restyle; wire each tab to swap the command set per platform in the build.

### 5. Module 02 / CAPABILITIES (spec sheet + payoff, grouped)
- Header: `02 / CAPABILITIES` + h2 `The whole harbor, one hull.`
- **Spec sheet table** in a bordered card, 4 columns: `index (44px) · icon+name · description ·
  mono tag`. 6 rows, 1px seafoam-tint row dividers. Rows (icon / name / desc / tag):
  1. cargo — Atomic deploys — *Content-addressed; launches whole or not at all* — `br deploy`
  2. tide — Streaming-first — *Byte-for-byte store → socket; flat memory* — `range: yes`
  3. anchor — Instant rollback — *Immutable snapshots; back to shore in one flip* — `br back`
  4. hull — Single binary — *Server + API + CLI; bare metal to edge, same UX* — `1 file`
  5. buoy — You own it — *Your storage, TLS, compute — no tenancy, no phone-home* — `self-host`
  6. wave — Modern edge — *HTTP/3 + auto-TLS; scale-to-zero, wakes on demand* — `h3 · tls`
- **The payoff:** two side-by-side cards below the table — `0 files held in memory.` (launch-
  tinted) and `Back to shore, instantly.` (seafoam-tinted), Space Grotesk 24px + short proof.

### 6. Module 03 / WHERE IT RUNS (deploy-target manifest)
- Header: `03 / WHERE IT RUNS` + h2 `One hull, every port.` + right mono note `same UX · same binary`.
- 3×2 grid of target cards: Bare metal `boatramp serve` · systemd `boatramp.service` · NixOS
  `services.boatramp` · Docker `ghcr.io/boatramp` · Cloudflare `--to cf.edge` · Cluster
  `--to shore-01..n`. Each card ends with mono `✓ same UX` (seafoam).

### 7. Honesty callout (pre-1.0)
- Launch-2 left border (3px), faint `rgba(255,210,63,0.05)` bg. `pre-1.0` label + honest
  maturity copy ending in a `come crew it` seafoam link. Exact copy in the file.

### 8. Footer
- Brand block (glyph + wordmark + tagline) + two link columns (`PRODUCT` / `CREW`, mono
  labels). Bottom bar: `MIT licensed · © 2026 boatramp` + repeat dogfood badge with deploy id.

## Interactions & behavior
- **Copy buttons** (hero one-liner, terminal): copy to clipboard; label → `copied ✓` for 1.4s.
- **Platform tabs:** restyle active; must swap command set per platform (extend in build).
- **Self-typing terminal:** runs on scroll-into-view, with a fallback timer if the observer
  never fires; per-char typing + blinking caret; ends on the atomic flip badge.
- **Atomic flip:** the signature moment — reuse the same flip on the dogfood badge and any
  "how it works" step per brief §6.
- **Reduced motion:** everything degrades to static — waves/bytes stop, terminal shows final
  state, flip is instant. No information is conveyed by motion or color alone.
- **Links:** default and hover link colors must be defined (seafoam family on dark).

## State management (islands)
- `copied` (per copy button, transient 1.4s).
- `activePlatform` (tab group → command set).
- `terminalPhase` (idle → typing → live); `hasRun` guard so it types once.
- Later: live `deployId` / `deployAge` / `coldStartMs` for the dogfood badge (fetch or build-time inject).
- Theme (`dark`/`light`) once the light theme is designed — brief calls for a working toggle.

## Accessibility & performance (non-negotiable, brief §8)
- WCAG 2.2 AA both themes: keyboard-operable, visible focus, semantic landmarks, real alt text.
- **Verify AA contrast for launch-on-navy at real sizes** — `#ff6b35` is used on dark only for
  large display text ("shore") and as a fill behind `#05141f` text (CTA, flip badge); never as
  body text. Re-verify once tokenized.
- Zero required JS for content; self-host fonts; lazy/async media; fingerprinted immutable assets.
- Target Lighthouse 100.

## Assets
- **Glyph** (used in nav + footer): inline SVG, 32×32 viewBox — an abstract ramp meeting a
  waterline: an orange descending diagonal (`#ff6b35`), a launch-2 chevron "dip" into the
  water, and a seafoam wave stroke. Must work 1-color and as a 16px favicon; produce mono +
  reversed variants and a favicon set for `/brand` (brief §3).
- **Capability icons** (buoy, cargo, tide, hull, anchor, wave): custom geometric 24px-grid
  line icons, ~1.7 stroke, defined in the file's logic (`icon()` method). Rebuild as a small
  SVG sprite/family; consistent stroke weight, no clip-art.
- **GitHub mark:** standard Octicon path (in nav + hero secondary CTA).
- Fonts: Space Grotesk, IBM Plex Sans, JetBrains Mono — **self-host** (`.woff2`), do not use
  the Google CDN. (The prototype links the CDN only for preview convenience.)
- No stock cloud/isometric/3D-blob imagery, no logo wall, no testimonials (brief §2.4).

## Files
- `boatramp.dev.dc.html` — the design reference (3 options; build **2a**). Contains all exact
  copy, colors, icon SVGs, and the interaction logic.
- `tokens.css` — **ready-to-use token starter.** Dark theme fully specified; light theme
  ("foam & paper") stubbed with placeholder values to design; includes the reduced-motion
  block and base link styling. Reconcile against the repo's existing `tokens.css` (brief §4).
- `design-brief.md` — full brand strategy, color/type/motion system, component inventory,
  a11y/perf budgets, and Phase-1 deliverables (also names `tokens.css` and `tech-and-deploy.md`
  in the repo).
- `screenshots/` — full-width slices of each option, top to bottom:
  `2a.png` (recommended), `1a.png`, `1b.png`. Note: captured at reduced zoom, so the hero
  eyebrow pill wraps to two lines in the images — it is single-line in the live design.
