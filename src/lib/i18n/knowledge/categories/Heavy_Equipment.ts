import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Heavy Equipment */
export const facts_Heavy_Equipment: CategoryFactBlock = {
          title: "Heavy equipment rental FAQ",
          summary: "Short answers for forklifts, excavators, cranes, and similar commercial gear.",
          qa: [
            {
              q: "Who can rent this?",
              a: "Professionals by default. DIY is only allowed if the host turns that gate off.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes when the subcategory requires forklift, crane, excavator, or general operator proof—upload before handoff.",
            },
            {
              q: "Is insurance required?",
              a: "Yes—physical damage proof before PIN or keys. The deposit hold matches the published deductible.",
            },
            {
              q: "What inspection is required?",
              a: "Mandatory pre-trip photos both sides must confirm before start; same on return.",
            },
            {
              q: "What does the deposit cover?",
              a: "A deductible-sized card hold—not full replacement. Insurance is primary for damage.",
            },
          ],
        };

export const categoryKey = "Heavy Equipment" as const;
