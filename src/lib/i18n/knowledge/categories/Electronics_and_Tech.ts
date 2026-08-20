import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Electronics & Tech */
export const facts_Electronics_and_Tech: CategoryFactBlock = {
          title: "Electronics & tech rental FAQ",
          summary: "Short answers for serials, kits, wipe rules, and deposit holds.",
          qa: [
            {
              q: "Is a serial + kit list required?",
              a: "Yes on rent—list chargers, dongles, cases, and remotes.",
            },
            {
              q: "Do storage devices need a wipe?",
              a: "Yes—host wipe/unlink before publish when the device stores data; renter acknowledges wipe at booking.",
            },
            {
              q: "Is there partner insurance?",
              a: "No. Neighbor trust + a deposit hold cover missing parts and damage.",
            },
            {
              q: "What do I check at handoff?",
              a: "Count every kit piece against the listing inventory.",
            },
            {
              q: "What if something is missing?",
              a: "Inventory snapshot + serial support the claim; deposit covers the gap.",
            },
          ],
        };

export const categoryKey = "Electronics & Tech" as const;
