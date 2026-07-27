import { Link } from "react-router";
import { cn } from "../lib/cn";

export function TripCardHero({
  to,
  photo,
  title,
  subtitle,
  badge,
}: {
  to: string;
  photo: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      className="relative block h-[200px] w-full overflow-hidden rounded-[12px]"
    >
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      {badge ? (
        <span className="absolute top-3 left-3 rounded-full bg-[var(--accent-gold)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-inverse)]">
          {badge}
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-[16px] font-semibold text-white">{title}</div>
        <div className="mt-0.5 text-[12px] text-white/75">{subtitle}</div>
      </div>
    </Link>
  );
}

export function TripCardSmall({
  to,
  photo,
  title,
  subtitle,
}: {
  to: string;
  photo: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="flex h-20 w-full overflow-hidden rounded-[12px] bg-[var(--bg-card)]"
    >
      <img src={photo} alt="" className="h-20 w-20 shrink-0 object-cover" />
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3">
        <div className="truncate text-[14px] font-medium text-[var(--text-cream)]">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">
          {subtitle}
        </div>
      </div>
    </Link>
  );
}

export function DestinationCard({
  to,
  photo,
  name,
  badge,
  className,
}: {
  to: string;
  photo: string;
  name: string;
  badge?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative block h-40 w-[120px] shrink-0 overflow-hidden rounded-[12px]",
        className,
      )}
    >
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      {badge ? (
        <span className="absolute top-2 left-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] text-[var(--accent-gold)] backdrop-blur-sm">
          {badge}
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-2.5 text-[12px] font-medium text-white">
        {name}
      </div>
    </Link>
  );
}
