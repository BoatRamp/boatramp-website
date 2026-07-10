{
  description = "boatramp.dev — the marketing website, built with Dioxus + static HTML and served by boatramp itself";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    # The boatramp CLI/server itself — so the devshell can serve + publish the
    # site with the real thing (dogfooding). Uses its own locked inputs so its
    # build stays reproducible; we don't force `follows`.
    boatramp.url = "github:BoatRamp/BoatRamp";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay, boatramp }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
        };

        # Rust toolchain honoring ./rust-toolchain.toml (includes wasm32 target).
        rust = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;

        boatrampPkg = boatramp.packages.${system}.default;

        # Everything needed to build the site (no boatramp → fast CI builds).
        buildInputs = [
          rust
          pkgs.wasm-bindgen-cli # version pinned to match the crate (see island Cargo.toml)
          pkgs.binaryen # wasm-opt, shrinks the release wasm
          pkgs.just
          pkgs.nodejs_22 # only for `just fonts` (Fontsource vendoring)
          pkgs.gh # GitHub CLI (repo creation, CI/PR management)
        ];
      in
      {
        devShells = {
          # Full shell: toolchain + the real boatramp (serve/sync/rollback).
          default = pkgs.mkShell {
            packages = buildInputs ++ [ boatrampPkg ];
            shellHook = ''
              echo "▟ boatramp.dev — $(boatramp --version 2>/dev/null || echo boatramp) · $(rustc --version)"
              echo "  just build   → dist/     |  just dev → serve locally  |  just deploy"
            '';
          };

          # Lean shell for CI builds: no boatramp, so nix doesn't build it.
          build = pkgs.mkShell {
            packages = buildInputs;
          };
        };

        # `nix run .#boatramp -- serve` etc.
        packages.boatramp = boatrampPkg;

        formatter = pkgs.nixpkgs-fmt;
      });
}
