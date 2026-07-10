# boatramp.dev — task runner. Run `just` for the list.
# Inside `nix develop`, boatramp + the Rust/WASM toolchain are on PATH.

set shell := ["bash", "-uc"]

# list tasks
default:
    @just --list

# vendor self-hosted fonts (woff2) from Fontsource into site/fonts
fonts:
    bash scripts/vendor-fonts.sh

# full build → dist/ (static site + Dioxus WASM island + injected deploy id)
build:
    @[ -f site/fonts/space-grotesk-700.woff2 ] || just fonts
    bash scripts/build-site.sh

# build without the WASM island (static only — still fully functional)
build-static:
    bash scripts/build-site.sh --no-island

# build just the Dioxus island → dist/island
island:
    cargo build --release --target wasm32-unknown-unknown -p boatramp-island
    wasm-bindgen target/wasm32-unknown-unknown/release/boatramp_island.wasm \
        --target web --out-dir dist/island --out-name boatramp_island --no-typescript
    wasm-opt -Os dist/island/boatramp_island_bg.wasm -o dist/island/boatramp_island_bg.wasm

# serve the built site locally with boatramp (the real thing)
dev: build
    boatramp serve --addr 127.0.0.1:8787 &
    sleep 1
    boatramp sync dist --server http://127.0.0.1:8787 --site www -m "local dev"
    @echo "→ http://127.0.0.1:8787  (default site: www)"

# publish to the live boatramp.dev instance (needs BOATRAMP_TOKEN)
deploy: build
    boatramp sync dist --server https://boatramp.dev --site www -m "${GITHUB_SHA:-manual}"

# type-check / lint the Rust island (built for the browser target)
check:
    cargo fmt --all --check
    cargo clippy --target wasm32-unknown-unknown -- -D warnings

# parse-check the routing config
validate:
    boatramp validate
