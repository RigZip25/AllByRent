import type { ReactElement } from "react";

/** Custom shelf icons where Unicode has no good match. */
export type CategoryGlyphId =
  | "power-drill"
  | "industrial-drill"
  | "welding"
  | "scaffolding"
  | "laser-measure"
  | "power-saw"
  | "tripod"
  | "drone"
  | "stand-mixer"
  | "lawn-mower"
  | "forklift"
  | "concrete-mixer";

type GlyphProps = {
  size?: number;
  className?: string;
  /** When true, soft light palette for selected chips on green. */
  inverted?: boolean;
};

/** Cordless drill — teal body, amber battery, steel chuck. */
function PowerDrill({ size = 28, className = "", inverted }: GlyphProps) {
  const body = inverted ? "#A7F3D0" : "#0D9488";
  const bodyDark = inverted ? "#6EE7B7" : "#0F766E";
  const battery = inverted ? "#FCD34D" : "#F59E0B";
  const batteryTop = inverted ? "#FDE68A" : "#FBBF24";
  const steel = inverted ? "#E5E7EB" : "#6B7280";
  const steelDark = inverted ? "#F9FAFB" : "#374151";
  const grip = inverted ? "#D1D5DB" : "#4B5563";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      {/* bit */}
      <path d="M5 22h7" stroke={steelDark} strokeWidth={2.4} strokeLinecap="round" />
      {/* chuck */}
      <rect x="11.5" y="18.5" width="5" height="7" rx="1" fill={steel} stroke={steelDark} strokeWidth={1.4} />
      {/* body */}
      <path
        d="M16 17h13c2.4 0 4.2 1.9 4.2 4.2v1.6c0 2.3-1.8 4.2-4.2 4.2H16V17z"
        fill={body}
        stroke={bodyDark}
        strokeWidth={1.6}
      />
      {/* clutch ring */}
      <circle cx="18.5" cy="22" r="2.4" fill={batteryTop} stroke={bodyDark} strokeWidth={1.2} />
      {/* grip */}
      <path
        d="M24.5 27v7.5c0 1.6-1.1 2.7-2.6 2.7H19"
        stroke={grip}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path d="M23.5 27h-3.2" stroke={steelDark} strokeWidth={2} strokeLinecap="round" />
      {/* battery pack */}
      <rect x="33" y="17" width="10" height="10" rx="2" fill={battery} stroke={bodyDark} strokeWidth={1.4} />
      <rect x="35.5" y="14.5" width="5" height="3" rx="0.8" fill={batteryTop} stroke={bodyDark} strokeWidth={1.2} />
      <path d="M35.5 22h5" stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
}

/** Industrial drill — deep blue housing, orange side handle. */
function IndustrialDrill({ size = 28, className = "", inverted }: GlyphProps) {
  const body = inverted ? "#93C5FD" : "#2563EB";
  const bodyDark = inverted ? "#60A5FA" : "#1D4ED8";
  const handle = inverted ? "#FDBA74" : "#EA580C";
  const handleDark = inverted ? "#FB923C" : "#C2410C";
  const steel = inverted ? "#E5E7EB" : "#6B7280";
  const steelDark = inverted ? "#F9FAFB" : "#374151";
  const motor = inverted ? "#CBD5E1" : "#475569";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      <path d="M3 23h9" stroke={steelDark} strokeWidth={2.6} strokeLinecap="round" />
      <rect x="11" y="19" width="5.5" height="8" rx="1" fill={steel} stroke={steelDark} strokeWidth={1.4} />
      <path
        d="M16 17.5h15c2.6 0 4.7 2.1 4.7 4.7v0c0 2.6-2.1 4.7-4.7 4.7H16V17.5z"
        fill={body}
        stroke={bodyDark}
        strokeWidth={1.6}
      />
      <circle cx="19" cy="23" r="3.2" fill="#FDE68A" stroke={bodyDark} strokeWidth={1.4} />
      <circle cx="19" cy="23" r="1.2" fill={steelDark} />
      {/* side handle */}
      <path d="M23 17.5V11h7" stroke={handle} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="11" r="2.2" fill={handle} stroke={handleDark} strokeWidth={1.2} />
      {/* rear motor */}
      <rect x="35.5" y="18.5" width="9" height="9" rx="2" fill={motor} stroke={steelDark} strokeWidth={1.4} />
      <path d="M38 21h4M38 25h4" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.45} />
      {/* grip */}
      <path d="M27 27v9c0 1.3-1 2.2-2.2 2.2H22" stroke={steelDark} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** Welding torch — charcoal handle, copper nozzle, amber sparks. */
