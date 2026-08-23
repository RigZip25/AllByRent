import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Gym & Fitness — host-facing Q→A only. */
export const facts_Gym_and_Fitness: CategoryFactBlock = {
  title: "Gym & fitness rental FAQ",
  summary: "Short answers for waivers, weight limits, hygiene, and category details.",
  qa: [
    {
      q: "Do I need a waiver?",
      a: "Yes by default on Gym & Fitness rentals—assumption-of-risk / liability waiver at booking unless the host marks not required.",
    },
    {
      q: "Is there a max user weight?",
      a: "On Cardio, Commercial Treadmills, and Weight Machines the host sets a max user weight band—stay within it.",
    },
    {
      q: "What does the deposit cover?",
      a: "Damage and missing pieces. The waiver covers ordinary-use injury risk, not equipment damage.",
    },
    {
      q: "Do mats and bands need the same details as machines?",
      a: "Yoga, bands, and recovery use hygiene and kit details; machines add power, footprint, and max-user weight.",
    },
    {
      q: "Is gym insurance included?",
      a: "No. Deposit + waiver + published shelf specs only—no third-party gym or equipment-insurance promo.",
    },
  ],
};

export const categoryKey = "Gym & Fitness" as const;
