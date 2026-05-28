import { useEffect, useMemo, useState } from "react";
import { Copy, Facebook, Instagram, Link2, Loader2, MessageCircle, Send, Share2 } from "lucide-react";
import type { ListingDraft } from "./types";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { extractAnthropicText, postAnthropicMessages } from "../../lib/anthropicClient";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

function listingUrl(draft: ListingDraft): string {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://allbyrent.app";
    const url = new URL(origin);
    url.searchParams.set("listingId", draft.id);
    return url.toString();
  } catch {
    return `https://allbyrent.app?listingId=${draft.id}`;
  }
}

function buildPrompt(params: {
  language: string;
  title: string;
  category: string;
  price: string;
  url: string;
}): string {
  return [
    `Write a short social caption in ${params.language}.`,
    "Constraints:",
    "- 1-2 sentences, friendly, neighborhood vibe.",
    "- Mention the item and that it's available on AllByRent.",
    "- Include the URL at the end on a new line.",
    "- No hashtags.",
    "",
    `Item: ${params.title}`,
    `Category: ${params.category}`,
    `Price: ${params.price}`,
    `URL: ${params.url}`,
  ].join("\n");
}

export function ListingShareScreen({
  draft,
  onDone,
}: {
  draft: ListingDraft;
  onDone: () => void;
}) {
  const url = useMemo(() => listingUrl(draft), [draft]);
  const title = getListingDisplayTitle(draft.title) || draft.title || "My listing";
  const price = draft.pricing.dailyRate ? `$${draft.pricing.dailyRate}/day` : "Available now";
  const language = typeof navigator !== "undefined" ? navigator.language : "English";

  const [caption, setCaption] = useState<string>(`${title} on AllByRent.\n${url}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setBusy(true);
    setError(null);
    void postAnthropicMessages({
      model: "claude-3-5-haiku-latest",
      max_tokens: 180,
      messages: [
        {
          role: "user",
          content: buildPrompt({
            language,
            title,
            category: draft.category,
            price,
            url,
          }),
        },
      ],
    })
      .then((data) => {
        if (!mounted) return;
        const text = extractAnthropicText(data);
        if (text) setCaption(text);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Caption generation failed");
      })
      .finally(() => {
        if (!mounted) return;
        setBusy(false);
      });
    return () => {
      mounted = false;
    };
  }, [draft.category, language, price, title, url]);

  const shareNative = async () => {
    if (typeof navigator === "undefined" || !("share" in navigator)) return false;
    try {
      await navigator.share({ title: "AllByRent", text: caption, url });
      return true;
    } catch {
      return false;
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // ignore
    }
  };

  const buttons: { id: string; label: string; icon: JSX.Element; color: string }[] = [
    { id: "tiktok", label: "TikTok", icon: <span className="text-base">🎵</span>, color: "#111" },
    { id: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" />, color: "#C13584" },
    { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" />, color: "#1877F2" },
    { id: "nextdoor", label: "Nextdoor", icon: <Send className="h-4 w-4" />, color: "#00B87C" },
    { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" />, color: "#25D366" },
  ];

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-[#F9FAFB]">
      <div className="shrink-0 border-b bg-white px-5 pb-4 pt-4" style={{ borderColor: BORDER }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Share</p>
        <h2 className="mt-1 text-[18px] font-extrabold" style={{ color: GREEN }}>
          Tell neighbors about {title}
        </h2>
        <p className="mt-1 text-[13px] text-gray-500">Caption auto-generated in your language.</p>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-5 pb-24 space-y-4">
        <div className="rounded-3xl border bg-white p-4" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-gray-700">Caption</p>
            {busy ? (
              <span className="inline-flex items-center gap-2 text-[12px] text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating…
              </span>
            ) : null}
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            className="mt-2 w-full resize-none rounded-2xl border bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            style={{ borderColor: BORDER }}
          />
          {error ? (
            <p className="mt-2 text-[12px] text-amber-700">
              {error}
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void shareNative().then((ok) => (ok ? undefined : void copyLink()))}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-[13px] font-semibold text-gray-700"
              style={{ borderColor: BORDER }}
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {buttons.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => void shareNative().then((ok) => (ok ? undefined : void copyLink()))}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: b.color }}
              aria-label={`Share to ${b.label}`}
            >
              {b.icon}
              {b.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void copyLink()}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-[13px] font-semibold text-gray-700"
            style={{ borderColor: BORDER }}
          >
            <Link2 className="h-4 w-4" />
            Copy link
          </button>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-2xl border bg-white px-4 py-3 text-[14px] font-semibold text-gray-700"
          style={{ borderColor: BORDER }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

