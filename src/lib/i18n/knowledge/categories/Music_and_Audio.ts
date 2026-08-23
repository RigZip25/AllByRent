import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Music & Audio — host-facing Q→A only. */
export const facts_Music_and_Audio: CategoryFactBlock = {
  title: "Music & audio rental FAQ",
  summary: "Short answers for instruments, PA kits, cables, cases, and deposit claims — no backline insurance promo.",
  qa: [
    {
      q: "What is required on Music & Audio rentals?",
      a: "Brand and model on every listing. Powered shelves list a power class. Multi-piece kits should list cables, stands, and cases. PA Systems require a cable/stand inventory counted at handoff.",
    },
    {
      q: "Do I need a serial number?",
      a: "Yes for Music & Audio rentals — manufacturer serial or equipment ID lists with the listing for handoff and claims.",
    },
    {
      q: "When is a cable / stand inventory required?",
      a: "Always on PA Systems. Other shelves use a recommended kit checklist so missing XLRs, stands, and pedals are claimable.",
    },
    {
      q: "What does the deposit cover?",
      a: "Scuffs, broken hardware, and missing accessories against the listed inventory — not a backline insurance policy or Fat Llama partner plan.",
    },
    {
      q: "Is this Electronics Pro Audio?",
      a: "No. Studio capture under Electronics stays on Pro Audio. Live stacks and instruments stay on Music & Audio shelves.",
    },
  ],
};

export const categoryKey = "Music & Audio" as const;
