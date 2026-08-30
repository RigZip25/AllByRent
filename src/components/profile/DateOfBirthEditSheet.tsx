import { useEffect, useMemo, useState } from "react";
import { Cake, X } from "lucide-react";
import {
  ageYearsFromIso,
  dobPickerMaxIso,
  dobPickerMinIso,
  formatDobDisplay,
  normalizeDobToIso,
} from "../../lib/dateOfBirth";
import { useLocale, useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function DateOfBirthEditSheet({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onSave: (iso: string) => void;
}) {
  const t = useMessages().profileDeep.personalInfo;
  const common = useMessages().common;
  const locale = useLocale();
  const [draft, setDraft] = useState(() => normalizeDobToIso(value) ?? "");

  useEffect(() => {
    if (!open) return;
    setDraft(normalizeDobToIso(value) ?? "");
  }, [open, value]);

  const age = useMemo(() => ageYearsFromIso(draft), [draft]);
  const canSave = Boolean(draft && age !== null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dob-edit-title"
        className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl"
        style={{ borderColor: BORDER }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#F0F4F2" }}
            >
              <Cake className="h-5 w-5" style={{ color: GREEN }} />
            </span>
            <h2 id="dob-edit-title" className="text-[18px] font-extrabold" style={{ color: GREEN }}>
              {t.dateOfBirth}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label={common.close}>
            <X className="h-5 w-5 text-red-600" />
          </button>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-gray-600">{t.dateOfBirthPickerHint}</p>

        <label className="mt-4 block">
          <span className="text-[13px] font-semibold text-gray-700">{t.dateOfBirth}</span>
          <input
            type="date"
            value={draft}
            min={dobPickerMinIso()}
            max={dobPickerMaxIso()}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-2 w-full rounded-2xl border bg-white px-3 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            style={{ borderColor: BORDER, color: GREEN }}
          />
        </label>

        {draft && age !== null ? (
          <p
            className="mt-3 rounded-2xl px-3 py-2.5 text-[14px] font-semibold"
            style={{ backgroundColor: "#F0F4F2", color: GREEN }}
          >
            {t.dateOfBirthAgePreview(formatDobDisplay(draft, locale), age)}
          </p>
        ) : draft ? (
          <p className="mt-3 text-[13px] font-semibold text-red-600">{t.dateOfBirthInvalid}</p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-3 text-[14px] font-semibold text-gray-700"
            style={{ borderColor: BORDER }}
          >
            {common.cancel}
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              const iso = normalizeDobToIso(draft);
              if (!iso) return;
              onSave(iso);
            }}
            className="rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
