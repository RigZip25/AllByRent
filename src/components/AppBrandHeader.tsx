import type { ReactNode } from "react";
import { BRAND_GREEN } from "../lib/brand";
import { EvoriosWordmark } from "./EvoriosWordmark";

export { BRAND_GREEN };

type BrandSize = "sm" | "md" | "lg";

const brandTextClass: Record<BrandSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-responsive-title",
};

export function AppBrandMark({
  size = "md",
  className = "",
}: {
  size?: BrandSize;
  className?: string;
}) {
  return (
    <EvoriosWordmark
      variant="header"
      className={`${brandTextClass[size]} ${className}`}
    />
  );
}

type AppBrandHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  bordered?: boolean;
  className?: string;
  size?: BrandSize;
};

export function AppBrandHeader({
  left,
  right,
  bordered = true,
  className = "",
  size = "md",
}: AppBrandHeaderProps) {
  return (
    <header
      className={`app-brand-header shrink-0 bg-white px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top,0px))] ${bordered ? "border-b" : ""} ${className}`}
      style={bordered ? { borderColor: `${BRAND_GREEN}33` } : undefined}
    >
      <div className="relative flex min-h-[1.75rem] items-center justify-center">
        {left ? (
          <div className="absolute left-0 top-1/2 flex max-w-[38%] -translate-y-1/2 items-center">
            {left}
          </div>
        ) : null}
        <AppBrandMark size={size} />
        {right ? (
          <div className="absolute right-0 top-1/2 flex max-w-[38%] -translate-y-1/2 items-center justify-end">
            {right}
          </div>
        ) : null}
      </div>
    </header>
  );
}
