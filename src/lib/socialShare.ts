import { APP_NAME, APP_ORIGIN } from "./brand";
import { shareAppOrigin } from "./deepLinks";
import type { ShareCardFormat } from "./shareCards";
import { buildRequestShareCaption } from "./requestShareCopy";

export type SocialPlatform =
  | "native"
  | "copy"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "nextdoor"
  | "whatsapp"
  | "x";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
  imageBlob?: Blob;
  imageFilename?: string;
};

export type ShareResult = "shared" | "copied" | "opened" | "cancelled" | "failed";

const SHARE_LOG_KEY = "allbyrent_share_log";

/** Best image aspect per platform (user picks card format before sharing). */
export function preferredFormatForPlatform(platform: SocialPlatform): ShareCardFormat {
  switch (platform) {
    case "tiktok":
    case "instagram":
      return "story";
    case "facebook":
    case "nextdoor":
      return "landscape";
    case "whatsapp":
    case "x":
      return "square";
    default:
      return "story";
  }
}

export function platformHint(platform: SocialPlatform): string | null {
  switch (platform) {
    case "tiktok":
      return "Image copied to clipboard when possible — paste in TikTok when you create a post.";
    case "instagram":
      return "Download the Story image, then share to Instagram Stories or Feed.";
    case "facebook":
      return "Opens Facebook share — paste the image if the link preview is not enough.";
    case "nextdoor":
      return "Opens Nextdoor — great for neighbors on your block.";
    case "whatsapp":
      return "Opens WhatsApp with your caption ready to send.";
    case "x":
      return "Opens X (Twitter) compose with your link.";
    default:
      return null;
  }
}

function encode(text: string): string {
  return encodeURIComponent(text);
}

function openWindow(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function copyImageBlob(blob: Blob): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.write) return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

/** Clipboard / chat-friendly share body: headline, then clean URL on its own line. */
export function formatShareClipboardText(payload: SharePayload): string {
  const headline = (payload.text.trim() || payload.title.trim()).trim();
  const url = payload.url.trim();
  if (headline && url) return `${headline}\n${url}`;
  return headline || url;
}

/** Markdown hyperlink when the channel can render it (Slack, Discord, Notion, etc.). */
export function formatShareMarkdownLink(payload: SharePayload): string {
  const label = (payload.text.trim() || payload.title.trim()).trim() || "Open in Evórios";
  const url = payload.url.trim();
  if (!url) return label;
  return `[${label.replace(/\[/g, "\\[").replace(/\]/g, "\\]")}](${url})`;
}

export async function shareNative(payload: SharePayload): Promise<boolean> {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  try {
    const title = payload.title.trim() || APP_NAME;
    const text = payload.text.trim();
    const url = payload.url.trim();
    if (payload.imageBlob) {
      const file = new File(
        [payload.imageBlob],
        payload.imageFilename ?? "evorios-share.png",
        { type: "image/png" },
      );
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({
          title,
          text: text || undefined,
          url: url || undefined,
          files: [file],
        });
        return true;
      }
    }
    await navigator.share({
      title,
      text: text || undefined,
      url: url || undefined,
    });
    return true;
  } catch {
    return false;
  }
}

