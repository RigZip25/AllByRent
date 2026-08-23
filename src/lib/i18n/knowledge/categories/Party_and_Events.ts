import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Party & Events — host-facing Q→A only. */
export const facts_Party_and_Events: CategoryFactBlock = {
  title: "Party & event rental FAQ",
  summary: "Short answers for capacity, setup fees, power, weather cancel, and catering sanitize.",
  qa: [
    {
      q: "Is there a setup/teardown fee?",
      a: "Pro AV / stage / lighting often publish one—listed on the agreement at booking.",
    },
    {
      q: "What power info is shown?",
      a: "Amps / circuits on Stage, Sound, Lighting, Photo Booths, and Catering when the host sets them—check before you book.",
    },
    {
      q: "How does weather cancel work?",
      a: "Outdoor canopies/tents and outdoor footprints publish a window (24h / 12h / host discretion) for full refund rules.",
    },
    {
      q: "Do tables and décor need weather cancel?",
      a: "No for indoor soft décor—outdoor footprints still publish a window when required.",
    },
    {
      q: "When is catering sanitize required?",
      a: "Serving Equipment and Catering Equipment rentals require host sanitization attestation before handoff.",
    },
    {
      q: "What does the deposit cover?",
      a: "Stains, tears, missing pieces, and power misuse beyond normal event wear—not a party-insurance product.",
    },
  ],
};

export const categoryKey = "Party & Events" as const;
