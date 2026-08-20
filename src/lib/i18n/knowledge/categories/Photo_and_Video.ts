import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Photo & Video */
export const facts_Photo_and_Video: CategoryFactBlock = {
          title: "Photo & video rental FAQ",
          summary: "Short answers for kits, drones Remote ID, media, and deposit claims \u2014 no gear-insurance promo.",
          qa: [
            {
              q: "What is required on Photo & Video rentals?",
              a: "Brand, model, kit class, and a kit inventory. Drones also freeze weight class and Remote ID status.",
            },
            {
              q: "Who brings memory cards?",
              a: "Capture-media field freezes included, partial, renter brings, or internal-only.",
            },
            {
              q: "Do drones need Remote ID?",
              a: "Yes unless under-250g exempt \u2014 host marks built-in, add-on, or valid exempt. Mismatch blocks publish.",
            },
            {
              q: "What does the deposit cover?",
              a: "Body damage and missing kit pieces against the frozen list \u2014 not a production insurance policy.",
            },
            {
              q: "Partner promo?",
              a: "No camera-shop affiliate or lens-insurance hard-sell.",
            },
          ],
        };

export const categoryKey = "Photo & Video" as const;
