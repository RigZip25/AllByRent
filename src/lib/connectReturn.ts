/** Persist Stripe Connect return across the Account Link reload + URL cleanup. */

export type ConnectReturnFlag = "done" | "refresh";

const KEY = "evorios_connect_return_v1";

export function captureConnectReturnFromUrl(search = typeof window !== "undefined" ? window.location.search : ""): ConnectReturnFlag | null {
  if (typeof window === "undefined") return null;
  const flag = new URLSearchParams(search).get("connect");
  if (flag !== "done" && flag !== "refresh") return null;
  try {
    sessionStorage.setItem(KEY, flag);
  } catch {
    /* private mode */
  }
  return flag;
}

export function peekConnectReturn(): ConnectReturnFlag | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw === "done" || raw === "refresh" ? raw : null;
  } catch {
    return null;
  }
}

export function consumeConnectReturn(): ConnectReturnFlag | null {
  const flag = peekConnectReturn();
  if (!flag) return null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return flag;
}
