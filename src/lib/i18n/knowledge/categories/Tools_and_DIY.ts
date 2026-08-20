import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Tools & DIY */
export const facts_Tools_and_DIY: CategoryFactBlock = {
          title: "Tools & DIY rental FAQ",
          summary: "Short answers for PPE, briefings, and deposits.",
          qa: [
            {
              q: "When is a safety briefing required?",
              a: "Power saws, welders, and scaffolding-like shelves—acknowledge PPE / briefing before handoff.",
            },
            {
              q: "What PPE is expected?",
              a: "Eye, ear, and hand protection; welding PPE when applicable.",
            },
            {
              q: "Do drills need a briefing?",
              a: "Most hand tools stay neighbor + deposit only.",
            },
            {
              q: "What does the deposit cover?",
              a: "Blades, batteries, and accessories that go missing—not full tool replacement insurance.",
            },
            {
              q: "What photos help claims?",
              a: "Handoff condition photos plus the briefing acknowledgment.",
            },
          ],
        };

export const categoryKey = "Tools & DIY" as const;
