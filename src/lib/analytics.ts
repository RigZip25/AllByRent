/**
 * Lightweight product analytics sink.
 *
 * Events stay on the device (ring buffer + DOM event) until a transport is
 * registered, so shipping instrumentation never depends on a vendor SDK.
 * Payloads are sanitized before they leave the call site: photos, raw image
 * data, tokens, and contact details must never reach an analytics pipeline.
 */

export type AnalyticsEventName =
  | "ai_category_started"
  | "ai_category_suggested"
  | "ai_category_confirmed"
  | "ai_category_changed"
  | "ai_category_failed"
  | "manual_category_opened"
  | "listing_type_selected"
  | "ai_fields_accepted"
  | "ai_fields_edited";

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProps = Record<string, AnalyticsValue | undefined>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  props: Record<string, AnalyticsValue>;
  at: number;
};

export type AnalyticsTransport = (event: AnalyticsEvent) => void;

export const ANALYTICS_DOM_EVENT = "evorios:analytics";
const BUFFER_KEY = "evorios:analytics:events";
const BUFFER_LIMIT = 100;
const MAX_STRING_LENGTH = 120;

/** Keys that could carry image bytes, secrets, or contact details. */
const BLOCKED_KEY_PATTERN =
  /(image|photo|picture|thumb|blob|base64|dataurl|payload|token|secret|password|email|phone|address|lat|lng|latitude|longitude|ssn|serial|vin|card)/i;

let transport: AnalyticsTransport | null = null;

export function setAnalyticsTransport(next: AnalyticsTransport | null): void {
  transport = next;
}

function sanitizeValue(value: AnalyticsValue | undefined): AnalyticsValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Long strings are the usual way raw content leaks into analytics.
  return trimmed.length > MAX_STRING_LENGTH ? trimmed.slice(0, MAX_STRING_LENGTH) : trimmed;
}

export function sanitizeAnalyticsProps(props: AnalyticsProps | undefined): Record<string, AnalyticsValue> {
  if (!props) return {};
  const clean: Record<string, AnalyticsValue> = {};
  for (const [key, raw] of Object.entries(props)) {
    if (BLOCKED_KEY_PATTERN.test(key)) continue;
    const value = sanitizeValue(raw);
    if (value === undefined) continue;
    clean[key] = value;
  }
  return clean;
}

function readBuffer(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(events.slice(-BUFFER_LIMIT)));
  } catch {
    // Analytics must never break a user flow (quota, private mode).
  }
}

export function trackEvent(name: AnalyticsEventName, props?: AnalyticsProps): AnalyticsEvent {
  const event: AnalyticsEvent = {
    name,
    props: sanitizeAnalyticsProps(props),
    at: Date.now(),
  };

  try {
    transport?.(event);
  } catch {
    // A broken transport must not surface to the user.
  }

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent(ANALYTICS_DOM_EVENT, { detail: event }));
    } catch {
      // ignore
    }
    writeBuffer([...readBuffer(), event]);
  }

  if (import.meta.env?.DEV) {
    console.debug("[analytics]", event.name, event.props);
  }

  return event;
}

export function readAnalyticsBuffer(): AnalyticsEvent[] {
  return readBuffer();
}

export function clearAnalyticsBuffer(): void {
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch {
    // ignore
  }
}
