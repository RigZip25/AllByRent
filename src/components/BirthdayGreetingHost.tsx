import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { APP_NAME, BRAND_GREEN, MASCOT_NAME } from "../lib/brand";
import {
  ageYearsFromIso,
  hasBirthdayGreetingForYear,
  isBirthdayToday,
  markBirthdayGreetingShown,
} from "../lib/dateOfBirth";
import { useMessages } from "../lib/i18n/react";
import { onboardingAssets } from "../lib/onboardingAssets";
import { loadUserProfile } from "../lib/userProfileStorage";

/**
 * Once per year on the user's birthday, Mr. Evorios pops a short greeting.
 * DOB lives on the profile (local + Supabase); no extra backend needed for v1.
 */
export function BirthdayGreetingHost({ enabled }: { enabled: boolean }) {
  const t = useMessages().profileDeep.personalInfo;
  const common = useMessages().common;
  const [open, setOpen] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (!enabled) return;
    if (hasBirthdayGreetingForYear()) return;

    const profile = loadUserProfile();
    const dob = profile.dateOfBirth?.trim() || "";
    if (!dob || !isBirthdayToday(dob)) return;

    const years = ageYearsFromIso(dob);
    if (years === null || years < 1) return;

    const name = (profile.displayName || "").trim().split(/\s+/)[0] || "";
    setFirstName(name);
    setAge(years);
    setOpen(true);
  }, [enabled]);

  const dismiss = () => {
    markBirthdayGreetingShown();
    setOpen(false);
  };

  if (!open || age === null) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="birthday-greeting-title"
    >
      <div
        className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border bg-white shadow-2xl"
        style={{ borderColor: "#E8E6E0" }}
      >
        <div
          className="px-5 pb-4 pt-5"
          style={{
            background: `linear-gradient(165deg, #041f16 0%, ${BRAND_GREEN} 55%, #0c3d2e 100%)`,
          }}
        >
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 rounded-full bg-white/15 p-2 text-white"
            aria-label={common.close}
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={onboardingAssets.mrEvoriosFull}
            alt=""
            className="mx-auto h-36 w-auto object-contain drop-shadow-lg"
          />
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
            {MASCOT_NAME}
          </p>
          <h2
            id="birthday-greeting-title"
            className="mt-1 text-center text-[22px] font-extrabold text-white"
          >
            {t.birthdayTitle}
          </h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-center text-[15px] leading-relaxed text-gray-700">
            {t.birthdayBody(firstName || APP_NAME, age, MASCOT_NAME)}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-4 w-full rounded-2xl py-3.5 text-[15px] font-bold text-white"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {t.birthdayThanks}
          </button>
        </div>
      </div>
    </div>
  );
}
