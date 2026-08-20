#!/usr/bin/env node
/**
 * Fail CI when listing.categorySpecs.options or .fields object literals
 * contain duplicate keys (TS1117 → Vercel `tsc -b` fails).
 *
 * Scans EN / CS / ES message files. Keys must stay globally unique across
 * every category — prefer scoped ids (none_on_site, kind_coffee, …).
 *
 * See docs/CATEGORY_FACT_QA.md and docs/I18N_KNOWLEDGE.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const LOCALES = ["en", "cs", "es"];

/** Extract top-level keys from a `{ ... }` object literal (depth 1 only). */
function extractTopLevelKeys(objectLiteral) {
  const keys = [];
  let depth = 0;
  let inStr = false;
  let quote = "";
  let esc = false;
  let i = 0;

  while (i < objectLiteral.length) {
    const ch = objectLiteral[i];

    if (inStr) {
      if (esc) {
        esc = false;
        i++;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        i++;
        continue;
      }
      if (ch === quote) inStr = false;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = true;
      quote = ch;
      i++;
      continue;
    }

    if (ch === "{" || ch === "[") {
      depth++;
      i++;
      continue;
    }
    if (ch === "}" || ch === "]") {
      depth--;
      i++;
      continue;
    }

    if (depth === 1) {
      const rest = objectLiteral.slice(i);
      const m = rest.match(/^(?:"([^"]+)"|([A-Za-z0-9_]+))\s*:/);
      if (m) {
        keys.push(m[1] || m[2]);
        i += m[0].length;
        continue;
      }
    }

    i++;
  }

  return keys;
}

/** Find `fields:` / `options:` under listing.specs in a messages file. */
function findCategorySpecsMaps(src) {
  // Messages path: listing.specs.{fields,options}
  // (runtime draft field is categorySpecs — docs often say listing.categorySpecs)
  const listingIdx = src.indexOf("\n  listing:");
  if (listingIdx < 0) return null;
  const specsIdx = src.indexOf("specs:", listingIdx);
  if (specsIdx < 0) return null;

  const fieldsMarker = src.indexOf("fields:", specsIdx);
  const optionsMarker = src.indexOf("options:", specsIdx);
  if (fieldsMarker < 0 || optionsMarker < 0) return null;
  // Ensure we stayed inside listing.specs (options comes after fields in EN/CS/ES)
  if (optionsMarker < fieldsMarker) return null;

  function sliceObject(markerIdx) {
    const brace = src.indexOf("{", markerIdx);
    if (brace < 0) return null;
    let depth = 0;
    for (let i = brace; i < src.length; i++) {
      const ch = src[i];
      if (ch === '"' || ch === "'" || ch === "`") {
        // skip strings roughly
        const q = ch;
        i++;
        while (i < src.length) {
          if (src[i] === "\\") {
            i += 2;
            continue;
          }
          if (src[i] === q) break;
          i++;
        }
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return src.slice(brace, i + 1);
      }
    }
    return null;
  }

  return {
    fields: sliceObject(fieldsMarker),
    options: sliceObject(optionsMarker),
  };
}

function findDuplicates(keys) {
  const counts = new Map();
  for (const k of keys) counts.set(k, (counts.get(k) || 0) + 1);
  return [...counts.entries()].filter(([, n]) => n > 1);
}

let failed = false;

for (const locale of LOCALES) {
  const file = path.join(root, `src/lib/i18n/messages/${locale}.ts`);
  if (!fs.existsSync(file)) {
    console.error(`Missing messages file: ${file}`);
    failed = true;
    continue;
  }
  const src = fs.readFileSync(file, "utf8");
  const maps = findCategorySpecsMaps(src);
  if (!maps?.fields || !maps?.options) {
    console.error(
      `[${locale}] Could not locate listing.categorySpecs.fields / options`,
    );
    failed = true;
    continue;
  }

  const fieldKeys = extractTopLevelKeys(maps.fields);
  const optionKeys = extractTopLevelKeys(maps.options);
  const fieldDups = findDuplicates(fieldKeys);
  const optionDups = findDuplicates(optionKeys);

  console.log(
    `[${locale}] fields=${fieldKeys.length} options=${optionKeys.length}`,
  );

  if (fieldDups.length) {
    failed = true;
    console.error(
      `[${locale}] DUPLICATE field-label keys (TS1117 risk):\n` +
        fieldDups.map(([k, n]) => `  - ${k} (×${n})`).join("\n"),
    );
  }
  if (optionDups.length) {
    failed = true;
    console.error(
      `[${locale}] DUPLICATE option keys (TS1117 risk):\n` +
        optionDups.map(([k, n]) => `  - ${k} (×${n})`).join("\n"),
    );
  }
}

if (failed) {
  console.error(
    "\nFix: remove duplicate keys or scope them (e.g. none_on_site, kind_coffee).\nSee docs/CATEGORY_FACT_QA.md § Spec option + field-label keys.",
  );
  process.exit(1);
}

console.log("OK: no duplicate categorySpecs fields/options keys.");
