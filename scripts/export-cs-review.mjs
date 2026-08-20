/**
 * Export EN + current CS strings for native Czech review.
 * Output: docs/i18n/cs-native-review.tsv (+ short README).
 *
 * Columns: flow | key | english | czech_current | czech_native
 * Fill czech_native (or overwrite czech_current) and return the TSV.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Prefer tsx-register if available via dynamic import of .ts
async function loadMessages() {
  try {
    const { register } = await import("tsx/esm/api");
    register();
  } catch {
    // fall through — npx tsx runs this file directly
  }
  const enMod = await import(pathToFileURL(join(root, "src/lib/i18n/messages/en.ts")).href);
  const csMod = await import(pathToFileURL(join(root, "src/lib/i18n/messages/cs.ts")).href);
  return { en: enMod.en, cs: csMod.cs };
}

/** Human flow / screen grouping for translators (not code paths). */
const FLOW_BY_PREFIX = [
  ["tagline", "00 · Brand"],
  ["taglineShort", "00 · Brand"],
  ["modes.", "00 · Brand / mode switch"],
  ["common.", "01 · Shared UI"],
  ["nav.", "01 · Shared UI · bottom nav"],
  ["systemUi.", "01 · Shared UI · system"],
  ["geo.", "01 · Shared UI · location"],
  ["splash.", "02 · Splash"],
  ["onboarding.", "03 · Onboarding"],
  ["auth.", "04 · Sign in / OTP"],
  ["passkey.", "04 · Sign in / passkey"],
  ["signInPrompt.", "04 · Sign in prompt"],
  ["install.", "05 · Install / PWA"],
  ["pwa.", "05 · Install / PWA"],
  ["whereAreYouManual.", "06 · Set your block"],
  ["home.", "07 · Home / browse"],
  ["item.", "08 · Listing detail"],
  ["shelf.", "08 · Listing detail · shelf"],
  ["listing.", "09 · List item wizard"],
  ["listingShare.", "09 · List item · share"],
  ["listingQr.", "09 · List item · QR sticker"],
  ["hostListing.", "10 · Host listing manage"],
  ["addressPicker.", "10 · Address picker"],
  ["garage.", "11 · My Garage"],
  ["garageUi.", "11 · My Garage"],
  ["booking.", "12 · Request booking"],
  ["rentals.", "13 · Rentals list"],
  ["rentalDetail.", "14 · Active rental / handoff"],
  ["rentalCard.", "14 · Active rental / cards"],
  ["rentalStatus.", "14 · Rental status labels"],
  ["qrScan.", "14 · QR scan panel"],
  ["bookingRequest.", "14 · Booking request card"],
  ["rentalPrice.", "14 · Rental pricing"],
  ["paymentsUi.", "15 · Payments / Stripe"],
  ["yardSales.", "16 · Yard & garage sales"],
  ["garageSale.", "16 · Yard & garage sales"],
  ["garageCart.", "16 · Garage cart / checkout"],
  ["garageAuction.", "16 · Garage auction"],
  ["earnBusiness.", "16 · Open my garage (snap sale)"],
  ["mrEvorios.", "17 · Mr. Evorios"],
  ["howItWorks.", "18 · How it works / catalog"],
  ["catalog.", "18 · How it works / catalog"],
  ["profile.", "19 · Profile"],
  ["profileDeep.", "19 · Profile"],
  ["more.", "20 · More menu"],
  ["favorites.", "21 · Favorites"],
  ["messages.", "22 · Messages"],
  ["peerChat.", "22 · Peer chat"],
  ["postRequest.", "23 · Post a request"],
  ["notifications.", "24 · Notifications"],
  ["feedback.", "25 · Feedback"],
  ["reviewPrompt.", "25 · Store review"],
  ["faq.", "26 · FAQ answers"],
];

function flowForKey(key) {
  const bare = key.replace(/\(\)$/, "");
  for (const [prefix, flow] of FLOW_BY_PREFIX) {
    if (bare === prefix || bare.startsWith(prefix) || `${bare}.`.startsWith(prefix)) {
      return flow;
    }
  }
  const top = bare.split(".")[0];
  return `99 · Other · ${top}`;
}

