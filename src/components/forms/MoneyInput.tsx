import type { FocusEventHandler } from "react";
import { currencySymbol as defaultCurrencySymbol } from "../../lib/regionalDisplay";

type MoneyInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  currencySymbol?: string;
  invalid?: boolean;
  errorId?: string;
  className?: string;
  placeholder?: string;
};

/** Labeled money field — `id` required so FieldLabel htmlFor can attach (Stage 17 / X1). */
export function MoneyInput({
  id,
  value,
  onChange,
  onBlur,
  currencySymbol,
  invalid = false,
  errorId,
  className = "",
  placeholder = "",
}: MoneyInputProps) {
  const symbol = currencySymbol ?? defaultCurrencySymbol();
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-gray-500"
        aria-hidden
      >
        {symbol}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && errorId ? errorId : undefined}
        onChange={(event) => {
          const raw = event.target.value.replace(/,/g, ".").replace(/[^\d.]/g, "");
          const parts = raw.split(".");
          const next =
            parts.length <= 1 ? raw : `${parts[0]}.${parts.slice(1).join("")}`;
          onChange(next);
        }}
        onBlur={onBlur}
        className={`text-body w-full rounded-2xl border bg-white py-3 pl-8 pr-4 text-gray-800 outline-none transition-colors focus:border-green-700 ${
          invalid ? "border-red-400" : "border-gray-200"
        } ${className}`}
      />
    </div>
  );
}
