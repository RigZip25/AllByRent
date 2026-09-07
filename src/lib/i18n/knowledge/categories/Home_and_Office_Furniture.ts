import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Home & Office Furniture — host-facing Q→A only. */
export const facts_Home_and_Office_Furniture: CategoryFactBlock = {
  title: "Furniture rental FAQ",
  summary: "Short answers for home pieces, office desks, and event seating.",
  qa: [
    {
      q: "What does every furniture listing need?",
      a: "A condition grade, and for desks, tables and shelving also the size/seat band. Photos should show the wear you graded.",
    },
    {
      q: "Assembled or flat-pack?",
      a: "Say it in the description. A renter with a small car plans differently for a built sofa than for a boxed shelf unit.",
    },
    {
      q: "Who moves it?",
      a: "Set delivery and the heavy-item flag in handoff — furniture is the category where a two-person carry is normal.",
    },
    {
      q: "What does the deposit cover?",
      a: "Damage, stains, and missing hardware. It is not a cleaning fee for normal use.",
    },
    {
      q: "Does furniture need a data wipe?",
      a: "No — that gate belongs to shelves with storage, like printers, POS terminals, and servers.",
    },
  ],
};

export const categoryKey = "Home & Office Furniture" as const;
