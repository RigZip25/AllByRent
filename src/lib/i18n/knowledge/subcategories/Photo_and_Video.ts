import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Photo & Video */
export const subs_Photo_and_Video: Record<string, CategoryFactBlock> = {
        "Camera Kits": {
          title: "Camera kits \u2014 sensor, media, kit list",
          summary: "Bodies and kits freeze sensor/mount, media policy, and inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Model, kit class, sensor/mount, media include, and kit inventory items/checklist.",
            },
            {
              q: "Body only vs full kit?",
              a: "kitIncludes freezes body-only, kit lens, full kit, or accessories-only.",
            },
            {
              q: "Deposit?",
              a: "Covers drops and missing batteries/chargers/cards against the list.",
            },
            {
              q: "Partner promo?",
              a: "No retailer affiliate hard-sell.",
            },
          ],
        },
        "Action Cameras": {
          title: "Action cameras \u2014 mount, media, sensor",
          summary: "Action cams freeze sensor class, media, and mounts in the kit list.",
          qa: [
            {
              q: "What must be listed?",
              a: "Model, kit class, sensor/mount band, media policy, and inventory for mounts/batteries.",
            },
            {
              q: "Waterproof housing?",
              a: "Disclose in kit checklist \u2014 assume not included unless listed.",
            },
            {
              q: "Media?",
              a: "Hosts mark cards included, partial, renter brings, or internal-only.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked housings and missing mounts.",
            },
          ],
        },
        "Tripods & Mounts": {
          title: "Tripods \u2014 payload, head type",
          summary: "Supports freeze payload band and head type before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Payload band, head type, kit class, and inventory for plates/spreaders.",
            },
            {
              q: "Will it hold my camera?",
              a: "Payload band is the host\u2019s rated class \u2014 not a lab certification.",
            },
            {
              q: "Head included?",
              a: "Hosts mark ball, pan-tilt, fluid, gimbal head, legs-only, or other.",
            },
            {
              q: "Deposit?",
              a: "Covers bent legs and missing plates.",
            },
          ],
        },
        "Basic Lighting": {
          title: "Basic lighting \u2014 class, power",
          summary: "LED/flash kits freeze lighting class and power source.",
          qa: [
            {
              q: "What must be listed?",
              a: "Lighting class, power source, kit class, and stands/modifiers in inventory.",
            },
            {
              q: "Battery or AC?",
              a: "Power source freezes AC, battery, both, or passive modifiers only.",
            },
            {
              q: "Deposit?",
              a: "Covers broken mounts and missing softboxes \u2014 not lamp life insurance.",
            },
            {
              q: "Partner promo?",
              a: "No lighting-vendor affiliate hard-sell.",
            },
          ],
        },
        "Drones": {
          title: "Drones \u2014 weight class, Remote ID",
          summary: "Drone rentals freeze FAA-style weight class and Remote ID hardware status.",
          qa: [
            {
              q: "What gates apply?",
              a: "Weight class and Remote ID (built-in, add-on, or under-250g exempt). Exempt requires under-250g weight.",
            },
            {
              q: "Pilot license?",
              a: "Follow local law \u2014 Evorios freezes Remote ID facts; it does not issue certificates.",
            },
            {
              q: "Kit?",
              a: "Batteries, props, and controllers belong on the kit inventory.",
            },
            {
              q: "Partner promo?",
              a: "No drone-insurance affiliate hard-sell.",
            },
          ],
        },
        "Cinema Cameras": {
          title: "Cinema cameras \u2014 sensor, media",
          summary: "Cinema bodies freeze sensor class and media policy plus kit inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Sensor/mount class, media include, kit class, and full inventory for cages/batteries.",
            },
            {
              q: "Who brings media?",
              a: "Media field freezes included vs renter-provided cinema media.",
            },
            {
              q: "Deposit?",
              a: "High-value deposit covers body and missing modules \u2014 not production insurance.",
            },
            {
              q: "Partner promo?",
              a: "No cinema-rental-house affiliate hard-sell.",
            },
          ],
        },
        "Professional Lenses": {
          title: "Lenses \u2014 mount, focal band",
          summary: "Lenses freeze mount and focal class before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Mount type, focal band, model, and caps/hoods in kit inventory.",
            },
            {
              q: "Will it fit my body?",
              a: "Mount field is the gate \u2014 adapters only if listed in the kit.",
            },
            {
              q: "Deposit?",
              a: "Covers glass damage and missing caps \u2014 fungus disclosure belongs in notes.",
            },
            {
              q: "Partner promo?",
              a: "No lens-subscription affiliate hard-sell.",
            },
          ],
        },
        "Studio Lighting": {
          title: "Studio lighting \u2014 class, power",
          summary: "Studio lights freeze class and power like basic lighting with heavier kits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Lighting class, power source, kit class, and inventory for stands/c-stands.",
            },
            {
              q: "HMI / Fresnel?",
              a: "Class field includes HMI/Fresnel \u2014 confirm power needs before pickup.",
            },
            {
              q: "Deposit?",
              a: "Covers heads and modifiers; bulbs disclosed separately in notes.",
            },
            {
              q: "Partner promo?",
              a: "No studio-expendables affiliate hard-sell.",
            },
          ],
        },
        "Stabilizers & Rigs": {
          title: "Stabilizers \u2014 type, payload",
          summary: "Gimbals and rigs freeze type and payload band.",
          qa: [
            {
              q: "What must be listed?",
              a: "Stabilizer type, payload band, kit class, and batteries/cages in inventory.",
            },
            {
              q: "Payload?",
              a: "Payload band is host-rated \u2014 balance and tune at handoff.",
            },
            {
              q: "Deposit?",
              a: "Covers motors and missing batteries/chargers.",
            },
            {
              q: "Partner promo?",
              a: "No gimbal-brand affiliate hard-sell.",
            },
          ],
        },
        "Broadcast Gear": {
          title: "Broadcast \u2014 subtype, media",
          summary: "Switchers and encoders freeze subtype and media/capture policy.",
          qa: [
            {
              q: "What gates apply?",
              a: "Broadcast subtype, media include, kit class, and I/O cables in inventory.",
            },
            {
              q: "Switcher vs encoder?",
              a: "Subtype stops wrong-box bookings for livestream days.",
            },
            {
              q: "Deposit?",
              a: "Covers ports and missing SDI/HDMI kits.",
            },
            {
              q: "Partner promo?",
              a: "No broadcast-integrator affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Photo other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind and kit inventory.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Photo shelf fits.",
            },
            {
              q: "What gates publish?",
              a: "Kind, model, kit class, and kit inventory checklist.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Camera Kits, Action, Tripods, Lighting, Drones, Cinema, Lenses, Stabilizers, or Broadcast when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no gear-affiliate hard-sell.",
            },
          ],
        },
      };

export const parentCategoryKey = "Photo & Video" as const;
