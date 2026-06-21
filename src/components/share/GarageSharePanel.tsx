import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { SocialShareButtons } from "./SocialShareButtons";
import type { SharePayload } from "../../lib/socialShare";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type GarageSharePanelProps = {
  title: string;
  payload: SharePayload;
  shareKind: "garage" | "listing" | "shelf";
  targetId?: string;
  compact?: boolean;
  defaultOpen?: boolean;
};

export function GarageSharePanel({
  title,
  payload,
  shareKind,
  targetId,
  compact = false,
  defaultOpen = false,
}: GarageSharePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hint = useMemo(
    () => "Share your link — neighbors land on your shelf, not the app home page.",
    [],
  );

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${GREEN}12`, color: GREEN }}
        >
          <Share2 className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-gray-900">{title}</span>
          <span className="block text-[12px] text-gray-500">{hint}</span>
        </span>
        <span className="text-[12px] font-semibold" style={{ color: GREEN }}>
          {open ? "Hide" : "Share"}
        </span>
      </button>

      {open ? (
        <div className="mt-3 border-t pt-3" style={{ borderColor: BORDER }}>
          <SocialShareButtons
            payload={payload}
            shareKind={shareKind}
            targetId={targetId}
            compact={compact}
          />
        </div>
      ) : null}
    </div>
  );
}
