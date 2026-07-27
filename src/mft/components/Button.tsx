import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary" | "text" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-primary)] text-white hover:brightness-110 active:scale-[0.98]",
  secondary:
    "bg-transparent border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-amber-soft)]",
  text: "bg-transparent text-[var(--accent-gold)] hover:brightness-110",
  ghost:
    "bg-[var(--bg-card)] text-[var(--text-cream)] hover:bg-[var(--bg-card-hover)]",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition disabled:opacity-40",
        styles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
