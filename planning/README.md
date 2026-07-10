# boatramp.dev — plan overview

This directory is the brief for building **boatramp.dev**, the marketing site for
[boatramp](https://github.com/BoatRamp/BoatRamp). Read this first, then the three
companion docs.

## What we're building, in one breath

A fast, original, **static** marketing site — served by boatramp itself — that
makes a newcomer understand in ten seconds what boatramp is (*a self-hosted,
single-binary platform for publishing the web*), feel that it's genuinely cool,
and reach either the install one-liner or the docs without friction.

## Who it's for

1. **The curious developer** who saw "self-hosted Vercel, one Rust binary" and
   wants to know if it's real. → Needs a crisp pitch + a fast path to `install`.
2. **The infra/platform engineer** evaluating it for real work. → Needs the
   architecture story (streaming, atomic deploys, clustering, security) and links
   into the docs' how-to/explanation sections.
3. **The would-be contributor**. → boatramp *just started its journey*; the site
   should make joining early feel exciting, not empty.

## What this site is NOT

- **Not the docs.** Reference material lives at docs.boatramp.dev (mdBook). This
  site links out; it never duplicates the CLI/API reference.
- **No fake social proof.** boatramp is new — there is no "trusted by" / logo wall
  / testimonial section. We earn credibility with *substance*: the architecture,
  the single-binary story, honest pre-1.0 maturity, and the fact that the site
  runs on the product.
- **No commercial tier / pricing / "contact sales."** boatramp is free and open
  source (MIT OR Apache-2.0). The Caddy comparison the owner made is purely
  *structural* (the shape of a serious OSS-server product site) — not visual, not
  feature-by-feature, and explicitly without Caddy's commercial half.

## The three pillars of the pitch

Everything on the page should ladder up to one of these:

1. **You own the whole stack.** Server, storage, TLS, and compute — your hardware,
   your cloud, or the edge. Not a SaaS you rent.
2. **One binary, same UX everywhere.** Laptop → systemd VPS → NixOS → Docker →
   Cloudflare → HA cluster, with the *same commands and config*.
3. **Streaming-first, atomic by design.** Every byte streams (flat memory, even for
   a 4 GiB video); deploys are content-addressed and flip live atomically, with
   instant, upload-free rollback.

## Brand direction (decided)

- **Visual:** the *launch / harbor* metaphor — a boat ramp is where you **launch**.
  Marine depths + a bright launch accent; water = "streaming-first"; cargo/vessels
  = deploys & containers; tides = flow. Genuinely original, ownable, and unrelated
  to Caddy's butler/green identity.
- **Voice:** playful & clever — nautical wordplay and witty microcopy, riding on
  top of technically precise substance. Cool, but never at the expense of
  credibility.

## Roadmap (suggested phases)

- **Phase 0 — Scaffold + plan (done):** design-token layer, `project.cfg`, CI +
  deploy workflows, this plan.
- **Phase 1 — Launch site (done):** the home page built from Claude Design's
  handoff (direction *2a*) as static HTML/CSS + a **Dioxus WASM island** for the
  dynamic parts, plus a themed 404. Verified by dogfood-deploying with the real
  boatramp. *(Stack note: the owner directed Rust/Dioxus for dynamic parts rather
  than the Astro approach this doc originally sketched — see
  [`tech-and-deploy.md`](tech-and-deploy.md).)*
- **Phase 2 — Content engine:** blog/changelog (Markdown + RSS) to narrate the
  journey and carry release notes; OG-image generation.
- **Phase 3 — Dogfood the edge (optional but on-brand):** one live interactive
  demo powered by a boatramp **Wasm handler** (e.g. paste a `project.cfg` → live
  validation), so the site shows boatramp's *compute*, not just its static serving.

See [`features-sitemap.md`](features-sitemap.md) for the full page/section
breakdown, [`design-brief.md`](design-brief.md) for the Claude Design handoff, and
[`tech-and-deploy.md`](tech-and-deploy.md) for the stack and the deploy pipeline.
