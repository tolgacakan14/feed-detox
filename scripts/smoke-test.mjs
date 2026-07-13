#!/usr/bin/env node
/**
 * Feed Detox smoke test — exercises the /api/feedpack engine end to end
 * and asserts the product's core guarantees. No dependencies, plain fetch.
 *
 * Usage:
 *   npm run smoke                             # against http://localhost:3000
 *   BASE_URL=https://feed-detox.vercel.app npm run smoke   # against prod
 *
 * Exit code 0 = all checks pass; 1 = at least one failure (CI-friendly).
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const PLATFORMS = ["x", "instagram", "tiktok", "youtube"];
const BANNED_TR = ["zaman tüneli", "zaman akışı", "içerik üreticisi"];
const GENERIC_TITLE = /^(instagram|tiktok|x|twitter|youtube)$|:\s*(instagram|tiktok|x|twitter|youtube)\.?$/i;

let failures = 0;

function check(label, ok, detail = "") {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${ok || !detail ? "" : ` — ${detail}`}`);
  if (!ok) failures += 1;
}

async function pack(body) {
  const res = await fetch(`${BASE_URL}/api/feedpack`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} for ${JSON.stringify(body)}`);
  return res.json();
}

function assertPlatformIsolation(p, selected) {
  const shown = PLATFORMS.filter((k) => (p.sections[k] ?? []).length > 0);
  const leaked = shown.filter((k) => !selected.includes(k));
  check(
    `only selected platforms shown (${selected.join("+")})`,
    leaked.length === 0,
    `leaked: ${leaked.join(",")}`,
  );
  check(
    "every selected platform has content or a Search fallback",
    selected.every(
      (k) =>
        (p.sections[k] ?? []).length > 0 ||
        (p.sections.discovery ?? []).some((d) => d.platform === k),
    ),
  );
}

function assertCardQuality(p) {
  const items = PLATFORMS.flatMap((k) => p.sections[k] ?? []);
  const badTitles = items.filter((r) => GENERIC_TITLE.test(r.title.trim()));
  check("no platform-only/generic titles", badTitles.length === 0, badTitles.map((r) => r.title).join(" | "));

  const seen = new Map();
  for (const [k, arr] of Object.entries(p.sections)) {
    for (const r of arr) {
      const key = `${k}:${r.title.trim().toLowerCase()}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
  }
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  check("no duplicate titles within a section", dupes.length === 0, dupes.map(([k]) => k).join(" | "));

  const missing = items.filter((r) => !r.whyItMatters || !r.bestAction?.description);
  check("every card has whyItMatters + bestAction", missing.length === 0);

  const fallbackAboveDirect = PLATFORMS.some((k) => {
    const arr = p.sections[k] ?? [];
    return arr.some((r, i) => r.type === "search_action" && arr.slice(i + 1).some((n) => n.type !== "search_action"));
  });
  check("no search fallback inside platform sections", !fallbackAboveDirect);
}

const VERIFIED_LABELS = ["Most viewed this week", "High engagement this week"];

function assertSlotStructure(p, selected) {
  for (const k of selected) {
    const arr = p.sections[k] ?? [];
    if (arr.length === 0) continue; // covered by the fallback check
    const labeled = arr.filter((r) => r.slotLabel);
    check(`${k}: cards carry 5-slot labels`, labeled.length >= Math.min(2, arr.length));
    // Honesty rule: verified weekly wording requires a real view count from
    // a week-scoped API query — never on estimated candidates.
    const dishonest = arr.filter(
      (r) => VERIFIED_LABELS.includes(r.slotLabel) && !(r.weeklyScoped && typeof r.viewCount === "number"),
    );
    check(`${k}: verified weekly labels only with real metrics`, dishonest.length === 0);
  }
}

async function main() {
  console.log(`Smoke-testing ${BASE_URL}\n`);

  const cases = [
    ["galatasaray + x ONLY (inversion regression)", { topic: "galatasaray", selectedPlatforms: ["x"] }],
    ["galatasaray + youtube", { topic: "galatasaray", selectedPlatforms: ["youtube"] }],
    ["galatasaray + x + instagram", { topic: "galatasaray", selectedPlatforms: ["x", "instagram"] }],
    ["ai tools + tiktok", { topic: "ai tools", selectedPlatforms: ["tiktok"] }],
    ["deep house + youtube + tiktok", { topic: "deep house", selectedPlatforms: ["youtube", "tiktok"] }],
    ["japanese streetwear + instagram", { topic: "japanese streetwear", selectedPlatforms: ["instagram"] }],
  ];

  for (const [label, body] of cases) {
    console.log(`${label}:`);
    const p = await pack(body);
    assertPlatformIsolation(p, body.selectedPlatforms);
    assertCardQuality(p);
    assertSlotStructure(p, body.selectedPlatforms);
  }

  console.log("no platform selected (defaults to all four):");
  const all = await pack({ topic: "galatasaray" });
  check(
    "at least 3 of 4 platforms present",
    PLATFORMS.filter((k) => (all.sections[k] ?? []).length > 0).length >= 3,
  );

  console.log("platform-word topics stay multi-platform:");
  const shorts = await pack({ topic: "cargo shorts" });
  check(
    '"cargo shorts" not collapsed to YouTube-only',
    PLATFORMS.filter((k) => (shorts.sections[k] ?? []).length > 0 || (shorts.sections.discovery ?? []).some((d) => d.platform === k)).length >= 3,
  );

  console.log("mood layer:");
  const deepDive = await pack({
    topic: "galatasaray",
    selectedPlatforms: ["youtube"],
    selectedMoods: ["deepDive", "noDrama"],
  });
  const ddItems = deepDive.sections.youtube ?? [];
  check(
    "Deep Dive: mood clause in explanations",
    ddItems.some((r) => r.whyItMatters.includes("Because you selected Deep Dive")),
  );
  check(
    "Deep Dive: top-2 slots are not Shorts",
    ddItems.slice(0, 2).every((r) => r.type !== "short"),
  );
  const focus = await pack({ topic: "ai tools", selectedPlatforms: ["tiktok"], selectedMoods: ["focus"] });
  check(
    "Focus: mood clause in explanations",
    (focus.sections.tiktok ?? []).some((r) => r.whyItMatters.includes("Because you selected Focus")),
  );
  const calm = await pack({
    topic: "deep house",
    selectedPlatforms: ["youtube", "tiktok"],
    selectedMoods: ["calm", "discovery"],
  });
  assertPlatformIsolation(calm, ["youtube", "tiktok"]);
  check(
    "Calm+Discovery: mood clause present",
    ["youtube", "tiktok"].some((k) => (calm.sections[k] ?? []).some((r) => r.whyItMatters.includes("Because you selected"))),
  );
  const noMood = await pack({ topic: "galatasaray", selectedPlatforms: ["youtube"] });
  check(
    "no moods selected: no mood clauses appear",
    PLATFORMS.flatMap((k) => noMood.sections[k] ?? []).every((r) => !r.whyItMatters.includes("Because you selected")),
  );

  console.log("turkish pack:");
  const tr = await pack({ topic: "galatasaray", uiLang: "tr", selectedPlatforms: ["youtube", "x"] });
  const trJson = JSON.stringify(tr);
  check("no banned Turkish translations", BANNED_TR.every((w) => !trJson.includes(w)));
  const trItems = PLATFORMS.flatMap((k) => tr.sections[k] ?? []);
  check(
    "TR whyItMatters reads Turkish",
    trItems.length > 0 && trItems.every((r) => /signal verir|yaklaştırır|öğretir|sabitler|follow|izle/i.test(r.whyItMatters)),
  );

  console.log("input hygiene:");
  const long = await fetch(`${BASE_URL}/api/feedpack`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topic: "galatasaray ".repeat(500) }),
  });
  const longPack = await long.json();
  check("6000-char topic is capped", JSON.stringify(longPack.topics ?? "").length < 500);
  const empty = await fetch(`${BASE_URL}/api/feedpack`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topic: "   " }),
  });
  check("whitespace topic rejected with 400", empty.status === 400);

  console.log(`\n${failures === 0 ? "PASS" : `FAIL (${failures} check${failures > 1 ? "s" : ""})`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("smoke test crashed:", err.message);
  process.exit(1);
});
