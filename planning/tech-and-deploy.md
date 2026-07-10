# Tech & deploy

How the site is built and how it reaches boatramp.dev.

> **Stack note.** An earlier draft of this plan proposed Astro. The owner then
> directed: build the real site from Claude Design's handoff, and implement any
> **dynamic parts in Rust/Dioxus (CSR)**. So the implemented stack is
> **hand-authored static HTML/CSS + a Dioxus WASM island**, not Astro. The
> guiding constraint is unchanged: the result must *run on boatramp itself*, so
> everything is static and content-addressed, published with `boatramp sync`.

---

## 1. Shape: a static site + a Dioxus island

boatramp's core job is to serve **static, content-addressed deployments**
atomically. So the site is static HTML/CSS with **zero required JS for content**
(great for SEO, perf, and the "instant, own-your-stack" pitch), and the genuinely
dynamic bits are a **Dioxus client-side island** compiled to WASM, loaded as a
progressive enhancement. If the WASM never loads, the page is still complete and
readable.

```
site/                 hand-authored static source (the design, direction 2a)
  index.html          full page; the terminal is rendered in its final state
  styles/*.css        tokens.css (brand truth) + fonts.css + site.css
  fonts/*.woff2       self-hosted (no CDN)
  install.sh          the real boatramp installer (served at /install.sh, /launch)
crates/island/        Dioxus CSR crate → boatramp_island.js + _bg.wasm
```

**Why not a full Dioxus app / SSR?** A full CSR app would make *content* depend on
WASM (bad for SEO/first paint); SSR would need a Node/Rust runtime, which
contradicts "served by boatramp as static files." The island approach keeps
content static and uses Dioxus exactly where interaction is real.

## 2. The Dioxus island (`crates/island`)

A `cdylib` built with `wasm-pack build --target web`, emitting an ES module the
page imports (`<script type="module">import init from "/island/boatramp_island.js"`).
It mounts into the existing `#terminal` element (Dioxus `Config::rootname`),
replacing the static fallback, and provides:

- the **self-typing quickstart terminal** ending in the atomic **flip-to-live**;
- the **platform tabs** (curl / nix / cargo) that swap the install command;
- the **copy buttons** (hero one-liner + terminal), and
- the **live GitHub star count** (fetched client-side from the GitHub API — real
  votes, per-visitor rate limit, no third-party embed).

All animation honors `prefers-reduced-motion` (renders the final state at once).

## 3. Styling & fonts

- **Design tokens as CSS custom properties** (`site/styles/tokens.css`, straight
  from the handoff) are the single source of brand truth; light/dark are token
  overrides.
- **Self-hosted fonts** under `/fonts/**` (vendored from Fontsource by
  `just fonts`), served `immutable`. No third-party CDNs — the site owns its stack.

## 4. Build → dist/

`scripts/build-site.sh` (wrapped by `just build`):

1. copies `site/` → `dist/`,
2. injects the **real deploy id** (git short SHA) into the dogfood badge,
3. builds the Dioxus island → `dist/island/` (skipped gracefully if `wasm-pack`
   is absent; the static site is still complete).

## 5. Deploy pipeline

Mirrors the docs deploy in the main repo (`deploy-docs.yml`).

```
push to main  →  just build → dist/  →  boatramp sync dist --site www  →  purge Cloudflare
                 (Dioxus + static)       (atomic content-addressed flip)
```

- **`project.cfg`** holds the publish target (`www`), the build command, and
  routing: `clean_urls`, a themed `404`, security headers, `immutable` fonts, and
  the **`/launch → /install.sh` rewrite** that makes the hero one-liner real.
- **Secrets** (activate the workflow, green no-op until set): `BOATRAMP_DEPLOY_TOKEN`
  (publisher token for `www`), `CF_ZONE_ID`, `CF_PURGE_TOKEN`.
- **CI** builds the island + static and lints the Rust on every PR.

## 6. Verified by dogfooding

The site's instructions were checked by actually running boatramp against the
built `dist/` (`boatramp serve` + `boatramp sync dist --site www`, then `curl`):
the page serves, headers apply, `/launch` serves the installer, and the atomic
activation happens as described. The corrections that came out of that pass are in
[`cli-reconciliation.md`](cli-reconciliation.md).

## 7. Nix flake

`flake.nix` imports `github:BoatRamp/BoatRamp` and exposes:

- `devShells.default` — Rust/WASM toolchain (via rust-overlay, honoring
  `rust-toolchain.toml`) + `wasm-pack` + `just` + `node` + **boatramp** itself;
- `devShells.build` — the same minus boatramp, for fast CI builds;
- `packages.boatramp` — `nix run .#boatramp -- serve|sync|…`.

## 8. Hosting — and a dogfood opportunity

Same pattern as docs: a boatramp instance on Fly (scale-to-zero) behind Cloudflare.
boatramp is multi-site, so **one instance can serve both `boatramp.dev` (site
`www`) and `docs.boatramp.dev` (site `docs`)** via virtualhost routing — the
strongest "one binary runs the whole domain" line, and cheapest to run.

## 9. Optional next: dogfood the *edge*

A `/playground` backed by a boatramp **Wasm handler** (e.g. live `boatramp
validate` of a pasted `project.cfg`) would demonstrate boatramp's compute, not
just its static serving. Entirely optional; wire via the `handlers` block in
`project.cfg`.
