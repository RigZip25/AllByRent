import { ArrowLeft } from "lucide-react";
import { PeerChatPanel } from "../components/PeerChatPanel";
import { ModerationMenu } from "../components/moderation/ModerationMenu";
import { getPublishedListingById } from "../lib/listingStorage";
import { getListingDisplayTitle } from "../lib/listingQr";
import { BRAND_GREEN } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

type Props = {
  listingId: string;
  peerId: string;
  onBack: () => void;
  onRequireAuth?: () => void;
};

export function ListingChatScreen({ listingId, peerId, onBack, onRequireAuth }: Props) {
  const { peerChat, common } = useMessages();
  const listing = getPublishedListingById(listingId);
  const title = listing
    ? getListingDisplayTitle(listing.title) || listing.title || peerChat.listingChatFallback
    : peerChat.listingChatFallback;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label={common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
              {title}
            </h1>
            <p className="text-[12px] text-gray-500">{peerChat.listingChatSubtitle}</p>
          </div>
          <ModerationMenu
            targetKind="profile"
            targetId={peerId}
            targetThreadKey={listingId}
            reportedUserId={peerId}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <PeerChatPanel
          listingId={listingId}
          peerId={peerId}
          itemTitle={title}
          onRequireAuth={onRequireAuth}
        />
      </div>
    </div>
  );
}

/** Defensive empty state when `?screen=listingChat` lacks listingId/peerId. */
export function ListingChatMissingScreen({
  onBack,
  onOpenMessages,
}: {
  onBack: () => void;
  onOpenMessages: () => void;
}) {
  const { peerChat, common } = useMessages();
  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label={common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
            {peerChat.listingChatFallback}
          </h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-[15px] font-semibold text-gray-800">{peerChat.listingChatMissingTitle}</p>
        <p className="mt-2 text-[14px] text-gray-500">{peerChat.listingChatMissingBody}</p>
        <button
          type="button"
          onClick={onOpenMessages}
          className="mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {peerChat.listingChatMissingCta}
        </button>
      </div>
    </div>
  );
}
