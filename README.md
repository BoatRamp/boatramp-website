<div align="center">

# boatramp.dev

**The marketing website for [boatramp](https://github.com/BoatRamp/BoatRamp) — served by boatramp, with dynamic parts in Rust/Dioxus.**

</div>

This repository holds the source of **boatramp.dev**, the landing site for
boatramp — a self-hosted, streaming-first platform for publishing the web,
shipped as one Rust binary (web server + publishing API + CLI). It's separate
from the reference docs at [docs.boatramp.dev](https://docs.boatramp.dev) (mdBook,
in the main repo); this site links out rather than duplicating them.

The site **dogfoods boatramp end to end**: a small build assembles a static
`dist/`, and `boatramp sync` publishes it as an atomic, content-addressed
deployment to the boatramp instance serving `boatramp.dev`. The homepage runs on
the product it advertises.

## How it's built

- **Static HTML/CSS** for all content — zero required JS, tokens-driven from the
  Claude Design handoff (direction *2a — Depth + Organized*). Fully readable and
  SEO-friendly without any script.
- **A Dioxus CSR island** (`crates/island`, Rust → WASM) for the dynamic parts,
  loaded as a progressive enhancement: the self-typing quickstart terminal with
  the atomic "flip to live", the platform tabs, the copy buttons, and the **live
  GitHub star count** (fetched client-side from the GitHub API — real votes, no
  third-party embed).
- **Self-hosted fonts** (Space Grotesk, IBM Plex Sans, JetBrains Mono) — no CDN.
- **Nix flake** devshell that imports boatramp, so `serve`/`sync`/`rollback` and
  the Rust/WASM toolchain are all on `PATH`.

Every command shown on the site was **verified against the real `boatramp` CLI**
by actually deploying this site with it — see
[`planning/cli-reconciliation.md`](planning/cli-reconciliation.md).

## Develop

```sh
nix develop            # toolchain + boatramp on PATH (or `direnv allow`)
just                   # list tasks
just build             # → dist/  (Dioxus island + static site + injected deploy id)
just dev               # build, then serve dist/ locally with the real boatramp
```

Without Nix: install Rust (with the `wasm32-unknown-unknown` target), `wasm-pack`,
`just`, and Node, then `just build`. The static site still builds and serves even
if the WASM toolchain is absent (`just build-static`) — the island is optional.

## Deploy

Pushing to `main` builds the site and publishes it with `boatramp sync` to
`boatramp.dev` (site `www`), then purges the Cloudflare cache — see
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It's a green no-op
until the deploy secrets are set (`BOATRAMP_DEPLOY_TOKEN`, `CF_ZONE_ID`,
`CF_PURGE_TOKEN`). By hand:

```sh
just build
boatramp sync dist --server https://boatramp.dev --site www
```

## Layout

```
site/            hand-authored static site (index.html, styles/, fonts/, 404, install.sh)
crates/island/   Dioxus CSR island (Rust → WASM): terminal, copy, tabs, star count
scripts/         build-site.sh (assemble dist/) · vendor-fonts.sh
planning/        the plan + the design brief + the CLI-accuracy reconciliation
design_handoff_boatramp_home/   Claude Design's handoff (reference)
project.cfg      boatramp deploy + routing (incl. /launch → /install.sh rewrite)
flake.nix        devshell: boatramp + Rust/WASM toolchain
```

## License

Code is licensed under either of [Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT)
at your option, matching the main boatramp project. Site copy and brand assets are
© Giacomo Cariello. Vendored fonts keep their own upstream licenses (SIL OFL /
Apache-2.0).
