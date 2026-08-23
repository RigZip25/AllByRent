import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Bikes & Scooters — host-facing Q→A only. */
export const facts_Bikes_and_Scooters: CategoryFactBlock = {
  title: "Bikes & scooter rental FAQ",
  summary: "Short answers for helmets, locks, e-power, and kids.",
  qa: [
    {
      q: "Are helmet, lock, and overnight storage required?",
      a: "Yes—hosts must publish all three on rent.",
    },
    {
      q: "What do e-bikes / e-scooters need?",
      a: "Min age + e-bike class when the shelf is E-Bikes or Electric = yes.",
    },
    {
      q: "Is there a waiver for MTB / racing?",
      a: "Yes by default on Mountain and Racing shelves.",
    },
    {
      q: "What about kids bikes?",
      a: "Guardian attestation required; helmet cannot be marked not_required.",
    },
    {
      q: "What do cargo / adaptive need?",
      a: "Cargo: payload + child policy. Adaptive: subtype declared.",
    },
  ],
};

export const categoryKey = "Bikes & Scooters" as const;
