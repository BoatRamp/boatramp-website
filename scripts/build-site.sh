#!/usr/bin/env bash
# Assemble the static site into dist/:
#   1. copy the hand-authored static source (site/)
#   2. build the Dioxus WASM island (crates/island) into dist/island/
#   3. inject the real deploy id (git short SHA) into the page
#
# The island is a *progressive enhancement*: if the WASM toolchain is absent the
# build still emits a fully working static site (the page catches the missing
# island import). Pass --no-island to skip the WASM build deliberately.
set -euo pipefail
cd "$(dirname "$0")/.."

DIST="dist"
BUILD_ISLAND=1
[ "${1:-}" = "--no-island" ] && BUILD_ISLAND=0

echo "▸ clean $DIST"
rm -rf "$DIST"
mkdir -p "$DIST"

echo "▸ copy static source"
cp -R site/. "$DIST/"

# --- deploy id: real git short SHA (falls back to a timestamp-free marker) -----
DEPLOY_ID="$(git rev-parse --short HEAD 2>/dev/null || echo dev-local)"
echo "▸ deploy id: $DEPLOY_ID"
# portable in-place sed (GNU + BSD/macOS)
find "$DIST" -name '*.html' -exec sh -c '
  for f; do
    sed "s/>dev-local</>'"$DEPLOY_ID"'</g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  done
' sh {} +

# --- Dioxus WASM island -------------------------------------------------------
# cargo build (wasm32) → wasm-bindgen (--target web ES module) → wasm-opt.
# The wasm-bindgen CLI version is pinned to the crate via nix (flake.nix).
if [ "$BUILD_ISLAND" = "1" ]; then
  if command -v wasm-bindgen >/dev/null 2>&1; then
    echo "▸ build Dioxus island (cargo + wasm-bindgen)"
    cargo build --release --target wasm32-unknown-unknown -p boatramp-island
    mkdir -p "$DIST/island"
    wasm-bindgen target/wasm32-unknown-unknown/release/boatramp_island.wasm \
      --target web --out-dir "$DIST/island" --out-name boatramp_island --no-typescript
    if command -v wasm-opt >/dev/null 2>&1; then
      wasm-opt -Os "$DIST/island/boatramp_island_bg.wasm" -o "$DIST/island/boatramp_island_bg.wasm"
    fi
  else
    echo "▸ wasm-bindgen not found — skipping island (static site still complete)." >&2
  fi
fi

echo "✓ built $DIST ($(find "$DIST" -type f | wc -l | tr -d ' ') files)"
