import { ArrowLeft, Store } from "lucide-react";
import { APP_NAME } from "../../lib/brand";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function GarageShopMissingScreen({
  onBack,
  onBrowseYardSales,
}: {
  onBack: () => void;
  onBrowseYardSales: () => void;
}) {
  return (
    <div className="screen flex flex-col bg-[#F0F4F2]">
      <header className="shrink-0 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
          Back
        </button>
      </header>
      <div className="screen-scroll flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <Store className="h-8 w-8" style={{ color: GREEN }} aria-hidden />
        </div>
        <h1 className="mt-4 text-[18px] font-extrabold text-gray-900">Garage not found</h1>
        <p className="mt-2 max-w-[280px] text-sm text-gray-600">
          This garage link may be outdated or the host removed their showcase. Browse other yard sales
          on {APP_NAME}.
        </p>
        <button
          type="button"
          onClick={onBrowseYardSales}
          className="mt-6 w-full max-w-[320px] rounded-xl py-3.5 text-sm font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Browse yard sales
        </button>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-sm font-semibold text-gray-600"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
