import { BottomNav } from "../app/components/BottomNav";
import { HostDashboard } from "../app/components/HostDashboard";

const GREEN_DARK = "#0D5C3A";

type GarageScreenProps = {
  onNavigate: (screen: string) => void;
  onHome: () => void;
  onSearch: () => void;
  onStockGarage: () => void;
  onMore: () => void;
};

export function GarageScreen({
  onNavigate,
  onHome,
  onSearch,
  onStockGarage,
  onMore,
}: GarageScreenProps) {
  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
        <div>
          <h1 className="text-[22px] font-extrabold" style={{ color: GREEN_DARK }}>
            My Garage
          </h1>
          <p className="text-[13px] text-gray-500">Your household storefront</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4">
        <HostDashboard
          onListItem={onStockGarage}
          onOpenListing={(listingId) => onNavigate(`hostListingDetail:${listingId}`)}
        />
      </div>

      <div className="shrink-0">
        <BottomNav
          activeTab="garage"
          onHome={onHome}
          onSearch={onSearch}
          onAdd={onStockGarage}
          onGarage={() => undefined}
          onMore={onMore}
        />
      </div>
    </div>
  );
}
