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
    rulesViewCta: "How selling works — pictures →",
    mascotHint: "can help price odd items once they're on the shelf.",
  },
  snapSale: {
    eyebrow: "Garage sale shelf",
    title: "Snap a sale item",
    subtitle: "Photo on the table first — tag it if you want, set your price. On the shelf in seconds.",
    stepPhoto: "1 · Snap photo",
    stepTag: "2 · Tag & price",
    photoCta: "Tap to snap",
    photoHint: "One photo per item — like a tag on the table",
    cameraBtn: "Camera",
    libraryBtn: "Photos",
    noteLabel: "Quick tag (optional)",
    notePlaceholder: "e.g. Kids bike, works great",
    pricingLabel: "How neighbors buy",
    modeQuick: "Quick sale",
    modeOpen: "Open to offers",
    quickHint: "Sticker price only — neighbors buy now, no offers.",
    openHint: "Buy now or make an offer — you accept, counter, or pass.",
    priceLabel: "Asking price",
    buyNowLabel: "Asking price",
    auctionWindowLabel: "Garage hours",
    auctionWindowHint: "Two or more offers → auction between them at close. You won't counter each one.",
    auctionTermsTitle: "How offers work",
    auctionTermsBody:
      "One neighbor → push to accept, counter, or decline. Two or more → auction between them. Winner pays within 30 minutes.",
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
    shopBanner: "Buy now · offers 1-on-1 · 2+ interested → auction at close",
    winBannerSuffix: "now (30 min)",
  },
  garageSaleRules: {
    eyebrow: "How selling works",
    title: "Rules in plain sight",
    subtitle: "Four pictures — how neighbors buy from your garage shelf.",
    step1Title: "Buy now",
    step1Body: "Sticker price on the shelf. Neighbor taps Buy — item sold, no waiting.",
    step2Title: "One neighbor interested",
    step2Body: "They make an offer. You get a push — accept, counter your price, or pass. Small back-and-forth until you agree.",
    step3Title: "Several neighbors interested",
    step3Body: "You don't negotiate with each one. An auction runs between them before you close — highest bid wins.",
    step4Title: "Winner pays fast",
    step4Body: "Auction winner pays within 30 minutes or the lot goes to the next bidder. No one cools off for days.",
    cta: "Got it — snap my first item →",
  },
  garageOffers: {
    sheetEyebrow: "Make an offer",
    sheetHint: "one-on-one with the host until two neighbors want it",
    sheetTerms:
      "If another neighbor offers too, this becomes an auction between interested buyers — the host stops countering individually.",
    sheetSubmit: "Send offer",
    myOfferTitle: "Your offer",
    waitingHost: "Waiting — your offer",
    hostWants: "Host wants",
    acceptCounter: "Accept",
    newOfferLabel: "Or offer more",
    sendNewOffer: "Send new offer",
    pendingHostBody: "Host is reviewing your offer — we'll push you when they accept, counter, or pass.",
    inboxTitle: "Neighbor offers",
    inboxSubtitle: "One-on-one — accept, counter, or decline",
    inboxEmptyTitle: "No offers yet",
    inboxEmptyBody: "When one neighbor makes an offer, it shows here. Two or more → auction instead.",
    inboxFootnote:
      "When two neighbors offer on the same item, offers close here and an auction starts between them automatically.",
    oneOnOneBadge: "1-on-1 offer",
    offerFrom: "Offer",
    accept: "Accept",
    counter: "Counter",
    counterLabel: "Your counter",
    makeOffer: "Offer",
    interestedLabel: "interested",
    auctionAuto: "Auction — interested neighbors only",
  },
  garageWorkflow: {
    eyebrow: "Your household garage",
    title: "How an open garage works",
    subtitle: "Three steps — not the normal listing form. This is your sale shelf on the block.",
    step1Title: "Set open hours",
    step1Body: "Pick day(s) and times so neighbors know when to stop by.",
    step2Title: "Snap onto the shelf",
    step2Body: "One photo, optional tag, asking price — quick sale or open to offers.",
    step3Title: "See the rules",
    step3Body: "Next screen shows pictures — buy now, one-on-one offers, group auction, fast payment.",
    cta: "Next — how selling works →",
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
