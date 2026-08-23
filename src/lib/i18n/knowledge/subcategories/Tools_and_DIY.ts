import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Tools & DIY — host-facing Q→A only. */
export const subs_Tools_and_DIY: Record<string, CategoryFactBlock> = {
  "Hand Tools": {
    title: "Hand tools tips",
    summary: "Socket sets and wrenches list class and single vs set.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Hand tool class, power source, and single-tool vs set. Sets need a kit checklist.",
      },
      {
        q: "Deposit?",
        a: "Covers missing sockets and damaged handles against the list.",
      },
      {
        q: "Manual power?",
        a: "Power source can be manual for non-powered hand tools.",
      },
    ],
  },
  "Power Drills": {
    title: "Power drills tips",
    summary: "Drivers and hammers list drill class and power source.",
    qa: [
      {
        q: "What should I list?",
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
    ],
  },
  "Measuring Tools": {
    title: "Measuring tips",
    summary: "Tapes, levels, and squares list measuring class.",
    qa: [
      {
        q: "What should I fill in?",
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
    ],
  },
  Ladders: {
    title: "Ladders tips",
    summary: "Height band and duty rating list before you publish.",
    qa: [
      {
        q: "What should I list?",
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
    ],
  },
  "Painting Tools": {
    title: "Painting tips",
    summary: "Sprayers and rollers list class and single vs set.",
    qa: [
      {
        q: "What should I fill in?",
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
    ],
  },
  "Industrial Drills": {
    title: "Industrial drills tips",
    summary: "Pro drills use the same class gate with industrial kits.",
    qa: [
      {
        q: "What should I list?",
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
    ],
  },
  "Welding Equipment": {
    title: "Welding tips",
    summary: "Process, amp band, PPE include, and safety briefing list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Weld process, amp band, PPE include, and briefing ready when required.",
      },
      {
        q: "Who brings PPE?",
        a: "PPE field lists helmet/gloves included vs renter provides.",
      },
      {
        q: "Deposit?",
        a: "Covers torch tips and missing leads — not burn-injury insurance.",
      },
    ],
  },
  "Scaffolding Systems": {
    title: "Scaffolding tips",
    summary: "Height, load band, and safety briefing list.",
    qa: [
      {
        q: "What should I list?",
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
    ],
  },
  "Laser Measuring": {
    title: "Laser measure tips",
    summary: "Distance, level, and rotary lasers list class.",
    qa: [
      {
        q: "What should I fill in?",
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
    ],
  },
  "Power Saws": {
    title: "Power saws tips",
    summary: "Saw class and safety briefing list before you publish.",
    qa: [
      {
        q: "What should I list?",
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
    ],
  },
  Other: {
    title: "Tools other tips",
    summary: "Catch-all still publishes kind, set band, and inventory.",
    qa: [
      {
        q: "When use Other?",
        a: "Only when no named Tools shelf fits.",
      },
      {
        q: "What should I fill in?",
        a: "toolsOtherKind, set band, power source, and kit checklist.",
      },
      {
        q: "move to a named category?",
        a: "Move to Hand, Drill, Measure, Ladder, Paint, Weld, Scaffold, Saw, or Laser when those requirements fit.",
      },
      {
        q: "Deposit?",
        a: "Covers missing pieces against the checklist.",
      },
    ],
  },
};

export const parentCategoryKey = "Tools & DIY" as const;
