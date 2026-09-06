import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, MASCOT_NAME } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { onboardingAssets } from "../../lib/onboardingAssets";
import guestBrowseNeighborhood from "../../imports/onboarding/evorios_guest_browse_neighborhood.png";
import guestHookGarage from "../../imports/onboarding/evorios_guest_hook_garage.png";
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

type SlideId =
  | "hook"
  | "browse"
  | "modes"
  | "snap"
  | "enhance"
  | "book"
  | "yard"
  | "share"
  | "help";

type SlideVisual =
  | { kind: "image"; src: string; framed?: boolean }
  | { kind: "placeholder"; artId: string };

/**
 * Guest platform tour (9 slides) — then Sign up on the last screen.
 * Missing art uses labeled placeholders until assets are added.
 */
export function GuestShowcase({ onSignUp, onBrowseAsGuest, onBack }: Props) {
  const t = useMessages();
  const copy = t.onboarding.guestShowcase;
  const [index, setIndex] = useState(0);

  const slides: { id: SlideId; title: string; body: string; visual: SlideVisual }[] = [
    {
      id: "hook",
      title: copy.hookTitle,
      body: copy.hookBody,
      visual: { kind: "image", src: guestHookGarage },
    },
    {
      id: "browse",
      title: copy.browseTitle,
      body: copy.browseBody,
      visual: { kind: "image", src: guestBrowseNeighborhood },
    },
    {
      id: "modes",
      title: copy.modesTitle,
      body: copy.modesBody,
      visual: { kind: "image", src: onboardingAssets.garageRoles },
    },
    {
      id: "snap",
      title: copy.snapTitle,
      body: copy.snapBody,
      visual: { kind: "image", src: listingSnap, framed: true },
    },
    {
      id: "enhance",
      title: copy.enhanceTitle,
      body: copy.enhanceBody,
      visual: { kind: "image", src: listingMagic, framed: true },
    },
    {
      id: "book",
      title: copy.bookTitle,
      body: `${copy.bookBody} ${copy.trustBody}`,
      visual: { kind: "placeholder", artId: "book" },
    },
    {
      id: "yard",
      title: copy.yardTitle,
      body: copy.yardBody,
      visual: { kind: "placeholder", artId: "yard" },
    },
    {
      id: "share",
      title: copy.shareTitle,
      body: copy.shareBody,
      visual: { kind: "image", src: listingShare, framed: true },
    },
    {
      id: "help",
      title: copy.helpTitle(MASCOT_NAME),
      body: copy.helpBody(MASCOT_NAME),
      visual: { kind: "image", src: onboardingAssets.mrEvoriosFull },
    },
  ];

  const isLast = index >= slides.length - 1;
  const slide = slides[index]!;

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
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {APP_NAME} · {index + 1}/{slides.length}
        </p>
        <button type="button" onClick={onBrowseAsGuest} className="text-[15px] font-semibold text-gray-600">
          {t.common.skip}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="mx-auto flex min-h-[44vh] w-full max-w-[360px] items-center justify-center">
          <SlideArt visual={slide.visual} label={copy.artPlaceholder} />
        </div>

        <div className="mb-3 mt-3 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 20 : 7,
                backgroundColor: i === index ? GREEN : "#D1D5DB",
              }}
              aria-label={s.title}
            />
          ))}
        </div>

        <h1
          className="text-center text-[22px] font-extrabold leading-tight tracking-tight"
          style={{ color: GREEN }}
        >
          {slide.title}
        </h1>
        <p className="mx-auto mt-2 max-w-[340px] text-center text-[15px] leading-snug text-gray-600">
          {slide.body}
        </p>

        {slide.id === "modes" ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
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
            <p className="text-center text-[12px] leading-snug text-gray-400">{copy.footerHint}</p>
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

function SlideArt({
  visual,
  label,
}: {
  visual: SlideVisual;
  label: (id: string) => string;
}) {
  if (visual.kind === "placeholder") {
    return (
      <div
        className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-4 text-center"
        style={{ borderColor: `${GREEN}55`, backgroundColor: "#F3FAF6" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Placeholder</p>
        <p className="mt-2 text-[15px] font-bold" style={{ color: GREEN }}>
          {label(visual.artId)}
        </p>
        <p className="mt-1 font-mono text-[12px] text-gray-400">art:{visual.artId}</p>
      </div>
    );
  }

  if (visual.framed) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-[24px] border-[6px] bg-black shadow-[0_20px_48px_rgba(13,92,58,0.2)]"
        style={{ borderColor: "#1C2B22" }}
      >
        <div
          className="absolute left-1/2 top-1.5 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#2A2A2A]"
          aria-hidden
        />
        <img
          src={visual.src}
          alt=""
          className="block aspect-[4/5] w-full object-cover object-center"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <img
      src={visual.src}
      alt=""
      className="h-auto max-h-[44vh] w-full object-contain drop-shadow-lg"
      draggable={false}
    />
  );
}
