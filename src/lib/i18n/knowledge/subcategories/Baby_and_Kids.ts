import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Baby & Kids */
export const subs_Baby_and_Kids: Record<string, CategoryFactBlock> = {
        "Car Seats": {
            title: "Car seat rental FAQ",
            summary: "Short answers for expiry, standards, and sanitization.",
            qa: [
              {
                q: "Can I rent an expired or recalled seat?",
                a: "No—publish and book both block until expiry and recall checks pass.",
              },
              {
                q: "Which standard applies?",
                a: "Host declares FMVSS (US) or ECE R129/R44 (EU) from the label.",
              },
              {
                q: "Is it sanitized?",
                a: "Yes between renters—acknowledge at booking.",
              },
              {
                q: "What photo is required?",
                a: "Clear label photo on the listing.",
              },
              {
                q: "After a crash?",
                a: "Never relist—do not hand off.",
              },
            ],
          },
        "Cribs & Beds": {
            title: "Crib & portable sleep FAQ",
            summary: "Short answers for sleep standards, drop-sides, and mattress.",
            qa: [
              {
                q: "Are drop-sides allowed?",
                a: "No.",
              },
              {
                q: "What sleep standard is declared?",
                a: "CPSC, EN 716, or other regional standard from the label.",
              },
              {
                q: "Mattress requirements?",
                a: "Firm mattress/pad as published; sanitize the sleep surface.",
              },
              {
                q: "Bumpers or loose blankets?",
                a: "Do not use them.",
              },
              {
                q: "What does the renter acknowledge?",
                a: "Sleep standard, recall, mattress, and sanitize gates at booking.",
              },
            ],
          },
        "Strollers": {
            title: "Stroller rental FAQ",
            summary: "Short answers for type, weight limits, and hygiene.",
            qa: [
              {
                q: "What type is it?",
                a: "Travel, jogger, double, or other—stated on the listing.",
              },
              {
                q: "Age/weight limits?",
                a: "Stay within published limits.",
              },
              {
                q: "Is it sanitized?",
                a: "Yes between renters—high-touch baseline.",
              },
              {
                q: "Car-seat adapters?",
                a: "Only if listed—missing adapters are inventory claims.",
              },
              {
                q: "What to check at pickup?",
                a: "Brakes/wheels and recall status.",
              },
            ],
          },
        "Baby Carriers": {
            title: "Baby carrier FAQ",
            summary: "Short answers for weight limits, hygiene, and fit.",
            qa: [
              {
                q: "Age/weight limits?",
                a: "Stay within the published band (newborn vs toddler mode when noted).",
              },
              {
                q: "Is fabric sanitized?",
                a: "Yes between renters.",
              },
              {
                q: "Recall check?",
                a: "Required before rent.",
              },
              {
                q: "Fit guidance?",
                a: "Follow the manufacturer fit guide—no medical claims from Evorios.",
              },
              {
                q: "Damaged buckles?",
                a: "Do not rent—flag and stop handoff.",
              },
            ],
          },
        "Toys & Games": {
            title: "Toys & games FAQ",
            summary: "Short answers for age labels, small parts, and piece counts.",
            qa: [
              {
                q: "What age / hazard band?",
                a: "Keep 0+/3+/8+ (or listed) labels—do not remove them.",
              },
              {
                q: "Is it sanitized?",
                a: "Yes between renters.",
              },
              {
                q: "Small parts?",
                a: "Follow the published hazard band to avoid choking risk.",
              },
              {
                q: "How are pieces tracked?",
                a: "Count at pickup and return.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing pieces.",
              },
            ],
          },
        "Other": {
            title: "Other baby gear FAQ",
            summary: "Short answers when no named baby shelf fits.",
            qa: [
              {
                q: "Should I use Other?",
                a: "Prefer Car Seats, Cribs, Strollers, or Carriers for safety-critical gear.",
              },
              {
                q: "What basics apply?",
                a: "Age/weight when it touches a child, plus deposit and terms.",
              },
              {
                q: "Hygiene?",
                a: "Sanitize high-touch surfaces even on Other.",
              },
              {
                q: "What does the deposit cover?",
                a: "Condition documented at handoff.",
              },
              {
                q: "Missing specialized gates?",
                a: "Re-shelf to get expiry/sleep/install gates.",
              },
            ],
          },
        "Commercial Play Equipment": {
            title: "Commercial play equipment FAQ",
            summary: "Short answers for certification, capacity, and waiver.",
            qa: [
              {
                q: "What certification is declared?",
                a: "ASTM F1487 / CPSC / EN 1176 (or listed)—host declares honestly.",
              },
              {
                q: "Capacity?",
                a: "Do not exceed published capacity.",
              },
              {
                q: "Is a waiver required?",
                a: "Yes at booking.",
              },
              {
                q: "Sanitize between groups?",
                a: "Yes.",
              },
              {
                q: "What should be photographed?",
                a: "Setup at handoff; over-capacity is shared risk.",
              },
            ],
          },
        "Group Activity Gear": {
            title: "Group activity gear FAQ",
            summary: "Short answers for shared hygiene and piece inventory.",
            qa: [
              {
                q: "Sanitize between groups?",
                a: "Yes—plus recall check.",
              },
              {
                q: "Age band?",
                a: "Stay within the published age band.",
              },
              {
                q: "Piece inventory?",
                a: "Count pieces at pickup and return.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing pieces.",
              },
              {
                q: "Why the hygiene gate?",
                a: "Shared kid gear spreads germs and loses pieces quickly.",
              },
            ],
          },
        "Educational Tools": {
            title: "Educational tools FAQ",
            summary: "Short answers for age bands, cleaning, and chargers.",
            qa: [
              {
                q: "Age band?",
                a: "Use only within the published age range.",
              },
              {
                q: "Sanitize?",
                a: "Yes—clean touch surfaces between renters.",
              },
              {
                q: "Electronics with batteries?",
                a: "Recall-check; note chargers on inventory.",
              },
              {
                q: "What to check at handoff?",
                a: "Power-on and charger presence.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing chargers and damaged pieces.",
              },
            ],
          },
        "Safety Systems": {
            title: "Safety systems FAQ",
            summary: "Short answers for gates, monitors, and install paths.",
            qa: [
              {
                q: "How is it installed?",
                a: "Follow the published path: documented / renter with guide / pro.",
              },
              {
                q: "Pressure gates on stairs?",
                a: "Do not use pressure mounts at stair tops—hardware-mount only when required.",
              },
              {
                q: "Is hardware included?",
                a: "Count mounts/hardware at handoff and return.",
              },
              {
                q: "What does the renter acknowledge?",
                a: "Install path before unlock.",
              },
              {
                q: "Missing mounts?",
                a: "Inventory claim against deposit.",
              },
            ],
          },
        "Childcare Equipment": {
            title: "Childcare equipment FAQ",
            summary: "Short answers for high chairs, swings, and bouncers.",
            qa: [
              {
                q: "Age/weight limits?",
                a: "Stay within published limits.",
              },
              {
                q: "Sanitize what?",
                a: "Trays, harnesses, and other high-touch infant surfaces.",
              },
              {
                q: "Recall check?",
                a: "Required before rent.",
              },
              {
                q: "Broken harness?",
                a: "Do not rent—stop handoff.",
              },
              {
                q: "What does the renter acknowledge?",
                a: "Hygiene and recall gates at booking.",
              },
            ],
          },
      };

export const parentCategoryKey = "Baby & Kids" as const;
