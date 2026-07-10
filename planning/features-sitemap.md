# Features & site map

This defines *what the site contains* — every page, every section of the home
page, and the site's own functional feature list. Design of these elements is in
[`design-brief.md`](design-brief.md); the stack is in
[`tech-and-deploy.md`](tech-and-deploy.md).

Copy shown here is **placeholder in the right voice** (playful & clever, nautical)
to convey tone and intent — treat it as a starting point, not final wording.

---

## 1. Site map

```
/                 Home (the pitch)
/features         Capabilities in depth (or deep-linked #anchors on Home)
/install          Install & download — every method, every platform
/community        Get involved: GitHub, discussions, roadmap, "join early"
/brand            Logo, colors, wordmark, usage do/don't  (nice-to-have, on-brand)
/blog             Announcements + changelog narrative        (Phase 2)
/blog/[slug]      Individual posts (MDX)                      (Phase 2)
/playground       Live Wasm-handler demo                      (Phase 3, optional)
/404              Themed "you've drifted off the map"

Outbound (not built here):
  docs.boatramp.dev        Reference documentation (mdBook)
  github.com/BoatRamp/BoatRamp   Source, issues, releases
```

Machine-facing extras: `sitemap.xml`, `robots.txt`, `/blog/rss.xml`,
`llms.txt` (a concise, link-rich summary for LLMs), `install.sh` +
`install.ps1` served at the apex so `curl https://boatramp.dev/install.sh | sh`
works (the main repo already ships these under `packaging/install/`).

---

## 2. Home page — section by section

The home page is the whole pitch. Each section ladders up to one of the three
pillars (own the stack / one binary everywhere / streaming-first & atomic).

### 2.1 Hero
- **Headline:** "Launch the web from your own shore." (or A/B alt: "Your ramp to
  the open web.")
- **Sub:** "The self-hosted platform for publishing the web — serve, deploy, and
  run code at the edge, all from a single binary you own."
- **Primary CTA:** `Get boatramp` → `/install`. **Secondary:** `Read the docs` →
  docs.boatramp.dev.
- **Signature visual:** the "launch" motif — a waterline where bytes/vessels
  stream down the ramp into the water. Doubles as the streaming-first metaphor.
  (Motion details in the design brief; must honor `prefers-reduced-motion`.)
- **Install one-liner** right under the fold, one-click copy:
  `curl -fsSL https://boatramp.dev/install.sh | sh`
- **Dogfood badge:** a small, honest "⚓ This site is served by boatramp" chip,
  ideally showing the live deployment id / age (pulled at build time, or live via
  the Phase-3 handler).

### 2.2 The one-breath pitch
A single short paragraph + a 3-command proof, exactly the README's quickstart:

```sh
boatramp serve                                   # the web server
boatramp sync ./public --site my-site            # atomic, content-addressed deploy
curl http://127.0.0.1:8080/                       # it's live
```

Point: *server + publish API + CLI in one binary; nothing else to install.*

### 2.3 Capabilities grid
Six cards, mirroring the product's own framing (Publish / Serve / Compute / Scale
/ Operate / Ship). Each card: nautical icon + one-line claim + 2–3 sub-bullets +
"→ docs" deep link.

