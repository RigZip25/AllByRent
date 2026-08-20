/**
 * Category-specific listing attributes.
 * Principle: steer hosts with selects/buckets — don’t invite free-form inventing.
 * `required` = must fill to continue. `recommended` = strongly nudged (badge), not blocking.
 */

import {
  brandsForList,
  type BrandListId,
} from "./listingBrands";

export type SpecFieldType = "text" | "number" | "select" | "brand" | "multiselect";

/** Mode gate for required / visibility — e.g. renter insurance only when Rent is on. */
export type SpecRequiredIf = "rent" | "sell";

export type SpecFieldDef = {
  key: string;
  type: SpecFieldType;
  required: boolean;
  /**
   * When set, required only if that mode is enabled.
   * Fields with `requiredIf: "rent"` are also hidden when Rent is off (sell-only path).
   * Fields with `requiredIf: "sell"` stay visible for rent (optional) but only block Continue when Sell is on.
   */
  requiredIf?: SpecRequiredIf;
  /** Non-blocking but shown as “Recommended” — prefer filling over blank. */
  recommended?: boolean;
  options?: readonly string[];
  /** Resolve regional brand options at read time via brandsForList. */
  brandListId?: BrandListId;
  subcategories?: readonly string[];
};

export type SpecModeContext = {
  rent?: boolean;
  sell?: boolean;
};

/** Hide rent-only fields (insurance bands) when Rent is not selected. */
export function isSpecFieldVisible(
  field: SpecFieldDef,
  modes?: SpecModeContext | null,
): boolean {
  if (field.requiredIf === "rent" && !modes?.rent) return false;
  return true;
}

export function isSpecFieldRequired(
  field: SpecFieldDef,
  modes?: SpecModeContext | null,
): boolean {
  if (!isSpecFieldVisible(field, modes)) return false;
  if (!field.required) return false;
  if (field.requiredIf === "rent") return Boolean(modes?.rent);
  if (field.requiredIf === "sell") return Boolean(modes?.sell);
  return true;
}

export type CategorySpecProfile = {
  category: string;
  fields: readonly SpecFieldDef[];
};

const PLANT_SUBS = [
  "Trees",
  "Shrubs & Bushes",
  "Perennials",
  "Seasonal Flowers",
  "Houseplants & Seedlings",
  "Nursery Stock",
] as const;

/** Plants aren’t “new vs used” — skip wear-condition UI for these shelves. */
export function isPlantListingSubcategory(subcategory: string): boolean {
  return (PLANT_SUBS as readonly string[]).includes(subcategory);
}

const GARDEN_EQUIP_SUBS = [
  "Lawn Mowers",
  "Trimmers",
  "Leaf Blowers",
  "Garden Tools",
  "Sprinklers",
  "Ride-On Mowers",
  "Tillers & Cultivators",
  "Stump Grinders",
  "Irrigation Systems",
  "Landscape Equipment",
  "Other",
] as const;

const CAR_SEAT_SAFETY_SUBS = ["Car Seats"] as const;
const CRIB_SAFETY_SUBS = ["Cribs & Beds"] as const;

const MATURE_HEIGHT_BUCKETS = [
  "under_1ft",
  "1_3ft",
  "3_6ft",
  "6_15ft",
  "15_30ft",
  "over_30ft",
  "groundcover",
] as const;

/** Indoor / bedding plants — no landscape tree heights. */
const HOUSEPLANT_HEIGHT_BUCKETS = [
  "under_1ft",
  "1_3ft",
  "3_6ft",
  "6_15ft",
] as const;

/** Flowers & perennials — compact landscape, not canopy trees. */
const BEDDING_HEIGHT_BUCKETS = [
  "under_1ft",
  "1_3ft",
  "3_6ft",
  "6_15ft",
  "groundcover",
] as const;

/** Shrubs — taller than bedding, rarely 30 ft+. */
const SHRUB_HEIGHT_BUCKETS = [
  "under_1ft",
  "1_3ft",
  "3_6ft",
  "6_15ft",
  "15_30ft",
  "groundcover",
] as const;

const CONTAINER_SIZES = [
  "plug_cell",
  "4_inch",
  "1_gallon",
  "3_gallon",
  "5_gallon",
  "7_gallon_plus",
  "bare_root",
  "ball_burlap",
  "field_grown",
] as const;

/** Potted houseplants / flowers — nursery field formats don’t apply. */
const POT_CONTAINER_SIZES = [
  "plug_cell",
  "4_inch",
  "1_gallon",
  "3_gallon",
  "5_gallon",
  "7_gallon_plus",
] as const;

const BLOOM_SEASONS = [
  "early_spring",
  "late_spring",
  "summer",
  "fall",
  "winter",
  "repeat_bloom",
  "foliage_only",
] as const;

const COMMON_COLORS = [
  "black",
  "white",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
  "purple",
  "orange",
  "brown",
  "multicolor",
  "other_color",
] as const;

const FRAME_SIZES = [
  "xs_frame",
  "s_frame",
  "m_frame",
  "l_frame",
  "xl_frame",
  "kids_frame",
  "one_size_frame",
  "wheel_12",
  "wheel_16",
  "wheel_20",
  "wheel_24",
  "wheel_26",
  "wheel_27_5",
  "wheel_29",
  "wheel_700c",
] as const;

const VOLTAGE_OPTS = [
  "12v",
  "18v_20v",
  "40v",
  "60v_plus",
  "120v_corded",
  "240v",
  "not_electric",
] as const;

function brandField(
  brandListId: BrandListId,
  extras?: Partial<Pick<SpecFieldDef, "required" | "recommended" | "subcategories">>,
): SpecFieldDef {
  return {
    key: "brand",
    type: "brand",
    brandListId,
    required: extras?.required ?? true,
    recommended: extras?.recommended,
    subcategories: extras?.subcategories,
  };
}


const PHOTO_KIT_ITEMS = ["camera_body","lens_primary","lens_secondary","batteries","charger","memory_cards","bag_case","tripod_plate","cables","filters","remote_trigger","other_accessories"] as const;
const ELECTRONICS_KIT_ITEMS = ["main_device","charger_psu","power_cable","data_cables","case_sleeve","peripherals","adapters","remote","stand_mount","manuals","other_accessories"] as const;
const ELECTRONICS_WIPE_SUBS = ["Laptops","Smart Home Devices","Network Gear","Servers & Workstations"] as const;

