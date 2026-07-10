# CLI reconciliation — design mock vs. real boatramp

The design handoff (`design_handoff_boatramp_home/`) used **placeholder commands**
invented for the mock. Per the instruction to *use the real deployment to verify
the site's instructions are accurate*, every command shown on the site was checked
against the real `boatramp` CLI (`boatramp 0.1.0`, verified by running the binary
and reading the project's own README/packaging). Corrections:

| Where | Mock (design) | Real, verified | Source |
| --- | --- | --- | --- |
| Hero one-liner | `curl -sSf boatramp.dev/launch \| sh` | same URL, made real: the site **hosts the real installer** and routes `/launch → /install.sh` (internal rewrite, 200) | `packaging/install/install.sh` |
| Quickstart 1 | `boatramp init my-harbor` | `boatramp serve` | `boatramp --help` (no `init`) |
| Quickstart 2 | `boatramp build` | `boatramp sync ./public --site my-site` | `boatramp sync --help` |
| Quickstart 3 | `boatramp deploy --to shore` | `curl localhost:8080` (verify it's live) | README quickstart |
| Rollback | `boatramp back` | `boatramp rollback` | `boatramp rollback --help` |
| Spec tag | `br deploy` | `sync` | — |
| Spec tag | `br back` | `rollback` | — |
| Target: Docker | `ghcr.io/boatramp` | `nix build .#container` (no published ghcr image) | README deploy table; `deploy-image.yml` pushes only to the Fly registry |
| Target: Cloudflare | `--to cf.edge` | `boatramp cloudflare` | README |
| Target: Cluster | `--to shore-01..n` | `serve --mode cluster` | README |
| Install tabs | macOS · Linux · Docker | `curl` · `nix` · `cargo` (all documented) | README install section |
| GitHub URL | `github.com/boatramp/boatramp` | `github.com/BoatRamp/BoatRamp` | repo |
| Nav star | `Star 2.4k` | `Star on GitHub` (no fabricated count) | brief §2.4 (no fake social proof) |
| Dogfood badge | `deploy 7f3a2c1 · live 3h ago · 41ms cold start` | real short git SHA injected at build; no fabricated timing | build-time inject |
| Footer license | `MIT licensed` | `MIT OR Apache-2.0` | `LICENSE-*` |

Verified-real command surface used on the site: `boatramp serve`, `boatramp sync
[PATH] --server <url> --site <site> -m <msg>`, `boatramp rollback [--to <id>]`,
`boatramp status`, `boatramp deployments`, `boatramp cloudflare`, `serve --mode
cluster`. Install methods: the hosted `install.sh`, `nix run
github:BoatRamp/BoatRamp -- serve`, `cargo install --git
https://github.com/BoatRamp/BoatRamp boatramp`.

The quickstart terminal deliberately mirrors the project README's own three-step
quickstart (serve → sync → curl), so the headline "Cast off in three commands."
stays literally true.
