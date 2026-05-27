const AUTH_RETURN_KEY = "abr_auth_return";
const PENDING_EMAIL_KEY = "abr_auth_pending_email";

export function setAuthReturn(screen: string): void {
  try {
    sessionStorage.setItem(AUTH_RETURN_KEY, screen);
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

export function consumeAuthReturn(): string | null {
  try {
    const value = sessionStorage.getItem(AUTH_RETURN_KEY);
    sessionStorage.removeItem(AUTH_RETURN_KEY);
    return value;
  } catch {
    return null;
  }
}

export function setPendingAuthEmail(email: string): void {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    // ignore
  }
}

export function peekPendingAuthEmail(): string | null {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function clearPendingAuthEmail(): void {
  try {
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
  } catch {
    // ignore
  }
}
