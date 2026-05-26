import { BadgeCheck, Shield, Star } from "lucide-react";
import type { UserProfile } from "../../lib/userProfileStorage";

const GREEN = "#0D5C3A";

function Badge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
    >
      {icon}
      {label}
    </span>
  );
}

export function ProfileTrustBadges({ profile }: { profile: UserProfile }) {
  const totalReviews = profile.host.reviewCount + profile.renter.reviewCount;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {profile.verification.phone ? (
        <Badge icon={<BadgeCheck className="h-3 w-3" />} label="Phone ✓" />
      ) : null}
      {profile.verification.identity ? (
        <Badge icon={<Shield className="h-3 w-3" />} label="ID Verified ✓" />
      ) : null}
      {totalReviews > 0 ? (
        <Badge icon={<Star className="h-3 w-3" />} label={`${totalReviews} reviews`} />
      ) : null}
    </div>
  );
}
