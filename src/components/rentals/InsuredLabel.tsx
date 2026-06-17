import { Shield } from "lucide-react";
import { DEPOSIT_PROTECTION_LABEL } from "../../lib/brand";

const GREEN = "#0D5C3A";

export function InsuredLabel({
  compact = false,
}: {
  modes?: unknown;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${compact ? "text-[10px]" : "text-[11px]"}`}
      style={{ color: GREEN }}
    >
      <Shield className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {DEPOSIT_PROTECTION_LABEL}
    </span>
  );
}
