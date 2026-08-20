import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Unique & Other */
export const subs_Unique_and_Other: Record<string, CategoryFactBlock> = {
        "Collectibles": {
          title: "Collectibles — authenticity + care",
          summary: "Authenticity status, use case, transport, and fragility freeze.",
          qa: [
            {
              q: "What gates apply?",
              a: "Authenticity status, use case, transport size, and fragility band.",
            },
            {
              q: "Is it real?",
              a: "Host marks documented, unknown, or replica/decorative ok — not an appraisal.",
            },
            {
              q: "Deposit?",
              a: "Covers chips and missing stands — not collectible insurance.",
            },
            {
              q: "Partner promo?",
              a: "No auction-house affiliate hard-sell.",
            },
          ],
        },
        "Art & Sculpture": {
          title: "Art — medium + fragile care",
          summary: "Medium, transport, and fragility freeze for art rentals.",
          qa: [
            {
              q: "What must be listed?",
              a: "Art medium, use case, transport size, and fragility.",
            },
            {
              q: "Wall hanging?",
              a: "Disclose mounts/stands in the listing notes.",
            },
            {
              q: "Deposit?",
              a: "Covers surface damage — not art-market insurance.",
            },
            {
              q: "Partner promo?",
              a: "No gallery-insurance affiliate hard-sell.",
            },
          ],
        },
        "Hobby Equipment": {
          title: "Hobby — class + inventory",
          summary: "Hobby class plus kit checklist for multi-piece sets.",
          qa: [
            {
              q: "What gates apply?",
              a: "Hobby class, use case, transport, fragility, and kit checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers missing pieces against the list.",
            },
            {
              q: "Partner promo?",
              a: "No hobby-store affiliate hard-sell.",
            },
            {
              q: "Re-shelf?",
              a: "Games that are party kits may fit Party — Unique is one-off hobby gear.",
            },
          ],
        },
        "Unusual Items": {
          title: "Unusual — class + care",
          summary: "Novelty and experience pieces freeze unusual class.",
          qa: [
            {
              q: "What must be listed?",
              a: "Unusual class, use case, transport, and fragility.",
            },
            {
              q: "How weird is ok?",
              a: "Describe safe use in the listing — no shock-hazard without disclosure.",
            },
            {
              q: "Deposit?",
              a: "Covers damage and missing pieces.",
            },
            {
              q: "Partner promo?",
              a: "No novelty-shop affiliate hard-sell.",
            },
          ],
        },
        "Seasonal Items": {
          title: "Seasonal — class + care",
          summary: "Holiday and season gear freeze seasonal class.",
          qa: [
            {
              q: "What gates apply?",
              a: "Seasonal class, use case, transport, and fragility.",
            },
            {
              q: "Storage return?",
              a: "Note packing expectations in the listing.",
            },
            {
              q: "Deposit?",
              a: "Covers broken décor and missing lights.",
            },
            {
              q: "Partner promo?",
              a: "No holiday-store affiliate hard-sell.",
            },
          ],
        },
        "Specialty Equipment": {
          title: "Specialty — class + inventory",
          summary: "Lab/trade specialty freezes class and checklist.",
          qa: [
            {
              q: "What must be listed?",
              a: "Specialty class, use case, transport, fragility, and kit checklist.",
            },
            {
              q: "Training?",
              a: "Host should note operator skill in the listing.",
            },
            {
              q: "Deposit?",
              a: "Covers missing modules against the list — not professional liability insurance.",
            },
            {
              q: "Partner promo?",
              a: "No specialty-vendor affiliate hard-sell.",
            },
          ],
        },
        "Industrial Oddities": {
          title: "Industrial oddities — class + care",
          summary: "Machine/fixture oddities freeze class and handling.",
          qa: [
            {
              q: "What gates apply?",
              a: "Oddity class, use case, transport, and fragility.",
            },
            {
              q: "Power / install?",
              a: "Disclose power and install needs in notes.",
            },
            {
              q: "Deposit?",
              a: "Covers damage in transit — not worksite liability insurance.",
            },
            {
              q: "Partner promo?",
              a: "No surplus-dealer affiliate hard-sell.",
            },
          ],
        },
        "Professional Props": {
          title: "Props — class + inventory",
          summary: "Film/stage/photo props freeze class and checklist.",
          qa: [
            {
              q: "What must be listed?",
              a: "Prop class, use case, transport, fragility, and kit checklist.",
            },
            {
              q: "On-set rules?",
              a: "Note no-food / no-weather rules in the listing.",
            },
            {
              q: "Deposit?",
              a: "Covers scuffs and missing pieces against the list.",
            },
            {
              q: "Partner promo?",
              a: "No prop-house affiliate hard-sell.",
            },
          ],
        },
        "Rare Instruments": {
          title: "Rare instruments — class + care",
          summary: "Rare instruments freeze class; prefer Music shelves when standard.",
          qa: [
            {
              q: "What gates apply?",
              a: "Instrument class, use case, transport, and fragility.",
            },
            {
              q: "Why Unique?",
              a: "Use when the piece is rare/one-off — standard guitars belong in Music.",
            },
            {
              q: "Deposit?",
              a: "Covers case damage and missing bows — not instrument insurance.",
            },
            {
              q: "Partner promo?",
              a: "No luthier-insurance affiliate hard-sell.",
            },
          ],
        },
        "Custom Builds": {
          title: "Custom builds — class + inventory",
          summary: "Custom furniture/devices freeze class and checklist.",
          qa: [
            {
              q: "What must be listed?",
              a: "Custom class, use case, transport, fragility, and kit checklist.",
            },
            {
              q: "Maker notes?",
              a: "Disclose tolerances and assembly in the listing.",
            },
            {
              q: "Deposit?",
              a: "Covers finish damage and missing hardware.",
            },
            {
              q: "Partner promo?",
              a: "No maker-marketplace affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Unique other — re-shelf when named fits",
          summary: "Catch-all still publishes kind and checklist.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Unique shelf fits.",
            },
            {
              q: "What gates apply?",
              a: "uniqueOtherKind, use case, transport, fragility, and checklist.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Collectibles, Art, Hobby, Unusual, Seasonal, Specialty, Props, Instruments, or Custom when those gates fit.",
            },
            {
              q: "Deposit?",
              a: "Covers missing pieces against the checklist.",
            },
          ],
        },
      };

export const parentCategoryKey = "Unique & Other" as const;
