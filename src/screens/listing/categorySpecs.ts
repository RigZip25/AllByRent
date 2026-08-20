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
const BABY_CONTACT_HYGIENE_SUBS = ["Strollers","Baby Carriers","Toys & Games","Childcare Equipment","Commercial Play Equipment","Group Activity Gear","Educational Tools"] as const;
const BABY_SAFETY_SYSTEM_SUBS = ["Safety Systems"] as const;
const TOY_HAZARD_SUBS = ["Toys & Games"] as const;
const STROLLER_TYPE_SUBS = ["Strollers"] as const;

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
        options: ["under_13", "13_15", "15_17", "17_32", "32_55", "55_plus", "55_65", "65_75", "75_98", "98_plus", "led_cabinet_row", "no_screen"],
      },
      {
        key: "kitInventoryItems",
        type: "multiselect",
        required: true,
        requiredIf: "rent",
        options: ELECTRONICS_KIT_ITEMS,
      },
      { key: "kitInventoryChecklist", type: "text", required: true, requiredIf: "rent" },
      {
        key: "hostDataWipeStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops", "Smart Home Devices", "Network Gear", "Servers & Workstations"],
        options: ["wiped_before_list", "wipe_at_handoff", "account_unlinked", "renter_responsible"],
      },
      {
        key: "hostDataWipeStatus",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear", "Other"],
        options: ["wiped_before_list", "wipe_at_handoff", "account_unlinked", "renter_responsible"],
      },
      {
        key: "deviceHasStorage",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["has_storage", "no_storage", "unknown"],
      },
      {
        key: "gamingHasInternalStorage",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
        options: ["has_internal_storage", "cloud_or_thin_client", "accessories_no_storage"],
      },
      {
        key: "osAdminUnlockPlan",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
        options: ["unlocked_ready", "guest_demo_account", "password_shared_at_handoff", "renter_brings_own_os", "firmware_lock_disclosed"],
      },
      {
        key: "chargerWattageBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
        options: ["under_45w", "45_65w", "65_100w", "100w_plus", "usb_c_pd_shared", "no_charger_included"],
      },
      {
        key: "batteryHealthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
        options: ["excellent_90_plus", "good_80_89", "fair_60_79", "replace_soon_under_60", "unknown_untested"],
      },
      {
        key: "loginDemoAccountNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
      },
      {
        key: "laptopConditionGrade",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
        options: ["like_new", "light_wear", "visible_wear_screen_kb", "functional_imperfections"],
      },
      {
        key: "antivirusAccountUnlinkNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
      },
      {
        key: "returnWipeAckDepth",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Laptops"],
        options: ["host_wipes_on_return", "renter_factory_reset_required", "renter_logout_only", "no_wipe_needed_loaner_image"],
      },
      {
        key: "projectorLumenBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
        options: ["under_500", "500_1500", "1500_3000", "3000_5000", "5000_plus"],
      },
      {
        key: "projectorThrowNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
      },
      {
        key: "projectorInputInventory",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
      },
      {
        key: "projectorScreenStandIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
        options: ["projector_only", "screen_included", "stand_tripod_included", "screen_and_stand", "renter_provides_screen"],
      },
      {
        key: "projectorLightSource",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
        options: ["lamp", "laser", "led", "hybrid_unknown"],
      },
      {
        key: "projectorNativeResBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
        options: ["svga_or_lower", "720p", "1080p", "wuxga_1440p", "4k_uhd", "other_res"],
      },
      {
        key: "projectorUseEnv",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Projectors"],
        options: ["indoor_only", "covered_outdoor_ok", "outdoor_ok_dry", "outdoor_not_allowed"],
      },
      {
        key: "projectorLampHoursNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Projectors"],
      },
      {
        key: "projectorPowerCableLengthBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Projectors"],
        options: ["under_3ft", "3_6ft", "6_10ft", "10_25ft", "25ft_plus_ext", "unknown_length"],
      },
      {
        key: "smartDeviceClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
        options: ["smart_speaker_display", "security_camera", "video_doorbell", "thermostat", "smart_lock", "lighting_kit", "hub_bridge", "sensor_kit", "multi_device_kit", "other_smart_home"],
      },
      {
        key: "hubBridgeStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
        options: ["hub_included", "bridge_included", "renter_must_have_hub", "wifi_only_no_hub", "not_applicable"],
      },
      {
        key: "smartProtocolBand",
        type: "multiselect",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
        options: ["wifi", "thread", "zigbee", "matter", "bluetooth", "zwave", "proprietary_cloud"],
      },
      {
        key: "smartPowerType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
        options: ["plug_in_ac", "battery", "hardwired", "usb_powered", "poe", "mixed_kit"],
      },
      {
        key: "factoryResetNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
      },
      {
        key: "accountReturnPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
        options: ["must_unlink_before_return", "factory_reset_before_return", "host_resets_at_return"],
      },
      {
        key: "cameraPrivacyCover",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Smart Home Devices"],
        options: ["cover_included", "no_cover", "no_camera"],
      },
      {
        key: "installRemovalNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Smart Home Devices"],
      },
      {
        key: "gamingGearSubtype",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
        options: ["console", "pc_gaming", "vr_headset", "handheld", "controllers_accessories"],
      },
      {
        key: "gamingAccountLoginPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
        options: ["guest_or_offline", "host_account_temporary", "renter_own_account", "no_login_needed"],
      },
      {
        key: "controllerCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
        options: ["none_0", "one_1", "two_2", "three_to_four", "five_plus", "not_applicable"],
      },
      {
        key: "gameLibraryIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
        options: ["none_empty", "digital_on_device", "physical_discs_carts", "mixed_digital_physical", "not_applicable"],
      },
      {
        key: "vrHeadsetHygieneNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
      },
      {
        key: "gamingCableHdmiPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Gaming Gear"],
        options: ["hdmi_and_power_included", "hdmi_only_renter_power", "power_only_renter_hdmi", "displayport_included", "renter_provides_all_cables", "not_applicable_wireless"],
      },
      {
        key: "contentAgeRatingNote",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Gaming Gear"],
      },
      {
        key: "speakerFormBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Speakers"],
        options: ["bluetooth_portable", "wired_bookshelf", "party_boombox", "soundbar_home", "smart_speaker", "other_consumer_speaker"],
      },
      {
        key: "speakerPowerBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Speakers"],
        options: ["battery_only", "ac_mains", "battery_and_ac", "usb_powered"],
      },
      {
        key: "speakerWeatherBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Speakers"],
        options: ["indoor_only", "splash_ok", "outdoor_rated", "unknown_weather"],
      },
      {
        key: "neighborVolumeNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Speakers"],
      },
      {
        key: "standMountIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Speakers"],
        options: ["stand_included", "mount_bracket_included", "stand_and_mount", "not_included", "not_applicable"],
      },
      {
        key: "batteryChargeBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Speakers"],
        options: ["full_90_100", "high_70_89", "mid_40_69", "low_under_40", "unknown_charge"],
      },
      {
        key: "chargerIncluded",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Speakers"],
        options: ["included", "renter_provides", "not_applicable"],
      },
      {
        key: "stereoPairNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Speakers"],
      },
      {
        key: "electronicsKitBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["single_device", "multi_piece_kit"],
      },
      {
        key: "devicePowerBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["battery_internal", "usb_powered", "wall_ac_included", "wall_ac_renter", "poe", "passive_no_power"],
      },
      {
        key: "photoConditionChecklist",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["front_ports", "front_ports_flaws", "all_pieces_and_flaws"],
      },
      {
        key: "serverFormFactor",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Servers & Workstations"],
        options: ["tower_workstation", "tower_server", "rack_1u", "rack_2u", "rack_4u_plus", "blade_chassis", "laptop_workstation", "all_in_one_workstation"],
      },
      {
        key: "serverPowerConfig",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Servers & Workstations"],
        options: ["single_psu_120v", "single_psu_240v", "dual_redundant_psu", "pdu_c13_c14_required", "renter_provides_power", "host_confirm_power"],
      },
      {
        key: "ramCapacityBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Servers & Workstations"],
        options: ["under_32gb", "32_64gb", "64_128gb", "128_256gb", "256gb_plus", "host_confirm_ram"],
      },
      {
        key: "cpuClassBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Servers & Workstations"],
        options: ["entry_office", "creator_render", "workstation_pro", "server_xeon_epyc", "gpu_accelerated", "host_confirm_cpu"],
      },
      {
        key: "rackMountKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Servers & Workstations"],
        options: ["rails_included", "rails_not_included", "cage_nuts_only", "sliding_rails_plus_cable_arm", "not_rack_form"],
      },
      {
        key: "networkPortsInventory",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Servers & Workstations"],
      },
      {
        key: "remoteMgmtAccessPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Servers & Workstations"],
        options: ["no_bmc_access", "ipmi_idrac_creds_on_handoff", "idrac_ilo_read_only", "bmc_disabled_before_rent", "renter_must_not_use_bmc"],
      },
      {
        key: "dataWipeDepthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Servers & Workstations"],
        options: ["secure_erase_done", "crypto_erase_done", "os_reinstall_only", "drives_removed", "wipe_at_return_renter"],
      },
      {
        key: "shippingWeightNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Servers & Workstations"],
      },
      {
        key: "noiseHeatEnvironmentNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Servers & Workstations"],
      },
      {
        key: "proAudioGearType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pro Audio"],
        options: ["audio_interface", "analog_mixer", "digital_mixer", "studio_microphone", "studio_monitor_pair", "headphone_amp_dac", "di_box_kit", "field_recorder", "other_pro_audio"],
      },
      {
        key: "phantomPowerSupport",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pro Audio"],
        options: ["phantom_48v_builtin", "phantom_external_needed", "no_phantom", "phantom_not_applicable"],
      },
      {
        key: "proAudioCableLoom",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pro Audio"],
      },
      {
        key: "caseIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pro Audio"],
        options: ["hard_case", "soft_case", "flight_case", "no_case"],
      },
      {
        key: "diBoxIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pro Audio"],
        options: ["di_included", "di_not_included", "di_not_needed"],
      },
      {
        key: "sampleRateBitDepthBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Pro Audio"],
        options: ["up_to_48k_24", "up_to_96k_24", "up_to_192k_24", "analog_only", "unknown_soft"],
      },
      {
        key: "returnFunctionTestAttest",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pro Audio"],
        options: ["host_function_tested", "test_at_handoff", "renter_return_test_required"],
      },
      {
        key: "broadcastDeviceSubtype",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Broadcast Equipment"],
        options: ["video_switcher", "stream_encoder", "recorder_iso", "teleprompter", "capture_card", "confidence_monitor", "control_surface", "other_broadcast"],
      },
      {
        key: "broadcastKitCompleteness",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Broadcast Equipment"],
        options: ["device_only", "device_plus_io_cables", "full_stream_kit", "accessory_only"],
      },
      {
        key: "videoIoInventory",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Broadcast Equipment"],
      },
      {
        key: "powerBatteryPlateBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Broadcast Equipment"],
        options: ["ac_mains_only", "vmount_plate", "gold_mount_plate", "npf_sony_plate", "internal_battery", "mixed_ac_battery", "poe_or_usb_c_pd", "renter_provides_power"],
      },
      {
        key: "captureMediaIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Broadcast Equipment"],
        options: ["no_media_needed", "sd_cf_included", "ssd_included", "renter_provides_media", "mixed_some_included"],
      },
      {
        key: "returnFunctionTestPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Broadcast Equipment"],
        options: ["ports_power_on_test", "loopback_or_preview_ok", "host_tests_at_return", "renter_self_attest_ok", "no_live_test_visual_only"],
      },
      {
        key: "firmwareNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Broadcast Equipment"],
      },
      {
        key: "livestreamPlatformNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Broadcast Equipment"],
      },
      {
        key: "networkGearSubtype",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["router", "switch", "access_point", "firewall", "mesh_system", "modem", "network_other"],
      },
      {
        key: "managedBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["unmanaged", "smart_cloud", "fully_managed", "not_applicable"],
      },
      {
        key: "poeBudgetBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["no_poe", "under_60w", "60_150w", "150_300w", "300w_plus", "poe_not_applicable"],
      },
      {
        key: "configWipeDepth",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["factory_reset_full", "config_cleared_keep_os", "controller_unlinked", "host_reimages", "renter_resets_at_start"],
      },
      {
        key: "credentialsHandoffPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["temp_creds_at_handoff", "factory_defaults_only", "host_configures_remote", "renter_brings_own_creds", "no_creds_needed"],
      },
      {
        key: "rackMountIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["rack_ears_included", "wall_mount_kit", "desktop_only", "pole_mount_kit", "mount_not_applicable"],
      },
      {
        key: "portCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["wireless_only", "under_8", "8_16", "16_24", "24_48", "48_plus"],
      },
      {
        key: "outdoorApRating",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["indoor_only", "outdoor_iprated", "outdoor_not_applicable"],
      },
      {
        key: "renterFactoryRestorePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Network Gear"],
        options: ["renter_restores_factory", "host_restores_after", "leave_config_ok_host_wipes"],
      },
      {
        key: "displayTypeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["flat_panel_lcd", "flat_panel_oled", "led_cabinet_wall", "portable_monitor", "interactive_touch", "other_display"],
      },
      {
        key: "resolutionHdrBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["hd_1080_sdr", "qhd_1440_sdr", "uhd_4k_sdr", "uhd_4k_hdr10", "uhd_4k_hlg", "uhd_8k_or_hdr_mixed", "led_native_map", "other_resolution"],
      },
      {
        key: "brightnessNitBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["under_400_nit", "400_700_nit", "700_1500_nit", "1500_3500_nit", "3500_nit_plus", "not_specified_lcd"],
      },
      {
        key: "mountStandCaseBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["stand_included", "wall_mount_included", "stand_and_mount", "rolling_cart_included", "flight_case_included", "stand_mount_and_case", "none_renter_provides"],
      },
      {
        key: "displayInputInventory",
        type: "multiselect",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["hdmi", "displayport", "sdi", "dvi", "vga", "usb_c_alt", "network_av_nd_i_or_hdbaset", "wireless_cast", "other_input"],
      },
      {
        key: "indoorOutdoorRating",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["indoor_only", "covered_outdoor_ok", "outdoor_rated", "unknown_rating"],
      },
      {
        key: "powerCircuitBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["standard_120v_15a", "120v_20a_dedicated", "208_240v", "led_multi_circuit", "battery_or_inverter", "ask_host_or_multi"],
      },
      {
        key: "powerCircuitNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Display Systems"],
      },
      {
        key: "pixelPitchMmBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Display Systems"],
        options: ["under_1_5_mm", "1_5_2_5_mm", "2_5_4_mm", "4_mm_plus", "not_led_n_a"],
      },
      {
        key: "transportFragilityBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Display Systems"],
        options: ["glass_panel_fragile", "led_cabinet_modular", "flight_cased_rugged", "desktop_monitor_ok", "mixed_fragile"],
      },
    ],
  },

  {
    category: "Home & Kitchen",
    fields: [
      brandField("kitchen", { required: false, recommended: true }),
      {
        key: "model",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: [
          "Coffee Makers",
          "Stand Mixers",
          "Blenders & Juicers",
          "Cleaning Appliances",
          "Commercial Coffee",
          "Industrial Mixers",
          "Food Processors Pro",
          "Beverage Systems",
        ],
      },
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
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: [
          "Coffee Makers",
          "Baking Equipment",
          "Stand Mixers",
          "Blenders & Juicers",
          "Cleaning Appliances",
          "Commercial Coffee",
          "Catering Equipment",
          "Industrial Mixers",
          "Food Processors Pro",
          "Beverage Systems",
          "Other",
        ],
      },
      {
        key: "kitchenReturnCleanPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: [
          "wash_dry_return",
          "rinse_return",
          "host_sanitizes",
          "empty_tank_only",
          "as_received_ok",
        ],
      },
      {
        key: "foodContactSanitizeAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Baking Equipment",
          "Stand Mixers",
          "Blenders & Juicers",
          "Catering Equipment",
          "Industrial Mixers",
          "Food Processors Pro",
          "Beverage Systems",
        ],
        options: ["attested", "not_yet"],
      },
      {
        key: "coffeeMakerType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Coffee Makers"],
        options: [
          "drip",
          "espresso_manual",
          "espresso_semi",
          "pod_capsule",
          "pour_over_kit",
          "cold_brew",
          "combo",
          "other_coffee",
        ],
      },
      {
        key: "waterReservoirBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Coffee Makers"],
        options: [
          "single_cup",
          "under_1l",
          "1_2l",
          "over_2l",
          "plumbed_no_tank",
          "not_applicable",
        ],
      },
      {
        key: "carafeOrBasketType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Coffee Makers"],
        options: [
          "glass_carafe",
          "thermal_carafe",
          "portafilter",
          "pod_only",
          "pour_over_cone",
          "mixed_kit",
          "not_applicable",
        ],
      },
      {
        key: "coffeeFilterPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Coffee Makers"],
        options: [
          "filters_included",
          "reusable_filter",
          "renter_provides_filters",
          "pod_capsules_extra",
          "not_needed",
        ],
      },
      {
        key: "bakingKitType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Baking Equipment"],
        options: [
          "pans_sheets",
          "specialty_mold",
          "decorating_kit",
          "proofing_kit",
          "full_baking_kit",
          "other_baking",
        ],
      },
      {
        key: "bakingPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Baking Equipment"],
        options: ["single_piece", "set_2_5", "set_6_12", "set_13_plus"],
      },
      {
        key: "ovenSafeTempBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Baking Equipment"],
        options: [
          "up_to_350f",
          "up_to_450f",
          "up_to_500f",
          "broiler_safe",
          "not_oven_safe",
          "mixed_kit",
        ],
      },
      {
        key: "bakewareMaterial",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Baking Equipment"],
        options: [
          "aluminized_steel",
          "aluminum",
          "silicone",
          "glass_ceramic",
          "nonstick",
          "mixed_material",
          "other_material",
        ],
      },
      {
        key: "mixerBowlCapacityQt",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stand Mixers"],
        options: [
          "under_4qt",
          "4_5qt",
          "5_6qt",
          "6_7qt",
          "7qt_plus",
          "unknown_bowl",
        ],
      },
      {
        key: "mixerAttachmentKitBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stand Mixers"],
        options: [
          "beater_only",
          "beater_whisk",
          "beater_whisk_dough",
          "full_attachment_kit",
          "bowl_only",
        ],
      },
      {
        key: "mixerPowerWattBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stand Mixers"],
        options: [
          "under_250w",
          "250_400w",
          "400_600w",
          "600w_plus",
          "unknown_watt",
        ],
      },
      {
        key: "mixerTiltOrBowlLift",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stand Mixers"],
        options: ["tilt_head", "bowl_lift", "handheld_stand", "unknown_form"],
      },
      {
        key: "blenderOrJuicerType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Blenders & Juicers"],
        options: [
          "countertop_blender",
          "immersion_blender",
          "personal_blender",
          "centrifugal_juicer",
          "masticating_juicer",
          "combo",
          "other_blend_juice",
        ],
      },
      {
        key: "jarOrPitcherMaterial",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Blenders & Juicers"],
        options: [
          "tritan_plastic",
          "glass_jar",
          "stainless",
          "mixed_material",
          "no_jar_immersion",
          "unknown_material",
        ],
      },
      {
        key: "bladeDiscKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Blenders & Juicers"],
        options: [
          "blade_included",
          "blade_plus_discs",
          "renter_provides",
          "sealed_unit",
          "not_applicable",
        ],
      },
      {
        key: "blendPowerWattBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Blenders & Juicers"],
        options: [
          "under_500w",
          "500_1000w",
          "1000_1500w",
          "1500w_plus",
          "manual_no_motor",
          "unknown_watt",
        ],
      },
      {
        key: "cleaningApplianceType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cleaning Appliances"],
        options: [
          "upright_vac",
          "canister_vac",
          "stick_vac",
          "robot_vac",
          "carpet_cleaner",
          "steam_mop",
          "floor_scrubber",
          "other_cleaning",
        ],
      },
      {
        key: "cleaningPowerSource",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cleaning Appliances"],
        options: ["corded_120v", "cordless_battery", "manual", "robot_dock", "unknown_power"],
      },
      {
        key: "bagOrTankSystem",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cleaning Appliances"],
        options: [
          "bagged",
          "bagless_bin",
          "water_tank",
          "steam_only",
          "mixed_bag_tank",
          "not_applicable",
        ],
      },
      {
        key: "filterIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cleaning Appliances"],
        options: [
          "hepa_included",
          "standard_filter_included",
          "filter_not_included",
          "washable_filter",
          "not_applicable",
        ],
      },
      {
        key: "emptyReturnAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cleaning Appliances"],
        options: ["empty_required", "host_empties", "not_applicable"],
      },
      {
        key: "voltageBand",
        type: "select",
        required: true,
        subcategories: ["Commercial Coffee", "Industrial Mixers", "Food Processors Pro", "Beverage Systems"],
        options: ["120v_corded", "240v", "not_electric"],
      },
      {
        key: "nsfCertified",
        type: "select",
        required: true,
        subcategories: ["Commercial Coffee", "Industrial Mixers", "Food Processors Pro", "Beverage Systems", "Catering Equipment"],
        options: ["nsf_listed", "not_nsf", "unknown"],
      },
      {
        key: "installNeeds",
        type: "select",
        required: true,
        subcategories: ["Commercial Coffee", "Beverage Systems"],
        options: ["countertop_plug", "plumbed_water", "hardwired_240v", "mobile_cart", "other_install"],
      },
      {
        key: "commercialBrewType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Coffee"],
        options: [
          "espresso_1_group",
          "espresso_2_group",
          "espresso_3_plus",
          "batch_brewer",
          "urn",
          "superauto",
          "grinder_only",
          "other_commercial_coffee",
        ],
      },
      {
        key: "waterSoftenerRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Coffee"],
        options: ["required_on_site", "included_inline", "not_required", "unknown"],
      },
      {
        key: "commercialCoffeeServiceClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Coffee"],
        options: [
          "event_day_rental",
          "cafe_weekend",
          "catering_support",
          "demo_display",
          "unknown_class",
        ],
      },
      {
        key: "cateringEquipType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Catering Equipment"],
        options: [
          "chafing_dishes",
          "cambro_insulated",
          "hot_box",
          "prep_tables",
          "serving_ware_kit",
          "full_catering_kit",
          "other_catering",
        ],
      },
      {
        key: "guestServeCapacityBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Catering Equipment"],
        options: [
          "under_25",
          "25_50",
          "50_100",
          "100_200",
          "200_plus",
          "not_rated",
        ],
      },
      {
        key: "heatHoldMethod",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Catering Equipment"],
        options: [
          "sterno_fuel",
          "electric_heat",
          "insulated_passive",
          "cold_hold_only",
          "mixed_heat_hold",
          "not_applicable",
        ],
      },
      {
        key: "cateringPowerNeeds",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Catering Equipment"],
        options: [
          "no_power",
          "120v_outlets",
          "240v_needed",
          "generator_friendly",
          "unknown_power",
        ],
      },
      {
        key: "cateringSanitizeAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Catering Equipment"],
        options: ["attested", "not_yet"],
      },
      {
        key: "industrialMixerBowlQt",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Mixers"],
        options: [
          "under_20qt",
          "20_40qt",
          "40_60qt",
          "60_80qt",
          "80qt_plus",
          "unknown_bowl",
        ],
      },
      {
        key: "industrialMixerStyle",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Mixers"],
        options: [
          "planetary",
          "spiral",
          "vertical_cutter",
          "dough_divider",
          "other_industrial_mixer",
        ],
      },
      {
        key: "industrialPhaseBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Mixers"],
        options: ["single_phase", "three_phase", "not_electric", "unknown_phase"],
      },
      {
        key: "industrialMixerMoveNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Industrial Mixers"],
      },
      {
        key: "processorBowlCapacityBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Food Processors Pro"],
        options: [
          "under_3qt",
          "3_5qt",
          "5_8qt",
          "8qt_plus",
          "continuous_feed",
          "unknown_bowl",
        ],
      },
      {
        key: "processorFeedType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Food Processors Pro"],
        options: [
          "batch_bowl",
          "continuous_feed",
          "combo",
          "vegetable_cutter",
          "other_processor",
        ],
      },
      {
        key: "discBladeKitBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Food Processors Pro"],
        options: [
          "basic_blade",
          "disc_set_3_5",
          "disc_set_6_plus",
          "renter_provides_discs",
          "not_applicable",
        ],
      },
      {
        key: "beverageSystemType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Beverage Systems"],
        options: [
          "kegerator",
          "soda_fountain",
          "juice_dispenser",
          "cold_brew_tower",
          "slushie",
          "water_hydration",
          "other_beverage",
        ],
      },
      {
        key: "beverageGasOrSyrupKit",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Beverage Systems"],
        options: [
          "co2_included",
          "syrup_lines_included",
          "co2_and_syrup",
          "renter_provides",
          "not_needed",
        ],
      },
      {
        key: "beveragePlumbStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Beverage Systems"],
        options: [
          "self_contained",
          "needs_water_line",
          "needs_drain",
          "water_and_drain",
          "unknown_plumb",
        ],
      },
      {
        key: "homeKitchenOtherKind",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: [
          "kind_coffee",
          "kind_baking",
          "kind_mixer",
          "kind_blender_juicer",
          "kind_cleaning",
          "kind_catering",
          "kind_beverage",
          "kind_commercial_foodservice",
          "kind_mixed",
        ],
      },
      {
        key: "homeKitchenPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["single_piece", "multi_piece"],
      },
      {
        key: "photoConditionChecklist",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"],
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
       * Light cars default to 4 at inspection time — do not crowd the listing form.
       * Commercial / ≥26k / semi set this on the commercial transport block (Step3)
       * and optionally here for commercial shelves.
       */
      {
        key: "wheelCount",
        type: "number",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Equipment Trailers", "Commercial Trucks", "Tow Vehicles"],
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
      // ——— Plants ———
      {
        key: "commonNameOrCultivar",
        type: "text",
        required: true,
        subcategories: PLANT_SUBS,
      },
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
        key: "plantHealthGrade",
        type: "select",
        required: true,
        subcategories: PLANT_SUBS,
        options: ["excellent", "good", "fair", "stressed_disclosed"],
      },
      {
        key: "transplantOrReturnPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: PLANT_SUBS,
        options: ["keep_planted_no_return", "return_in_container", "event_rental_return_pot"],
      },
      {
        key: "hardinessZoneBand",
        type: "select",
        required: false,
        recommended: true,
        subcategories: ["Trees", "Shrubs & Bushes", "Perennials", "Seasonal Flowers", "Nursery Stock"],
        options: ["zone_3_5", "zone_5_7", "zone_6_8", "zone_7_9", "zone_8_10", "zone_9_11", "zone_10_13", "indoor_only", "unsure"],
      },
      {
        key: "hardinessZoneBand",
        type: "select",
        required: false,
        recommended: true,
        subcategories: ["Houseplants & Seedlings"],
        options: ["indoor_only", "zone_9_11", "zone_10_13", "unsure"],
      },
      {
        key: "bloomSeason",
        type: "select",
        required: true,
        subcategories: ["Perennials", "Seasonal Flowers"],
        options: BLOOM_SEASONS,
      },
      {
        key: "bloomSeason",
        type: "select",
        required: false,
        recommended: true,
        subcategories: ["Shrubs & Bushes"],
        options: BLOOM_SEASONS,
      },
      {
        key: "waterNeeds",
        type: "select",
        required: true,
        subcategories: PLANT_SUBS,
        options: ["low_water", "medium_water", "high_water"],
      },
      {
        key: "pestDiseaseNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: PLANT_SUBS,
      },
      {
        key: "soilDrainageNotes",
        type: "text",
        required: false,
        recommended: true,
        subcategories: PLANT_SUBS,
      },
      {
        key: "indoorCareNotes",
        type: "text",
        required: false,
        recommended: true,
        subcategories: ["Houseplants & Seedlings"],
      },
      {
        key: "petToxicity",
        type: "select",
        required: false,
        recommended: true,
        subcategories: ["Houseplants & Seedlings"],
        options: ["non_toxic", "mildly_toxic", "toxic_to_pets", "unknown_check_before_rent"],
      },
      // ——— Equipment shared ———
      brandField("gardenEquip", { subcategories: GARDEN_EQUIP_SUBS }),
      {
        key: "model",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Lawn Mowers",
          "Trimmers",
          "Leaf Blowers",
          "Ride-On Mowers",
          "Tillers & Cultivators",
          "Stump Grinders",
          "Landscape Equipment",
        ],
      },
      {
        key: "powerSource",
        type: "select",
        required: true,
        subcategories: GARDEN_EQUIP_SUBS,
        options: ["cordless", "corded", "gas", "manual", "ride_on"],
      },
      {
        key: "fuelType",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: [
          "Lawn Mowers",
          "Trimmers",
          "Leaf Blowers",
          "Ride-On Mowers",
          "Tillers & Cultivators",
          "Stump Grinders",
          "Landscape Equipment",
        ],
        options: ["gasoline", "premix_2stroke", "propane", "diesel", "not_applicable_electric", "other"],
      },
      {
        key: "voltageBand",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers", "Trimmers", "Leaf Blowers", "Tillers & Cultivators"],
        options: VOLTAGE_OPTS,
      },
      // ——— Lawn Mowers ———
      {
        key: "cuttingWidthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers", "Ride-On Mowers", "Trimmers"],
        options: ["under_16in", "16_21in", "21_30in", "30in_plus", "not_applicable"],
      },
      {
        key: "deckDischargeMode",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers", "Ride-On Mowers"],
        options: ["side_discharge", "rear_bag", "mulching", "convertible_3in1", "bagging", "side_and_mulch", "mulch_bagger_combo", "host_sets_at_handoff"],
      },
      {
        key: "baggerMulchKitStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers"],
        options: ["bag_included", "mulch_plug_included", "bag_and_mulch_plug", "neither_disclosed", "not_applicable_side_discharge"],
      },
      {
        key: "bladeConditionBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers", "Ride-On Mowers"],
        options: ["sharp_ready", "recently_sharpened", "usable_worn", "dull_disclosed", "host_sharpens_at_handoff", "unknown_untested"],
      },
      {
        key: "mowerReturnCleanPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers"],
        options: ["return_clean_deck", "rinse_deck_ok", "host_cleans_flat_fee", "as_received_light_grass_ok"],
      },
      {
        key: "mowerFuelReturnPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Lawn Mowers", "Ride-On Mowers"],
        options: ["full_to_full", "host_provides_starting_tank", "renter_buys_own_gas", "return_same_level", "not_applicable_electric"],
      },
      // ——— Trimmers ———
      {
        key: "trimmerHeadType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Trimmers"],
        options: ["string_line_only", "metal_blade_only", "dual_string_and_blade", "interchangeable_heads"],
      },
      {
        key: "harnessIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Trimmers"],
        options: ["full_harness_included", "shoulder_strap_only", "no_harness_renter_provides", "not_needed_light_curved_shaft"],
      },
      {
        key: "trimmerLineBladeCondition",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Trimmers"],
        options: ["new_line_fresh_blade", "good_usable_wear", "worn_host_refills_before_rent", "worn_renter_must_refill"],
      },
      {
        key: "eyeEarPpeExpectation",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Trimmers"],
        options: ["renter_brings_eye_ear", "host_provides_basic_glasses", "not_required_light_duty", "blade_use_eye_ear_required"],
      },
      // ——— Leaf Blowers ———
      {
        key: "blowerFormFactor",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Leaf Blowers"],
        options: ["handheld", "backpack", "walk_behind"],
      },
      {
        key: "airflowBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Leaf Blowers"],
        options: ["under_300_cfm", "300_450_cfm", "450_600_cfm", "600_800_cfm", "800_cfm_plus"],
      },
      {
        key: "mulchVacKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Leaf Blowers"],
        options: ["blower_only", "vac_bag_included", "full_mulch_vac_kit", "vac_attachment_optional"],
      },
      {
        key: "noiseNeighborNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Leaf Blowers"],
      },
      {
        key: "returnCleanNotes",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Leaf Blowers"],
      },
      // ——— Garden Tools ———
      {
        key: "toolSetBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garden Tools"],
        options: ["single_tool", "tool_set"],
      },
      {
        key: "intendedSurface",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garden Tools"],
        options: ["soil", "lawn", "hardscape", "mixed"],
      },
      {
        key: "gardenToolConditionGrade",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garden Tools"],
        options: ["like_new", "light_wear", "visible_wear_rust", "functional_imperfections"],
      },
      {
        key: "returnCleanPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garden Tools"],
        options: ["rinse_brush_dry", "light_mud_ok", "as_used_fair_wear", "host_cleaning_fee"],
      },
      {
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Garden Tools", "Sprinklers", "Irrigation Systems", "Landscape Equipment", "Other"],
      },
      // ——— Sprinklers ———
      {
        key: "coverageAreaBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Sprinklers", "Irrigation Systems"],
        options: ["small_patch", "medium_lawn", "large_lawn", "multi_zone"],
      },
      {
        key: "connectionType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Sprinklers"],
        options: ["hose_thread", "timer", "drip", "quick_connect"],
      },
      {
        key: "timerIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Sprinklers"],
        options: ["timer_included", "timer_not_included", "timer_only", "not_applicable"],
      },
      {
        key: "sprinklerHeadCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Sprinklers"],
        options: ["single_head", "2_3_heads", "4_plus_heads", "drip_lines_kit", "not_applicable"],
      },
      {
        key: "winterizeDrainReturnNotes",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Sprinklers"],
      },
      // ——— Ride-On ———
      {
        key: "hourMeterBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Ride-On Mowers"],
        options: ["under_100h", "100_500h", "500_1500h", "1500_plus", "unknown_no_meter"],
      },
      {
        key: "minOperatorAgeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Ride-On Mowers"],
        options: ["age_16_plus", "age_18_plus", "age_21_plus", "briefing_only_no_age_floor"],
      },
      {
        key: "transportNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Ride-On Mowers", "Tillers & Cultivators", "Stump Grinders", "Landscape Equipment"],
      },
      {
        key: "safetyBriefingRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Ride-On Mowers", "Stump Grinders"],
        options: ["required", "not_required"],
      },
      {
        key: "safetyBriefingConfirmed",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Ride-On Mowers", "Stump Grinders"],
        options: ["briefing_ready", "need_to_prepare"],
      },
      {
        key: "safetyBriefingNotes",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Ride-On Mowers", "Stump Grinders"],
      },
      // ——— Tillers ———
      {
        key: "tillingWidthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Tillers & Cultivators"],
        options: ["under_12in", "12_18in", "18_24in", "24in_plus", "not_applicable"],
      },
      {
        key: "tillDepthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Tillers & Cultivators"],
        options: ["under_6in", "6_8in", "8_10in", "10in_plus", "adjustable_unknown"],
      },
      {
        key: "tineCondition",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Tillers & Cultivators"],
        options: ["new_sharp", "good_slight_wear", "worn_replace_soon", "damaged_note_required", "not_applicable_manual"],
      },
      {
        key: "batteryIncluded",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Tillers & Cultivators"],
        options: ["one_battery_and_charger", "two_batteries_and_charger", "one_battery_no_charger", "platform_only_no_battery", "renter_provides_compatible_battery"],
      },
      // ——— Stump Grinders (P0 + tighten) ———
      {
        key: "stumpCapacityBand",
        type: "select",
        required: true,
        subcategories: ["Stump Grinders"],
        options: ["under_8in", "8_16in", "16_24in", "24in_plus"],
      },
      {
        key: "grindFormFactor",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stump Grinders"],
        options: ["walk_behind", "towable", "self_propelled"],
      },
      {
        key: "chipDischargeNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Stump Grinders"],
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
      // ——— Irrigation ———
      {
        key: "irrigationSystemType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Irrigation Systems"],
        options: ["drip", "sprinkler_zones", "smart_controller", "pump"],
      },
      {
        key: "controllerIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Irrigation Systems"],
        options: ["no_controller", "basic_timer_included", "smart_controller_included", "controller_renter_supplies"],
      },
      {
        key: "installComplexity",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Irrigation Systems"],
        options: ["renter_diy", "host_installs", "pro_only"],
      },
      {
        key: "winterizeNotesSoft",
        type: "text",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Irrigation Systems"],
      },
      // ——— Landscape Equipment ———
      {
        key: "landscapeEquipSubtype",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Landscape Equipment"],
        options: [
          "core_aerator",
          "spike_aerator",
          "power_dethatcher",
          "sod_cutter",
          "broadcast_spreader",
          "drop_spreader",
          "tow_spreader",
          "wheelbarrow_cart",
          "dump_cart",
          "landscape_rake",
          "lawn_roller",
          "landscape_edger",
          "other_landscape",
        ],
      },
      {
        key: "workingWidthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Landscape Equipment"],
        options: ["under_18in", "18_24in", "24_30in", "30in_plus", "not_applicable"],
      },
      {
        key: "hopperCapacityBand",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Landscape Equipment"],
        options: ["under_50lb", "50_100lb", "100_175lb", "175lb_plus", "not_applicable"],
      },
      {
        key: "returnFuelPolicy",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Landscape Equipment"],
        options: ["return_full_tank", "return_same_level", "renter_refills_or_fee", "not_applicable"],
      },
      // ——— Other ———
      {
        key: "gardenOtherKind",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["equipment", "plant", "mixed"],
      },
      {
        key: "gardenPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["single_piece", "multi_piece"],
      },
      {
        key: "photoConditionChecklist",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"],
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
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Keyboards",
          "Portable Speakers",
          "Amplifiers",
          "Mixing Consoles",
          "Studio Monitors",
          "PA Systems",
          "Recording Gear",
        ],
        options: ["under_50w", "50_200w", "200_1000w", "1000w_plus", "passive_unpowered"],
      },
      {
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: [
          "Guitars & Bass",
          "Keyboards",
          "Drums",
          "Portable Speakers",
          "Microphones",
          "Amplifiers",
          "Mixing Consoles",
          "Studio Monitors",
          "PA Systems",
          "Recording Gear",
          "Other",
        ],
      },
      {
        key: "caseIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Guitars & Bass", "Keyboards", "Microphones", "Recording Gear"],
        options: ["hard_case", "soft_gig_bag", "flight_case", "no_case", "case_optional_add_on"],
      },
      {
        key: "guitarInstrumentForm",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Guitars & Bass"],
        options: [
          "acoustic_steel",
          "classical_nylon",
          "solid_body_electric",
          "hollow_semi",
          "bass_4_string",
          "bass_5_plus",
          "acoustic_electric",
          "other_guitar_bass",
        ],
      },
      {
        key: "guitarCableIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Guitars & Bass"],
        options: ["cable_included", "cable_not_included", "instrument_wireless_only", "ask_at_handoff"],
      },
      {
        key: "stringConditionBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Guitars & Bass"],
        options: ["fresh_new", "good_playable", "worn_replace_soon", "unknown_ask_host"],
      },
      {
        key: "keyboardType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Keyboards"],
        options: [
          "digital_piano",
          "synth",
          "midi_controller",
          "organ_stage",
          "workstation",
          "arranger",
          "other_keyboard",
        ],
      },
      {
        key: "keyCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Keyboards"],
        options: ["keys_25", "keys_49", "keys_61", "keys_76", "keys_88", "keys_other"],
      },
      {
        key: "standPedalIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Keyboards"],
        options: [
          "stand_and_pedals",
          "stand_only",
          "pedals_only",
          "neither_renter_provides",
          "built_in_console",
        ],
      },
      {
        key: "drumKitForm",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Drums"],
        options: [
          "acoustic_full_kit",
          "e_kit",
          "snare_only",
          "cymbal_pack",
          "hardware_only",
          "percussion_hand",
          "other_drums",
        ],
      },
      {
        key: "drumPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Drums"],
        options: ["single_piece", "pieces_2_4", "pieces_5_8", "pieces_9_plus", "full_kit_unknown_count"],
      },
      {
        key: "drumHardwareIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Drums"],
        options: [
          "full_hardware_throne_pedals",
          "stands_only",
          "pedals_only",
          "no_hardware",
          "e_kit_module_rack",
        ],
      },
      {
        key: "portableSpeakerForm",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Portable Speakers"],
        options: [
          "bluetooth_party",
          "battery_bluetooth",
          "wired_bookshelf",
          "soundbar",
          "pa_lite_portable",
          "other_portable_speaker",
        ],
      },
      {
        key: "speakerPowerSource",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Portable Speakers"],
        options: ["battery_only", "ac_only", "battery_and_ac", "passive_needs_amp"],
      },
      {
        key: "outdoorSplashBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Portable Speakers"],
        options: ["indoor_only", "covered_patio_ok", "splash_resistant", "unknown_keep_dry"],
      },
      {
        key: "batteryReturnChargeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Portable Speakers"],
        options: [
          "return_full",
          "return_as_received",
          "return_above_50",
          "ac_powered_na",
          "host_sets_at_handoff",
        ],
      },
      {
        key: "micType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Microphones"],
        options: [
          "dynamic_handheld",
          "condenser",
          "wireless_handheld",
          "lavalier",
          "usb_podcast",
          "ribbon",
          "shotgun",
          "other_mic",
        ],
      },
      {
        key: "phantomPowerNeeded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Microphones", "Recording Gear", "Mixing Consoles"],
        options: ["needs_48v", "no_phantom", "optional_48v", "battery_powered_mic", "ask_host"],
      },
      {
        key: "micClipCableIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Microphones"],
        options: ["xlr_and_clip", "cable_only", "clip_only", "wireless_receiver_kit", "none_renter_provides"],
      },
      {
        key: "micHygieneWipePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Microphones"],
        options: [
          "wipe_grille_before_return",
          "host_sanitizes_grille",
          "disposable_cover_required",
          "not_mouth_contact",
        ],
      },
      {
        key: "ampForm",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Amplifiers"],
        options: [
          "guitar_combo",
          "guitar_head",
          "guitar_cab",
          "bass_combo",
          "bass_head_cab",
          "keyboard_amp",
          "power_amp_only",
          "other_amp",
        ],
      },
      {
        key: "ampTubeSolidState",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Amplifiers"],
        options: ["solid_state", "tube", "hybrid", "modeling_digital", "unknown_ask_host"],
      },
      {
        key: "cabIncludedBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Amplifiers"],
        options: ["combo_built_in", "matching_cab_included", "cab_not_included", "head_only", "cab_only_listing"],
      },
      {
        key: "mixerChannelBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Mixing Consoles"],
        options: ["ch_under_8", "ch_8_16", "ch_16_24", "ch_24_32", "ch_32_plus", "digital_scene_mixer"],
      },
      {
        key: "mixerPoweredBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Mixing Consoles"],
        options: ["powered_mixer", "unpowered_needs_speakers", "digital_mixer_stagebox", "ask_host"],
      },
      {
        key: "monitorPairBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Studio Monitors"],
        options: ["single_monitor", "matched_pair", "2_1_with_sub", "surround_set", "ask_host"],
      },
      {
        key: "monitorStandsIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Studio Monitors"],
        options: ["stands_included", "isolation_pads_only", "stands_not_included", "desktop_nearfield_na"],
      },
      {
        key: "paCableStandInventory",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["PA Systems"],
      },
      {
        key: "paSpeakerCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["PA Systems"],
        options: ["pa_1_2", "pa_3_4", "pa_5_8", "pa_9_plus", "line_array_ask_host"],
      },
      {
        key: "paMixerIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["PA Systems"],
        options: ["mixer_included", "mixer_not_included", "powered_speakers_only", "ask_at_handoff"],
      },
      {
        key: "outdoorPaUsePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["PA Systems"],
        options: [
          "indoor_only",
          "covered_outdoor_ok",
          "full_outdoor_weather_risk",
          "host_sets_at_handoff",
        ],
      },
      {
        key: "recordingGearType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Recording Gear"],
        options: [
          "audio_interface",
          "preamp",
          "field_recorder",
          "midi_controller_daw",
          "mic_pre_bundle",
          "outboard_fx",
          "other_recording",
        ],
      },
      {
        key: "recordingIoBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Recording Gear"],
        options: ["io_2in_2out", "io_4_8", "io_8_plus", "usb_simple", "not_an_interface", "ask_host"],
      },
      {
        key: "musicOtherKind",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: [
          "instrument_other",
          "live_sound_other",
          "studio_other",
          "cable_stand_accessory",
          "mixed_music_kit",
          "prefer_named_shelf",
        ],
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
        options: ["under_10lb", "10_25lb", "25_50lb", "50_100lb", "100lb_plus", "bodyweight_only", "adjustable"],
      },
      {
        key: "maxUserWeightBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment", "Commercial Treadmills", "Weight Machines"],
        options: ["up_to_200lb", "up_to_250lb", "up_to_300lb", "300lb_plus", "not_rated"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        options: ["required", "not_required"],
      },
      {
        key: "brand",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment", "Commercial Treadmills", "Weight Machines"],
      },
      {
        key: "model",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment", "Commercial Treadmills", "Weight Machines"],
      },
      {
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Yoga & Pilates", "Resistance Bands", "Free Weights", "Boxing Equipment", "Competition Gear", "Training Systems", "Other", "Recovery Tools"],
      },
      {
        key: "sanitizationAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills", "Weight Machines", "Recovery Tools"],
        options: ["attested", "not_yet"],
      },
      {
        key: "yogaMatThicknessBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Yoga & Pilates"],
        options: ["thin_under_3mm", "standard_3_5mm", "thick_6mm_plus", "travel_foldable", "not_a_mat"],
      },
      {
        key: "yogaMatSurfaceType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Yoga & Pilates"],
        options: ["pvc", "tpe", "natural_rubber", "cork", "cotton_jute", "other_surface", "accessories_only"],
      },
      {
        key: "yogaKitBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Yoga & Pilates"],
        options: ["mat_only", "mat_plus_blocks", "mat_blocks_strap", "pilates_ring_kit", "full_yoga_pilates_kit", "accessories_only"],
      },
      {
        key: "yogaMatLengthSize",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Yoga & Pilates"],
        options: ["short_travel", "standard_68in", "long_72in_plus", "extra_wide", "size_mixed_kit", "not_applicable"],
      },
      {
        key: "yogaHygieneWipePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Yoga & Pilates"],
        options: ["wipe_before_and_after", "wipe_after_only", "host_sanitized_at_handoff", "towel_cover_required"],
      },
      {
        key: "resistanceLevelBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Resistance Bands"],
        options: ["light", "light_medium", "medium", "heavy", "extra_heavy", "mixed_set", "unknown_level"],
      },
      {
        key: "bandKitPieceCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Resistance Bands"],
        options: ["single", "pair", "set_3_5", "set_6_plus"],
      },
      {
        key: "bandMaterialType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Resistance Bands"],
        options: ["latex_loop", "latex_tube", "fabric_loop", "mixed_material", "unknown_material"],
      },
      {
        key: "anchorIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Resistance Bands"],
        options: ["door_anchor_included", "wall_anchor_included", "no_anchor", "anchor_not_needed"],
      },
      {
        key: "bandSnapWearGrade",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Resistance Bands"],
        options: ["new_unused", "light_wear", "visible_wear_ok", "replace_soon_disclosed"],
      },
      {
        key: "recoveryToolType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Recovery Tools"],
        options: ["foam_roller", "massage_gun", "percussion_other", "ice_heat_pack", "massage_ball_set", "mixed_recovery", "other_recovery"],
      },
      {
        key: "recoveryBatteryRuntimeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Recovery Tools"],
        options: ["under_30m", "30_60m", "60m_plus", "corded_ac", "not_powered", "unknown_runtime"],
      },
      {
        key: "recoveryIntensitySpeedBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Recovery Tools"],
        options: ["low", "medium", "high", "multi_speed", "not_a_gun", "unknown_intensity"],
      },
      {
        key: "recoveryNoiseNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Recovery Tools"],
      },
      {
        key: "cardioType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment"],
        options: ["upright_bike", "spin_bike", "recumbent_bike", "elliptical", "rower", "stair_climber", "other_home_cardio"],
      },
      {
        key: "foldableStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment"],
        options: ["folds", "does_not_fold", "partial_fold", "unknown_fold"],
      },
      {
        key: "cardioPowerNeeds",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment"],
        options: ["wall_outlet_110", "wall_outlet_220", "battery_assisted", "self_powered_no_plug", "unknown_power"],
      },
      {
        key: "floorProtectionNotes",
        type: "text",
        required: false,
        recommended: true,
        subcategories: ["Cardio Equipment"],
      },
      {
        key: "footprintNotes",
        type: "text",
        required: false,
        recommended: true,
        subcategories: ["Cardio Equipment"],
      },
      {
        key: "moveInStairsDisclosure",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment"],
        options: ["ground_floor_easy", "stairs_two_person", "elevator_ok", "curbside_only", "host_delivers"],
      },
      {
        key: "cardioHygieneWipePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment"],
        options: ["wipe_before_and_after", "wipe_after_only", "host_sanitized_at_handoff", "towel_cover_required"],
      },
      {
        key: "warrantyNotIncludedNote",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Cardio Equipment"],
        options: ["no_mfr_warranty_transfer", "host_covers_mechanical_only", "as_is_no_repair", "unknown_warranty"],
      },
      {
        key: "freeWeightForm",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Free Weights"],
        options: ["dumbbell_pair", "kettlebell", "barbell", "plates_only", "set_kit", "other_free_weight"],
      },
      {
        key: "freeWeightPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Free Weights"],
        options: ["single", "pair", "set_3_to_8", "set_9_plus"],
      },
      {
        key: "rackStandIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Free Weights"],
        options: ["rack_included", "stand_included", "rack_and_stand", "none_floor_only"],
      },
      {
        key: "weightCoatingType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Free Weights"],
        options: ["rubber_coated", "urethane", "bare_iron", "hex_dumbbell", "mixed_coating", "unknown_coating"],
      },
      {
        key: "floorProtectionRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Free Weights"],
        options: ["mat_required", "mat_recommended", "garage_floor_ok", "outdoor_ok_disclosed"],
      },
      {
        key: "dropPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Free Weights"],
        options: ["no_dropping", "controlled_drop_ok", "bumper_plates_only", "host_rules_in_notes"],
      },
      {
        key: "motorHPBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
        options: ["under_2hp", "2_3hp", "3_4hp", "4hp_plus", "unknown_hp"],
      },
      {
        key: "commercialUseClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
        options: ["commercial_rated", "light_commercial", "home_use_disclosed", "unknown_class"],
      },
      {
        key: "deckLengthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
        options: ["under_55in", "55_60in", "60in_plus", "unknown_deck"],
      },
      {
        key: "inclineCapable",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
        options: ["incline_yes", "incline_no", "incline_unknown"],
      },
      {
        key: "powerVoltage",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
        options: ["110v", "220v", "dedicated_circuit_required", "unknown_voltage"],
      },
      {
        key: "plugAmpBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Commercial Treadmills"],
        options: ["15a", "20a", "30a_plus", "unknown_amps"],
      },
      {
        key: "deliveryAccessNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
      },
      {
        key: "hoursBand",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Commercial Treadmills"],
        options: ["under_100h", "100_500h", "500_2000h", "2000h_plus", "unknown_hours"],
      },
      {
        key: "moveInstallResponsibility",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Treadmills"],
        options: ["host_moves_and_installs", "renter_moves", "third_party_mover", "curbside_pickup_only"],
      },
      {
        key: "machineType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Weight Machines"],
        options: ["selectorized", "cable_crossover", "smith_machine", "plate_loaded", "functional_trainer", "other_machine"],
      },
      {
        key: "resistanceLoadBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Weight Machines"],
        options: ["under_100lb_stack", "100_200lb_stack", "200lb_plus_stack", "plate_loaded_user_plates", "bodyweight_assist", "unknown_load"],
      },
      {
        key: "footprintBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Weight Machines"],
        options: ["compact", "standard_home", "commercial_bay", "unknown_footprint"],
      },
      {
        key: "pinSelectorIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Weight Machines"],
        options: ["pin_included", "pin_missing_disclosed", "plate_loaded_no_pin", "not_applicable"],
      },
      {
        key: "assemblyInstallStatus",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Weight Machines"],
        options: ["assembled_ready", "partial_assembly", "renter_assembles", "host_installs"],
      },
      {
        key: "cableWearDisclosure",
        type: "select",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Weight Machines"],
        options: ["cables_good", "cables_worn_ok", "cables_replace_soon", "not_cable_machine"],
      },
      {
        key: "boxingGearType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Boxing Equipment"],
        options: ["bag", "gloves", "pads", "ring_corner", "mix"],
      },
      {
        key: "gloveSizeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Boxing Equipment"],
        options: ["oz_8_10", "oz_12", "oz_14", "oz_16", "mixed_sizes", "not_gloves"],
      },
      {
        key: "boxingHygienePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Boxing Equipment"],
        options: ["wipe_before_return", "liner_or_wraps_required", "host_sanitizes_between", "renter_supplies_own_gloves", "not_skin_contact"],
      },
      {
        key: "boxingHygieneNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Boxing Equipment"],
      },
      {
        key: "standOrMountIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Boxing Equipment"],
        options: ["stand_included", "ceiling_mount_included", "wall_mount_included", "none_bag_only", "not_applicable"],
      },
      {
        key: "boxingUsePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Boxing Equipment"],
        options: ["bag_only", "pads_drill_only", "sparring_allowed_host_rules", "demo_display_only"],
      },
      {
        key: "sportDisciplineBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Competition Gear"],
        options: ["powerlifting", "olympic_weightlifting", "crossfit_style", "strongman", "other_discipline"],
      },
      {
        key: "federationRuleNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Competition Gear"],
      },
      {
        key: "plateGradeDisclosure",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Competition Gear"],
        options: ["calibrated", "training_plates", "mixed_plates", "bars_only", "unknown_grade"],
      },
      {
        key: "barCertificationSoft",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Competition Gear"],
      },
      {
        key: "trainingSystemType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Training Systems"],
        options: ["suspension_trainer", "functional_trainer", "rack_with_attachments", "smart_mirror_style", "mixed_system", "other_system"],
      },
      {
        key: "anchorInstallRequirements",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Training Systems"],
        options: ["door_anchor", "ceiling_anchor", "wall_mount", "freestanding", "host_installs", "no_anchor_needed"],
      },
      {
        key: "anchorInstallNotes",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: ["Training Systems"],
      },
      {
        key: "maxUsersBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Training Systems"],
        options: ["solo", "duo", "small_group_3_5", "group_6_plus"],
      },
      {
        key: "ceilingClearanceNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Training Systems"],
      },
      {
        key: "trainingWipeHygienePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Training Systems"],
        options: ["wipe_before_and_after", "wipe_after_only", "host_sanitized_at_handoff", "towel_cover_required"],
      },
      {
        key: "gymOtherKind",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["cardio", "weights", "yoga", "recovery", "boxing", "competition", "training", "mixed"],
      },
      {
        key: "gymPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["single_piece", "multi_piece"],
      },
      {
        key: "photoConditionChecklist",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"],
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
        key: "strollerType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: STROLLER_TYPE_SUBS,
        options: ["travel_system","umbrella","jogger","double","wagon","other_stroller"],
      },
      {
        key: "toyHazardBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: TOY_HAZARD_SUBS,
        options: ["ages_0_plus_no_small_parts","ages_3_plus","ages_8_plus","not_a_toy"],
      },
      {
        key: "carSeatExpiryDate",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: CAR_SEAT_SAFETY_SUBS,
      },
      {
        key: "carSeatStandardRegion",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: CAR_SEAT_SAFETY_SUBS,
        options: ["fmvss_us","ece_r129","ece_r44","other_regional"],
      },
      {
        key: "recallAcknowledged",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [...CAR_SEAT_SAFETY_SUBS, ...CRIB_SAFETY_SUBS, ...BABY_CONTACT_HYGIENE_SUBS],
        options: ["acknowledged", "not_checked"],
      },
      {
        key: "sanitizationAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [...CAR_SEAT_SAFETY_SUBS, ...CRIB_SAFETY_SUBS, ...BABY_CONTACT_HYGIENE_SUBS],
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
        options: ["cpsc_compliant", "en_716_eu", "other_regional_standard", "need_to_verify"],
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
      {
        key: "safetyInstallAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: BABY_SAFETY_SYSTEM_SUBS,
        options: ["install_documented","renter_installs_with_guide","professionally_installed"],
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
      {
        key: "kitInventoryChecklist",
        type: "text",
        required: false,
        requiredIf: "rent",
        recommended: true,
        subcategories: [
          "Generators",
          "Air Compressors",
          "Pressure Washers",
          "Winches",
          "Pumps",
          "Industrial Generators",
          "Industrial Compressors",
          "Hydraulic Equipment",
          "Heavy Pumps",
          "Other",
        ],
      },
      {
        key: "generatorPhaseBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Generators", "Industrial Generators"],
        options: ["single_phase", "split_phase", "three_phase", "inverter_portable"],
      },
      {
        key: "generatorStartingMethod",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Generators", "Industrial Generators"],
        options: ["pull_recoil", "electric_start", "remote_start", "auto_transfer"],
      },
      {
        key: "generatorRuntimeHoursBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Generators", "Industrial Generators"],
        options: ["under_4h", "4_8h", "8_12h", "12h_plus", "continuous_standby", "unknown_runtime"],
      },
      {
        key: "transferSwitchIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Generators", "Industrial Generators"],
        options: ["included", "not_included", "renter_provides", "n_a_portable"],
      },
      {
        key: "generatorNoiseDbBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Generators", "Industrial Generators"],
        options: ["under_60db", "60_70db", "70_80db", "80db_plus", "unknown_noise"],
      },
      {
        key: "generatorDutyClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Generators"],
        options: ["standby", "prime", "continuous", "rental_fleet"],
      },
      {
        key: "generatorMountForm",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Generators"],
        options: ["skid", "trailer_mounted", "containerized", "pad_stationary", "portable_frame"],
      },
      {
        key: "groundingBondingNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Generators"],
      },
      {
        key: "compressorCfmBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Air Compressors", "Industrial Compressors"],
        options: ["under_5cfm", "5_10cfm", "10_20cfm", "20_50cfm", "50cfm_plus", "unknown_cfm"],
      },
      {
        key: "tankSizeGalBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Air Compressors", "Industrial Compressors"],
        options: ["tankless", "under_10gal", "10_30gal", "30_60gal", "60_120gal", "120gal_plus"],
      },
      {
        key: "maxPsiBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Air Compressors", "Industrial Compressors"],
        options: ["under_100psi", "100_150psi", "150_200psi", "200psi_plus", "unknown_psi"],
      },
      {
        key: "compressorDriveType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Air Compressors", "Industrial Compressors"],
        options: ["electric_portable", "gas_wheelbarrow", "diesel", "tractor_pto", "electric_stationary", "unknown_drive"],
      },
      {
        key: "hoseCouplerKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Air Compressors", "Industrial Compressors"],
        options: ["full_hose_kit", "partial_kit", "couplers_only", "none_renter_provides"],
      },
      {
        key: "compressorDutyClass",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Compressors"],
        options: ["intermittent", "continuous", "industrial_plant"],
      },
      {
        key: "airDryerIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Industrial Compressors"],
        options: ["included", "not_included", "n_a"],
      },
      {
        key: "washerPsiBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pressure Washers"],
        options: ["under_1500psi", "1500_2500psi", "2500_3500psi", "3500psi_plus", "unknown_psi"],
      },
      {
        key: "washerGpmBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pressure Washers"],
        options: ["under_2gpm", "2_3gpm", "3_4gpm", "4gpm_plus", "unknown_gpm"],
      },
      {
        key: "washerPowerSource",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pressure Washers"],
        options: ["electric", "gas", "hot_water_diesel", "unknown_power"],
      },
      {
        key: "wandNozzleKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pressure Washers"],
        options: ["full_kit", "partial_kit", "wand_only", "none"],
      },
      {
        key: "surfaceUsePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pressure Washers"],
        options: ["soft_siding_ok", "hardscape_only", "vehicles_ok", "no_delicate_surfaces", "host_rules_in_notes"],
      },
      {
        key: "winchCapacityLbsBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Winches"],
        options: ["under_2000lb", "2000_5000lb", "5000_10000lb", "10000lb_plus", "unknown_capacity"],
      },
      {
        key: "winchMountType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Winches"],
        options: ["portable", "bumper_mounted", "trailer_mounted", "recovery_kit", "other_mount"],
      },
      {
        key: "winchLineType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Winches"],
        options: ["steel_cable", "synthetic_rope", "mixed_line", "unknown_line"],
      },
      {
        key: "winchRemoteIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Winches"],
        options: ["wired_remote", "wireless_remote", "none"],
      },
      {
        key: "snatchBlockIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Winches"],
        options: ["included", "not_included", "n_a"],
      },
      {
        key: "pumpTypeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pumps", "Heavy Pumps"],
        options: ["trash", "transfer", "submersible", "diaphragm", "centrifugal", "other_pump"],
      },
      {
        key: "pumpFlowGpmBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pumps", "Heavy Pumps"],
        options: ["under_50gpm", "50_150gpm", "150_500gpm", "500gpm_plus", "unknown_flow"],
      },
      {
        key: "inletOutletSizeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pumps", "Heavy Pumps"],
        options: ["under_2in", "2in", "3in", "4in_plus", "mixed_sizes"],
      },
      {
        key: "solidsHandlingBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pumps", "Heavy Pumps"],
        options: ["clean_water", "semi_solids", "trash_solids", "chemicals_disclosed", "unknown_solids"],
      },
      {
        key: "hoseKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Pumps", "Heavy Pumps"],
        options: ["suction_and_discharge", "suction_only", "discharge_only", "partial", "none"],
      },
      {
        key: "pumpPrimingMethod",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Heavy Pumps"],
        options: ["self_prime", "manual_prime", "submersible_n_a", "unknown_prime"],
      },
      {
        key: "forkliftClassBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Forklifts"],
        options: ["class_1_electric", "class_2_narrow", "class_3_pallet", "class_4_cushion", "class_5_pneumatic", "other_class"],
      },
      {
        key: "liftCapacityLbsBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Forklifts"],
        options: ["under_3000lb", "3000_5000lb", "5000_8000lb", "8000lb_plus", "unknown_capacity"],
      },
      {
        key: "mastHeightBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Forklifts"],
        options: ["under_10ft", "10_15ft", "15_20ft", "20ft_plus", "unknown_mast"],
      },
      {
        key: "forkliftTireType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Forklifts"],
        options: ["cushion", "pneumatic", "solid", "dual"],
      },
      {
        key: "forkliftFuelOrBattery",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Forklifts"],
        options: ["lpg", "diesel", "electric_lead_acid", "electric_lithium", "dual_fuel", "other_power"],
      },
      {
        key: "operatorManualIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Forklifts"],
        options: ["included", "digital_only", "not_included"],
      },
      {
        key: "hydraulicFunctionBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Hydraulic Equipment"],
        options: ["power_unit", "cylinder_kit", "breaker", "spreader", "other_hydraulic"],
      },
      {
        key: "hydraulicPressurePsiBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Hydraulic Equipment"],
        options: ["under_2000psi", "2000_3000psi", "3000_5000psi", "5000psi_plus", "unknown_pressure"],
      },
      {
        key: "hydraulicFlowGpmBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Hydraulic Equipment"],
        options: ["under_5gpm", "5_15gpm", "15_30gpm", "30gpm_plus", "unknown_flow"],
      },
      {
        key: "hydraulicCouplerType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Hydraulic Equipment"],
        options: ["iso_a", "iso_b", "flat_face", "mixed_couplers", "unknown_coupler"],
      },
      {
        key: "hoseWhipKitIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Hydraulic Equipment"],
        options: ["included", "partial", "none"],
      },
      {
        key: "heavyOtherKind",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["generator", "compressor", "washer", "winch", "pump", "forklift", "hydraulic", "mixed"],
      },
      {
        key: "heavyPieceBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["single_piece", "multi_piece"],
      },
      {
        key: "photoConditionChecklist",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"],
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
        required: true,
        requiredIf: "rent",
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
        key: "characterLabel",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Character Costumes"],
      },
      {
        key: "costumeCompleteness",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Halloween Costumes",
          "Character Costumes",
          "Theater Costumes",
          "Period Costumes",
          "Full Character Suits",
          "Other",
        ],
        options: ["full_set", "partial_set", "accessory_only"],
      },
      {
        key: "audienceAgeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Halloween Costumes"],
        options: ["kids_only", "adult_only", "all_ages"],
      },
      {
        key: "glitterSmokePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Halloween Costumes", "Character Costumes"],
        options: [
          "glitter_ok",
          "no_glitter",
          "no_smoke_fog",
          "glitter_and_smoke_banned",
        ],
      },
      {
        key: "periodEraBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Period Costumes"],
        options: [
          "ancient_classical",
          "medieval_renaissance",
          "18th_19th",
          "early_20th",
          "mid_late_20th",
          "fantasy_other_era",
        ],
      },
      {
        key: "alterationPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Period Costumes", "Theater Costumes", "Character Costumes"],
        options: ["no_alterations", "pins_only", "tailor_ok_with_approval"],
      },
      {
        key: "wigFiberBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Wigs & Accessories"],
        options: ["synthetic", "human_hair", "fiber_blend", "lace_front", "unknown_fiber"],
      },
      {
        key: "wigCapSizeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Wigs & Accessories"],
        options: ["cap_petite", "cap_average", "cap_large", "cap_one_size"],
      },
      {
        key: "styleResetPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Wigs & Accessories"],
        options: ["return_styled", "reset_ok", "wash_cap_only"],
      },
      {
        key: "cosmeticsSealedBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Masks & Makeup", "Professional Makeup Kits"],
        options: ["sealed_only", "mixed_sealed_open", "open_shared"],
      },
      {
        key: "maskContactType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Masks & Makeup"],
        options: ["hard_mask", "foam_latex", "soft_fabric", "makeup_only", "mixed_contact"],
      },
      {
        key: "brushCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Professional Makeup Kits"],
        options: ["brushes_under_10", "brushes_10_25", "brushes_25_50", "brushes_50_plus"],
      },
      {
        key: "propRoleBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Film & TV Props"],
        options: ["hero_prop", "background_prop", "set_dressing", "mixed_prop_role"],
      },
      {
        key: "fragileHandling",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Film & TV Props", "Animatronic Props"],
        options: ["standard_care", "fragile_two_hand", "do_not_ship_loose"],
      },
      {
        key: "looksafePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Film & TV Props"],
        options: ["replica_looksafe", "inert_prop", "not_a_weapon_prop"],
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
        key: "kitInventoryChecklist",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Halloween Costumes",
          "Character Costumes",
          "Period Costumes",
          "Masks & Makeup",
          "Theater Costumes",
          "Film & TV Props",
          "Professional Makeup Kits",
          "Full Character Suits",
          "Other",
        ],
      },
      {
        key: "animatronicPower",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Animatronic Props"],
        options: ["battery", "wall_ac", "compressed_air", "none_static"],
      },
      {
        key: "runtimeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Animatronic Props"],
        options: ["runtime_under_30m", "runtime_30_120m", "runtime_continuous_plug", "runtime_unknown"],
      },
      {
        key: "useEnvironment",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Animatronic Props"],
        options: ["indoor_only", "outdoor_ok", "weather_sensitive"],
      },
      {
        key: "operatorNotes",
        type: "text",
        required: true,
        requiredIf: "rent",
        subcategories: ["Animatronic Props"],
      },
      {
        key: "liabilityWaiverRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Animatronic Props", "Full Character Suits"],
        options: ["required", "not_required"],
      },
      {
        key: "heatVisibilityAttested",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Full Character Suits"],
        options: ["attested", "not_yet"],
      },
      {
        key: "maxWearMinutesBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Full Character Suits"],
        options: ["wear_under_15", "wear_15_30", "wear_30_45", "wear_host_guided"],
      },
      {
        key: "spotterRequired",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Full Character Suits"],
        options: ["spotter_required", "spotter_recommended", "spotter_not_required"],
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
          "Full Character Suits",
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
        required: true,
        requiredIf: "rent",
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
      {
        key: "checkInWindowBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Rooms & Spaces"],
        options: [
          "flexible_day",
          "afternoon_3_6",
          "evening_6_9",
          "strict_window",
          "by_appointment",
        ],
      },
      {
        key: "overnightAllowed",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Rooms & Spaces"],
        options: ["overnight_ok", "day_use_only", "host_approval"],
      },
      {
        key: "bathroomAccess",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Rooms & Spaces", "Backyard & Outdoor", "Shared Offices"],
        options: [
          "private_bath",
          "shared_bath",
          "half_bath_only",
          "no_bath_on_site",
          "portable_nearby",
        ],
      },
      {
        key: "quietHoursBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Rooms & Spaces", "Backyard & Outdoor", "Event Venues"],
        options: [
          "quiet_10pm",
          "quiet_11pm",
          "quiet_midnight",
          "no_formal_quiet",
          "building_rules",
        ],
      },
      {
        key: "clearanceHeightBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garages & Storage", "Warehouse & Storage"],
        options: [
          "under_7ft",
          "7_8ft",
          "8_10ft",
          "10_14ft",
          "14ft_plus",
          "unknown_clearance",
        ],
      },
      {
        key: "doorWidthBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garages & Storage", "Warehouse & Storage"],
        options: [
          "under_8ft",
          "8_9ft",
          "9_10ft",
          "10_12ft",
          "12ft_plus",
          "personnel_door_only",
        ],
      },
      {
        key: "climateControl",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garages & Storage", "Warehouse & Storage"],
        options: [
          "climate_controlled",
          "heated_only",
          "cooled_only",
          "ambient_unconditioned",
          "unknown_climate",
        ],
      },
      {
        key: "accessHoursBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: [
          "Garages & Storage",
          "Parking Spots",
          "Shared Offices",
          "Warehouse & Storage",
          "Retail Space",
          "Commercial Space",
        ],
        options: [
          "24_7_access",
          "business_hours",
          "extended_early_late",
          "by_appointment_only",
          "host_schedule",
        ],
      },
      {
        key: "storageUsePolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Garages & Storage"],
        options: [
          "household_goods_ok",
          "vehicle_only",
          "no_hazmat",
          "no_food_perishables",
          "host_sets_list",
        ],
      },
      {
        key: "parkingSpotType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Parking Spots"],
        options: [
          "open_lot",
          "covered_carport",
          "garage_stall",
          "driveway",
          "street_permit_zone",
        ],
      },
      {
        key: "vehicleSizeFit",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Parking Spots"],
        options: [
          "compact_only",
          "sedan_suv",
          "fullsize_truck",
          "van_sprinter",
          "oversized_ask",
        ],
      },
      {
        key: "evCharging",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Parking Spots"],
        options: [
          "ev_level2_included",
          "ev_outlet_shared",
          "no_ev",
          "renter_brings_cord",
        ],
      },
      {
        key: "overnightParking",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Parking Spots"],
        options: ["overnight_ok", "day_only", "host_approval"],
      },
      {
        key: "deskSeatCountBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Shared Offices"],
        options: ["1_desk", "2_4_desks", "5_10_desks", "11_plus_desks", "hot_desk_flex"],
      },
      {
        key: "meetingRoomAccess",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Shared Offices", "Commercial Space"],
        options: [
          "meeting_included",
          "bookable_extra",
          "none_on_site",
          "open_collaboration_only",
        ],
      },
      {
        key: "monitorKitIncluded",
        type: "select",
        required: false,
        recommended: true,
        requiredIf: "rent",
        subcategories: ["Shared Offices"],
        options: [
          "monitor_dock_included",
          "monitor_only",
          "renter_brings_gear",
          "none_on_site",
        ],
      },
      {
        key: "outdoorPowerWater",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Backyard & Outdoor"],
        options: [
          "power_and_water",
          "power_only",
          "water_only",
          "neither",
          "ask_host",
        ],
      },
      {
        key: "noiseCurfewBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Backyard & Outdoor", "Event Venues"],
        options: [
          "music_ok_to_curfew",
          "amplified_banned",
          "quiet_gathering_only",
          "building_hoa_rules",
          "host_sets_curfew",
        ],
      },
      {
        key: "weatherPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Backyard & Outdoor"],
        options: [
          "rain_or_shine",
          "covered_area_backup",
          "cancel_reschedule_weather",
          "host_decision_day_of",
        ],
      },
      {
        key: "spaceKindBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Other"],
        options: [
          "room_like",
          "parking_or_storage",
          "office_like",
          "outdoor_yard",
          "venue_or_studio",
          "warehouse_retail",
          "mixed_other",
        ],
      },
      {
        key: "permittedUseBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Space"],
        options: [
          "office_admin",
          "light_production",
          "client_meetings",
          "pop_up_soft",
          "host_listed_uses",
        ],
      },
      {
        key: "loadInAccess",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Commercial Space", "Event Venues", "Warehouse & Storage", "Retail Space"],
        options: [
          "ground_floor_easy",
          "freight_elevator",
          "stairs_only",
          "loading_dock",
          "curbside_carry",
        ],
      },
      {
        key: "eventTypeAllowed",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Event Venues"],
        options: [
          "meetings_only",
          "social_parties",
          "weddings_formal",
          "film_photo",
          "mixed_host_rules",
        ],
      },
      {
        key: "alcoholPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Event Venues"],
        options: [
          "alcohol_ok_byob",
          "alcohol_ok_licensed_caterer",
          "no_alcohol",
          "host_approval",
        ],
      },
      {
        key: "avKitchenIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Event Venues"],
        options: [
          "av_and_kitchen",
          "av_only",
          "kitchen_only",
          "neither_empty_room",
          "partial_ask",
        ],
      },
      {
        key: "studioTypeBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Studio Space"],
        options: [
          "photo_studio",
          "video_cinema",
          "podcast_audio",
          "rehearsal_dance",
          "mixed_content",
        ],
      },
      {
        key: "powerAmpBand",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Studio Space"],
        options: [
          "household_circuits",
          "20a_plus_dedicated",
          "three_phase_available",
          "battery_or_generator_only",
          "ask_host_load",
        ],
      },
      {
        key: "soundTreatment",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Studio Space"],
        options: [
          "treated_quiet",
          "partial_treatment",
          "live_room_echo",
          "not_soundproof",
        ],
      },
      {
        key: "cycGridIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Studio Space"],
        options: [
          "cyc_and_grid",
          "cyc_only",
          "grid_pipe_only",
          "empty_room",
          "partial_backdrop",
        ],
      },
      {
        key: "dockAccess",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Warehouse & Storage"],
        options: [
          "dock_high",
          "dock_low",
          "drive_in_bay",
          "no_dock_ground",
          "shared_dock_schedule",
        ],
      },
      {
        key: "forkliftPolicy",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Warehouse & Storage"],
        options: [
          "forklift_included_op",
          "forklift_renter_certified",
          "no_forklift",
          "pallet_jack_only",
        ],
      },
      {
        key: "storefrontType",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Retail Space"],
        options: [
          "street_storefront",
          "mall_inline",
          "kiosk_popup",
          "interior_suite",
          "shared_market_stall",
        ],
      },
      {
        key: "fixtureIncluded",
        type: "select",
        required: true,
        requiredIf: "rent",
        subcategories: ["Retail Space"],
        options: [
          "fixtures_included",
          "shelving_only",
          "empty_vanilla",
          "partial_ask",
        ],
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
    if (
      !["fmvss_us", "ece_r129", "ece_r44", "other_regional"].includes(
        (values.carSeatStandardRegion ?? "").trim(),
      )
    ) {
      return false;
    }
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


  // Garden & Yard P0 gates by shelf.
  if (category.trim() === "Garden & Yard" && modes?.rent) {
    const sub = subcategory.trim();
    const power = (values.powerSource ?? "").trim();
    const reqSelect = (key: string, allowed: string[]) => allowed.includes((values[key] ?? "").trim());
    const reqText = (key: string, min = 3) => (values[key] ?? "").trim().length >= min;
    const plantSubs = new Set([
      "Trees",
      "Shrubs & Bushes",
      "Perennials",
      "Seasonal Flowers",
      "Houseplants & Seedlings",
      "Nursery Stock",
    ]);
    if (plantSubs.has(sub)) {
      if (!reqText("commonNameOrCultivar")) return false;
      if (!reqSelect("plantHealthGrade", ["excellent", "good", "fair", "stressed_disclosed"])) return false;
      if (!reqSelect("transplantOrReturnPolicy", ["keep_planted_no_return", "return_in_container", "event_rental_return_pot"])) return false;
      if (!reqText("pestDiseaseNotes")) return false;
      if (!reqSelect("waterNeeds", ["low_water", "medium_water", "high_water"])) return false;
      if ((sub === "Perennials" || sub === "Seasonal Flowers") && !(values.bloomSeason ?? "").trim()) return false;
    }
    if (sub === "Lawn Mowers") {
      if (!reqText("model")) return false;
      if (!reqSelect("cuttingWidthBand", ["under_16in", "16_21in", "21_30in", "30in_plus", "not_applicable"])) return false;
      if (!reqSelect("deckDischargeMode", ["side_discharge", "rear_bag", "mulching", "convertible_3in1", "bagging", "side_and_mulch", "mulch_bagger_combo", "host_sets_at_handoff"])) return false;
      if (!reqSelect("baggerMulchKitStatus", ["bag_included", "mulch_plug_included", "bag_and_mulch_plug", "neither_disclosed", "not_applicable_side_discharge"])) return false;
      if (!reqSelect("bladeConditionBand", ["sharp_ready", "recently_sharpened", "usable_worn", "dull_disclosed", "host_sharpens_at_handoff", "unknown_untested"])) return false;
      if (!reqSelect("mowerReturnCleanPolicy", ["return_clean_deck", "rinse_deck_ok", "host_cleans_flat_fee", "as_received_light_grass_ok"])) return false;
      if (power === "gas") {
        if (!reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
        if (!reqSelect("mowerFuelReturnPolicy", ["full_to_full", "host_provides_starting_tank", "renter_buys_own_gas", "return_same_level"])) return false;
      }
      if (power === "cordless" && !reqSelect("voltageBand", ["12v", "18v_20v", "40v", "60v_plus", "120v_corded", "240v", "not_electric"])) return false;
    }
    if (sub === "Trimmers") {
      if (!reqText("model")) return false;
      if (!reqSelect("cuttingWidthBand", ["under_16in", "16_21in", "21_30in", "30in_plus", "not_applicable"])) return false;
      if (!reqSelect("trimmerHeadType", ["string_line_only", "metal_blade_only", "dual_string_and_blade", "interchangeable_heads"])) return false;
      if (!reqSelect("harnessIncluded", ["full_harness_included", "shoulder_strap_only", "no_harness_renter_provides", "not_needed_light_curved_shaft"])) return false;
      if (!reqSelect("trimmerLineBladeCondition", ["new_line_fresh_blade", "good_usable_wear", "worn_host_refills_before_rent", "worn_renter_must_refill"])) return false;
      if (!reqSelect("eyeEarPpeExpectation", ["renter_brings_eye_ear", "host_provides_basic_glasses", "not_required_light_duty", "blade_use_eye_ear_required"])) return false;
      if (power === "gas" && !reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
      if (power === "cordless" && !reqSelect("voltageBand", ["12v", "18v_20v", "40v", "60v_plus", "120v_corded", "240v", "not_electric"])) return false;
    }
    if (sub === "Leaf Blowers") {
      if (!reqText("model")) return false;
      if (!reqSelect("blowerFormFactor", ["handheld", "backpack", "walk_behind"])) return false;
      if (!reqSelect("airflowBand", ["under_300_cfm", "300_450_cfm", "450_600_cfm", "600_800_cfm", "800_cfm_plus"])) return false;
      if (!reqSelect("mulchVacKitIncluded", ["blower_only", "vac_bag_included", "full_mulch_vac_kit", "vac_attachment_optional"])) return false;
      if (!reqText("noiseNeighborNotes")) return false;
      if (power === "gas" && !reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
      if (power === "cordless" && !reqSelect("voltageBand", ["12v", "18v_20v", "40v", "60v_plus", "120v_corded", "240v", "not_electric"])) return false;
    }
    if (sub === "Garden Tools") {
      if (!reqSelect("toolSetBand", ["single_tool", "tool_set"])) return false;
      if (!reqSelect("intendedSurface", ["soil", "lawn", "hardscape", "mixed"])) return false;
      if (!reqSelect("gardenToolConditionGrade", ["like_new", "light_wear", "visible_wear_rust", "functional_imperfections"])) return false;
      if (!reqSelect("returnCleanPolicy", ["rinse_brush_dry", "light_mud_ok", "as_used_fair_wear", "host_cleaning_fee"])) return false;
      if ((values.toolSetBand ?? "").trim() === "tool_set" && !reqText("kitInventoryChecklist", 8)) return false;
    }
    if (sub === "Sprinklers") {
      if (!reqSelect("coverageAreaBand", ["small_patch", "medium_lawn", "large_lawn", "multi_zone"])) return false;
      if (!reqSelect("connectionType", ["hose_thread", "timer", "drip", "quick_connect"])) return false;
      if (!reqSelect("timerIncluded", ["timer_included", "timer_not_included", "timer_only", "not_applicable"])) return false;
      if (!reqSelect("sprinklerHeadCountBand", ["single_head", "2_3_heads", "4_plus_heads", "drip_lines_kit", "not_applicable"])) return false;
      const heads = (values.sprinklerHeadCountBand ?? "").trim();
      if ((heads === "2_3_heads" || heads === "4_plus_heads" || heads === "drip_lines_kit") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Ride-On Mowers") {
      if (!reqText("model")) return false;
      if (!reqSelect("cuttingWidthBand", ["under_16in", "16_21in", "21_30in", "30in_plus", "not_applicable"])) return false;
      if (!reqSelect("deckDischargeMode", ["side_discharge", "rear_bag", "mulching", "convertible_3in1", "bagging", "side_and_mulch", "mulch_bagger_combo", "host_sets_at_handoff"])) return false;
      if (!reqSelect("bladeConditionBand", ["sharp_ready", "recently_sharpened", "usable_worn", "dull_disclosed", "host_sharpens_at_handoff", "unknown_untested"])) return false;
      if (!reqSelect("hourMeterBand", ["under_100h", "100_500h", "500_1500h", "1500_plus", "unknown_no_meter"])) return false;
      if (!reqSelect("minOperatorAgeBand", ["age_16_plus", "age_18_plus", "age_21_plus", "briefing_only_no_age_floor"])) return false;
      if (!reqText("transportNotes")) return false;
      if (power === "gas" || power === "ride_on") {
        if (!reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
        if (!reqSelect("mowerFuelReturnPolicy", ["full_to_full", "host_provides_starting_tank", "renter_buys_own_gas", "return_same_level", "not_applicable_electric"])) return false;
      }
      if ((values.safetyBriefingRequired ?? "").trim() !== "not_required") {
        if ((values.safetyBriefingConfirmed ?? "").trim() !== "briefing_ready") return false;
      }
    }
    if (sub === "Tillers & Cultivators") {
      if (!reqText("model")) return false;
      if (!reqSelect("tillingWidthBand", ["under_12in", "12_18in", "18_24in", "24in_plus", "not_applicable"])) return false;
      if (!reqSelect("tillDepthBand", ["under_6in", "6_8in", "8_10in", "10in_plus", "adjustable_unknown"])) return false;
      if (!reqSelect("tineCondition", ["new_sharp", "good_slight_wear", "worn_replace_soon", "damaged_note_required", "not_applicable_manual"])) return false;
      if (!reqText("transportNotes")) return false;
      if (power === "gas" && !reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
      if (power === "cordless" && !reqSelect("voltageBand", ["12v", "18v_20v", "40v", "60v_plus", "120v_corded", "240v", "not_electric"])) return false;
    }
    if (sub === "Stump Grinders") {
      if (!reqText("model")) return false;
      if (!reqSelect("grindFormFactor", ["walk_behind", "towable", "self_propelled"])) return false;
      if (!reqText("chipDischargeNotes")) return false;
      if (!reqText("transportNotes")) return false;
      if (power === "gas" && !reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
      if ((values.safetyBriefingRequired ?? "").trim() !== "not_required") {
        if ((values.safetyBriefingConfirmed ?? "").trim() !== "briefing_ready") return false;
      }
    }
    if (sub === "Irrigation Systems") {
      if (!reqSelect("irrigationSystemType", ["drip", "sprinkler_zones", "smart_controller", "pump"])) return false;
      if (!reqSelect("coverageAreaBand", ["small_patch", "medium_lawn", "large_lawn", "multi_zone"])) return false;
      if (!reqSelect("controllerIncluded", ["no_controller", "basic_timer_included", "smart_controller_included", "controller_renter_supplies"])) return false;
      if (!reqSelect("installComplexity", ["renter_diy", "host_installs", "pro_only"])) return false;
      if (!reqText("kitInventoryChecklist", 8)) return false;
    }
    if (sub === "Landscape Equipment") {
      if (!reqText("model")) return false;
      if (!reqSelect("landscapeEquipSubtype", ["core_aerator","spike_aerator","power_dethatcher","sod_cutter","broadcast_spreader","drop_spreader","tow_spreader","wheelbarrow_cart","dump_cart","landscape_rake","lawn_roller","landscape_edger","other_landscape"])) return false;
      if (!reqSelect("workingWidthBand", ["under_18in", "18_24in", "24_30in", "30in_plus", "not_applicable"])) return false;
      if (!reqText("transportNotes")) return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
      if (power === "gas" && !reqSelect("fuelType", ["gasoline", "premix_2stroke", "propane", "diesel", "other"])) return false;
    }
    if (sub === "Other") {
      if (!reqSelect("gardenOtherKind", ["equipment", "plant", "mixed"])) return false;
      if (!reqSelect("gardenPieceBand", ["single_piece", "multi_piece"])) return false;
      if (!reqSelect("photoConditionChecklist", ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"])) return false;
      if ((values.gardenPieceBand ?? "").trim() === "multi_piece" && !reqText("kitInventoryChecklist", 6)) return false;
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

  // Electronics wipe / unlink + subcategory P0 gates.
  if (category.trim() === "Electronics & Tech" && modes?.rent) {
    const sub = subcategory.trim();
    const subLc = sub.toLowerCase();
    const wipeAlways = new Set(ELECTRONICS_WIPE_SUBS.map((s) => s.toLowerCase()));
    const needsWipe =
      wipeAlways.has(subLc) ||
      (subLc === "gaming gear" &&
        (values.gamingHasInternalStorage ?? "").trim() === "has_internal_storage") ||
      (subLc === "other" && (values.deviceHasStorage ?? "").trim() === "has_storage");
    if (needsWipe) {
      const wipe = (values.hostDataWipeStatus ?? "").trim();
      if (
        ![
          "wiped_before_list",
          "wipe_at_handoff",
          "account_unlinked",
          "renter_responsible",
        ].includes(wipe)
      ) {
        return false;
      }
    }
    // Kit checklist required on all Electronics rent shelves.
    if (!(values.kitInventoryItems ?? "").trim()) return false;
    if (!(values.kitInventoryChecklist ?? "").trim()) return false;

    const reqSelect = (key: string, allowed: string[]) => {
      const v = (values[key] ?? "").trim();
      return allowed.includes(v);
    };
    const reqText = (key: string, min = 3) => (values[key] ?? "").trim().length >= min;

    if (sub === "Laptops") {
      if (!reqSelect("osAdminUnlockPlan", ["unlocked_ready","guest_demo_account","password_shared_at_handoff","renter_brings_own_os","firmware_lock_disclosed"])) return false;
      if (!reqSelect("chargerWattageBand", ["under_45w","45_65w","65_100w","100w_plus","usb_c_pd_shared","no_charger_included"])) return false;
      if (!reqSelect("batteryHealthBand", ["excellent_90_plus","good_80_89","fair_60_79","replace_soon_under_60","unknown_untested"])) return false;
      if (!reqText("loginDemoAccountNotes")) return false;
      if (!reqSelect("laptopConditionGrade", ["like_new","light_wear","visible_wear_screen_kb","functional_imperfections"])) return false;
      if (!reqText("antivirusAccountUnlinkNotes")) return false;
      if (!reqSelect("returnWipeAckDepth", ["host_wipes_on_return","renter_factory_reset_required","renter_logout_only","no_wipe_needed_loaner_image"])) return false;
    }
    if (sub === "Projectors") {
      if (!reqSelect("projectorLumenBand", ["under_500","500_1500","1500_3000","3000_5000","5000_plus"])) return false;
      if (!reqText("projectorThrowNotes")) return false;
      if (!reqText("projectorInputInventory")) return false;
      if (!reqSelect("projectorScreenStandIncluded", ["projector_only","screen_included","stand_tripod_included","screen_and_stand","renter_provides_screen"])) return false;
      if (!reqSelect("projectorLightSource", ["lamp","laser","led","hybrid_unknown"])) return false;
      if (!reqSelect("projectorNativeResBand", ["svga_or_lower","720p","1080p","wuxga_1440p","4k_uhd","other_res"])) return false;
      if (!reqSelect("projectorUseEnv", ["indoor_only","covered_outdoor_ok","outdoor_ok_dry","outdoor_not_allowed"])) return false;
    }
    if (sub === "Smart Home Devices") {
      if (!reqSelect("smartDeviceClass", ["smart_speaker_display","security_camera","video_doorbell","thermostat","smart_lock","lighting_kit","hub_bridge","sensor_kit","multi_device_kit","other_smart_home"])) return false;
      if (!reqSelect("hubBridgeStatus", ["hub_included","bridge_included","renter_must_have_hub","wifi_only_no_hub","not_applicable"])) return false;
      if (!(values.smartProtocolBand ?? "").trim()) return false;
      if (!reqSelect("smartPowerType", ["plug_in_ac","battery","hardwired","usb_powered","poe","mixed_kit"])) return false;
      if (!reqText("factoryResetNotes")) return false;
      if (!reqSelect("accountReturnPolicy", ["must_unlink_before_return","factory_reset_before_return","host_resets_at_return"])) return false;
      if (!reqSelect("cameraPrivacyCover", ["cover_included","no_cover","no_camera"])) return false;
    }
    if (sub === "Gaming Gear") {
      if (!reqSelect("gamingGearSubtype", ["console","pc_gaming","vr_headset","handheld","controllers_accessories"])) return false;
      if (!reqSelect("gamingAccountLoginPolicy", ["guest_or_offline","host_account_temporary","renter_own_account","no_login_needed"])) return false;
      if (!reqSelect("controllerCountBand", ["none_0","one_1","two_2","three_to_four","five_plus","not_applicable"])) return false;
      if (!reqSelect("gameLibraryIncluded", ["none_empty","digital_on_device","physical_discs_carts","mixed_digital_physical","not_applicable"])) return false;
      if (!reqSelect("gamingHasInternalStorage", ["has_internal_storage","cloud_or_thin_client","accessories_no_storage"])) return false;
      if (!reqSelect("gamingCableHdmiPolicy", ["hdmi_and_power_included","hdmi_only_renter_power","power_only_renter_hdmi","displayport_included","renter_provides_all_cables","not_applicable_wireless"])) return false;
      if ((values.gamingGearSubtype ?? "").trim() === "vr_headset" && !reqText("vrHeadsetHygieneNotes")) return false;
    }
    if (sub === "Speakers") {
      if (!reqSelect("speakerFormBand", ["bluetooth_portable","wired_bookshelf","party_boombox","soundbar_home","smart_speaker","other_consumer_speaker"])) return false;
      if (!reqSelect("speakerPowerBand", ["battery_only","ac_mains","battery_and_ac","usb_powered"])) return false;
      if (!reqSelect("speakerWeatherBand", ["indoor_only","splash_ok","outdoor_rated","unknown_weather"])) return false;
      if (!reqText("neighborVolumeNotes")) return false;
      if (!reqSelect("standMountIncluded", ["stand_included","mount_bracket_included","stand_and_mount","not_included","not_applicable"])) return false;
    }
    if (sub === "Other") {
      if (!reqSelect("electronicsKitBand", ["single_device","multi_piece_kit"])) return false;
      if (!reqSelect("deviceHasStorage", ["has_storage","no_storage","unknown"])) return false;
      if (!reqSelect("devicePowerBand", ["battery_internal","usb_powered","wall_ac_included","wall_ac_renter","poe","passive_no_power"])) return false;
      if (!reqSelect("photoConditionChecklist", ["front_ports","front_ports_flaws","all_pieces_and_flaws"])) return false;
      if ((values.electronicsKitBand ?? "").trim() === "multi_piece_kit" && !reqText("kitInventoryChecklist", 8)) return false;
    }
    if (sub === "Servers & Workstations") {
      if (!reqSelect("serverFormFactor", ["tower_workstation","tower_server","rack_1u","rack_2u","rack_4u_plus","blade_chassis","laptop_workstation","all_in_one_workstation"])) return false;
      if (!reqSelect("serverPowerConfig", ["single_psu_120v","single_psu_240v","dual_redundant_psu","pdu_c13_c14_required","renter_provides_power","host_confirm_power"])) return false;
      if (!reqSelect("rackMountKitIncluded", ["rails_included","rails_not_included","cage_nuts_only","sliding_rails_plus_cable_arm","not_rack_form"])) return false;
      if (!reqText("networkPortsInventory")) return false;
      if (!reqSelect("remoteMgmtAccessPolicy", ["no_bmc_access","ipmi_idrac_creds_on_handoff","idrac_ilo_read_only","bmc_disabled_before_rent","renter_must_not_use_bmc"])) return false;
      if (!reqSelect("dataWipeDepthBand", ["secure_erase_done","crypto_erase_done","os_reinstall_only","drives_removed","wipe_at_return_renter"])) return false;
    }
    if (sub === "Pro Audio") {
      if (!reqSelect("proAudioGearType", ["audio_interface","analog_mixer","digital_mixer","studio_microphone","studio_monitor_pair","headphone_amp_dac","di_box_kit","field_recorder","other_pro_audio"])) return false;
      if (!reqSelect("phantomPowerSupport", ["phantom_48v_builtin","phantom_external_needed","no_phantom","phantom_not_applicable"])) return false;
      if (!reqText("proAudioCableLoom")) return false;
      if (!reqSelect("caseIncluded", ["hard_case","soft_case","flight_case","no_case"])) return false;
      if (!reqSelect("diBoxIncluded", ["di_included","di_not_included","di_not_needed"])) return false;
      if (!reqSelect("returnFunctionTestAttest", ["host_function_tested","test_at_handoff","renter_return_test_required"])) return false;
    }
    if (sub === "Broadcast Equipment") {
      if (!reqSelect("broadcastDeviceSubtype", ["video_switcher","stream_encoder","recorder_iso","teleprompter","capture_card","confidence_monitor","control_surface","other_broadcast"])) return false;
      if (!reqSelect("broadcastKitCompleteness", ["device_only","device_plus_io_cables","full_stream_kit","accessory_only"])) return false;
      if (!reqText("videoIoInventory")) return false;
      if (!reqSelect("powerBatteryPlateBand", ["ac_mains_only","vmount_plate","gold_mount_plate","npf_sony_plate","internal_battery","mixed_ac_battery","poe_or_usb_c_pd","renter_provides_power"])) return false;
      if (!reqSelect("captureMediaIncluded", ["no_media_needed","sd_cf_included","ssd_included","renter_provides_media","mixed_some_included"])) return false;
      if (!reqSelect("returnFunctionTestPolicy", ["ports_power_on_test","loopback_or_preview_ok","host_tests_at_return","renter_self_attest_ok","no_live_test_visual_only"])) return false;
    }
    if (sub === "Network Gear") {
      if (!reqSelect("networkGearSubtype", ["router","switch","access_point","firewall","mesh_system","modem","network_other"])) return false;
      if (!reqSelect("managedBand", ["unmanaged","smart_cloud","fully_managed","not_applicable"])) return false;
      if (!reqSelect("poeBudgetBand", ["no_poe","under_60w","60_150w","150_300w","300w_plus","poe_not_applicable"])) return false;
      if (!reqSelect("configWipeDepth", ["factory_reset_full","config_cleared_keep_os","controller_unlinked","host_reimages","renter_resets_at_start"])) return false;
      if (!reqSelect("credentialsHandoffPolicy", ["temp_creds_at_handoff","factory_defaults_only","host_configures_remote","renter_brings_own_creds","no_creds_needed"])) return false;
      if (!reqSelect("rackMountIncluded", ["rack_ears_included","wall_mount_kit","desktop_only","pole_mount_kit","mount_not_applicable"])) return false;
      if (!reqSelect("portCountBand", ["wireless_only","under_8","8_16","16_24","24_48","48_plus"])) return false;
      if (!reqSelect("outdoorApRating", ["indoor_only","outdoor_iprated","outdoor_not_applicable"])) return false;
      if (!reqSelect("renterFactoryRestorePolicy", ["renter_restores_factory","host_restores_after","leave_config_ok_host_wipes"])) return false;
    }
    if (sub === "Display Systems") {
      if (!reqSelect("displayTypeBand", ["flat_panel_lcd","flat_panel_oled","led_cabinet_wall","portable_monitor","interactive_touch","other_display"])) return false;
      if (!reqSelect("resolutionHdrBand", ["hd_1080_sdr","qhd_1440_sdr","uhd_4k_sdr","uhd_4k_hdr10","uhd_4k_hlg","uhd_8k_or_hdr_mixed","led_native_map","other_resolution"])) return false;
      if (!reqSelect("brightnessNitBand", ["under_400_nit","400_700_nit","700_1500_nit","1500_3500_nit","3500_nit_plus","not_specified_lcd"])) return false;
      if (!reqSelect("mountStandCaseBand", ["stand_included","wall_mount_included","stand_and_mount","rolling_cart_included","flight_case_included","stand_mount_and_case","none_renter_provides"])) return false;
      if (!(values.displayInputInventory ?? "").trim()) return false;
      if (!reqSelect("indoorOutdoorRating", ["indoor_only","covered_outdoor_ok","outdoor_rated","unknown_rating"])) return false;
      if (!reqSelect("powerCircuitBand", ["standard_120v_15a","120v_20a_dedicated","208_240v","led_multi_circuit","battery_or_inverter","ask_host_or_multi"])) return false;
      if (!reqSelect("transportFragilityBand", ["glass_panel_fragile","led_cabinet_modular","flight_cased_rugged","desktop_monitor_ok","mixed_fragile"])) return false;
    }
  }


  // Gym & Fitness P0 gates by shelf.
  if (category.trim() === "Gym & Fitness" && modes?.rent) {
    const sub = subcategory.trim();
    const reqSelect = (key: string, allowed: string[]) => allowed.includes((values[key] ?? "").trim());
    const reqText = (key: string, min = 3) => (values[key] ?? "").trim().length >= min;
    const waiver = (values.liabilityWaiverRequired ?? "").trim();
    if (waiver !== "required" && waiver !== "not_required") return false;
    if (!reqSelect("weightBand", [
      "under_10lb", "10_25lb", "25_50lb", "50_100lb", "100lb_plus", "bodyweight_only", "adjustable",
    ])) return false;

    if (sub === "Yoga & Pilates") {
      if (!reqSelect("yogaMatThicknessBand", ["thin_under_3mm", "standard_3_5mm", "thick_6mm_plus", "travel_foldable", "not_a_mat"])) return false;
      if (!reqSelect("yogaMatSurfaceType", ["pvc", "tpe", "natural_rubber", "cork", "cotton_jute", "other_surface", "accessories_only"])) return false;
      if (!reqSelect("yogaKitBand", ["mat_only", "mat_plus_blocks", "mat_blocks_strap", "pilates_ring_kit", "full_yoga_pilates_kit", "accessories_only"])) return false;
      if (!reqSelect("yogaMatLengthSize", ["short_travel", "standard_68in", "long_72in_plus", "extra_wide", "size_mixed_kit", "not_applicable"])) return false;
      if (!reqSelect("yogaHygieneWipePolicy", ["wipe_before_and_after", "wipe_after_only", "host_sanitized_at_handoff", "towel_cover_required"])) return false;
      const kit = (values.yogaKitBand ?? "").trim();
      if (kit !== "mat_only" && kit !== "accessories_only" && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Resistance Bands") {
      if (!reqSelect("resistanceLevelBand", ["light", "light_medium", "medium", "heavy", "extra_heavy", "mixed_set", "unknown_level"])) return false;
      if (!reqSelect("bandKitPieceCountBand", ["single", "pair", "set_3_5", "set_6_plus"])) return false;
      if (!reqSelect("bandMaterialType", ["latex_loop", "latex_tube", "fabric_loop", "mixed_material", "unknown_material"])) return false;
      if (!reqSelect("anchorIncluded", ["door_anchor_included", "wall_anchor_included", "no_anchor", "anchor_not_needed"])) return false;
      if (!reqSelect("bandSnapWearGrade", ["new_unused", "light_wear", "visible_wear_ok", "replace_soon_disclosed"])) return false;
      const pieces = (values.bandKitPieceCountBand ?? "").trim();
      if ((pieces === "set_3_5" || pieces === "set_6_plus" || pieces === "pair") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Recovery Tools") {
      if (!reqSelect("recoveryToolType", ["foam_roller", "massage_gun", "percussion_other", "ice_heat_pack", "massage_ball_set", "mixed_recovery", "other_recovery"])) return false;
      if (!reqSelect("recoveryBatteryRuntimeBand", ["under_30m", "30_60m", "60m_plus", "corded_ac", "not_powered", "unknown_runtime"])) return false;
      if (!reqSelect("recoveryIntensitySpeedBand", ["low", "medium", "high", "multi_speed", "not_a_gun", "unknown_intensity"])) return false;
      if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
    }
    if (sub === "Cardio Equipment") {
      if (!reqText("brand") || !reqText("model")) return false;
      if (!reqSelect("maxUserWeightBand", ["up_to_200lb", "up_to_250lb", "up_to_300lb", "300lb_plus", "not_rated"])) return false;
      if (!reqSelect("cardioType", ["upright_bike", "spin_bike", "recumbent_bike", "elliptical", "rower", "stair_climber", "other_home_cardio"])) return false;
      if (!reqSelect("foldableStatus", ["folds", "does_not_fold", "partial_fold", "unknown_fold"])) return false;
      if (!reqSelect("cardioPowerNeeds", ["wall_outlet_110", "wall_outlet_220", "battery_assisted", "self_powered_no_plug", "unknown_power"])) return false;
      if (!reqSelect("moveInStairsDisclosure", ["ground_floor_easy", "stairs_two_person", "elevator_ok", "curbside_only", "host_delivers"])) return false;
      if (!reqSelect("cardioHygieneWipePolicy", ["wipe_before_and_after", "wipe_after_only", "host_sanitized_at_handoff", "towel_cover_required"])) return false;
      if (!reqSelect("warrantyNotIncludedNote", ["no_mfr_warranty_transfer", "host_covers_mechanical_only", "as_is_no_repair", "unknown_warranty"])) return false;
    }
    if (sub === "Free Weights") {
      if (!reqSelect("freeWeightForm", ["dumbbell_pair", "kettlebell", "barbell", "plates_only", "set_kit", "other_free_weight"])) return false;
      if (!reqSelect("freeWeightPieceBand", ["single", "pair", "set_3_to_8", "set_9_plus"])) return false;
      if (!reqSelect("rackStandIncluded", ["rack_included", "stand_included", "rack_and_stand", "none_floor_only"])) return false;
      if (!reqSelect("weightCoatingType", ["rubber_coated", "urethane", "bare_iron", "hex_dumbbell", "mixed_coating", "unknown_coating"])) return false;
      if (!reqSelect("floorProtectionRequired", ["mat_required", "mat_recommended", "garage_floor_ok", "outdoor_ok_disclosed"])) return false;
      if (!reqSelect("dropPolicy", ["no_dropping", "controlled_drop_ok", "bumper_plates_only", "host_rules_in_notes"])) return false;
      const form = (values.freeWeightForm ?? "").trim();
      const pieces = (values.freeWeightPieceBand ?? "").trim();
      if ((form === "set_kit" || pieces === "set_3_to_8" || pieces === "set_9_plus") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Commercial Treadmills") {
      if (!reqText("brand") || !reqText("model")) return false;
      if (!reqSelect("maxUserWeightBand", ["up_to_200lb", "up_to_250lb", "up_to_300lb", "300lb_plus", "not_rated"])) return false;
      if (!reqSelect("motorHPBand", ["under_2hp", "2_3hp", "3_4hp", "4hp_plus", "unknown_hp"])) return false;
      if (!reqSelect("commercialUseClass", ["commercial_rated", "light_commercial", "home_use_disclosed", "unknown_class"])) return false;
      if (!reqSelect("deckLengthBand", ["under_55in", "55_60in", "60in_plus", "unknown_deck"])) return false;
      if (!reqSelect("inclineCapable", ["incline_yes", "incline_no", "incline_unknown"])) return false;
      if (!reqSelect("powerVoltage", ["110v", "220v", "dedicated_circuit_required", "unknown_voltage"])) return false;
      if (!reqText("deliveryAccessNotes", 6)) return false;
      if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
      if (!reqSelect("moveInstallResponsibility", ["host_moves_and_installs", "renter_moves", "third_party_mover", "curbside_pickup_only"])) return false;
    }
    if (sub === "Weight Machines") {
      if (!reqText("brand") || !reqText("model")) return false;
      if (!reqSelect("maxUserWeightBand", ["up_to_200lb", "up_to_250lb", "up_to_300lb", "300lb_plus", "not_rated"])) return false;
      if (!reqSelect("machineType", ["selectorized", "cable_crossover", "smith_machine", "plate_loaded", "functional_trainer", "other_machine"])) return false;
      if (!reqSelect("resistanceLoadBand", ["under_100lb_stack", "100_200lb_stack", "200lb_plus_stack", "plate_loaded_user_plates", "bodyweight_assist", "unknown_load"])) return false;
      if (!reqSelect("footprintBand", ["compact", "standard_home", "commercial_bay", "unknown_footprint"])) return false;
      if (!reqSelect("pinSelectorIncluded", ["pin_included", "pin_missing_disclosed", "plate_loaded_no_pin", "not_applicable"])) return false;
      if (!reqSelect("assemblyInstallStatus", ["assembled_ready", "partial_assembly", "renter_assembles", "host_installs"])) return false;
      if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
    }
    if (sub === "Boxing Equipment") {
      if (!reqSelect("boxingGearType", ["bag", "gloves", "pads", "ring_corner", "mix"])) return false;
      if (!reqSelect("gloveSizeBand", ["oz_8_10", "oz_12", "oz_14", "oz_16", "mixed_sizes", "not_gloves"])) return false;
      if (!reqSelect("boxingHygienePolicy", ["wipe_before_return", "liner_or_wraps_required", "host_sanitizes_between", "renter_supplies_own_gloves", "not_skin_contact"])) return false;
      if (!reqSelect("standOrMountIncluded", ["stand_included", "ceiling_mount_included", "wall_mount_included", "none_bag_only", "not_applicable"])) return false;
      if (!reqSelect("boxingUsePolicy", ["bag_only", "pads_drill_only", "sparring_allowed_host_rules", "demo_display_only"])) return false;
      const gear = (values.boxingGearType ?? "").trim();
      if ((gear === "mix" || gear === "gloves" || gear === "pads") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Competition Gear") {
      if (!reqSelect("sportDisciplineBand", ["powerlifting", "olympic_weightlifting", "crossfit_style", "strongman", "other_discipline"])) return false;
      if (!reqSelect("plateGradeDisclosure", ["calibrated", "training_plates", "mixed_plates", "bars_only", "unknown_grade"])) return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Training Systems") {
      if (!reqSelect("trainingSystemType", ["suspension_trainer", "functional_trainer", "rack_with_attachments", "smart_mirror_style", "mixed_system", "other_system"])) return false;
      if (!reqSelect("anchorInstallRequirements", ["door_anchor", "ceiling_anchor", "wall_mount", "freestanding", "host_installs", "no_anchor_needed"])) return false;
      if (!reqSelect("maxUsersBand", ["solo", "duo", "small_group_3_5", "group_6_plus"])) return false;
      if (!reqText("ceilingClearanceNotes", 4)) return false;
      if (!reqSelect("trainingWipeHygienePolicy", ["wipe_before_and_after", "wipe_after_only", "host_sanitized_at_handoff", "towel_cover_required"])) return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Other") {
      if (!reqSelect("gymOtherKind", ["cardio", "weights", "yoga", "recovery", "boxing", "competition", "training", "mixed"])) return false;
      if (!reqSelect("gymPieceBand", ["single_piece", "multi_piece"])) return false;
      if (!reqSelect("photoConditionChecklist", ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"])) return false;
      if ((values.gymPieceBand ?? "").trim() === "multi_piece" && !reqText("kitInventoryChecklist", 6)) return false;
    }
  }

  // Party serving / catering sanitize attest.
  if (category.trim() === "Party & Events" && modes?.rent) {
    const sub = subcategory.trim().toLowerCase();
    if (sub === "serving equipment" || sub === "catering equipment") {
      if ((values.cateringSanitizeAttested ?? "").trim() !== "attested") return false;
    }
  }


  // Cribs & Beds: portable sleep standard / recall / drop-side / mattress / sanitization.
  if (
    category.trim() === "Baby & Kids" &&
    subcategory.trim() === "Cribs & Beds" &&
    modes?.rent
  ) {
    if ((values.recallAcknowledged ?? "").trim() !== "acknowledged") return false;
    if ((values.dropSideAcknowledged ?? "").trim() !== "no_drop_side") return false;
    if (
      !["cpsc_compliant", "en_716_eu", "other_regional_standard"].includes(
        (values.cpscCompliant ?? "").trim(),
      )
    ) {
      return false;
    }
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

  // Baby contact hygiene shelves + toys age band + safety-system install.
  if (category.trim() === "Baby & Kids" && modes?.rent) {
    const sub = subcategory.trim();
    const contactHygiene = new Set(BABY_CONTACT_HYGIENE_SUBS);
    if (contactHygiene.has(sub as (typeof BABY_CONTACT_HYGIENE_SUBS)[number])) {
      if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
      if ((values.recallAcknowledged ?? "").trim() !== "acknowledged") return false;
    }
    if (sub === "Toys & Games") {
      if (
        !["ages_0_plus_no_small_parts", "ages_3_plus", "ages_8_plus", "not_a_toy"].includes(
          (values.toyHazardBand ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Safety Systems") {
      if (
        ![
          "install_documented",
          "renter_installs_with_guide",
          "professionally_installed",
        ].includes((values.safetyInstallAttested ?? "").trim())
      ) {
        return false;
      }
    }
  }


  if (category.trim() === "Costume & Cosplay" && modes?.rent) {
    const sub = subcategory.trim();
    const material = (values.materialBand ?? "").trim();
    if (![
      "polyester", "cotton", "blend", "leather_faux", "foam_latex", "other_material",
    ].includes(material)) return false;

    if (
      sub === "Professional Makeup Kits" ||
      sub === "Wigs & Accessories" ||
      sub === "Masks & Makeup" ||
      sub === "Full Character Suits"
    ) {
      if ((values.sanitizationAttested ?? "").trim() !== "attested") return false;
    }
    if (sub === "Character Costumes" && !(values.characterLabel ?? "").trim()) return false;
    if (
      [
        "Halloween Costumes",
        "Character Costumes",
        "Theater Costumes",
        "Period Costumes",
        "Full Character Suits",
        "Other",
      ].includes(sub)
    ) {
      if (
        !["full_set", "partial_set", "accessory_only"].includes(
          (values.costumeCompleteness ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Halloween Costumes") {
      if (!["kids_only", "adult_only", "all_ages"].includes((values.audienceAgeBand ?? "").trim())) {
        return false;
      }
    }
    if (sub === "Halloween Costumes" || sub === "Character Costumes") {
      if (
        ![
          "glitter_ok",
          "no_glitter",
          "no_smoke_fog",
          "glitter_and_smoke_banned",
        ].includes((values.glitterSmokePolicy ?? "").trim())
      ) {
        return false;
      }
    }
    if (sub === "Period Costumes") {
      if (
        ![
          "ancient_classical",
          "medieval_renaissance",
          "18th_19th",
          "early_20th",
          "mid_late_20th",
          "fantasy_other_era",
        ].includes((values.periodEraBand ?? "").trim())
      ) {
        return false;
      }
    }
    if (
      sub === "Period Costumes" ||
      sub === "Theater Costumes" ||
      sub === "Character Costumes"
    ) {
      if (
        !["no_alterations", "pins_only", "tailor_ok_with_approval"].includes(
          (values.alterationPolicy ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Wigs & Accessories") {
      if (
        !["synthetic", "human_hair", "fiber_blend", "lace_front", "unknown_fiber"].includes(
          (values.wigFiberBand ?? "").trim(),
        )
      ) {
        return false;
      }
      if (
        !["cap_petite", "cap_average", "cap_large", "cap_one_size"].includes(
          (values.wigCapSizeBand ?? "").trim(),
        )
      ) {
        return false;
      }
      if (
        !["return_styled", "reset_ok", "wash_cap_only"].includes(
          (values.styleResetPolicy ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Masks & Makeup" || sub === "Professional Makeup Kits") {
      if (
        !["sealed_only", "mixed_sealed_open", "open_shared"].includes(
          (values.cosmeticsSealedBand ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Masks & Makeup") {
      if (
        !["hard_mask", "foam_latex", "soft_fabric", "makeup_only", "mixed_contact"].includes(
          (values.maskContactType ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Professional Makeup Kits") {
      if (
        ![
          "brushes_under_10",
          "brushes_10_25",
          "brushes_25_50",
          "brushes_50_plus",
        ].includes((values.brushCountBand ?? "").trim())
      ) {
        return false;
      }
    }
    if (sub === "Film & TV Props") {
      if (
        !["hero_prop", "background_prop", "set_dressing", "mixed_prop_role"].includes(
          (values.propRoleBand ?? "").trim(),
        )
      ) {
        return false;
      }
      if (
        !["replica_looksafe", "inert_prop", "not_a_weapon_prop"].includes(
          (values.looksafePolicy ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (sub === "Film & TV Props" || sub === "Animatronic Props") {
      if (
        !["standard_care", "fragile_two_hand", "do_not_ship_loose"].includes(
          (values.fragileHandling ?? "").trim(),
        )
      ) {
        return false;
      }
    }
    if (
      [
        "Halloween Costumes",
        "Character Costumes",
        "Period Costumes",
        "Masks & Makeup",
        "Theater Costumes",
        "Film & TV Props",
        "Professional Makeup Kits",
        "Full Character Suits",
        "Other",
      ].includes(sub)
    ) {
      if (!(values.kitInventoryChecklist ?? "").trim()) return false;
    }
    if (sub === "Animatronic Props") {
      if (
        !["battery", "wall_ac", "compressed_air", "none_static"].includes(
          (values.animatronicPower ?? "").trim(),
        )
      ) {
        return false;
      }
      if (
        ![
          "runtime_under_30m",
          "runtime_30_120m",
          "runtime_continuous_plug",
          "runtime_unknown",
        ].includes((values.runtimeBand ?? "").trim())
      ) {
        return false;
      }
      if (
        !["indoor_only", "outdoor_ok", "weather_sensitive"].includes(
          (values.useEnvironment ?? "").trim(),
        )
      ) {
        return false;
      }
      if (!(values.operatorNotes ?? "").trim()) return false;
    }
    if (sub === "Animatronic Props" || sub === "Full Character Suits") {
      const waiver = (values.liabilityWaiverRequired ?? "").trim();
      if (waiver !== "required" && waiver !== "not_required") return false;
    }
    if (sub === "Full Character Suits") {
      if ((values.heatVisibilityAttested ?? "").trim() !== "attested") return false;
      if (
        !["wear_under_15", "wear_15_30", "wear_30_45", "wear_host_guided"].includes(
          (values.maxWearMinutesBand ?? "").trim(),
        )
      ) {
        return false;
      }
      if (
        !["spotter_required", "spotter_recommended", "spotter_not_required"].includes(
          (values.spotterRequired ?? "").trim(),
        )
      ) {
        return false;
      }
    }
  }


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


  // Heavy Equipment P0 gates by shelf.
  if (category.trim() === "Heavy Equipment" && modes?.rent) {
    const sub = subcategory.trim();
    const reqSelect = (key: string, allowed: string[]) =>
      allowed.includes((values[key] ?? "").trim());
    const reqText = (key: string, min = 3) =>
      (values[key] ?? "").trim().length >= min;

    if (
      !reqSelect("powerBand", [
        "under_2kw",
        "2_5kw",
        "5_15kw",
        "15_50kw",
        "50kw_plus",
        "not_motorized",
      ])
    )
      return false;
    if (
      !reqSelect("fuelType", [
        "gasoline",
        "diesel",
        "electric",
        "propane",
        "other",
      ])
    )
      return false;
    if (
      !reqSelect("insuranceMinLiability", [
        "liability_25_50",
        "liability_50_100",
        "liability_100_300",
        "liability_250_500",
      ])
    )
      return false;
    if (
      !reqSelect("insuranceMaxDeductible", [
        "deductible_500",
        "deductible_1000",
        "deductible_2500",
        "full_coverage_required",
      ])
    )
      return false;

    if (sub === "Generators" || sub === "Industrial Generators") {
      if (
        !reqSelect("generatorPhaseBand", [
          "single_phase",
          "split_phase",
          "three_phase",
          "inverter_portable",
        ])
      )
        return false;
      if (
        !reqSelect("generatorStartingMethod", [
          "pull_recoil",
          "electric_start",
          "remote_start",
          "auto_transfer",
        ])
      )
        return false;
      if (
        !reqSelect("generatorRuntimeHoursBand", [
          "under_4h",
          "4_8h",
          "8_12h",
          "12h_plus",
          "continuous_standby",
          "unknown_runtime",
        ])
      )
        return false;
      if (
        !reqSelect("transferSwitchIncluded", [
          "included",
          "not_included",
          "renter_provides",
          "n_a_portable",
        ])
      )
        return false;
      if (
        !reqSelect("generatorNoiseDbBand", [
          "under_60db",
          "60_70db",
          "70_80db",
          "80db_plus",
          "unknown_noise",
        ])
      )
        return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Industrial Generators") {
      if (
        !reqSelect("generatorDutyClass", [
          "standby",
          "prime",
          "continuous",
          "rental_fleet",
        ])
      )
        return false;
      if (
        !reqSelect("generatorMountForm", [
          "skid",
          "trailer_mounted",
          "containerized",
          "pad_stationary",
          "portable_frame",
        ])
      )
        return false;
      if (!reqText("groundingBondingNotes", 8)) return false;
    }
    if (sub === "Air Compressors" || sub === "Industrial Compressors") {
      if (
        !reqSelect("compressorCfmBand", [
          "under_5cfm",
          "5_10cfm",
          "10_20cfm",
          "20_50cfm",
          "50cfm_plus",
          "unknown_cfm",
        ])
      )
        return false;
      if (
        !reqSelect("tankSizeGalBand", [
          "tankless",
          "under_10gal",
          "10_30gal",
          "30_60gal",
          "60_120gal",
          "120gal_plus",
        ])
      )
        return false;
      if (
        !reqSelect("maxPsiBand", [
          "under_100psi",
          "100_150psi",
          "150_200psi",
          "200psi_plus",
          "unknown_psi",
        ])
      )
        return false;
      if (
        !reqSelect("compressorDriveType", [
          "electric_portable",
          "gas_wheelbarrow",
          "diesel",
          "tractor_pto",
          "electric_stationary",
          "unknown_drive",
        ])
      )
        return false;
      if (
        !reqSelect("hoseCouplerKitIncluded", [
          "full_hose_kit",
          "partial_kit",
          "couplers_only",
          "none_renter_provides",
        ])
      )
        return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Industrial Compressors") {
      if (
        !reqSelect("compressorDutyClass", [
          "intermittent",
          "continuous",
          "industrial_plant",
        ])
      )
        return false;
      if (!reqSelect("airDryerIncluded", ["included", "not_included", "n_a"]))
        return false;
    }
    if (sub === "Pressure Washers") {
      if (
        !reqSelect("washerPsiBand", [
          "under_1500psi",
          "1500_2500psi",
          "2500_3500psi",
          "3500psi_plus",
          "unknown_psi",
        ])
      )
        return false;
      if (
        !reqSelect("washerGpmBand", [
          "under_2gpm",
          "2_3gpm",
          "3_4gpm",
          "4gpm_plus",
          "unknown_gpm",
        ])
      )
        return false;
      if (
        !reqSelect("washerPowerSource", [
          "electric",
          "gas",
          "hot_water_diesel",
          "unknown_power",
        ])
      )
        return false;
      if (
        !reqSelect("wandNozzleKitIncluded", [
          "full_kit",
          "partial_kit",
          "wand_only",
          "none",
        ])
      )
        return false;
      if (
        !reqSelect("surfaceUsePolicy", [
          "soft_siding_ok",
          "hardscape_only",
          "vehicles_ok",
          "no_delicate_surfaces",
          "host_rules_in_notes",
        ])
      )
        return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Winches") {
      if (
        !reqSelect("winchCapacityLbsBand", [
          "under_2000lb",
          "2000_5000lb",
          "5000_10000lb",
          "10000lb_plus",
          "unknown_capacity",
        ])
      )
        return false;
      if (
        !reqSelect("winchMountType", [
          "portable",
          "bumper_mounted",
          "trailer_mounted",
          "recovery_kit",
          "other_mount",
        ])
      )
        return false;
      if (
        !reqSelect("winchLineType", [
          "steel_cable",
          "synthetic_rope",
          "mixed_line",
          "unknown_line",
        ])
      )
        return false;
      if (
        !reqSelect("winchRemoteIncluded", [
          "wired_remote",
          "wireless_remote",
          "none",
        ])
      )
        return false;
      if (!reqSelect("snatchBlockIncluded", ["included", "not_included", "n_a"]))
        return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Pumps" || sub === "Heavy Pumps") {
      if (
        !reqSelect("pumpTypeBand", [
          "trash",
          "transfer",
          "submersible",
          "diaphragm",
          "centrifugal",
          "other_pump",
        ])
      )
        return false;
      if (
        !reqSelect("pumpFlowGpmBand", [
          "under_50gpm",
          "50_150gpm",
          "150_500gpm",
          "500gpm_plus",
          "unknown_flow",
        ])
      )
        return false;
      if (
        !reqSelect("inletOutletSizeBand", [
          "under_2in",
          "2in",
          "3in",
          "4in_plus",
          "mixed_sizes",
        ])
      )
        return false;
      if (
        !reqSelect("solidsHandlingBand", [
          "clean_water",
          "semi_solids",
          "trash_solids",
          "chemicals_disclosed",
          "unknown_solids",
        ])
      )
        return false;
      if (
        !reqSelect("hoseKitIncluded", [
          "suction_and_discharge",
          "suction_only",
          "discharge_only",
          "partial",
          "none",
        ])
      )
        return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Heavy Pumps") {
      if (
        !reqSelect("pumpPrimingMethod", [
          "self_prime",
          "manual_prime",
          "submersible_n_a",
          "unknown_prime",
        ])
      )
        return false;
    }
    if (sub === "Forklifts") {
      if (
        !reqSelect("forkliftClassBand", [
          "class_1_electric",
          "class_2_narrow",
          "class_3_pallet",
          "class_4_cushion",
          "class_5_pneumatic",
          "other_class",
        ])
      )
        return false;
      if (
        !reqSelect("liftCapacityLbsBand", [
          "under_3000lb",
          "3000_5000lb",
          "5000_8000lb",
          "8000lb_plus",
          "unknown_capacity",
        ])
      )
        return false;
      if (
        !reqSelect("mastHeightBand", [
          "under_10ft",
          "10_15ft",
          "15_20ft",
          "20ft_plus",
          "unknown_mast",
        ])
      )
        return false;
      if (
        !reqSelect("forkliftTireType", [
          "cushion",
          "pneumatic",
          "solid",
          "dual",
        ])
      )
        return false;
      if (
        !reqSelect("forkliftFuelOrBattery", [
          "lpg",
          "diesel",
          "electric_lead_acid",
          "electric_lithium",
          "dual_fuel",
          "other_power",
        ])
      )
        return false;
      if (
        !reqSelect("operatorManualIncluded", [
          "included",
          "digital_only",
          "not_included",
        ])
      )
        return false;
    }
    if (sub === "Hydraulic Equipment") {
      if (
        !reqSelect("hydraulicFunctionBand", [
          "power_unit",
          "cylinder_kit",
          "breaker",
          "spreader",
          "other_hydraulic",
        ])
      )
        return false;
      if (
        !reqSelect("hydraulicPressurePsiBand", [
          "under_2000psi",
          "2000_3000psi",
          "3000_5000psi",
          "5000psi_plus",
          "unknown_pressure",
        ])
      )
        return false;
      if (
        !reqSelect("hydraulicFlowGpmBand", [
          "under_5gpm",
          "5_15gpm",
          "15_30gpm",
          "30gpm_plus",
          "unknown_flow",
        ])
      )
        return false;
      if (
        !reqSelect("hydraulicCouplerType", [
          "iso_a",
          "iso_b",
          "flat_face",
          "mixed_couplers",
          "unknown_coupler",
        ])
      )
        return false;
      if (!reqSelect("hoseWhipKitIncluded", ["included", "partial", "none"]))
        return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Other") {
      if (
        !reqSelect("heavyOtherKind", [
          "generator",
          "compressor",
          "washer",
          "winch",
          "pump",
          "forklift",
          "hydraulic",
          "mixed",
        ])
      )
        return false;
      if (!reqSelect("heavyPieceBand", ["single_piece", "multi_piece"]))
        return false;
      if (
        !reqSelect("photoConditionChecklist", [
          "overall_photos",
          "overall_plus_flaws",
          "all_pieces_and_flaws",
        ])
      )
        return false;
      if (
        (values.heavyPieceBand ?? "").trim() === "multi_piece" &&
        !reqText("kitInventoryChecklist", 6)
      )
        return false;
    }
  }


// Home & Kitchen P0 gates by shelf.
  if (category.trim() === "Home & Kitchen" && modes?.rent) {
    const sub = subcategory.trim();
    const reqSelect = (key: string, allowed: string[]) => allowed.includes((values[key] ?? "").trim());
    const reqText = (key: string, min = 3) => (values[key] ?? "").trim().length >= min;

    if (!reqSelect("capacityBand", [
      "single_serve", "small_2_4", "family_4_8", "large_8_plus", "commercial_batch", "not_applicable",
    ])) return false;
    if (!reqSelect("kitchenReturnCleanPolicy", [
      "wash_dry_return", "rinse_return", "host_sanitizes", "empty_tank_only", "as_received_ok",
    ])) return false;

    if (sub === "Coffee Makers") {
      if (!reqSelect("coffeeMakerType", ["drip", "espresso_manual", "espresso_semi", "pod_capsule", "pour_over_kit", "cold_brew", "combo", "other_coffee"])) return false;
      if (!reqSelect("waterReservoirBand", ["single_cup", "under_1l", "1_2l", "over_2l", "plumbed_no_tank", "not_applicable"])) return false;
      if (!reqSelect("carafeOrBasketType", ["glass_carafe", "thermal_carafe", "portafilter", "pod_only", "pour_over_cone", "mixed_kit", "not_applicable"])) return false;
      if (!reqSelect("coffeeFilterPolicy", ["filters_included", "reusable_filter", "renter_provides_filters", "pod_capsules_extra", "not_needed"])) return false;
      const ctype = (values.coffeeMakerType ?? "").trim();
      if ((ctype === "combo" || ctype === "pour_over_kit") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Baking Equipment") {
      if (!reqSelect("bakingKitType", ["pans_sheets", "specialty_mold", "decorating_kit", "proofing_kit", "full_baking_kit", "other_baking"])) return false;
      if (!reqSelect("bakingPieceBand", ["single", "set_2_5", "set_6_12", "set_13_plus"])) return false;
      if (!reqSelect("ovenSafeTempBand", ["up_to_350f", "up_to_450f", "up_to_500f", "broiler_safe", "not_oven_safe", "mixed_kit"])) return false;
      if (!reqSelect("bakewareMaterial", ["aluminized_steel", "aluminum", "silicone", "glass_ceramic", "nonstick", "mixed_material", "other_material"])) return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      const pieces = (values.bakingPieceBand ?? "").trim();
      if ((pieces === "set_2_5" || pieces === "set_6_12" || pieces === "set_13_plus" || (values.bakingKitType ?? "").trim() === "full_baking_kit") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Stand Mixers") {
      if (!reqSelect("mixerBowlCapacityQt", ["under_4qt", "4_5qt", "5_6qt", "6_7qt", "7qt_plus", "unknown_bowl"])) return false;
      if (!reqSelect("mixerAttachmentKitBand", ["beater_only", "beater_whisk", "beater_whisk_dough", "full_attachment_kit", "bowl_only"])) return false;
      if (!reqSelect("mixerPowerWattBand", ["under_250w", "250_400w", "400_600w", "600w_plus", "unknown_watt"])) return false;
      if (!reqSelect("mixerTiltOrBowlLift", ["tilt_head", "bowl_lift", "handheld_stand", "unknown_form"])) return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      const kit = (values.mixerAttachmentKitBand ?? "").trim();
      if ((kit === "beater_whisk_dough" || kit === "full_attachment_kit") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Blenders & Juicers") {
      if (!reqSelect("blenderOrJuicerType", ["countertop_blender", "immersion_blender", "personal_blender", "centrifugal_juicer", "masticating_juicer", "combo", "other_blend_juice"])) return false;
      if (!reqSelect("jarOrPitcherMaterial", ["tritan_plastic", "glass", "stainless", "mixed", "no_jar_immersion", "unknown_material"])) return false;
      if (!reqSelect("bladeDiscKitIncluded", ["blade_included", "blade_plus_discs", "renter_provides", "sealed_unit", "not_applicable"])) return false;
      if (!reqSelect("blendPowerWattBand", ["under_500w", "500_1000w", "1000_1500w", "1500w_plus", "manual_no_motor", "unknown_watt"])) return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      if ((values.bladeDiscKitIncluded ?? "").trim() === "blade_plus_discs" && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Cleaning Appliances") {
      if (!reqSelect("cleaningApplianceType", ["upright_vac", "canister_vac", "stick_vac", "robot_vac", "carpet_cleaner", "steam_mop", "floor_scrubber", "other_cleaning"])) return false;
      if (!reqSelect("cleaningPowerSource", ["corded_120v", "cordless_battery", "manual", "robot_dock", "unknown_power"])) return false;
      if (!reqSelect("bagOrTankSystem", ["bagged", "bagless_bin", "water_tank", "steam_only", "mixed", "not_applicable"])) return false;
      if (!reqSelect("filterIncluded", ["hepa_included", "standard_filter_included", "filter_not_included", "washable_filter", "not_applicable"])) return false;
      if (!reqSelect("emptyReturnAttested", ["empty_required", "host_empties", "not_applicable"])) return false;
    }
    if (sub === "Commercial Coffee") {
      if (!reqSelect("voltageBand", ["120v_corded", "240v", "not_electric"])) return false;
      if (!reqSelect("nsfCertified", ["nsf_listed", "not_nsf", "unknown"])) return false;
      if (!reqSelect("installNeeds", ["countertop_plug", "plumbed_water", "hardwired_240v", "mobile_cart", "other_install"])) return false;
      if (!reqSelect("commercialBrewType", ["espresso_1_group", "espresso_2_group", "espresso_3_plus", "batch_brewer", "urn", "superauto", "grinder_only", "other_commercial_coffee"])) return false;
      if (!reqSelect("waterSoftenerRequired", ["required_on_site", "included_inline", "not_required", "unknown"])) return false;
      if (!reqSelect("commercialCoffeeServiceClass", ["event_day_rental", "cafe_weekend", "catering_support", "demo_display", "unknown_class"])) return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Catering Equipment") {
      if (!reqSelect("cateringEquipType", ["chafing_dishes", "cambro_insulated", "hot_box", "prep_tables", "serving_ware_kit", "full_catering_kit", "other_catering"])) return false;
      if (!reqSelect("guestServeCapacityBand", ["under_25", "25_50", "50_100", "100_200", "200_plus", "not_rated"])) return false;
      if (!reqSelect("heatHoldMethod", ["sterno_fuel", "electric_heat", "insulated_passive", "cold_hold_only", "mixed", "not_applicable"])) return false;
      if (!reqSelect("cateringPowerNeeds", ["no_power", "120v_outlets", "240v_needed", "generator_friendly", "unknown_power"])) return false;
      if (!reqSelect("nsfCertified", ["nsf_listed", "not_nsf", "unknown"])) return false;
      if ((values.cateringSanitizeAttested ?? "").trim() !== "attested") return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Industrial Mixers") {
      if (!reqSelect("industrialMixerBowlQt", ["under_20qt", "20_40qt", "40_60qt", "60_80qt", "80qt_plus", "unknown_bowl"])) return false;
      if (!reqSelect("industrialMixerStyle", ["planetary", "spiral", "vertical_cutter", "dough_divider", "other_industrial_mixer"])) return false;
      if (!reqSelect("industrialPhaseBand", ["single_phase", "three_phase", "not_electric", "unknown_phase"])) return false;
      if (!reqSelect("voltageBand", ["120v_corded", "240v", "not_electric"])) return false;
      if (!reqSelect("nsfCertified", ["nsf_listed", "not_nsf", "unknown"])) return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Food Processors Pro") {
      if (!reqSelect("processorBowlCapacityBand", ["under_3qt", "3_5qt", "5_8qt", "8qt_plus", "continuous_feed", "unknown_bowl"])) return false;
      if (!reqSelect("processorFeedType", ["batch_bowl", "continuous_feed", "combo", "vegetable_cutter", "other_processor"])) return false;
      if (!reqSelect("discBladeKitBand", ["basic_blade", "disc_set_3_5", "disc_set_6_plus", "renter_provides_discs", "not_applicable"])) return false;
      if (!reqSelect("voltageBand", ["120v_corded", "240v", "not_electric"])) return false;
      if (!reqSelect("nsfCertified", ["nsf_listed", "not_nsf", "unknown"])) return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      const discs = (values.discBladeKitBand ?? "").trim();
      if ((discs === "disc_set_3_5" || discs === "disc_set_6_plus") && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Beverage Systems") {
      if (!reqSelect("beverageSystemType", ["kegerator", "soda_fountain", "juice_dispenser", "cold_brew_tower", "slushie", "water_hydration", "other_beverage"])) return false;
      if (!reqSelect("beverageGasOrSyrupKit", ["co2_included", "syrup_lines_included", "co2_and_syrup", "renter_provides", "not_needed"])) return false;
      if (!reqSelect("beveragePlumbStatus", ["self_contained", "needs_water_line", "needs_drain", "water_and_drain", "unknown_plumb"])) return false;
      if (!reqSelect("voltageBand", ["120v_corded", "240v", "not_electric"])) return false;
      if (!reqSelect("nsfCertified", ["nsf_listed", "not_nsf", "unknown"])) return false;
      if (!reqSelect("installNeeds", ["countertop_plug", "plumbed_water", "hardwired_240v", "mobile_cart", "other_install"])) return false;
      if ((values.foodContactSanitizeAttested ?? "").trim() !== "attested") return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Other") {
      if (!reqSelect("homeKitchenOtherKind", ["coffee", "baking", "mixer", "blender_juicer", "cleaning", "catering", "beverage", "commercial_foodservice", "mixed"])) return false;
      if (!reqSelect("homeKitchenPieceBand", ["single_piece", "multi_piece"])) return false;
      if (!reqSelect("photoConditionChecklist", ["overall_photos", "overall_plus_flaws", "all_pieces_and_flaws"])) return false;
      if ((values.homeKitchenPieceBand ?? "").trim() === "multi_piece" && !reqText("kitInventoryChecklist", 6)) return false;
    }
  }


  // Music & Audio P0 gates by shelf.
  if (category.trim() === "Music & Audio" && modes?.rent) {
    const sub = subcategory.trim();
    const reqSelect = (key: string, allowed: string[]) => allowed.includes((values[key] ?? "").trim());
    const reqText = (key: string, min = 3) => (values[key] ?? "").trim().length >= min;

    if (!reqText("model", 1)) return false;

    const powered = new Set(["Keyboards","Portable Speakers","Amplifiers","Mixing Consoles","Studio Monitors","PA Systems","Recording Gear"]);
    if (powered.has(sub) && !reqSelect("powerBand", ["under_50w","50_200w","200_1000w","1000w_plus","passive_unpowered"])) return false;

    if (sub === "Guitars & Bass") {
      if (!reqSelect("caseIncluded", ["hard_case","soft_gig_bag","flight_case","no_case","case_optional_add_on"])) return false;
      if (!reqSelect("guitarInstrumentForm", ["acoustic_steel","classical_nylon","solid_body_electric","hollow_semi","bass_4_string","bass_5_plus","acoustic_electric","other_guitar_bass"])) return false;
      if (!reqSelect("guitarCableIncluded", ["cable_included","cable_not_included","instrument_wireless_only","ask_at_handoff"])) return false;
      if (!reqSelect("stringConditionBand", ["fresh_new","good_playable","worn_replace_soon","unknown_ask_host"])) return false;
    }
    if (sub === "Keyboards") {
      if (!reqSelect("caseIncluded", ["hard_case","soft_gig_bag","flight_case","no_case","case_optional_add_on"])) return false;
      if (!reqSelect("keyboardType", ["digital_piano","synth","midi_controller","organ_stage","workstation","arranger","other_keyboard"])) return false;
      if (!reqSelect("keyCountBand", ["keys_25","keys_49","keys_61","keys_76","keys_88","keys_other"])) return false;
      if (!reqSelect("standPedalIncluded", ["stand_and_pedals","stand_only","pedals_only","neither_renter_provides","built_in_console"])) return false;
    }
    if (sub === "Drums") {
      if (!reqSelect("drumKitForm", ["acoustic_full_kit","e_kit","snare_only","cymbal_pack","hardware_only","percussion_hand","other_drums"])) return false;
      if (!reqSelect("drumPieceBand", ["single_piece","pieces_2_4","pieces_5_8","pieces_9_plus","full_kit_unknown_count"])) return false;
      if (!reqSelect("drumHardwareIncluded", ["full_hardware_throne_pedals","stands_only","pedals_only","no_hardware","e_kit_module_rack"])) return false;
      if ((values.drumPieceBand ?? "").trim() !== "single_piece" && !reqText("kitInventoryChecklist", 6)) return false;
    }
    if (sub === "Portable Speakers") {
      if (!reqSelect("portableSpeakerForm", ["bluetooth_party","battery_bluetooth","wired_bookshelf","soundbar","pa_lite_portable","other_portable_speaker"])) return false;
      if (!reqSelect("speakerPowerSource", ["battery_only","ac_only","battery_and_ac","passive_needs_amp"])) return false;
      if (!reqSelect("outdoorSplashBand", ["indoor_only","covered_patio_ok","splash_resistant","unknown_keep_dry"])) return false;
      if (!reqSelect("batteryReturnChargeBand", ["return_full","return_as_received","return_above_50","ac_powered_na","host_sets_at_handoff"])) return false;
    }
    if (sub === "Microphones") {
      if (!reqSelect("caseIncluded", ["hard_case","soft_gig_bag","flight_case","no_case","case_optional_add_on"])) return false;
      if (!reqSelect("micType", ["dynamic_handheld","condenser","wireless_handheld","lavalier","usb_podcast","ribbon","shotgun","other_mic"])) return false;
      if (!reqSelect("phantomPowerNeeded", ["needs_48v","no_phantom","optional_48v","battery_powered_mic","ask_host"])) return false;
      if (!reqSelect("micClipCableIncluded", ["xlr_and_clip","cable_only","clip_only","wireless_receiver_kit","none_renter_provides"])) return false;
      if (!reqSelect("micHygieneWipePolicy", ["wipe_grille_before_return","host_sanitizes_grille","disposable_cover_required","not_mouth_contact"])) return false;
    }
    if (sub === "Amplifiers") {
      if (!reqSelect("ampForm", ["guitar_combo","guitar_head","guitar_cab","bass_combo","bass_head_cab","keyboard_amp","power_amp_only","other_amp"])) return false;
      if (!reqSelect("ampTubeSolidState", ["solid_state","tube","hybrid","modeling_digital","unknown_ask_host"])) return false;
      if (!reqSelect("cabIncludedBand", ["combo_built_in","matching_cab_included","cab_not_included","head_only","cab_only_listing"])) return false;
    }
    if (sub === "Mixing Consoles") {
      if (!reqSelect("mixerChannelBand", ["ch_under_8","ch_8_16","ch_16_24","ch_24_32","ch_32_plus","digital_scene_mixer"])) return false;
      if (!reqSelect("mixerPoweredBand", ["powered_mixer","unpowered_needs_speakers","digital_mixer_stagebox","ask_host"])) return false;
      if (!reqSelect("phantomPowerNeeded", ["needs_48v","no_phantom","optional_48v","battery_powered_mic","ask_host"])) return false;
    }
    if (sub === "Studio Monitors") {
      if (!reqSelect("monitorPairBand", ["single_monitor","matched_pair","2_1_with_sub","surround_set","ask_host"])) return false;
      if (!reqSelect("monitorStandsIncluded", ["stands_included","isolation_pads_only","stands_not_included","desktop_nearfield_na"])) return false;
    }
    if (sub === "PA Systems") {
      if (!reqText("paCableStandInventory", 6)) return false;
      if (!reqSelect("paSpeakerCountBand", ["pa_1_2","pa_3_4","pa_5_8","pa_9_plus","line_array_ask_host"])) return false;
      if (!reqSelect("paMixerIncluded", ["mixer_included","mixer_not_included","powered_speakers_only","ask_at_handoff"])) return false;
      if (!reqSelect("outdoorPaUsePolicy", ["indoor_only","covered_outdoor_ok","full_outdoor_weather_risk","host_sets_at_handoff"])) return false;
    }
    if (sub === "Recording Gear") {
      if (!reqSelect("caseIncluded", ["hard_case","soft_gig_bag","flight_case","no_case","case_optional_add_on"])) return false;
      if (!reqSelect("recordingGearType", ["audio_interface","preamp","field_recorder","midi_controller_daw","mic_pre_bundle","outboard_fx","other_recording"])) return false;
      if (!reqSelect("recordingIoBand", ["io_2in_2out","io_4_8","io_8_plus","usb_simple","not_an_interface","ask_host"])) return false;
      if (!reqSelect("phantomPowerNeeded", ["needs_48v","no_phantom","optional_48v","battery_powered_mic","ask_host"])) return false;
    }
    if (sub === "Other") {
      if (!reqSelect("musicOtherKind", ["instrument_other","live_sound_other","studio_other","cable_stand_accessory","mixed_music_kit","prefer_named_shelf"])) return false;
      if (!reqText("kitInventoryChecklist", 6)) return false;
    }
  }

  return true;
}
