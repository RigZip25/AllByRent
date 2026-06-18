import { APP_NAME } from "./brand";
import type { ShareCardFormat } from "./shareCards";

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

export async function shareNative(payload: SharePayload): Promise<boolean> {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  try {
    const text = payload.text.trim() || `${payload.title}\n${payload.url}`;
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
        await navigator.share({ title: payload.title, text, files: [file] });
        return true;
      }
    }
    await navigator.share({ title: payload.title, text, url: payload.url });
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
  const fullText = [payload.text.trim(), payload.url].filter(Boolean).join("\n");

  if (platform === "native") {
    const ok = await shareNative(payload);
    if (ok) return "shared";
    const copied = await copyText(fullText);
    return copied ? "copied" : "failed";
  }

  if (platform === "copy") {
    const copied = await copyText(fullText);
    return copied ? "copied" : "failed";
  }

  if (platform === "whatsapp") {
    openWindow(`https://wa.me/?text=${encode(fullText)}`);
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
}): SharePayload {
  const place = params.city?.trim() ? ` in ${params.city.trim()}` : "";
  const count =
    params.listingCount && params.listingCount > 0
      ? ` ${params.listingCount} item${params.listingCount === 1 ? "" : "s"} on the shelf.`
      : "";
  return {
    title: `${params.garageName} on ${APP_NAME}`,
    url: params.url,
    text: `Peek inside ${params.garageName}'s garage${place} — neighborhood rentals on ${APP_NAME}.${count}`,
  };
}

export function listingShareUrl(listingId: string): string {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL(origin || "https://app.allbyrent.com");
    url.searchParams.set("listingId", listingId);
    return url.toString();
  } catch {
    return `https://app.allbyrent.com/?listingId=${listingId}`;
  }
}

export function garageShareUrl(hostId: string): string {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL(origin || "https://app.allbyrent.com");
    url.searchParams.set("screen", "home");
    url.searchParams.set("garage", hostId);
    return url.toString();
  } catch {
    return `https://app.allbyrent.com/?garage=${hostId}`;
  }
}
