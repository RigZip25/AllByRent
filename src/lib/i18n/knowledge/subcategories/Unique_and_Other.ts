import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Unique & Other — host-facing Q→A only. */
export const subs_Unique_and_Other: Record<string, CategoryFactBlock> = {
  Collectibles: {
    title: "Collectibles tips",
    summary: "Authenticity status, use case, transport, and fragility list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Authenticity status, use case, transport size, and fragility band.",
      },
      {
        q: "Is it real?",
        a: "Host marks documented, unknown, or replica/decorative ok — not an appraisal.",
      },
      {
        q: "Deposit?",
        a: "Covers chips and missing stands — not collectible insurance.",
      },
    ],
  },
  "Art & Sculpture": {
    title: "Art tips",
    summary: "Medium, transport, and fragility list for art rentals.",
    qa: [
      {
        q: "What should I list?",
        a: "Art medium, use case, transport size, and fragility.",
      },
      {
        q: "Wall hanging?",
        a: "Disclose mounts/stands in the listing notes.",
      },
      {
        q: "Deposit?",
        a: "Covers surface damage — not art-market insurance.",
      },
    ],
  },
  "Hobby Equipment": {
    title: "Hobby tips",
    summary: "Hobby class plus kit checklist for multi-piece sets.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Hobby class, use case, transport, fragility, and kit checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers missing pieces against the list.",
      },
      {
        q: "move to a named category?",
        a: "Games that are party kits may fit Party — Unique is one-off hobby gear.",
      },
    ],
  },
  "Unusual Items": {
    title: "Unusual tips",
    summary: "Novelty and experience pieces list unusual class.",
    qa: [
      {
        q: "What should I list?",
        a: "Unusual class, use case, transport, and fragility.",
      },
      {
        q: "How weird is ok?",
        a: "Describe safe use in the listing — no shock-hazard without disclosure.",
      },
      {
        q: "Deposit?",
        a: "Covers damage and missing pieces.",
      },
    ],
  },
  "Seasonal Items": {
    title: "Seasonal tips",
    summary: "Holiday and season gear list seasonal class.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Seasonal class, use case, transport, and fragility.",
      },
      {
        q: "Storage return?",
        a: "Note packing expectations in the listing.",
      },
      {
        q: "Deposit?",
        a: "Covers broken décor and missing lights.",
      },
    ],
  },
  "Specialty Equipment": {
    title: "Specialty tips",
    summary: "Lab/trade specialty lists class and checklist.",
    qa: [
      {
        q: "What should I list?",
        a: "Specialty class, use case, transport, fragility, and kit checklist.",
      },
      {
        q: "Training?",
        a: "Host should note operator skill in the listing.",
      },
      {
        q: "Deposit?",
        a: "Covers missing modules against the list — not professional liability insurance.",
      },
    ],
  },
  "Industrial Oddities": {
    title: "Industrial oddities tips",
    summary: "Machine/fixture oddities list class and handling.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Oddity class, use case, transport, and fragility.",
      },
      {
        q: "Power / install?",
        a: "Disclose power and install needs in notes.",
      },
      {
        q: "Deposit?",
        a: "Covers damage in transit — not worksite liability insurance.",
      },
    ],
  },
  "Professional Props": {
    title: "Props tips",
    summary: "Film/stage/photo props list class and checklist.",
    qa: [
      {
        q: "What should I list?",
        a: "Prop class, use case, transport, fragility, and kit checklist.",
      },
      {
        q: "On-set rules?",
        a: "Note no-food / no-weather rules in the listing.",
      },
      {
        q: "Deposit?",
        a: "Covers scuffs and missing pieces against the list.",
      },
    ],
  },
  "Rare Instruments": {
    title: "Rare instruments tips",
    summary: "Rare instruments list class; prefer Music shelves when standard.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Instrument class, use case, transport, and fragility.",
      },
      {
        q: "Why Unique?",
        a: "Use when the piece is rare/one-off — standard guitars belong in Music.",
      },
      {
        q: "Deposit?",
        a: "Covers case damage and missing bows — not instrument insurance.",
      },
    ],
  },
  "Custom Builds": {
    title: "Custom builds tips",
    summary: "Custom furniture/devices list class and checklist.",
    qa: [
      {
        q: "What should I list?",
        a: "Custom class, use case, transport, fragility, and kit checklist.",
      },
      {
        q: "Maker notes?",
        a: "Disclose tolerances and assembly in the listing.",
      },
      {
        q: "Deposit?",
        a: "Covers finish damage and missing hardware.",
      },
    ],
  },
  Other: {
    title: "Unique other tips",
    summary: "Catch-all still publishes kind and checklist.",
    qa: [
      {
        q: "When use Other?",
        a: "Only when no named Unique shelf fits.",
      },
      {
        q: "What should I fill in?",
        a: "uniqueOtherKind, use case, transport, fragility, and checklist.",
      },
      {
        q: "move to a named category?",
        a: "Move to Collectibles, Art, Hobby, Unusual, Seasonal, Specialty, Props, Instruments, or Custom when those requirements fit.",
      },
      {
        q: "Deposit?",
        a: "Covers missing pieces against the checklist.",
      },
    ],
  },
};

export const parentCategoryKey = "Unique & Other" as const;
