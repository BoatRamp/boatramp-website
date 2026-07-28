import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const TOKEN = (readFileSync(new URL(".env", root), "utf8").match(/DISCORD_BOT_TOKEN\s*=\s*(.+)/)?.[1] || "").trim().replace(/^["']|["']$/g, "");
const GID = "1531712304104607914", API = "https://discord.com/api/v10";
const H = { Authorization: `Bot ${TOKEN}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(m, p, b) { const r = await fetch(API + p, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); await sleep(250); return r.json().catch(() => null); }

const chans = await api("GET", `/guilds/${GID}/channels`);
const by = (n, t) => chans.find((c) => c.name === n && (t === undefined || c.type === t));

// voice category + move the two voice channels under it
const vcat = await api("POST", `/guilds/${GID}/channels`, { name: "🔊 voice", type: 4 });
for (const [n, pos] of [["General", 0], ["Office Hours", 1]]) {
  const v = by(n, 2); if (v) await api("PATCH", `/channels/${v.id}`, { parent_id: vcat.id, position: pos });
}
// welcome first in information
for (const [n, pos] of [["welcome", 0], ["announcements", 1], ["rules", 2], ["releases", 3]]) {
  const c = by(n, undefined); if (c && c.parent_id) await api("PATCH", `/channels/${c.id}`, { position: pos });
}
console.log("✓ polished: voice category + welcome-first");
