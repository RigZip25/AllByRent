/**
 * Onboarding & marketing art — replace files in src/imports/onboarding/
 * without code changes. Spec: docs/SCREEN_OVERHAUL.md § Asset manifest
 */
import evoriosStockGarage from "../imports/onboarding/evorios_stock_garage.webp";
import evoriosBrowseBlock from "../imports/onboarding/evorios_browse_block.webp";
import evoriosOnBlock from "../imports/onboarding/evorios_on_block.webp";
import evoriosTripDestination from "../imports/onboarding/evorios_trip_destination.webp";
import evoriosTraveler from "../imports/onboarding/evorios_traveler.webp";
import evoriosMrFull from "../imports/onboarding/evorios_mr_full.webp";
import evoriosGarageRoles from "../imports/onboarding/evorios_garage_roles.webp";

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
