import { ArrowLeft } from "lucide-react";
import { PeerChatPanel } from "../components/PeerChatPanel";
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
