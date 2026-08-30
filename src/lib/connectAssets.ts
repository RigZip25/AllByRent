/** Connect / payouts art — files in src/imports/connect/ */
import evoriosStripeTransition from "../imports/connect/evorios_stripe_transition.jpg";
import evoriosConnectSecureLegacy from "../imports/connect/evorios_connect_secure.jpg";
import mrEvoriosHeadIcon from "../imports/connect/mr_evorios_head_icon.png";

export const connectAssets = {
  /**
   * Evorios → Stripe transition (green-first, Mr. Evorios).
   * Used on Account settings payouts card and the redirect/loading shell.
   */
  securePreview: evoriosStripeTransition,
  /** Previous purple-accent secure preview (kept for reference / rollback). */
  securePreviewLegacy: evoriosConnectSecureLegacy,
  /**
   * Square Mr. Evorios head for Stripe Connect Express platform icon (Dashboard upload).
   * Also available at /brand/mr-evorios-head-icon.png (and -512 / -128).
   */
  platformIcon: mrEvoriosHeadIcon,
} as const;
