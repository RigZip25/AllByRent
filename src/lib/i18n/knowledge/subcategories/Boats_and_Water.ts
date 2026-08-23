import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Boats & Water — host-facing Q→A only. */
export const subs_Boats_and_Water: Record<string, CategoryFactBlock> = {
  "Kayaks & Canoes": {
    title: "Kayaks & canoes tips",
    summary: "Length, capacity, motor, and PFD policy list for paddle craft.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length band, people capacity, motor included, PFD policy, and insurance bands.",
      },
      {
        q: "Is a hull ID required?",
        a: "Not for non-motor kayaks — HIN is required when motor is yes or electric_only.",
      },
      {
        q: "PFD?",
        a: "Listing lists included, renter provides, or not required — do not assume life jackets ship.",
      },
      {
        q: "Deposit?",
        a: "Covers hull/gear damage and missing PFDs against the listing — not trip insurance.",
      },
    ],
  },
  "SUP Boards": {
    title: "SUP boards tips",
    summary: "Length, capacity, and PFD policy for stand-up paddle boards.",
    qa: [
      {
        q: "What should I list?",
        a: "Length band, capacity, motor included, PFD policy, and insurance bands.",
      },
      {
        q: "Hull ID?",
        a: "Not required for non-motor SUPs — required if a motor is included.",
      },
      {
        q: "Deposit?",
        a: "Covers board/fin damage and missing PFDs — not lesson insurance.",
      },
    ],
  },
  "Fishing Boats": {
    title: "Fishing boats tips",
    summary: "Powered fishing craft list HIN, USCG kit, and insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG-style safety kit, and insurance bands.",
      },
      {
        q: "Is a hull ID required?",
        a: "Yes on Fishing Boats — enter HIN / CIN / local reg before rent publish.",
      },
      {
        q: "Photos?",
        a: "Hull walkaround (bow, stern, port, starboard, deck) before start and on return.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not a fishing-trip insurance product.",
      },
    ],
  },
  "Inflatable Boats": {
    title: "Inflatables tips",
    summary: "PFD for non-motor; HIN when motorized.",
    qa: [
      {
        q: "Hull ID?",
        a: "Required when motor is yes or electric_only; optional for non-motor inflatables.",
      },
      {
        q: "PFD?",
        a: "Non-motor inflatables list PFD included / renter provides / not required.",
      },
      {
        q: "Deposit?",
        a: "Covers puncture/gear damage and missing PFDs.",
      },
    ],
  },
  "Jet Skis": {
    title: "Jet Skis tips",
    summary: "Powered PWC list HIN, USCG kit, age/license rules, and insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG-style kit, and insurance bands.",
      },
      {
        q: "Age / license?",
        a: "Bareboat guests follow age 25 + boater/PWC credential when required by local law and the listing.",
      },
      {
        q: "Photos?",
        a: "Hull walkaround before start and matching return photos.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not PWC insurance from Evorios.",
      },
    ],
  },
  Motorboats: {
    title: "Motorboats tips",
    summary: "HIN, USCG kit, captain vs bareboat, and insurance list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG kit, captain mode, and insurance bands.",
      },
      {
        q: "Bareboat vs captain?",
        a: "Bareboat: age/license details apply. Captain included: guest age 18 and no renter license check.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band on the listing.",
      },
    ],
  },
  "Pontoon Boats": {
    title: "Pontoons tips",
    summary: "Same powered requirements as motorboats for pontoon decks.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG kit, captain mode, and insurance.",
      },
      {
        q: "Captain included?",
        a: "When captain_included, guest age 18 applies and renter license check is off.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not party-boat insurance.",
      },
    ],
  },
  "Commercial Fishing": {
    title: "Commercial fishing tips",
    summary: "Powered commercial fishing craft list HIN, USCG kit, and insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG-style kit, and insurance bands.",
      },
      {
        q: "Commercial use?",
        a: "Publish true capacity and safety kit status — deposit is not catch or gear insurance.",
      },
      {
        q: "Photos?",
        a: "Hull walkaround before start and on return.",
      },
    ],
  },
  "Dive Boats": {
    title: "Dive boats tips",
    summary: "Powered dive support craft list HIN, USCG kit, and insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG kit, and insurance bands.",
      },
      {
        q: "Dive gear included?",
        a: "Only what the listing inventory says — tanks/regs are not assumed.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not dive-accident insurance.",
      },
    ],
  },
  "Charter Vessels": {
    title: "Charter vessels tips",
    summary: "Captain mode, HIN, USCG kit, and insurance for charter trips.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Length, capacity, motor, HIN, USCG kit, captain mode, and insurance.",
      },
      {
        q: "Do I need a license?",
        a: "Captain included: guest age 18, no renter license check. Bareboat: age 25 + credential when required.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band on the listing.",
      },
    ],
  },
  Other: {
    title: "Other watercraft tips",
    summary: "Prefer Kayak, SUP, Fishing, Inflatable, Jet Ski, Motorboat, Pontoon, Dive, or Charter.",
    qa: [
      {
        q: "Should I use Other?",
        a: "move to a named category whenever a named Boats shelf fits so HIN, PFD, or captain details apply.",
      },
      {
        q: "What still applies?",
        a: "Length, capacity, motor, insurance bands, and boats Other Kind still list on rent.",
      },
      {
        q: "Hull ID?",
        a: "Required when the craft is powered (motor yes / electric_only) or listed on a powered shelf.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not trip insurance.",
      },
    ],
  },
};

export const parentCategoryKey = "Boats & Water" as const;
