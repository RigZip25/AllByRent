import { APP_MODE_LABELS, APP_NAME, DEPOSIT_PROTECTION_LABEL, MASCOT_NAME, PRODUCT_METAPHOR } from "../lib/brand";

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
};

export const RENTANO_FAQ: FaqItem[] = [
  {
    id: "what-is",
    category: "Getting started",
    question: `What is ${APP_NAME}?`,
    answer:
      `${APP_NAME} is a neighborhood ${PRODUCT_METAPHOR}: every household has a garage storefront on the block. Search what you need, browse nearby shelves, or stock your own garage with the + button.`,
    keywords: ["about", "platform", "garage"],
  },
  {
    id: "home-feed",
    category: "Getting started",
    question: "How does Home work?",
    answer:
      `Home is your window on the block. Search at the top, filter by Rent · Buy · Gift, and switch between Feed (items) and Garages (neighbor storefronts). Tap the center + to list from your garage.`,
    keywords: ["home", "feed", "search", "browse"],
  },
  {
    id: "garage-tab",
    category: "Getting started",
    question: `What is the ${APP_MODE_LABELS.earn} tab?`,
    answer:
      `The Garage tab is your household storefront — active listings, booking requests, and stats. Settings (gear icon) opens your profile. Stock items anytime with the center + button.`,
    keywords: ["garage", "host", "supply"],
  },
  {
    id: "location-rent",
    category: "Getting started",
    question: "Why do I need to set my block?",
    answer:
      "We show garages and items in your cluster (25 mi by default). Set your block during onboarding or tap the location chip on Home. Rural or sparse? Tap Search wider for 50+ mi.",
    keywords: ["gps", "address", "where", "cluster"],
  },
  {
    id: "install-pwa",
    category: "Getting started",
    question: "How do I install the app on my phone?",
    answer:
      `Tap ${MASCOT_NAME} in the bottom menu for install tips, or use Add to Home Screen. On iPhone: Share → Add to Home Screen. On Android: use the browser install prompt when it appears.`,
    keywords: ["pwa", "home screen", "install"],
  },
  {
    id: "list-first",
    category: "Hosting & listings",
    question: "How do I list my first item?",
    answer:
      `Tap the green + in the footer (or Garage tab → Add), then follow the wizard: photos, item info, Rent/Buy/Gift pricing, pickup, availability, QR, and review. ${MASCOT_NAME} helps on each step.`,
    keywords: ["sell", "post", "wizard", "stock"],
  },
  {
    id: "photos-ai",
    category: "Hosting & listings",
    question: "What happens after I add photos?",
    answer:
      `On step 1, when you continue, ${MASCOT_NAME} analyzes your photos and suggests title, category, condition, description, and estimated value. You can edit everything on step 2.`,
    keywords: ["ai", "analyze", "camera"],
  },
  {
    id: "pricing-modes",
    category: "Hosting & listings",
    question: "Which pricing modes should I choose?",
    answer:
      "Rent is most common. Add Buy if you want to sell, or Gift for free items. Step 3 shows only fields relevant to the modes you turn on.",
    keywords: ["daily", "weekly", "deposit"],
  },
  {
    id: "replacement-value",
    category: "Hosting & listings",
    question: "What is replacement value?",
    answer:
      `It is the cost to replace the item new today — used for ${DEPOSIT_PROTECTION_LABEL.toLowerCase()} and rent eligibility. Use current retail price, not used price. AI suggests a value from your photos.`,
    keywords: ["deposit", "value", "estimated"],
  },
  {
    id: "qr-sticker",
    category: "QR & pickup",
    question: "Why do I need a QR sticker?",
    answer:
      "For rentals, a physical QR on the item helps verify handoff. After publish you may print a sticker or use the on-screen QR story. Buy-only or gift-only listings may skip the sticker.",
    keywords: ["code", "scan", "sticker"],
  },
  {
    id: "pickup-delivery",
    category: "QR & pickup",
    question: "How do pickup and delivery work?",
    answer:
      "On step 4 choose in-person pickup, contactless pickup (exact address shared with your confirmed renter after booking; lockbox and gate codes unlock at check-in PIN), and/or round-trip delivery with your own fee and max miles.",
    keywords: ["handoff", "meet", "drop off"],
  },
  {
    id: "book-item",
    category: "Renting",
    question: "How do I rent an item?",
    answer:
      "Search on Home or browse the Feed, open an item, and request a booking. You'll authorize rental payment and any deposit hold separately. Track active rentals from the bookings icon on Home.",
    keywords: ["borrow", "reserve", "request"],
  },
  {
    id: "post-request",
    category: "Renting",
    question: "Nothing shows up in search — what now?",
    answer:
      "Post a request from the empty search result. Neighbors with the right gear can respond. No fake counts — we show real listings on your block as garages fill up.",
    keywords: ["request", "empty", "search"],
  },
  {
    id: "notifications",
    category: "Renting",
    question: "Where are my notifications?",
    answer:
      "Tap the bell on Home. Tabs show All, Bookings, and Messages.",
    keywords: ["bell", "messages", "alerts"],
  },
  {
    id: "payments",
    category: "Payments & safety",
    question: "How do payments work?",
    answer:
      `Rentals: pay the rental total, then a separate ${DEPOSIT_PROTECTION_LABEL.toLowerCase()} hold if the host set a deposit. Payments run through Stripe — ${APP_NAME} does not store your card. Hosts connect Stripe for payouts.`,
    keywords: ["stripe", "card", "money", "deposit"],
  },
  {
    id: "dispute",
    category: "Payments & safety",
    question: "Something went wrong with a rental — what now?",
    answer:
      `Document the issue with photos and messages in the app. For urgent safety issues contact local authorities first. ${MASCOT_NAME} can guide you on next in-app steps but cannot decide disputes alone.`,
    keywords: ["damage", "problem", "refund"],
  },
  {
    id: "availability-step5",
    category: "Hosting & listings",
    question: "How do I set my availability in step 5?",
    answer:
      "Step 5 lets you control when renters can book handoffs:\n• Tap the Sat or Sun day chip to reveal separate weekend hours — weekday and weekend times are set independently.\n• Adjust start and end times for weekdays (Mon–Fri) and weekends (Sat–Sun) using the From / To time pickers that appear once a day is selected.\n• Pause your listing temporarily with the Pause toggle — it hides your item from search instantly without deleting it. Turn it back on when you're available again.\n• Block specific dates (e.g. a vacation) using the date picker: tap + Add blocked period, pick a start and end date, then tap Block this period. Remove any blocked range by tapping Remove next to it.",
    keywords: ["hours", "weekend", "pause", "block", "dates", "schedule", "times"],
  },
  {
    id: "skip-onboarding",
    category: "Getting started",
    question: "Can I skip onboarding?",
    answer:
      "Yes — Skip on intro screens sends you to set your block, then straight to Home. You can finish location later from the location chip on Home.",
    keywords: ["skip", "later"],
  },
  {
    id: "bottom-nav",
    category: "Navigation",
    question: "What do the bottom menu buttons do?",
    answer:
      `Home = browse & search. ${MASCOT_NAME} = help (FAQ + chat). Green + = stock a new item. Garage = your storefront & earnings. More = profile, rentals, favorites, notifications.`,
    keywords: ["menu", "tabs", "footer", "navigate", "stuck", "freeze"],
  },
  {
    id: "more-menu",
    category: "Navigation",
    question: "What is in the More menu?",
    answer:
      "More holds your profile card, Rentals (active & history), Favorites, Notifications, My Garage shortcut, Earn dashboard, and a link to chat with Mr. Evorios.",
    keywords: ["more", "settings", "account"],
  },
  {
    id: "mre-tab",
    category: "Navigation",
    question: `How do I use ${MASCOT_NAME}?`,
    answer:
      `Tap his tab in the footer. FAQ = instant answers (no AI cost). Chat checks FAQ first, then AI only if needed (answers are cached). Install tab helps add the app to your home screen.`,
    keywords: ["help", "assistant", "chat", "faq", "evorios"],
  },
  {
    id: "profile-vs-garage",
    category: "Navigation",
    question: "Profile vs Garage — what is the difference?",
    answer:
      "Garage is for hosting: your listings, requests, and stats. Profile is your identity: name, photo, phone, payout setup, notifications prefs, and sign out.",
    keywords: ["profile", "garage", "account", "settings"],
  },
  {
    id: "zip-only",
    category: "Location",
    question: "Do I need my exact street address?",
    answer:
      "No. City + ZIP (e.g. Hot Springs Village, AR 71909) is enough for browsing nearby garages. Exact address is only shared with a confirmed renter at handoff when you choose that pickup mode.",
    keywords: ["address", "privacy", "zip", "71909", "street", "area"],
  },
  {
    id: "arkansas-rural",
    category: "Location",
    question: "I'm in rural Arkansas — why so few listings?",
    answer:
      "New blocks fill in as neighbors stock their garages. Use Search wider on Home (50+ mi), post a request, or list your own gear — early hosts get more visibility.",
    keywords: ["arkansas", "rural", "sparse", "71909", "hot springs"],
  },
  {
    id: "traveling-mode",
    category: "Location",
    question: "I'm traveling — how do I browse another area?",
    answer:
      "During onboarding choose Traveling, or change location from the chip on Home. Pick destination city/ZIP — we show garages there, not your home block.",
    keywords: ["trip", "travel", "vacation", "destination"],
  },
  {
    id: "neighbor-garage",
    category: "Renting",
    question: "How do I open a neighbor's garage?",
    answer:
      "On Home switch to Garages lens, or tap a host card in the feed. You will see their storefront and active listings.",
    keywords: ["neighbor", "storefront", "host", "browse"],
  },
  {
    id: "favorites",
    category: "Renting",
    question: "How do saved favorites work?",
    answer: "More → Favorites saves listings you hearted. Tap any favorite to open the item and book again.",
    keywords: ["favorite", "saved", "heart", "wishlist"],
  },
  {
    id: "active-rental",
    category: "Renting",
    question: "Where is my active rental?",
    answer:
      "More → Rentals, or the clipboard icon on Home. Open the booking for pickup window, messages, QR check-in, and return steps.",
    keywords: ["active", "current", "pickup", "return"],
  },
  {
    id: "extend-rental",
    category: "Renting",
    question: "Can I extend a rental?",
    answer:
      "If the host allows it, open the active rental and request more days before return. The host approves and pricing updates in the app.",
    keywords: ["extend", "longer", "extra days"],
  },
  {
    id: "cancel-booking",
    category: "Renting",
    question: "How do I cancel a booking?",
    answer:
      "Open the rental in Rentals and choose Cancel if still before pickup. Refund rules follow the host policy and timing — see the booking summary.",
    keywords: ["cancel", "refund"],
  },
  {
    id: "host-payouts",
    category: "Payments & safety",
    question: "How do hosts get paid?",
    answer:
      "Connect Stripe in Profile → payouts. Rental payouts land after successful return; platform fees are shown before you publish.",
    keywords: ["payout", "stripe connect", "earn", "money"],
  },
  {
    id: "deposit-release",
    category: "Payments & safety",
    question: "When is my deposit released?",
    answer:
      "After the host confirms return (or auto-release timer if no dispute). Holds are separate from the rental charge on your card statement.",
    keywords: ["deposit", "release", "hold", "refund"],
  },
  {
    id: "passkey",
    category: "Account",
    question: "What is a passkey?",
    answer:
      "Passkeys let you sign in with Face ID / fingerprint instead of email links. After first sign-in, the app may offer to set one up — optional but faster.",
    keywords: ["passkey", "face id", "fingerprint", "login"],
  },
  {
    id: "co-host",
    category: "Hosting & listings",
    question: "Can I add a co-host?",
    answer:
      "Profile → Co-hosts lets you invite someone to help manage your garage. They can respond to requests depending on permissions you set.",
    keywords: ["cohost", "co-host", "partner", "family"],
  },
  {
    id: "pause-listing",
    category: "Hosting & listings",
    question: "How do I pause a listing?",
    answer:
      "Listing wizard step 5 → Pause toggle hides the item from search instantly without deleting. Turn it back on when you are available.",
    keywords: ["pause", "hide", "vacation", "unavailable"],
  },
  {
    id: "edit-listing",
    category: "Hosting & listings",
    question: "How do I edit a published listing?",
    answer: "Garage → tap the listing → Edit. You can update photos, price, availability, and pickup options anytime.",
    keywords: ["edit", "change price", "update"],
  },
  {
    id: "boost-listing",
    category: "Hosting & listings",
    question: "How do I get more views?",
    answer:
      "Clear photos, fair pricing, and complete availability help most. Paid boost (when available) highlights your item on the block feed.",
    keywords: ["boost", "views", "promote", "traffic"],
  },
  {
    id: "report-issue",
    category: "Payments & safety",
    question: "How do I report a user or listing?",
    answer:
      "Open the listing or rental thread → Report. For emergencies call local authorities first. Include photos and dates for damage claims.",
    keywords: ["report", "scam", "safety", "block"],
  },
  {
    id: "app-update",
    category: "Getting started",
    question: "The app asked me to update — what should I do?",
    answer:
      "Open Notifications (bell on Home) and tap Update when offered. If the screen feels stuck after update, close the tab and reopen the app.",
    keywords: ["update", "pwa", "refresh", "stuck"],
  },
  {
    id: "offline",
    category: "Getting started",
    question: "Does Evorios work offline?",
    answer:
      "Browsing cached pages may work briefly, but booking, chat, and new search need internet. You will see an offline screen when there is no connection.",
    keywords: ["offline", "internet", "wifi"],
  },
];

export function searchFaq(query: string): FaqItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return RENTANO_FAQ;
  return RENTANO_FAQ.filter((item) => {
    const haystack = [
      item.question,
      item.answer,
      item.category,
      ...item.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q) || q.split(/\s+/).every((word) => haystack.includes(word));
  });
}
