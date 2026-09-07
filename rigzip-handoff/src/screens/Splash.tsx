import { BrandMark } from "../components/BrandMark";
import "./Splash.css";

export function Splash({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="screen splash">
      <div className="splash__atmosphere" aria-hidden>
        <div className="splash__beam" />
        <div className="splash__road" />
        <div className="splash__rig" />
      </div>

      <header className="splash__top rise">
        <BrandMark size="lg" />
      </header>

      <div className="splash__copy">
        <p className="eyebrow rise rise-delay-1">Commercial marketplace</p>
        <h1 className="h1 splash__title rise rise-delay-2">
          Idle iron.
          <br />
          Working again.
        </h1>
        <p className="splash__lede muted rise rise-delay-3">
          Rent or list trucks, trailers, and specialized equipment — direct to
          owners, built for US professionals.
        </p>
      </div>

      <footer className="splash__footer rise rise-delay-4">
        <button type="button" className="btn btn--primary btn--block" onClick={onContinue}>
          Enter RigZIP
        </button>
        <p className="splash__note muted">Hour · day · week · month · after-hours ready</p>
      </footer>
    </section>
  );
}
