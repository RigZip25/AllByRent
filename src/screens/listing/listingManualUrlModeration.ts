import { postLlmChat } from "../../lib/llmClient";

export type ListingManualUrlReason =
  | "ok"
  | "invalid_url"
  | "not_https"
  | "blocked_host"
  | "not_suitable"
  | "verification_failed";

export type ListingManualUrlResult = {
  ok: boolean;
  reasonCode: ListingManualUrlReason;
};

export type ListingManualUrlContext = {
  title?: string;
  category?: string;
  subcategory?: string;
};

/** Common URL shorteners — hide destination; block for listing manuals. */
const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "bitly.com",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "cutt.ly",
  "rebrand.ly",
  "shorturl.at",
  "tiny.cc",
  "rb.gy",
  "t.ly",
  "buff.ly",
  "lnk.bio",
  "clck.ru",
  "vk.cc",
]);

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function hostnameOf(url: URL): string {
  return url.hostname.replace(/\.$/, "").toLowerCase();
}

function isBlockedShortener(host: string): boolean {
  if (SHORTENER_HOSTS.has(host)) return true;
  for (const blocked of SHORTENER_HOSTS) {
    if (host.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

function isRawIpHost(host: string): boolean {
  if (IPV4_RE.test(host)) return true;
  if (host.includes(":")) return true;
  return false;
}

/**
 * Rule-based gate first. Empty/whitespace → ok (optional field).
 * Prefer https only; block bad schemes, shorteners, raw IPs.
 */
export function validateManualUrlFormat(raw: string): ListingManualUrlResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, reasonCode: "ok" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reasonCode: "invalid_url" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, reasonCode: "not_https" };
  }

  const host = hostnameOf(parsed);
  if (!host || host === "localhost" || isRawIpHost(host) || isBlockedShortener(host)) {
    return { ok: false, reasonCode: "blocked_host" };
  }

  return { ok: true, reasonCode: "ok" };
}

const MANUAL_URL_SYSTEM =
  "You judge whether a URL is a plausible product manual, manufacturer support page, or tutorial for a rental/sale listing. Be practical. Prefer allowing official brand/docs domains. Respond with JSON only.";

function buildManualUrlPrompt(url: string, ctx: ListingManualUrlContext): string {
  const category = (ctx.category ?? "").trim();
  const subcategory = (ctx.subcategory ?? "").trim();
  const title = (ctx.title ?? "").trim();
  const contextLine = [
    title ? `Listing title: ${JSON.stringify(title)}` : null,
    category
      ? `Category: ${JSON.stringify(category)}${subcategory ? ` / ${JSON.stringify(subcategory)}` : ""}`
      : "Category: not set",
  ]
    .filter(Boolean)
    .join("\n");

  return `Is this URL suitable as an instructions/manual link on a neighborhood marketplace listing?

URL: ${JSON.stringify(url)}
${contextLine}

Allow: manufacturer manuals, brand support pages, official docs, reputable retailer product manuals, YouTube/Vimeo how-to videos for the product, PDF manuals on trusted hosts.
Reject: porn/adult, malware/phishing vibes, unrelated adult content, scam/crypto spam, random social DMs, links that are clearly not about product instructions.

Soft relevance: if category/title are known, reject only when the link is obviously unrelated. Do NOT over-reject official brand manuals that are merely broad (support hub home pages are OK).

Return ONLY valid JSON:
{
  "suitable": <boolean>,
  "reasonCode": "ok" | "not_suitable"
}`;
}

async function llmModerateManualUrl(
  url: string,
  ctx: ListingManualUrlContext,
): Promise<ListingManualUrlResult> {
  try {
    const result = await postLlmChat({
      purpose: "chat",
      max_tokens: 120,
      system: MANUAL_URL_SYSTEM,
      messages: [{ role: "user", content: buildManualUrlPrompt(url, ctx) }],
    });
    const trimmed = result.text.trim();
    const jsonText = trimmed.startsWith("{")
      ? trimmed
      : trimmed.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) {
      return { ok: false, reasonCode: "verification_failed" };
    }
    const parsed = JSON.parse(jsonText) as {
      suitable?: unknown;
      reasonCode?: unknown;
    };
    const suitable = parsed.suitable !== false;
    const code = String(parsed.reasonCode ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (!suitable || code === "not_suitable" || code === "unsafe") {
      return { ok: false, reasonCode: "not_suitable" };
    }
    return { ok: true, reasonCode: "ok" };
  } catch {
    return { ok: false, reasonCode: "verification_failed" };
  }
}

/** Rules then LLM. Empty URL is OK (optional). Fail-closed on LLM errors. */
export async function moderateListingManualUrl(
  rawUrl: string,
  ctx: ListingManualUrlContext = {},
): Promise<ListingManualUrlResult> {
  const format = validateManualUrlFormat(rawUrl);
  if (!format.ok) return format;
  if (!rawUrl.trim()) return format;
  return llmModerateManualUrl(rawUrl.trim(), ctx);
}

export type ListingManualUrlCopy = {
  moderationManualUrlNotSuitable: string;
  moderationManualUrlInvalid: string;
  moderationManualUrlHttpsOnly: string;
  moderationManualUrlVerifyFailed: string;
};

export function messageForManualUrlModeration(
  reasonCode: ListingManualUrlReason,
  copy: ListingManualUrlCopy,
): string {
  switch (reasonCode) {
    case "invalid_url":
    case "blocked_host":
      return copy.moderationManualUrlInvalid;
    case "not_https":
      return copy.moderationManualUrlHttpsOnly;
    case "verification_failed":
      return copy.moderationManualUrlVerifyFailed;
    case "not_suitable":
    default:
      return copy.moderationManualUrlNotSuitable;
  }
}
