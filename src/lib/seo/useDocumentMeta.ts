import { useEffect } from "react";

const JSON_LD_ID = "evorios-rent-landing-jsonld";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(data: Record<string, unknown> | null) {
  const existing = document.getElementById(JSON_LD_ID);
  if (!data) {
    existing?.remove();
    return;
  }
  let el = existing as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = JSON_LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export type DocumentMetaInput = {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  jsonLd?: Record<string, unknown> | null;
};

/**
 * Sets document title, description, robots, canonical, Open Graph, and optional JSON-LD.
 * Restores a safe default title on unmount (SPA navigation away from landings).
 */
export function useDocumentMeta(meta: DocumentMetaInput | null) {
  const title = meta?.title ?? null;
  const description = meta?.description ?? null;
  const canonicalUrl = meta?.canonicalUrl ?? null;
  const robots = meta?.robots ?? null;
  const jsonLdSerialized = meta?.jsonLd ? JSON.stringify(meta.jsonLd) : null;

  useEffect(() => {
    if (!title || !description || !canonicalUrl || !robots) return;

    const previousTitle = document.title;
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertLink("canonical", canonicalUrl);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    upsertJsonLd(jsonLdSerialized ? (JSON.parse(jsonLdSerialized) as Record<string, unknown>) : null);

    return () => {
      document.title = previousTitle || "Evorios — Neighborhood Marketplace";
      document.head.querySelector('meta[name="robots"]')?.remove();
      upsertJsonLd(null);
    };
  }, [title, description, canonicalUrl, robots, jsonLdSerialized]);
}
