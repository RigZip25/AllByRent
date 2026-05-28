import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type WebPushSubscription = PushSubscriptionJSON & {
  endpoint: string;
};

function getVapidPublicKey(): string | null {
  const key = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim();
  return key && key.length > 0 ? key : null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") return "denied";
  if (!("Notification" in window)) return "denied";
  return Notification.requestPermission();
}

export async function subscribeToPush(): Promise<WebPushSubscription | null> {
  if (typeof window === "undefined") return null;
  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) return null;
  if (!("serviceWorker" in navigator)) return null;

  const permission = await requestPushPermission();
  if (permission !== "granted") return null;

  const reg = await navigator.serviceWorker.ready;
  if (!reg.pushManager) return null;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  const json = sub.toJSON() as WebPushSubscription;
  if (!json.endpoint) return null;
  return json;
}

export async function savePushSubscriptionRemote(userId: string, sub: WebPushSubscription): Promise<void> {
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
  await supabase.from("profiles").update({ push_subscriptions: next }).eq("id", userId);
}

