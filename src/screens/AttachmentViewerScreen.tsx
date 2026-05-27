import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

const GREEN = "#0D5C3A";

type LoadState = "loading" | "embedded" | "fetched" | "blocked";

function guessType(url: string): "pdf" | "image" | "video" | "unknown" {
  const lower = url.toLowerCase();
  if (lower.includes(".pdf")) return "pdf";
  if (lower.match(/\.(png|jpe?g|webp|gif)(\?|#|$)/)) return "image";
  if (lower.match(/\.(mp4|webm|mov|m4v)(\?|#|$)/)) return "video";
  return "unknown";
}

export function AttachmentViewerScreen({
  url,
  title,
  onBack,
}: {
  url: string;
  title?: string;
  onBack: () => void;
}) {
  const normalized = url.trim();
  const [state, setState] = useState<LoadState>("loading");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);

  const guessed = useMemo(() => guessType(normalized), [normalized]);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setObjectUrl(null);
    setContentType(null);

    if (!normalized) return () => undefined;

    // Prefer staying in-app: try CORS fetch -> render as blob URL.
    void (async () => {
      try {
        const response = await fetch(normalized, { method: "GET" });
        if (!response.ok) throw new Error("Fetch failed");
        const type = response.headers.get("content-type");
        const blob = await response.blob();
        if (cancelled) return;
        const nextObjectUrl = URL.createObjectURL(blob);
        setObjectUrl(nextObjectUrl);
        setContentType(type);
        setState("fetched");
      } catch {
        if (cancelled) return;
        // Fallback to embedding the URL directly (may be blocked by X-Frame-Options).
        setState("embedded");
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized]);

  const openExternally = () => {
    window.open(normalized, "_blank", "noopener,noreferrer");
  };

  const renderContent = () => {
    if (!normalized) {
      return <div className="p-4 text-sm text-gray-600">No link provided.</div>;
    }

    const effectiveType = contentType ?? (guessed === "pdf" ? "application/pdf" : null);

    if (state === "fetched" && objectUrl) {
      if (effectiveType?.includes("image") || guessed === "image") {
        return (
          <div className="p-4">
            <img src={objectUrl} alt="" className="w-full rounded-2xl border border-gray-200" />
          </div>
        );
      }
      if (effectiveType?.includes("video") || guessed === "video") {
        return (
          <div className="p-4">
            <video src={objectUrl} controls className="w-full rounded-2xl border border-gray-200" />
          </div>
        );
      }
      // PDFs + everything else: iframe.
      return <iframe title="Attachment" src={objectUrl} className="h-full w-full" />;
    }

    if (state === "embedded") {
      return (
        <div className="h-full w-full">
          <iframe title="Attachment" src={normalized} className="h-full w-full" />
        </div>
      );
    }

    if (state === "blocked") {
      return (
        <div className="p-4 text-sm text-gray-700">
          This link couldn’t be embedded in-app (site blocks iframe viewing). You can still open it
          externally.
        </div>
      );
    }

    return (
      <div className="p-4 text-sm text-gray-600">
        Loading… If it doesn’t load, try “Open externally”.
      </div>
    );
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-gray-900">{title ?? "Attachment"}</p>
            <p className="truncate text-[11px] text-gray-500">{normalized}</p>
          </div>
          <button
            type="button"
            onClick={openExternally}
            className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {renderContent()}
        {state === "embedded" ? (
          <div className="shrink-0 border-t border-gray-100 bg-white p-3">
            <p className="text-xs text-gray-500">
              Some sites block in-app viewing. If the page is blank, tap “Open”.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