export const CATEGORY_SPEC_PROFILES: readonly CategorySpecProfile[] = [
  {
    category: "Tools & DIY",
    fields: [
      brandField("tools"),
      {
        key: "powerSource",
        type: "select",
        required: true,
        options: ["cordless", "corded", "gas", "manual", "pneumatic"],
      },
      {
        key: "voltageBand",
        type: "select",
        required: false,
        recommended: true,
        options: VOLTAGE_OPTS,
      },
      {
        key: "ladderHeightBand",
        type: "select",
        required: true,
        subcategories: ["Ladders"],
        options: ["under_6ft", "6_8ft", "8_12ft", "12_16ft", "16_24ft", "24_40ft", "over_40ft"],
      },
      {
        key: "ladderDutyRating",
        type: "select",
        required: true,
        subcategories: ["Ladders"],
        options: ["type_iaa", "type_ia", "type_i", "type_ii", "type_iii"],
      },
      {
        key: "weldProcess",
        type: "select",
        required: true,
        subcategories: ["Welding Equipment"],
        options: ["mig", "tig", "stick", "flux_core", "multi_process", "other_weld"],
      },
      {
        key: "weldAmpBand",
        type: "select",
        required: true,
        subcategories: ["Welding Equipment"],
        options: ["under_140a", "140_200a", "200_300a", "300a_plus"],
      },
      {
        key: "ppeIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Welding Equipment"],
        options: ["helmet_gloves_included", "helmet_only", "renter_provides_ppe", "ppe_not_applicable"],
      },
      {
        key: "scaffoldHeightBand",
        type: "select",
        required: true,
        subcategories: ["Scaffolding Systems"],
        options: ["under_10ft", "10_20ft", "20_40ft", "40ft_plus"],
      },
      {
        key: "scaffoldLoadBand",
        type: "select",
        required: true,
        subcategories: ["Scaffolding Systems"],
        options: ["light_duty", "medium_duty", "heavy_duty", "special_duty"],
      },
      {
        key: "safetyBriefingRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Welding Equipment", "Scaffolding Systems", "Power Saws"],
        options: ["required", "not_required"],
      },
      {
        key: "safetyBriefingConfirmed",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Welding Equipment", "Scaffolding Systems", "Power Saws"],
        options: ["briefing_ready", "need_to_prepare"],
      },
      {
        key: "safetyBriefingNotes",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Welding Equipment", "Scaffolding Systems", "Power Saws"],
      },
    ],
  },
  {
    category: "Photo & Video",
    fields: [
      brandField("photo"),
      { key: "model", type: "text", required: true },
      {
        key: "kitIncludes",
        type: "select",
        required: true,
        options: ["body_only", "kit_lens", "full_kit", "accessories_only"],
      },
      {
        key: "kitInventoryItems",
        type: "multiselect",
        required: true,
        requiredIf: "rent",
        options: PHOTO_KIT_ITEMS,
      },
      {
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "droneWeightClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Drones"],
        options: ["under_250g", "250g_to_55lb", "over_55lb"],
      },
      {
        key: "remoteIdStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Drones"],
        options: ["broadcast_builtin", "broadcast_add_on", "rid_exempt_under_250g", "not_equipped"],
      },
    ],
  },
  {
    category: "Electronics & Tech",
    fields: [
      brandField("electronics"),
      { key: "model", type: "text", required: true },
      {
        key: "screenSizeBand",
        type: "select",
        required: false,
        recommended: true,
        options: [
          "under_13",
          "13_15",
          "15_17",
          "17_32",
          "32_55",
          "55_plus",
          "no_screen",
        ],
      },
      {
        key: "kitInventoryItems",
        type: "multiselect",
        required: true,
        requiredIf: "rent",
        options: ELECTRONICS_KIT_ITEMS,
      },
      {
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "hostDataWipeStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [...ELECTRONICS_WIPE_SUBS],
        options: ["wiped_before_list", "wipe_at_handoff", "account_unlinked", "renter_responsible"],
      },
    ],
  },
  {
    category: "Home & Kitchen",
    fields: [
      brandField("kitchen", { required: false, recommended: true }),
      {
        key: "capacityBand",
        type: "select",
        required: true,
        options: [
          "single_serve",
          "small_2_4",
          "family_4_8",
          "large_8_plus",
          "commercial_batch",
          "not_applicable",
        ],
      },
      {
        key: "voltageBand",
        type: "select",
        required: true,
        subcategories: ["Commercial Coffee"],
        options: ["120v_corded", "240v", "not_electric"],
      },
      {
        key: "nsfCertified",
        type: "select",
        required: true,
        subcategories: ["Commercial Coffee"],
        options: ["nsf_listed", "not_nsf", "unknown"],
      },
      {
        key: "installNeeds",
        type: "select",
        required: true,
        subcategories: ["Commercial Coffee"],
        options: ["countertop_plug", "plumbed_water", "hardwired_240v", "mobile_cart", "other_install"],
      },
    ],
  },
  {
    category: "Outdoor & Camping",
    fields: [
      {
        key: "personCapacityBand",
        type: "select",
        required: true,
        options: ["1_person", "2_person", "3_4_person", "5_6_person", "7_plus_person", "group_shelter"],
      },
      {
        key: "seasonRating",
        type: "select",
        required: true,
        options: ["1_season", "2_season", "3_season", "4_season", "not_applicable"],
      },
      {
        key: "packedWeightBand",
        type: "select",
        required: false,
        recommended: true,
        options: ["under_2lb", "2_5lb", "5_10lb", "10_20lb", "over_20lb"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Survival Gear", "Expedition Tents"],
        options: ["required", "not_required"],
      },
      {
        key: "hygieneChecklistRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Tents", "Sleeping Bags", "Expedition Tents"],
        options: ["required", "not_required"],
      },
      {
        key: "hygieneSanitizedAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Tents", "Sleeping Bags", "Expedition Tents"],
        options: ["attested", "need_to_clean"],
      },
      {
        key: "hygieneChecklistNotes",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Tents", "Sleeping Bags", "Expedition Tents"],
      },
      {
        key: "sleepingBagTempBand",
        type: "select",
        required: true,
        subcategories: ["Sleeping Bags"],
        options: ["above_50f", "32_50f", "15_32f", "0_15f", "below_0f"],
      },
      {
        key: "stoveFuelType",
        type: "select",
        required: true,
        subcategories: ["Camp Cooking"],
        options: ["isobutane", "white_gas", "propane", "alcohol", "wood", "electric", "multi_fuel"],
      },
    ],
  },
  {
    category: "Sports & Recreation",
    fields: [
      { key: "sizeOrLength", type: "text", required: true },
      {
        key: "skillLevel",
        type: "select",
        required: true,
        options: ["beginner", "intermediate", "advanced", "all_levels"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Snow Sports", "Water Sports", "Pro Water Sports"],
        options: ["required", "not_required"],
      },
      {
        key: "dinSettingBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Snow Sports"],
        options: ["under_3", "3_5", "5_8", "8_10", "10_plus", "not_ski_bindings"],
      },
      {
        key: "helmetPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Snow Sports"],
        options: ["renter_provides", "included", "not_required"],
      },
      {
        key: "pfdIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Water Sports", "Pro Water Sports"],
        options: ["included", "renter_provides", "not_applicable"],
      },
    ],
  },
  {
    category: "Bikes & Scooters",
    fields: [
      { key: "frameOrWheelBand", type: "select", required: true, options: FRAME_SIZES },
      { key: "electric", type: "select", required: true, options: ["yes", "no"] },
      {
        key: "riderHeightBand",
        type: "select",
        required: false,
        recommended: true,
        options: ["under_5ft", "5_5_4", "5_4_5_8", "5_8_6_0", "6_0_plus", "kids_height"],
      },
      {
        key: "helmetPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["renter_provides", "included", "not_required"],
      },
      {
        key: "lockPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["included", "renter_provides", "deposit_for_lock"],
      },
      {
        key: "overnightStorageRule",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: [
          "indoor_only",
          "covered_outdoor_ok",
          "outdoor_locked_ok",
          "must_return_same_day",
          "host_holds_overnight",
        ],
      },
      { key: "minRiderAge", type: "number", required: false, recommended: true, requiredIf: "rent" },
      {
        key: "eBikeClass",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        options: ["class_1", "class_2", "class_3", "not_classified"],
      },
      {
        key: "batteryRangeBand",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        options: ["under_20mi", "20_40mi", "40_60mi", "60mi_plus", "unknown_range"],
      },
      {
        key: "chargerIncluded",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        options: ["included", "renter_provides", "not_applicable"],
      },
      {
        key: "batteryChargeBand",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        options: ["full_90_100", "high_70_89", "mid_40_69", "low_under_40", "unknown_charge"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Mountain Bikes", "Racing Bikes"],
        options: ["required", "not_required"],
      },
      {
        key: "cargoPayloadBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cargo Bikes"],
        options: ["under_50lb", "50_100lb", "100_200lb", "200lb_plus", "unknown_payload"],
      },
      {
        key: "childPassengerPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cargo Bikes"],
        options: [
          "no_child_passengers",
          "child_seat_included",
          "child_ok_renter_seat",
          "adult_cargo_only",
        ],
      },
      {
        key: "adaptiveBikeType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Adaptive Bikes"],
        options: [
          "handcycle",
          "tandem",
          "trike",
          "recumbent",
          "wheelchair_attach",
          "other_adaptive",
        ],
      },
    ],
  },
  {
    category: "Vehicles",
    fields: [
      { key: "make", type: "text", required: true },
      { key: "model", type: "text", required: true },
      { key: "year", type: "number", required: true },
      {
        key: "color",
        type: "select",
        required: true,
        options: COMMON_COLORS,
      },
      // Sale needs current odometer; rent captures miles at check-in / return instead.
      { key: "mileage", type: "number", required: true, requiredIf: "sell" },
      {
        key: "transmission",
        type: "select",
        required: true,
        options: ["automatic", "manual", "cvt", "other"],
      },
      {
        key: "fuelType",
        type: "select",
        required: true,
        options: ["gasoline", "diesel", "hybrid", "electric", "other"],
      },
      {
        key: "drivetrain",
        type: "select",
        required: false,
        recommended: true,
        options: ["fwd", "rwd", "awd", "4wd", "not_applicable"],
      },
      {
        key: "vehicleWeightLbs",
        type: "number",
        required: true,
        requiredIf: "rent",
      },
      /**
       * Tire/wheel positions for pre-trip photos.
       * Recommended for all vehicle rentals (default 4 at inspection time).
       * Commercial / ≥26k / semi must set explicitly (see validation.ts).
       */
      {
        key: "wheelCount",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "insuranceMinLiability",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["liability_25_50", "liability_50_100", "liability_100_300", "liability_250_500"],
      },
      {
        key: "insuranceMaxDeductible",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["deductible_500", "deductible_1000", "deductible_2500", "full_coverage_required"],
      },
      /** Trailers / equipment trailers — hitch class + brake controller. */
      {
        key: "hitchClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Trailers", "Equipment Trailers"],
        options: ["class_i", "class_ii", "class_iii", "class_iv", "class_v", "gooseneck_fifth", "not_applicable"],
      },
      {
        key: "brakeController",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Trailers", "Equipment Trailers"],
        options: ["electric_brakes", "surge", "electric_over_hydraulic", "none", "not_applicable"],
      },
      /** RVs & Campers — dump / propane / occupancy. */
      {
        key: "rvOccupancyBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["RVs & Campers"],
        options: ["1_2", "3_4", "5_6", "7_8", "9_plus"],
      },
      {
        key: "dumpStationAccess",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["RVs & Campers"],
        options: ["included_host_site", "renter_public", "not_needed", "black_tank_none"],
      },
      {
        key: "propaneStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["RVs & Campers"],
        options: ["full_tanks", "partial", "empty_renter_fills", "no_propane"],
      },
      {
        key: "generatorIncluded",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["RVs & Campers"],
        options: ["yes", "no", "shore_power_only"],
      },
      {
        key: "helmetPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["ATVs", "Motorcycles"],
        options: ["renter_provides", "included", "not_required"],
      },
      {
        key: "ohvTerrainWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["ATVs"],
        options: ["required", "not_required"],
      },
      {
        key: "minRiderAge",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["ATVs"],
      },
      {
        key: "motorcycleEndorsementRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Motorcycles"],
        options: ["required", "not_required"],
      },
    ],
  },
  {
    category: "Boats & Water",
    fields: [
      {
        key: "lengthBand",
        type: "select",
        required: true,
        options: ["under_10ft", "10_14ft", "14_20ft", "20_30ft", "over_30ft"],
      },
      {
        key: "capacityPeopleBand",
        type: "select",
        required: true,
        options: ["1_2", "3_4", "5_8", "9_12", "13_plus"],
      },
      {
        key: "motorIncluded",
        type: "select",
        required: true,
        options: ["yes", "no", "electric_only"],
      },
      {
        key: "hinNumber",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "boatRegistration",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "uscgSafetyKitConfirmed",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Jet Skis",
          "Motorboats",
          "Pontoon Boats",
          "Commercial Fishing",
          "Dive Boats",
          "Charter Vessels",
          "Fishing Boats",
        ],
        options: ["kit_complete", "incomplete"],
      },
      {
        key: "captainMode",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Motorboats", "Pontoon Boats", "Charter Vessels"],
        options: ["bareboat", "captain_included"],
      },
      {
        key: "pfdIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Kayaks & Canoes", "SUP Boards", "Inflatable Boats"],
        options: ["included", "renter_provides", "not_required"],
      },
      {
        key: "pfdCount",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Kayaks & Canoes", "SUP Boards", "Inflatable Boats"],
      },
      {
        key: "insuranceMinLiability",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["liability_25_50", "liability_50_100", "liability_100_300", "liability_250_500"],
      },
      {
        key: "insuranceMaxDeductible",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["deductible_500", "deductible_1000", "deductible_2500", "full_coverage_required"],
      },
    ],
  },
  {
    category: "Garden & Yard",
    fields: [
      {
        key: "matureHeightBand",
        type: "select",
        required: true,
        subcategories: ["Houseplants & Seedlings"],
        options: HOUSEPLANT_HEIGHT_BUCKETS,
      },
      {
        key: "matureHeightBand",
        type: "select",
        required: true,
        subcategories: ["Perennials", "Seasonal Flowers"],
        options: BEDDING_HEIGHT_BUCKETS,
      },
      {
        key: "matureHeightBand",
        type: "select",
        required: true,
        subcategories: ["Shrubs & Bushes"],
        options: SHRUB_HEIGHT_BUCKETS,
      },
      {
        key: "matureHeightBand",
        type: "select",
        required: true,
        subcategories: ["Trees", "Nursery Stock"],
        options: MATURE_HEIGHT_BUCKETS,
      },
      {
        key: "sunExposure",
        type: "select",
        required: true,
        subcategories: ["Houseplants & Seedlings"],
        options: ["indoor", "partial_sun", "full_sun", "shade"],
      },
      {
        key: "sunExposure",
        type: "select",
        required: true,
        subcategories: ["Trees", "Shrubs & Bushes", "Perennials", "Seasonal Flowers", "Nursery Stock"],
        options: ["full_sun", "partial_sun", "shade", "indoor"],
      },
      {
        key: "evergreenOrDeciduous",
        type: "select",
        required: true,
        subcategories: ["Trees", "Shrubs & Bushes", "Nursery Stock"],
        options: ["evergreen", "deciduous", "semi_evergreen", "not_applicable"],
      },
      {
        key: "containerClass",
        type: "select",
        required: true,
        subcategories: ["Houseplants & Seedlings", "Perennials", "Seasonal Flowers"],
        options: POT_CONTAINER_SIZES,
      },
      {
        key: "containerClass",
        type: "select",
        required: true,
        subcategories: ["Trees", "Shrubs & Bushes", "Nursery Stock"],
        options: CONTAINER_SIZES,
      },
      {
        key: "bloomSeason",
        type: "select",
        required: false,
        recommended: true,
        subcategories: ["Perennials", "Seasonal Flowers", "Shrubs & Bushes"],
        options: BLOOM_SEASONS,
      },
      {
        key: "waterNeeds",
        type: "select",
        required: false,
        recommended: true,
        subcategories: PLANT_SUBS,
        options: ["low_water", "medium_water", "high_water"],
      },
      brandField("gardenEquip", { subcategories: GARDEN_EQUIP_SUBS }),
      {
        key: "powerSource",
        type: "select",
        required: true,
        subcategories: GARDEN_EQUIP_SUBS,
        options: ["cordless", "corded", "gas", "manual", "ride_on"],
      },
      {
        key: "cuttingWidthBand",
        type: "select",
        required: false,
        recommended: true,
        subcategories: ["Lawn Mowers", "Ride-On Mowers", "Trimmers"],
        options: ["under_16in", "16_21in", "21_30in", "30in_plus", "not_applicable"],
      },
      {
        key: "stumpCapacityBand",
        type: "select",
        required: true,
        subcategories: ["Stump Grinders"],
        options: ["under_8in", "8_16in", "16_24in", "24in_plus"],
      },
      {
        key: "ppeIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stump Grinders"],
        options: ["eye_ear_gloves", "partial_ppe", "renter_provides_ppe"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stump Grinders"],
        options: ["required", "not_required"],
      },
      {
        key: "insuranceMinLiability",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stump Grinders"],
        options: ["liability_25_50", "liability_50_100", "liability_100_300", "liability_250_500"],
      },
      {
        key: "insuranceMaxDeductible",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stump Grinders"],
        options: ["deductible_500", "deductible_1000", "deductible_2500", "full_coverage_required"],
      },
    ],
  },
  {
    category: "Party & Events",
    fields: [
      {
        key: "guestCapacityBand",
        type: "select",
        required: true,
        options: ["1_4", "5_10", "11_25", "26_50", "51_100", "100_plus"],
      },
      {
        key: "setupFootprint",
        type: "select",
        required: false,
        recommended: true,
        options: ["tabletop", "small_room", "backyard", "hall_venue", "outdoor_large"],
      },
      {
        key: "color",
        type: "select",
        required: false,
        recommended: true,
        options: COMMON_COLORS,
      },
      {
        key: "setupTeardownFeeUsd",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "powerRequirement",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Stage & Risers",
          "Sound Systems",
          "Event Lighting",
          "Photo Booths",
          "Catering Equipment",
        ],
        options: [
          "none_battery",
          "standard_120v",
          "dedicated_20a",
          "240v_or_generator",
          "host_provides",
        ],
      },
      {
        key: "weatherCancelPolicy",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        options: [
          "full_refund_24h",
          "full_refund_12h",
          "host_discretion",
          "not_outdoor",
        ],
      },
      {
        key: "setPieceCountBand",
        type: "select",
        required: true,
        subcategories: ["Tables & Chairs"],
        options: ["1_4", "5_10", "11_25", "26_50", "50_plus"],
      },
      {
        key: "tentSizeBand",
        type: "select",
        required: true,
        subcategories: ["Tents & Canopies"],
        options: ["10x10", "10x20", "20x20", "20x40", "larger", "pop_up_other"],
      },
      {
        key: "cateringSanitizeAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Serving Equipment", "Catering Equipment"],
        options: ["attested", "need_to_sanitize"],
      },
    ],
  },
  {
    category: "Music & Audio",
    fields: [
      brandField("music"),
      { key: "model", type: "text", required: true },
      {
        key: "powerBand",
        type: "select",
        required: false,
        recommended: true,
        options: ["under_50w", "50_200w", "200_1000w", "1000w_plus", "passive_unpowered"],
      },
      {
        key: "paCableStandInventory",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["PA Systems"],
      },
    ],
  },
  {
    category: "Gym & Fitness",
    fields: [
      {
        key: "weightBand",
        type: "select",
        required: true,
        options: [
          "under_10lb",
          "10_25lb",
          "25_50lb",
          "50_100lb",
          "100lb_plus",
          "bodyweight_only",
          "adjustable",
        ],
      },
      {
        key: "maxUserWeightBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Cardio Equipment",
          "Commercial Treadmills",
          "Weight Machines",
        ],
        options: ["up_to_200lb", "up_to_250lb", "up_to_300lb", "300lb_plus", "not_rated"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["required", "not_required"],
      },
    ],
  },
  {
    category: "Baby & Kids",
    fields: [
      brandField("baby"),
      {
        key: "ageBand",
        type: "select",
        required: true,
        options: [
          "newborn_0_6m",
          "infant_6_12m",
          "toddler_1_3y",
          "preschool_3_5y",
          "kids_5_12y",
          "mixed_ages",
        ],
      },
      {
        key: "weightLimitBand",
        type: "select",
        required: true,
        options: [
          "under_20lb",
          "20_40lb",
          "40_65lb",
          "65lb_plus",
          "not_applicable",
        ],
      },
      {
        key: "safetyDateKnown",
        type: "select",
        required: true,
        subcategories: [...CAR_SEAT_SAFETY_SUBS, ...CRIB_SAFETY_SUBS],
        options: ["expiry_known", "mfr_date_known", "need_to_check", "not_applicable"],
      },
      {
        key: "expiresOrRecallCheck",
        type: "text",
        required: false,
        recommended: true,
        subcategories: CRIB_SAFETY_SUBS,
      },
      /** Car seats: hard expiry (YYYY-MM-DD or Exp YYYY-MM) — blocks publish/book when past. */
      {
        key: "carSeatExpiryDate",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: CAR_SEAT_SAFETY_SUBS,
      },
      {
        key: "recallAcknowledged",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [...CAR_SEAT_SAFETY_SUBS, ...CRIB_SAFETY_SUBS],
        options: ["acknowledged", "not_checked"],
      },
      {
        key: "sanitizationAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [...CAR_SEAT_SAFETY_SUBS, ...CRIB_SAFETY_SUBS],
        options: ["attested", "not_yet"],
      },
      {
        key: "labelPhotoConfirmed",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: CAR_SEAT_SAFETY_SUBS,
        options: ["photo_on_listing", "will_add"],
      },
      {
        key: "dropSideAcknowledged",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: CRIB_SAFETY_SUBS,
        options: ["no_drop_side", "not_verified"],
      },
      {
        key: "cpscCompliant",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: CRIB_SAFETY_SUBS,
        options: ["cpsc_compliant", "need_to_verify"],
      },
      {
        key: "mattressIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: CRIB_SAFETY_SUBS,
        options: ["firm_mattress_included", "pack_n_play_pad", "mattress_not_included"],
      },
      {
        key: "playCertStandard",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Play Equipment"],
        options: ["astm_f1487", "cpsc_playground", "jpma", "other_cert", "not_certified"],
      },
      {
        key: "playCapacityBand",
        type: "select",
        required: true,
        subcategories: ["Commercial Play Equipment"],
        options: ["kids_1_4", "kids_5_10", "kids_11_25", "kids_26_plus"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Play Equipment"],
        options: ["required", "not_required"],
      },
    ],
  },
  {
    category: "Office & Business",
    fields: [
      brandField("office"),
      { key: "model", type: "text", required: true },
      {
        key: "deviceHasStorage",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Printers",
          "Monitors & Displays",
          "Webcams & Streaming",
          "Presentation Gear",
          "Large Format Printers",
          "POS Systems",
          "Commercial Copiers",
          "Conference Systems",
          "Server Equipment",
          "Other",
        ],
        options: ["has_storage", "no_storage", "unknown"],
      },
      {
        key: "hostDataWipeStatus",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: [
          "Printers",
          "Monitors & Displays",
          "Webcams & Streaming",
          "Presentation Gear",
          "Large Format Printers",
          "POS Systems",
          "Commercial Copiers",
          "Conference Systems",
          "Server Equipment",
          "Other",
        ],
        options: ["wiped_before_list", "wipe_at_handoff", "renter_responsible"],
      },
    ],
  },
  {
    category: "Heavy Equipment",
    fields: [
      brandField("heavy"),
      {
        key: "powerBand",
        type: "select",
        required: true,
        options: ["under_2kw", "2_5kw", "5_15kw", "15_50kw", "50kw_plus", "not_motorized"],
      },
      {
        key: "fuelType",
        type: "select",
        required: true,
        options: ["gasoline", "diesel", "electric", "propane", "other"],
      },
      {
        key: "hoursBand",
        type: "select",
        required: false,
        recommended: true,
        options: ["under_100h", "100_500h", "500_2000h", "2000h_plus", "unknown_hours"],
      },
      {
        key: "insuranceMinLiability",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["liability_25_50", "liability_50_100", "liability_100_300", "liability_250_500"],
      },
      {
        key: "insuranceMaxDeductible",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["deductible_500", "deductible_1000", "deductible_2500", "full_coverage_required"],
      },
    ],
  },
  {
    category: "Construction",
    fields: [
      brandField("construction"),
      { key: "dutyClass", type: "select", required: true, options: ["light_duty", "medium_duty", "heavy_duty", "industrial"] },
      { key: "jobScale", type: "select", required: false, recommended: true, options: ["handheld", "job_site", "crew_scale", "crane_class"] },
      { key: "powerBand", type: "select", required: true, subcategories: ["Concrete Mixers", "Site Lighting", "Large Concrete Equipment", "Crane & Lifting", "Excavation Tools"], options: ["under_2kw", "2_5kw", "5_15kw", "15_50kw", "50kw_plus", "not_motorized"] },
      { key: "fuelType", type: "select", required: true, subcategories: ["Concrete Mixers", "Site Lighting", "Large Concrete Equipment", "Crane & Lifting", "Excavation Tools"], options: ["gasoline", "diesel", "electric", "propane", "other"] },
      { key: "hoursBand", type: "select", required: false, recommended: true, subcategories: ["Concrete Mixers", "Site Lighting", "Large Concrete Equipment", "Crane & Lifting", "Excavation Tools"], options: ["under_100h", "100_500h", "500_2000h", "2000h_plus", "unknown_hours"] },
      { key: "ppeRiskTier", type: "select", required: true, requiredIf: "rent", subcategories: ["Safety Equipment"], options: ["soft_ppe", "fall_protection", "mixed_kit"] },
      { key: "ppeSizeBand", type: "select", required: true, requiredIf: "rent", subcategories: ["Safety Equipment"], options: ["xs", "s", "m", "l", "xl", "xxl", "one_size", "adjustable", "mixed_sizes"] },
      { key: "ppeStandardRegion", type: "select", required: true, requiredIf: "rent", subcategories: ["Safety Equipment"], options: ["ansi_z89_hard_hat", "en_397_hard_hat", "ansi_z359_fall", "en_361_harness", "other_ppe_standard", "not_applicable_soft"] },
      { key: "ppeInspectionStatus", type: "select", required: true, requiredIf: "rent", subcategories: ["Safety Equipment"], options: ["inspected_current", "tag_visible", "needs_inspection", "not_required_soft_ppe"] },
      { key: "craneCapacityTonsBand", type: "select", required: true, requiredIf: "rent", subcategories: ["Crane & Lifting"], options: ["under_1t", "1_5t", "5_20t", "20_50t", "50t_plus", "not_a_crane"] },
      { key: "craneOperatorMode", type: "select", required: true, requiredIf: "rent", subcategories: ["Crane & Lifting"], options: ["bare_rental", "operator_included", "operator_optional"] },
      { key: "kitInventoryChecklist", type: "text", required: true, requiredIf: "rent", subcategories: ["Formwork Basic", "Professional Formwork"] },
      { key: "formworkPieceCountBand", type: "select", required: true, requiredIf: "rent", subcategories: ["Formwork Basic", "Professional Formwork"], options: ["under_10_pieces", "10_25_pieces", "25_50_pieces", "50_100_pieces", "100_plus_pieces"] },
      { key: "insuranceMinLiability", type: "select", required: true, requiredIf: "rent", options: ["liability_25_50", "liability_50_100", "liability_100_300", "liability_250_500"] },
      { key: "insuranceMaxDeductible", type: "select", required: true, requiredIf: "rent", options: ["deductible_500", "deductible_1000", "deductible_2500", "full_coverage_required"] },
    ],
  },
  {
    category: "Costume & Cosplay",
    fields: [
      {
        key: "clothingSize",
        type: "select",
        required: true,
        options: ["xs", "s", "m", "l", "xl", "xxl", "kids", "one_size", "custom"],
      },
      {
        key: "fits",
        type: "select",
        required: true,
        options: ["women", "men", "unisex", "kids", "plus"],
      },
      {
        key: "color",
        type: "select",
        required: true,
        options: COMMON_COLORS,
      },
      {
        key: "materialBand",
        type: "select",
        required: false,
        recommended: true,
        options: [
          "polyester",
          "cotton",
          "blend",
          "leather_faux",
          "foam_latex",
          "other_material",
        ],
      },
      {
        key: "returnConditionPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["dry_clean_only", "spot_clean_ok", "return_as_received"],
      },
      {
        key: "dryCleanReturnFeeUsd",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
      {
        key: "sanitizationAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Professional Makeup Kits",
          "Wigs & Accessories",
          "Masks & Makeup",
        ],
        options: ["attested", "not_yet"],
      },
    ],
  },
  {
    category: "Real Estate",
    fields: [
      {
        key: "sizeBand",
        type: "select",
        required: true,
        options: [
          "under_100sqft",
          "100_250sqft",
          "250_500sqft",
          "500_1000sqft",
          "1000_2500sqft",
          "2500sqft_plus",
        ],
      },
      {
        key: "maxOccupancyBand",
        type: "select",
        required: true,
        options: ["1_2", "3_4", "5_8", "9_20", "20_50", "50_plus"],
      },
      {
        key: "parkingIncluded",
        type: "select",
        required: true,
        options: ["yes", "no", "street_only"],
      },
      {
        key: "wifiIncluded",
        type: "select",
        required: true,
        options: ["yes", "no"],
      },
      {
        key: "accessType",
        type: "select",
        required: false,
        recommended: true,
        options: ["host_present", "self_checkin", "key_lockbox", "staffed"],
      },
      {
        key: "houseRules",
        type: "text",
        required: true,
        requiredIf: "rent",
      },
      {
        key: "cleaningFeeUsd",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
      },
    ],
  },
  {
    category: "Unique & Other",
    fields: [
      {
        key: "useCase",
        type: "select",
        required: true,
        options: [
          "event_prop",
          "photo_set",
          "collectible_display",
          "hobby_tool",
          "one_off_experience",
          "other_use",
        ],
      },
      {
        key: "transportSize",
        type: "select",
        required: false,
        recommended: true,
        options: ["pocket", "backpack", "car_trunk", "needs_truck", "needs_crew"],
      },
    ],
  },
];

