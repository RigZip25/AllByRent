import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Boats & Water — host-facing Q→A only. */
export const facts_Boats_and_Water: CategoryFactBlock = {
  title: "Boats & watercraft rental FAQ",
  summary: "Short answers for powered craft, paddle craft, and captained trips.",
  qa: [
    {
      q: "Do I need a hull ID?",
      a: "Yes for powered craft (HIN, CIN/CE, or local reg). Non-motor kayak, SUP, and inflatable skip that mandate.",
    },
    {
      q: "What age / license applies?",
      a: "Bareboat: age 25 + boater/PWC credential when required. Captain included: guest age 18 and no renter license check.",
    },
    {
      q: "What safety gear is required?",
      a: "Powered: USCG-style (or local) kit. Paddle / non-motor inflatable: PFD policy acknowledgment.",
    },
    {
      q: "What photos are required?",
      a: "Hull walkaround (bow, stern, port, starboard, deck) before start and on return.",
    },
    {
      q: "Is insurance required?",
      a: "Yes—proof before handoff. Deposit matches the deductible band.",
    },
  ],
};

export const categoryKey = "Boats & Water" as const;
