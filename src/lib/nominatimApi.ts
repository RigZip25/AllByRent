const NOMINATIM_ORIGIN = "https://nominatim.openstreetmap.org";
const USER_AGENT = "AllByRent App (contact@allbyrent.app)";

/** Dev server proxies /nominatim → nominatim.openstreetmap.org (avoids browser blocks). */
export function getNominatimBaseUrl(): string {
  if (import.meta.env.DEV) return "/nominatim";
  return NOMINATIM_ORIGIN;
}

export function nominatimHeaders(): HeadersInit {
  return { "User-Agent": USER_AGENT };
}

export function nominatimUrl(path: string, params: Record<string, string>): URL {
  const url = new URL(path, `${getNominatimBaseUrl()}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}
