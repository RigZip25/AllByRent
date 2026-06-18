import { Step2ItemInfo } from "./Step2ItemInfo";
import { Step3Modes } from "./Step3Modes";
import type { StepProps } from "../types";

/** Frictionless wizard step 2 — item details + rent/buy/gift pricing in one scroll. */
export function Step2Details({ draft, setDraft }: StepProps) {
  return (
    <div className="flex flex-col">
      <Step2ItemInfo draft={draft} setDraft={setDraft} />
      <Step3Modes draft={draft} setDraft={setDraft} />
    </div>
  );
}
