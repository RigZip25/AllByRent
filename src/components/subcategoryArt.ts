import babyBabyCarriers from "../imports/subcategories/baby-baby-carriers.webp";
import babyCarSeats from "../imports/subcategories/baby-car-seats.webp";
import babyChildcareEquipment from "../imports/subcategories/baby-childcare-equipment.webp";
import babyCommercialPlayEquipment from "../imports/subcategories/baby-commercial-play-equipment.webp";
import babyCribsBeds from "../imports/subcategories/baby-cribs-beds.webp";
import babyEducationalTools from "../imports/subcategories/baby-educational-tools.webp";
import babyGroupActivityGear from "../imports/subcategories/baby-group-activity-gear.webp";
import babyOther from "../imports/subcategories/baby-other.webp";
import babySafetySystems from "../imports/subcategories/baby-safety-systems.webp";
import babyStrollers from "../imports/subcategories/baby-strollers.webp";
import babyToysGames from "../imports/subcategories/baby-toys-games.webp";
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
import homeBakingEquipment from "../imports/subcategories/home-baking-equipment.webp";
import homeBeverageSystems from "../imports/subcategories/home-beverage-systems.webp";
import homeBlendersJuicers from "../imports/subcategories/home-blenders-juicers.webp";
import homeCateringEquipment from "../imports/subcategories/home-catering-equipment.webp";
import homeCleaningAppliances from "../imports/subcategories/home-cleaning-appliances.webp";
import homeCoffeeMakers from "../imports/subcategories/home-coffee-makers.webp";
import homeCommercialCoffee from "../imports/subcategories/home-commercial-coffee.webp";
import homeFoodProcessorsPro from "../imports/subcategories/home-food-processors-pro.webp";
import homeIndustrialMixers from "../imports/subcategories/home-industrial-mixers.webp";
import homeOther from "../imports/subcategories/home-other.webp";
import homeStandMixers from "../imports/subcategories/home-stand-mixers.webp";
import partyCateringEquipment from "../imports/subcategories/party-catering-equipment.webp";
import partyEventLighting from "../imports/subcategories/party-event-lighting.webp";
import partyGamesActivities from "../imports/subcategories/party-games-activities.webp";
import partyOther from "../imports/subcategories/party-other.webp";
import partyPartyDecor from "../imports/subcategories/party-party-decor.webp";
import partyPhotoBooths from "../imports/subcategories/party-photo-booths.webp";
import partyServingEquipment from "../imports/subcategories/party-serving-equipment.webp";
import partySoundSystems from "../imports/subcategories/party-sound-systems.webp";
import partyStageRisers from "../imports/subcategories/party-stage-risers.webp";
import partyTablesChairs from "../imports/subcategories/party-tables-chairs.webp";
import partyTentsCanopies from "../imports/subcategories/party-tents-canopies.webp";
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
  "baby-baby-carriers": babyBabyCarriers,
  "baby-car-seats": babyCarSeats,
  "baby-childcare-equipment": babyChildcareEquipment,
  "baby-commercial-play-equipment": babyCommercialPlayEquipment,
  "baby-cribs-beds": babyCribsBeds,
  "baby-educational-tools": babyEducationalTools,
  "baby-group-activity-gear": babyGroupActivityGear,
  "baby-other": babyOther,
  "baby-safety-systems": babySafetySystems,
  "baby-strollers": babyStrollers,
  "baby-toys-games": babyToysGames,
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
  "home-baking-equipment": homeBakingEquipment,
  "home-beverage-systems": homeBeverageSystems,
  "home-blenders-juicers": homeBlendersJuicers,
  "home-catering-equipment": homeCateringEquipment,
  "home-cleaning-appliances": homeCleaningAppliances,
  "home-coffee-makers": homeCoffeeMakers,
  "home-commercial-coffee": homeCommercialCoffee,
  "home-food-processors-pro": homeFoodProcessorsPro,
  "home-industrial-mixers": homeIndustrialMixers,
  "home-other": homeOther,
  "home-stand-mixers": homeStandMixers,
  "party-catering-equipment": partyCateringEquipment,
  "party-event-lighting": partyEventLighting,
  "party-games-activities": partyGamesActivities,
  "party-other": partyOther,
  "party-party-decor": partyPartyDecor,
  "party-photo-booths": partyPhotoBooths,
  "party-serving-equipment": partyServingEquipment,
  "party-sound-systems": partySoundSystems,
  "party-stage-risers": partyStageRisers,
  "party-tables-chairs": partyTablesChairs,
  "party-tents-canopies": partyTentsCanopies,
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
