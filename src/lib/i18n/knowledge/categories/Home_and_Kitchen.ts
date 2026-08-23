import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Home & Kitchen — host-facing Q→A only. */
export const facts_Home_and_Kitchen: CategoryFactBlock = {
  title: "Home & kitchen rental FAQ",
  summary: "Short answers for appliances and commercial brew systems.",
  qa: [
    {
      q: "Do everyday appliances need special fields?",
      a: "No—neighbor + deposit, plus capacity and return-clean notes.",
    },
    {
      q: "What do commercial coffee systems need?",
      a: "Voltage, NSF listing status, and install/hookup (plumbing or hardwire) on the listing.",
    },
    {
      q: "Why does voltage matter?",
      a: "Wrong voltage or missing water hookup fails the event—facts go on the rental agreement.",
    },
    {
      q: "What does the deposit cover?",
      a: "Damage and missing accessories.",
    },
    {
      q: "Is NSF certification from Evorios?",
      a: "No—the host declares NSF status; we do not certify.",
    },
  ],
};

export const categoryKey = "Home & Kitchen" as const;
