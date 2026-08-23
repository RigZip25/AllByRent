import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Vehicles — host-facing Q→A only. */
export const facts_Vehicles: CategoryFactBlock = {
  title: "Passenger / light car rental FAQ",
  summary: "Short answers for cars and light trucks under commercial weight.",
  qa: [
    {
      q: "Do I need a CDL?",
      a: "No for light passenger cars under 26,001 lb GVWR, unless local law requires one.",
    },
    {
      q: "What insurance do I need?",
      a: "Valid personal auto covering this car. Upload proof in-app before PIN or keys unlock.",
    },
    {
      q: "How does cancellation work?",
      a: "Cancel ≥24h before start: full refund. Inside 24h: 50% refund.",
    },
    {
      q: "Fuel and late return?",
      a: "Fuel is full-to-full (+$20 if short). Late return: 30 min grace, then $20 + $15/hr by default.",
    },
    {
      q: "Why GPS for the PIN?",
      a: "The PIN opens only at pickup (or via the car QR)—not a forwarded code.",
    },
    {
      q: "What photos are required?",
      a: "Pre-trip body + four tires before start; matching return photos before close.",
    },
  ],
};

export const categoryKey = "Vehicles" as const;
