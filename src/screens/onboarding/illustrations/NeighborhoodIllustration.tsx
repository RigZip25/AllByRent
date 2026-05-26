const GREEN = "#0D5C3A";
const MINT = "#9FE1CB";
const AMBER = "#F59E0B";

export function NeighborhoodIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="160" cy="176" rx="128" ry="12" fill={MINT} fillOpacity="0.4" />
      <path
        d="M28 148h64l12 36H40l-8-20H28v-20zm76 0h48l16 36H92l12-36zm88 4h52l12 32h-76l12-32z"
        fill="#fff"
        stroke={GREEN}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M52 148V120h12v28M116 148V112h16v36M204 148V124h12v24" stroke={GREEN} strokeWidth="2.5" />
      <rect x="132" y="130" width="20" height="16" rx="2" fill={MINT} stroke={GREEN} strokeWidth="2" />
      <rect x="236" y="136" width="14" height="12" rx="1" fill={MINT} stroke={GREEN} strokeWidth="1.5" />
      <circle cx="72" cy="108" r="16" fill={AMBER} fillOpacity="0.2" stroke={GREEN} strokeWidth="2" />
      <path d="M44 132c14-18 36-24 56-16" stroke={GREEN} strokeWidth="2" strokeDasharray="4 5" />
      <circle cx="252" cy="100" r="14" fill={MINT} stroke={GREEN} strokeWidth="2" />
      <path d="M208 120c20-12 40-10 56 4" stroke={GREEN} strokeWidth="2" strokeDasharray="4 5" />
      <path
        d="M160 44c-14.4 0-26 11.6-26 26 0 19.2 26 42 26 42s26-22.8 26-42c0-14.4-11.6-26-26-26z"
        fill={GREEN}
      />
      <circle cx="160" cy="70" r="9" fill="#fff" />
      <rect x="154" y="88" width="12" height="8" rx="1" fill={GREEN} />
    </svg>
  );
}
