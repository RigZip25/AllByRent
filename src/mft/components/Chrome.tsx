import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "../lib/cn";

export function BackHeader({
  title,
  onBack,
  right,
  className,
  light,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
  light?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2",
        light ? "text-white" : "text-[var(--text-cream)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm"
        aria-label="Назад"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      {title ? (
        <h1 className="flex-1 text-[16px] font-semibold">{title}</h1>
      ) : (
        <div className="flex-1" />
      )}
      {right}
    </div>
  );
}

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-[16px]",
    md: "text-[20px]",
    lg: "text-[28px]",
  };
  return (
    <div
      className={cn(
        "font-semibold tracking-tight text-[var(--accent-gold)]",
        sizes[size],
        className,
      )}
    >
      MyFantasticTrip
    </div>
  );
}
