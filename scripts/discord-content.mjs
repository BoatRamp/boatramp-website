import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const TOKEN = (readFileSync(new URL(".env", root), "utf8").match(/DISCORD_BOT_TOKEN\s*=\s*(.+)/)?.[1] || "").trim().replace(/^["']|["']$/g, "");
const GID = "1531712304104607914", API = "https://discord.com/api/v10";
const H = { Authorization: `Bot ${TOKEN}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(m, p, b, allowFail) {
  for (;;) {
    const r = await fetch(API + p, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined });
    if (r.status === 429) { const j = await r.json().catch(() => ({})); await sleep((j.retry_after ?? 1) * 1000 + 150); continue; }
    const j = await r.json().catch(() => null); if (!r.ok && !allowFail) console.error(`  ✗ ${m} ${p} ${r.status} ${JSON.stringify(j).slice(0,200)}`); await sleep(300); return j;
  }
}
const chans = await api("GET", `/guilds/${GID}/channels`);
const id = (n) => chans.find((c) => c.name === n)?.id;
const C = Object.fromEntries(["welcome","announcements","rules","releases","general","introductions","showcase","help","dev","contributing","mod"].map((n) => [n, id(n)]));
const M = (id) => `<#${id}>`;
const post = async (ch, content, pin) => { const m = await api("POST", `/channels/${ch}/messages`, { content }, true); if (pin && m?.id) await api("PUT", `/channels/${ch}/pins/${m.id}`, null, true); return m; };

// #rules
await post(C.rules, `# ⚓ BoatRamp — Community Rules

Welcome aboard. A few ground rules keep this a friendly, useful place.

**1. Be respectful.** No harassment, hate speech, or personal attacks. Assume good faith.
**2. Stay on topic.** Keep to each channel's purpose (see the channel topics).
**3. No spam or unsolicited self-promotion.** No ads, referral links, member DMs, or crypto/NFT shilling. Cool things you built with boatramp go in ${M(C.showcase)}.
**4. Keep it safe & legal.** No NSFW, piracy, malware, or anything illegal.
**5. Support in the right place.** Ask in the ${M(C.help)} forum — one thread per question, with your version, config, and what you tried. Bugs & feature requests → GitHub Issues.
**6. English, please,** so everyone can follow (a translation alongside is fine).
**7. Never paste secrets** — tokens, keys, connection strings. Report security issues privately via the repo's SECURITY policy, not in public channels.
**8. Follow Discord's** Terms **and** Community Guidelines.

Moderators may remove content or members at their discretion — questions? DM a **@Maintainer**.

boatramp is free and open source (MIT OR Apache-2.0). Build cool things and launch from your own shore. 🚀`, true);

// #announcements
await post(C.announcements, `# 🎉 The BoatRamp Discord is open!

This is the official community for **boatramp** — a self-hosted, streaming-first platform for publishing **static sites and functions**, shipped as one Rust binary. Launch the web from your own shore.

It's **pre-1.0 and moving fast** — come crew it early.

🔗 Website: https://boatramp.dev
📖 Docs: https://docs.boatramp.dev
🐙 GitHub: https://github.com/BoatRamp/BoatRamp

Say hi in ${M(C.introductions)}, pick your interests in onboarding, and ask anything in ${M(C.help)}. Welcome aboard! ⚓`);

// #contributing
await post(C.contributing, `# 🛠 Contributing to boatramp

boatramp is open source (MIT OR Apache-2.0) and contributions are very welcome.

**Start here**
• Code, issues & PRs → https://github.com/BoatRamp/BoatRamp
• Docs → https://docs.boatramp.dev (source in \`docs/\`)
• Good first issues → https://github.com/BoatRamp/BoatRamp/labels/good%20first%20issue

**Dev setup**
• \`nix develop\` (or Rust 1.85+), then \`just build\` / \`just test\` / \`just lint\`.
• It's a cargo workspace behind feature flags; the default build (\`fs\` + \`slatedb\`) is the lean core.

**Before a PR**
• Discuss larger changes in an issue first.
• Keep it green: fmt + clippy + tests.

Bugs & feature ideas → **GitHub Issues** (so they're tracked). Chat internals in ${M(C.dev)}. Thanks for pitching in! ⚓`, true);

// #introductions
await post(C.introductions, `👋 **Introduce yourself!** Tell us:
• who you are / what you do
• what you're building (or hoping to) with boatramp
• how you found the project

No pressure — even a "hi" is great. Welcome aboard! ⚓`, true);

// #showcase
await post(C.showcase, `🚀 **Built something on boatramp?** Share it here — a self-hosted site, a function, a cluster, a slick deploy. Screenshots and links welcome. Show us what you launched from your own shore. ⚓`);

// #dev
await post(C.dev, `🧑‍💻 **Developing boatramp itself** — architecture, internals, and work-in-progress. User-facing help goes in the ${M(C.help)} forum; tracked work lives in GitHub Issues/PRs.`);

// #releases
await post(C.releases, `📦 New **boatramp releases** land here (fed from GitHub once the webhook is wired). Until then: https://github.com/BoatRamp/BoatRamp/releases`);

// #mod
await post(C.mod, `🔒 Maintainers only. Discord posts Community-update messages here; use it for moderation coordination.`);

// #help forum — tags + a starter thread
await api("PATCH", `/channels/${C.help}`, { available_tags: ["functions","kubernetes","self-hosting","domains & tls","deploy","cloudflare","cluster"].map((name) => ({ name })) }, true);
await api("POST", `/channels/${C.help}/threads`, { name: "📌 Read me first — how to ask a good question", message: { content: `Welcome to **#help**! To get unstuck fast, open a **new post** (one per question) and include:

• **What you're trying to do** and what happened instead
• **boatramp version** (\`boatramp --version\`) and how you run it (single node / cluster / k8s / Cloudflare)
• Relevant **config** and the **exact command** + error (redact any secrets!)

Pick a **tag** (functions, kubernetes, self-hosting, …) so the right people see it. Bugs & feature requests belong on GitHub Issues. Thanks! ⚓` } }, true);

// welcome screen (community)
await api("PATCH", `/guilds/${GID}/welcome-screen`, {
  enabled: true,
  description: "Launch the web from your own shore. The community for boatramp — self-hosted, streaming-first web publishing in one Rust binary.",
  welcome_channels: [
    { channel_id: C.introductions, description: "Say hello", emoji_name: "👋" },
    { channel_id: C.help, description: "Get help", emoji_name: "🛟" },
    { channel_id: C.showcase, description: "Show what you built", emoji_name: "🚀" },
    { channel_id: C.contributing, description: "Contribute", emoji_name: "🛠️" },
  ],
}, true);

console.log("✓ content posted (rules, announcement, contributing, intros, showcase, dev, releases, mod), #help forum tags + starter, welcome screen");
