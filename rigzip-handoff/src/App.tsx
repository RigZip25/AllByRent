import { useMemo, useState } from "react";
import type { TabId } from "./components/BottomNav";
import type { PathChoice } from "./screens/ChoosePath";
import { Splash } from "./screens/Splash";
import { ChoosePath } from "./screens/ChoosePath";
import { CommercialGate } from "./screens/CommercialGate";
import { AuthEmail, AuthOtp } from "./screens/Auth";
import { Explore } from "./screens/Explore";
import "./styles/global.css";

type Step =
  | "splash"
  | "path"
  | "gate"
  | "email"
  | "otp"
  | "app";

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "Operator";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function App() {
  const [step, setStep] = useState<Step>("splash");
  const [path, setPath] = useState<PathChoice>("rent");
  const [email, setEmail] = useState("ed@rigzip.com");
  const [tab, setTab] = useState<TabId>("explore");

  const name = useMemo(() => displayNameFromEmail(email), [email]);

  return (
    <div className="app-shell">
      <div className="phone" data-step={step}>
        {step === "splash" && <Splash onContinue={() => setStep("path")} />}
        {step === "path" && (
          <ChoosePath
            onContinue={(next) => {
              setPath(next);
              setStep("gate");
            }}
          />
        )}
        {step === "gate" && (
          <CommercialGate onContinue={() => setStep("email")} />
        )}
        {step === "email" && (
          <AuthEmail
            onSubmit={(value) => {
              setEmail(value);
              setStep("otp");
            }}
          />
        )}
        {step === "otp" && (
          <AuthOtp email={email} onVerified={() => setStep("app")} />
        )}
        {step === "app" && (
          <Explore name={name} role={path} tab={tab} onTab={setTab} />
        )}
      </div>
    </div>
  );
}
