/** Catchy in-app share copy for wanted requests. */

export type RequestShareInput = {
  subcategory?: string;
  category?: string;
  description?: string;
  locationLabel?: string;
  intentLabel?: string;
  budgetLabel?: string;
  timingLabel?: string;
  startDate?: string;
  endDate?: string;
};

function clean(value: string | undefined, max = 80): string {
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
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatRequestTimingLabel(
  startDate?: string,
  endDate?: string,
  flexibleFallback = "Flexible timing",
): string {
  const start = startDate?.trim() || "";
  const end = endDate?.trim() || "";
  if (!start && !end) return flexibleFallback;

  const startD = start ? parseIsoLocal(start) : null;
  const endD = end ? parseIsoLocal(end) : startD;
  if (!startD && !endD) return flexibleFallback;

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
  return flexibleFallback;
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

/** Short ad-style caption for WhatsApp / native share (URL added separately). */
export function buildRequestShareCaption(input: RequestShareInput): {
  title: string;
  text: string;
} {
  const subcategory = clean(input.subcategory, 48);
  const location = clean(input.locationLabel, 40) || "nearby";
  const userNeed = firstParagraph(input.description || "");
  const parsed = parseMetaFromDescription(input.description || "");
  const timing =
    input.timingLabel?.trim() ||
    (input.startDate || input.endDate
      ? formatRequestTimingLabel(input.startDate, input.endDate)
      : parsed.timingFallback || formatRequestTimingLabel(input.startDate, input.endDate));
  const intent = clean(input.intentLabel, 24) || parsed.intent || "Rent";
  const budget = clean(input.budgetLabel, 40) || parsed.budgetLabel;

  const hook = subcategory
    ? needHook(subcategory)
    : userNeed
      ? clean(userNeed, 56)
      : "Neighbor needs a hand";

  const mid = [intent, budget, timing].filter(Boolean).join(" · ");
  const text = [hook, mid, `near ${location} — got one? Tap to help.`]
    .filter(Boolean)
    .join("\n");

  return { title: hook, text };
}
