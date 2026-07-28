// One-shot Discord server setup for the BoatRamp official server.
// Reads the bot token from ../.env (DISCORD_BOT_TOKEN). Idempotent-ish: it clears
// the default channels and builds the leaner + Community structure. Logs ✓/✗ per
// step and never prints the token.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const env = readFileSync(new URL(".env", root), "utf8");
const TOKEN = (env.match(/DISCORD_BOT_TOKEN\s*=\s*(.+)/)?.[1] || "").trim().replace(/^["']|["']$/g, "");
if (!TOKEN) { console.error("no DISCORD_BOT_TOKEN in .env"); process.exit(1); }

const GID = "1531712304104607914";
const API = "https://discord.com/api/v10";
const H = { Authorization: `Bot ${TOKEN}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, path, body, { allowFail = false } = {}) {
  for (;;) {
    const res = await fetch(API + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) { const j = await res.json().catch(() => ({})); await sleep((j.retry_after ?? 1) * 1000 + 150); continue; }
    const txt = await res.text(); let json; try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
    if (!res.ok && !allowFail) console.error(`  ✗ ${method} ${path} → ${res.status} ${JSON.stringify(json).slice(0, 240)}`);
    await sleep(250); // gentle on rate limits
    return { ok: res.ok, status: res.status, json };
  }
}

// ---- permission bits (BigInt) ----
const B = (n) => 1n << BigInt(n);
const P = {
  VIEW: B(10), SEND: B(11), HISTORY: B(16), ADD_REACT: B(6), EMBED: B(14), ATTACH: B(15),
  KICK: B(1), BAN: B(2), MANAGE_CHANNELS: B(4), MANAGE_GUILD: B(5), AUDIT: B(7),
  MANAGE_MSGS: B(13), MENTION_ALL: B(17), MANAGE_NICK: B(27), MANAGE_ROLES: B(28),
  MANAGE_WEBHOOKS: B(29), MANAGE_EVENTS: B(33), MANAGE_THREADS: B(34), PUB_THREADS: B(35),
  SEND_IN_THREADS: B(38), MODERATE: B(40), CONNECT: B(20), SPEAK: B(21),
};
const bit = (...ks) => ks.reduce((a, k) => a | P[k], 0n).toString();
const roColor = 0;

const color = { orange: 0xff6b35, seafoam: 0x35e0c4, tide: 0x2088c1, yellow: 0xffd23f, foam: 0xcfe6ef };

async function main() {
  const me = (await api("GET", "/users/@me")).json;
  console.log(`bot: ${me.username} · guild: ${GID}`);

  // 0) icon + base settings
  const png = readFileSync(new URL("brand/discord-avatar.png", root)).toString("base64");
  await api("PATCH", `/guilds/${GID}`, {
    icon: `data:image/png;base64,${png}`,
    verification_level: 1, default_message_notifications: 1, explicit_content_filter: 2,
  });
  console.log("✓ icon + base settings");

  // 1) wipe default channels
  const existing = (await api("GET", `/guilds/${GID}/channels`)).json || [];
  for (const c of existing) await api("DELETE", `/channels/${c.id}`, null, { allowFail: true });
  console.log(`✓ cleared ${existing.length} default channels`);

  // 2) roles
  const mkRole = async (name, c, perms, hoist = false, mentionable = false) =>
    (await api("POST", `/guilds/${GID}/roles`, { name, color: c, hoist, mentionable, permissions: perms })).json;
  const rMaint = await mkRole("Maintainer", color.orange,
    bit("KICK", "BAN", "MANAGE_CHANNELS", "MANAGE_GUILD", "AUDIT", "MANAGE_MSGS", "MENTION_ALL",
        "MANAGE_NICK", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_EVENTS", "MANAGE_THREADS", "MODERATE",
        "VIEW", "SEND", "HISTORY"), true, true);
  const rContrib = await mkRole("Contributor", color.seafoam, "0", true, true);
  const rCrew = await mkRole("Crew", color.tide, "0", false, false);
  const rFn = await mkRole("Functions", color.yellow, "0");
  const rK8s = await mkRole("Kubernetes", color.foam, "0");
  const rHost = await mkRole("Self-hosting", color.seafoam, "0");
  const rCf = await mkRole("Cloudflare", color.orange, "0");
  console.log("✓ roles: Maintainer, Contributor, Crew + interest roles");

  const roOverwrites = [
    { id: GID, type: 0, deny: bit("SEND", "ADD_REACT", "PUB_THREADS", "SEND_IN_THREADS") },
    { id: rMaint.id, type: 0, allow: bit("SEND", "MANAGE_MSGS", "MENTION_ALL", "PUB_THREADS") },
  ];
  const privateOverwrites = [
    { id: GID, type: 0, deny: bit("VIEW") },
    { id: rMaint.id, type: 0, allow: bit("VIEW", "SEND", "HISTORY") },
  ];

  const mkChan = async (o) => (await api("POST", `/guilds/${GID}/channels`, o)).json;

  // 3) categories
  const cInfo = await mkChan({ name: "📢 information", type: 4, permission_overwrites: roOverwrites });
  const cCommunity = await mkChan({ name: "⚓ community", type: 4 });
  const cDev = await mkChan({ name: "🛠 support & dev", type: 4 });
  const cFeeds = await mkChan({ name: "🔗 feeds", type: 4, permission_overwrites: roOverwrites });
  console.log("✓ categories");

  // 4) rules + mod (needed before enabling Community)
  const rules = await mkChan({ name: "rules", type: 0, parent_id: cInfo.id, topic: "Be excellent to each other. Read before posting.", permission_overwrites: roOverwrites });
  const mod = await mkChan({ name: "mod", type: 0, topic: "Maintainers only. Community-update target.", permission_overwrites: privateOverwrites });

  // 5) enable Community
  const comm = await api("PATCH", `/guilds/${GID}`, {
    features: ["COMMUNITY"], rules_channel_id: rules.id, public_updates_channel_id: mod.id,
    verification_level: 1, explicit_content_filter: 2, default_message_notifications: 1,
  }, { allowFail: true });
  const communityOn = comm.ok;
  console.log(communityOn ? "✓ Community enabled" : `⚠ Community NOT enabled (${comm.status}) — set it in the UI; falling back to text channels`);

  // 6) remaining channels
  const welcome = await mkChan({ name: "welcome", type: 0, parent_id: cInfo.id, topic: "Welcome aboard! What boatramp is and where to start.", permission_overwrites: roOverwrites });
  const announcements = await mkChan({ name: "announcements", type: communityOn ? 5 : 0, parent_id: cInfo.id, topic: "Project announcements.", permission_overwrites: roOverwrites });
  const releases = await mkChan({ name: "releases", type: 0, parent_id: cInfo.id, topic: "New boatramp releases (GitHub feed).", permission_overwrites: roOverwrites });

  const general = await mkChan({ name: "general", type: 0, parent_id: cCommunity.id, topic: "General chat." });
  const intros = await mkChan({ name: "introductions", type: 0, parent_id: cCommunity.id, topic: "Say hi — who you are and what you're building." });
  const showcase = await mkChan({ name: "showcase", type: 0, parent_id: cCommunity.id, topic: "Built something with boatramp? Show it off." });

  const help = await mkChan(communityOn
    ? { name: "help", type: 15, parent_id: cDev.id, topic: "Ask for help — one thread per question." }
    : { name: "help", type: 0, parent_id: cDev.id, topic: "Ask for help." });
  const dev = await mkChan({ name: "dev", type: 0, parent_id: cDev.id, topic: "Developing boatramp itself." });
  const contributing = await mkChan({ name: "contributing", type: 0, parent_id: cDev.id, topic: "Contributing — issues/PRs live at github.com/BoatRamp/BoatRamp." });

  const github = await mkChan({ name: "github", type: 0, parent_id: cFeeds.id, topic: "GitHub activity.", permission_overwrites: roOverwrites });

  const vGeneral = await mkChan({ name: "General", type: 2 });
  const vOffice = await mkChan({ name: "Office Hours", type: 2 });
  console.log("✓ channels built");

  // 7) AutoMod
  const automod = [
    { name: "Mention spam", event_type: 1, trigger_type: 5, trigger_metadata: { mention_total_limit: 6 }, actions: [{ type: 1, metadata: { custom_message: "Please don't mass-mention." } }], enabled: true },
    { name: "Spam", event_type: 1, trigger_type: 3, trigger_metadata: {}, actions: [{ type: 1 }], enabled: true },
    { name: "Profanity & slurs", event_type: 1, trigger_type: 4, trigger_metadata: { presets: [1, 2, 3] }, actions: [{ type: 1 }], enabled: true },
  ];
  for (const r of automod) await api("POST", `/guilds/${GID}/auto-moderation/rules`, r, { allowFail: true });
  console.log("✓ AutoMod rules");

  // 8) Onboarding (Community only) — native self-assign interest roles
  if (communityOn) {
    const ob = await api("PUT", `/guilds/${GID}/onboarding`, {
      enabled: true, mode: 1,
      default_channel_ids: [welcome.id, announcements.id, general.id, intros.id, showcase.id, help.id, dev.id, contributing.id, github.id],
      prompts: [{
        id: "1", type: 0, title: "What are you into?", single_select: false, required: false, in_onboarding: true,
        options: [
          { id: "10", title: "Functions", description: "Wasm functions & workflows", role_ids: [rFn.id], channel_ids: [] },
          { id: "11", title: "Kubernetes", description: "The operator & clusters", role_ids: [rK8s.id], channel_ids: [] },
          { id: "12", title: "Self-hosting", description: "Running boatramp yourself", role_ids: [rHost.id], channel_ids: [] },
          { id: "13", title: "Cloudflare", description: "boatramp on CF Containers", role_ids: [rCf.id], channel_ids: [] },
        ],
      }],
    }, { allowFail: true });
    console.log(ob.ok ? "✓ onboarding (self-assign roles)" : `⚠ onboarding skipped (${ob.status}) — enable in Server Settings → Onboarding`);
  }

  // 9) #github webhook
  const wh = (await api("POST", `/channels/${github.id}/webhooks`, { name: "GitHub" })).json;
  const whUrl = wh?.id ? `https://discord.com/api/webhooks/${wh.id}/${wh.token}` : null;

  // 10) welcome message
  await api("POST", `/channels/${welcome.id}/messages`, {
    content: "# ⚓ Welcome to BoatRamp\n**Launch the web from your own shore.** boatramp is a self-hosted, streaming-first platform for publishing static sites and functions — one Rust binary.\n\n• Site: https://boatramp.dev  ·  Docs: https://docs.boatramp.dev  ·  GitHub: https://github.com/BoatRamp/BoatRamp\n• Pick your interests in onboarding to unlock role pings.\n• Need help? Head to <#" + help.id + ">.",
  }, { allowFail: true });

  console.log("\n=== DONE ===");
  console.log("Community:", communityOn ? "on" : "OFF (enable in UI)");
  if (whUrl) {
    writeFileSync(new URL("discord-github-webhook.txt", root), whUrl + "\n");
    console.log("GitHub webhook URL → discord-github-webhook.txt (append /github, add to GitHub repo webhooks)");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
