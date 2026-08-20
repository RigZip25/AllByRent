/**
 * Extra translator pack: categories + SEO search nouns + hardcoded UI
 * (strings not in AppMessages).
 *
 * Same columns as cs-native-review.tsv:
 *   flow | key | kind | english | czech_current | czech_native
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function tsvEscape(value) {
  const s = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[\t\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(flow, key, english, czech_current = "") {
  return {
    flow,
    key,
    kind: "string",
    english,
    czech_current,
    czech_native: "",
  };
}

const { CATEGORIES } = await import(
  pathToFileURL(join(root, "src/screens/listing/listingItemCategories.ts")).href
);
const { CATEGORY_LABELS_CS } = await import(
  pathToFileURL(join(root, "src/lib/i18n/categoryLabels.ts")).href
);

const categoryRows = [];
const seen = new Set();

function addCategoryLabel(en, context) {
  if (!en || seen.has(en)) return;
  seen.add(en);
  categoryRows.push(
    row(
      `27 · Categories · ${context}`,
      `category.${en}`,
      en,
      CATEGORY_LABELS_CS[en] || "",
    ),
  );
}

for (const [catName, data] of Object.entries(CATEGORIES)) {
  addCategoryLabel(catName, "top-level");
  for (const item of data.personal || []) addCategoryLabel(item.label, "subcategory");
  for (const item of data.professional || []) addCategoryLabel(item.label, "subcategory");
}

// Labels present in CS map but not currently in live CATEGORIES
for (const en of Object.keys(CATEGORY_LABELS_CS)) {
  addCategoryLabel(en, "legacy-or-seo");
}

const SEARCH_NOUNS = {
  "Tools & DIY": "tools",
  "Garden & Yard": "garden and yard gear",
  "Home & Kitchen": "home and kitchen items",
  "Baby & Kids": "baby and kids gear",
  "Party & Events": "party and event gear",
  "Sports & Recreation": "sports gear",
  "Outdoor & Camping": "camping and outdoor gear",
  "Electronics & Tech": "electronics",
  "Photo & Video": "cameras and video gear",
  "Bikes & Scooters": "bikes and scooters",
  "Gym & Fitness": "fitness equipment",
  "Music & Audio": "music and audio gear",
  Vehicles: "vehicles",
  "Costume & Cosplay": "costumes",
  "Office & Business": "office equipment",
  Construction: "construction equipment",
  "Heavy Equipment": "heavy equipment",
  "Boats & Water": "boats and watercraft",
  "Real Estate": "spaces",
  "Unique & Other": "unique items",
};

const seoNounRows = Object.entries(SEARCH_NOUNS).map(([cat, noun]) =>
  row("28 · SEO · search nouns", `seo.searchNoun.${cat}`, noun, ""),
);

const seoMetaRows = [
  row(
    "28 · SEO · rent landing meta",
    "seo.meta.title.withPlace",
    "Rent {{noun}} from neighbors in {{place}} | {{app}}",
  ),
  row(
    "28 · SEO · rent landing meta",
    "seo.meta.description.withPlace",
    "Rent {{noun}} from neighbors in {{place}} on {{app}}. Browse local garage storefronts — or be the first to list {{noun}} on your block.",
  ),
  row("28 · SEO · rent landing meta", "seo.meta.h1.withPlace", "Rent {{noun}} in {{place}}"),
  row(
    "28 · SEO · rent landing meta",
    "seo.meta.intro.withPlace",
    "{{app}} connects neighbors so you can borrow {{noun}} nearby instead of buying new. Meetups stay local — usually a short walk or drive on your block.",
  ),
  row(
    "28 · SEO · rent landing meta",
    "seo.meta.title.hub",
    "Rent {{noun}} from neighbors | {{app}}",
  ),
  row(
    "28 · SEO · rent landing meta",
    "seo.meta.description.hub",
    "Rent {{noun}} from neighbors on {{app}}. Find garage storefronts near you — or open yours and be first in your category.",
  ),
  row("28 · SEO · rent landing meta", "seo.meta.h1.hub", "Rent {{noun}} from neighbors"),
  row(
    "28 · SEO · rent landing meta",
    "seo.meta.intro.hub",
    "{{app}} is a neighborhood marketplace: every home is a business cell with a garage storefront. Browse {{noun}} near you, or stock your garage and earn when neighbors need them.",
  ),
];

const hardcodedRows = [
  // Rent landing
  row("29 · Hardcoded · rent landing", "hard.rentLanding.tagline", "Neighborly marketplace · garage storefronts"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.checking", "Checking nearby garages…"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.availableNear", "Available near {{place}}"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.availableNearYou", "Available near you"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.openFullApp", "Open the full app to book →"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.openTerritory", "Open territory"),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.firstGaragePlace",
    "Be the first to open a garage for {{noun}} in {{place}}",
  ),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.firstListBlock",
    "Be the first to list {{noun}} on your block",
  ),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.emptyBody",
    "Nobody has stocked {{noun}}{{inPlace}} on {{app}} yet. That is demand waiting — list what you already own, set a fair daily rate, and neighbors can request pickup from your garage storefront.",
  ),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.bulletPhotos", "Photos + category — takes a few minutes"),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.bulletControl",
    "You control price, availability, and handoff",
  ),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.bulletPayments",
    "Payments stay in-app — no cash meetups for tracked rentals",
  ),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.stockCta", "Stock your garage →"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.lookingToRent", "Looking to rent instead?"),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.openBrowse",
    "Open {{app}} and browse nearby",
  ),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.howTitle", "How neighbor rental works"),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.how1",
    "Browse a category near your block (or open your own garage).",
  ),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.how2",
    "Request dates, pay in-app, and agree on a local meetup.",
  ),
  row(
    "29 · Hardcoded · rent landing",
    "hard.rentLanding.how3",
    "Scan the item QR at pickup and return so both sides stay protected.",
  ),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.allAreas", "All areas"),
  row("29 · Hardcoded · rent landing", "hard.rentLanding.soon", "soon"),

  // Legacy ListItem offer screen
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.title", "List Your Item"),
  row(
    "30 · Hardcoded · list offer (legacy)",
    "hard.listItem.howOffer",
    "How would you like to offer this?",
  ),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.selectOptions", "Select one or more options"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.rent", "RENT"),
  row(
    "30 · Hardcoded · list offer (legacy)",
    "hard.listItem.rentBody",
    "Let others rent for a daily, weekly, or monthly rate",
  ),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.perDay", "Per day"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.perWeek", "Per week"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.perMonth", "Per month"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.sell", "SELL"),
  row(
    "30 · Hardcoded · list offer (legacy)",
    "hard.listItem.sellBody",
    "Offer your item for sale at a fixed or negotiable price",
  ),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.priceNegotiable", "Price is negotiable"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.rentToOwn", "RENT TO OWN"),
  row(
    "30 · Hardcoded · list offer (legacy)",
    "hard.listItem.rentToOwnBody",
    "Monthly payments with ownership transfer",
  ),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.gift", "GIFT"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.giftBody", "Free — no payment"),
  row("30 · Hardcoded · list offer (legacy)", "hard.listItem.publish", "Publish Listing"),
  row(
    "30 · Hardcoded · list offer (legacy)",
    "hard.listItem.shareReason",
    "Share your reason...",
  ),

  // Payments / trust
  row("31 · Hardcoded · payments & trust", "hard.payments.releaseHold", "Release hold"),
  row("31 · Hardcoded · payments & trust", "hard.payments.depositReleased", "Deposit hold released."),
  row(
    "31 · Hardcoded · payments & trust",
    "hard.payments.couldNotRelease",
    "Could not release deposit",
  ),
  row("31 · Hardcoded · payments & trust", "hard.payments.claimDeposit", "Claim deposit"),
  row("31 · Hardcoded · payments & trust", "hard.payments.paymentFailed", "Payment failed"),
  row("31 · Hardcoded · payments & trust", "hard.payments.processing", "Processing…"),
  row("31 · Hardcoded · payments & trust", "hard.payments.payTotal", "Pay {{total}}"),
  row("31 · Hardcoded · payments & trust", "hard.trust.idVerified", "ID Verified ✓"),
  row("31 · Hardcoded · payments & trust", "hard.trust.idVerifiedShort", "ID verified"),
  row("31 · Hardcoded · payments & trust", "hard.trust.phoneVerified", "Phone verified"),
  row("31 · Hardcoded · payments & trust", "hard.profile.takePhoto", "Take profile photo"),
  row("31 · Hardcoded · payments & trust", "hard.profile.yourPhoto", "Your profile photo"),
  row("31 · Hardcoded · payments & trust", "hard.profile.changePhoto", "Change profile photo"),
  row("31 · Hardcoded · payments & trust", "hard.profile.addPhoto", "Add profile photo"),
  row(
    "31 · Hardcoded · payments & trust",
    "hard.profile.cameraAccess",
    "Camera access is needed to take a profile photo.",
  ),

  // Misc leftovers
  row("32 · Hardcoded · misc UI", "hard.wizard.signInPublish", "Sign in to publish your listing."),
  row(
    "32 · Hardcoded · misc UI",
    "hard.wizard.signInFromMore",
    "Sign in from More → Profile, then try again.",
  ),
  row("32 · Hardcoded · misc UI", "hard.messages.rentalChat", "Rental chat"),
  row("32 · Hardcoded · misc UI", "hard.messages.listingChat", "Listing chat"),
  row("32 · Hardcoded · misc UI", "hard.nav.main", "Main navigation"),
  row("32 · Hardcoded · misc UI", "hard.nav.stockItem", "Stock an item"),
  row("32 · Hardcoded · misc UI", "hard.chat.aiOff", "AI chat is off right now."),
  row("32 · Hardcoded · misc UI", "hard.chat.speak", "Speak your question"),
  row("32 · Hardcoded · misc UI", "hard.chat.send", "Send message"),
];

// NAV hints from rentanoLocalAnswer — import and flatten EN answers
const rentano = await import(
  pathToFileURL(join(root, "src/lib/rentanoLocalAnswer.ts")).href
);
const hintRows = [];
const hints = rentano.NAV_HINTS || rentano.navHints || [];
if (Array.isArray(hints)) {
  hints.forEach((h, i) => {
    if (h?.answer) {
      hintRows.push(
        row(
          "33 · Hardcoded · Mr. Evorios local hints",
          `hard.navHint[${i}].answer`,
          h.answer,
          h.answerCs || "",
        ),
      );
    }
  });
} else if (hints && typeof hints === "object") {
  Object.entries(hints).forEach(([id, h]) => {
    if (h?.answer) {
      hintRows.push(
        row(
          "33 · Hardcoded · Mr. Evorios local hints",
          `hard.navHint.${id}.answer`,
          h.answer,
          h.answerCs || "",
        ),
      );
    }
  });
}

const allExtra = [
  ...categoryRows,
  ...seoNounRows,
  ...seoMetaRows,
  ...hardcodedRows,
  ...hintRows,
];

allExtra.sort((a, b) => a.flow.localeCompare(b.flow) || a.key.localeCompare(b.key));

const outDir = join(root, "docs/i18n");
mkdirSync(outDir, { recursive: true });

const header = ["flow", "key", "kind", "english", "czech_current", "czech_native"];
function writeTsv(name, rows) {
  const body = [
    header.join("\t"),
    ...rows.map((r) =>
      [r.flow, r.key, r.kind, r.english, r.czech_current, r.czech_native].map(tsvEscape).join("\t"),
    ),
  ].join("\n");
  const path = join(outDir, name);
  writeFileSync(path, body, "utf8");
  return path;
}

const extraPath = writeTsv("cs-native-review-extra.tsv", allExtra);

// Combined pack for one-sheet translators
const appPath = join(outDir, "cs-native-review.tsv");
let appRows = [];
try {
  const { readFileSync } = await import("node:fs");
  const lines = readFileSync(appPath, "utf8").split("\n").filter(Boolean);
  appRows = lines.slice(1).map((line) => {
    // naive TSV split respecting quotes is hard; for combine, just concatenate files with a note
    return line;
  });
} catch {
  appRows = [];
}

const combined = [
  header.join("\t"),
  ...appRows,
  ...allExtra.map((r) =>
    [r.flow, r.key, r.kind, r.english, r.czech_current, r.czech_native].map(tsvEscape).join("\t"),
  ),
].join("\n");
writeFileSync(join(outDir, "cs-native-review-complete.tsv"), combined, "utf8");

const byFlow = new Map();
for (const r of allExtra) byFlow.set(r.flow, (byFlow.get(r.flow) || 0) + 1);

const readmeExtra = `# Extra strings (categories + hardcoded)

Same columns as \`cs-native-review.tsv\`.

## Files

- \`cs-native-review-extra.tsv\` — **${allExtra.length}** rows (this pack only)
- \`cs-native-review-complete.tsv\` — app messages + this pack (one sheet)

## Counts

${[...byFlow.entries()].map(([f, n]) => `- ${f}: ${n}`).join("\n")}

## Notes

- **Categories:** \`key\` is \`category.<English storage label>\` — English key must stay stable for matching; translate display only into \`czech_native\`.
- **Hardcoded:** after translation we still need a code pass to wire them into i18n (or keep as mapped constants).
- Prefer translating **complete** file if you want one Google Sheet.
`;

writeFileSync(join(outDir, "README-cs-native-extra.md"), readmeExtra, "utf8");

console.log(`categories: ${categoryRows.length}`);
console.log(`seo nouns+meta: ${seoNounRows.length + seoMetaRows.length}`);
console.log(`hardcoded curated: ${hardcodedRows.length}`);
console.log(`nav hints: ${hintRows.length}`);
console.log(`extra total: ${allExtra.length}`);
console.log(`wrote ${extraPath}`);
console.log(`wrote complete → docs/i18n/cs-native-review-complete.tsv`);
