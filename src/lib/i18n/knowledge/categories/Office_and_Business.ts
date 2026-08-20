import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Office & Business */
export const facts_Office_and_Business: CategoryFactBlock = {
          title: "Office & business rental FAQ",
          summary: "Short answers for furniture vs devices with storage, wipe plans, and deposit claims.",
          qa: [
            {
              q: "Do desks need a data wipe?",
              a: "No\u2014furniture stays neighbor + deposit. Devices that store jobs or accounts freeze storage status and a wipe plan.",
            },
            {
              q: "When is a wipe required?",
              a: "When the listing marks onboard storage\u2014especially POS, servers, copiers, and printers with jobs. Host wipe status + renter wipe ack at booking.",
            },
            {
              q: "Who handles cyber insurance?",
              a: "Neither party gets platform cyber cover\u2014wipe attestation is the privacy layer.",
            },
            {
              q: "What does the deposit cover?",
              a: "Physical damage and missing trays, cables, stands, or readers against the frozen kit list.",
            },
            {
              q: "What if data is left on the device?",
              a: "Follow the published wipe status and booking acknowledgment\u2014Evorios does not certify data erasure.",
            },
          ],
        };

export const categoryKey = "Office & Business" as const;
