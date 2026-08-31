import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, MASCOT_NAME } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { onboardingAssets } from "../../lib/onboardingAssets";
import listingSnap from "../../imports/listing_snap.png";
import listingMagic from "../../imports/listing_magic.png";
import listingShare from "../../imports/listing_share.png";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;

type Props = {
  onSignUp: () => void;
  onBrowseAsGuest: () => void;
  onBack?: () => void;
};

type SlideId = "photos" | "enhance" | "roles" | "help";

/**
 * Guest-only visual pitch — big pictures, short lines, then Sign up.
 * Sign in / Sign up from AuthWelcome skip this.
 */
export function GuestShowcase({ onSignUp, onBrowseAsGuest, onBack }: Props) {
  const t = useMessages();
  const copy = t.onboarding.guestShowcase;
  const [index, setIndex] = useState(0);

  const slides: { id: SlideId; image: string; title: string; body: string; framed: boolean }[] = [
    { id: "photos", image: listingSnap, title: copy.photosTitle, body: copy.photosBody, framed: true },
    { id: "enhance", image: listingMagic, title: copy.enhanceTitle, body: copy.enhanceBody, framed: true },
    {
      id: "roles",
      image: onboardingAssets.garageRoles,
      title: copy.rolesTitle,
      body: copy.rolesBody,
      framed: false,
    },
    {
      id: "help",
      image: listingShare,
      title: copy.helpTitle(MASCOT_NAME),
      body: copy.helpBody(MASCOT_NAME),
      framed: true,
    },
  ];

  const isLast = index >= slides.length - 1;
  const slide = slides[index]!;

  useEffect(() => {
    if (isLast) return;
    const id = window.setTimeout(() => setIndex((i) => Math.min(i + 1, slides.length - 1)), 3200);
    return () => window.clearTimeout(id);
  }, [index, isLast, slides.length]);

  return (
    <div
      className="screen onboarding-step mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #E8F5EE 0%, #FFFFFF 55%, #FFF8E8 100%)",
      }}
    >
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

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <div className="mx-auto flex min-h-[42vh] max-w-[300px] items-center justify-center">
          {slide.framed ? (
            <div
              className="relative w-[min(100%,240px)] overflow-hidden rounded-[28px] border-[7px] bg-black shadow-[0_24px_60px_rgba(13,92,58,0.22)]"
              style={{ borderColor: "#1C2B22" }}
            >
              <div
                className="absolute left-1/2 top-1.5 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#2A2A2A]"
                aria-hidden
              />
              <img
                src={slide.image}
                alt=""
                className="block aspect-[9/14] w-full object-cover object-center"
                draggable={false}
              />
            </div>
          ) : (
            <img
              src={slide.image}
              alt=""
              className="h-auto max-h-[42vh] w-full object-contain drop-shadow-lg"
              draggable={false}
            />
          )}
        </div>

        <div className="mb-3 mt-4 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 28 : 10,
                backgroundColor: i === index ? GREEN : "#D1D5DB",
              }}
              aria-label={s.title}
            />
          ))}
        </div>

        <h1
          className="text-center text-[24px] font-extrabold leading-tight tracking-tight"
          style={{ color: GREEN }}
        >
          {slide.title}
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-center text-[15px] leading-snug text-gray-600">
          {slide.body}
        </p>

        {slide.id === "roles" ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[copy.roleRent, copy.roleSell, copy.roleGift].map((label) => (
              <span
                key={label}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 space-y-2.5 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2">
        {isLast ? (
          <>
            <button
              type="button"
              onClick={onSignUp}
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl py-3.5 text-[17px] font-bold text-white shadow-[0_10px_28px_rgba(13,92,58,0.28)]"
              style={{ backgroundColor: GREEN }}
            >
              {copy.signUpCta}
            </button>
            <button
              type="button"
              onClick={onBrowseAsGuest}
              className="w-full py-2.5 text-center text-[14px] font-semibold text-gray-500"
            >
              {copy.browseCta}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
            className="flex min-h-[52px] w-full items-center justify-center gap-1 rounded-2xl py-3.5 text-[16px] font-bold"
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
