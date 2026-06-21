/** Evorios brand tokens — see docs/EVORIOS.md and docs/GARAGE_SHOWCASE.md */

export const APP_NAME = "Evorios";
export const APP_NAME_PRONUNCIATION = "eh-VOR-ee-ohs";

/** Product metaphor shown in UI (Garage Showcase / vitrina). */
export const PRODUCT_METAPHOR = "Garage Showcase";

/** Ties the name to the evolution narrative (EN UI). */
export const APP_TAGLINE = "The evolution of your household.";
export const APP_TAGLINE_SHORT = "Your garage, online.";

/** Russian reference copy for docs / future i18n. */
export const APP_TAGLINE_RU = "Эволюция вашего домашнего хозяйства.";

export const BRAND_GREEN = "#0D5C3A";
export const BRAND_AMBER = "#F59E0B";
export const BRAND_GREEN_LIGHT = "#1A9E6E";
export const SPLASH_BG_DARK = "#062a1c";
export const SPLASH_GRADIENT = `linear-gradient(165deg, ${SPLASH_BG_DARK} 0%, ${BRAND_GREEN} 42%, #0a3d28 100%)`;

/** Mascot — Mr. Evorios (legacy Rentano character art). */
export const MASCOT_NAME = "Mr. Evorios";

/** Prefix for mascot chat bubbles in UI. */
export function mascotSays(message: string): string {
  return `${MASCOT_NAME}: ${message}`;
}

/** Home feed modes — internal keys stay earn/rent for storage compatibility. */
export const APP_MODE_LABELS = {
  earn: "My Garage",
  rent: "Browse",
} as const;

export const APP_MODE_DESCRIPTIONS = {
  earn: "Your household garage showcase — list, price, and share what you own.",
  rent: "Browse neighborhood garages — borrow, buy, or pick up nearby.",
} as const;

/** Onboarding card copy — single source for garage showcase narrative */
export const ONBOARDING = {
  roleChoice: {
    title: "What brings you here?",
    subtitle: "We'll set up your block or your garage.",
    stockGarage: {
      title: "Stock my garage",
      subtitle: "List what you own — borrow, sell, or pass along from your showcase.",
      cta: "Open my showcase →",
    },
    browseBlock: {
      title: "Browse the block",
      subtitle: "Find gear, tools, and deals in neighborhood garages nearby.",
      cta: "See garages near me →",
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
    ctaWithCity: (city: string) => `Browse garages near ${city} →`,
    ctaDefault: "Continue →",
  },
  allSet: {
    title: "You're all set!",
    subtitle: "Welcome to Evorios — the evolution of your household.",
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
      subtitle: "Drive the neighborhood — browse or open yours",
      cta: "Garage sales →",
    },
    footer: "Rent & list anytime from Stock (+) or My Garage.",
  },
  yardSaleHub: {
    title: "Garage sales",
    subtitle: "Browse who's open — or set up your own sale.",
    browse: {
      title: "Browse open garages",
      subtitle: "See who's open today on your block",
      cta: "See open sales →",
    },
    host: {
      title: "Open my garage",
      subtitle: "Pick hours · snap items — no category forms",
      cta: "Set up my sale →",
    },
    footer: "Sale items go on your garage shelf — photo first.",
  },
  openGarageSale: {
    title: "Open your garage",
    subtitle: "Tell neighbors when you're open, then stock the shelf.",
    hoursTitle: "When are you open?",
    hoursHint: "Pick your day(s) and hours — followers get a heads-up when you're open.",
    daysLabel: "Day of week",
    timeLabel: "Open hours",
    timeFrom: "From",
    timeTo: "Until",
    presetsLabel: "Quick fill",
    neighborsSee: "Neighbors will see:",
    shelfTitle: "Your sale shelf",
    shelfHint: "Snap what's on the table — title, price, done. We skip category pickers for garage sales.",
    shelfNote: "Items show as For sale on your garage · neighbors browse like a yard sale",
    addItemsCta: "Snap sale items →",
    myGarageCta: "Preview active shop",
    mascotHint: "can help price odd items once they're on the shelf.",
  },
  firstHello: {
    mascotRole: "Your garage guide",
    bubbles: [
      (mascot: string, product: string) =>
        `Hey! I'm ${mascot} — your guide to the ${product}.`,
      "Open your garage showcase or browse what's on the block.",
      "Tap me in the menu anytime — neighbor help, any language, 24/7.",
    ],
  },
} as const;

export const SUPPORT_EMAIL = "support@evorios.com";
export const MARKETING_URL = "https://evorios.com";

/** QR sticker PDF download names (user-visible). */
export const QR_PDF_FILENAMES = {
  sticker: "Evorios-QR-Sticker.pdf",
  stickerLetter: "Evorios-QR-Sticker-Letter.pdf",
  stickerA4: "Evorios-QR-Sticker-A4.pdf",
  sticker3x3: "Evorios-QR-Sticker-3x3.pdf",
  stickers: "Evorios-QR-Stickers.pdf",
  stickersBulk: "Evorios-QR-Stickers-Bulk.pdf",
  stickersBulkLetter: "Evorios-QR-Stickers-Bulk-Letter.pdf",
} as const;

/** Stage 1 listing modes shown in UI (RTO removed; enum kept in types). */
export const LISTING_MODE_LABELS = {
  rent: "Rent",
  sell: "Buy",
  gift: "Gift",
} as const;

/** Risk copy — Stage 1 deposit only, not insurance. */
export const DEPOSIT_PROTECTION_LABEL = "Deposit protection";
