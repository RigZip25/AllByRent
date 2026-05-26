import { Shield } from "lucide-react";
import type { ListingMode } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";

export function InsuredLabel({
  modes,
  compact = false,
}: {
  modes: ListingMode[];
  compact?: boolean;
}) {
  const hasRto = modes.includes("rto");
  const label = hasRto ? "Insured · Rent & RTO" : "Insured · Rent";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${compact ? "text-[10px]" : "text-[11px]"}`}
      style={{ color: GREEN }}
    >
      <Shield className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {label}
    </span>
  );
}
