import { useState } from "react";
import { Camera, Sparkles, Users, Bot, ChevronRight } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, MASCOT_NAME } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { onboardingAssets } from "../../lib/onboardingAssets";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

type Props = {
  onSignUp: () => void;
  onBrowseAsGuest: () => void;
  onBack?: () => void;
};

type SlideId = "photos" | "enhance" | "roles" | "help";

/**
 * Guest-only marketing tour — platform strengths, then Sign up.
 * Sign in / Sign up from AuthWelcome skip this (they already know the product).
 */
export function GuestShowcase({ onSignUp, onBrowseAsGuest, onBack }: Props) {
  const t = useMessages();
  const copy = t.onboarding.guestShowcase;
  const [index, setIndex] = useState(0);

  const slides: { id: SlideId; icon: typeof Camera; title: string; body: string }[] = [
    { id: "photos", icon: Camera, title: copy.photosTitle, body: copy.photosBody },
    { id: "enhance", icon: Sparkles, title: copy.enhanceTitle, body: copy.enhanceBody },
    { id: "roles", icon: Users, title: copy.rolesTitle, body: copy.rolesBody },
    { id: "help", icon: Bot, title: copy.helpTitle(MASCOT_NAME), body: copy.helpBody(MASCOT_NAME) },
  ];

  const isLast = index >= slides.length - 1;
  const slide = slides[index]!;
  const Icon = slide.icon;

  return (
    <div className="screen onboarding-step mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-[15px] font-semibold text-gray-600">
            {t.common.back}
          </button>
        ) : (
          <span className="w-14" aria-hidden />
        )}
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">{APP_NAME}</p>
        <button type="button" onClick={onBrowseAsGuest} className="text-[15px] font-semibold text-gray-600">
          {t.common.skip}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto mb-4 max-w-[240px]">
          <img
            src={
              slide.id === "roles"
                ? onboardingAssets.garageRoles
                : slide.id === "help"
                  ? onboardingAssets.mrEvoriosFull
                  : onboardingAssets.stockGarage
            }
            alt=""
            className="h-auto max-h-[180px] w-full object-contain"
            draggable={false}
          />
        </div>

        <div className="mb-3 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className="h-1.5 w-7 rounded-full"
              style={{ backgroundColor: i <= index ? GREEN : "#D1D5DB" }}
              aria-label={s.title}
            />
          ))}
        </div>

        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#E8F5EE" }}
        >
          <Icon className="h-6 w-6" style={{ color: GREEN }} aria-hidden />
        </div>

        <h1 className="text-center text-[22px] font-extrabold leading-tight" style={{ color: GREEN }}>
          {slide.title}
        </h1>
        <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-600">{slide.body}</p>

        {slide.id === "roles" ? (
          <div className="mt-4 space-y-2">
            {[
              { title: copy.roleRent, hint: copy.roleRentHint },
              { title: copy.roleSell, hint: copy.roleSellHint },
              { title: copy.roleGift, hint: copy.roleGiftHint },
            ].map((row) => (
              <div
                key={row.title}
                className="rounded-2xl border bg-[#F9FAFB] px-4 py-3"
                style={{ borderColor: BORDER }}
              >
                <p className="text-[15px] font-bold text-gray-900">{row.title}</p>
                <p className="mt-0.5 text-[13px] text-gray-600">{row.hint}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className="shrink-0 space-y-3 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3"
        style={{ borderColor: BORDER }}
      >
        {isLast ? (
          <>
            <button
              type="button"
              onClick={onSignUp}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl py-3.5 text-[16px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {copy.signUpCta}
            </button>
            <button
              type="button"
              onClick={onBrowseAsGuest}
              className="w-full py-2.5 text-center text-[15px] font-semibold text-gray-600"
            >
              {copy.browseCta}
            </button>
            <p className="text-center text-[12px] leading-snug text-gray-400">{copy.footerHint}</p>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
            className="flex min-h-[48px] w-full items-center justify-center gap-1 rounded-xl py-3.5 text-[16px] font-bold"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {copy.nextCta}
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
