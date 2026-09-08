import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PeerChatPanel } from "../components/PeerChatPanel";
import { ModerationMenu } from "../components/moderation/ModerationMenu";
import { fetchRequestByIdRemote, type WantedRequest } from "../lib/requestsStorage";
import { localizeCategoryLabel } from "../lib/i18n/categoryLabels";
import { BRAND_GREEN } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

type Props = {
  requestId: string;
  peerId: string;
  onBack: () => void;
  onRequireAuth?: () => void;
};

/** Chat anchored to an ask, so a neighbor can answer before listing anything. */
export function RequestChatScreen({ requestId, peerId, onBack, onRequireAuth }: Props) {
  const { peerChat, common } = useMessages();
  const [request, setRequest] = useState<WantedRequest | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchRequestByIdRemote(requestId).then((row) => {
      if (!cancelled) setRequest(row);
    });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const title = request?.subcategory
    ? localizeCategoryLabel(request.subcategory)
    : peerChat.requestChatFallback;

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
            <p className="text-[12px] text-gray-500">{peerChat.requestChatSubtitle}</p>
          </div>
          <ModerationMenu
            targetKind="profile"
            targetId={peerId}
            targetThreadKey={requestId}
            reportedUserId={peerId}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <PeerChatPanel
          requestId={requestId}
          peerId={peerId}
          itemTitle={title}
          onRequireAuth={onRequireAuth}
        />
      </div>
    </div>
  );
}