function sampleFn(fn) {
  const attempts = [
    () => fn("{{1}}"),
    () => fn("{{1}}", "{{2}}"),
    () => fn("{{1}}", "{{2}}", "{{3}}"),
    () => fn(1),
    () => fn(1, 2),
    () => fn("{{1}}", 1),
    () => fn("{{name}}"),
    () => fn("{{mascot}}"),
  ];
  for (const a of attempts) {
    try {
      const r = a();
      if (typeof r === "string") return r;
    } catch {
      /* try next */
    }
  }
  return "[function — see code]";
}

function walk(obj, prefix = "", out = []) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    out.push({ key: prefix, kind: "string", en: obj });
    return out;
  }
  if (typeof obj === "function") {
    out.push({ key: `${prefix}()`, kind: "fn", en: sampleFn(obj) });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      walk(obj[k], prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

function getByPath(root, path) {
  const tokens = path.replace(/\(\)$/, "").match(/[^.\[\]]+|\[\d+\]/g) || [];
  let cur = root;
  for (const t of tokens) {
    if (cur == null) return undefined;
    cur = t.startsWith("[") ? cur[Number(t.slice(1, -1))] : cur[t];
  }
  return cur;
}

function tsvEscape(value) {
  const s = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[\t\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const { en, cs } = await loadMessages();
const rows = walk(en).map((r) => {
  const path = r.key.replace(/\(\)$/, "");
  const v = getByPath(cs, path);
  let czech = "";
  if (typeof v === "string") czech = v;
  else if (typeof v === "function") czech = sampleFn(v);
  return {
    flow: flowForKey(r.key),
    key: r.key,
    kind: r.kind,
    english: r.en,
    czech_current: czech,
    czech_native: "",
  };
});

rows.sort((a, b) => a.flow.localeCompare(b.flow) || a.key.localeCompare(b.key));

const outDir = join(root, "docs/i18n");
mkdirSync(outDir, { recursive: true });

const header = ["flow", "key", "kind", "english", "czech_current", "czech_native"];
const tsv = [
  header.join("\t"),
  ...rows.map((r) =>
    [r.flow, r.key, r.kind, r.english, r.czech_current, r.czech_native].map(tsvEscape).join("\t"),
  ),
].join("\n");

const tsvPath = join(outDir, "cs-native-review.tsv");
writeFileSync(tsvPath, tsv, "utf8");

const byFlow = new Map();
for (const r of rows) {
  byFlow.set(r.flow, (byFlow.get(r.flow) || 0) + 1);
}

const readme = `# Czech native review pack

Generated for human (native) Czech translators.

## File

- \`cs-native-review.tsv\` — **${rows.length}** phrases
- Open in Google Sheets / Excel (UTF-8, tab-separated)
- Columns:
  - \`flow\` — screen / product area (translate in this order)
  - \`key\` — **do not change** (used to re-import)
  - \`kind\` — \`string\` or \`fn\` (placeholders like \`{{1}}\` must stay)
  - \`english\` — source of truth
  - \`czech_current\` — today’s app Czech (often literal; reference only)
  - \`czech_native\` — **fill this** with natural Czech

## Placeholders

Keep tokens unchanged: \`{{1}}\`, \`{{2}}\`, \`{{mascot}}\`, \`%\`, currency symbols if present, emoji if intentional.

## Suggested order

1. Brand + shared UI  
2. Onboarding / auth / install  
3. Home + listing detail  
4. List wizard + QR  
5. Garage + booking + rental handoff  
6. Yard sales  
7. Mr. Evorios + FAQ  
8. Rest  

## Counts by flow

${[...byFlow.entries()]
  .map(([flow, n]) => `- ${flow}: ${n}`)
  .join("\n")}

## After translation

Send back the filled TSV (or only rows where \`czech_native\` is non-empty).  
We will merge into \`src/lib/i18n/messages/cs.ts\` (and FAQ / garage sale packs) by \`key\`.
`;

writeFileSync(join(outDir, "README-cs-native-review.md"), readme, "utf8");

console.log(`Wrote ${rows.length} rows → ${tsvPath}`);
for (const [flow, n] of byFlow) console.log(`  ${n}\t${flow}`);
