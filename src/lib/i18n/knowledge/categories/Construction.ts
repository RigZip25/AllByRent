import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Construction */
export const facts_Construction: CategoryFactBlock = {
          title: "Construction rental FAQ",
          summary: "Short answers for neighbor job-site gear (not national fleet rental).",
          qa: [
            {
              q: "Is this pros-only?",
              a: "Powered and crane-class shelves require a pro attestation and structured COI. Soft PPE (hard hats, vests) can stay lighter.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes for crane, excavator, and other heavy shelves that ask for it—upload before handoff.",
            },
            {
              q: "How does fuel work?",
              a: "When the host sets a fuel type: return full-to-full.",
            },
            {
              q: "Can I book by the month?",
              a: "Yes—hosts can publish monthly rates for longer jobs.",
            },
            {
              q: "What photos are required?",
              a: "Pre-trip inspection blocks start until both sides confirm; formwork uses a piece checklist on return.",
            },
          ],
        };

export const categoryKey = "Construction" as const;
