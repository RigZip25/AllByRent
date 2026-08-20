import { MASCOT_NAME, APP_NAME } from "./brand";
import { getRentanoFaq, searchFaq, type FaqItem } from "../data/rentanoFaq";
import { getLocale } from "./i18n";
import { formatDistanceFromMiles } from "./regionalDisplay";

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

const NAV_HINTS: Array<{
  patterns: RegExp[];
  answer: string;
  answerRu?: string;
  answerCs?: string;
}> = [
  {
    patterns: [
      /категор/i,
      /ориентир/i,
      /browse\s+by\s+categor/i,
      /how\s+(do\s+i\s+)?(find|use|see)\s+categor/i,
      /where\s+(are\s+)?categor/i,
      /луп[аыуе]/i,
      /magnif/i,
      /search\s+icon/i,
    ],
    answer:
      "Categories are on Home: chips on the browse hub and on the feed under Rent/Buy (Tools, Garden & Yard, Party…). Tap a category in More → How Evorios works to expand household and pro subcategories. There is no magnifying-glass search in the footer. When you list with +, pick a category in the wizard.",
    answerRu:
      "Категории на Home: чипы на browse hub и в ленте под Rent/Buy (Tools, Garden & Yard, Party…). В More → How Evorios works можно раскрыть категорию и увидеть подкатегории (household / pro). Лупы (поиска) в футере нет. При листинге через + категория выбирается в мастере.",
  },
  {
    patterns: [
      /как\s+размест/i,
      /размест.*(листинг|объявлен|вещ)/i,
      /как\s+(выложить|добавить|опубликовать)/i,
      /list(ing)?\s*(an?\s+)?item/i,
      /how\s+(do\s+i\s+)?(list|post|publish|stock)/i,
    ],
    answer:
      "Tap the green + in the footer to stock your garage. Follow the wizard: photos → item info → pricing → pickup → availability → QR → publish. Then open Garage to see your listings.",
    answerRu:
      "Нажмите зелёный + в футере, чтобы пополнить гараж. Мастер: фото → описание → цена → получение → доступность → QR → публикация. Потом откройте Garage.",
  },
  {
    patterns: [/bottom\s*nav/i, /menu.*(not|won.?t|doesn.?t)/i, /(stuck|freeze|hang)/i, /can.?t\s+(tap|click|navigate)/i],
    answer:
      `If taps do nothing, pull down to refresh once. Bottom menu: Home (browse + categories), ${MASCOT_NAME} (help), green + (list an item), Garage (your storefront), More (profile, rentals, How Evorios works). No search lupa in the footer.`,
    answerRu:
      `Если тапы не работают — потяните вниз для обновления. Меню внизу: Home (категории), ${MASCOT_NAME} (помощь), зелёный + (листинг), Garage (ваша витрина), More (профиль и гайд How Evorios works). Лупы поиска в футере нет.`,
  },
  {
    patterns: [/mr\.?\s*e/i, /mascot/i, /assistant/i, /эвориус/i],
    answer:
      `Tap ${MASCOT_NAME} in the bottom menu. Start with the FAQ tab for instant answers. Chat tries those answers first; AI is only used when nothing matches. For a guided tour open More → How Evorios works.`,
    answerRu:
      `Откройте ${MASCOT_NAME} во вкладке внизу. FAQ — быстрые ответы. Чат сначала ищет FAQ, AI только если нет совпадения. Тур: More → How Evorios works.`,
  },
  {
    patterns: [/profile.*garage/i, /garage.*profile/i, /difference.*garage/i],
    answer:
      "Garage = your listings, requests, and earnings. Profile = your name, photo, phone, payouts, and sign-out. Open More → profile card, or Garage → gear for settings. Browse vs My Garage is a preference in Profile — same account.",
  },
  {
    patterns: [
      /71909/i,
      /hot\s*springs/i,
      /arkansas/i,
      /rural/i,
      /zip\s*code/i,
      /venkov/i,
      /ps[cč]/i,
    ],
    answer:
      "City + postal code is enough — we show nearby garages in your cluster. You do not need an exact street address. If results are thin, expand the distance filter on Home or post a request.",
    answerCs:
      "Stačí město + PSČ — ukazujeme blízké garáže ve vašem okolí. Přesnou ulici nepotřebujete. Málo nabídek? Rozšiřte vzdálenost na Domů nebo pošlete poptávku.",
  },
  {
    patterns: [
      /search\s*wider/i,
      /expand.*radius/i,
      /nothing\s+near/i,
      /no\s+results/i,
      /hledat\s*šířeji/i,
      /málo\s+nabídek/i,
    ],
    answer:
      "On Home, open Filters to expand distance if the cluster is sparse. You can also post a request so neighbors with the item get notified. Browse by category chips first.",
    answerCs:
      "Na Domů otevřete filtry a rozšiřte vzdálenost, když je okolí prázdné. Můžete taky poslat poptávku — sousedé s věcí dostanou upozornění. Nejdřív zkuste kategorie.",
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
  {
    patterns: [/маркетплейс/i, /marketplace/i, /household/i, /домохозяйств/i, /бизнес\s*ячейк/i],
    answer:
      `${APP_NAME} is a neighborhood marketplace: each household is a business cell that can rent, sell, or gift from its garage. Open More → How Evorios works for the full tour, or Home for category chips.`,
    answerRu:
      `${APP_NAME} — соседский маркетплейс: каждое домохозяйство — бизнес-ячейка (гараж-витрина), где можно сдавать в аренду, продавать или дарить. Тур: More → How Evorios works. Категории — на Home.`,
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // Keep letters from any script (Cyrillic, Latin, …) — `\w` alone drops Russian.
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
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
  for (const item of getRentanoFaq()) {
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
  const preferRu = /\p{Script=Cyrillic}/u.test(trimmed);
  const locale = getLocale();
  for (const hint of NAV_HINTS) {
    if (hint.patterns.some((pattern) => pattern.test(trimmed))) {
      if (preferRu && hint.answerRu) return hint.answerRu;
      if (locale === "cs" && hint.answerCs) {
        return hint.answerCs.replace("{{cluster}}", formatDistanceFromMiles(25));
      }
      return hint.answer.replace("{{cluster}}", formatDistanceFromMiles(25));
    }
  }
  return null;
}

/** Strong signals the question is about ${APP_NAME} / marketplace use. */
const PLATFORM_QUERY_SIGNAL =
  /\b(evorios|listing|listings|garage|garáž|garaje|rent(al|als)?|renter|host|book(ing)?|deposit|kauce|fianza|stripe|payout|qr|sticker|handoff|pickup|delivery|dispute|claim|refund|sell|gift|browse|stock|wizard|publish|pause|profile|pwa|install|faq|кауц|депозит|гараж|листинг|объявлен|аренд|бронь|спор|выплат|наклейк|предъявл|alquiler|anuncio|dep[oó]sito|pago|disputa|publicar|reserva)\b/i;

/** Clear off-platform intents — refuse before calling the LLM. */
const OFF_TOPIC_QUERY_SIGNAL =
  /\b(vacation|holiday|resort|hotel|flight|acne|прыщ|прыщей|отпуск|куда\s+поехать|лечит|диагноз|симптом|рецепт|recipe|cook(ing)?|погод[аыуе]|weather|forecast|bitcoin|crypto|nft|homework|essay|poem|joke|шутк|анекдот|гороскоп|horoscope|dating|свидан|политик|election|news\s+today|chatgpt\s+write|write\s+(me\s+)?(a\s+)?(poem|essay|code)|как\s+похудеть|skincare|moisturizer|viaje\s+a|vacaciones|receta|tiempo\s+mañana|dovolen[aá]|počasí|recept)\b/i;

export function looksLikeOffTopicQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 4) return false;
  if (PLATFORM_QUERY_SIGNAL.test(trimmed)) return false;
  return OFF_TOPIC_QUERY_SIGNAL.test(trimmed);
}

export function offTopicRedirectAnswer(query: string): string {
  const preferRu = /\p{Script=Cyrillic}/u.test(query);
  const locale = getLocale();
  if (preferRu) {
    return `${MASCOT_NAME}: с удовольствием помогу с листингом, продвижением, бронированием, депозитом, спорами или гаражом в ${APP_NAME}. По темам вне платформы у меня, к сожалению, недостаточно надёжных данных — лучше спросить обычный LLM (ChatGPT, Gemini, Claude и т.п.). А здесь я рядом, если нужно разобраться с приложением.`;
  }
  if (locale === "cs") {
    return `${MASCOT_NAME}: rád pomohu s nabídkou, propagací, rezervací, kaucí, spory nebo garáží v ${APP_NAME}. Na témata mimo platformu bohužel nemám dost spolehlivých dat — zkuste obecný LLM (ChatGPT, Gemini, Claude…). Tady jsem, až budete chtít řešit aplikaci.`;
  }
  if (locale === "es") {
    return `${MASCOT_NAME}: Encantado de ayudarte con anuncios, promoción, reservas, fianza, disputas o el garaje en ${APP_NAME}. Fuera de la plataforma, por desgracia no tengo datos suficientes — prueba un LLM general (ChatGPT, Gemini, Claude…). Aquí estoy cuando quieras usar la app.`;
  }
  return `${MASCOT_NAME}: Happy to help with listing, promotion, bookings, deposits, disputes, or your garage in ${APP_NAME}. Outside the platform I don’t have enough reliable data — try a general LLM (ChatGPT, Gemini, Claude, etc.). I’m right here when you want help with the app.`;
}

/**
 * When UI locale is English but the user wrote another language, skip English
 * canned FAQ so AI can answer in-language. Czech UI already has localized FAQ.
 */
export function queryLooksNonEnglish(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (getLocale() === "cs" || getLocale() === "es") return false;

  if (
    /\p{Script=Cyrillic}|\p{Script=Arabic}|\p{Script=Han}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Thai}|\p{Script=Hebrew}/u.test(
      trimmed,
    )
  ) {
    return true;
  }

  // Accented Latin (español, français, deutsch, …)
  if (/[À-ÿ]/u.test(trimmed)) return true;

  // Common non-English Latin questions without accents (e.g. Spanish "como")
  if (
    /\b(como|qué|que|dónde|donde|puedo|necesito|ayuda|publicar|anuncio|gracias|hola|por\s+favor|bonjour|merci|comment|bitte|danke|wie|kann|vender|alquilar)\b/i.test(
      trimmed,
    )
  ) {
    return true;
  }

  return false;
}

/** Instant answer from FAQ / built-in hints — no API call. */
export function findLocalRentanoAnswer(query: string): LocalAnswerResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // Navigation truth (categories, no footer lupa, marketplace) — even for RU/ES.
  const nav = pickNavHint(trimmed);
  if (nav) return { answer: nav, source: "hint" };

  // Soft redirect for clear off-platform topics before FAQ/AI.
  if (looksLikeOffTopicQuery(trimmed)) {
    return { answer: offTopicRedirectAnswer(trimmed), source: "hint" };
  }

  // Don't serve English canned FAQ to RU/ES/… questions — let AI reply in-language.
  if (queryLooksNonEnglish(trimmed)) return null;

  const faq = pickBestFaq(trimmed);
  if (faq) return { answer: faq.answer, source: "faq", faqId: faq.id };

  return null;
}
