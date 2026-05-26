import rentanoNavImg from "../../imports/No_back_rentano.png";

const GREEN = "#1A9E6E";
const BORDER = "#E8E6E0";
const RENTANO_GREEN = "#0D5C3A";

function NavIconHome({ active }: { active?: boolean }) {
  const c = active ? RENTANO_GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <path d="M4 10 L12 4 L20 10 V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function NavIconRentano({ active }: { active?: boolean }) {
  return (
    <div
      className="h-[28px] w-[28px] overflow-hidden rounded-full"
      style={{ border: `2px solid ${active ? RENTANO_GREEN : "#CCC"}` }}
    >
      <img src={rentanoNavImg} alt="" className="h-full w-full object-cover" draggable={false} />
    </div>
  );
}

function NavIconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function NavIconRentals() {
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="#888" strokeWidth="2" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NavIconProfile() {
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="2" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav({
  activeTab = "home",
  onHome,
  onPostRequest,
  onRentano,
}: {
  activeTab?: "home" | "rentano" | "rentals" | "profile" | "none";
  onHome: () => void;
  onPostRequest: () => void;
  onRentano?: () => void;
}) {
  return (
    <div
      className="flex shrink-0 items-center border-t bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2"
      style={{ borderColor: BORDER, minHeight: 84 }}
    >
      <div className="mx-auto flex w-full max-w-md items-end justify-around">
        <button type="button" onClick={onHome} className="flex min-w-[64px] flex-col items-center gap-1.5 py-1">
          <NavIconHome active={activeTab === "home"} />
          <span
            className="text-[13px]"
            style={{
              color: activeTab === "home" ? RENTANO_GREEN : "#888",
              fontWeight: activeTab === "home" ? 600 : 400,
            }}
          >
            Home
          </span>
        </button>
        <button
          type="button"
          onClick={onRentano}
          className="flex min-w-[64px] flex-col items-center gap-1.5 py-1"
          aria-label="Chat with Rentano"
        >
          <NavIconRentano active={activeTab === "rentano"} />
          <span
            className="text-[13px]"
            style={{
              color: activeTab === "rentano" ? RENTANO_GREEN : "#888",
              fontWeight: activeTab === "rentano" ? 600 : 400,
            }}
          >
            Rentano
          </span>
        </button>
        <button
          type="button"
          onClick={onPostRequest}
          className="-mt-8 flex min-w-[64px] flex-col items-center"
          aria-label="Post"
        >
          <div
            className="flex h-[68px] w-[68px] items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: GREEN, boxShadow: "0 8px 20px rgba(26, 158, 110, 0.35)" }}
          >
            <NavIconPlus />
          </div>
        </button>
        <button type="button" className="flex min-w-[64px] flex-col items-center gap-1.5 py-1 text-[#888]">
          <NavIconRentals />
          <span className="text-[13px]">Rentals</span>
        </button>
        <button type="button" className="flex min-w-[64px] flex-col items-center gap-1.5 py-1 text-[#888]">
          <NavIconProfile />
          <span className="text-[13px]">Profile</span>
        </button>
      </div>
    </div>
  );
}
