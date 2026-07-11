//! boatramp.dev — the dynamic parts, as a Dioxus CSR (client-side) island.
//!
//! The page is a complete, readable static site on its own. This WASM module is
//! a *progressive enhancement* that:
//!   1. replaces the static quickstart terminal (`#terminal`) with an interactive
//!      one — self-typing commands, platform tabs, the atomic "flip to live",
//!   2. wires the hero one-liner copy button, and
//!   3. fills the nav's GitHub "Star" button with the *live* star count fetched
//!      from the GitHub API (real votes — no third-party embed).
//!
//! Everything honors `prefers-reduced-motion` (the terminal renders its final
//! state immediately instead of animating).

use dioxus::prelude::*;
use gloo_events::EventListener;
use gloo_timers::callback::Timeout;
use gloo_timers::future::TimeoutFuture;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn start() {
    // Enhancements attached to static nodes that persist for the page lifetime.
    wire_hero_copy();
    wasm_bindgen_futures::spawn_local(fetch_and_render_stars());

    // Mount the interactive terminal into the existing #terminal element.
    // Dioxus's web renderer *appends* into the root rather than clearing it, so
    // we must empty the static (no-JS) fallback first — otherwise the terminal
    // renders twice (the fallback + the interactive one stacked).
    if let Some(root) = gloo_utils::document().get_element_by_id("terminal") {
        root.set_inner_html("");
    }
    dioxus::LaunchBuilder::new()
        .with_cfg(dioxus_web::Config::new().rootname("terminal"))
        .launch(Terminal);
}

// ---------------------------------------------------------------------------
// Quickstart terminal (Dioxus component)
// ---------------------------------------------------------------------------

#[derive(Clone, Copy, PartialEq)]
enum Tab {
    Curl,
    Nix,
    Cargo,
}

/// The three (command, output) lines shown for a given install method. Only the
/// first line differs per tab; `serve` + `sync` are identical everywhere — the
/// whole point ("one hull, every port"). Commands verified against the real CLI.
fn blocks(tab: Tab) -> [(&'static str, &'static str); 3] {
    let first = match tab {
        Tab::Curl => (
            "curl -sSf boatramp.dev/launch | sh",
            "  ↳ boatramp 0.1.0 → ~/.local/bin",
        ),
        Tab::Nix => (
            "nix profile install github:BoatRamp/BoatRamp",
            "  ↳ boatramp 0.1.0 installed to profile",
        ),
        Tab::Cargo => (
            "cargo install --git https://github.com/BoatRamp/BoatRamp boatramp",
            "  ↳ compiled boatramp 0.1.0 → ~/.cargo/bin",
        ),
    };
    [
        first,
        ("boatramp serve &", "  ↳ listening on http://127.0.0.1:8080"),
        (
            "boatramp sync ./public --site my-site",
            "  ↳ 214 files · sha 7f3a2c1 · streamed, 0 buffered",
        ),
    ]
}

#[component]
fn Terminal() -> Element {
    let reduced = prefers_reduced_motion();
    let tab = use_signal(|| Tab::Curl);

    // Per-line animation state.
    let mut typed = use_signal(|| vec![String::new(), String::new(), String::new()]);
    let mut shown = use_signal(|| vec![false, false, false]);
    let mut active = use_signal(|| -1i32); // which command is currently typing (-1 = none)
    let mut flip = use_signal(|| false);
    let mut run_id = use_signal(|| 0u32); // cancels a stale animation when the tab changes
    let mut copy_label = use_signal(|| "copy");

    // (Re)play the typing animation on mount and whenever the tab changes.
    use_effect(move || {
        let t = tab(); // subscribe to tab changes
        let this = {
            let mut r = run_id.write();
            *r += 1;
            *r
        };
        let b = blocks(t);
        spawn(async move {
            // reset to a blank terminal
            typed.set(vec![String::new(), String::new(), String::new()]);
            shown.set(vec![false, false, false]);
            flip.set(false);
            active.set(-1);

            if reduced {
                // reduced motion: jump straight to the final, fully-typed state
                typed.set(b.iter().map(|x| x.0.to_string()).collect());
                shown.set(vec![true, true, true]);
                flip.set(true);
                return;
            }

            for (i, block) in b.iter().enumerate() {
                if *run_id.peek() != this {
                    return; // superseded by a newer tab selection
                }
                active.set(i as i32);
                let mut cur = String::new();
                for ch in block.0.chars() {
                    if *run_id.peek() != this {
                        return;
                    }
                    cur.push(ch);
                    typed.write()[i] = cur.clone();
                    TimeoutFuture::new(34).await;
                }
                shown.write()[i] = true;
                TimeoutFuture::new(260).await;
            }
            if *run_id.peek() != this {
                return;
            }
            active.set(-1);
            flip.set(true);
        });
    });

    let t = tab();
    let outs = blocks(t);
    let typed_v = typed();
    let shown_v = shown();
    let act = active();

    rsx! {
        div { class: "terminal__bar",
            div { class: "dots", aria_hidden: "true",
                span { class: "dot dot--1" }
                span { class: "dot dot--2" }
                span { class: "dot dot--3" }
            }
            div { class: "tabs", role: "tablist", aria_label: "Install method",
                TabBtn { label: "curl", this: Tab::Curl, tab }
                TabBtn { label: "nix", this: Tab::Nix, tab }
                TabBtn { label: "cargo", this: Tab::Cargo, tab }
            }
            button {
                r#type: "button",
                class: "terminal__copy copy",
                onclick: move |_| {
                    let text = blocks(tab())
                        .iter()
                        .map(|x| x.0)
                        .collect::<Vec<_>>()
                        .join("\n");
                    copy_to_clipboard(&text);
                    copy_label.set("copied ✓");
                    spawn(async move {
                        TimeoutFuture::new(1400).await;
                        copy_label.set("copy");
                    });
                },
                "{copy_label}"
            }
        }
        div { class: "terminal__grid",
            div { class: "terminal__body",
                TermLine { prompt: true, text: typed_v[0].clone(), caret: act == 0 }
                if shown_v[0] {
                    div { class: "term-line term-out", "{outs[0].1}" }
                }
                TermLine { prompt: true, text: typed_v[1].clone(), caret: act == 1 }
                if shown_v[1] {
                    div { class: "term-line term-out", "{outs[1].1}" }
                }
                TermLine { prompt: true, text: typed_v[2].clone(), caret: act == 2 }
                if shown_v[2] {
                    div { class: "term-line term-out", "{outs[2].1}" }
                }
                if flip() {
                    div { class: "flip-badge is-flipping",
                        span { aria_hidden: "true", "▲" }
                        " it's live — my-site · flipped in one atomic beat"
                    }
                }
            }
            div { class: "terminal__notes",
                div { class: "terminal__notes-h", "// what just happened" }
                div { class: "note-row",
                    span { aria_hidden: "true", "›" }
                    " content-addressed build"
                }
                div { class: "note-row",
                    span { aria_hidden: "true", "›" }
                    " 0 bytes buffered in memory"
                }
                div { class: "note-row",
                    span { aria_hidden: "true", "›" }
                    " atomic pointer flip"
                }
                div { class: "note-row",
                    span { aria_hidden: "true", "›" }
                    " prev launch still afloat"
                }
                div { class: "note-roll", "rollback → boatramp rollback" }
            }
        }
    }
}

