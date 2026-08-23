import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Costume & Cosplay — host-facing Q→A only. */
export const subs_Costume_and_Cosplay: Record<string, CategoryFactBlock> = {
  "Halloween Costumes": {
    title: "Halloween costume FAQ",
    summary: "Short answers for size, pieces, glitter, and cleaning.",
    qa: [
      {
        q: "What size / audience fits?",
        a: "Use published size/fits and kids/teen/adult/family band.",
      },
      {
        q: "What pieces are included?",
        a: "Full piece list (mask, gloves, props)—count at handoff.",
      },
      {
        q: "How should glitter/makeup return?",
        a: "Follow glitter/fake-blood notes; optional cleaning fee may apply.",
      },
      {
        q: "Is smoke/fog allowed?",
        a: "Only if the listing policy allows it.",
      },
      {
        q: "What does the deposit cover?",
        a: "Tears and missing pieces beyond the published fee.",
      },
    ],
  },
  "Character Costumes": {
    title: "Character costume FAQ",
    summary: "Short answers for character label, set completeness, and fit.",
    qa: [
      {
        q: "Which character is this?",
        a: "The listing names the character and full vs partial set.",
      },
      {
        q: "What pieces ship?",
        a: "Every piece is inventoried—photo-check at pickup.",
      },
      {
        q: "Can I try it on?",
        a: "Follow try-on/fit notes on the listing.",
      },
      {
        q: "Who handles IP/licensing?",
        a: "Hosts handle IP-safe use; Evorios does not clear licenses.",
      },
      {
        q: "What does the deposit cover?",
        a: "Missing pieces and tears beyond any listed cleaning fee.",
      },
    ],
  },
  "Wigs & Accessories": {
    title: "Wigs & accessories FAQ",
    summary: "Short answers for sanitize, fiber, and style reset.",
    qa: [
      {
        q: "Is it sanitized?",
        a: "Host attests sanitization between renters—acknowledge hygiene at booking.",
      },
      {
        q: "What fiber and cap size?",
        a: "Fiber type and cap band are on the listing—match heat tools to fiber.",
      },
      {
        q: "Can I restyle it?",
        a: "Only within the style-reset/return policy.",
      },
      {
        q: "Is there a cleaning fee?",
        a: "Only if published for restyle/clean.",
      },
      {
        q: "What does the deposit cover?",
        a: "Melted fiber, cut lace, and missing clips.",
      },
    ],
  },
  "Period Costumes": {
    title: "Period costume FAQ",
    summary: "Short answers for era, delicate return, and no alterations.",
    qa: [
      {
        q: "Which era is this?",
        a: "Era band is on the listing—confirm before you book.",
      },
      {
        q: "Can I alter or hem it?",
        a: "No—follow the no-alterations policy.",
      },
      {
        q: "How should I return it?",
        a: "Dry-clean-friendly / published return + optional fee.",
      },
      {
        q: "What pieces are included?",
        a: "Multi-piece inventory including underlayers when listed.",
      },
      {
        q: "What does the deposit cover?",
        a: "Delicate tears, stains, missing pieces, and unauthorized alterations.",
      },
    ],
  },
  "Masks & Makeup": {
    title: "Masks & makeup FAQ",
    summary: "Short answers for sanitize, sealed cosmetics, and skin contact.",
    qa: [
      {
        q: "Is it sanitized?",
        a: "Yes between renters—hygiene ack required at booking.",
      },
      {
        q: "Sealed or open cosmetics?",
        a: "Listing declares sealed vs open; prefer sealed when possible.",
      },
      {
        q: "What touches skin?",
        a: "Mask / foam / paint type is published—follow clean/return rules.",
      },
      {
        q: "Allergy notes?",
        a: "Soft allergen notes only—not medical advice.",
      },
      {
        q: "What if cosmetics are contaminated?",
        a: "Do not relist open contaminated products; replace first.",
      },
    ],
  },
  Other: {
    title: "Other costume FAQ",
    summary: "Short answers when no named costume shelf fits.",
    qa: [
      {
        q: "Should I use Other?",
        a: "Prefer a named shelf so hygiene/heat/era details apply.",
      },
      {
        q: "What must Other declare?",
        a: "Material, return/cleaning policy, condition photos, and piece list if multi-piece.",
      },
      {
        q: "Is there a cleaning fee?",
        a: "Only when the host publishes one.",
      },
      {
        q: "What does the deposit cover?",
        a: "Stains, tears, and missing pieces after any listed fee.",
      },
      {
        q: "Dry-cleaner partner?",
        a: "No—you or the renter arrange cleaning.",
      },
    ],
  },
  "Theater Costumes": {
    title: "Theater costume FAQ",
    summary: "Short answers for inventory, run window, and no alterations.",
    qa: [
      {
        q: "What pieces are inventoried?",
        a: "Every wardrobe piece—count at handoff and return.",
      },
      {
        q: "Can I alter the costume?",
        a: "No—no-alterations policy unless the listing says otherwise.",
      },
      {
        q: "What is the run window?",
        a: "Show/run dates on the listing—plan tech and closing nights.",
      },
      {
        q: "Is there a cleaning fee?",
        a: "When published, it goes on the rental agreement.",
      },
      {
        q: "What does the deposit cover?",
        a: "Missing pieces and unauthorized cuts/hems.",
      },
    ],
  },
  "Film & TV Props": {
    title: "Film & TV props FAQ",
    summary: "Short answers for hero vs background, fragile handling, and looksafe props.",
    qa: [
      {
        q: "Hero or background?",
        a: "Role grade is on the listing—hero pieces need extra care.",
      },
      {
        q: "How are pieces tracked?",
        a: "Full kit inventory counted at handoff and return.",
      },
      {
        q: "Are real weapons allowed?",
        a: "No—looksafe replicas only; no real firearms or live blades.",
      },
      {
        q: "Fragile handling?",
        a: "Follow the fragile band and continuity tags when present.",
      },
      {
        q: "What does the deposit cover?",
        a: "Missing/broken hero pieces and surface damage beyond wear.",
      },
    ],
  },
  "Professional Makeup Kits": {
    title: "Professional makeup kit FAQ",
    summary: "Short answers for sanitize, sealed refills, and brush inventory.",
    qa: [
      {
        q: "Is the kit sanitized?",
        a: "Host sanitization attest required between artists.",
      },
      {
        q: "Sealed vs open products?",
        a: "Follow sealed/refill policy on the listing.",
      },
      {
        q: "How many brushes?",
        a: "Brush-count band + full kit inventory—count at return.",
      },
      {
        q: "Medical / skin claims?",
        a: "Soft skin-safe notes only—not a medical claim.",
      },
      {
        q: "What does the deposit cover?",
        a: "Missing brushes/palettes; replace contaminated open products before relist.",
      },
    ],
  },
  "Animatronic Props": {
    title: "Animatronic props FAQ",
    summary: "Short answers for power, runtime, waiver, and demo.",
    qa: [
      {
        q: "What power and runtime?",
        a: "Battery/AC/air/static and runtime band are on the listing.",
      },
      {
        q: "Is a waiver required?",
        a: "Yes—liability waiver at booking.",
      },
      {
        q: "Is there a demo?",
        a: "Host demos start/stop and keep-clear zones at handoff.",
      },
      {
        q: "Indoor or outdoor?",
        a: "Follow the published environment limits.",
      },
      {
        q: "What does the deposit cover?",
        a: "Mechanical damage and missing controllers.",
      },
    ],
  },
  "Full Character Suits": {
    title: "Full character suit FAQ",
    summary: "Short answers for heat, hygiene, wear cycles, and spotters.",
    qa: [
      {
        q: "Heat and visibility?",
        a: "Host attests guidance—acknowledge before booking.",
      },
      {
        q: "Is the interior sanitized?",
        a: "Yes between renters.",
      },
      {
        q: "How long can I wear it continuously?",
        a: "Stay within the max continuous-wear minutes band; take breaks.",
      },
      {
        q: "Do I need a spotter?",
        a: "Follow the handler/spotter policy on the listing.",
      },
      {
        q: "Is a waiver required?",
        a: "Yes. Wear notes are guidance, not medical advice.",
      },
    ],
  },
};

export const parentCategoryKey = "Costume & Cosplay" as const;
