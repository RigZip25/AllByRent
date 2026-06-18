import { useState } from "react";
import { Copy, Facebook, Instagram, Link2, MessageCircle, Send, Share2 } from "lucide-react";
import {
  logShareAction,
  platformHint,
  preferredFormatForPlatform,
  shareToPlatform,
  type SharePayload,
  type SocialPlatform,
} from "../../lib/socialShare";

const BORDER = "#E8E6E0";

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  icon: JSX.Element;
  color: string;
}[] = [
  { id: "tiktok", label: "TikTok", icon: <span className="text-base">🎵</span>, color: "#111" },
  { id: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" />, color: "#C13584" },
  { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" />, color: "#1877F2" },
  { id: "nextdoor", label: "Nextdoor", icon: <Send className="h-4 w-4" />, color: "#00B87C" },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" />, color: "#25D366" },
];

export function SocialShareButtons({
  payload,
  imageBlob,
  imageFilename,
  shareKind,
  targetId,
  onFormatHint,
  compact = false,
}: {
  payload: SharePayload;
  imageBlob?: Blob;
  imageFilename?: string;
  shareKind: "listing" | "garage" | "request" | "shelf";
  targetId?: string;
  /** Called so parent can switch share-card format before image share. */
  onFormatHint?: (format: ReturnType<typeof preferredFormatForPlatform>) => void;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);

  const runShare = async (platform: SocialPlatform) => {
    onFormatHint?.(preferredFormatForPlatform(platform));
    const fullPayload = { ...payload, imageBlob, imageFilename };
    const result = await shareToPlatform(platform, fullPayload);
    if (result === "shared" || result === "opened" || result === "copied") {
      logShareAction({ platform, kind: shareKind, targetId });
    }
    const hint = platformHint(platform);
    if (result === "copied") setStatus("Caption copied — paste in the app.");
    else if (result === "opened" && hint) setStatus(hint);
    else if (result === "shared") setStatus("Shared!");
    else if (result === "cancelled") setStatus(null);
    else setStatus("Copy the caption and download the image if needed.");
    window.setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="space-y-2">
      <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2"}`}>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => void runShare(p.id)}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: p.color }}
            aria-label={`Share to ${p.label}`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void runShare("native")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white ${compact ? "" : "col-span-2"}`}
          style={{ backgroundColor: "#0D5C3A" }}
        >
          <Share2 className="h-4 w-4" />
          Share…
        </button>
        <button
          type="button"
          onClick={() => void runShare("copy")}
          className={`flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-[13px] font-semibold text-gray-700 ${compact ? "col-span-3" : "col-span-2"}`}
          style={{ borderColor: BORDER }}
        >
          <Copy className="h-4 w-4" />
          Copy caption
        </button>
        <button
          type="button"
          onClick={() => void runShare("copy")}
          className="col-span-full flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 text-[12px] font-medium text-gray-500"
          style={{ borderColor: BORDER }}
        >
          <Link2 className="h-3.5 w-3.5" />
          {payload.url}
        </button>
      </div>
      {status ? <p className="text-[12px] text-emerald-800">{status}</p> : null}
    </div>
  );
}