function Welding({ size = 28, className = "", inverted }: GlyphProps) {
  const hose = inverted ? "#A5B4FC" : "#6366F1";
  const handle = inverted ? "#D1D5DB" : "#374151";
  const nozzle = inverted ? "#FDBA74" : "#D97706";
  const nozzleDark = inverted ? "#FB923C" : "#B45309";
  const spark = inverted ? "#FDE68A" : "#FBBF24";
  const sparkHot = inverted ? "#FCA5A5" : "#EF4444";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      <path d="M9 39c4.5-8.5 7-13 11.5-17.5" stroke={hose} strokeWidth={2.8} strokeLinecap="round" />
      <path d="M18 23.5l9 9" stroke={handle} strokeWidth={4} strokeLinecap="round" />
      <path d="M22.5 28l-4 1.8" stroke={nozzle} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M26.5 19.5l7 7" stroke={nozzle} strokeWidth={3.2} strokeLinecap="round" />
      <path d="M31.5 16.5l7 7" stroke={nozzleDark} strokeWidth={2.2} strokeLinecap="round" />
      {/* sparks */}
      <path d="M39 11l3 4.5M42.5 9.5l1.2 4M36.5 8.5l.8 3.5" stroke={spark} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="40.5" cy="15" r="2.2" fill={spark} />
      <circle cx="43" cy="12" r="1.3" fill={sparkHot} />
      <circle cx="37.5" cy="10.5" r="1" fill={spark} />
    </svg>
  );
}

/** Scaffolding — yellow steel frame, orange braces. */
function Scaffolding({ size = 28, className = "", inverted }: GlyphProps) {
  const frame = inverted ? "#FDE68A" : "#EAB308";
  const frameDark = inverted ? "#FCD34D" : "#CA8A04";
  const brace = inverted ? "#FB923C" : "#EA580C";
  const deck = inverted ? "#E5E7EB" : "#78716C";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      {/* uprights */}
      <path d="M12 40V9M36 40V9" stroke={frame} strokeWidth={3} strokeLinecap="round" />
      {/* platforms */}
      <path d="M9 15h30" stroke={deck} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M9 25h30" stroke={deck} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M9 35h30" stroke={deck} strokeWidth={2.6} strokeLinecap="round" />
      {/* cross braces */}
      <path d="M12 15l24 10M36 15L12 25" stroke={brace} strokeWidth={2} strokeLinecap="round" />
      <path d="M12 25l24 10M36 25L12 35" stroke={brace} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
      {/* feet */}
      <path d="M7 40h10M31 40h10" stroke={frameDark} strokeWidth={2.8} strokeLinecap="round" />
      {/* top caps */}
      <circle cx="12" cy="9" r="2" fill={frameDark} />
      <circle cx="36" cy="9" r="2" fill={frameDark} />
    </svg>
  );
}

