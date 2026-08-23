import { Step2ItemInfo } from "./Step2ItemInfo";
import { Step3Modes } from "./Step3Modes";
import type { StepProps } from "../types";

/** Frictionless wizard step 2 — item details + rent/sell pricing in one scroll. */
export function Step2Details({
  draft,
  setDraft,
  gateMessage = null,
  onDismissGateMessage,
  onEditPhotos,
}: StepProps & {
  gateMessage?: string | null;
  onDismissGateMessage?: () => void;
  onEditPhotos?: () => void;
}) {
  return (
    <div className="flex flex-col">
      <Step2ItemInfo
        draft={draft}
        setDraft={setDraft}
        gateMessage={gateMessage}
        onDismissGateMessage={onDismissGateMessage}
        onEditPhotos={onEditPhotos}
      />
      <Step3Modes draft={draft} setDraft={setDraft} />
    </div>
  );
}
