/**
 * Onboarding & marketing art — replace files in src/imports/onboarding/
 * without code changes. Drop PNGs in src/imports/incoming/ and run
 * `node scripts/apply-incoming-assets.mjs`. Spec: docs/SCREEN_OVERHAUL.md § Asset manifest
 */
import evoriosStockGarage from "../imports/onboarding/evorios_stock_garage.png";
import evoriosBrowseBlock from "../imports/onboarding/evorios_browse_block.png";
import evoriosOnBlock from "../imports/onboarding/evorios_on_block.png";
import evoriosTripDestination from "../imports/onboarding/evorios_trip_destination.png";
import evoriosTraveler from "../imports/onboarding/evorios_traveler.png";
import evoriosMrFull from "../imports/onboarding/evorios_mr_full.png";
import evoriosGarageRoles from "../imports/onboarding/evorios_garage_roles.png";

export const onboardingAssets = {
  stockGarage: evoriosStockGarage,
  browseBlock: evoriosBrowseBlock,
  onBlock: evoriosOnBlock,
  tripDestination: evoriosTripDestination,
  traveler: evoriosTraveler,
  mrEvoriosFull: evoriosMrFull,
  garageRoles: evoriosGarageRoles,
} as const;

export type OnboardingAssetKey = keyof typeof onboardingAssets;
