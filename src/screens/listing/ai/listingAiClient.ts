import { AI_CATEGORY_CONFIG } from "./aiConfig";

export type ListingAiErrorCode =
  | "timeout"
  | "network"
  | "unsupported_image"
  | "invalid_response"
  | "unavailable"
  | "rate_limited"
  | "invalid_request";

export type ListingAiCall<T> =
  | { ok: true; data: T }
  | { ok: false; code: ListingAiErrorCode; message: string };

const API_BASE = "/api/listing";

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const { getAccessToken } = await import("../../../lib/stripePayments");
    const token = await getAccessToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // Anonymous drafts are allowed — the endpoint applies a stricter IP limit.
  }
  return {};
}

function codeFromStatus(status: number, serverCode: unknown): ListingAiErrorCode {
  if (typeof serverCode === "string") {
    if (serverCode === "unsupported_image") return "unsupported_image";
    if (serverCode === "invalid_response") return "invalid_response";
    if (serverCode === "unavailable") return "unavailable";
    if (serverCode === "invalid_request" || serverCode === "unknown_category") {
      return "invalid_request";
    }
  }
  if (status === 429) return "rate_limited";
  if (status === 415) return "unsupported_image";
  if (status === 422) return "invalid_response";
  return "unavailable";
}

/**
 * POSTs to a listing AI endpoint with a hard timeout.
 *
 * Callers translate the error code into a UI state; nothing here throws, so a
 * failed analysis can never leave the wizard stuck on a spinner.
 */
export async function postListingAi<T>(
  path: "classify" | "fields" | "copy",
  body: unknown,
  options?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<ListingAiCall<T>> {
  const timeoutMs = options?.timeoutMs ?? AI_CATEGORY_CONFIG.requestTimeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  options?.signal?.addEventListener("abort", onExternalAbort);

  try {
    const headers = await authHeaders();
    const response = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      code?: string;
      error?: string;
    };

    if (!response.ok || payload.ok === false) {
      return {
        ok: false,
        code: codeFromStatus(response.status, payload.code),
        message: payload.error ?? `Listing AI request failed (${response.status})`,
      };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      code: aborted ? "timeout" : "network",
      message: aborted ? "Analysis timed out" : "Network error",
    };
  } finally {
    clearTimeout(timer);
    options?.signal?.removeEventListener("abort", onExternalAbort);
  }
}
