import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Sports & Recreation — host-facing Q→A only. */
export const facts_Sports_and_Recreation: CategoryFactBlock = {
  title: "Sports & recreation rental FAQ",
  summary: "Short answers for snow/water waivers, PFD, DIN/helmet, kit inventory, and deposit claims.",
  qa: [
    {
      q: "What is required on Sports rentals?",
      a: "Size/length and skill on every listing. Snow lists form, DIN, helmet, and waiver. Water/pro water list craft class, PFD, and waiver. Other shelves list a sport-specific type field.",
    },
    {
      q: "When is a waiver required?",
      a: "Snow Sports, Water Sports, and Pro Water Sports publish a liability waiver field.",
    },
    {
      q: "Is a PFD included on water gear?",
      a: "The listing lists included, renter provides, or N/A — do not assume a life jacket ships.",
    },
    {
      q: "What does the deposit cover?",
      a: "Broken gear and missing kit pieces against the listed inventory — not injury or trip insurance.",
    },
  ],
};

export const categoryKey = "Sports & Recreation" as const;
