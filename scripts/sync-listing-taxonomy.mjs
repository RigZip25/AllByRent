/**
 * Mirrors the client listing taxonomy into the server package.
 *
 * The serverless classifier must validate model output against the real
 * taxonomy, but `server/` is a separate package that cannot import from `src/`.
 * This script bundles the client catalog and writes a plain TS data module the
 * server can import. `tests/listingAi/taxonomyMirror.test.ts` fails when the
 * mirror drifts, so regeneration is never optional.
 *
 * Usage: node scripts/sync-listing-taxonomy.mjs [--check]
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const source = join(root, "src/screens/listing/taxonomyCatalog.ts");
const target = join(root, "server/lib/listingAi/taxonomy.generated.ts");
const checkOnly = process.argv.includes("--check");

async function loadCatalog() {
  const dir = mkdtempSync(join(tmpdir(), "taxonomy-"));
  const outfile = join(dir, "catalog.mjs");
  try {
    await build({
      entryPoints: [source],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      logLevel: "silent",
    });
    const mod = await import(pathToFileURL(outfile).href);
    return mod.LISTING_TAXONOMY;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function renderModule(catalog) {
  const entries = catalog.map((category) => ({
    id: category.id,
    name: category.name,
    subcategories: category.subcategories.map((sub) => ({ id: sub.id, label: sub.label })),
  }));

  return `/**
 * GENERATED FILE — do not edit.
 *
 * Mirror of the client listing taxonomy (src/screens/listing/taxonomyCatalog.ts).
 * Regenerate with: npm run taxonomy:sync
 */

export type ServerTaxonomySubcategory = {
  id: string;
  label: string;
};

export type ServerTaxonomyCategory = {
  id: string;
  name: string;
  subcategories: ServerTaxonomySubcategory[];
};

export const SERVER_LISTING_TAXONOMY: ServerTaxonomyCategory[] = ${JSON.stringify(
    entries,
    null,
    2,
  )};
`;
}

const catalog = await loadCatalog();
if (!Array.isArray(catalog) || catalog.length === 0) {
  console.error("Taxonomy catalog is empty — aborting.");
  process.exit(1);
}

const next = renderModule(catalog);
const current = (() => {
  try {
    return readFileSync(target, "utf8");
  } catch {
    return "";
  }
})();

if (checkOnly) {
  if (current !== next) {
    console.error(
      "server/lib/listingAi/taxonomy.generated.ts is out of date. Run: npm run taxonomy:sync",
    );
    process.exit(1);
  }
  console.log("Server taxonomy mirror is up to date.");
  process.exit(0);
}

if (current === next) {
  console.log("Server taxonomy mirror already up to date.");
} else {
  writeFileSync(target, next);
  const subcategories = catalog.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  console.log(
    `Wrote ${target.replace(`${root}/`, "")} (${catalog.length} categories, ${subcategories} subcategories).`,
  );
}
