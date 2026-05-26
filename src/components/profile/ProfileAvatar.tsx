import { Camera } from "lucide-react";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";

export function ProfileAvatar({
  avatarUrl,
  size = 64,
  showHint = false,
  onClick,
}: {
  avatarUrl: string | null;
  size?: number;
  showHint?: boolean;
  onClick?: () => void;
}) {
  const inner = avatarUrl ? (
    <img
      src={avatarUrl}
      alt="Your profile photo"
      className="h-full w-full object-cover"
    />
  ) : (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      style={{ backgroundColor: `${GREEN_LIGHT}18` }}
    >
      <Camera className="h-6 w-6" style={{ color: GREEN }} aria-hidden />
    </div>
  );

  const ring = (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderColor: avatarUrl ? GREEN : `${GREEN_LIGHT}66`,
      }}
    >
      {inner}
      {showHint && !avatarUrl ? (
        <span
          className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
          style={{ backgroundColor: GREEN_LIGHT }}
          aria-hidden
        />
      ) : null}
    </div>
  );

  if (!onClick) return ring;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C3A] focus-visible:ring-offset-2"
      aria-label={avatarUrl ? "Change profile photo" : "Add profile photo"}
    >
      {ring}
    </button>
  );
}
