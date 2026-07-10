# Design brief — boatramp.dev

**This is the handoff to Claude Design.** It's self-contained: brand strategy,
visual system, motion, components, and the guardrails. Where it names concrete
values (hex, fonts) they are a *considered starting point* to refine, not law.
Provisional tokens already live in [`../src/styles/tokens.css`](../src/styles/tokens.css).

The one rule that isn't up for grabs: **make it genuinely original and cool.**
boatramp just started its journey — the site is its first impression. Aim for a
brand people screenshot and share, not a template.

---

## 1. What boatramp is (so the design has something true to say)

A **self-hosted, streaming-first platform for publishing the web** — from a single
static site to an edge-compute cluster — shipped as **one Rust binary** that is the
web server, the publishing API, and the CLI at once. You run it yourself: your
hardware, your cloud, or the edge. It feels like Vercel/Netlify, but you own the
whole stack (server, storage, certificates, compute). Deploys are atomic and
content-addressed; every byte streams; rollback is instant.

The three things every visitor must feel: **you own it · one binary, everywhere ·
streaming and atomic by design.**

---

## 2. Brand strategy

### 2.1 The metaphor — "launch / harbor"

The name is the gift. A **boat ramp** (or slipway) is the exact point where a
vessel is **launched** from land into open water. That maps cleanly onto the whole
product and is completely unlike Caddy's butler/green identity:

| Product truth | Nautical image |
| --- | --- |
| Deploy / publish / go live | **Launch** down the ramp into the water |
| "Streaming-first", flat memory | **Water / current / flow** |
| Atomic content-addressed deploys | A vessel launches **whole** — never half in the water |
| Deployments & OCI **containers** | **Cargo / vessels** (a happy double meaning) |
| Self-hosted, "you own the stack" | **Your own shore / harbor** |
| Same UX on every target | **One hull, every port** |
| Instant rollback | **Back to shore**, instantly |
| Scale-to-zero / sleeping origin | **Low tide**, wakes on demand |

Use the metaphor as an **undercurrent, not a costume.** Elegant and engineered —
*not* pirate kitsch, not cartoon boats, not literal clip-art anchors everywhere. A
smart infra audience should read it as confident and witty, never twee.

### 2.2 Positioning line
> **Launch the web from your own shore.**

Alt/secondary lines to explore: *"Your ramp to the open web." · "One binary. The
whole harbor." · "Own the water."*

### 2.3 Personality & voice (playful & clever)
- **Clever, not silly.** Nautical wordplay that also states a real fact: "cast off
  in one command", "one hull, every port", "readers never see a half-launched
  ship." The joke should carry the spec.
- **Confident, not hypey.** No "revolutionary", no "blazing-fast" filler. The
  substance (streaming, atomic, single-binary) is impressive on its own.
- **Honest.** Pre-1.0 is stated plainly and made a virtue ("come crew it early").
- **Register:** talks to engineers as peers. Precise nouns, dry wit, short
  sentences. Microcopy is where the personality lives (button labels, empty
  states, the 404, tooltips, the dogfood badge).

### 2.4 Anti-goals (do not do)
- Don't echo Caddy's look (green, butler/valet, "every site by HTTPS" layout).
- No stock "cloud", isometric-server, or 3D-blob clichés.
- No fake social proof — no logo wall, no testimonials, no "trusted by".
- No commercial surface — no pricing, plans, or "contact sales".
- Don't drown it in nautical props. One or two strong motifs, used consistently,
  beat a beach of icons.

---

## 3. Logo & wordmark

- **Wordmark:** `boatramp`, **lowercase** (consistent with the project's own usage
  everywhere — README, docs title). Lowercase already reads friendly/utilitarian;
  lean into it.
