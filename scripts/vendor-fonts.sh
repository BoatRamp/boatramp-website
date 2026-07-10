#!/usr/bin/env bash
# Vendor self-hosted fonts (woff2, latin subset) from Fontsource into site/fonts.
# No Google CDN, per the brief. Idempotent; safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="site/fonts"
mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "▸ fetching Fontsource packages into $TMP"
( cd "$TMP" && npm init -y >/dev/null 2>&1 && \
  npm install --silent --no-audit --no-fund \
    @fontsource/space-grotesk @fontsource/ibm-plex-sans @fontsource/jetbrains-mono )

copy() { # copy <pkg> <weight> <dest-name>
  local src="$TMP/node_modules/@fontsource/$1/files/$1-latin-$2-normal.woff2"
  if [ -f "$src" ]; then cp "$src" "$OUT/$3"; echo "  ✓ $3"; else echo "  ✗ missing $src" >&2; fi
}

copy space-grotesk 600 space-grotesk-600.woff2
copy space-grotesk 700 space-grotesk-700.woff2
copy ibm-plex-sans 400 ibm-plex-sans-400.woff2
copy ibm-plex-sans 500 ibm-plex-sans-500.woff2
copy ibm-plex-sans 600 ibm-plex-sans-600.woff2
copy jetbrains-mono 400 jetbrains-mono-400.woff2
copy jetbrains-mono 500 jetbrains-mono-500.woff2
copy jetbrains-mono 700 jetbrains-mono-700.woff2

echo "✓ fonts vendored into $OUT"
