/** Evorios brand tokens — see docs/EVORIOS.md and docs/GARAGE_SHOWCASE.md */

export const APP_NAME = "Evorios";
export const APP_NAME_PRONUNCIATION = "eh-VOR-ee-ohs";

/** Product metaphor shown in UI (Garage Showcase / vitrina). */
export const PRODUCT_METAPHOR = "Garage Showcase";

/** Ties the name to the evolution narrative (EN UI). */
export const APP_TAGLINE = "Neighborly marketplace — the evolution of household living.";
export const APP_TAGLINE_SHORT = "Neighborly marketplace.";

/**
 * PWA install / home-screen labels.
 * `name` + `description` show on the install sheet; `short_name` / apple title sit under the icon.
 * Keep short_name ≤ ~12–14 chars so phones don’t clip to “Evorios…” with no meaning.
 */
export const PWA_APP_NAME = "Evorios — Neighborly Marketplace";
export const PWA_SHORT_NAME = "Evorios Market";
export const PWA_DESCRIPTION =
  "Neighborly marketplace — every home is a business cell that can rent, sell, or gift on the block.";

/** Russian reference copy for docs / future i18n. */
export const APP_TAGLINE_RU = "Соседский маркетплейс — эволюция ведения домашнего хозяйства.";
export const PWA_APP_NAME_RU = "Evorios — соседский маркетплейс";
export const PWA_DESCRIPTION_RU =
  "Соседский маркетплейс: каждый дом — бизнес-ячейка, которая сдаёт в аренду, продаёт или дарит из своей гаражной витрины.";

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
  earn: "Your home business cell — list, price, and share from your garage storefront.",
  rent: "Browse neighbor cells — borrow, buy, or pick up nearby.",
} as const;

/** Onboarding card copy — single source for garage showcase narrative */
export const ONBOARDING = {
  roleChoice: {
    title: "What brings you here?",
    subtitle: "We'll set up your block or your garage.",
    stockGarage: {
      title: "Stock my garage",
      subtitle: "List what you own — borrow, sell, or pass along from your showcase.",
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
    ctaWithCity: (city: string) => `Browse garages near ${city} →`,
    ctaDefault: "Continue →",
  },
  allSet: {
    title: "You're all set!",
    subtitle: "Welcome to Evorios — neighborly marketplace, the evolution of household living.",
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
        subtitle: "Snap sales & auctions on your block",
        cta: "Garage sales →",
      },
      categoriesTitle: "Browse by category",
      categoriesHint: "Jump straight into tools, garden plants, party gear, and more.",
      footer: "Rent & list anytime from Stock (+) or My Garage.",
    },
  firstHello: {
    mascotRole: "Your guide here",
    bubbles: [
      (mascot: string) => `Hi — I'm ${mascot}. Welcome to the block.`,
      "Every home is a business cell — rent, sell, or gift from your garage storefront.",
      "I'll help you browse neighbors or open your cell on the block.",
    ],
  },
} as const;

export const SUPPORT_EMAIL = "support@evorios.com";
export const MARKETING_URL = "https://evorios.com";
/** Production PWA origin (deep links, passkeys, Stripe return URLs). */
export const APP_ORIGIN = "https://app.evorios.com";
export const APP_HOST = "app.evorios.com";
/** Public marketing site — QR codes and outbound links to the web. */
export const LISTING_QR_BASE_URL = `${APP_ORIGIN}/item`;

/** Public legal pages on the marketing site. */
export const TERMS_URL = `${MARKETING_URL}/terms.html`;
export const PRIVACY_URL = `${MARKETING_URL}/privacy.html`;
export const REFUND_POLICY_URL = `${MARKETING_URL}/refunds.html`;

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

/**
 * Host-facing listing mode labels (wizard / offer setup).
 * Browse/renter UI uses "Buy" for the same mode — see feed chips & ItemDetail.
 * NOTE: EN-only constants — not currently rendered in UI; localize via getMessages
 * if/when wired into visible copy (listing.modes already covers wizard labels).
 */
export const LISTING_MODE_LABELS = {
  rent: "Rent",
  sell: "Sell",
  /** Legacy key — UI uses Sell @ $0 as free giveaway; label kept for old drafts. */
  gift: "Free",
} as const;

/**
 * @deprecated Prefer `getMessages().item.depositProtection` / `rentalPrice.depositProtection`
 * (or rentals.depositProtection). Kept for non-UI / legacy imports.
 */
export const DEPOSIT_PROTECTION_LABEL = "Deposit protection";
