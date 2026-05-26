const GREEN = "#0D5C3A";
const MINT = "#9FE1CB";
const AMBER = "#F59E0B";

export function WorldMapIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="16" y="20" width="288" height="160" rx="18" fill="#F0F9FF" stroke={GREEN} strokeOpacity="0.15" />
      <path
        d="M56 88c20-28 48-36 72-24 18 10 28 8 40-4 16-16 40-20 64-8 20 10 32 6 44-8 8-10 20-14 32-10 6 2 10 8 8 16-4 18-20 32-40 36-24 4-48-2-68-18-20-16-44-22-72-16-28 6-52 22-60 44-6 16 2 30 16 38 12 8 28 6 40-4 14-12 34-16 52-8z"
        fill={MINT}
        fillOpacity="0.5"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M72 124c24-6 52-4 76 8 20 10 44 12 68 4"
        fill={MINT}
        fillOpacity="0.35"
        stroke={GREEN}
        strokeWidth="1.75"
      />
      <path
        d="M96 92c48-8 88 0 120 28"
        stroke={AMBER}
        strokeWidth="2.5"
        strokeDasharray="7 6"
        strokeLinecap="round"
      />
      <path
        d="M104 96l88 18 44-8"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="104" cy="96" r="8" fill={GREEN} />
      <circle cx="104" cy="96" r="3.5" fill="#fff" />
      <circle cx="192" cy="114" r="8" fill={GREEN} />
      <circle cx="192" cy="114" r="3.5" fill="#fff" />
      <circle cx="236" cy="106" r="8" fill={AMBER} />
      <circle cx="236" cy="106" r="3.5" fill="#fff" />
      <path
        d="M168 58c-10 0-18 8-18 18 0 13 18 28 18 28s18-15 18-28c0-10-8-18-18-18z"
        fill={GREEN}
      />
      <circle cx="168" cy="76" r="6" fill="#fff" />
      <path d="M40 48h16M264 48h-14" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.2" />
    </svg>
  );
}
