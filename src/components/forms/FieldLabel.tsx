import type { ReactNode } from "react";

/** Accessible field label — always associates with a control via htmlFor (Stage 17 / X1). */
export function FieldLabel({
  htmlFor,
  label,
  required = false,
  hint,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-2">
      <label
        htmlFor={htmlFor}
        className="text-label text-sm font-semibold uppercase tracking-wide text-gray-500"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {hint ? <p className="mt-1 text-[12px] text-gray-500">{hint}</p> : null}
    </div>
  );
}