- **Mark / glyph:** an abstract **ramp meeting a waterline** — e.g. a descending
  diagonal (the ramp / a chevron) that dips into a single wave stroke; or a
  minimal **slipway** seen in plan. Must:
  - work as a **1-color** glyph and as a **favicon at 16px**,
  - survive on both deep-navy and paper backgrounds,
  - feel geometric/engineered (it's systems software), not illustrative.
- A subtle idea worth a look: the mark contains a hidden **"⌄ / down-into-water"**
  = *launch* motion, echoed by the hero animation.
- Deliverables for `/brand`: SVG wordmark, SVG glyph, favicon set, monochrome +
  reversed variants, and clear-space rules.

---

## 4. Color

Direction: **marine depths + one bright launch accent.** Dark-first (the mood is a
harbor at depth), with a fully-designed light theme ("foam & paper").

Starting palette (in `tokens.css` — tune freely, but keep the *structure*: a depth
scale + a small set of accents):

| Token | Value | Role |
| --- | --- | --- |
| `--depth-900…500` | `#05141f → #1b566f` | Marine background/surface scale (dark) |
| `--depth-100 / 050` | `#cfe6ef / #eef7fb` | Foam / paper (light theme bg) |
| `--tide` | `#2088c1` | Mid blue — **deliberate bridge to the docs badge color** so site↔docs feel related |
| `--launch` | `#ff6b35` | **Primary CTA / "flip to live"** — a signal-flare orange that pops against navy |
| `--launch-2` | `#ffd23f` | Buoy yellow — sparing secondary highlight |
| `--seafoam` | `#35e0c4` | Streaming/success accent, links on dark |

Guidance:
- The **launch accent is precious** — reserve it for the primary action and the
  single signature "go live" moment. If everything glows, nothing launches.
- **Contrast is a hard requirement, not a vibe.** Verify AA (4.5:1 text, 3:1 UI)
  for the accent-on-navy and every text/surface pair, in *both* themes. Orange on
  deep navy is promising but must be checked at real sizes; don't set body text in
  the accent.
- Consider a faint **depth-gradient** (abyss at the bottom of the page, lighter
  "surface" at the top) as a quiet through-line, and a **waterline** rule that
  separates hero from content.

---

## 5. Typography

Self-hosted (no Google Fonts CDN — the site should own its stack). Three roles:

- **Display / headline:** something with *a little character and engineering* — a
  confident grotesk or a subtly technical sans that feels modern and marine, not
  corporate. It carries the personality; pick something ownable.
- **Body:** a clean, highly legible humanist sans (dense technical prose must stay
  comfortable). System stack is an acceptable fallback for perf.
- **Mono:** a first-class monospace — **the product is a CLI**, so code and
  commands are hero content, not afterthoughts. Consider a mono with character
  (e.g. JetBrains Mono / Berkeley-Mono-like) since it appears constantly.

Set a clear type scale, generous line-height for prose, and treat **code blocks as
designed objects** (see components). Pair the mono with a tasteful terminal
treatment for the quickstart.

---

## 6. Motion & signature moments

Water and launch are the motion language. **All of it must degrade to static under
`prefers-reduced-motion`** (already stubbed in `tokens.css`) — the page must be
fully understandable with zero animation.

Signature moments (pick 2–3 to nail; don't animate everything):
1. **Hero launch/waterline.** A gentle, looping current at the hero's waterline;
   optionally bytes/vessels streaming *down the ramp* into the water — literally
   the "streaming-first" story. Keep it subtle and cheap (SVG/CSS/Canvas), 60fps,
   pausable, off by default under reduced-motion.
2. **The atomic "flip to live."** A one-shot micro-interaction where a deploy
   *flips* from the old state to the new in a single beat, using the launch
   accent. This is boatramp's core idea made tactile — reuse it on the dogfood
   badge and the "how it works" section.
3. **Terminal quickstart.** The 3-command quickstart types itself out and ends on
   the atomic flip + "it's live". Respect reduced-motion (show final state).

Everything else: quiet, fast, `--ease-launch`-flavored transitions. No parallax
seasickness.

---

## 7. Layout & component inventory

- **Grid:** 12-col, `--content-max` ≈ 1120px, generous gutters, mobile-first.
- **Rhythm:** confident whitespace; let the hero breathe; dense only where it earns
  it (the capabilities grid, install matrix).

Components Claude Design should define (tokens-driven, both themes):
- **Nav** — wordmark, primary links (Features, Install, Docs↗, Community, GitHub↗),
  theme toggle. Sticky, condenses on scroll.
- **Hero** — headline, sub, dual CTA, one-liner-with-copy, dogfood badge, motion.
- **Capability card** — icon + claim + sub-bullets + "→ docs"; 6 up in a grid.
- **Code block / terminal** — mono, window-chrome optional, copy button, tab group
  (platform-aware), and a special "live/flip" state for the quickstart.
- **Callout / note** — for the honesty (maturity) strip and inline tips.
- **"Why" strip** — big claim + one-sentence proof, alternating alignment.
- **Deploy-target matrix** — bare metal / systemd / NixOS / Docker / Cloudflare /
  cluster, "same UX" made visual.
- **Stat / metric chip** — e.g. "1 binary", "0 files held in memory", "HTTP/3".
- **Dogfood badge** — "⚓ served by boatramp", ideally with live deploy id/age.
- **Footer** — links, license, RSS, brand, repeat badge.
- **Icon set** — a small, custom, geometric nautical-technical family (buoy, cargo,
  tide, hull, anchor, wave, ramp) mapped to the six capabilities. Consistent
  stroke weight; no mixed clip-art.

---

## 8. Accessibility & performance budgets (non-negotiable)

- **WCAG 2.2 AA** across both themes: keyboard-operable, visible focus states,
  semantic landmarks, real alt text, AA contrast (verify the accent pairs).
- **`prefers-reduced-motion` fully honored** — no essential info conveyed by motion
  or color alone.
- **Performance:** target Lighthouse 100; ship **zero required JS** for content
  (islands only for toggle/copy/motion/playground); self-host fonts; lazy/`async`
  media; fingerprinted immutable assets. The site should *feel* like the product:
  instant.

---

## 9. What to deliver back

For Phase 1 (the launch site): the home page fully realized, plus `/install`,
`/community`, `/brand`, and the themed `/404`, built on a tokens-driven system in
this Astro repo (see [`tech-and-deploy.md`](tech-and-deploy.md)). Along the way:
the wordmark + glyph + favicon, the color tokens finalized (with contrast proof),
the type choices (self-hosted), the icon set, and the 2–3 signature motion moments.
Keep everything token-driven so the brand has a single source of truth.
