/** Catchy social / OG copy for wanted requests (server-side). */

export type RequestShareFields = {
  subcategory?: string | null;
  category?: string | null;
  description?: string | null;
  locationLabel?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type RequestShareCopy = {
  hook: string;
  metaLine: string;
  timing: string;
  budgetLabel: string;
  intentLabel: string;
  ogTitle: string;
  ogDescription: string;
  shareText: string;
};

function clean(value: string | null | undefined, max = 80): string {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function parseIsoLocal(iso: string): Date | null {
  const raw = iso.trim();
  if (!raw) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatShortDate(iso: string): string {
  const d = parseIsoLocal(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Prefer human timing: this week / weekend / date range / flexible. */
export function formatRequestTiming(
  startDate?: string | null,
  endDate?: string | null,
): string {
  const start = startDate?.trim() || "";
  const end = endDate?.trim() || "";
  if (!start && !end) return "Flexible timing";

  const startD = start ? parseIsoLocal(start) : null;
  const endD = end ? parseIsoLocal(end) : startD;
  if (!startD && !endD) return "Flexible timing";

  const today = startOfLocalDay(new Date());
  const weekEnd = addDays(today, 7);
  const rangeStart = startOfLocalDay(startD || endD!);
  const rangeEnd = startOfLocalDay(endD || startD!);

  if (rangeEnd >= today && rangeStart <= weekEnd) {
    const daySpan =
      Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1;
    let spansWeekend = false;
    for (let i = 0; i < Math.min(8, daySpan); i += 1) {
      const day = addDays(rangeStart, i).getDay();
      if (day === 0 || day === 6) {
        spansWeekend = true;
        break;
      }
    }
    if (spansWeekend && rangeEnd.getTime() - rangeStart.getTime() <= 3 * 86400000) {
      return "This weekend";
    }
    return "Needed this week";
  }

  if (start && end && start !== end) {
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  }
  if (start) return `From ${formatShortDate(start)}`;
  if (end) return `By ${formatShortDate(end)}`;
  return "Flexible timing";
}

function firstParagraph(description: string): string {
  return (
    description
      .split(/\n{2,}/)[0]
      ?.replace(/\s+/g, " ")
      .trim() || ""
  );
}

function parseMetaFromDescription(description: string): {
  intent: string;
  budgetLabel: string;
  timingFallback: string;
} {
  const blocks = description
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const meta = blocks.length > 1 ? blocks[blocks.length - 1] : "";
  const parts = meta
    .split(/\s*·\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  let intent = "";
  let budgetLabel = "";
  let timingFallback = "";

  for (const part of parts) {
    if (/^(rent|buy|either)/i.test(part) && part.length < 24) {
      intent = part;
      continue;
    }
    if (/budget|\$\d/i.test(part)) {
      const day = part.match(/\$\s?([\d,]+(?:\.\d+)?)\s*\/\s*day/i);
      const buy = part.match(/up to\s*\$\s?([\d,]+(?:\.\d+)?)/i);
      if (day) budgetLabel = `up to $${day[1]}/day`;
      else if (buy) budgetLabel = `up to $${buy[1]}`;
      else budgetLabel = clean(part, 40);
      continue;
    }
    if (/flexible|asap|from |–|-/i.test(part)) {
      timingFallback = clean(part, 40);
    }
  }

  if (!budgetLabel) {
    const day = description.match(/\$\s?([\d,]+(?:\.\d+)?)\s*\/\s*day/i);
    if (day) budgetLabel = `up to $${day[1]}/day`;
  }

  return { intent, budgetLabel, timingFallback };
}

function articleFor(noun: string): string {
  const first = noun.trim().charAt(0).toLowerCase();
  return "aeiou".includes(first) ? "an" : "a";
}

function needHook(item: string): string {
  const trimmed = item.trim();
  // Skip article for plurals / compound category labels ("Cars & Trucks").
  if (/\b(and|&)\b/i.test(trimmed) || /s$/i.test(trimmed)) {
    return `Need ${trimmed}?`;
  }
  return `Need ${articleFor(trimmed)} ${trimmed}?`;
}

export function buildRequestShareCopy(fields: RequestShareFields): RequestShareCopy {
  const subcategory = clean(fields.subcategory, 48);
  const category = clean(fields.category, 40);
  const location = clean(fields.locationLabel, 40) || "nearby";
  const description = (fields.description || "").trim();
  const userNeed = firstParagraph(description);
  const meta = parseMetaFromDescription(description);

  const timingFromDates = formatRequestTiming(fields.startDate, fields.endDate);
  const timing =
    fields.startDate || fields.endDate
      ? timingFromDates
      : meta.timingFallback || timingFromDates;

  const intentLabel = meta.intent || "Rent";
  const budgetLabel = meta.budgetLabel;

  const hook = subcategory
    ? needHook(subcategory)
    : userNeed
      ? clean(userNeed, 56)
      : "Neighbor needs a hand";

  const catBit =
    category && category.toLowerCase() !== subcategory.toLowerCase() ? category : "";
  const metaLine = [catBit, `near ${location}`].filter(Boolean).join(" · ");

  const detailBits = [
    intentLabel,
    budgetLabel,
    timing !== "Flexible timing" ? timing : "",
  ].filter(Boolean);

  const ogTitle = hook.slice(0, 70);
  const ogDescription = clean(
    [detailBits.join(" · "), metaLine, "Got it? Help a neighbor on Evorios."]
      .filter(Boolean)
      .join(" · "),
    140,
  );

  const shareText = [
    hook,
    [intentLabel, budgetLabel, timing].filter(Boolean).join(" · "),
    `near ${location} — got one? Tap to help.`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    hook,
    metaLine,
    timing,
    budgetLabel,
    intentLabel,
    ogTitle,
    ogDescription,
    shareText,
  };
}
