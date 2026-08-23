import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Sports & Recreation — host-facing Q→A only. */
export const subs_Sports_and_Recreation: Record<string, CategoryFactBlock> = {
  "Snow Sports": {
    title: "Snow sports tips",
    summary: "Ski/board form, DIN band, helmet policy, and waiver list before you publish.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Snow gear form, DIN/binding band, helmet policy, size/length, skill, and waiver flag.",
      },
      {
        q: "DIN meaning?",
        a: "Host-published binding band — not a shop certification of your boots.",
      },
      {
        q: "Deposit?",
        a: "Covers broken edges and missing poles — not injury. Waiver covers ordinary-use injury risk.",
      },
    ],
  },
  "Water Sports": {
    title: "Water sports tips",
    summary: "Craft class, PFD policy, and waiver list for boards and paddlesports.",
    qa: [
      {
        q: "What should I list?",
        a: "Water craft class, PFD include, size/length, skill, and waiver flag.",
      },
      {
        q: "Who brings a PFD?",
        a: "PFD field lists included, renter provides, or not applicable.",
      },
      {
        q: "Deposit?",
        a: "Covers hull dings and missing fins — not water-injury insurance.",
      },
    ],
  },
  "Pro Water Sports": {
    title: "Pro water tips",
    summary: "Pro water shelves use the same craft/PFD/waiver requirements with pro-grade kits.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Water craft class, PFD, size/length, skill, and waiver.",
      },
      {
        q: "Pro vs personal?",
        a: "Same safety requirements — disclose pro kit pieces in the checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers missing tow ropes and boards — not event liability insurance.",
      },
    ],
  },
  "Racket Sports": {
    title: "Racket sports tips",
    summary: "Tennis through pickleball list sport type plus size and skill.",
    qa: [
      {
        q: "What should I list?",
        a: "Racket sport type, size/length (grip or length), and skill level.",
      },
      {
        q: "Strings / tension?",
        a: "Note tension or string type in the kit checklist when it matters.",
      },
      {
        q: "Deposit?",
        a: "Covers cracked frames and missing covers — not string warranty.",
      },
    ],
  },
  Skating: {
    title: "Skating tips",
    summary: "Inline, ice, quad, and boards list skate type before you publish.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Skate type, size/length, and skill level.",
      },
      {
        q: "Pads / helmet?",
        a: "Disclose protective gear in the kit checklist — assume not included unless listed.",
      },
      {
        q: "Deposit?",
        a: "Covers broken trucks and missing wheels.",
      },
    ],
  },
  "Fishing Gear": {
    title: "Fishing tips",
    summary: "Rod/reel class plus size and skill list before you publish.",
    qa: [
      {
        q: "What should I list?",
        a: "Rod/gear class, size/length, and skill level.",
      },
      {
        q: "Tackle included?",
        a: "List lure packs and nets in the kit checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers snapped rods and missing reels — not lost-tackle insurance for every lure.",
      },
    ],
  },
  "Competition Gear": {
    title: "Competition tips",
    summary: "Track/field/court class lists competition shelf intent.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Competition sport class, size/length, and skill.",
      },
      {
        q: "Rule legal?",
        a: "Host declares class — renter confirms event rules separately.",
      },
      {
        q: "Deposit?",
        a: "Covers damaged implements and missing weights.",
      },
    ],
  },
  "Coaching Equipment": {
    title: "Coaching tips",
    summary: "Cones, carts, and agility kits list coaching aid type.",
    qa: [
      {
        q: "What should I list?",
        a: "Coaching aid type, size/count notes, and skill.",
      },
      {
        q: "How many pieces?",
        a: "Put counts in the kit checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers missing cones and damaged hurdles.",
      },
    ],
  },
  "Timing Systems": {
    title: "Timing tips",
    summary: "Clocks, chips, and photo-finish list system type.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Timing system type, size/ports notes, and skill.",
      },
      {
        q: "Power / setup?",
        a: "Disclose power and setup in the checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers missing sensors and damaged displays — not race results insurance.",
      },
    ],
  },
  "Team Sports Gear": {
    title: "Team gear tips",
    summary: "Ball kits, goals, and protective sets list kit band and inventory text.",
    qa: [
      {
        q: "What should I list?",
        a: "Team kit band, size/length, skill, and a kit inventory checklist.",
      },
      {
        q: "Why inventory?",
        a: "Team bags lose pieces — list the list before unlock.",
      },
      {
        q: "Deposit?",
        a: "Covers missing balls and torn nets against the list.",
      },
    ],
  },
  Other: {
    title: "Sports other tips",
    summary: "Catch-all still publishes kind and kit inventory.",
    qa: [
      {
        q: "When use Other?",
        a: "Only when no named Sports shelf fits.",
      },
      {
        q: "What should I fill in?",
        a: "sports Other Kind plus kit checklist, size/length, and skill.",
      },
      {
        q: "move to a named category?",
        a: "Move to Snow, Water, Racket, Skating, Fishing, Team, or pro shelves when those requirements fit.",
      },
      {
        q: "Deposit?",
        a: "Covers missing pieces against the checklist.",
      },
    ],
  },
};

export const parentCategoryKey = "Sports & Recreation" as const;
