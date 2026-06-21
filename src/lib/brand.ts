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
      subtitle: "Hours first · snap photo + price onto the shelf",
      cta: "Set up my sale →",
    },
    footer: "Sale items go on your garage shelf — photo first.",
  },
  openGarageSale: {
    title: "Open your garage",
    subtitle: "Set your hours, then snap items straight onto the sale shelf.",
    hoursTitle: "When are you open?",
    hoursHint: "Pick your day(s) and hours — auction items bid until you close. Followers get a heads-up when you're open.",
    daysLabel: "Day of week",
    timeLabel: "Open hours",
    timeFrom: "From",
    timeTo: "Until",
    presetsLabel: "Quick fill",
    neighborsSee: "Neighbors will see:",
    shelfTitle: "Stock the shelf",
    shelfHint: "Garage-sale snap — photo first, optional tag, price or auction. Not the full listing form.",
    shelfNote: "Each snap lands on your open shop · neighbors buy or bid",
    addItemsCta: "Snap onto shelf →",
    myGarageCta: "Preview active shop",
    mascotHint: "can help price odd items once they're on the shelf.",
  },
  snapSale: {
    eyebrow: "Garage sale shelf",
    title: "Snap a sale item",
    subtitle: "Photo on the table first — tag it if you want, then price or auction. On the shelf in seconds.",
    stepPhoto: "1 · Snap photo",
    stepTag: "2 · Tag & price",
    photoCta: "Tap to snap",
    photoHint: "One photo per item — like a tag on the table",
    cameraBtn: "Camera",
    libraryBtn: "Photos",
    noteLabel: "Quick tag (optional)",
    notePlaceholder: "e.g. Kids bike, works great",
    pricingLabel: "How neighbors buy",
    modeBuy: "Buy now",
    modeBid: "Auction",
    modeBoth: "Both",
    priceLabel: "Price",
    buyNowLabel: "Buy now price",
    startingBidLabel: "Starting bid",
    bothHint: "Buy now anytime · auction bids until your garage closes.",
    auctionWindowLabel: "Auction date & time",
    auctionWindowHint: "Uses your garage open hours above — bidding opens and closes on that schedule.",
    auctionTermsTitle: "Auction terms",
    auctionTermsBody:
      "Bidding runs during your garage open hours and ends when you close. When the auction ends, the high bidder must pay at checkout within 30 minutes. If payment isn't completed in time, the lot automatically goes to the next-highest bidder at their bid price.",
    publishCta: "Put on shelf →",
    publishing: "Adding to shelf…",
    defaultTitle: "Sale item",
    publishedTitle: "On your shelf!",
    publishedHintFirst: "Your garage shop is live — snap more or preview the shop.",
    publishedHintMore: "Another item tagged — keep snapping while you're open.",
    snapAnotherCta: "Snap another item",
    viewShopCta: "Preview my shop",
    mascotHint: "skips categories and long forms — this is garage-sale speed.",
  },
  garageAuction: {
    bidTerms:
      "By bidding you agree: auction ends when the garage closes. The high bidder pays at checkout within 30 minutes. If they don't pay, the lot goes to the next-highest bidder.",
    checkoutTerms:
      "Pay at checkout now. You have 30 minutes after the auction ends — if payment isn't completed, the lot automatically goes to the next-highest bidder.",
    runnerUpTitle: "You're the next bidder",
    runnerUpSubtitle: "The previous winner didn't pay in time — pay your bid within 30 minutes.",
    shopBanner: "Auction ends when garage closes → winner pays within 30 min or lot goes to next bidder",
    winBannerSuffix: "now (30 min)",
  },
  garageWorkflow: {
    eyebrow: "Your household garage",
    title: "How an open garage works",
    subtitle: "Three steps — not the normal listing form. This is your sale shelf on the block.",
    step1Title: "Set open hours",
    step1Body: "Pick day(s) and times so neighbors know when to stop by.",
    step2Title: "Snap onto the shelf",
    step2Body: "One photo, optional tag, price or auction — each item in seconds.",
    step3Title: "Neighbors shop your garage",
    step3Body: "They browse your shelf, buy now or bid until you close. Auction winners pay within 30 min or the lot passes to the next bidder.",
    cta: "Got it — snap my first item →",
    skip: "Skip intro",
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
