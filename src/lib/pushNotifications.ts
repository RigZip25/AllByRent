import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { FALLBACK_VAPID_PUBLIC_KEY } from "./vapidPublicKey";
import { isStandalonePwa } from "./pwaInstall";

export type WebPushSubscription = PushSubscriptionJSON & {
  endpoint: string;
};

export type PushSubscribeResult =
  | { ok: true; subscription: WebPushSubscription; sendConfigured: boolean }
  | { ok: false; code: PushFailCode; message: string };

export type PushFailCode =
  | "unsupported"
  | "insecure"
  | "ios_browser"
  | "permission_denied"
  | "permission_dismissed"
  | "no_service_worker"
  | "no_push_manager"
  | "subscribe_failed"
  | "no_endpoint"
  | "missing_vapid";

function getBuildTimeVapidPublicKey(): string | null {
  const key = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim();
  return key && key.length > 0 ? key : null;
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer.slice(
    outputArray.byteOffset,
    outputArray.byteOffset + outputArray.byteLength,
  );
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

async function resolveVapidPublicKey(): Promise<{
  publicKey: string | null;
  sendConfigured: boolean;
}> {
  let sendConfigured = false;
  try {
    const res = await fetch("/api/push/vapid-public", { method: "GET" });
    if (res.ok) {
      const data = (await res.json()) as {
        publicKey?: string | null;
        sendConfigured?: boolean;
      };
      const fromServer = data.publicKey?.trim();
      if (fromServer) {
        return {
          publicKey: fromServer,
          sendConfigured: Boolean(data.sendConfigured),
        };
      }
      sendConfigured = Boolean(data.sendConfigured);
    }
  } catch {
    /* offline / API down — fall through */
  }

  const fromEnv = getBuildTimeVapidPublicKey();
  if (fromEnv) {
    return { publicKey: fromEnv, sendConfigured };
  }

  return { publicKey: FALLBACK_VAPID_PUBLIC_KEY, sendConfigured };
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") return "denied";
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function canOfferWebPush(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  return "serviceWorker" in navigator && "Notification" in window && "PushManager" in window;
}

/**
 * Subscribe this device for Web Push. Returns a typed result so the UI can
 * explain permission / iOS / config failures instead of a generic error.
 */
export async function subscribeToPush(): Promise<PushSubscribeResult> {
  if (typeof window === "undefined") {
    return { ok: false, code: "unsupported", message: "Push is not available in this environment." };
  }
  if (!window.isSecureContext) {
    return {
      ok: false,
      code: "insecure",
      message: "Push needs HTTPS (or localhost). Open app.evorios.com.",
    };
  }
  if (!("Notification" in window) || !("PushManager" in window)) {
    return {
      ok: false,
      code: "unsupported",
      message: "This browser does not support web push.",
    };
  }
  if (isIosDevice() && !isStandalonePwa()) {
    return {
      ok: false,
      code: "ios_browser",
      message:
        "On iPhone/iPad, add Evorios to your Home Screen first, then open it from there and Enable push.",
    };
  }
  if (!("serviceWorker" in navigator)) {
    return {
      ok: false,
      code: "no_service_worker",
      message: "Service worker unavailable — try reinstalling the app / hard-refresh.",
    };
  }

  const { publicKey, sendConfigured } = await resolveVapidPublicKey();
  if (!publicKey) {
    return {
      ok: false,
      code: "missing_vapid",
      message: "Push keys are not configured yet. Ask the site owner to set VAPID on Vercel.",
    };
  }

  const permission = await requestPushPermission();
  if (permission === "denied") {
    return {
      ok: false,
      code: "permission_denied",
      message:
        "Notification permission is blocked. Enable notifications for this site in browser settings, then try again.",
    };
  }
  if (permission !== "granted") {
    return {
      ok: false,
      code: "permission_dismissed",
      message: "Permission was not granted. Tap Enable again and choose Allow.",
    };
  }

  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.ready;
  } catch {
    return {
      ok: false,
      code: "no_service_worker",
      message: "Service worker is not ready yet. Wait a moment and try again.",
    };
  }
  if (!reg.pushManager) {
    return {
      ok: false,
      code: "no_push_manager",
      message: "Push manager missing on this device.",
    };
  }

  const appServerKey = urlBase64ToArrayBuffer(publicKey);

  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      // Re-subscribe when the applicationServerKey changed (common after key rotation).
      try {
        await existing.unsubscribe();
      } catch {
        /* continue and try fresh subscribe */
      }
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });

    const json = sub.toJSON() as WebPushSubscription;
    if (!json.endpoint) {
      return {
        ok: false,
        code: "no_endpoint",
        message: "Push subscription was created without an endpoint.",
      };
    }

    return { ok: true, subscription: json, sendConfigured };
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Unknown subscribe error";
    return {
      ok: false,
      code: "subscribe_failed",
      message: `Could not subscribe for push (${detail}).`,
    };
  }
}

export async function savePushSubscriptionRemote(
  userId: string,
  sub: WebPushSubscription,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  // Append and de-dupe by endpoint.
  const { data } = await supabase.from("profiles").select("push_subscriptions").eq("id", userId).maybeSingle();
  const current = (data?.push_subscriptions ?? []) as unknown;
  const arr = Array.isArray(current) ? (current as WebPushSubscription[]) : [];
  const next = [
    ...arr.filter((s) => s && typeof s.endpoint === "string" && s.endpoint !== sub.endpoint),
    sub,
  ];
  const { error } = await supabase.from("profiles").update({ push_subscriptions: next }).eq("id", userId);
  if (error) {
    throw new Error(error.message || "Could not save push subscription.");
  }
}
