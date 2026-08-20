import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Boats & Water */
export const subs_Boats_and_Water: Record<string, CategoryFactBlock> = {
        "Kayaks & Canoes": {
          title: "Kayaks & canoes — PFD + length",
          summary: "Length, capacity, motor, and PFD policy freeze for paddle craft.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length band, people capacity, motor included, PFD policy, and insurance bands.",
            },
            {
              q: "Is a hull ID required?",
              a: "Not for non-motor kayaks — HIN is required when motor is yes or electric_only.",
            },
            {
              q: "PFD?",
              a: "Listing freezes included, renter provides, or not required — do not assume life jackets ship.",
            },
            {
              q: "Deposit?",
              a: "Covers hull/gear damage and missing PFDs against the listing — not trip insurance.",
            },
            {
              q: "Partner promo?",
              a: "No outfitter or paddle-insurance affiliate hard-sell.",
            },
          ],
        },
        "SUP Boards": {
          title: "SUP boards — PFD + length",
          summary: "Length, capacity, and PFD policy for stand-up paddle boards.",
          qa: [
            {
              q: "What must be listed?",
              a: "Length band, capacity, motor included, PFD policy, and insurance bands.",
            },
            {
              q: "Hull ID?",
              a: "Not required for non-motor SUPs — required if a motor is included.",
            },
            {
              q: "Deposit?",
              a: "Covers board/fin damage and missing PFDs — not lesson insurance.",
            },
            {
              q: "Partner promo?",
              a: "No SUP-shop affiliate hard-sell.",
            },
          ],
        },
        "Fishing Boats": {
          title: "Fishing boats — HIN + safety kit",
          summary: "Powered fishing craft freeze HIN, USCG kit, and insurance.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG-style safety kit, and insurance bands.",
            },
            {
              q: "Is a hull ID required?",
              a: "Yes on Fishing Boats — enter HIN / CIN / local reg before rent publish.",
            },
            {
              q: "Photos?",
              a: "Hull walkaround (bow, stern, port, starboard, deck) before start and on return.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not a fishing-trip insurance product.",
            },
            {
              q: "Partner promo?",
              a: "No marina or boat-insurance affiliate hard-sell.",
            },
          ],
        },
        "Inflatable Boats": {
          title: "Inflatables — motor vs paddle",
          summary: "PFD for non-motor; HIN when motorized.",
          qa: [
            {
              q: "Hull ID?",
              a: "Required when motor is yes or electric_only; optional for non-motor inflatables.",
            },
            {
              q: "PFD?",
              a: "Non-motor inflatables freeze PFD included / renter provides / not required.",
            },
            {
              q: "Deposit?",
              a: "Covers puncture/gear damage and missing PFDs.",
            },
            {
              q: "Partner promo?",
              a: "No inflatable-boat retailer affiliate hard-sell.",
            },
          ],
        },
        "Jet Skis": {
          title: "Jet Skis — HIN + safety kit",
          summary: "Powered PWC freeze HIN, USCG kit, age/license rules, and insurance.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG-style kit, and insurance bands.",
            },
            {
              q: "Age / license?",
              a: "Bareboat guests follow age 25 + boater/PWC credential when required by local law and the listing.",
            },
            {
              q: "Photos?",
              a: "Hull walkaround before start and matching return photos.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not PWC insurance from Evorios.",
            },
            {
              q: "Partner promo?",
              a: "No jet-ski rental chain affiliate hard-sell.",
            },
          ],
        },
        Motorboats: {
          title: "Motorboats — captain mode + HIN",
          summary: "HIN, USCG kit, captain vs bareboat, and insurance freeze.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG kit, captain mode, and insurance bands.",
            },
            {
              q: "Bareboat vs captain?",
              a: "Bareboat: age/license gates apply. Captain included: guest age 18 and no renter license gate.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band on the listing.",
            },
            {
              q: "Partner promo?",
              a: "No charter-broker affiliate hard-sell.",
            },
          ],
        },
        "Pontoon Boats": {
          title: "Pontoons — captain mode + HIN",
          summary: "Same powered gates as motorboats for pontoon decks.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG kit, captain mode, and insurance.",
            },
            {
              q: "Captain included?",
              a: "When captain_included, guest age 18 applies and renter license gate is off.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not party-boat insurance.",
            },
            {
              q: "Partner promo?",
              a: "No pontoon dealer affiliate hard-sell.",
            },
          ],
        },
        "Commercial Fishing": {
          title: "Commercial fishing — HIN + kit",
          summary: "Powered commercial fishing craft freeze HIN, USCG kit, and insurance.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG-style kit, and insurance bands.",
            },
            {
              q: "Commercial use?",
              a: "Publish true capacity and safety kit status — deposit is not catch or gear insurance.",
            },
            {
              q: "Photos?",
              a: "Hull walkaround before start and on return.",
            },
            {
              q: "Partner promo?",
              a: "No commercial fishing insurer affiliate hard-sell.",
            },
          ],
        },
        "Dive Boats": {
          title: "Dive boats — HIN + safety kit",
          summary: "Powered dive support craft freeze HIN, USCG kit, and insurance.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG kit, and insurance bands.",
            },
            {
              q: "Dive gear included?",
              a: "Only what the listing inventory says — tanks/regs are not assumed.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not dive-accident insurance.",
            },
            {
              q: "Partner promo?",
              a: "No dive-shop or PADI affiliate hard-sell.",
            },
          ],
        },
        "Charter Vessels": {
          title: "Charter vessels — captain + HIN",
          summary: "Captain mode, HIN, USCG kit, and insurance for charter trips.",
          qa: [
            {
              q: "What gates apply?",
              a: "Length, capacity, motor, HIN, USCG kit, captain mode, and insurance.",
            },
            {
              q: "Do I need a license?",
              a: "Captain included: guest age 18, no renter license gate. Bareboat: age 25 + credential when required.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band on the listing.",
            },
            {
              q: "Partner promo?",
              a: "No charter-marketplace affiliate hard-sell.",
            },
          ],
        },
        Other: {
          title: "Other watercraft — pick a named shelf first",
          summary: "Prefer Kayak, SUP, Fishing, Inflatable, Jet Ski, Motorboat, Pontoon, Dive, or Charter.",
          qa: [
            {
              q: "Should I use Other?",
              a: "Re-shelf whenever a named Boats shelf fits so HIN, PFD, or captain gates apply.",
            },
            {
              q: "What still applies?",
              a: "Length, capacity, motor, insurance bands, and boatsOtherKind still freeze on rent.",
            },
            {
              q: "Hull ID?",
              a: "Required when the craft is powered (motor yes / electric_only) or listed on a powered shelf.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not trip insurance.",
            },
            {
              q: "Partner promo?",
              a: "No marina affiliate hard-sell.",
            },
          ],
        },
      };

export const parentCategoryKey = "Boats & Water" as const;