/** Laser meter — charcoal body, cyan screen, red beam. */
function LaserMeasure({ size = 28, className = "", inverted }: GlyphProps) {
  const body = inverted ? "#CBD5E1" : "#334155";
  const bodyDark = inverted ? "#94A3B8" : "#1E293B";
  const screen = inverted ? "#A5F3FC" : "#22D3EE";
  const screenDark = inverted ? "#67E8F9" : "#0891B2";
  const beam = inverted ? "#FCA5A5" : "#EF4444";
  const btn = inverted ? "#F8FAFC" : "#F1F5F9";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      <rect x="7" y="15" width="19" height="19" rx="3.5" fill={body} stroke={bodyDark} strokeWidth={1.6} />
      <rect x="10" y="18" width="13" height="7" rx="1.5" fill={screen} stroke={screenDark} strokeWidth={1.2} />
      <path d="M12 21.5h9" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.55} />
      <circle cx="13.5" cy="29.5" r="2" fill={btn} stroke={bodyDark} strokeWidth={1} />
      <circle cx="19.5" cy="29.5" r="2" fill="#FBBF24" stroke={bodyDark} strokeWidth={1} />
      <path d="M26 24.5h4" stroke={bodyDark} strokeWidth={2.4} strokeLinecap="round" />
      {/* beam glow */}
      <path d="M30 24.5h13" stroke={beam} strokeWidth={3.2} strokeLinecap="round" opacity={0.35} />
      <path d="M30 24.5h13" stroke={beam} strokeWidth={2} strokeLinecap="round" />
      <path
        d="M40.5 21l4.5 3.5-4.5 3.5"
        stroke={beam}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Circular saw — silver blade, green/orange housing. */
function PowerSaw({ size = 28, className = "", inverted }: GlyphProps) {
  const blade = inverted ? "#E2E8F0" : "#94A3B8";
  const bladeEdge = inverted ? "#F8FAFC" : "#64748B";
  const hub = inverted ? "#FCD34D" : "#F59E0B";
  const body = inverted ? "#6EE7B7" : "#059669";
  const bodyDark = inverted ? "#34D399" : "#047857";
  const grip = inverted ? "#D1D5DB" : "#4B5563";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      <circle cx="19.5" cy="24" r="13" fill={blade} stroke={bladeEdge} strokeWidth={1.8} />
      <circle cx="19.5" cy="24" r="9.5" fill="none" stroke={bladeEdge} strokeWidth={1.2} opacity={0.5} />
      {/* teeth */}
      <path
        d="M19.5 11v3.5M19.5 33.5V37M6.5 24H10M29 24h3.5M10.8 15.2l2.4 2.4M26 30.4l2.4 2.4M10.8 32.8l2.4-2.4M26 17.6l2.4-2.4"
        stroke={bladeEdge}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="24" r="4" fill={hub} stroke={bodyDark} strokeWidth={1.4} />
      <circle cx="19.5" cy="24" r="1.6" fill="#FFFFFF" opacity={0.7} />
      {/* motor / handle */}
      <path
        d="M30 19.5h11c1.7 0 2.8 1.2 2.8 2.8v3.4c0 1.6-1.1 2.8-2.8 2.8H30"
        fill={body}
        stroke={bodyDark}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M37 28.5v6.5" stroke={grip} strokeWidth={3} strokeLinecap="round" />
      <path d="M33 22.5h6" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
    </svg>
  );
}

/** Camera tripod with mount head. */
function Tripod({ size = 28, className = "", inverted }: GlyphProps) {
  const legs = inverted ? "#CBD5E1" : "#64748B";
  const legsDark = inverted ? "#94A3B8" : "#475569";
  const head = inverted ? "#FCA5A5" : "#EF4444";
  const plate = inverted ? "#E2E8F0" : "#334155";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden>
      <rect x="18" y="8" width="12" height="5" rx="1.5" fill={plate} />
      <circle cx="24" cy="16" r="3.2" fill={head} stroke={legsDark} strokeWidth={1.2} />
      <path d="M24 19v6" stroke={legsDark} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M24 25L10 42M24 25L38 42M24 25V42" stroke={legs} strokeWidth={2.8} strokeLinecap="round" />
      <circle cx="10" cy="42" r="1.8" fill={legsDark} />
      <circle cx="24" cy="42" r="1.8" fill={legsDark} />
      <circle cx="38" cy="42" r="1.8" fill={legsDark} />
    </svg>
  );
}

