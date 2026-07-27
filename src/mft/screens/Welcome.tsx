import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Wordmark } from "../components/Chrome";

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <div className="mft-screen relative flex min-h-full flex-col items-center justify-center overflow-hidden text-center">
      <div className="mft-glow pointer-events-none absolute top-1/3 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(226,176,94,0.35)_0%,rgba(217,119,6,0.12)_40%,transparent_70%)]" />
      <div className="mft-fade-up relative z-10">
        <Wordmark size="lg" />
      </div>
      <p className="mft-fade-up mft-fade-up-delay-1 relative z-10 mt-4 max-w-[260px] text-[15px] text-[var(--text-muted)]">
        AI-компаньон для путешествий, которые чувствуют иначе
      </p>
      <div className="mft-fade-up mft-fade-up-delay-2 relative z-10 mt-12 w-full max-w-[280px]">
        <Button fullWidth onClick={() => navigate("/onboarding/interests")}>
          Начать путешествие
        </Button>
      </div>
    </div>
  );
}