function fieldMatchesSubcategory(field: SpecFieldDef, subcategory: string): boolean {
  if (!field.subcategories || field.subcategories.length === 0) return true;
  if (!subcategory.trim()) return false;
  return field.subcategories.includes(subcategory);
}

/** Required fields first, then recommended, then optional. */
export function getCategorySpecFields(
  category: string,
  subcategory: string,
  modes?: SpecModeContext | null,
): SpecFieldDef[] {
  const profile = CATEGORY_SPEC_PROFILES.find((p) => p.category === category);
  if (!profile) return [];
  const matched = profile.fields.filter((field) =>
    fieldMatchesSubcategory(field, subcategory),
  );
  const resolved = matched
    .filter((field) => isSpecFieldVisible(field, modes))
    .map((field) => {
      if (field.type === "brand" && field.brandListId) {
        return { ...field, options: brandsForList(field.brandListId) };
      }
      return field;
    });
  return [...resolved].sort((a, b) => {
    const rank = (f: SpecFieldDef) =>
      isSpecFieldRequired(f, modes) ? 0 : f.recommended ? 1 : 2;
    return rank(a) - rank(b);
  });
}

export function areCategorySpecsValid(
  category: string,
  subcategory: string,
  specs: Record<string, string> | undefined,
  modes?: SpecModeContext | null,
): boolean {
  const fields = getCategorySpecFields(category, subcategory, modes);
  const values = specs ?? {};
  for (const field of fields) {
    if (!isSpecFieldRequired(field, modes)) continue;
    const raw = (values[field.key] ?? "").trim();
    if (!raw) return false;
    if (field.type === "number") {
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) return false;
      if (field.key === "wheelCount" && (n < 2 || n > 26)) return false;
    }
    if (
      (field.type === "select" || field.type === "brand") &&
      field.options &&
      !field.options.includes(raw)
    ) {
      return false;
    }
    if (field.type === "multiselect" && field.options) {
      const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return false;
      if (parts.some((p) => !field.options!.includes(p))) return false;
    }
    if (field.type === "brand" && raw === "other") {
      if (!(values.brandOther ?? "").trim()) return false;
    }
  }

  // Car seats: hard expiry + recall + sanitization + label photo (not soft text).
  if (
    category.trim() === "Baby & Kids" &&
    subcategory.trim() === "Car Seats" &&
    modes?.rent
  ) {
    const expiry = (values.carSeatExpiryDate ?? values.expiresOrRecallCheck ?? "").trim();
    if (!expiry) return false;
    // Lazy import avoided — inline parse matching categoryTrustRules
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(expiry);
    const ym =
      /(?:exp(?:iry)?|expires?)[^\d]*(\d{4})[-/](\d{1,2})/i.exec(expiry) ||
      /^(\d{4})[-/](\d{1,2})$/.exec(expiry);
    let expiryOk = false;
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (iso) {
      const d = Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      expiryOk = Number.isFinite(d) && d >= today;
    } else if (ym) {
      const y = Number(ym[1]);
      const m = Number(ym[2]);
      if (y >= 1990 && m >= 1 && m <= 12) {
        const d = Date.UTC(y, m, 0);
        expiryOk = d >= today;
      }
    }
    if (!expiryOk) return false;
    if ((values.recallAcknowledged ?? "").trim() !== "acknowledged") return false;
    if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
    if ((values.labelPhotoConfirmed ?? "").trim() !== "photo_on_listing") return false;
  }

  // Real Estate: house rules required for rent.
  if (category.trim() === "Real Estate" && modes?.rent) {
    if (!(values.houseRules ?? "").trim()) return false;
  }

  // Office: when device has storage, host must declare wipe status before publish.
  if (category.trim() === "Office & Business" && modes?.rent) {
    const storage = (values.deviceHasStorage ?? "").trim();
    if (storage === "has_storage") {
      const wipe = (values.hostDataWipeStatus ?? "").trim();
      if (
        wipe !== "wiped_before_list" &&
        wipe !== "wipe_at_handoff" &&
        wipe !== "renter_responsible"
      ) {
        return false;
      }
    }
  }

  // Party outdoor: weather cancel policy required for outdoor footprints / tents.
  if (category.trim() === "Party & Events" && modes?.rent) {
    const footprint = (values.setupFootprint ?? "").trim().toLowerCase();
    const sub = subcategory.trim().toLowerCase();
    const outdoorish =
      footprint === "backyard" ||
      footprint === "outdoor_large" ||
      sub === "tents & canopies" ||
      sub.includes("canopy");
    if (outdoorish) {
      const policy = (values.weatherCancelPolicy ?? "").trim();
      if (
        !policy ||
        !["full_refund_24h", "full_refund_12h", "host_discretion", "not_outdoor"].includes(
          policy,
        )
      ) {
        return false;
      }
    }
  }

  // Tools safety briefing: host must mark briefing ready for saws/welders/scaffolding.
  if (category.trim() === "Tools & DIY" && modes?.rent) {
    const sub = subcategory.trim().toLowerCase();
    const needsBrief =
      sub === "welding equipment" ||
      sub === "scaffolding systems" ||
      sub === "power saws" ||
      (values.safetyBriefingRequired ?? "").trim() === "required";
    if (needsBrief && (values.safetyBriefingRequired ?? "").trim() !== "not_required") {
      if ((values.safetyBriefingConfirmed ?? "").trim() !== "briefing_ready") return false;
    }
  }

  // Outdoor hygiene: tents / sleeping bags must be marked sanitized.
  if (category.trim() === "Outdoor & Camping" && modes?.rent) {
    const sub = subcategory.trim().toLowerCase();
    const needsHygiene =
      sub === "tents" ||
      sub === "sleeping bags" ||
      sub === "expedition tents" ||
      (values.hygieneChecklistRequired ?? "").trim() === "required";
    if (needsHygiene && (values.hygieneChecklistRequired ?? "").trim() !== "not_required") {
      if ((values.hygieneSanitizedAttested ?? "").trim() !== "attested") return false;
    }
  }


  // Drones: weight class + Remote ID hardware (equipped or valid under-250g exempt).
  if (
    modes?.rent &&
    (category.trim() === "Photo & Video" || category.trim() === "Drones") &&
    (subcategory.trim() === "Drones" || category.trim() === "Drones")
  ) {
    const weight = (values.droneWeightClass ?? "").trim();
    const rid = (values.remoteIdStatus ?? "").trim();
    if (!["under_250g", "250g_to_55lb", "over_55lb"].includes(weight)) return false;
    if (rid !== "broadcast_builtin" && rid !== "broadcast_add_on" && rid !== "rid_exempt_under_250g") return false;
    if (rid === "rid_exempt_under_250g" && weight !== "under_250g") return false;
  }

  // Electronics wipe / unlink for privacy-sensitive shelves.
  if (category.trim() === "Electronics & Tech" && modes?.rent) {
    const wipeSubs = new Set(ELECTRONICS_WIPE_SUBS.map((s) => s.toLowerCase()));
    if (wipeSubs.has(subcategory.trim().toLowerCase())) {
      const wipe = (values.hostDataWipeStatus ?? "").trim();
      if (!["wiped_before_list","wipe_at_handoff","account_unlinked","renter_responsible"].includes(wipe)) return false;
    }
  }

  // Party serving / catering sanitize attest.
  if (category.trim() === "Party & Events" && modes?.rent) {
    const sub = subcategory.trim().toLowerCase();
    if (sub === "serving equipment" || sub === "catering equipment") {
      if ((values.cateringSanitizeAttested ?? "").trim() !== "attested") return false;
    }
  }


  // Cribs & Beds: CPSC / recall / drop-side / mattress / sanitization hard gate.
  if (
    category.trim() === "Baby & Kids" &&
    subcategory.trim() === "Cribs & Beds" &&
    modes?.rent
  ) {
    if ((values.recallAcknowledged ?? "").trim() !== "acknowledged") return false;
    if ((values.dropSideAcknowledged ?? "").trim() !== "no_drop_side") return false;
    if ((values.cpscCompliant ?? "").trim() !== "cpsc_compliant") return false;
    const mattress = (values.mattressIncluded ?? "").trim();
    if (
      mattress !== "firm_mattress_included" &&
      mattress !== "pack_n_play_pad" &&
      mattress !== "mattress_not_included"
    ) {
      return false;
    }
    if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
  }


  if (category.trim() === "Costume & Cosplay" && modes?.rent) {
    const sub = subcategory.trim();
    if (
      sub === "Professional Makeup Kits" ||
      sub === "Wigs & Accessories" ||
      sub === "Masks & Makeup"
    ) {
      if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
    }
  }


