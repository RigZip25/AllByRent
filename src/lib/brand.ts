/** Evorios brand tokens — see docs/EVORIOS.md and docs/GARAGE_SHOWCASE.md */

export const APP_NAME = "Evorios";
export const APP_NAME_PRONUNCIATION = "eh-VOR-ee-ohs";

/** Product metaphor shown in UI (Garage Showcase / vitrina). */
export const PRODUCT_METAPHOR = "Garage Showcase";

/** Ties the name to the evolution narrative (EN UI). */
export const APP_TAGLINE = "The evolution of your household.";
export const APP_TAGLINE_SHORT = "Your garage, online.";

/** Russian reference copy for docs / future i18n. */
export const APP_TAGLINE_RU = "Эволюция вашего домашнего хозяйства.";

export const BRAND_GREEN = "#0D5C3A";
export const BRAND_AMBER = "#F59E0B";
export const BRAND_GREEN_LIGHT = "#1A9E6E";
export const SPLASH_BG_DARK = "#062a1c";
export const SPLASH_GRADIENT = `linear-gradient(165deg, ${SPLASH_BG_DARK} 0%, ${BRAND_GREEN} 42%, #0a3d28 100%)`;

/** Mascot — Mr. Evorios (legacy Rentano character art). */
export const MASCOT_NAME = "Mr. Evorios";

/** Prefix for mascot chat bubbles in UI. */
export function mascotSays(message: string): string {
  return `${MASCOT_NAME}: ${message}`;
}

/** Home feed modes — internal keys stay earn/rent for storage compatibility. */
export const APP_MODE_LABELS = {
  earn: "My Garage",
  rent: "Browse",
} as const;

export const APP_MODE_DESCRIPTIONS = {
  earn: "Your household garage showcase — list, price, and share what you own.",
  rent: "Browse neighborhood garages — borrow, buy, or pick up nearby.",
} as const;

export const SUPPORT_EMAIL = "support@evorios.com";
export const MARKETING_URL = "https://evorios.com";