/** Quadcopter drone. */
function Drone({ size = 28, className = "", inverted }: GlyphProps) {
  const body = inverted ? "#93C5FD" : "#3B82F6";
  const bodyDark = inverted ? "#60A5FA" : "#1D4ED8";
  const arm = inverted ? "#CBD5E1" : "#475569";
  const prop = inverted ? "#FDE68A" : "#FBBF24";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden>
      <path d="M16 22L8 14M32 22l8-8M16 26L8 34M32 26l8 8" stroke={arm} strokeWidth={2.4} strokeLinecap="round" />
      <rect x="16" y="20" width="16" height="8" rx="3" fill={body} stroke={bodyDark} strokeWidth={1.4} />
      <circle cx="24" cy="24" r="2" fill="#FFFFFF" opacity={0.7} />
      <circle cx="8" cy="14" r="4" stroke={prop} strokeWidth={2} fill="none" />
      <circle cx="40" cy="14" r="4" stroke={prop} strokeWidth={2} fill="none" />
      <circle cx="8" cy="34" r="4" stroke={prop} strokeWidth={2} fill="none" />
      <circle cx="40" cy="34" r="4" stroke={prop} strokeWidth={2} fill="none" />
      <circle cx="8" cy="14" r="1.4" fill={arm} />
      <circle cx="40" cy="14" r="1.4" fill={arm} />
      <circle cx="8" cy="34" r="1.4" fill={arm} />
      <circle cx="40" cy="34" r="1.4" fill={arm} />
    </svg>
  );
}

/** Kitchen stand mixer. */
function StandMixer({ size = 28, className = "", inverted }: GlyphProps) {
  const body = inverted ? "#F9A8D4" : "#EC4899";
  const bodyDark = inverted ? "#F472B6" : "#BE185D";
  const bowl = inverted ? "#E2E8F0" : "#94A3B8";
  const base = inverted ? "#CBD5E1" : "#64748B";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden>
      <ellipse cx="22" cy="36" rx="11" ry="4.5" fill={base} />
      <path d="M14 22c0-1 1-2 2.5-2H26c2 0 3.5 1.5 3.5 3.5V36H14V22z" fill={bowl} stroke={base} strokeWidth={1.4} />
      <path d="M30 14h6c2 0 3.5 1.5 3.5 3.5V28c0 2-1.2 3.5-3 3.5h-3" fill={body} stroke={bodyDark} strokeWidth={1.4} />
      <path d="M30 16c-4 0-7 2-8 5" stroke={bodyDark} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx="22" cy="24" r="2.2" fill={bodyDark} />
      <path d="M22 26v6" stroke={bodyDark} strokeWidth={2} strokeLinecap="round" />
      <rect x="33" y="17" width="4" height="3" rx="1" fill="#FFFFFF" opacity={0.5} />
    </svg>
  );
}

/** Push lawn mower. */
function LawnMower({ size = 28, className = "", inverted }: GlyphProps) {
  const deck = inverted ? "#86EFAC" : "#16A34A";
  const deckDark = inverted ? "#4ADE80" : "#15803D";
  const handle = inverted ? "#CBD5E1" : "#57534E";
  const wheel = inverted ? "#1E293B" : "#1C1917";
  const hub = inverted ? "#FDE68A" : "#FBBF24";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden>
      <path d="M28 20c0-6 4-10 10-11" stroke={handle} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M38 9h4" stroke={handle} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M10 28h22c2 0 3.5 1.5 3.5 3.5V34H10v-2.5c0-2 1.5-3.5 3.5-3.5z" fill={deck} stroke={deckDark} strokeWidth={1.4} />
      <path d="M14 28v-4h8v4" fill={deckDark} opacity={0.35} />
      <circle cx="14" cy="36" r="5" fill={wheel} />
      <circle cx="14" cy="36" r="2" fill={hub} />
      <circle cx="32" cy="36" r="5" fill={wheel} />
      <circle cx="32" cy="36" r="2" fill={hub} />
      <path d="M20 30h8" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
    </svg>
  );
}

