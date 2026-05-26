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
    question: "What is AllByRent?",
    answer:
      "AllByRent is a social rental network: neighbors list items to rent or sell, and others book nearby. You can switch between Rent (find items) and Earn (host items) on the home screen.",
    keywords: ["about", "platform", "social"],
  },
  {
    id: "rent-vs-earn",
    category: "Getting started",
    question: "What is the difference between Rent and Earn?",
    answer:
      "Rent mode shows items near you to borrow. Earn mode is for hosts — list items, manage bookings, and get paid. Tap the toggle at the top of Home to switch.",
    keywords: ["mode", "host", "renter"],
  },
  {
    id: "location-rent",
    category: "Getting started",
    question: "Why do I need to set my location?",
    answer:
      "In Rent mode we show items near you. Set home location during onboarding, or tap your location on Home to update it. Travelers can set a trip destination instead.",
    keywords: ["gps", "address", "where"],
  },
  {
    id: "install-pwa",
    category: "Getting started",
    question: "How do I install the app on my phone?",
    answer:
      "Open Rentano in the footer → Add to Home Screen. On iPhone use Share → Add to Home Screen. On Android use the browser install prompt when it appears.",
    keywords: ["pwa", "home screen", "install"],
  },
  {
    id: "list-first",
    category: "Hosting & listings",
    question: "How do I list my first item?",
    answer:
      "Switch to Earn, tap the green + button, then follow the 7-step wizard: photos, item info, pricing modes, pickup, availability, QR, and review. Rentano can help on each step.",
    keywords: ["sell", "post", "wizard"],
  },
  {
    id: "photos-ai",
    category: "Hosting & listings",
    question: "What happens after I add photos?",
    answer:
      "On step 1, when you continue, Rentano analyzes your photos and suggests title, category, condition, description, and replacement value. You can edit everything on step 2.",
    keywords: ["ai", "analyze", "camera"],
  },
  {
    id: "pricing-modes",
    category: "Hosting & listings",
    question: "Which pricing modes should I choose?",
    answer:
      "Rent is most common. Add Sell or Rent-to-own if you want to offer purchase. Gift is for free items. Step 3 shows only fields relevant to the modes you turn on.",
    keywords: ["daily", "weekly", "deposit"],
  },
  {
    id: "replacement-value",
    category: "Hosting & listings",
    question: "What is replacement value?",
    answer:
      "It is the cost to replace the item new today (for insurance if lost or damaged). Use current retail price, not used price. AI suggests a value from your photos.",
    keywords: ["insurance", "value", "estimated"],
  },
  {
    id: "qr-sticker",
    category: "QR & pickup",
    question: "Why do I need a QR sticker?",
    answer:
      "For rentals, a physical QR on the item helps verify handoff. After publish you may print a sticker or use the on-screen QR story. Some sale-only listings skip the sticker.",
    keywords: ["code", "scan", "sticker"],
  },
  {
    id: "pickup-delivery",
    category: "QR & pickup",
    question: "How do pickup and delivery work?",
    answer:
      "On step 4 choose in-person meetup times, contactless pickup instructions, and/or paid delivery by distance. Renters see what you offer on the listing.",
    keywords: ["handoff", "meet", "drop off"],
  },
  {
    id: "book-item",
    category: "Renting",
    question: "How do I rent an item?",
    answer:
      "In Rent mode browse categories on Home, open an item, and book. You'll see pickup details and messaging in your rental flow (demo in this build).",
    keywords: ["borrow", "reserve", "request"],
  },
  {
    id: "notifications",
    category: "Renting",
    question: "Where are my notifications?",
    answer:
      "Tap the bell on Home. Tabs show All, Bookings, and Messages. Content differs for Rent vs Earn mode.",
    keywords: ["bell", "messages", "alerts"],
  },
  {
    id: "payments",
    category: "Payments & safety",
    question: "How do payments work?",
    answer:
      "Payments and identity verification are handled by Stripe — AllByRent does not store your card or bank details in the app. You'll connect payout settings when hosting goes live.",
    keywords: ["stripe", "card", "money"],
  },
  {
    id: "dispute",
    category: "Payments & safety",
    question: "Something went wrong with a rental — what now?",
    answer:
      "Document the issue with photos and messages in the app. For urgent safety issues contact local authorities first. Rentano can guide you on next in-app steps but cannot decide disputes alone.",
    keywords: ["damage", "problem", "refund"],
  },
  {
    id: "skip-onboarding",
    category: "Getting started",
    question: "Can I skip onboarding?",
    answer:
      "Yes — Skip on intro screens sends you to set location (Rent) or home. You can finish location later from Home if you skipped.",
    keywords: ["skip", "later"],
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