export function logShareAction(params: {
  platform: SocialPlatform;
  kind: "listing" | "garage" | "request" | "shelf";
  targetId?: string;
}): void {
  try {
    const raw = localStorage.getItem(SHARE_LOG_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = [
      { ...params, at: new Date().toISOString() },
      ...(Array.isArray(arr) ? arr : []),
    ].slice(0, 40);
    localStorage.setItem(SHARE_LOG_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function hasRecentShare(kind: "listing" | "garage", targetId: string, withinHours = 72): boolean {
  try {
    const raw = localStorage.getItem(SHARE_LOG_KEY);
    if (!raw) return false;
    const arr = JSON.parse(raw) as { kind?: string; targetId?: string; at?: string }[];
    if (!Array.isArray(arr)) return false;
    const cutoff = Date.now() - withinHours * 60 * 60 * 1000;
    return arr.some(
      (e) =>
        e.kind === kind &&
        e.targetId === targetId &&
        e.at &&
        new Date(e.at).getTime() >= cutoff,
    );
  } catch {
    return false;
  }
}

export async function shareToPlatform(
  platform: SocialPlatform,
  payload: SharePayload,
): Promise<ShareResult> {
  const fullText = formatShareClipboardText(payload);

  if (platform === "native") {
    const ok = await shareNative(payload);
    if (ok) return "shared";
    const copied = await copyText(fullText);
    return copied ? "copied" : "failed";
  }

  if (platform === "copy") {
    // Prefer plain headline + URL (auto-links in SMS/iMessage). Markdown is available via formatShareMarkdownLink.
    const copied = await copyText(fullText);
    return copied ? "copied" : "failed";
  }

  if (platform === "whatsapp") {
    // Keep paste text short so WhatsApp's link preview (OG image) stays the hero.
    const hook = (payload.title.trim() || payload.text.trim().split("\n")[0] || "").trim();
    const whatsappText = hook && payload.url.trim() ? `${hook}\n${payload.url.trim()}` : fullText;
    openWindow(`https://wa.me/?text=${encode(whatsappText)}`);
    return "opened";
  }

  if (platform === "facebook") {
    openWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encode(payload.url)}&quote=${encode(payload.text)}`,
    );
    return "opened";
  }

  if (platform === "x") {
    openWindow(
      `https://twitter.com/intent/tweet?text=${encode(payload.text)}&url=${encode(payload.url)}`,
    );
    return "opened";
  }

  if (platform === "nextdoor") {
    openWindow(
      `https://nextdoor.com/sharekit/?source=evorios&body=${encode(payload.text)}&link=${encode(payload.url)}`,
    );
    return "opened";
  }

  if (platform === "instagram" || platform === "tiktok") {
    await copyText(fullText);
    if (payload.imageBlob) {
      await copyImageBlob(payload.imageBlob);
    }
    if (platform === "instagram") {
      openWindow("https://www.instagram.com/");
    } else {
      openWindow("https://www.tiktok.com/upload");
    }
    return "opened";
  }

  return "failed";
}

export function buildListingSharePayload(params: {
  title: string;
  dailyRate?: string;
  url: string;
  city?: string;
}): SharePayload {
  const rate = params.dailyRate?.trim() ? ` · ${params.dailyRate}/day` : "";
  const place = params.city?.trim() ? ` near ${params.city.trim()}` : "";
  return {
    title: params.title,
    url: params.url,
    text: `${params.title}${rate}${place} — rent from a neighbor on ${APP_NAME}.`,
  };
}

export function buildGarageSharePayload(params: {
  garageName: string;
  url: string;
  city?: string;
  listingCount?: number;
  openUntilLabel?: string;
}): SharePayload {
  const place = params.city?.trim() ? ` in ${params.city.trim()}` : "";
  const count =
    params.listingCount && params.listingCount > 0
      ? ` ${params.listingCount} item${params.listingCount === 1 ? "" : "s"} on the shelf.`
      : "";
  const hours = params.openUntilLabel?.trim() ? ` ${params.openUntilLabel.trim()}.` : "";
  return {
    title: `${params.garageName} — garage open`,
    url: params.url,
    text: `My garage is open${place}${hours}${count} Tap to browse, buy, or make an offer.`,
  };
}

export function buildGarageItemSharePayload(params: {
  title: string;
  priceUsd: number;
  url: string;
  city?: string;
  garageName?: string;
}): SharePayload {
  const place = params.city?.trim() ? ` · ${params.city.trim()}` : "";
  const from = params.garageName?.trim() ? ` · ${params.garageName.trim()}` : "";
  const price = Number.isFinite(params.priceUsd) ? `$${params.priceUsd}` : "Ask";
  return {
    title: params.title,
    url: params.url,
    text: `${params.title} · ${price}${from}${place}`,
  };
}

export function listingShareUrl(listingId: string): string {
  try {
    const origin = shareAppOrigin();
    const url = new URL(origin);
    url.pathname = `/item/${encodeURIComponent(listingId)}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return `${APP_ORIGIN}/item/${encodeURIComponent(listingId)}`;
  }
}

export function garageShareUrl(hostId: string): string {
  try {
    const origin = shareAppOrigin();
    const url = new URL(origin);
    url.pathname = `/g/${encodeURIComponent(hostId)}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return `${APP_ORIGIN}/g/${encodeURIComponent(hostId)}`;
  }
}

export function garageItemShareUrl(_hostId: string, listingId: string): string {
  return listingShareUrl(listingId);
}

/** Public short link for a wanted request. Splash skip is applied internally on open. */
export function requestShareUrl(requestId?: string | null): string {
  const id = requestId?.trim() || "";
  try {
    const origin = shareAppOrigin();
    if (id) {
      const url = new URL(origin);
      url.pathname = `/r/${encodeURIComponent(id)}`;
      url.search = "";
      url.hash = "";
      return url.toString();
    }
    const home = new URL(origin);
    home.pathname = "/";
    home.search = "";
    return home.toString();
  } catch {
    if (id) return `${APP_ORIGIN}/r/${encodeURIComponent(id)}`;
    return `${APP_ORIGIN}/`;
  }
}

export function buildRequestSharePayload(params: {
  need?: string;
  url: string;
  appName?: string;
  title?: string;
  text?: string;
  subcategory?: string;
  category?: string;
  locationLabel?: string;
  intentLabel?: string;
  budgetLabel?: string;
  timingLabel?: string;
  startDate?: string;
  endDate?: string;
}): SharePayload {
  if (params.title?.trim() && params.text?.trim()) {
    return {
      title: params.title.trim(),
      text: params.text.trim(),
      url: params.url,
    };
  }

  const hasStructured =
    Boolean(params.subcategory?.trim()) ||
    Boolean(params.timingLabel?.trim()) ||
    Boolean(params.intentLabel?.trim()) ||
    Boolean(params.budgetLabel?.trim()) ||
    Boolean(params.startDate?.trim()) ||
    Boolean(params.endDate?.trim());

  if (hasStructured) {
    const caption = buildRequestShareCaption({
      subcategory: params.subcategory,
      category: params.category,
      description: params.need,
      locationLabel: params.locationLabel,
      intentLabel: params.intentLabel,
      budgetLabel: params.budgetLabel,
      timingLabel: params.timingLabel,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return {
      title: caption.title,
      text: caption.text,
      url: params.url,
    };
  }

  const need = (params.need || "").trim() || "Neighbor needs a hand nearby";
  return {
    title: need,
    text: need,
    url: params.url,
  };
}