/** Warehouse forklift. */
function Forklift({ size = 28, className = "", inverted }: GlyphProps) {
  const body = inverted ? "#FCD34D" : "#EAB308";
  const bodyDark = inverted ? "#FBBF24" : "#CA8A04";
  const mast = inverted ? "#94A3B8" : "#64748B";
  const fork = inverted ? "#E2E8F0" : "#CBD5E1";
  const cabin = inverted ? "#67E8F9" : "#0891B2";
  const wheel = inverted ? "#1E293B" : "#1C1917";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden>
      {/* forks */}
      <path d="M4 18h14M4 24h14" stroke={fork} strokeWidth={2.4} strokeLinecap="round" />
      {/* mast */}
      <rect x="16" y="10" width="4" height="26" rx="1" fill={mast} />
      {/* body */}
      <path d="M20 20h16c2 0 3.5 1.5 3.5 3.5V34H20V20z" fill={body} stroke={bodyDark} strokeWidth={1.4} />
      <rect x="24" y="14" width="10" height="8" rx="1.5" fill={cabin} stroke={bodyDark} strokeWidth={1.2} />
      <circle cx="26" cy="36" r="4.5" fill={wheel} />
      <circle cx="38" cy="36" r="4.5" fill={wheel} />
      <circle cx="26" cy="36" r="1.6" fill={body} />
      <circle cx="38" cy="36" r="1.6" fill={body} />
    </svg>
  );
}

/** Portable concrete / cement mixer. */
function ConcreteMixer({ size = 28, className = "", inverted }: GlyphProps) {
  const drum = inverted ? "#FDBA74" : "#EA580C";
  const drumDark = inverted ? "#FB923C" : "#C2410C";
  const frame = inverted ? "#94A3B8" : "#57534E";
  const wheel = inverted ? "#1E293B" : "#1C1917";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden>
      <ellipse cx="24" cy="22" rx="12" ry="10" fill={drum} stroke={drumDark} strokeWidth={1.6} />
      <path d="M14 22c2-4 6-6 10-6s8 2 10 6" stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" opacity={0.35} />
      <path d="M18 18l12 8M18 26l12-8" stroke={drumDark} strokeWidth={1.4} strokeLinecap="round" opacity={0.5} />
      <path d="M12 30h24l-2 8H14l-2-8z" fill={frame} />
      <circle cx="16" cy="40" r="4" fill={wheel} />
      <circle cx="32" cy="40" r="4" fill={wheel} />
      <circle cx="16" cy="40" r="1.4" fill={drum} />
      <circle cx="32" cy="40" r="1.4" fill={drum} />
      <path d="M34 14l6-4" stroke={frame} strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}

const GLYPHS: Record<CategoryGlyphId, (props: GlyphProps) => ReactElement> = {
  "power-drill": PowerDrill,
  "industrial-drill": IndustrialDrill,
  welding: Welding,
  scaffolding: Scaffolding,
  "laser-measure": LaserMeasure,
  "power-saw": PowerSaw,
  tripod: Tripod,
  drone: Drone,
  "stand-mixer": StandMixer,
  "lawn-mower": LawnMower,
  forklift: Forklift,
  "concrete-mixer": ConcreteMixer,
};

export function CategoryGlyph({
  id,
  size = 28,
  className = "",
  inverted = false,
}: GlyphProps & { id: CategoryGlyphId }) {
  const Comp = GLYPHS[id];
  return <Comp size={size} className={className} inverted={inverted} />;
}

export function isCategoryGlyphId(value: string): value is CategoryGlyphId {
  return Object.prototype.hasOwnProperty.call(GLYPHS, value);
}
