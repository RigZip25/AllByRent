import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Tools & DIY */
export const subs_Tools_and_DIY: Record<string, CategoryFactBlock> = {
        "Hand Tools": {
          title: "Hand tools — class + set band",
          summary: "Socket sets and wrenches freeze class and single vs set.",
          qa: [
            {
              q: "What gates apply?",
              a: "Hand tool class, power source, and single-tool vs set. Sets need a kit checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers missing sockets and damaged handles against the list.",
            },
            {
              q: "Partner promo?",
              a: "No tool-store affiliate hard-sell.",
            },
            {
              q: "Manual power?",
              a: "Power source can be manual for non-powered hand tools.",
            },
          ],
        },
        "Power Drills": {
          title: "Power drills — class + power",
          summary: "Drivers and hammers freeze drill class and power source.",
          qa: [
            {
              q: "What must be listed?",
              a: "Drill class, power source, and voltage when cordless.",
            },
            {
              q: "Batteries?",
              a: "List batteries and chargers in the kit checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers chuck damage and missing batteries.",
            },
            {
              q: "Partner promo?",
              a: "No battery-platform affiliate hard-sell.",
            },
          ],
        },
        "Measuring Tools": {
          title: "Measuring — tool class",
          summary: "Tapes, levels, and squares freeze measuring class.",
          qa: [
            {
              q: "What gates apply?",
              a: "Measuring tool class and power source (manual for tapes).",
            },
            {
              q: "Accuracy?",
              a: "Host-declared class — not a calibration certificate.",
            },
            {
              q: "Deposit?",
              a: "Covers bent squares and missing cases.",
            },
            {
              q: "Partner promo?",
              a: "No metrology-vendor affiliate hard-sell.",
            },
          ],
        },
        "Ladders": {
          title: "Ladders — height + duty",
          summary: "Height band and duty rating freeze before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Ladder height band, duty rating, and power source (manual).",
            },
            {
              q: "Duty rating?",
              a: "Type IAA–III style bands — match load to the label.",
            },
            {
              q: "Deposit?",
              a: "Covers bent rails and missing feet — not fall insurance.",
            },
            {
              q: "Partner promo?",
              a: "No ladder-insurance affiliate hard-sell.",
            },
          ],
        },
        "Painting Tools": {
          title: "Painting — class + set band",
          summary: "Sprayers and rollers freeze class and single vs set.",
          qa: [
            {
              q: "What gates apply?",
              a: "Paint tool class, power source, and set band. Sets need inventory.",
            },
            {
              q: "Cleanup?",
              a: "Note return-clean expectations in the listing.",
            },
            {
              q: "Deposit?",
              a: "Covers clogged sprayers and missing tips.",
            },
            {
              q: "Partner promo?",
              a: "No paint-brand affiliate hard-sell.",
            },
          ],
        },
        "Industrial Drills": {
          title: "Industrial drills — class + power",
          summary: "Pro drills use the same class gate with industrial kits.",
          qa: [
            {
              q: "What must be listed?",
              a: "Drill class, power source, and voltage when cordless/corded.",
            },
            {
              q: "PPE?",
              a: "Disclose bits and PPE in the checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers motor damage and missing batteries.",
            },
            {
              q: "Partner promo?",
              a: "No industrial-distributor affiliate hard-sell.",
            },
          ],
        },
        "Welding Equipment": {
          title: "Welding — process, amps, PPE, briefing",
          summary: "Process, amp band, PPE include, and safety briefing freeze.",
          qa: [
            {
              q: "What gates apply?",
              a: "Weld process, amp band, PPE include, and briefing ready when required.",
            },
            {
              q: "Who brings PPE?",
              a: "PPE field freezes helmet/gloves included vs renter provides.",
            },
            {
              q: "Deposit?",
              a: "Covers torch tips and missing leads — not burn-injury insurance.",
            },
            {
              q: "Partner promo?",
              a: "No welding-gas affiliate hard-sell.",
            },
          ],
        },
        "Scaffolding Systems": {
          title: "Scaffolding — height, load, briefing",
          summary: "Height, load band, and safety briefing freeze.",
          qa: [
            {
              q: "What must be listed?",
              a: "Height band, load band, and briefing ready when required.",
            },
            {
              q: "Assembly?",
              a: "Host briefing covers assembly/inspection expectations.",
            },
            {
              q: "Deposit?",
              a: "Covers bent frames and missing pins — not fall insurance.",
            },
            {
              q: "Partner promo?",
              a: "No scaffold-rental-house affiliate hard-sell.",
            },
          ],
        },
        "Laser Measuring": {
          title: "Laser measure — class",
          summary: "Distance, level, and rotary lasers freeze class.",
          qa: [
            {
              q: "What gates apply?",
              a: "Laser measure class and power source.",
            },
            {
              q: "Accuracy?",
              a: "Host-declared class — not a survey certification.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked windows and missing tripods.",
            },
            {
              q: "Partner promo?",
              a: "No laser-vendor affiliate hard-sell.",
            },
          ],
        },
        "Power Saws": {
          title: "Power saws — class + briefing",
          summary: "Saw class and safety briefing freeze before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Power saw class, power source, and briefing ready when required.",
            },
            {
              q: "Blades?",
              a: "List spare blades in the kit checklist.",
            },
            {
              q: "Deposit?",
              a: "Covers damaged fences and missing guards — not injury insurance.",
            },
            {
              q: "Partner promo?",
              a: "No saw-brand affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Tools other — re-shelf when named fits",
          summary: "Catch-all still publishes kind, set band, and inventory.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Tools shelf fits.",
            },
            {
              q: "What gates apply?",
              a: "toolsOtherKind, set band, power source, and kit checklist.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Hand, Drill, Measure, Ladder, Paint, Weld, Scaffold, Saw, or Laser when those gates fit.",
            },
            {
              q: "Deposit?",
              a: "Covers missing pieces against the checklist.",
            },
          ],
        },
      };

export const parentCategoryKey = "Tools & DIY" as const;
