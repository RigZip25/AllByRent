import { Settings } from "lucide-react";
import { BottomNav } from "../app/components/BottomNav";
import { HostDashboard } from "../app/components/HostDashboard";
import { RentanoChatSheet } from "../components/RentanoChat";
import { useState } from "react";

const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

type GarageScreenProps = {
  onNavigate: (screen: string) => void;
  onHome: () => void;
  onSearch: () => void;
  onStockGarage: () => void;
  onOpenSettings: () => void;
};

export function GarageScreen({
  onNavigate,
  onHome,
  onSearch,
  onStockGarage,
  onOpenSettings,
}: GarageScreenProps) {
  const [rentanoOpen, setRentanoOpen] = useState(false);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
        <div>
          <h1 className="text-[22px] font-extrabold" style={{ color: GREEN_DARK }}>
            My Garage
          </h1>
          <p className="text-[13px] text-gray-500">Your household storefront</p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-11 w-11 items-center justify-center rounded-full border bg-white"
          style={{ borderColor: BORDER }}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" style={{ color: GREEN_DARK }} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4">
        <HostDashboard
          onListItem={onStockGarage}
          onOpenListing={(listingId) => onNavigate(`hostListingDetail:${listingId}`)}
        />
      </div>

      <div className="shrink-0">
        <BottomNav
          activeTab={rentanoOpen ? "rentano" : "garage"}
          onHome={onHome}
          onSearch={onSearch}
          onAdd={onStockGarage}
          onGarage={() => undefined}
          onRentano={() => setRentanoOpen(true)}
        />
      </div>

      <RentanoChatSheet
        open={rentanoOpen}
        onClose={() => setRentanoOpen(false)}
        defaultView="chat"
        context={{ screen: "garage", appMode: "earn" }}
      />
    </div>
  );
}
