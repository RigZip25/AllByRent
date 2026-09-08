import type { ReactNode } from "react";
import { ArrowLeft, Camera, Gavel, Store } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

export type SellAfterPublishPath = "live" | "open_sale_pick" | "open_sale_snap";

type SellPathChoiceScreenProps = {
  listingTitle: string;
  onBack: () => void;
  onChoose: (path: SellAfterPublishPath) => void;
};

/**
 * After a sell listing goes live — three paths we agreed:
 * 1) stay live in the main garage
 * 2) put on Open Sale (pick from garage / this item)
 * 3) Open Sale and snap more items straight onto the sale
 */
export function SellPathChoiceScreen({
  listingTitle,
  onBack,
  onChoose,
}: SellPathChoiceScreenProps) {
  const { sellPathChoice: copy, common } = useMessages();

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <div
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44` }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label={common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-snug" style={{ color: GREEN }}>
              {copy.title}
            </h1>
            <p className="truncate text-[13px] text-gray-600">{listingTitle}</p>
          </div>
        </div>
      </div>

      <div className="screen-scroll flex flex-1 flex-col gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <p className="text-sm text-gray-600">{copy.intro}</p>

        <PathCard
          icon={<Store className="h-5 w-5" style={{ color: GREEN }} />}
          title={copy.liveTitle}
          body={copy.liveBody}
          cta={copy.liveCta}
          onClick={() => onChoose("live")}
        />
        <PathCard
          icon={<Gavel className="h-5 w-5" style={{ color: GREEN }} />}
          title={copy.openSaleTitle}
          body={copy.openSaleBody}
          cta={copy.openSaleCta}
          onClick={() => onChoose("open_sale_pick")}
        />
        <PathCard
          icon={<Camera className="h-5 w-5" style={{ color: GREEN }} />}
          title={copy.snapTitle}
          body={copy.snapBody}
          cta={copy.snapCta}
          onClick={() => onChoose("open_sale_snap")}
        />
      </div>
    </div>
  );
}

function PathCard({
  icon,
  title,
  body,
  cta,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border bg-white p-4 text-left active:bg-amber-50/40"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "#FFF7ED" }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold" style={{ color: GREEN }}>
            {title}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-gray-600">{body}</p>
          <p className="mt-2 text-[13px] font-bold leading-snug" style={{ color: AMBER }}>
            {cta}
          </p>
        </div>
      </div>
    </button>
  );
}