<<<<<<< HEAD
  // Bikes & Scooters P0/P1 gates
  if (category.trim() === "Bikes & Scooters" && modes?.rent) {
    const overnight = (values.overnightStorageRule ?? "").trim();
    if (![
      "indoor_only",
      "covered_outdoor_ok",
      "outdoor_locked_ok",
      "must_return_same_day",
      "host_holds_overnight",
    ].includes(overnight)) return false;
    const electric = (values.electric ?? "").trim().toLowerCase();
    const sub = subcategory.trim().toLowerCase();
    const isScooterShelf = sub.includes("scooter");
    const isEBikeShelf = sub === "e-bikes" || sub === "e-bikes pro" || sub.includes("e-bike");
    const isElectricBike = !isScooterShelf && electric !== "no" && (isEBikeShelf || electric === "yes");
    const isElectricScooter = isScooterShelf && electric !== "no";
    if (isElectricBike || isElectricScooter) {
      const age = Number.parseInt((values.minRiderAge ?? "").trim(), 10);
      if (!Number.isFinite(age) || age < 12 || age > 21) return false;
    }
    if (isElectricBike) {
      const klass = (values.eBikeClass ?? "").trim();
      if (!["class_1", "class_2", "class_3", "not_classified"].includes(klass)) return false;
    }
    if (sub === "kids bikes" && (values.helmetPolicy ?? "").trim() === "not_required") return false;
    if (sub === "mountain bikes" || sub === "racing bikes") {
      const waiver = (values.liabilityWaiverRequired ?? "").trim();
      if (waiver !== "required" && waiver !== "not_required") return false;
    }
    if (sub === "cargo bikes") {
      if (![
        "under_50lb", "50_100lb", "100_200lb", "200lb_plus", "unknown_payload",
      ].includes((values.cargoPayloadBand ?? "").trim())) return false;
      if (![
        "no_child_passengers", "child_seat_included", "child_ok_renter_seat", "adult_cargo_only",
      ].includes((values.childPassengerPolicy ?? "").trim())) return false;
    }
    if (sub === "adaptive bikes") {
      if (![
        "handcycle", "tandem", "trike", "recumbent", "wheelchair_attach", "other_adaptive",
      ].includes((values.adaptiveBikeType ?? "").trim())) return false;
    }
  }


