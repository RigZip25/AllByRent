const SHARE_QUERY_KEYS = ["garage", "item", "listingId", "skipSplash"] as const;

/** Redirect /link and /item/:id to the SPA deep-link query before React boots. */
export function redirectShareLinkToApp(): boolean {
  if (typeof window === "undefined") return false;

  const { pathname, search, origin } = window.location;

  if (pathname === "/link" || pathname === "/link/") {
    redirectToAppSearch(origin, new URLSearchParams(search));
    return true;
  }

  const itemMatch = pathname.match(/^\/item\/([^/]+)\/?$/i);
  if (itemMatch?.[1]) {
    const params = new URLSearchParams(search);
    try {
      params.set("listingId", decodeURIComponent(itemMatch[1]));
    } catch {
      params.set("listingId", itemMatch[1]);
    }
    params.set("skipSplash", "1");
    redirectToAppSearch(origin, params);
    return true;
  }

  return false;
}

function redirectToAppSearch(origin: string, params: URLSearchParams): void {
  const target = new URL("/", origin);
  for (const key of SHARE_QUERY_KEYS) {
    const value = params.get(key);
    if (value) target.searchParams.set(key, value);
  }
  if (!target.searchParams.has("skipSplash")) {
    target.searchParams.set("skipSplash", "1");
  }
  window.location.replace(target.toString());
}
