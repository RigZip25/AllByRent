import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Construction — host-facing Q→A only. */
export const subs_Construction: Record<string, CategoryFactBlock> = {
  "Concrete Mixers": {
    title: "Concrete mixers tips",
    summary: "Duty class, power/fuel bands, and insurance list for mixers.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Duty class, power band, fuel type, and insurance liability + deductible.",
      },
      {
        q: "Hours?",
        a: "Hours band is recommended so renters know wear before handoff.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not concrete-job insurance.",
      },
    ],
  },
  "Safety Equipment": {
    title: "Safety PPE tips",
    summary: "PPE risk tier, size, standard, and inspection status list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "PPE risk tier (soft / fall / mixed), size band, standard region, and inspection status.",
      },
      {
        q: "Fall protection?",
        a: "Fall or mixed kits require a published standard and inspected_current or tag_visible.",
      },
      {
        q: "Soft PPE?",
        a: "Soft PPE may use not_required_soft_ppe inspection — still publish size and tier.",
      },
      {
        q: "Deposit?",
        a: "Covers missing/damaged PPE pieces — not injury insurance.",
      },
    ],
  },
  "Site Lighting": {
    title: "Site lighting tips",
    summary: "Duty, power/fuel, and insurance for temporary site lights.",
    qa: [
      {
        q: "What should I list?",
        a: "Duty class, power band, fuel type, and insurance bands.",
      },
      {
        q: "Deposit?",
        a: "Covers light/tower damage beyond wear — not job-delay insurance.",
      },
      {
        q: "Hours?",
        a: "Hours band is recommended for generator / light towers.",
      },
    ],
  },
  "Hand Tools Pro": {
    title: "Hand tools pro tips",
    summary: "Pro hand-tool class and duty list with insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Hand-tools pro class, duty class, and insurance liability + deductible.",
      },
      {
        q: "Inventory?",
        a: "List multi-piece sets in notes or checklist so missing bits are claimable.",
      },
      {
        q: "Deposit?",
        a: "Covers missing tools and damage — not injury insurance.",
      },
    ],
  },
  "Formwork Basic": {
    title: "Formwork basic tips",
    summary: "Piece-count band and kit inventory checklist list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Formwork piece-count band, kit inventory checklist, duty class, and insurance.",
      },
      {
        q: "Return?",
        a: "Count pieces against the listed checklist at handoff and return.",
      },
      {
        q: "Deposit?",
        a: "Covers missing panels/props against the list — not pour-failure insurance.",
      },
    ],
  },
  "Large Concrete Equipment": {
    title: "Large concrete tips",
    summary: "Power/fuel bands and duty for large concrete gear.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Duty class, power band, fuel type, and insurance bands.",
      },
      {
        q: "Operator?",
        a: "Publish whether an operator is included in listing notes when relevant.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not project-delay insurance.",
      },
    ],
  },
  "Crane & Lifting": {
    title: "Crane & lifting tips",
    summary: "Crane capacity tons and operator mode list with insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Crane capacity tons band, operator mode, power/fuel, duty, and insurance.",
      },
      {
        q: "Operator included?",
        a: "Bare rental vs operator included/optional lists before publish.",
      },
      {
        q: "Credentials?",
        a: "Crane-class jobs may require operator proof before handoff unlock.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not lift-failure insurance.",
      },
    ],
  },
  "Professional Formwork": {
    title: "Pro formwork tips",
    summary: "Same formwork requirements as basic with pro-scale expectations.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Piece-count band, kit inventory checklist, duty class, and insurance.",
      },
      {
        q: "Return?",
        a: "Count every panel/prop against the listed checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers missing pieces against the list.",
      },
    ],
  },
  "Excavation Tools": {
    title: "Excavation tools tips",
    summary: "Power/fuel and duty for excavation tools on site.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Duty class, power band, fuel type, and insurance bands.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not utility-strike insurance.",
      },
      {
        q: "Hours?",
        a: "Hours band is recommended for powered excavation tools.",
      },
    ],
  },
  "Structural Equipment": {
    title: "Structural equipment tips",
    summary: "Structural equipment class and duty list with insurance.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Structural equipment class, duty class, and insurance liability + deductible.",
      },
      {
        q: "Deposit?",
        a: "Covers damage and missing pieces — not structural-failure insurance.",
      },
      {
        q: "move to a named category?",
        a: "True cranes belong on Crane & Lifting; formwork on Formwork shelves.",
      },
    ],
  },
  Other: {
    title: "Other construction tips",
    summary: "Prefer Mixers, Safety, Lighting, Hand Tools, Formwork, Concrete, Crane, Excavation, or Structural.",
    qa: [
      {
        q: "Should I use Other?",
        a: "move to a named category whenever a named Construction shelf fits so PPE, formwork, or crane details apply.",
      },
      {
        q: "What still applies?",
        a: "Duty class, insurance bands, and construction Other Kind still list on rent.",
      },
      {
        q: "Deposit?",
        a: "Matches the deductible band — not job insurance.",
      },
    ],
  },
};

export const parentCategoryKey = "Construction" as const;
