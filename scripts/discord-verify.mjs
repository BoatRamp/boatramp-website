import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const TOKEN = (readFileSync(new URL(".env", root), "utf8").match(/DISCORD_BOT_TOKEN\s*=\s*(.+)/)?.[1] || "").trim().replace(/^["']|["']$/g, "");
const GID = "1531712304104607914", API = "https://discord.com/api/v10";
const H = { Authorization: `Bot ${TOKEN}` };
const g = (p) => fetch(API + p, { headers: H }).then((r) => r.json());
const T = { 0: "#", 2: "🔊", 4: "▸", 5: "📣", 15: "💬" };

const guild = await g(`/guilds/${GID}`);
console.log(`guild: ${guild.name} · icon:${guild.icon ? "set" : "none"} · features: ${guild.features.join(", ") || "none"}`);
const roles = await g(`/guilds/${GID}/roles`);
console.log("roles:", roles.sort((a, b) => b.position - a.position).map((r) => r.name).join(" · "));
const chans = await g(`/guilds/${GID}/channels`);
const cats = chans.filter((c) => c.type === 4).sort((a, b) => a.position - b.position);
const under = (id) => chans.filter((c) => c.parent_id === id && c.type !== 4).sort((a, b) => a.position - b.position);
console.log("channels:");
for (const cat of cats) { console.log(`  ${cat.name}`); for (const c of under(cat.id)) console.log(`     ${T[c.type] || "?"} ${c.name}`); }
const orphans = chans.filter((c) => !c.parent_id && c.type !== 4);
if (orphans.length) console.log("  (no category)", orphans.map((c) => `${T[c.type] || "?"}${c.name}`).join(" "));
const ob = await g(`/guilds/${GID}/onboarding`);
console.log(`onboarding: ${ob.enabled ? "enabled" : "off"} · prompts:`, (ob.prompts || []).map((p) => p.title).join(", "));
const am = await g(`/guilds/${GID}/auto-moderation/rules`);
console.log("automod:", (Array.isArray(am) ? am : []).map((r) => r.name).join(" · "));
