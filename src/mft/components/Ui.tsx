import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function InfoChip({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-card)] px-3 py-1.5 text-[12px] text-[var(--text-cream)]",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function AiCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-r-xl border-l-[3px] border-[var(--accent-gold)] bg-[var(--bg-card)] p-4 text-[14px] leading-relaxed text-[var(--text-cream)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[12px] font-semibold tracking-[0.14em] text-[var(--accent-gold)] uppercase">
      {children}
    </h2>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-white/10",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--accent-gold)] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
