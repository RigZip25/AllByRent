import { useState } from "react";
import { BrandMark } from "../components/BrandMark";
import "./ChoosePath.css";

export type PathChoice = "rent" | "list";

export function ChoosePath({
  onContinue,
}: {
  onContinue: (path: PathChoice) => void;
}) {
  const [path, setPath] = useState<PathChoice | null>(null);

  return (
    <section className="screen choose">
      <header className="choose__header rise">
        <BrandMark size="sm" />
        <p className="eyebrow">Get started</p>
        <h1 className="h2">Choose your path</h1>
        <p className="muted choose__lede">
          One marketplace. Two sides of the yard — rent capacity or put idle
          iron to work.
        </p>
      </header>

      <div className="choose__options">
        <button
          type="button"
          className={`path-card rise rise-delay-1${path === "rent" ? " is-selected" : ""}`}
          onClick={() => setPath("rent")}
        >
          <span className="path-card__kicker">Tenant</span>
          <strong className="path-card__title">I want to rent</strong>
          <span className="path-card__text muted">
            Find trucks and trailers for the job — hour, day, week, or month.
          </span>
        </button>

        <button
          type="button"
          className={`path-card rise rise-delay-2${path === "list" ? " is-selected" : ""}`}
          onClick={() => setPath("list")}
        >
          <span className="path-card__kicker">Owner</span>
          <strong className="path-card__title">I want to list</strong>
          <span className="path-card__text muted">
            Monetize idle fleet. You set rates, availability, and after-hours
            access.
          </span>
        </button>
      </div>

      <footer className="choose__footer rise rise-delay-3">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!path}
          onClick={() => path && onContinue(path)}
        >
          Continue
        </button>
      </footer>
    </section>
  );
}
