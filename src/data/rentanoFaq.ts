import { getMessages } from "../lib/i18n";
import type { AppMessages, FaqItemId, FaqSectionId } from "../lib/i18n/types";

export type FaqItem = {
  id: FaqItemId;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
};

type FaqMeta = {
  id: FaqItemId;
  section: FaqSectionId;
  keywords: string[];
};

/** Structural FAQ index — copy lives in i18n catalogs. */
export const FAQ_META: FaqMeta[] = [
  {
    id: "why-name",
    section: "gettingStarted",
    keywords: [
      "name",
      "naming",
      "etymology",
      "meaning",
      "brand",
      "pronounce",
      "pronunciation",
      "why evorios",
      "название",
      "этимологи",
      "почему",
      "запомни",
      "weak",
      "evo",
      "evolve",
      "evolution",
    ],
  },
  {
    id: "what-is",
    section: "gettingStarted",
    keywords: ["about", "platform", "garage", "marketplace", "household", "бизнес", "сосед"],
  },
  {
    id: "home-feed",
    section: "gettingStarted",
    keywords: ["home", "feed", "search", "browse", "category", "categories", "лупа", "категор"],
  },
  {
    id: "categories-nav",
    section: "navigation",
    keywords: ["category", "categories", "категор", "ориентир", "browse by", "garden", "tools", "лупа", "search icon",],
  },
  {
    id: "garage-tab",
    section: "gettingStarted",
    keywords: ["garage", "host", "supply"],
  },
  {
    id: "location-rent",
    section: "gettingStarted",
    keywords: ["gps", "address", "where", "cluster"],
  },
  {
    id: "install-pwa",
    section: "gettingStarted",
    keywords: ["pwa", "home screen", "install"],
  },
  {
    id: "list-first",
    section: "hosting",
    keywords: ["sell", "post", "wizard", "stock", "listing", "publish", "листинг", "разместить", "объявление", "выложить",],
  },
  {
    id: "photos-ai",
    section: "hosting",
    keywords: ["ai", "analyze", "camera"],
  },
  {
    id: "pricing-modes",
    section: "hosting",
    keywords: ["daily", "weekly", "deposit"],
  },
  {
    id: "replacement-value",
    section: "hosting",
    keywords: ["deposit", "value", "estimated"],
  },
  {
    id: "qr-sticker",
    section: "qrPickup",
    keywords: ["code", "scan", "sticker"],
  },
  {
    id: "pickup-delivery",
    section: "qrPickup",
    keywords: ["handoff", "meet", "drop off"],
  },
  {
    id: "book-item",
    section: "renting",
    keywords: ["borrow", "reserve", "request"],
  },
  {
    id: "post-request",
    section: "renting",
    keywords: ["request", "empty", "search"],
  },
  {
    id: "notifications",
    section: "renting",
    keywords: ["bell", "messages", "alerts"],
  },
  {
    id: "payments",
    section: "payments",
    keywords: ["stripe", "card", "money", "deposit"],
  },
  {
    id: "dispute",
    section: "payments",
    keywords: ["damage", "problem", "refund"],
  },
  {
    id: "availability-step5",
    section: "hosting",
    keywords: ["hours", "weekend", "pause", "block", "dates", "schedule", "times", "delete", "unpause"],
  },
  {
    id: "skip-onboarding",
    section: "gettingStarted",
    keywords: ["skip", "later"],
  },
  {
    id: "bottom-nav",
    section: "navigation",
    keywords: ["menu", "tabs", "footer", "navigate", "stuck", "freeze", "лупа"],
  },
  {
    id: "more-menu",
    section: "navigation",
    keywords: ["more", "settings", "account", "guide", "how it works", "messages", "chat"],
  },
  {
    id: "in-app-chat",
    section: "navigation",
    keywords: ["chat", "message", "messages", "dm", "push", "seller", "host"],
  },
  {
    id: "mre-tab",
    section: "navigation",
    keywords: ["help", "assistant", "chat", "faq", "evorios"],
  },
  {
    id: "profile-vs-garage",
    section: "navigation",
    keywords: ["profile", "garage", "account", "settings"],
  },
  {
    id: "zip-only",
    section: "location",
    keywords: ["address", "privacy", "zip", "71909", "street", "area"],
  },
  {
    id: "arkansas-rural",
    section: "location",
    keywords: ["arkansas", "rural", "sparse", "71909", "hot springs"],
  },
  {
    id: "traveling-mode",
    section: "location",
    keywords: ["trip", "travel", "vacation", "destination"],
  },
  {
    id: "neighbor-garage",
    section: "renting",
    keywords: ["neighbor", "storefront", "host", "browse"],
  },
  {
    id: "favorites",
    section: "renting",
    keywords: ["favorite", "saved", "heart", "wishlist"],
  },
  {
    id: "active-rental",
    section: "renting",
    keywords: ["active", "current", "pickup", "return"],
  },
  {
    id: "extend-rental",
    section: "renting",
    keywords: ["extend", "longer", "extra days"],
  },
  {
    id: "cancel-booking",
    section: "renting",
    keywords: ["cancel", "refund"],
  },
  {
    id: "host-payouts",
    section: "payments",
    keywords: ["payout", "stripe connect", "earn", "money"],
  },
  {
    id: "deposit-release",
    section: "payments",
    keywords: ["deposit", "release", "hold", "refund"],
  },
  {
    id: "passkey",
    section: "account",
    keywords: ["passkey", "face id", "fingerprint", "login"],
  },
  {
    id: "co-host",
    section: "hosting",
    keywords: ["cohost", "co-host", "partner", "family", "invite", "helper", "инвайт", "помощ"],
  },
  {
    id: "garage-switcher",
    section: "hosting",
    keywords: ["switch", "working in", "active garage", "переключ", "гараж"],
  },
  {
    id: "own-and-help",
    section: "hosting",
    keywords: ["neighbor", "next door", "two homes", "barbara", "daughter", "сосед", "два дома"],
  },
  {
    id: "stripe-garage-owner",
    section: "payments",
    keywords: ["stripe", "payout", "owner", "helper", "who gets paid", "выплат", "страйп"],
  },
  {
    id: "browse-own-login",
    section: "account",
    keywords: ["browse", "login", "face id", "same phone", "браузер", "логин"],
  },
  {
    id: "pause-listing",
    section: "hosting",
    keywords: ["pause", "hide", "vacation", "unavailable", "delete"],
  },
  {
    id: "edit-listing",
    section: "hosting",
    keywords: ["edit", "change price", "update"],
  },
  {
    id: "boost-listing",
    section: "hosting",
    keywords: ["boost", "views", "promote", "traffic"],
  },
  {
    id: "report-issue",
    section: "payments",
    keywords: ["report", "scam", "safety", "block"],
  },
  {
    id: "app-update",
    section: "gettingStarted",
    keywords: ["update", "pwa", "refresh", "stuck", "overnight"],
  },
  {
    id: "offline",
    section: "gettingStarted",
    keywords: ["offline", "internet", "wifi"],
  },
];

export function buildFaqItems(faq: AppMessages["faq"]): FaqItem[] {
  return FAQ_META.map((meta) => {
    const copy = faq.items[meta.id];
    return {
      id: meta.id,
      category: faq.sections[meta.section],
      question: copy.q,
      answer: copy.a,
      keywords: meta.keywords,
    };
  });
}

/** Localized FAQ for the active locale. */
export function getRentanoFaq(): FaqItem[] {
  return buildFaqItems(getMessages().faq);
}

export function searchFaq(query: string, items?: FaqItem[]): FaqItem[] {
  const list = items ?? getRentanoFaq();
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((item) => {
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
