import { useState } from "react";
import "./CommercialGate.css";

export function CommercialGate({ onContinue }: { onContinue: () => void }) {
  const [ok, setOk] = useState(false);

  return (
    <section className="screen gate">
      <div className="gate__hero rise" aria-hidden>
        <div className="gate__shield" />
      </div>

      <div className="gate__copy rise rise-delay-1">
        <p className="eyebrow">Compliance first</p>
        <h1 className="h2">Commercial rentals only</h1>
        <p className="muted gate__lede">
          List as an individual or business. To rent, you need valid commercial
          authority and insurance that can add the unit for the trip.
        </p>
      </div>

      <label className={`gate__check rise rise-delay-2${ok ? " is-on" : ""}`}>
        <input
          type="checkbox"
          checked={ok}
          onChange={(e) => setOk(e.target.checked)}
        />
        <span>I understand — this is not a consumer moving truck app.</span>
      </label>

      <footer className="gate__footer rise rise-delay-3">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!ok}
          onClick={onContinue}
        >
          Continue to login
        </button>
      </footer>
    </section>
  );
}
