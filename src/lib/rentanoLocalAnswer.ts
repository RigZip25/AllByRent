import { MASCOT_NAME } from "./brand";
import { RENTANO_FAQ, searchFaq, type FaqItem } from "../data/rentanoFaq";

export type LocalAnswerSource = "faq" | "hint";

export type LocalAnswerResult = {
  answer: string;
  source: LocalAnswerSource;
  faqId?: string;
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "how",
  "what",
  "where",
  "when",
  "why",
  "can",
  "you",
  "your",
  "does",
  "with",
  "this",
  "that",
  "from",
  "about",
  "please",
  "help",
  "need",
]);

const NAV_HINTS: Array<{ patterns: RegExp[]; answer: string }> = [
  {
    patterns: [/bottom\s*nav/i, /menu.*(not|won.?t|doesn.?t)/i, /(stuck|freeze|hang)/i, /can.?t\s+(tap|click|navigate)/i],
    answer:
      `If taps do nothing, pull down to refresh once. Bottom menu: Home (browse), ${MASCOT_NAME} (help), green + (list an item), Garage (your storefront), More (profile & rentals). Each tab should switch instantly.`,
  },
  {
    patterns: [/mr\.?\s*e/i, /evorios/i, /mascot/i, /assistant/i],
    answer:
      `Tap ${MASCOT_NAME} in the bottom menu. Start with the FAQ tab for instant answers (deposits, listing, ZIP search). Chat tries those answers first; AI is only used when nothing matches.`,
  },
  {
    patterns: [/profile.*garage/i, /garage.*profile/i, /difference.*garage/i],
    answer:
      "Garage = your listings, requests, and earnings. Profile = your name, photo, phone, payouts, and sign-out. Open More → profile card, or Garage → gear for settings.",
  },
  {
    patterns: [/71909/i, /hot\s*springs/i, /arkansas/i, /rural/i, /zip\s*code/i],
    answer:
      "For Hot Springs Village / 71909 we show nearby garages in your cluster (about 25 mi). You do not need an exact street address — city + ZIP is enough. If results are thin, tap Search wider on Home for 50+ mi.",
  },
  {
    patterns: [/search\s*wider/i, /expand.*radius/i, /nothing\s+near/i, /no\s+results/i],
    answer:
      "On Home, if the cluster is sparse, use Search wider to expand the radius (50+ mi). You can also post a request so neighbors with the item get notified.",
  },
  {
    patterns: [/deposit/i, /hold/i, /authorization/i],
    answer:
      "Rentals charge the rental total first, then a separate deposit hold if the host set one. The hold is released after a successful return unless damage is documented. See Payments & safety in FAQ for details.",
  },
  {
    patterns: [/sign\s*in/i, /magic\s*link/i, /log\s*in/i, /account/i],
    answer:
      "Sign in when booking, messaging, or listing. Enter email → sign-in code. Check spam. After sign-in you return to the screen you started from (e.g. booking or listing wizard).",
  },
  {
    patterns: [/favorite/i, /saved/i, /heart/i],
    answer: "Open More → Favorites for saved listings. Tap a card to open the item again.",
  },
  {
    patterns: [/rental/i, /booking/i, /borrow/i],
    answer:
      "Active and past rentals: More → Rentals, or the clipboard icon on Home. Open a rental for pickup details, messages, and return flow.",
  },
  {
    patterns: [/stock/i, /list\s+an?\s+item/i, /add\s+listing/i, /green\s*\+/i],
    answer:
      "Tap the green + in the footer to stock your garage. Follow the wizard: photos → item info → pricing → pickup → availability → QR → publish.",
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function scoreFaqItem(item: FaqItem, words: string[], rawQuery: string): number {
  const haystack = [item.question, item.answer, item.category, ...item.keywords]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const word of words) {
    if (haystack.includes(word)) score += 1;
  }
  for (const keyword of item.keywords) {
    const k = keyword.toLowerCase();
    if (rawQuery.includes(k)) score += 3;
    if (words.some((w) => k.includes(w) || w.includes(k))) score += 2;
  }
  if (item.question.toLowerCase().includes(rawQuery)) score += 5;
  return score;
}

function pickBestFaq(query: string): FaqItem | null {
  const rawQuery = query.trim().toLowerCase();
  if (!rawQuery) return null;

  const direct = searchFaq(rawQuery);
  if (direct.length === 1) return direct[0];
  if (direct.length > 1 && rawQuery.length >= 12) {
    const words = tokenize(rawQuery);
    let best: { item: FaqItem; score: number } | null = null;
    for (const item of direct) {
      const score = scoreFaqItem(item, words, rawQuery);
      if (!best || score > best.score) best = { item, score };
    }
    if (best && best.score >= 2) return best.item;
  }

  const words = tokenize(rawQuery);
  if (words.length === 0) return null;

  let best: { item: FaqItem; score: number } | null = null;
  for (const item of RENTANO_FAQ) {
    const score = scoreFaqItem(item, words, rawQuery);
    if (!best || score > best.score) best = { item, score };
  }

  if (!best) return null;
  const threshold = words.length <= 2 ? 4 : 3;
  return best.score >= threshold ? best.item : null;
}

function pickNavHint(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  for (const hint of NAV_HINTS) {
    if (hint.patterns.some((pattern) => pattern.test(trimmed))) {
      return hint.answer;
    }
  }
  return null;
}

/** Instant answer from FAQ / built-in hints — no API call. */
export function findLocalRentanoAnswer(query: string): LocalAnswerResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const nav = pickNavHint(trimmed);
  if (nav) return { answer: nav, source: "hint" };

  const faq = pickBestFaq(trimmed);
  if (faq) return { answer: faq.answer, source: "faq", faqId: faq.id };

  return null;
}
