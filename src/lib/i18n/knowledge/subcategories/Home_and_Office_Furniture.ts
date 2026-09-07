import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Home & Office Furniture — host-facing Q→A only. */
export const subs_Home_and_Office_Furniture: Record<string, CategoryFactBlock> = {
  "Office Desks & Chairs": {
    title: "Office desks & chairs tips",
    summary: "Desks and chairs skip device wipe; list type, size/seats, and condition.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Furniture type, size/seat band, and condition grade. No device storage wipe on this shelf.",
      },
      {
        q: "Assembly?",
        a: "Publish what ships assembled vs flat-pack in notes/kit list. Deposit covers missing hardware.",
      },
      {
        q: "Data wipe?",
        a: "Not required for furniture — use Printers/POS/Servers for devices with storage.",
      },
    ],
  },
  "Event Furniture": {
    title: "Event furniture tips",
    summary: "Banquet tables and stacking chairs rent by the count, not the piece.",
    qa: [
      {
        q: "What should I list?",
        a: "The size/seat band, the condition grade, and how many pieces the price covers. Linens and covers belong in the kit list.",
      },
      {
        q: "Delivery?",
        a: "Set delivery and the heavy-item flag — event orders usually move by van, not by hand.",
      },
      {
        q: "Return condition?",
        a: "Say whether chairs come back stacked and tables folded, and who wipes them down.",
      },
    ],
  },
  "Commercial Storage & Shelving": {
    title: "Commercial storage & shelving tips",
    summary: "Racks and cabinets rent on load rating and assembly state.",
    qa: [
      {
        q: "What should I list?",
        a: "Furniture type, size band, condition grade, and the shelf or drawer count in the kit list.",
      },
      {
        q: "Load rating?",
        a: "Put the per-shelf rating in the description when the maker publishes one — renters stack to it.",
      },
      {
        q: "Anchoring?",
        a: "Tall racks that need wall anchors should say so, and whether the hardware travels with the unit.",
      },
    ],
  },
};

export const parentCategoryKey = "Home & Office Furniture" as const;
