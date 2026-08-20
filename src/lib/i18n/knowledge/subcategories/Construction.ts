import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Construction */
export const subs_Construction: Record<string, CategoryFactBlock> = {
        "Concrete Mixers": {
          title: "Concrete mixers — power + duty",
          summary: "Duty class, power/fuel bands, and insurance freeze for mixers.",
          qa: [
            {
              q: "What gates apply?",
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
            {
              q: "Partner promo?",
              a: "No equipment-yard affiliate hard-sell.",
            },
          ],
        },
        "Safety Equipment": {
          title: "Safety PPE — tier + inspection",
          summary: "PPE risk tier, size, standard, and inspection status freeze.",
          qa: [
            {
              q: "What gates apply?",
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
            {
              q: "Partner promo?",
              a: "No PPE-distributor affiliate hard-sell.",
            },
          ],
        },
        "Site Lighting": {
          title: "Site lighting — power + fuel",
          summary: "Duty, power/fuel, and insurance for temporary site lights.",
          qa: [
            {
              q: "What must be listed?",
              a: "Duty class, power band, fuel type, and insurance bands.",
            },
            {
              q: "Deposit?",
              a: "Covers light/tower damage beyond wear — not job-delay insurance.",
            },
            {
              q: "Partner promo?",
              a: "No lighting-rental affiliate hard-sell.",
            },
            {
              q: "Hours?",
              a: "Hours band is recommended for generator / light towers.",
            },
          ],
        },
        "Hand Tools Pro": {
          title: "Hand tools pro — class + duty",
          summary: "Pro hand-tool class and duty freeze with insurance.",
          qa: [
            {
              q: "What gates apply?",
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
            {
              q: "Partner promo?",
              a: "No tool-truck affiliate hard-sell.",
            },
          ],
        },
        "Formwork Basic": {
          title: "Formwork basic — piece count + checklist",
          summary: "Piece-count band and kit inventory checklist freeze.",
          qa: [
            {
              q: "What gates apply?",
              a: "Formwork piece-count band, kit inventory checklist, duty class, and insurance.",
            },
            {
              q: "Return?",
              a: "Count pieces against the frozen checklist at handoff and return.",
            },
            {
              q: "Deposit?",
              a: "Covers missing panels/props against the list — not pour-failure insurance.",
            },
            {
              q: "Partner promo?",
              a: "No formwork-supplier affiliate hard-sell.",
            },
          ],
        },
        "Large Concrete Equipment": {
          title: "Large concrete — power + duty",
          summary: "Power/fuel bands and duty for large concrete gear.",
          qa: [
            {
              q: "What gates apply?",
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
            {
              q: "Partner promo?",
              a: "No heavy-concrete rental affiliate hard-sell.",
            },
          ],
        },
        "Crane & Lifting": {
          title: "Crane & lifting — capacity + operator",
          summary: "Crane capacity tons and operator mode freeze with insurance.",
          qa: [
            {
              q: "What gates apply?",
              a: "Crane capacity tons band, operator mode, power/fuel, duty, and insurance.",
            },
            {
              q: "Operator included?",
              a: "Bare rental vs operator included/optional freezes before publish.",
            },
            {
              q: "Credentials?",
              a: "Crane-class jobs may require operator proof before handoff unlock.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not lift-failure insurance.",
            },
            {
              q: "Partner promo?",
              a: "No crane-broker affiliate hard-sell.",
            },
          ],
        },
        "Professional Formwork": {
          title: "Pro formwork — piece count + checklist",
          summary: "Same formwork gates as basic with pro-scale expectations.",
          qa: [
            {
              q: "What gates apply?",
              a: "Piece-count band, kit inventory checklist, duty class, and insurance.",
            },
            {
              q: "Return?",
              a: "Count every panel/prop against the frozen checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers missing pieces against the list.",
            },
            {
              q: "Partner promo?",
              a: "No formwork-yard affiliate hard-sell.",
            },
          ],
        },
        "Excavation Tools": {
          title: "Excavation tools — power + duty",
          summary: "Power/fuel and duty for excavation tools on site.",
          qa: [
            {
              q: "What gates apply?",
              a: "Duty class, power band, fuel type, and insurance bands.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not utility-strike insurance.",
            },
            {
              q: "Partner promo?",
              a: "No excavation-rental affiliate hard-sell.",
            },
            {
              q: "Hours?",
              a: "Hours band is recommended for powered excavation tools.",
            },
          ],
        },
        "Structural Equipment": {
          title: "Structural equipment — class + duty",
          summary: "Structural equipment class and duty freeze with insurance.",
          qa: [
            {
              q: "What gates apply?",
              a: "Structural equipment class, duty class, and insurance liability + deductible.",
            },
            {
              q: "Deposit?",
              a: "Covers damage and missing pieces — not structural-failure insurance.",
            },
            {
              q: "Partner promo?",
              a: "No shoring-supplier affiliate hard-sell.",
            },
            {
              q: "Re-shelf?",
              a: "True cranes belong on Crane & Lifting; formwork on Formwork shelves.",
            },
          ],
        },
        Other: {
          title: "Other construction — pick a named shelf first",
          summary: "Prefer Mixers, Safety, Lighting, Hand Tools, Formwork, Concrete, Crane, Excavation, or Structural.",
          qa: [
            {
              q: "Should I use Other?",
              a: "Re-shelf whenever a named Construction shelf fits so PPE, formwork, or crane gates apply.",
            },
            {
              q: "What still applies?",
              a: "Duty class, insurance bands, and constructionOtherKind still freeze on rent.",
            },
            {
              q: "Deposit?",
              a: "Matches the deductible band — not job insurance.",
            },
            {
              q: "Partner promo?",
              a: "No equipment-yard affiliate hard-sell.",
            },
          ],
        },
      };

export const parentCategoryKey = "Construction" as const;
