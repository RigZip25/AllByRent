import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Home & Kitchen */
export const subs_Home_and_Kitchen: Record<string, CategoryFactBlock> = {
        "Coffee Makers": {
          title: "Coffee makers \u2014 type, tank, filters",
          summary: "Short answers for drip, espresso, and pod makers.",
          qa: [
            {
              q: "What must the host list?",
              a: "Coffee type, reservoir band, carafe/basket, filter/pod policy, capacity, and return-clean rules. Combos need a kit checklist.",
            },
            {
              q: "Who brings filters or pods?",
              a: "The listing freezes filters included, reusable filter, renter-provided, or pods extra.",
            },
            {
              q: "How clean on return?",
              a: "Follow the return-clean policy \u2014 wash/dry, rinse, host sanitizes, or empty-tank only.",
            },
            {
              q: "Any partner promo?",
              a: "No \u2014 no coffee-club or capsule affiliate hard-sell in the FAQ.",
            },
          ],
        },
        "Baking Equipment": {
          title: "Baking gear \u2014 pieces, oven temp, sanitize",
          summary: "Short answers for pans, molds, and bake kits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Kit type, piece count, oven-safe temp, material, food-contact sanitize, and return-clean. Multi-piece kits need an inventory list.",
            },
            {
              q: "Is it oven-safe?",
              a: "Hosts publish the oven-safe band including broiler-safe or not oven-safe.",
            },
            {
              q: "Sanitize?",
              a: "Food-contact surfaces must be attested sanitized before handoff.",
            },
            {
              q: "Deposit?",
              a: "Covers warping, missing pieces, and nonstick damage beyond fair wear.",
            },
          ],
        },
        "Stand Mixers": {
          title: "Stand mixers \u2014 bowl, attachments, power",
          summary: "Short answers for tilt-head and bowl-lift mixers.",
          qa: [
            {
              q: "What must be listed?",
              a: "Bowl capacity, attachment kit, watt band, tilt vs bowl-lift, sanitize attestation, and return-clean.",
            },
            {
              q: "Are attachments included?",
              a: "Beater-only through full kits \u2014 rich kits need a checklist of bowls and tools.",
            },
            {
              q: "Food-contact?",
              a: "Host attests bowls and beaters are sanitized before handoff.",
            },
            {
              q: "Partner promo?",
              a: "No KitchenAid affiliate or warranty upsell in the FAQ.",
            },
          ],
        },
        "Blenders & Juicers": {
          title: "Blenders & juicers \u2014 jar, blades, watts",
          summary: "Short answers for countertop, immersion, and juicers.",
          qa: [
            {
              q: "What gates apply?",
              a: "Type, jar material, blade/disc kit, power band, sanitize, and return-clean.",
            },
            {
              q: "Who provides discs?",
              a: "Blade included, blade+discs, renter provides, or sealed unit \u2014 disc kits need inventory.",
            },
            {
              q: "Return clean?",
              a: "Follow wash/dry or rinse rules; food-contact sanitize is attested at handoff.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked jars, missing blades/discs, and motor abuse beyond fair wear.",
            },
          ],
        },
        "Cleaning Appliances": {
          title: "Cleaning appliances \u2014 type, tanks, filters",
          summary: "Short answers for vacs, carpet cleaners, and steam.",
          qa: [
            {
              q: "What must be listed?",
              a: "Appliance type, power source, bag/tank system, filter status, empty-return policy, capacity, and return-clean.",
            },
            {
              q: "Must I empty the bin?",
              a: "Empty-return policy says renter empties, host empties, or not applicable.",
            },
            {
              q: "Filters?",
              a: "HEPA, standard, washable, or not included \u2014 freeze what ships with the unit.",
            },
            {
              q: "Food-contact sanitize?",
              a: "Not required for cleaning appliances \u2014 empty tanks and return-clean still apply.",
            },
          ],
        },
        "Commercial Coffee": {
          title: "Commercial coffee \u2014 voltage, NSF, install",
          summary: "Short answers for caf\u00e9 and event brew systems.",
          qa: [
            {
              q: "What P0 gates apply?",
              a: "Voltage, NSF status, install/hookup, brew type, softener need, service class, kit inventory, capacity, and return-clean.",
            },
            {
              q: "Why voltage and plumbing?",
              a: "Wrong voltage or missing water hookup fails the service \u2014 facts freeze on the agreement.",
            },
            {
              q: "Does Evorios certify NSF?",
              a: "No \u2014 the host declares NSF listing status; we do not certify.",
            },
            {
              q: "Partner promo?",
              a: "No caf\u00e9-equipment finance or capsule affiliate hard-sell.",
            },
          ],
        },
        "Catering Equipment": {
          title: "Home catering gear \u2014 serve count, heat, sanitize",
          summary: "Short answers for chafers, cambros, and serve kits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Equip type, guest capacity, heat/hold method, power needs, NSF status, dual sanitize attestations, kit inventory, and return-clean.",
            },
            {
              q: "Sterno vs electric?",
              a: "Heat/hold method freezes sterno, electric, insulated, cold-hold, or mixed.",
            },
            {
              q: "Sanitize?",
              a: "Both food-contact and catering sanitize must be attested before handoff.",
            },
            {
              q: "Party vs Home shelf?",
              a: "Event AV/decor stays on Party & Events; foodservice chafers and cambros live here when rented as kitchen gear.",
            },
          ],
        },
        "Industrial Mixers": {
          title: "Industrial mixers \u2014 bowl, phase, NSF",
          summary: "Short answers for planetary and spiral bakery mixers.",
          qa: [
            {
              q: "What must be listed?",
              a: "Bowl quarts, style, phase, voltage, NSF, sanitize, kit inventory, capacity, return-clean, plus move notes when helpful.",
            },
            {
              q: "Single vs three-phase?",
              a: "Phase and voltage freeze so the renter matches site power before delivery.",
            },
            {
              q: "Move-in?",
              a: "Publish weight/door/lift notes \u2014 these units are not porch-pickup toys.",
            },
            {
              q: "Partner promo?",
              a: "No bakery-lease affiliate hard-sell.",
            },
          ],
        },
        "Food Processors Pro": {
          title: "Pro processors \u2014 bowl, feed, discs",
          summary: "Short answers for batch and continuous-feed processors.",
          qa: [
            {
              q: "What gates apply?",
              a: "Bowl capacity, feed type, disc/blade kit, voltage, NSF, sanitize, and return-clean. Disc sets need inventory.",
            },
            {
              q: "Who brings discs?",
              a: "Basic blade, disc sets, or renter-provided discs \u2014 freeze what ships.",
            },
            {
              q: "Sanitize?",
              a: "Food-contact surfaces attested before handoff.",
            },
            {
              q: "Deposit?",
              a: "Covers missing discs, cracked bowls, and drive damage beyond fair wear.",
            },
          ],
        },
        "Beverage Systems": {
          title: "Beverage systems \u2014 gas, plumb, NSF",
          summary: "Short answers for kegerators, soda, and towers.",
          qa: [
            {
              q: "What must be listed?",
              a: "System type, CO\u2082/syrup kit, plumbing status, voltage, NSF, install needs, sanitize, kit inventory, capacity, and return-clean.",
            },
            {
              q: "Do I need water and drain?",
              a: "Plumbing status freezes self-contained, water line, drain, or both.",
            },
            {
              q: "Gas/syrup?",
              a: "CO\u2082 included, syrup lines, both, renter provides, or not needed.",
            },
            {
              q: "Partner promo?",
              a: "No beverage-supplier affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Home & kitchen other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind, piece band, photos, and return-clean.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Home & Kitchen shelf fits. Named shelves carry capacity, sanitize, NSF, or kit gates renters expect.",
            },
            {
              q: "What still gates publish?",
              a: "Kind, single vs multi-piece, photo checklist, capacity, return-clean; multi-piece needs inventory.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Coffee, Baking, Mixers, Blenders, Cleaning, Commercial Coffee, Catering, Industrial Mixers, Processors, or Beverage when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no appliance-affiliate hard-sell.",
            },
          ],
        },
      };

export const parentCategoryKey = "Home & Kitchen" as const;
