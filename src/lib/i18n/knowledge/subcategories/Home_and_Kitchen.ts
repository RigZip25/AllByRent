import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Home & Kitchen — host-facing Q→A only. */
export const subs_Home_and_Kitchen: Record<string, CategoryFactBlock> = {
  "Coffee Makers": {
    title: "Coffee makers tips",
    summary: "Short answers for drip, espresso, and pod makers.",
    qa: [
      {
        q: "What must the host list?",
        a: "Coffee type, reservoir band, carafe/basket, filter/pod policy, capacity, and return-clean rules. Combos need a kit checklist.",
      },
      {
        q: "Who brings filters or pods?",
        a: "The listing lists filters included, reusable filter, renter-provided, or pods extra.",
      },
      {
        q: "How clean on return?",
        a: "Follow the return-clean policy — wash/dry, rinse, host sanitizes, or empty-tank only.",
      },
    ],
  },
  "Baking Equipment": {
    title: "Baking gear tips",
    summary: "Short answers for pans, molds, and bake kits.",
    qa: [
      {
        q: "What should I fill in?",
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
    title: "Stand mixers tips",
    summary: "Short answers for tilt-head and bowl-lift mixers.",
    qa: [
      {
        q: "What should I list?",
        a: "Bowl capacity, attachment kit, watt band, tilt vs bowl-lift, sanitize attestation, and return-clean.",
      },
      {
        q: "Are attachments included?",
        a: "Beater-only through full kits — rich kits need a checklist of bowls and tools.",
      },
      {
        q: "Food-contact?",
        a: "Host attests bowls and beaters are sanitized before handoff.",
      },
    ],
  },
  "Blenders & Juicers": {
    title: "Blenders & juicers tips",
    summary: "Short answers for countertop, immersion, and juicers.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Type, jar material, blade/disc kit, power band, sanitize, and return-clean.",
      },
      {
        q: "Who provides discs?",
        a: "Blade included, blade+discs, renter provides, or sealed unit — disc kits need inventory.",
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
    title: "Cleaning appliances tips",
    summary: "Short answers for vacs, carpet cleaners, and steam.",
    qa: [
      {
        q: "What should I list?",
        a: "Appliance type, power source, bag/tank system, filter status, empty-return policy, capacity, and return-clean.",
      },
      {
        q: "Must I empty the bin?",
        a: "Empty-return policy says renter empties, host empties, or not applicable.",
      },
      {
        q: "Filters?",
        a: "HEPA, standard, washable, or not included — list what ships with the unit.",
      },
      {
        q: "Food-contact sanitize?",
        a: "Not required for cleaning appliances — empty tanks and return-clean still apply.",
      },
    ],
  },
  "Commercial Coffee": {
    title: "Commercial coffee tips",
    summary: "Short answers for café and event brew systems.",
    qa: [
      {
        q: "What P0 details apply?",
        a: "Voltage, NSF status, install/hookup, brew type, softener need, service class, kit inventory, capacity, and return-clean.",
      },
      {
        q: "Why voltage and plumbing?",
        a: "Wrong voltage or missing water hookup fails the service — facts go on the rental agreement.",
      },
      {
        q: "Does Evorios certify NSF?",
        a: "No — the host declares NSF listing status; we do not certify.",
      },
    ],
  },
  "Catering Equipment": {
    title: "Home catering gear tips",
    summary: "Short answers for chafers, cambros, and serve kits.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Equip type, guest capacity, heat/hold method, power needs, NSF status, dual sanitize attestations, kit inventory, and return-clean.",
      },
      {
        q: "Sterno vs electric?",
        a: "Heat/hold method lists sterno, electric, insulated, cold-hold, or mixed.",
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
    title: "Industrial mixers tips",
    summary: "Short answers for planetary and spiral bakery mixers.",
    qa: [
      {
        q: "What should I list?",
        a: "Bowl quarts, style, phase, voltage, NSF, sanitize, kit inventory, capacity, return-clean, plus move notes when helpful.",
      },
      {
        q: "Single vs three-phase?",
        a: "Phase and voltage list so the renter matches site power before delivery.",
      },
      {
        q: "Move-in?",
        a: "Publish weight/door/lift notes — these units are not porch-pickup toys.",
      },
    ],
  },
  "Food Processors Pro": {
    title: "Pro processors tips",
    summary: "Short answers for batch and continuous-feed processors.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Bowl capacity, feed type, disc/blade kit, voltage, NSF, sanitize, and return-clean. Disc sets need inventory.",
      },
      {
        q: "Who brings discs?",
        a: "Basic blade, disc sets, or renter-provided discs — list what ships.",
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
    title: "Beverage systems tips",
    summary: "Short answers for kegerators, soda, and towers.",
    qa: [
      {
        q: "What should I list?",
        a: "System type, CO₂/syrup kit, plumbing status, voltage, NSF, install needs, sanitize, kit inventory, capacity, and return-clean.",
      },
      {
        q: "Do I need water and drain?",
        a: "Plumbing status lists self-contained, water line, drain, or both.",
      },
      {
        q: "Gas/syrup?",
        a: "CO₂ included, syrup lines, both, renter provides, or not needed.",
      },
    ],
  },
  Other: {
    title: "Home & kitchen other tips",
    summary: "Catch-all still publishes kind, piece band, photos, and return-clean.",
    qa: [
      {
        q: "When use Other?",
        a: "Only when no named Home & Kitchen shelf fits. Named shelves carry capacity, sanitize, NSF, or kit details renters expect.",
      },
      {
        q: "What still requirements publish?",
        a: "Kind, single vs multi-piece, photo checklist, capacity, return-clean; multi-piece needs inventory.",
      },
      {
        q: "move to a named category?",
        a: "Move to Coffee, Baking, Mixers, Blenders, Cleaning, Commercial Coffee, Catering, Industrial Mixers, Processors, or Beverage when those requirements fit.",
      },
    ],
  },
};

export const parentCategoryKey = "Home & Kitchen" as const;
