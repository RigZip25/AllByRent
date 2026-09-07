import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BrandMark } from "../components/BrandMark";
import "./Auth.css";

export function AuthEmail({
  onSubmit,
}: {
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "business">(
    "individual",
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    onSubmit(email.trim());
  }

  return (
    <section className="screen auth">
      <header className="auth__header rise">
        <BrandMark size="sm" />
        <p className="eyebrow">Secure access</p>
        <h1 className="h2">Sign in with email</h1>
        <p className="muted auth__lede">
          We send a one-time code to your inbox. No SMS.
        </p>
      </header>

      <form className="auth__form rise rise-delay-1" onSubmit={handleSubmit}>
        <div className="segment" role="group" aria-label="Account type">
          <button
            type="button"
            className={accountType === "individual" ? "is-on" : undefined}
            onClick={() => setAccountType("individual")}
          >
            Individual
          </button>
          <button
            type="button"
            className={accountType === "business" ? "is-on" : undefined}
            onClick={() => setAccountType("business")}
          >
            Business
          </button>
        </div>

        <label className="auth__label">
          Email address
          <input
            className="field"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn--primary btn--block">
          Send code
        </button>
      </form>
    </section>
  );
}

export function AuthOtp({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const masked = email.replace(/(.{2}).+(@.+)/, "$1******$2");
  const value = code.join("");

  function updateDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      const el = document.getElementById(`otp-${index + 1}`);
      el?.focus();
    }
  }

  return (
    <section className="screen auth">
      <header className="auth__header rise">
        <BrandMark size="sm" />
        <p className="eyebrow">Verification</p>
        <h1 className="h2">Enter your code</h1>
        <p className="muted auth__lede">
          6-digit code sent to <strong>{masked}</strong>. Expires in 10 minutes.
        </p>
      </header>

      <div className="otp rise rise-delay-1" role="group" aria-label="One-time code">
        {code.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            className="otp__cell"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => updateDigit(i, e.target.value)}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <footer className="auth__footer rise rise-delay-2">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={value.length !== 6}
          onClick={onVerified}
        >
          Continue
        </button>
        <p className="muted auth__resend">
          {seconds > 0
            ? `Resend available in ${seconds}s`
            : "Didn’t get it? Resend code"}
        </p>
      </footer>
    </section>
  );
}
