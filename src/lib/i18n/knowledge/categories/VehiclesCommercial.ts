import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for VehiclesCommercial — host-facing Q→A only. */
export const facts_VehiclesCommercial: CategoryFactBlock = {
  title: "Commercial transport (≥26,001 lb / semi) FAQ",
  summary: "Short answers for heavy commercial trucks and semis.",
  qa: [
    {
      q: "Do I need a CDL?",
      a: "Yes if GVWR is 26,001 lb or more (or as required by local law).",
    },
    {
      q: "What weight do I enter?",
      a: "GVWR in pounds—not dollar value.",
    },
    {
      q: "How does insurance proof work?",
      a: "The renter’s agent emails proof to the owner address on the listing before PIN or keys unlock.",
    },
    {
      q: "Is physical damage (PD) required?",
      a: "Yes. PD limits follow GVWR (lb); the deposit hold tracks the commercial deductible / PD.",
    },
    {
      q: "What inspection is required?",
      a: "Multi-tire commercial pre-trip (every wheel position) before start; same set on return.",
    },
    {
      q: "Why GPS for the PIN?",
      a: "PIN or lockbox unlocks only at pickup or via vehicle QR—not a forwarded code.",
    },
  ],
};

export const categoryKey = "VehiclesCommercial" as const;
