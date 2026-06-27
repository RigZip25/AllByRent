import { useEffect, useState } from "react";
import { X } from "lucide-react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function ProfileFieldEditSheet({
  open,
  title,
  label,
  value,
  inputType = "text",
  placeholder,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  label: string;
  value: string;
  inputType?: "text" | "tel";
  placeholder?: string;
  onClose: () => void;
  onSave: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  if (!open) return null;

  const trimmed = draft.trim();
  const canSave = inputType === "tel" ? true : trimmed.length > 0;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl"
        style={{ borderColor: BORDER }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-extrabold" style={{ color: GREEN }}>
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <label className="mt-4 block">
          <span className="text-[13px] font-semibold text-gray-700">{label}</span>
          <input
            type={inputType}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="mt-2 w-full rounded-2xl border bg-white px-3 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            style={{ borderColor: BORDER }}
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-3 text-[14px] font-semibold text-gray-700"
            style={{ borderColor: BORDER }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(trimmed)}
            className="rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
