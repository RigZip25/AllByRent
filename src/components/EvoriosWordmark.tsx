import { APP_NAME } from "../lib/brand";

export type EvoriosWordmarkVariant = "splash-dark" | "splash-light" | "header";

type EvoriosWordmarkProps = {
  /** Visual context — dark gradient splash, light static splash, or compact header */
  variant?: EvoriosWordmarkVariant;
  /** One-shot shimmer when the dynamic splash title appears */
  reveal?: boolean;
  className?: string;
};

/**
 * Branded wordmark: Evo + rios split (evolution cue), display type, ™ mark.
 */
export function EvoriosWordmark({
  variant = "header",
  reveal = false,
  className = "",
}: EvoriosWordmarkProps) {
  return (
    <span
      className={[
        "evorios-wordmark",
        `evorios-wordmark--${variant}`,
        reveal ? "evorios-wordmark--reveal" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={APP_NAME}
    >
      <span className="evorios-wordmark-evo" aria-hidden>
        Evo
      </span>
      <span className="evorios-wordmark-rios" aria-hidden>
        rios
      </span>
      <sup className="evorios-wordmark-tm" aria-hidden>
        ™
      </sup>
    </span>
  );
}