#[component]
fn TermLine(prompt: bool, text: String, caret: bool) -> Element {
    rsx! {
        div { class: "term-line",
            if prompt {
                span { class: "term-prompt", "$ " }
            }
            "{text}"
            if caret {
                span { class: "term-caret", "▋" }
            }
        }
    }
}

#[component]
fn TabBtn(label: &'static str, this: Tab, tab: Signal<Tab>) -> Element {
    let selected = tab() == this;
    rsx! {
        button {
            r#type: "button",
            class: "tab",
            role: "tab",
            aria_selected: "{selected}",
            onclick: move |_| {
                let mut tab = tab;
                tab.set(this);
            },
            "{label}"
        }
    }
}

// ---------------------------------------------------------------------------
// Plain-DOM enhancements (hero copy button + live star count)
// ---------------------------------------------------------------------------

fn wire_hero_copy() {
    let doc = gloo_utils::document();
    let Some(btn) = doc
        .query_selector("[data-copy-root] [data-copy]")
        .ok()
        .flatten()
    else {
        return;
    };
    let text = doc
        .query_selector("[data-copy-root] [data-copy-text]")
        .ok()
        .flatten()
        .and_then(|el| el.get_attribute("data-copy-text"))
        .unwrap_or_default();

    let reset_target = btn.clone();
    let listener = EventListener::new(&btn, "click", move |_| {
        copy_to_clipboard(&text);
        reset_target.set_text_content(Some("copied ✓"));
        let t = reset_target.clone();
        Timeout::new(1400, move || t.set_text_content(Some("copy"))).forget();
    });
    listener.forget();
}

#[derive(serde::Deserialize)]
struct Repo {
    stargazers_count: u64,
}

/// Fetch the real star count from the GitHub API (client-side, per visitor IP —
/// so the 60/hr unauthenticated limit is per-user and never hits our origin).
async fn fetch_and_render_stars() {
    let Ok(resp) = gloo_net::http::Request::get("https://api.github.com/repos/BoatRamp/BoatRamp")
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
    else {
        return; // offline / rate-limited → the button just shows "Star" with no count
    };
    let Ok(repo) = resp.json::<Repo>().await else {
        return;
    };
    if let Some(el) = gloo_utils::document()
        .query_selector("[data-gh-star-count]")
        .ok()
        .flatten()
    {
        el.set_text_content(Some(&fmt_count(repo.stargazers_count)));
        let _ = el.remove_attribute("hidden");
    }
}

/// 972 → "972", 2431 → "2.4k", 12000 → "12k".
fn fmt_count(n: u64) -> String {
    if n >= 1000 {
        let s = format!("{:.1}", n as f64 / 1000.0);
        format!("{}k", s.strip_suffix(".0").unwrap_or(&s))
    } else {
        n.to_string()
    }
}

fn copy_to_clipboard(text: &str) {
    let _ = gloo_utils::window()
        .navigator()
        .clipboard()
        .write_text(text);
}

fn prefers_reduced_motion() -> bool {
    gloo_utils::window()
        .match_media("(prefers-reduced-motion: reduce)")
        .ok()
        .flatten()
        .map(|m| m.matches())
        .unwrap_or(false)
}
