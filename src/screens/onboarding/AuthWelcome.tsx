import { ScanFace } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { onboardingAssets } from "../../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

type Props = {
  onSignIn: () => void;
  onSignUp: () => void;
  onContinueAsGuest: () => void;
};

/** Post-splash: Sign in, create account, or continue browsing as a guest. */
export function AuthWelcome({ onSignIn, onSignUp, onContinueAsGuest }: Props) {
  const t = useMessages();
  const copy = t.onboarding.authWelcome;

  return (
    <div className="screen onboarding-step mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-center px-4 pb-1 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">{APP_NAME}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto mb-4 max-w-[280px]">
          <img
            src={onboardingAssets.garageRoles}
            alt=""
            className="h-auto max-h-[200px] w-full object-contain"
            draggable={false}
            width={560}
            height={400}
          />
        </div>

        <h1 className="text-center text-[24px] font-extrabold leading-tight" style={{ color: GREEN }}>
          {copy.title}
        </h1>
        <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-600">{copy.subtitle}</p>
      </div>

      <div
        className="shrink-0 space-y-3 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3"
        style={{ borderColor: BORDER }}
      >
        <button
          type="button"
          onClick={onSignIn}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[16px] font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          <ScanFace className="h-5 w-5" aria-hidden />
          {copy.signInCta}
        </button>
        <button
          type="button"
          onClick={onSignUp}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl py-3.5 text-[16px] font-bold"
          style={{ backgroundColor: AMBER, color: GREEN }}
        >
          {copy.signUpCta}
        </button>
        <button
          type="button"
          onClick={onContinueAsGuest}
          className="w-full py-2.5 text-center text-[15px] font-semibold text-gray-600 underline-offset-2 active:text-[#0D5C3A]"
        >
          {copy.continueGuestCta}
        </button>
        <p className="text-center text-[12px] leading-snug text-gray-400">{copy.guestHint}</p>
      </div>
    </div>
  );
}
