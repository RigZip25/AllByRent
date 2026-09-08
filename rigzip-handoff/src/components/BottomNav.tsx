import "./BottomNav.css";

export type TabId = "explore" | "bookings" | "list" | "inbox" | "account";

const TABS: { id: TabId; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "bookings", label: "Trips" },
  { id: "list", label: "List" },
  { id: "inbox", label: "Inbox" },
  { id: "account", label: "Account" },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav__item${isActive ? " is-active" : ""}${tab.id === "list" ? " is-cta" : ""}`}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden>
              {tab.id === "explore" && "◎"}
              {tab.id === "bookings" && "☰"}
              {tab.id === "list" && "+"}
              {tab.id === "inbox" && "◌"}
              {tab.id === "account" && "◐"}
            </span>
            <span className="bottom-nav__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
