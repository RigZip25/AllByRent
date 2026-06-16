export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
};

import { APP_MODE_LABELS, APP_NAME, MASCOT_NAME, PRODUCT_METAPHOR } from "../lib/brand";

export const RENTANO_FAQ: FaqItem[] = [
  {
    id: "what-is",
    category: "Getting started",
    question: `What is ${APP_NAME}?`,
    answer:
      `${APP_NAME} is a ${PRODUCT_METAPHOR} for every household: list items from your garage, browse neighbors, borrow or buy nearby. Switch between ${APP_MODE_LABELS.rent} and ${APP_MODE_LABELS.earn} on Home.`,
    keywords: ["about", "platform", "garage"],
  },
  {
    id: "rent-vs-earn",
    category: "Getting started",
    question: `What is the difference between ${APP_MODE_LABELS.rent} and ${APP_MODE_LABELS.earn}?`,
    answer:
      `${APP_MODE_LABELS.rent} shows items on neighborhood garages near you. ${APP_MODE_LABELS.earn} is your own garage showcase — list items, manage bookings, and get paid. Tap the toggle at the top of Home.`,
    keywords: ["mode", "host", "browse"],
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
      "Open Evorios in the footer → Add to Home Screen. On iPhone use Share → Add to Home Screen. On Android use the browser install prompt when it appears.",
    keywords: ["pwa", "home screen", "install"],
  },
  {
    id: "list-first",
    category: "Hosting & listings",
    question: "How do I list my first item?",
    answer:
      `Switch to ${APP_MODE_LABELS.earn}, tap the green + button, then follow the 7-step wizard: photos, item info, pricing modes, pickup, availability, QR, and review. ${MASCOT_NAME} can help on each step.`,
    keywords: ["sell", "post", "wizard"],
  },
  {
    id: "photos-ai",
    category: "Hosting & listings",
    question: "What happens after I add photos?",
    answer:
      `On step 1, when you continue, ${MASCOT_NAME} analyzes your photos and suggests title, category, condition, description, and replacement value. You can edit everything on step 2.`,
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
      "On step 4 choose in-person pickup, contactless pickup (exact address shared with your confirmed renter after booking; lockbox and gate codes unlock at check-in PIN), and/or round-trip delivery with your own fee and max miles.",
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
      `Payments and identity verification are handled by Stripe — ${APP_NAME} does not store your card or bank details in the app. You'll connect payout settings when hosting goes live.`,
    keywords: ["stripe", "card", "money"],
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
