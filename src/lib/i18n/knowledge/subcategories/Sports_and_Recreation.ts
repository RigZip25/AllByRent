import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Sports & Recreation */
export const subs_Sports_and_Recreation: Record<string, CategoryFactBlock> = {
        "Snow Sports": {
          title: "Snow sports — form, DIN, helmet",
          summary: "Ski/board form, DIN band, helmet policy, and waiver freeze before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Snow gear form, DIN/binding band, helmet policy, size/length, skill, and waiver flag.",
            },
            {
              q: "DIN meaning?",
              a: "Host-published binding band — not a shop certification of your boots.",
            },
            {
              q: "Deposit?",
              a: "Covers broken edges and missing poles — not injury. Waiver covers ordinary-use injury risk.",
            },
            {
              q: "Partner promo?",
              a: "No ski-shop insurance affiliate hard-sell.",
            },
          ],
        },
        "Water Sports": {
          title: "Water sports — craft, PFD, waiver",
          summary: "Craft class, PFD policy, and waiver freeze for boards and paddlesports.",
          qa: [
            {
              q: "What must be listed?",
              a: "Water craft class, PFD include, size/length, skill, and waiver flag.",
            },
            {
              q: "Who brings a PFD?",
              a: "PFD field freezes included, renter provides, or not applicable.",
            },
            {
              q: "Deposit?",
              a: "Covers hull dings and missing fins — not water-injury insurance.",
            },
            {
              q: "Partner promo?",
              a: "No watersports-insurance affiliate hard-sell.",
            },
          ],
        },
        "Pro Water Sports": {
          title: "Pro water — craft, PFD, waiver",
          summary: "Pro water shelves use the same craft/PFD/waiver gates with pro-grade kits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Water craft class, PFD, size/length, skill, and waiver.",
            },
            {
              q: "Pro vs personal?",
              a: "Same safety gates — disclose pro kit pieces in the checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers missing tow ropes and boards — not event liability insurance.",
            },
            {
              q: "Partner promo?",
              a: "No tournament-sponsor affiliate hard-sell.",
            },
          ],
        },
        "Racket Sports": {
          title: "Racket sports — sport type",
          summary: "Tennis through pickleball freeze sport type plus size and skill.",
          qa: [
            {
              q: "What must be listed?",
              a: "Racket sport type, size/length (grip or length), and skill level.",
            },
            {
              q: "Strings / tension?",
              a: "Note tension or string type in the kit checklist when it matters.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked frames and missing covers — not string warranty.",
            },
            {
              q: "Partner promo?",
              a: "No racket-subscription affiliate hard-sell.",
            },
          ],
        },
        "Skating": {
          title: "Skating — type, size, skill",
          summary: "Inline, ice, quad, and boards freeze skate type before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Skate type, size/length, and skill level.",
            },
            {
              q: "Pads / helmet?",
              a: "Disclose protective gear in the kit checklist — assume not included unless listed.",
            },
            {
              q: "Deposit?",
              a: "Covers broken trucks and missing wheels.",
            },
            {
              q: "Partner promo?",
              a: "No skate-shop affiliate hard-sell.",
            },
          ],
        },
        "Fishing Gear": {
          title: "Fishing — rod class",
          summary: "Rod/reel class plus size and skill freeze before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Rod/gear class, size/length, and skill level.",
            },
            {
              q: "Tackle included?",
              a: "List lure packs and nets in the kit checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers snapped rods and missing reels — not lost-tackle insurance for every lure.",
            },
            {
              q: "Partner promo?",
              a: "No fishing-brand affiliate hard-sell.",
            },
          ],
        },
        "Competition Gear": {
          title: "Competition — sport class",
          summary: "Track/field/court class freezes competition shelf intent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Competition sport class, size/length, and skill.",
            },
            {
              q: "Rule legal?",
              a: "Host declares class — renter confirms event rules separately.",
            },
            {
              q: "Deposit?",
              a: "Covers damaged implements and missing weights.",
            },
            {
              q: "Partner promo?",
              a: "No federation-insurance affiliate hard-sell.",
            },
          ],
        },
        "Coaching Equipment": {
          title: "Coaching — aid type",
          summary: "Cones, carts, and agility kits freeze coaching aid type.",
          qa: [
            {
              q: "What must be listed?",
              a: "Coaching aid type, size/count notes, and skill.",
            },
            {
              q: "How many pieces?",
              a: "Put counts in the kit checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers missing cones and damaged hurdles.",
            },
            {
              q: "Partner promo?",
              a: "No coaching-vendor affiliate hard-sell.",
            },
          ],
        },
        "Timing Systems": {
          title: "Timing — system type",
          summary: "Clocks, chips, and photo-finish freeze system type.",
          qa: [
            {
              q: "What gates apply?",
              a: "Timing system type, size/ports notes, and skill.",
            },
            {
              q: "Power / setup?",
              a: "Disclose power and setup in the checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers missing sensors and damaged displays — not race results insurance.",
            },
            {
              q: "Partner promo?",
              a: "No timing-vendor affiliate hard-sell.",
            },
          ],
        },
        "Team Sports Gear": {
          title: "Team gear — kit band + inventory",
          summary: "Ball kits, goals, and protective sets freeze kit band and inventory text.",
          qa: [
            {
              q: "What must be listed?",
              a: "Team kit band, size/length, skill, and a kit inventory checklist.",
            },
            {
              q: "Why inventory?",
              a: "Team bags lose pieces — freeze the list before unlock.",
            },
            {
              q: "Deposit?",
              a: "Covers missing balls and torn nets against the list.",
            },
            {
              q: "Partner promo?",
              a: "No team-store affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Sports other — re-shelf when named fits",
          summary: "Catch-all still publishes kind and kit inventory.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Sports shelf fits.",
            },
            {
              q: "What gates apply?",
              a: "sportsOtherKind plus kit checklist, size/length, and skill.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Snow, Water, Racket, Skating, Fishing, Team, or pro shelves when those gates fit.",
            },
            {
              q: "Deposit?",
              a: "Covers missing pieces against the checklist.",
            },
          ],
        },
      };

export const parentCategoryKey = "Sports & Recreation" as const;
