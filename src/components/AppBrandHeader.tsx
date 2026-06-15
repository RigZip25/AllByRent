import type { ReactNode } from "react";
import { APP_NAME, BRAND_GREEN } from "../lib/brand";

export { BRAND_GREEN };

type BrandSize = "sm" | "md" | "lg";

const brandTextClass: Record<BrandSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-responsive-title",
};

const brandTmClass: Record<BrandSize, string> = {
  sm: "text-[0.55em] top-[-0.35em]",
  md: "text-[0.5em] top-[-0.4em]",
  lg: "text-[0.45em] top-[-0.45em]",
};

export function AppBrandMark({
  size = "md",
  className = "",
}: {
  size?: BrandSize;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline font-bold leading-none ${brandTextClass[size]} ${className}`}
      style={{ color: BRAND_GREEN }}
    >
      {APP_NAME}
      <sup
        className={`relative ml-0.5 font-bold leading-none ${brandTmClass[size]}`}
        style={{ color: BRAND_GREEN }}
      >
        ™
      </sup>
    </span>
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
