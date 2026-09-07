export function BrandMark({
  size = "md",
  tone = "light",
}: {
  size?: "sm" | "md" | "lg" | "hero";
  tone?: "light" | "dark";
}) {
  const fontSize =
    size === "hero" ? "2.6rem" : size === "lg" ? "1.7rem" : size === "sm" ? "1.05rem" : "1.35rem";
  const icon =
    size === "hero" ? 42 : size === "lg" ? 32 : size === "sm" ? 22 : 28;

  return (
    <div className="brand-mark" style={{ color: tone === "dark" ? "var(--rz-ink)" : undefined }}>
      <svg
        className="brand-mark__icon"
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        aria-hidden
      >
        <rect width="64" height="64" rx="14" fill={tone === "dark" ? "#0A0C0F" : "#141820"} />
        <path d="M12 38h28l6-10h6v18H12V38Z" fill="#F2B90D" />
        <path d="M18 28h14l4 10H14l4-10Z" fill="#E8EEF5" />
        <circle cx="22" cy="48" r="4" fill="#E8EEF5" />
        <circle cx="42" cy="48" r="4" fill="#E8EEF5" />
      </svg>
      <div className="brand-mark__text" style={{ fontSize }}>
        Rig<span>ZIP</span>
      </div>
    </div>
  );
}
