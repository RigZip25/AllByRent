/** Connect / payouts art — files in src/imports/connect/ */
import evoriosStripeTransition from "../imports/connect/evorios_stripe_transition.jpg";
import evoriosConnectSecureLegacy from "../imports/connect/evorios_connect_secure.jpg";

export const connectAssets = {
  /**
   * Evorios → Stripe transition (green-first, Mr. Evorios).
   * Used on Account settings payouts card and the redirect/loading shell.
   */
  securePreview: evoriosStripeTransition,
  /** Previous purple-accent secure preview (kept for reference / rollback). */
  securePreviewLegacy: evoriosConnectSecureLegacy,
} as const;
