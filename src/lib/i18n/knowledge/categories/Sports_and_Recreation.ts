import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Sports & Recreation */
export const facts_Sports_and_Recreation: CategoryFactBlock = {
          title: "Sports & recreation rental FAQ",
          summary: "Short answers for snow/water waivers, PFD, DIN/helmet, kit inventory, and deposit claims.",
          qa: [
            {
              q: "What is required on Sports rentals?",
              a: "Size/length and skill on every listing. Snow freezes form, DIN, helmet, and waiver. Water/pro water freeze craft class, PFD, and waiver. Other shelves freeze a sport-specific type field.",
            },
            {
              q: "When is a waiver required?",
              a: "Snow Sports, Water Sports, and Pro Water Sports publish a liability waiver field.",
            },
            {
              q: "Is a PFD included on water gear?",
              a: "The listing freezes included, renter provides, or N/A \u2014 do not assume a life jacket ships.",
            },
            {
              q: "What does the deposit cover?",
              a: "Broken gear and missing kit pieces against the frozen inventory \u2014 not injury or trip insurance.",
            },
            {
              q: "What is not included?",
              a: "No resort lesson affiliate, no guide service, and no medical cover from Evorios.",
            },
          ],
        };

export const categoryKey = "Sports & Recreation" as const;
