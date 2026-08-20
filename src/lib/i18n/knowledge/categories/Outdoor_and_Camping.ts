import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Outdoor & Camping */
export const facts_Outdoor_and_Camping: CategoryFactBlock = {
          title: "Outdoor & camping rental FAQ",
          summary: "Short answers for waivers, hygiene, and missing parts.",
          qa: [
            {
              q: "When is a waiver required?",
              a: "On expedition / survival shelves at booking.",
            },
            {
              q: "Do tents and sleeping bags need hygiene checks?",
              a: "Yes—host attests cleaned/aired; renter acknowledges the hygiene checklist.",
            },
            {
              q: "What specs should I check?",
              a: "Capacity and season rating on the listing.",
            },
            {
              q: "What does the deposit cover?",
              a: "Poles, fly, stove parts, and other missing or damaged pieces.",
            },
            {
              q: "Is trip insurance included?",
              a: "No. Deposit + waiver/hygiene trail only.",
            },
          ],
        };

export const categoryKey = "Outdoor & Camping" as const;