=======

  // Boats: hull ID required for powered craft only (kayak/SUP/non-motor inflatable optional).
  if (category.trim() === "Boats & Water" && modes?.rent) {
    const motor = (values.motorIncluded ?? "").trim().toLowerCase();
    const sub = subcategory.trim().toLowerCase();
    const motorSubs = new Set([
      "jet skis", "motorboats", "pontoon boats", "commercial fishing",
      "dive boats", "charter vessels", "fishing boats",
    ]);
    const powered = motorSubs.has(sub) || motor === "yes" || motor === "electric_only";
    if (powered && !(values.hinNumber ?? "").trim()) return false;
  }

>>>>>>> 3012fb2 (Complete Boats & Water P0 gates: age 18 captained, soft HIN, inflatable PFD, hull UI i18n.)

  // Construction Safety Equipment soft vs fall-protection publish rules.
  if (
    category.trim() === "Construction" &&
    subcategory.trim() === "Safety Equipment" &&
    modes?.rent
  ) {
    const tier = (values.ppeRiskTier ?? "").trim();
    if (tier === "fall_protection" || tier === "mixed_kit") {
      const std = (values.ppeStandardRegion ?? "").trim();
      if (
        !["ansi_z89_hard_hat", "en_397_hard_hat", "ansi_z359_fall", "en_361_harness", "other_ppe_standard"].includes(
          std,
        )
      ) {
        return false;
      }
      const insp = (values.ppeInspectionStatus ?? "").trim();
      if (insp !== "inspected_current" && insp !== "tag_visible") return false;
    }
    if (tier === "soft_ppe") {
      const insp = (values.ppeInspectionStatus ?? "").trim();
      if (
        !["not_required_soft_ppe", "inspected_current", "tag_visible"].includes(insp)
      ) {
        return false;
      }
    }
  }

  if (
    category.trim() === "Construction" &&
    modes?.rent &&
    (subcategory.trim() === "Formwork Basic" ||
      subcategory.trim() === "Professional Formwork")
  ) {
    if (!(values.kitInventoryChecklist ?? "").trim()) return false;
  }

  return true;
}
