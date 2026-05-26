import { BadgeCheck } from "lucide-react";

const GREEN = "#0D5C3A";

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold ${compact ? "text-[10px] px-1.5 py-0" : "text-[11px] px-2 py-0.5"} rounded-full`}
      style={{ backgroundColor: "#1A9E6E22", color: GREEN }}
      title="Verified"
    >
      <BadgeCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      Verified
    </span>
  );
}