| Card | One-liner | Sub-bullets (from real features) | Docs link |
| --- | --- | --- | --- |
| **Publish** | "Cast off in one command." | Atomic content-addressed deploys · cross-deploy dedup + delta uploads · instant upload-free rollback · preview aliases | how-to/publish |
| **Serve** | "A real web server, not a bucket." | Range/conditional GETs + compression · virtualhost routing · edge access control (basic-auth, IP allow/deny, rate limit) · **HTTP/1.1, /2, /3 (QUIC)** · automatic HTTPS (ACME) | how-to/routing |
| **Compute at the edge** | "Run code where you serve." | **Wasm `wasi:http` handlers** validated at deploy · Firecracker-style microVMs · OCI containers · per-site SQL, durable queue, logs | tutorials/first-handler |
| **Scale** | "One node to a fleet, same commands." | Self-hosted HA **Raft** cluster · database per site · built-in reverse-proxy **gateway** with health checks + retries | how-to/deploy-cluster |
| **Operate** | "Own the controls." | COSE/CWT tokens + **Cedar** policies · pluggable signer (Vault, PKCS#11/HSM, KMS) · OIDC login · Prometheus metrics + live log tail · web console | explanation/auth-model |
| **Ship** | "One hull, every port." | Single static binary · prebuilt binaries, `.deb`/`.rpm`, Homebrew, hardened systemd unit, NixOS module, reproducible OCI image | how-to/install |

### 2.4 "How it works" — the streaming, atomic flow
An animated (reduced-motion-safe) diagram of the `sync` → `serve` path, straight
from the README's ASCII diagram:
- `sync`: walk dir → hash files (streamed) → POST manifest → server reports
  missing → PUT only missing blobs → POST activate → **atomic flip**.
- `serve`: host-routed GET → resolve current → manifest → hash → stream blob.
- Callouts: *"No file is ever held whole in memory."* / *"Readers always see the
  old deploy or the new one in full — never a half-written mix."*

### 2.5 "Why boatramp" — the differentiators
Three-to-four punchy strips, each pillar made concrete:
- **Own the whole stack.** "Like how Vercel/Netlify *feel*, but it's your server,
  your storage, your certs, your compute." Blobs (fs/S3), KV (embedded LSM), TLS
  (ACME/DNS-01/BYO) — all yours.
- **Streaming, not buffering.** "A 4 GiB video deploys with a flat memory profile."
- **Atomic & content-addressed.** "Identical bytes stored once. Unchanged files
  never re-uploaded. Rollback is instant and uploads nothing."
- **Same UX on every target.** A compact matrix: bare metal · systemd · NixOS ·
  Docker/OCI · Cloudflare · HA cluster — "environment differences live behind
  backends, never in the UX."

### 2.6 Install / quickstart
Tabbed, copy-on-click, platform-auto-detected:
- **Release** (prebuilt binaries + `.deb`/`.rpm` + Homebrew) · **Nix**
  (`nix run github:BoatRamp/BoatRamp -- serve`) · **Cargo** (from source) ·
  **Docker/OCI**.
- Then the 3-command quickstart again as the "now what". Full detail lives on
  `/install`.

### 2.7 Honesty strip (maturity)
boatramp is pre-1.0 (`v0.1`). Say so, confidently: "The feature set is
implemented and tested; interfaces may still change before 1.0. The default build
is the smallest fully-functional core — everything else is an additive cargo
feature." Links to the docs' *Maturity, validation & support* page. This candor is
part of the brand, and replaces the (absent) testimonial section as trust-building.

### 2.8 Final CTA + footer
- Closing CTA: `Get boatramp` / `Star on GitHub` / `Read the docs`.
- Footer: docs, GitHub, releases, license (MIT OR Apache-2.0), community links,
  brand page, RSS. Repeat the dogfood badge.

---

## 3. Other pages

- **/features** — each capability card expanded into a full section with a small
  code/config sample and deep links into the docs. (If Home already covers this
  well via anchors, this can be deferred; keep the route reserved.)
- **/install** — the complete matrix: every platform, package managers, checksums
  / verification, the systemd unit, the NixOS module snippet
  (`services.boatramp.enable = true;`), the Docker image, and "build from source".
  Mirrors the main repo's `packaging/` and README install section.
- **/community** — "boatramp just left the harbor — come crew it." Links to GitHub
  issues/discussions, the contributing guide, the roadmap, how to write a handler,
  and good-first-issues. This page carries the "join early" energy.
- **/brand** — wordmark + logo downloads, the palette with hex/tokens, clear-space
  and don'ts. Cheap to build, signals seriousness, and helps the ecosystem.
- **/blog** *(Phase 2)* — announcements + a human changelog ("what shipped in
  v0.x, and why"). Markdown + RSS. Great for SEO and for
  telling the origin story of a new project.
- **/playground** *(Phase 3, optional)* — a live demo backed by a real boatramp
  **Wasm handler** (e.g. paste a `project.cfg` and get live `boatramp validate`
  feedback, or watch a simulated atomic deploy). The ultimate dogfood: the site
  runs boatramp's edge compute to show off boatramp's edge compute.
- **/404** — themed: "You've drifted off the map." Keep it charming and useful
  (search box / links back to Home + docs).

---

## 4. The site's own feature list (functional requirements)

These are properties of the website as a piece of software — they double as a live
demonstration of what a boatramp-served site can be.

**Performance & delivery**
- Fully **static**; **zero required JavaScript** for content — islands only where
  interaction is real (theme toggle, copy buttons, hero motion, playground).
- Target **Lighthouse 100 / green Core Web Vitals**; strict JS + image budgets.
- **Self-hosted fonts and assets — no third-party CDNs.** ("Own the whole stack"
  is the pitch; the site should embody it. Also faster and privacy-clean.)
- Self-hosted fonts under `/fonts/**` served `immutable` (see `project.cfg`).

**Experience**
- **Dark & light themes** on the marine palette; respects `prefers-color-scheme`
  with a manual toggle (persisted). Dark is the default (harbor-at-depth mood).
- **Responsive / mobile-first.**
- **Copy-to-clipboard** on every code block; **platform auto-detect** for install
  tabs.
- **Motion honors `prefers-reduced-motion`** — the water/flow animations are a
  progressive enhancement, never required to understand the page.

**Accessibility**
- **WCAG 2.2 AA**: full keyboard operability, visible focus, semantic landmarks,
  alt text, AA contrast on *both* themes (the bright launch accent on deep navy
  must be verified — see the design brief).

**Discoverability**
- `sitemap.xml`, canonical URLs, Open Graph + Twitter cards with **generated OG
  images**, JSON-LD (`SoftwareApplication`), `/blog/rss.xml`, and an `llms.txt`.

**Privacy**
- **No tracking / no cookies by default.** If analytics are ever wanted, use a
  self-hosted, privacy-first, cookie-free option — consistent with the ethos.

**Content & i18n**
- Blog/changelog via content collections (Phase 2).
- Structure kept **i18n-ready** (routing + content collections) for a possible
  future translation, but ship English first.

---

## 5. Explicitly out of scope

- Pricing, plans, "contact sales", or any commercial surface.
- Testimonials, customer logos, "trusted by", star-count bragging as social proof.
- Duplicating the reference docs (CLI/API/config schemas live in mdBook).
- Account systems, gated downloads, newsletters behind walls. (A simple, optional
  "watch the repo / RSS" is the whole funnel.)
