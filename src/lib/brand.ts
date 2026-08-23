/** Evorios brand tokens — see docs/EVORIOS.md and docs/GARAGE_SHOWCASE.md */

export const APP_NAME = "Evorios";
export const APP_NAME_PRONUNCIATION = "eh-VOR-ee-ohs";

/** Product metaphor shown in UI (Garage Showcase / vitrina). */
export const PRODUCT_METAPHOR = "Garage Showcase";

/** Ties the name to neighbor storefronts (EN UI). */
export const APP_TAGLINE = "Neighbors share what you need — borrow nearby, or list what you own.";
export const APP_TAGLINE_SHORT = "Borrow nearby. Share what you own.";

/**
 * PWA install / home-screen labels.
 * `name` + `description` show on the install sheet; `short_name` / apple title sit under the icon.
 * Keep short_name ≤ ~12–14 chars so phones don’t clip to “Evorios…” with no meaning.
 */
export const PWA_APP_NAME = "Evorios — Neighborly Marketplace";
export const PWA_SHORT_NAME = "Evorios Market";
export const PWA_DESCRIPTION =
  "Borrow cameras, furniture, bags, and more from neighbors — or share yours. New flat, work trip, or local block.";

/** Russian reference copy for docs / future i18n. */
export const APP_TAGLINE_RU = "Соседи делятся тем, что нужно — бери рядом или выставляй своё.";
export const PWA_APP_NAME_RU = "Evorios — соседский маркетплейс";
export const PWA_DESCRIPTION_RU =
  "Камера, мебель, рюкзак у соседей рядом — или выставь своё. Новоселье, командировка или свой блок.";

export const BRAND_GREEN = "#0D5C3A";
export const BRAND_AMBER = "#F59E0B";
/** Browse (rent) path accent — warm orange so it reads apart from Garage green. */
export const BRAND_BROWSE_ORANGE = "#FF8A3D";
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

/** Onboarding card copy — single source for garage storefront narrative */
export const ONBOARDING = {
  roleChoice: {
    title: "How do you want to start?",
    subtitle: "Open your storefront, or browse the block.",
    stockGarage: {
      title: "Open my business",
      subtitle: "List, price, and share from your garage storefront.",
      cta: "Open My Garage →",
    },
    browseBlock: {
      title: "Browse the block",
      subtitle: "Find gear, tools, and deals in neighbor garages.",
      cta: "Choose where to browse →",
    },
    footer: "Switch between My Garage and Browse anytime.",
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
    subtitle: "My Garage is your storefront toolkit. Home is how you browse the block.",
    exploreCta: "Go to Home →",
    stockGarageCta: "Open My Garage →",
  },
    browseHub: {
      title: "Your block",
      subtitle: "Browse neighbors or run a sale.",
      findGear: {
        title: "Browse the block",
        subtitle: "Items and garages near you",
        cta: "Open feed →",
      },
      yardSales: {
        title: "Yard & garage sales",
        subtitle: "Snap sales and auctions on your block",
        cta: "Open sales →",
      },
      categoriesTitle: "Browse by category",
      categoriesHint: "Tools, garden plants, party gear, and more.",
      footer: "Stock and manage from + or My Garage.",
    },
  firstHello: {
    mascotRole: "Your guide here",
    bubbles: [
      "Hi, I'm Evorios — your home business assistant.",
      "Built so your household can earn from things that sit idle or rarely get used.",
      "Earn or save — skip buying extras, with tools built right into the platform.",
    ],
  },
} as const;

export const SUPPORT_EMAIL = "support@evorios.com";
export const MARKETING_URL = "https://evorios.com";
export const MARKETING_HOST = "evorios.com";
/** Production PWA origin (deep links, passkeys, Stripe return URLs). */
export const APP_ORIGIN = "https://app.evorios.com";
export const APP_HOST = "app.evorios.com";
/**
 * Public origin for programmatic /rent SEO landings (canonical, sitemap).
 * Served on the apex via marketing-site proxy; app keeps the generator + live data.
 */
export const SEO_ORIGIN = MARKETING_URL;
export const SEO_HOST = MARKETING_HOST;
/** Public marketing site — QR codes and outbound links to the web. */
export const LISTING_QR_BASE_URL = `${APP_ORIGIN}/item`;

/** True when the page is on the apex marketing host (proxied /rent landings). */
export function isSeoApexHost(hostname = typeof window !== "undefined" ? window.location.hostname : ""): boolean {
  const host = hostname.trim().toLowerCase();
  return host === SEO_HOST || host === `www.${SEO_HOST}`;
}

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
