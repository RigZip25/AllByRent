import { Step2ItemInfo } from "./Step2ItemInfo";
import { Step3Modes } from "./Step3Modes";
import { Step4PickupDelivery } from "./Step4PickupDelivery";
import { Step5Availability } from "./Step5Availability";
import type { StepProps } from "../types";

/** Frictionless wizard step 2 — item details, pricing, pickup, and availability in one scroll. */
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
      <Step4PickupDelivery draft={draft} setDraft={setDraft} />
      <Step5Availability draft={draft} setDraft={setDraft} />
    </div>
  );
}
