import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Outdoor & Camping */
export const subs_Outdoor_and_Camping: Record<string, CategoryFactBlock> = {
          Tents: {
            title: "Tents — capacity, season, hygiene",
            summary: "Peer tent rentals work when sleeps band, season rating, packed weight, and a sanitized/aired attestation are frozen before booking.",
            qa: [
              {
                q: "What gates apply before I can rent a tent?",
                a: "Rent listings freeze person capacity, season rating, and a hygiene checklist. The host must attest sanitized/aired; you acknowledge return clean and dry at booking.",
              },
              {
                q: "What do capacity and season rating mean?",
                a: "Capacity is how many people the tent is built for. Season rating (1–4 season) sets expected weather exposure—not a guarantee against storms.",
              },
              {
                q: "Why is packed weight listed?",
                a: "It helps backpacking vs car-camping decisions. Soft recommendation when published—confirm before you hike it in.",
              },
              {
                q: "What is the hygiene rule?",
                a: "Shared sleep shelters need host cleaning attestation. Booking is blocked until the host marks sanitized/aired; you ack returning the tent reasonably clean and dry.",
              },
              {
                q: "What should I photograph?",
                a: "Poles, fly, stakes, and fabric condition at handoff and return—missing poles and torn flies drive most deposit claims.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing poles, stakes, guylines, and damage beyond normal camp wear. It is not weather or trip cancellation insurance.",
              },
              {
                q: "What is not included?",
                a: "No REI membership, no tent-setup labor, and no outdoor-insurance product from Evorios.",
              },
            ],
          },
          "Sleeping Bags": {
            title: "Sleeping bags — temp band, hygiene",
            summary: "Bags rent cleanly when temp rating, capacity/season context, and a sanitized attestation are on the agreement.",
            qa: [
              {
                q: "What gates apply?",
                a: "Sleeping Bags require a temp-rating band plus the Outdoor hygiene checklist. Host attests cleaned/aired; booking stays blocked until attested.",
              },
              {
                q: "How do I read the temp band?",
                a: "It is the published comfort class (above 50°F down through below 0°F). Stay within it—cold injury risk is on the renter, not covered by deposit.",
              },
              {
                q: "Is capacity still required?",
                a: "Yes—Outdoor capacity and season fields still apply so renters know bag size/season context.",
              },
              {
                q: "What is the hygiene rule?",
                a: "Shared sleep gear: host sanitization attestation, then your booking ack to return the bag clean and dry. Soft notes may cover liners or wash timing.",
              },
              {
                q: "What should I photograph?",
                a: "Zippers, baffles, and any stains at pickup and return. Missing stuff-sacks or liner damage can hit the deposit.",
              },
              {
                q: "Waiver vs deposit?",
                a: "Hygiene is the sleep-gear trust layer. Deposit covers missing parts and soil beyond policy—not hypothermia or trip insurance.",
              },
              {
                q: "What is not included?",
                a: "No sleeping-bag laundry partner promo and no outdoor medical or trip insurance from Evorios.",
              },
            ],
          },
          Backpacks: {
            title: "Backpacks — capacity, weight, fit",
            summary: "Packs rent when sleeps/seats capacity context, season, and packed weight are honest so fit and carry expectations match the trail.",
            qa: [
              {
                q: "What gates apply?",
                a: "Outdoor rent still requires person-capacity and season bands. Packed weight is recommended—use it when comparing overnight packs.",
              },
              {
                q: "How should I read capacity on a pack?",
                a: "Use the published band as intended load class (day vs multi-day). Confirm torso/fit notes in the listing description before booking.",
              },
              {
                q: "Is there a hygiene checklist?",
                a: "Not by default on Backpacks. Soft return-clean notes still help—muddy hipbelts and food-smell packs cause disputes.",
              },
              {
                q: "What should I photograph?",
                a: "Hipbelt, straps, zippers, and rain cover at handoff. Missing rain covers and torn hipbelts are common claims.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing lids, covers, and frame damage beyond normal trail wear—not lost personal gear inside the pack.",
              },
              {
                q: "What is not included?",
                a: "No outfitter guide, no REI membership, and no outdoor-insurance affiliate from Evorios.",
              },
            ],
          },
          "Camp Cooking": {
            title: "Camp cooking — fuel type, parts, fire safety",
            summary: "Stoves and cook kits need fuel type frozen with capacity/season context so renters bring the right canisters and return every piece.",
            qa: [
              {
                q: "What gates apply?",
                a: "Camp Cooking requires stove fuel type (isobutane, white gas, propane, alcohol, wood, electric, or multi-fuel) plus Outdoor capacity/season fields.",
              },
              {
                q: "Why does fuel type matter?",
                a: "Wrong fuel can destroy the stove and is a deposit claim. Match canisters or bottles to the published fuel type before you leave town.",
              },
              {
                q: "Are pots and fuel included?",
                a: "Only what the listing inventory says. Count burners, windscreens, pumps, and pots at handoff.",
              },
              {
                q: "Fire and leave-no-trace?",
                a: "Follow local fire bans and the host’s soft notes. Burn bans and wildfire risk are outside the deposit—cancel if conditions make cooking unsafe.",
              },
              {
                q: "What should I photograph?",
                a: "Stove legs, fuel adapter, pump, and cookware condition. Missing pumps and cracked windscreens drive claims.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing stove parts and cookware damage—not fuel you consume or burned food.",
              },
              {
                q: "What is not included?",
                a: "No fuel canister subscription and no camp-cooking insurance product from Evorios.",
              },
            ],
          },
          "Navigation & GPS": {
            title: "Navigation & GPS — power, maps, return",
            summary: "Handheld GPS and nav kits rent when capacity/season context is set and power/map expectations are clear before remote trips.",
            qa: [
              {
                q: "What gates apply?",
                a: "Outdoor capacity and season fields still publish. Confirm battery/charge and map notes in the listing before relying on the unit off-grid.",
              },
              {
                q: "Are maps and subscriptions included?",
                a: "Only if listed. Offline map packs and satellite subscriptions are host-declared—not an Evorios Garmin/onX affiliate.",
              },
              {
                q: "Power and return charge?",
                a: "Return devices per listing notes (usually similar charge). Dead batteries after a multi-day trip may be normal wear; missing chargers are deposit claims.",
              },
              {
                q: "Is a waiver required?",
                a: "Not by default on personal Navigation & GPS. Survival / expedition shelves carry separate waiver gates.",
              },
              {
                q: "What should I photograph?",
                a: "Unit, antenna/mount, and charger at handoff. Screen cracks and missing cradles are common claims.",
              },
              {
                q: "What is not included?",
                a: "No rescue subscription, no map-data promo, and no navigation insurance from Evorios.",
              },
            ],
          },
          Other: {
            title: "Outdoor other — re-shelf when possible",
            summary: "Prefer a named Outdoor shelf so hygiene, fuel, or waiver gates apply. Other still freezes capacity and season on rent.",
            qa: [
              {
                q: "Should I stay on Other?",
                a: "Re-shelf to Tents, Sleeping Bags, Backpacks, Camp Cooking, Navigation, Expedition Tents, Survival Gear, Group Shelters, Professional Navigation, or Base Camp when one fits.",
              },
              {
                q: "What still applies on Other?",
                a: "Person capacity and season rating remain required on Outdoor rent. Packed weight is recommended when carry matters.",
              },
              {
                q: "Do hygiene or waiver gates apply?",
                a: "Only if the host marks them required, or the item is clearly tent/sleep or survival/expedition-like. Named shelves enforce those gates automatically.",
              },
              {
                q: "What should I photograph?",
                a: "Overall condition plus every accessory. Vague Other kits without piece photos create deposit fights.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing accessories and damage beyond normal outdoor wear per the listing.",
              },
              {
                q: "What is not included?",
                a: "No catch-all outdoor insurance and no big-box rental promo from Evorios.",
              },
            ],
          },
          "Expedition Tents": {
            title: "Expedition tents — season, hygiene, waiver",
            summary: "Alpine/expedition shelters freeze capacity, season, hygiene attestation, and a liability waiver before booking.",
            qa: [
              {
                q: "What gates apply?",
                a: "Expedition Tents require capacity, season rating, hygiene checklist with sanitized attestation, and liability waiver status on rent.",
              },
              {
                q: "Why a waiver?",
                a: "High-risk mountain shelter use. You acknowledge ordinary-use injury risk at booking unless the host marks not required—you rent from a neighbor, not a guide service.",
              },
              {
                q: "Hygiene vs basecamp tents?",
                a: "Same sleep-shelter hygiene rule: host attests cleaned/aired; you return reasonably clean and dry.",
              },
              {
                q: "What should I photograph?",
                a: "Poles, fly, snow stakes, and guyline kits. Expedition hardware sets go missing after alpine weekends.",
              },
              {
                q: "Deposit vs waiver?",
                a: "Waiver covers ordinary injury risk between peers; deposit covers missing poles/stakes and fabric damage.",
              },
              {
                q: "What is not included?",
                a: "No guided expedition, no alpine rescue cover, and no outdoor-insurance affiliate from Evorios.",
              },
            ],
          },
          "Survival Gear": {
            title: "Survival gear — waiver, capacity, claims",
            summary: "Survival kits freeze capacity/season context and a liability waiver so renters know risk stays with ordinary use between peers.",
            qa: [
              {
                q: "What gates apply?",
                a: "Survival Gear requires liability waiver status on rent plus Outdoor capacity and season fields.",
              },
              {
                q: "Why a waiver?",
                a: "Survival training and remote use carry injury risk. Acknowledge assumption of risk at booking unless the host marks not required.",
              },
              {
                q: "Is hygiene required?",
                a: "Not by default unless the kit includes shared sleep gear—then host may mark hygiene required. Prefer Sleeping Bags / Tents shelves for sleep items.",
              },
              {
                q: "What should be inventoried?",
                a: "Knives, fire starters, signal tools, and first-aid pieces. Count every item at handoff against the listing.",
              },
              {
                q: "Deposit vs waiver?",
                a: "Waiver addresses ordinary-use injury risk; deposit covers missing or damaged kit pieces—not medical or rescue costs.",
              },
              {
                q: "What is not included?",
                a: "No survival course certificate, no SAR subscription, and no outdoor medical insurance from Evorios.",
              },
            ],
          },
          "Group Shelters": {
            title: "Group shelters — capacity, season, parts",
            summary: "Group canopies and shelters rent when capacity (often group_shelter) and season rating match the event footprint.",
            qa: [
              {
                q: "What gates apply?",
                a: "Capacity and season rating are required. Use group_shelter capacity when the shelter is event/group sized rather than a backpacking tent.",
              },
              {
                q: "Is hygiene required?",
                a: "Not by default unless the host marks it. Soft clean/dry return notes still reduce mud and mildew claims.",
              },
              {
                q: "Weather and stakes?",
                a: "Season rating is not a wind guarantee. Confirm stake/weight kit inclusion and local weather before setup.",
              },
              {
                q: "What should I photograph?",
                a: "Frame poles, canopy fabric, stakes, and weights at handoff. Missing weights after windy events are common claims.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing poles, stakes, weights, and tears beyond normal event wear—not weather cancellation insurance.",
              },
              {
                q: "What is not included?",
                a: "No event staffing, no weather-cancel insurance product, and no party-rental franchise promo from Evorios.",
              },
            ],
          },
          "Professional Navigation": {
            title: "Pro navigation — kit honesty, power, maps",
            summary: "Pro GPS / survey-style nav kits need capacity/season context plus clear power, mount, and map expectations before field days.",
            qa: [
              {
                q: "What gates apply?",
                a: "Outdoor capacity and season fields still publish. Confirm battery, mount, and antenna inventory in the listing before remote work.",
              },
              {
                q: "Maps and software?",
                a: "Only host-declared map packs or software seats. Evorios does not resell Garmin, Trimble, or onX subscriptions.",
              },
              {
                q: "Is a waiver required?",
                a: "Not by default on this shelf. Survival Gear and Expedition Tents carry hard waiver gates when risk is higher.",
              },
              {
                q: "What should I photograph?",
                a: "Receiver, antenna, poles/mounts, and chargers. Missing survey poles and cradles drive deposit claims.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing accessories and hardware damage—not lost field data or subscription renewals.",
              },
              {
                q: "What is not included?",
                a: "No survey crew, no software seat promo, and no navigation insurance from Evorios.",
              },
            ],
          },
          "Base Camp Equipment": {
            title: "Base camp — capacity, season, inventory",
            summary: "Tables, kitchens, and basecamp kits rent when capacity/season match the camp size and every piece is listed for return.",
            qa: [
              {
                q: "What gates apply?",
                a: "Capacity and season rating are required. Packed weight helps when gear is backpack-carried to camp.",
              },
              {
                q: "Hygiene or waiver?",
                a: "Not by default. If the kit includes tents or sleep gear, re-shelf those pieces so hygiene/waiver gates apply.",
              },
              {
                q: "Why inventory matters?",
                a: "Basecamp kits lose chairs, lanterns, and cook tables. Publish a piece list and count at handoff/return.",
              },
              {
                q: "What should I photograph?",
                a: "Full kit layout at pickup and return. Missing stools and lanterns are typical deposit claims.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing pieces and damage beyond normal camp wear—not food, fuel, or trip insurance.",
              },
              {
                q: "What is not included?",
                a: "No camp staff, no outfitter package insurance, and no REI / fleet-yard promo from Evorios.",
              },
            ],
          },
        };

export const parentCategoryKey = "Outdoor & Camping" as const;
