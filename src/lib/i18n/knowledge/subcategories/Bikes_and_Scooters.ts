import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Bikes & Scooters — host-facing Q→A only. */
export const subs_Bikes_and_Scooters: Record<string, CategoryFactBlock> = {
  "Mountain Bikes": {
    title: "Mountain bikes tips",
    summary: "Frame size, helmet/lock/overnight, and MTB waiver list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Frame/wheel band, helmet, lock, overnight storage, and a liability waiver (required or not_required).",
      },
      {
        q: "Is a waiver required?",
        a: "Hosts must publish required or not_required on Mountain Bikes before rent publish.",
      },
      {
        q: "Helmet / lock?",
        a: "Helmet and lock policies are required on every Bikes rent listing.",
      },
      {
        q: "Deposit?",
        a: "Covers frame/wheel damage and missing lock/helmet kit — not trail-injury insurance.",
      },
    ],
  },
  "Road Bikes": {
    title: "Road bikes tips",
    summary: "Frame size, helmet/lock, and overnight storage list.",
    qa: [
      {
        q: "What should I list?",
        a: "Frame/wheel band, helmet policy, lock policy, and overnight storage rule.",
      },
      {
        q: "Fit?",
        a: "Use frame size and the recommended rider-height band before you book.",
      },
      {
        q: "Deposit?",
        a: "Covers crash damage and missing lock/helmet — not race-entry insurance.",
      },
    ],
  },
  "E-Bikes": {
    title: "E tips",
    summary: "E-bike class, min rider age, battery/charger, and helmet/lock list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Min rider age, e-bike class (1–3 or not classified), helmet, lock, overnight, plus battery/charger fields when listed.",
      },
      {
        q: "Which class is it?",
        a: "Host lists Class 1, 2, 3, or not classified — local path rules may differ by class.",
      },
      {
        q: "Deposit?",
        a: "Covers bike/battery damage and missing charger — not e-bike insurance.",
      },
    ],
  },
  "Kids Bikes": {
    title: "Kids bikes tips",
    summary: "Guardian attestation and helmet required (not_required blocked).",
    qa: [
      {
        q: "Is a guardian required?",
        a: "Yes — an adult guardian must attest at booking before handoff can start.",
      },
      {
        q: "Can helmet be not required?",
        a: "No on Kids Bikes — not_required is blocked at publish.",
      },
      {
        q: "Deposit?",
        a: "Covers damage and missing kit — not child-injury insurance.",
      },
    ],
  },
  "Electric Scooters": {
    title: "E tips",
    summary: "Scooter class, min age when electric, helmet/lock/overnight list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Scooter class, helmet, lock, overnight storage, and min rider age when Electric is not no.",
      },
      {
        q: "Where can I ride?",
        a: "Follow local scooter laws and the published overnight / storage rule.",
      },
      {
        q: "Deposit?",
        a: "Covers scooter/battery damage and missing charger — not scooter insurance.",
      },
    ],
  },
  Cruisers: {
    title: "Cruisers tips",
    summary: "Frame size, helmet/lock, and overnight storage for beach/city cruisers.",
    qa: [
      {
        q: "What should I list?",
        a: "Frame/wheel band, helmet, lock, and overnight storage rule.",
      },
      {
        q: "Deposit?",
        a: "Covers damage and missing lock/helmet kit.",
      },
      {
        q: "Overnight?",
        a: "Outdoor overnight may void claims if the listing requires indoor or covered storage.",
      },
    ],
  },
  "E-Bikes Pro": {
    title: "Pro e tips",
    summary: "Same e-power requirements as E-Bikes with pro fleet expectations.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Min age, e-bike class, helmet, lock, overnight, and battery/charger disclosure.",
      },
      {
        q: "Fleet vs personal?",
        a: "Publish the same class and charge band so riders know assist limits at handoff.",
      },
      {
        q: "Deposit?",
        a: "Covers bike/battery damage and missing charger.",
      },
    ],
  },
  "Racing Bikes": {
    title: "Racing bikes tips",
    summary: "Frame size, helmet/lock, overnight, and racing waiver list.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Frame/wheel band, helmet, lock, overnight, and liability waiver (required or not_required).",
      },
      {
        q: "Is a waiver required?",
        a: "Hosts must publish required or not_required on Racing Bikes before rent publish.",
      },
      {
        q: "Deposit?",
        a: "Covers crash damage and missing kit — not race or medical insurance.",
      },
    ],
  },
  "Cargo Bikes": {
    title: "Cargo bikes tips",
    summary: "Payload band and child-passenger policy list with helmet/lock.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Cargo payload band, child passenger policy, helmet, lock, and overnight storage.",
      },
      {
        q: "Can kids ride as cargo?",
        a: "Only if the listing allows a child seat included or renter seat — adult_cargo_only blocks kids.",
      },
      {
        q: "Deposit?",
        a: "Covers overload damage and missing seats/locks — not cargo insurance.",
      },
    ],
  },
  "Professional Scooters": {
    title: "Pro scooters tips",
    summary: "Scooter class and e-power age requirements for fleet / pro scooters.",
    qa: [
      {
        q: "What should I fill in?",
        a: "Scooter class, helmet, lock, overnight, and min age when Electric is not no.",
      },
      {
        q: "Deposit?",
        a: "Covers scooter/battery damage and missing charger.",
      },
      {
        q: "Local rules?",
        a: "Follow local scooter laws and the published storage rule.",
      },
    ],
  },
  "Adaptive Bikes": {
    title: "Adaptive bikes tips",
    summary: "Adaptive subtype plus helmet/lock/overnight list.",
    qa: [
      {
        q: "What subtype is required?",
        a: "Handcycle, tandem, trike, recumbent, wheelchair attach, or other adaptive.",
      },
      {
        q: "What else lists?",
        a: "Helmet, lock, and overnight storage on every Bikes rent listing.",
      },
      {
        q: "Deposit?",
        a: "Covers damage and missing adaptive attachments.",
      },
    ],
  },
  Other: {
    title: "Other bikes tips",
    summary: "Prefer Mountain, Road, E-Bike, Kids, Scooter, Racing, Cargo, or Adaptive.",
    qa: [
      {
        q: "Should I use Other?",
        a: "move to a named category whenever a named Bikes shelf fits so age, waiver, payload, or adaptive details apply.",
      },
      {
        q: "What still applies?",
        a: "Helmet, lock, overnight storage, and bikes Other Kind still list on rent.",
      },
      {
        q: "Electric?",
        a: "If Electric = yes, min age and e-bike class still apply when it is a bike (not scooter).",
      },
      {
        q: "Deposit?",
        a: "Covers damage and missing lock/helmet kit.",
      },
    ],
  },
};

export const parentCategoryKey = "Bikes & Scooters" as const;
