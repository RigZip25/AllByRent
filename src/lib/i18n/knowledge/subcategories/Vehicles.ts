import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Vehicles */
export const subs_Vehicles: Record<string, CategoryFactBlock> = {
        "Cars & Trucks": {
          title: "Passenger / light car rental FAQ",
          summary: "Short answers for cars and light trucks under commercial weight.",
          qa: [
            {
              q: "Do I need a CDL?",
              a: "No for light passenger cars under 26,001 lb GVWR, unless local law requires one.",
            },
            {
              q: "What insurance do I need?",
              a: "Valid personal auto covering this car. Upload proof in-app before PIN or keys unlock.",
            },
            {
              q: "How does cancellation work?",
              a: "Cancel ≥24h before start: full refund. Inside 24h: 50% refund.",
            },
            {
              q: "Fuel and late return?",
              a: "Fuel is full-to-full (+$20 if short). Late return: 30 min grace, then $20 + $15/hr by default.",
            },
            {
              q: "Why GPS for the PIN?",
              a: "The PIN opens only at pickup (or via the car QR)—not a forwarded code.",
            },
            {
              q: "What photos are required?",
              a: "Pre-trip body + four tires before start; matching return photos before close.",
            },
          ],
        },
        Motorcycles: {
          title: "Motorcycle rental FAQ",
          summary: "Short answers for motorcycle rentals.",
          qa: [
            {
              q: "Do I need a motorcycle endorsement?",
              a: "Yes. Attest a valid motorcycle endorsement (or local equivalent) for the named rider.",
            },
            {
              q: "Is a regular car license enough?",
              a: "No when this listing requires a motorcycle endorsement.",
            },
            {
              q: "What insurance do I need?",
              a: "Proof covering this bike, uploaded in-app before PIN or keys unlock.",
            },
            {
              q: "Helmet?",
              a: "Follow local law and the helmet policy on the listing.",
            },
            {
              q: "What photos are required?",
              a: "Pre-trip body and tire photos before start; matching return photos before close.",
            },
          ],
        },
        ATVs: {
          title: "ATV / OHV rental FAQ",
          summary: "Short answers for ATV and OHV rentals.",
          qa: [
            {
              q: "Is a terrain waiver required?",
              a: "Yes by default—acknowledge OHV / ATV terrain risk at booking before pickup unlock.",
            },
            {
              q: "What license do I need?",
              a: "A valid license or permit as required by local OHV law and the listing.",
            },
            {
              q: "What insurance do I need?",
              a: "Proof covering this ATV, uploaded before PIN or keys unlock.",
            },
            {
              q: "Helmet / gear?",
              a: "Follow local law and any helmet or gear rules on the listing.",
            },
            {
              q: "What photos are required?",
              a: "Pre-trip body and tire photos before start; matching return photos before close.",
            },
          ],
        },
        "Tow Vehicles": {
          title: "Tow vehicle rental FAQ",
          summary: "Short answers for tow trucks and tow vehicles.",
          qa: [
            {
              q: "Do I need a CDL?",
              a: "Yes when GVWR or combo weight is 26,001 lb or more (or as required by local law).",
            },
            {
              q: "What else is required?",
              a: "Valid tow credentials as listed, plus commercial insurance proof agent→owner when this shelf requires it.",
            },
            {
              q: "Tow capacity?",
              a: "Stay within the published tow rating and hitch class on the listing.",
            },
            {
              q: "What inspection is required?",
              a: "Body and multi-tire pre-trip before start; same set on return.",
            },
            {
              q: "Why GPS for the PIN?",
              a: "PIN or lockbox unlocks only at pickup or via vehicle QR—not a forwarded code.",
            },
          ],
        },
        Trailers: {
          title: "Trailer rental FAQ",
          summary: "Short answers for light / equipment trailers under commercial weight.",
          qa: [
            {
              q: "Do I need a CDL?",
              a: "Usually no under 26,001 lb GVWR—check local law, hitch rating, and brake rules.",
            },
            {
              q: "Hitch and lights?",
              a: "Match hitch class; confirm lights and brakes work at handoff.",
            },
            {
              q: "What insurance do I need?",
              a: "Coverage for the trailer as required on the listing; upload proof before handoff.",
            },
            {
              q: "Load limits?",
              a: "Do not exceed published GVWR or payload.",
            },
            {
              q: "What photos are required?",
              a: "Frame, coupler, tires, and lights at pre-trip; same set on return.",
            },
          ],
        },
        "Equipment Trailers": {
          title: "Equipment trailer rental FAQ",
          summary: "Short answers for commercial / equipment trailers.",
          qa: [
            {
              q: "Do I need a CDL?",
              a: "Yes when GVWR or combo weight is 26,001 lb or more (or as required for commercial hauling).",
            },
            {
              q: "How does insurance proof work?",
              a: "Agent emails commercial / PD proof to the owner address on the listing before PIN or keys unlock.",
            },
            {
              q: "Load limits?",
              a: "Do not exceed published GVWR or payload.",
            },
            {
              q: "What inspection is required?",
              a: "Frame and multi-tire photos before start; same set on return.",
            },
            {
              q: "Why GPS for the PIN?",
              a: "PIN or lockbox unlocks only at pickup or via vehicle QR—not a forwarded code.",
            },
          ],
        },
        "Commercial Trucks": {
          title: "Commercial truck rental FAQ",
          summary: "Short answers for commercial trucks and semis.",
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
              a: "Multi-tire commercial pre-trip before start; same set on return.",
            },
          ],
        },
        "Cargo Vans": {
          title: "Cargo van rental FAQ",
          summary: "Short answers for cargo and work vans.",
          qa: [
            {
              q: "Do I need a CDL?",
              a: "Usually no under 26,001 lb GVWR—confirm local law and the listing weight class.",
            },
            {
              q: "What insurance do I need?",
              a: "Coverage for this van as required on the listing; upload proof before PIN or keys unlock.",
            },
            {
              q: "Cargo limits?",
              a: "Stay within published payload and cargo securement rules on the listing.",
            },
            {
              q: "What photos are required?",
              a: "Body, cargo area, and tires at pre-trip; matching return photos before close.",
            },
            {
              q: "Why GPS for the PIN?",
              a: "PIN or lockbox unlocks only at pickup or via vehicle QR—not a forwarded code.",
            },
          ],
        },
        "RVs & Campers": {
          title: "RV & camper rental FAQ",
          summary: "Short answers for RVs, campers, and sleepers.",
          qa: [
            {
              q: "Do I need a special license?",
              a: "Follow local RV / commercial rules and any license note on the listing.",
            },
            {
              q: "What insurance do I need?",
              a: "Coverage for this RV as required on the listing; upload proof before handoff unlock.",
            },
            {
              q: "Hookups and dump?",
              a: "Confirm power/water/sewer expectations in the listing—deposit is not campsite fees.",
            },
            {
              q: "What photos are required?",
              a: "Exterior body, tires, and living-area condition at pre-trip; matching return set.",
            },
            {
              q: "What does the deposit cover?",
              a: "Interior damage and missing accessories against the listing—not trip cancellation insurance.",
            },
          ],
        },
        "Special Vehicles": {
          title: "Special vehicle rental FAQ",
          summary: "Short answers for specialty and uncommon vehicle shelves.",
          qa: [
            {
              q: "What credentials apply?",
              a: "Follow the listing—CDL, endorsement, or specialty permit when marked.",
            },
            {
              q: "What insurance do I need?",
              a: "Proof covering this vehicle class before PIN or keys unlock.",
            },
            {
              q: "Is this a commercial shelf?",
              a: "When the listing is commercial-class, agent→owner insurance and PD rules apply.",
            },
            {
              q: "What photos are required?",
              a: "Body and tire pre-trip before start; matching return photos before close.",
            },
            {
              q: "Prefer a named shelf?",
              a: "Re-shelf to Cars, Trucks, Trailers, ATVs, RVs, or Tow when those gates fit better.",
            },
          ],
        },
        Other: {
          title: "Other vehicles — pick a named shelf first",
          summary: "Prefer Cars, Motorcycles, Trailers, ATVs, RVs, Commercial, Cargo, Equipment, Tow, or Special.",
          qa: [
            {
              q: "Should I use Other?",
              a: "Re-shelf whenever a named Vehicles shelf fits so CDL, insurance, and inspection gates apply.",
            },
            {
              q: "What still applies?",
              a: "VIN, insurance proof, and photo inspection rules for Vehicles rentals still apply.",
            },
            {
              q: "Commercial vs light?",
              a: "If GVWR or use is commercial, prefer Commercial Trucks / Equipment Trailers / Tow Vehicles.",
            },
            {
              q: "What photos are required?",
              a: "Pre-trip body and tires before start; matching return photos before close.",
            },
            {
              q: "What is not included?",
              a: "No partner insurance promo and no CDL training from Evorios.",
            },
          ],
        },
      };

export const parentCategoryKey = "Vehicles" as const;
