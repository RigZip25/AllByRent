import gardenGardenTools from "../imports/subcategories/garden-garden-tools.webp";
import gardenHouseplantsSeedlings from "../imports/subcategories/garden-houseplants-seedlings.webp";
import gardenIrrigationSystems from "../imports/subcategories/garden-irrigation-systems.webp";
import gardenLandscapeEquipment from "../imports/subcategories/garden-landscape-equipment.webp";
import gardenLawnMowers from "../imports/subcategories/garden-lawn-mowers.webp";
import gardenLeafBlowers from "../imports/subcategories/garden-leaf-blowers.webp";
import gardenNurseryStock from "../imports/subcategories/garden-nursery-stock.webp";
import gardenOther from "../imports/subcategories/garden-other.webp";
import gardenPerennials from "../imports/subcategories/garden-perennials.webp";
import gardenRideOnMowers from "../imports/subcategories/garden-ride-on-mowers.webp";
import gardenSeasonalFlowers from "../imports/subcategories/garden-seasonal-flowers.webp";
import gardenShrubsBushes from "../imports/subcategories/garden-shrubs-bushes.webp";
import gardenSprinklers from "../imports/subcategories/garden-sprinklers.webp";
import gardenStumpGrinders from "../imports/subcategories/garden-stump-grinders.webp";
import gardenTillersCultivators from "../imports/subcategories/garden-tillers-cultivators.webp";
import gardenTrees from "../imports/subcategories/garden-trees.webp";
import gardenTrimmers from "../imports/subcategories/garden-trimmers.webp";
import toolsHandTools from "../imports/subcategories/tools-hand-tools.webp";
import toolsIndustrialDrills from "../imports/subcategories/tools-industrial-drills.webp";
import toolsLadders from "../imports/subcategories/tools-ladders.webp";
import toolsLaserMeasuring from "../imports/subcategories/tools-laser-measuring.webp";
import toolsMeasuringTools from "../imports/subcategories/tools-measuring-tools.webp";
import toolsOther from "../imports/subcategories/tools-other.webp";
import toolsPaintingTools from "../imports/subcategories/tools-painting-tools.webp";
import toolsPowerDrills from "../imports/subcategories/tools-power-drills.webp";
import toolsPowerSaws from "../imports/subcategories/tools-power-saws.webp";
import toolsScaffoldingSystems from "../imports/subcategories/tools-scaffolding-systems.webp";
import toolsWeldingEquipment from "../imports/subcategories/tools-welding-equipment.webp";

/**
 * Artwork for individual shelves, keyed by an id the taxonomy points at.
 *
 * Ids carry their category prefix because shelf labels repeat across the
 * taxonomy — every category has an "Other", and a few share names outright.
 * Artwork lands category by category, so most shelves still have no entry here
 * and keep drawing their emoji.
 */
export const SUBCATEGORY_ART = {
  "garden-garden-tools": gardenGardenTools,
  "garden-houseplants-seedlings": gardenHouseplantsSeedlings,
  "garden-irrigation-systems": gardenIrrigationSystems,
  "garden-landscape-equipment": gardenLandscapeEquipment,
  "garden-lawn-mowers": gardenLawnMowers,
  "garden-leaf-blowers": gardenLeafBlowers,
  "garden-nursery-stock": gardenNurseryStock,
  "garden-other": gardenOther,
  "garden-perennials": gardenPerennials,
  "garden-ride-on-mowers": gardenRideOnMowers,
  "garden-seasonal-flowers": gardenSeasonalFlowers,
  "garden-shrubs-bushes": gardenShrubsBushes,
  "garden-sprinklers": gardenSprinklers,
  "garden-stump-grinders": gardenStumpGrinders,
  "garden-tillers-cultivators": gardenTillersCultivators,
  "garden-trees": gardenTrees,
  "garden-trimmers": gardenTrimmers,
  "tools-hand-tools": toolsHandTools,
  "tools-industrial-drills": toolsIndustrialDrills,
  "tools-ladders": toolsLadders,
  "tools-laser-measuring": toolsLaserMeasuring,
  "tools-measuring-tools": toolsMeasuringTools,
  "tools-other": toolsOther,
  "tools-painting-tools": toolsPaintingTools,
  "tools-power-drills": toolsPowerDrills,
  "tools-power-saws": toolsPowerSaws,
  "tools-scaffolding-systems": toolsScaffoldingSystems,
  "tools-welding-equipment": toolsWeldingEquipment,
} as const;

export type SubcategoryArtId = keyof typeof SUBCATEGORY_ART;

export function subcategoryArtSrc(id: SubcategoryArtId | undefined): string | null {
  if (!id) return null;
  return SUBCATEGORY_ART[id] ?? null;
}
