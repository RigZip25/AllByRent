import type { AppMessages } from "../types";

export const en: AppMessages = {
  tagline: "The evolution of ownership.",
  taglineShort: "Your garage, online.",
  modes: {
    earn: "My Garage",
    rent: "Browse",
  },
  nav: {
    home: "Home",
    stock: "Stock",
    garage: "Garage",
    more: "More",
  },
  profile: {
    language: "Language",
    languageAuto: "Auto (device)",
    languageValue: (label) => label,
  },
  onboarding: {
    roleChoice: {
      title: "What brings you here?",
      subtitle: "We'll set up your block or your garage.",
      stockGarage: {
        title: "Stock my garage",
        subtitle:
          "List what you own — borrow, sell, or pass along from your showcase.",
        cta: "Open my garage →",
      },
      browseBlock: {
        title: "Browse the block",
        subtitle: "Find gear, tools, and deals in neighborhood garages.",
        cta: "Choose where to browse →",
      },
      footer: "You can switch between My Garage and Browse anytime.",
    },
    location: {
      title: "Where's your block?",
      subtitle: "We show garages and shelves near you.",
      onBlock: {
        title: "I'm on my block",
        subtitle: "Use GPS or your street address — sort by distance from home.",
        cta: "Browse near me →",
      },
      trip: {
        title: "I'm visiting another area",
        subtitle: "Pick a city or neighborhood before you arrive.",
        cta: "Choose destination →",
      },
    },
    tripDestination: {
      title: "Where are you headed?",
      subtitle: "City or neighborhood where you'll pick up from a garage",
      ctaWithCity: (city) => `Browse garages near ${city} →`,
      ctaDefault: "Continue →",
    },
    allSet: {
      title: "You're all set!",
      subtitle: "Welcome to Evorios — the evolution of ownership.",
      exploreCta: "Choose how to browse →",
      stockGarageCta: "Stock my garage →",
    },
    browseHub: {
      title: "What brings you here?",
      subtitle: "Everyday browse or a yard-sale run.",
      findGear: {
        title: "Browse the block",
        subtitle: "Search items · Feed or Garages",
        cta: "Start browsing →",
      },
      yardSales: {
        title: "Yard & garage sales",
        subtitle: "Beta — snap sales & auctions on your block",
        cta: "Garage sales (Beta) →",
      },
      footer: "Rent & list anytime from Stock (+) or My Garage.",
    },
  },
};
