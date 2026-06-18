import { HostDashboard } from "../app/components/HostDashboard";

const GREEN_DARK = "#0D5C3A";

type GarageScreenProps = {
  onNavigate: (screen: string) => void;
  onStockGarage: () => void;
};

export function GarageScreen({ onNavigate, onStockGarage }: GarageScreenProps) {
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
    </div>
  );
}
