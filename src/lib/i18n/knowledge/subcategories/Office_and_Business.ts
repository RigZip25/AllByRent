import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Office & Business */
export const subs_Office_and_Business: Record<string, CategoryFactBlock> = {
        "Printers": {
          title: "Printers \u2014 tech, paper, ink, storage wipe",
          summary: "Office printers rent cleanly when tech, paper size, ink/toner, and storage/wipe are frozen.",
          qa: [
            {
              q: "What gates apply?",
              a: "Brand, model, printer tech, paper size, ink/toner include, storage status, and wipe plan when storage is present.",
            },
            {
              q: "Is ink included?",
              a: "Hosts mark ink/toner included, partial, renter provides, or unknown\u2014assume nothing ships full unless listed.",
            },
            {
              q: "Do printers need a wipe?",
              a: "Yes when the unit has onboard storage or accounts. Host declares wipe-before-list, wipe-at-handoff, or renter-responsible.",
            },
            {
              q: "Deposit?",
              a: "Covers jams beyond fair wear, missing trays/cables, and physical damage\u2014not print-quality insurance.",
            },
          ],
        },
        "Monitors & Displays": {
          title: "Monitors \u2014 size, panel, inputs",
          summary: "Displays need size, panel, and input/cable kit before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Size band, panel type, inputs/cables, storage status (usually no), and a kit checklist for stands/adapters.",
            },
            {
              q: "Are cables included?",
              a: "Input kit freezes HDMI-only through multi-input kits\u2014do not assume a dock ships.",
            },
            {
              q: "Wipe?",
              a: "Only if the display stores accounts or schedules; most panels are no_storage.",
            },
            {
              q: "Partner promo?",
              a: "No monitor-affiliate hard-sell.",
            },
          ],
        },
        "Webcams & Streaming": {
          title: "Webcams \u2014 resolution, mic, wipe",
          summary: "Streaming cams freeze resolution, mic include, and storage/wipe when accounts remain.",
          qa: [
            {
              q: "What gates apply?",
              a: "Resolution band, mic include, storage status, wipe when storage/accounts, and kit list for mounts/cables.",
            },
            {
              q: "Built-in mic?",
              a: "Hosts mark built-in, none, or external mic kit.",
            },
            {
              q: "Accounts?",
              a: "If the cam stays linked to a host account, mark storage and publish a wipe/unlink plan.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked housings and missing mounts\u2014not stream-quality guarantees.",
            },
          ],
        },
        "Office Furniture": {
          title: "Office furniture \u2014 type, size, condition",
          summary: "Desks and chairs skip device wipe; freeze type, size/seats, and condition.",
          qa: [
            {
              q: "What gates apply?",
              a: "Furniture type, size/seat band, and condition grade. No device storage wipe on this shelf.",
            },
            {
              q: "Assembly?",
              a: "Publish what ships assembled vs flat-pack in notes/kit list. Deposit covers missing hardware.",
            },
            {
              q: "Data wipe?",
              a: "Not required for furniture\u2014use Printers/POS/Servers for devices with storage.",
            },
            {
              q: "Partner promo?",
              a: "No office-furniture affiliate hard-sell.",
            },
          ],
        },
        "Presentation Gear": {
          title: "Presentation \u2014 device, lumens/size, cables",
          summary: "Projectors and screens freeze device type, brightness/size, and storage/wipe when networked.",
          qa: [
            {
              q: "What must be listed?",
              a: "Device type, lumens or screen size, storage status, wipe when applicable, and cable/remote kit.",
            },
            {
              q: "Lamp / bulb?",
              a: "Disclose remaining lamp life in notes when known. Deposit is not a free lamp replacement plan.",
            },
            {
              q: "Wipe?",
              a: "Networked conference displays with accounts need storage + wipe status.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked screens, missing remotes/cables, and drop damage.",
            },
          ],
        },
        "Large Format Printers": {
          title: "Large format \u2014 width, ink class, wipe",
          summary: "Plotters need max width, ink class, ink include, and wipe when jobs are stored.",
          qa: [
            {
              q: "What gates apply?",
              a: "Max media width, ink class, ink/toner include, storage + wipe, and kit inventory for stands/roll holders.",
            },
            {
              q: "Who brings media?",
              a: "Assume renter brings rolls unless the kit list says media is included.",
            },
            {
              q: "Wipe?",
              a: "Required when onboard storage holds jobs\u2014host wipe plan freezes before booking.",
            },
            {
              q: "Partner promo?",
              a: "No plotter-lease affiliate hard-sell.",
            },
          ],
        },
        "POS Systems": {
          title: "POS \u2014 terminal, payments, wipe",
          summary: "POS rentals freeze terminal type, payment readiness, and a wipe plan for stored credentials.",
          qa: [
            {
              q: "What must be listed?",
              a: "POS type, payment readiness, storage status, wipe plan, and kit list for drawers/readers/cables.",
            },
            {
              q: "Who provides the card reader?",
              a: "Reader included, software-only, renter brings reader, or cash-only kit.",
            },
            {
              q: "Wipe required?",
              a: "Yes when storage is present or unknown\u2014POS holds merchant credentials. Host wipe status is required.",
            },
            {
              q: "Cyber cover?",
              a: "Evorios does not sell cyber insurance\u2014wipe attestation is the privacy layer.",
            },
          ],
        },
        "Commercial Copiers": {
          title: "Copiers \u2014 duty, finishers, wipe",
          summary: "Commercial copiers freeze duty class, finishers, ink, and wipe for stored jobs.",
          qa: [
            {
              q: "What gates apply?",
              a: "Duty band, finishers, ink/toner include, storage + wipe, and move notes in the kit list.",
            },
            {
              q: "Finisher?",
              a: "Hosts mark stapler finisher, booklet, none, or unknown.",
            },
            {
              q: "Wipe?",
              a: "Copiers with hard disks need wipe-before-list, wipe-at-handoff, or renter-responsible.",
            },
            {
              q: "Deposit?",
              a: "Covers panels, trays, and finishers\u2014not print SLA insurance.",
            },
          ],
        },
        "Conference Systems": {
          title: "Conference \u2014 system, seats, wipe",
          summary: "Room kits freeze system type, seat band, and wipe when accounts remain linked.",
          qa: [
            {
              q: "What must be listed?",
              a: "System type, seat/room band, storage status, wipe when accounts exist, and mic/cam kit list.",
            },
            {
              q: "Room size fit?",
              a: "Seat band (huddle through hall) sets expectation\u2014do not book a huddle kit for a 20-person room.",
            },
            {
              q: "Accounts?",
              a: "Zoom/Teams room logins count as storage\u2014publish unlink/wipe status.",
            },
            {
              q: "Partner promo?",
              a: "No conference-vendor affiliate hard-sell.",
            },
          ],
        },
        "Server Equipment": {
          title: "Servers \u2014 form factor, wipe, rack notes",
          summary: "Servers and NAS always need a wipe plan plus form factor and rack/power notes.",
          qa: [
            {
              q: "What gates apply?",
              a: "Form factor, storage status, required wipe plan, and recommended rack/power notes plus kit inventory.",
            },
            {
              q: "Is wipe optional?",
              a: "No\u2014server shelves require wipe-before-list, wipe-at-handoff, or renter-responsible before publish.",
            },
            {
              q: "Rack rails?",
              a: "Publish rails/PDU/network needs in rack notes. Deposit is not a free install tech.",
            },
            {
              q: "Cyber cover?",
              a: "Platform does not insure data loss\u2014wipe attestation is mandatory.",
            },
          ],
        },
        "Other": {
          title: "Office other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind, storage/wipe when needed, and kit list.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Office shelf fits. Named shelves carry wipe, size, or duty gates renters expect.",
            },
            {
              q: "What still gates publish?",
              a: "Kind, model, storage/wipe for devices, and kit inventory (except pure furniture kinds).",
            },
            {
              q: "Re-shelf?",
              a: "Move to Printers, Monitors, Webcams, Furniture, Presentation, Large Format, POS, Copiers, Conference, or Servers when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no office-supply affiliate hard-sell.",
            },
          ],
        },
      };

export const parentCategoryKey = "Office & Business" as const;
