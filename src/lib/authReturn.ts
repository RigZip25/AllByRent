const AUTH_RETURN_KEY = "abr_auth_return";
const AUTH_INTENT_KEY = "abr_auth_intent";
const PENDING_EMAIL_KEY = "abr_auth_pending_email";
const PENDING_EMAIL_LOCAL_KEY = "abr_auth_pending_email_local";
const EDITING_LISTING_KEY = "abr_editing_listing_id";

export type AuthIntent = "list" | "book" | "message" | "generic";

export function setAuthReturn(screen: string): void {
  try {
    sessionStorage.setItem(AUTH_RETURN_KEY, screen);
  } catch {
    // ignore
  }
}

export function setAuthIntent(intent: AuthIntent): void {
  try {
    sessionStorage.setItem(AUTH_INTENT_KEY, intent);
  } catch {
    // ignore
  }
}

export function peekAuthReturn(): string | null {
  try {
    return sessionStorage.getItem(AUTH_RETURN_KEY);
  } catch {
    return null;
  }
}

export function peekAuthIntent(): AuthIntent {
  try {
    const value = sessionStorage.getItem(AUTH_INTENT_KEY);
    if (value === "list" || value === "book" || value === "message") return value;
    return "generic";
  } catch {
    return "generic";
  }
}

export function consumeAuthReturn(): string | null {
  try {
    const value = sessionStorage.getItem(AUTH_RETURN_KEY);
    sessionStorage.removeItem(AUTH_RETURN_KEY);
    sessionStorage.removeItem(AUTH_INTENT_KEY);
    return value;
  } catch {
    return null;
  }
}

export function setPendingAuthEmail(email: string): void {
  const normalized = email.trim().toLowerCase();
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, normalized);
    localStorage.setItem(PENDING_EMAIL_LOCAL_KEY, normalized);
  } catch {
    // ignore
  }
}

export function peekPendingAuthEmail(): string | null {
  try {
    return (
      sessionStorage.getItem(PENDING_EMAIL_KEY) ??
      localStorage.getItem(PENDING_EMAIL_LOCAL_KEY)
    );
  } catch {
    return null;
  }
}

export function clearPendingAuthEmail(): void {
  try {
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
    localStorage.removeItem(PENDING_EMAIL_LOCAL_KEY);
  } catch {
    // ignore
  }
}

export function setEditingListingReturn(listingId: string | null): void {
  try {
    if (listingId?.trim()) {
      sessionStorage.setItem(EDITING_LISTING_KEY, listingId.trim());
    } else {
      sessionStorage.removeItem(EDITING_LISTING_KEY);
    }
  } catch {
    // ignore
  }
}

export function peekEditingListingReturn(): string | null {
  try {
    return sessionStorage.getItem(EDITING_LISTING_KEY);
  } catch {
    return null;
  }
}

export function consumeEditingListingReturn(): string | null {
  try {
    const value = sessionStorage.getItem(EDITING_LISTING_KEY);
    sessionStorage.removeItem(EDITING_LISTING_KEY);
    return value;
  } catch {
    return null;
  }
}
