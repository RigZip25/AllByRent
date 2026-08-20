import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Unique & Other */
export const facts_Unique_and_Other: CategoryFactBlock = {
          title: "Unique & other rental FAQ",
          summary: "Short answers for use case, fragility, authenticity, kit inventory, and deposit claims.",
          qa: [
            {
              q: "What is required on Unique rentals?",
              a: "Use case, item form, and fragility on every rent listing. Collectibles, art, rare instruments, custom builds, and Other also freeze authenticity. Multi-piece hobby/prop/specialty kits need inventory.",
            },
            {
              q: "Does Evorios authenticate items?",
              a: "No \u2014 authenticity is host disclosure (attested, docs, replica, or unknown).",
            },
            {
              q: "What does the deposit cover?",
              a: "Handling damage beyond the published fragility band and missing kit pieces \u2014 not appraisal insurance.",
            },
            {
              q: "Should I use a named category instead?",
              a: "Yes whenever Music, Costume, Tools, or another shelf fits \u2014 Unique is for true one-offs.",
            },
            {
              q: "What is not included?",
              a: "No auction authentication, no specialty insurance product, no operator labor.",
            },
          ],
        };

export const categoryKey = "Unique & Other" as const;
