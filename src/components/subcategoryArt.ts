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
