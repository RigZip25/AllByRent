import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Photo & Video — host-facing Q→A only. */
export const subs_Photo_and_Video: Record<string, CategoryFactBlock> = {
  "Camera Kits": {
    title: "Camera kit tips",
    summary: "Say what you’re renting and what’s in the bag.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Camera model, whether it’s body-only or a full kit, sensor/mount if you know it, and a short list of what’s included.",
      },
      {
        q: "Body only or full kit?",
        a: "Pick what the renter actually gets: body only, body + lens, full kit, or accessories only.",
      },
      {
        q: "What about the deposit?",
        a: "Use it for drops and missing batteries, chargers, or cards against your list.",
      },
      {
        q: "Memory cards?",
        a: "Say if cards are included, partial, or the renter should bring their own.",
      },
    ],
  },
  "Action Cameras": {
    title: "Action camera tips",
    summary: "Model, mounts, and what’s waterproof.",
    qa: [
      {
        q: "What should I list?",
        a: "Model, what’s in the kit (mounts, batteries), and whether a waterproof housing is included.",
      },
      {
        q: "Is it waterproof?",
        a: "Only if the housing is on your checklist — otherwise assume it isn’t.",
      },
      {
        q: "Memory cards?",
        a: "Mark whether cards are included or the renter brings their own.",
      },
      {
        q: "Deposit?",
        a: "Covers cracked housings and missing mounts.",
      },
    ],
  },
  "Tripods & Mounts": {
    title: "Tripod tips",
    summary: "How much weight it holds and what head is included.",
    qa: [
      {
        q: "What should I fill in?",
        a: "How much weight it can hold, head type (ball, fluid, etc.), and whether plates or a spreader are included.",
      },
      {
        q: "Will it hold my camera?",
        a: "Use the payload band you rate it for — it’s your guide, not a lab certificate.",
      },
      {
        q: "Is a head included?",
        a: "Say ball, pan-tilt, fluid, gimbal head, legs only, or other.",
      },
      {
        q: "Deposit?",
        a: "Covers bent legs and missing plates.",
      },
    ],
  },
  "Basic Lighting": {
    title: "Lighting tips",
    summary: "Light type, power, and what’s in the kit.",
    qa: [
      {
        q: "What should I list?",
        a: "Light type, power (AC, battery, or both), and stands or softboxes in the kit.",
      },
      {
        q: "Battery or plug-in?",
        a: "Say AC, battery, both, or modifiers only.",
      },
      {
        q: "Deposit?",
        a: "Covers broken mounts and missing softboxes — not bulb life.",
      },
    ],
  },
  Drones: {
    title: "Drone tips",
    summary: "Weight class and Remote ID matter for local rules.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Weight class and Remote ID status (built-in, add-on, or under-250g exempt).",
      },
      {
        q: "Does the renter need a license?",
        a: "They must follow local law — Evorios records the facts; it doesn’t issue certificates.",
      },
      {
        q: "What’s in the kit?",
        a: "List batteries, props, and the controller.",
      },
      {
        q: "Deposit?",
        a: "Covers crashes and missing batteries or props.",
      },
    ],
  },
  "Cinema Cameras": {
    title: "Cinema camera tips",
    summary: "Body, media, and the full kit list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Sensor/mount class, whether media is included, and cages/batteries on the checklist.",
      },
      {
        q: "Who brings media?",
        a: "Say if cinema media is included or the renter provides it.",
      },
      {
        q: "Deposit?",
        a: "High-value deposit for the body and missing modules — not production insurance.",
      },
    ],
  },
  "Professional Lenses": {
    title: "Lens tips",
    summary: "Mount and focal length so it fits their body.",
    qa: [
      {
        q: "What should I list?",
        a: "Mount type, focal range, model, and caps/hoods in the kit.",
      },
      {
        q: "Will it fit my camera?",
        a: "Mount is the key — adapters only if you list them.",
      },
      {
        q: "Deposit?",
        a: "Covers glass damage and missing caps. Note fungus or haze in the description.",
      },
    ],
  },
  "Studio Lighting": {
    title: "Studio lighting tips",
    summary: "Class, power, and heavy stands.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Lighting class, power source, and stands / C-stands in the inventory.",
      },
      {
        q: "HMI or Fresnel?",
        a: "Mark the class and confirm power needs before pickup.",
      },
      {
        q: "Deposit?",
        a: "Covers heads and modifiers; mention spare bulbs in the notes if needed.",
      },
    ],
  },
  "Stabilizers & Rigs": {
    title: "Stabilizer tips",
    summary: "Gimbal type and how much it can carry.",
    qa: [
      {
        q: "What should I list?",
        a: "Stabilizer type, payload band, and batteries or cages in the kit.",
      },
      {
        q: "Payload?",
        a: "Use the band you rate it for — balance and tune at handoff.",
      },
      {
        q: "Deposit?",
        a: "Covers motors and missing batteries or chargers.",
      },
    ],
  },
  "Broadcast Gear": {
    title: "Broadcast gear tips",
    summary: "Switcher, encoder, and cables.",
    qa: [
      {
        q: "What should I fill in?",
        a: "What kind of box it is, media/capture policy, and I/O cables in the kit.",
      },
      {
        q: "Switcher or encoder?",
        a: "Pick the right type so livestream renters don’t book the wrong box.",
      },
      {
        q: "Deposit?",
        a: "Covers ports and missing SDI/HDMI kits.",
      },
    ],
  },
  Other: {
    title: "Other photo gear",
    summary: "Use this only when no named shelf fits.",
    qa: [
      {
        q: "When should I use Other?",
        a: "Only when Camera Kits, Action, Tripods, Lighting, Drones, Cinema, Lenses, Stabilizers, or Broadcast don’t fit.",
      },
      {
        q: "What should I publish?",
        a: "What it is, the model, and a clear kit checklist.",
      },
      {
        q: "Can I move it later?",
        a: "Yes — re-shelve to a named Photo category when it fits better.",
      },
    ],
  },
};

export const parentCategoryKey = "Photo & Video" as const;
