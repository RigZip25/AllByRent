import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Garden & Yard */
export const facts_Garden_and_Yard: CategoryFactBlock = {
          title: "Garden & yard rental FAQ",
          summary: "Short answers for yard tools, plants, irrigation, and stump grinders.",
          qa: [
            {
              q: "Do leaf blowers need insurance?",
              a: "No—everyday yard tools use neighbor trust, shelf specs, and a deposit.",
            },
            {
              q: "What do stump grinders require?",
              a: "Capacity, PPE, liability waiver, insurance proof, and a safety briefing before handoff.",
            },
            {
              q: "What plant fields matter?",
              a: "Common name, height, sun, container, health grade, water needs, and a transplant/return policy on rent.",
            },
            {
              q: "What should I photograph?",
              a: "Condition at handoff—blades, bags, batteries, fuel cans, and plant containers often drive disputes.",
            },
            {
              q: "Does Evorios insure yard work?",
              a: "No—renter proof when required and the deposit hold are the layers.",
            },
          ],
        };

export const categoryKey = "Garden & Yard" as const;
