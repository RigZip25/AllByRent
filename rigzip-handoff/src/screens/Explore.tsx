import { DUTY_CLASSES, FEATURED_UNITS } from "../data/catalog";
import { BottomNav } from "../components/BottomNav";
import type { TabId } from "../components/BottomNav";
import "./Explore.css";

export function Explore({
  name,
  role,
  tab,
  onTab,
}: {
  name: string;
  role: "rent" | "list";
  tab: TabId;
  onTab: (id: TabId) => void;
}) {
  return (
    <section className="screen explore">
      <div className="screen-scroll">
        <header className="explore__header rise">
          <div>
            <p className="eyebrow">{role === "rent" ? "Find capacity" : "Your yard"}</p>
            <h1 className="h2 explore__hello">{name}</h1>
          </div>
          <button type="button" className="explore__bell" aria-label="Notifications">
            <span />
          </button>
        </header>

        <div className="explore__search rise rise-delay-1">
          <span className="muted">Avon, MA · Any dates</span>
          <strong>Search trucks & trailers</strong>
        </div>

        <section className="explore__section rise rise-delay-2">
          <div className="explore__section-head">
            <h2>By class</h2>
            <button type="button" className="text-link">
              See map
            </button>
          </div>
          <div className="class-rail">
            {DUTY_CLASSES.map((c) => (
              <button key={c.id} type="button" className="class-tile">
                <span className="class-tile__count">{c.count}</span>
                <strong>{c.label}</strong>
                <span className="muted">{c.subtitle}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="explore__section rise rise-delay-3">
          <div className="explore__section-head">
            <h2>Available near you</h2>
            <button type="button" className="text-link">
              Filters
            </button>
          </div>
          <div className="unit-list">
            {FEATURED_UNITS.map((u) => (
              <article key={u.id} className="unit-row">
                <div className="unit-row__visual" aria-hidden />
                <div className="unit-row__body">
                  <strong>{u.name}</strong>
                  <span className="muted">
                    {u.available} ready · from ${u.fromRate}/{u.unit}
                  </span>
                </div>
                <span className="unit-row__cta">View</span>
              </article>
            ))}
          </div>
        </section>

        <section className="explore__trust rise rise-delay-4">
          <p className="eyebrow">How trips work</p>
          <h2 className="h2">COI · PTI · keys</h2>
          <p className="muted">
            Unit goes on the renter’s insurance for the trip. Pre-trip inspection
            gates handover. Damage packs ready for the carrier.
          </p>
        </section>
      </div>

      <BottomNav active={tab} onChange={onTab} />
    </section>
  );
}
