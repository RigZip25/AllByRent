import type { CategoryGlyphId } from "../../components/categoryGlyphs";
import type { SubcategoryArtId } from "../../components/subcategoryArt";
import { finalizeRentalPriceSuggestion } from "../../lib/listingPricingAdvice";

export type CategoryGrade = "personal" | "professional";

export type SubcategoryItem = {
  label: string;
  emoji: string;
  /** Custom SVG when Unicode emoji is a poor match. */
  glyph?: CategoryGlyphId;
  /** Illustration, once one has been drawn for this shelf. */
  art?: SubcategoryArtId;
};

export type CategoryData = {
  icon: string;
  personal: SubcategoryItem[];
  professional: SubcategoryItem[];
};

/** Shorthand for subcategory rows — last slot is always Other (➕). */
function sub(label: string, emoji: string, glyph?: CategoryGlyphId): SubcategoryItem {
  return glyph ? { label, emoji, glyph } : { label, emoji };
}

/** A shelf whose illustration is drawn; the emoji stays as the fallback. */
function subArt(label: string, emoji: string, art: SubcategoryArtId): SubcategoryItem {
  return { label, emoji, art };
}

export const CATEGORIES: Record<string, CategoryData> = {
  "Tools & DIY": {
    icon: "🔧",
    personal: [
      subArt("Hand Tools", "🛠️", "tools-hand-tools"),
      subArt("Power Drills", "🔩", "tools-power-drills"),
      subArt("Measuring Tools", "📏", "tools-measuring-tools"),
      subArt("Ladders", "🪜", "tools-ladders"),
      subArt("Painting Tools", "🖌️", "tools-painting-tools"),
      subArt("Other", "➕", "tools-other"),
    ],
    professional: [
      subArt("Industrial Drills", "⚙️", "tools-industrial-drills"),
      subArt("Welding Equipment", "🔥", "tools-welding-equipment"),
      subArt("Scaffolding Systems", "🧱", "tools-scaffolding-systems"),
      subArt("Laser Measuring", "🔦", "tools-laser-measuring"),
      subArt("Power Saws", "🪚", "tools-power-saws"),
      subArt("Other", "➕", "tools-other"),
    ],
  },
  "Photo & Video": {
    icon: "📷",
    personal: [
      subArt("Camera Kits", "📷", "photo-camera-kits"),
      subArt("Action Cameras", "📹", "photo-action-cameras"),
      subArt("Tripods & Mounts", "📷", "photo-tripods-mounts"),
      subArt("Basic Lighting", "💡", "photo-basic-lighting"),
      subArt("Drones", "🚁", "photo-drones"),
      subArt("Other", "➕", "photo-other"),
    ],
    professional: [
      subArt("Cinema Cameras", "🎞️", "photo-cinema-cameras"),
      subArt("Professional Lenses", "🔭", "photo-professional-lenses"),
      subArt("Studio Lighting", "🔦", "photo-studio-lighting"),
      subArt("Stabilizers & Rigs", "🎥", "photo-stabilizers-rigs"),
      subArt("Broadcast Gear", "📡", "photo-broadcast-gear"),
      subArt("Other", "➕", "photo-other"),
    ],
  },
  "Electronics & Tech": {
    icon: "💻",
    personal: [
      subArt("Laptops", "💻", "tech-laptops"),
      subArt("Projectors", "📽️", "tech-projectors"),
      subArt("Smart Home Devices", "🏡", "tech-smart-home-devices"),
      subArt("Gaming Gear", "🎮", "tech-gaming-gear"),
      subArt("Speakers", "🔊", "tech-speakers"),
      subArt("Other", "➕", "tech-other"),
    ],
    professional: [
      subArt("Servers & Workstations", "🖥️", "tech-servers-workstations"),
      subArt("Pro Audio", "🎧", "tech-pro-audio"),
      subArt("Broadcast Equipment", "📺", "tech-broadcast-equipment"),
      subArt("Network Gear", "🔌", "tech-network-gear"),
      subArt("Display Systems", "📺", "tech-display-systems"),
      subArt("Other", "➕", "tech-other"),
    ],
  },
  "Home & Kitchen": {
    icon: "🍳",
    personal: [
      subArt("Coffee Makers", "☕", "home-coffee-makers"),
      subArt("Baking Equipment", "🧁", "home-baking-equipment"),
      subArt("Stand Mixers", "🥣", "home-stand-mixers"),
      subArt("Blenders & Juicers", "🍹", "home-blenders-juicers"),
      subArt("Cleaning Appliances", "🧹", "home-cleaning-appliances"),
      subArt("Other", "➕", "home-other"),
    ],
    professional: [
      subArt("Commercial Coffee", "☕", "home-commercial-coffee"),
      subArt("Catering Equipment", "🍽️", "home-catering-equipment"),
      subArt("Industrial Mixers", "🏭", "home-industrial-mixers"),
      subArt("Food Processors Pro", "🥗", "home-food-processors-pro"),
      subArt("Beverage Systems", "🧃", "home-beverage-systems"),
      subArt("Other", "➕", "home-other"),
    ],
  },
  "Outdoor & Camping": {
    icon: "⛺",
    personal: [
      subArt("Tents", "⛺", "outdoor-tents"),
      subArt("Sleeping Bags", "🛌", "outdoor-sleeping-bags"),
      subArt("Backpacks", "🎒", "outdoor-backpacks"),
      subArt("Camp Cooking", "🍳", "outdoor-camp-cooking"),
      subArt("Navigation & GPS", "🧭", "outdoor-navigation-gps"),
      subArt("Other", "➕", "outdoor-other"),
    ],
    professional: [
      subArt("Expedition Tents", "🏔️", "outdoor-expedition-tents"),
      subArt("Survival Gear", "🩹", "outdoor-survival-gear"),
      subArt("Group Shelters", "🏕️", "outdoor-group-shelters"),
      subArt("Professional Navigation", "🛰️", "outdoor-professional-navigation"),
      subArt("Base Camp Equipment", "⛺", "outdoor-base-camp-equipment"),
      subArt("Other", "➕", "outdoor-other"),
    ],
  },
  "Sports & Recreation": {
    icon: "🏄",
    personal: [
      subArt("Snow Sports", "⛷️", "sports-snow-sports"),
      subArt("Water Sports", "🏄", "sports-water-sports"),
      subArt("Racket Sports", "🎾", "sports-racket-sports"),
      subArt("Skating", "🛼", "sports-skating"),
      subArt("Fishing Gear", "🎣", "sports-fishing-gear"),
      subArt("Other", "➕", "sports-other"),
    ],
    professional: [
      subArt("Competition Gear", "🏆", "sports-competition-gear"),
      subArt("Coaching Equipment", "📣", "sports-coaching-equipment"),
      subArt("Timing Systems", "⏱️", "sports-timing-systems"),
      subArt("Pro Water Sports", "🚤", "sports-pro-water-sports"),
      subArt("Team Sports Gear", "⚽", "sports-team-sports-gear"),
      subArt("Other", "➕", "sports-other"),
    ],
  },
  "Bikes & Scooters": {
    icon: "🚲",
    personal: [
      subArt("Mountain Bikes", "🚵", "bikes-mountain-bikes"),
      subArt("Road Bikes", "🚴", "bikes-road-bikes"),
      subArt("E-Bikes", "⚡", "bikes-e-bikes"),
      subArt("Kids Bikes", "🚲", "bikes-kids-bikes"),
      subArt("Electric Scooters", "🛴", "bikes-electric-scooters"),
      subArt("Cruisers", "🏖️", "bikes-cruisers"),
      subArt("Other", "➕", "bikes-other"),
    ],
    professional: [
      subArt("E-Bikes Pro", "⚡", "bikes-e-bikes-pro"),
      subArt("Racing Bikes", "🏁", "bikes-racing-bikes"),
      subArt("Cargo Bikes", "📦", "bikes-cargo-bikes"),
      subArt("Professional Scooters", "🛵", "bikes-professional-scooters"),
      subArt("Adaptive Bikes", "♿", "bikes-adaptive-bikes"),
      subArt("Other", "➕", "bikes-other"),
    ],
  },
  Vehicles: {
    icon: "🚗",
    personal: [
      subArt("Cars & Trucks", "🛻", "vehicles-cars-trucks"),
      subArt("Motorcycles", "🏍️", "vehicles-motorcycles"),
      subArt("Trailers", "🛞", "vehicles-trailers"),
      subArt("ATVs", "🏔️", "vehicles-atvs"),
      subArt("RVs & Campers", "🚐", "vehicles-rvs-campers"),
      subArt("Other", "➕", "vehicles-other"),
    ],
    professional: [
      subArt("Commercial Trucks", "🚛", "vehicles-commercial-trucks"),
      subArt("Cargo Vans", "🚐", "vehicles-cargo-vans"),
      subArt("Equipment Trailers", "📦", "vehicles-equipment-trailers"),
      subArt("Special Vehicles", "🚨", "vehicles-special-vehicles"),
      subArt("Tow Vehicles", "🚛", "vehicles-tow-vehicles"),
      subArt("Other", "➕", "vehicles-other"),
    ],
  },
  "Boats & Water": {
    icon: "⛵",
    personal: [
      subArt("Kayaks & Canoes", "🛶", "boats-kayaks-canoes"),
      subArt("SUP Boards", "🏄", "boats-sup-boards"),
      subArt("Fishing Boats", "⚓", "boats-fishing-boats"),
      subArt("Inflatable Boats", "🛟", "boats-inflatable-boats"),
      subArt("Jet Skis", "🚤", "boats-jet-skis"),
      subArt("Other", "➕", "boats-other"),
    ],
    professional: [
      subArt("Motorboats", "🛥️", "boats-motorboats"),
      subArt("Pontoon Boats", "⛴️", "boats-pontoon-boats"),
      subArt("Commercial Fishing", "🐟", "boats-commercial-fishing"),
      subArt("Dive Boats", "🤿", "boats-dive-boats"),
      subArt("Charter Vessels", "🛳️", "boats-charter-vessels"),
      subArt("Other", "➕", "boats-other"),
    ],
  },
  "Garden & Yard": {
    icon: "🌿",
    personal: [
      subArt("Lawn Mowers", "🌿", "garden-lawn-mowers"),
      subArt("Trimmers", "✂️", "garden-trimmers"),
      subArt("Leaf Blowers", "🍃", "garden-leaf-blowers"),
      subArt("Garden Tools", "🧰", "garden-garden-tools"),
      subArt("Sprinklers", "💦", "garden-sprinklers"),
      subArt("Trees", "🌳", "garden-trees"),
      subArt("Shrubs & Bushes", "🌲", "garden-shrubs-bushes"),
      subArt("Perennials", "🌺", "garden-perennials"),
      subArt("Seasonal Flowers", "🌸", "garden-seasonal-flowers"),
      subArt("Houseplants & Seedlings", "🪴", "garden-houseplants-seedlings"),
      subArt("Other", "➕", "garden-other"),
    ],
    professional: [
      subArt("Ride-On Mowers", "🚜", "garden-ride-on-mowers"),
      subArt("Tillers & Cultivators", "⚙️", "garden-tillers-cultivators"),
      subArt("Stump Grinders", "🪵", "garden-stump-grinders"),
      subArt("Irrigation Systems", "🚰", "garden-irrigation-systems"),
      subArt("Landscape Equipment", "🌳", "garden-landscape-equipment"),
      subArt("Nursery Stock", "🌱", "garden-nursery-stock"),
      subArt("Other", "➕", "garden-other"),
    ],
  },
  "Party & Events": {
    icon: "🎉",
    personal: [
      subArt("Tables & Chairs", "🪑", "party-tables-chairs"),
      subArt("Tents & Canopies", "⛱️", "party-tents-canopies"),
      subArt("Party Decor", "🎈", "party-party-decor"),
      subArt("Games & Activities", "🎯", "party-games-activities"),
      subArt("Serving Equipment", "🍴", "party-serving-equipment"),
      subArt("Other", "➕", "party-other"),
    ],
    professional: [
      subArt("Stage & Risers", "🪜", "party-stage-risers"),
      subArt("Sound Systems", "🔊", "party-sound-systems"),
      subArt("Event Lighting", "✨", "party-event-lighting"),
      subArt("Photo Booths", "📸", "party-photo-booths"),
      subArt("Catering Equipment", "🍽️", "party-catering-equipment"),
      subArt("Other", "➕", "party-other"),
    ],
  },
  "Music & Audio": {
    icon: "🎸",
    personal: [
      subArt("Guitars & Bass", "🎸", "music-guitars-bass"),
      subArt("Keyboards", "🎹", "music-keyboards"),
      subArt("Drums", "🥁", "music-drums"),
      subArt("Portable Speakers", "🔉", "music-portable-speakers"),
      subArt("Microphones", "🎤", "music-microphones"),
      subArt("Other", "➕", "music-other"),
    ],
    professional: [
      subArt("Amplifiers", "🔊", "music-amplifiers"),
      subArt("Mixing Consoles", "🎛️", "music-mixing-consoles"),
      subArt("Studio Monitors", "🔈", "music-studio-monitors"),
      subArt("PA Systems", "📣", "music-pa-systems"),
      subArt("Recording Gear", "🎙️", "music-recording-gear"),
      subArt("Other", "➕", "music-other"),
    ],
  },
  "Gym & Fitness": {
    icon: "💪",
    personal: [
      subArt("Yoga & Pilates", "🧘", "gym-yoga-pilates"),
      subArt("Cardio Equipment", "🏃", "gym-cardio-equipment"),
      subArt("Free Weights", "🏋️", "gym-free-weights"),
      subArt("Resistance Bands", "🪢", "gym-resistance-bands"),
      subArt("Recovery Tools", "🧊", "gym-recovery-tools"),
      subArt("Other", "➕", "gym-other"),
    ],
    professional: [
      subArt("Commercial Treadmills", "👟", "gym-commercial-treadmills"),
      subArt("Weight Machines", "🔩", "gym-weight-machines"),
      subArt("Boxing Equipment", "🥊", "gym-boxing-equipment"),
      subArt("Competition Gear", "🥇", "gym-competition-gear"),
      subArt("Training Systems", "📋", "gym-training-systems"),
      subArt("Other", "➕", "gym-other"),
    ],
  },
  "Baby & Kids": {
    icon: "🍼",
    personal: [
      subArt("Strollers", "🚼", "baby-strollers"),
      subArt("Car Seats", "🚗", "baby-car-seats"),
      subArt("Cribs & Beds", "🛏️", "baby-cribs-beds"),
      subArt("Baby Carriers", "👶", "baby-baby-carriers"),
      subArt("Toys & Games", "🧸", "baby-toys-games"),
      subArt("Other", "➕", "baby-other"),
    ],
    professional: [
      subArt("Commercial Play Equipment", "🛝", "baby-commercial-play-equipment"),
      subArt("Group Activity Gear", "🎨", "baby-group-activity-gear"),
      subArt("Educational Tools", "📚", "baby-educational-tools"),
      subArt("Safety Systems", "🔒", "baby-safety-systems"),
      subArt("Childcare Equipment", "🍼", "baby-childcare-equipment"),
      subArt("Other", "➕", "baby-other"),
    ],
  },
  "Office & Business": {
    icon: "🖨️",
    personal: [
      subArt("Printers", "🖨️", "office-printers"),
      subArt("Monitors & Displays", "🖥️", "office-monitors-displays"),
      subArt("Webcams & Streaming", "📹", "office-webcams-streaming"),
      subArt("Office Furniture", "🪑", "office-office-furniture"),
      subArt("Presentation Gear", "📊", "office-presentation-gear"),
      subArt("Other", "➕", "office-other"),
    ],
    professional: [
      subArt("Large Format Printers", "🖼️", "office-large-format-printers"),
      subArt("POS Systems", "💳", "office-pos-systems"),
      subArt("Commercial Copiers", "📑", "office-commercial-copiers"),
      subArt("Conference Systems", "🎙️", "office-conference-systems"),
      subArt("Server Equipment", "🗄️", "office-server-equipment"),
      subArt("Other", "➕", "office-other"),
    ],
  },
  "Heavy Equipment": {
    icon: "🏭",
    personal: [
      subArt("Generators", "⚡", "heavy-generators"),
      subArt("Air Compressors", "💨", "heavy-air-compressors"),
      subArt("Pressure Washers", "💦", "heavy-pressure-washers"),
      subArt("Winches", "🪝", "heavy-winches"),
      subArt("Pumps", "💧", "heavy-pumps"),
      subArt("Other", "➕", "heavy-other"),
    ],
    professional: [
      subArt("Industrial Generators", "🔋", "heavy-industrial-generators"),
      subArt("Forklifts", "📦", "heavy-forklifts"),
      subArt("Industrial Compressors", "💨", "heavy-industrial-compressors"),
      subArt("Hydraulic Equipment", "🛢️", "heavy-hydraulic-equipment"),
      subArt("Heavy Pumps", "💧", "heavy-heavy-pumps"),
      subArt("Other", "➕", "heavy-other"),
    ],
  },
  Construction: {
    icon: "🏗️",
    personal: [
      sub("Concrete Mixers", "🧱", "concrete-mixer"),
      sub("Safety Equipment", "🦺"),
      sub("Site Lighting", "🔦"),
      sub("Hand Tools Pro", "🔨"),
      sub("Formwork Basic", "🪵"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Large Concrete Equipment", "🚧"),
      sub("Crane & Lifting", "🏗️"),
      sub("Professional Formwork", "🪵"),
      sub("Excavation Tools", "⛏️"),
      sub("Structural Equipment", "🧱"),
      sub("Other", "➕"),
    ],
  },
  "Costume & Cosplay": {
    icon: "🎭",
    personal: [
      subArt("Halloween Costumes", "🎃", "costume-halloween-costumes"),
      subArt("Character Costumes", "🦸", "costume-character-costumes"),
      subArt("Wigs & Accessories", "💇", "costume-wigs-accessories"),
      subArt("Period Costumes", "👘", "costume-period-costumes"),
      subArt("Masks & Makeup", "🎭", "costume-masks-makeup"),
      subArt("Other", "➕", "costume-other"),
    ],
    professional: [
      subArt("Theater Costumes", "🎭", "costume-theater-costumes"),
      subArt("Film & TV Props", "🎬", "costume-film-tv-props"),
      subArt("Professional Makeup Kits", "💄", "costume-professional-makeup-kits"),
      subArt("Animatronic Props", "🤖", "costume-animatronic-props"),
      subArt("Full Character Suits", "🦹", "costume-full-character-suits"),
      subArt("Other", "➕", "costume-other"),
    ],
  },
  "Real Estate": {
    icon: "🏠",
    personal: [
      subArt("Rooms & Spaces", "🛋️", "estate-rooms-spaces"),
      subArt("Garages & Storage", "🚗", "estate-garages-storage"),
      subArt("Parking Spots", "🅿️", "estate-parking-spots"),
      subArt("Shared Offices", "💼", "estate-shared-offices"),
      subArt("Backyard & Outdoor", "🌳", "estate-backyard-outdoor"),
      subArt("Other", "➕", "estate-other"),
    ],
    professional: [
      subArt("Commercial Space", "🏢", "estate-commercial-space"),
      subArt("Event Venues", "🎪", "estate-event-venues"),
      subArt("Studio Space", "🎬", "estate-studio-space"),
      subArt("Warehouse & Storage", "📦", "estate-warehouse-storage"),
      subArt("Retail Space", "🏪", "estate-retail-space"),
      subArt("Other", "➕", "estate-other"),
    ],
  },
  "Unique & Other": {
    icon: "🎁",
    personal: [
      subArt("Collectibles", "🏺", "unique-collectibles"),
      subArt("Art & Sculpture", "🎨", "unique-art-sculpture"),
      subArt("Hobby Equipment", "🧩", "unique-hobby-equipment"),
      subArt("Unusual Items", "🎲", "unique-unusual-items"),
      subArt("Seasonal Items", "🎄", "unique-seasonal-items"),
      subArt("Other", "➕", "unique-other"),
    ],
    professional: [
      subArt("Specialty Equipment", "🧰", "unique-specialty-equipment"),
      subArt("Industrial Oddities", "⚙️", "unique-industrial-oddities"),
      subArt("Professional Props", "🎬", "unique-professional-props"),
      subArt("Rare Instruments", "🎻", "unique-rare-instruments"),
      subArt("Custom Builds", "🛠️", "unique-custom-builds"),
      subArt("Other", "➕", "unique-other"),
    ],
  },
};

/**
 * Display / browse order — high neighborhood demand & share potential first.
 * Keep in sync when adding categories to CATEGORIES.
 */
export const CATEGORY_DISPLAY_ORDER = [
  "Tools & DIY",
  "Garden & Yard",
  "Home & Kitchen",
  "Baby & Kids",
  "Party & Events",
  "Sports & Recreation",
  "Outdoor & Camping",
  "Electronics & Tech",
  "Photo & Video",
  "Bikes & Scooters",
  "Gym & Fitness",
  "Music & Audio",
  "Vehicles",
  "Costume & Cosplay",
  "Office & Business",
  "Construction",
  "Heavy Equipment",
  "Boats & Water",
  "Real Estate",
  "Unique & Other",
] as const satisfies readonly (keyof typeof CATEGORIES)[];

function orderedCategoryNames(): (keyof typeof CATEGORIES)[] {
  const known = new Set<string>(Object.keys(CATEGORIES));
  const ordered: (keyof typeof CATEGORIES)[] = [];
  for (const name of CATEGORY_DISPLAY_ORDER) {
    if (known.has(name)) {
      ordered.push(name);
      known.delete(name);
    }
  }
  // Any newly added category not yet in DISPLAY_ORDER still appears (before Unique).
  for (const name of known) {
    if (name === "Unique & Other") continue;
    ordered.push(name as keyof typeof CATEGORIES);
  }
  if (known.has("Unique & Other")) ordered.push("Unique & Other");
  return ordered;
}

export const CATEGORY_NAMES = orderedCategoryNames();

export type ListingCategory = keyof typeof CATEGORIES;

export function getSubcategories(
  category: string,
  grade: CategoryGrade | "",
): SubcategoryItem[] {
  if (!category || !grade) return [];
  const data = CATEGORIES[category];
  if (!data) return [];
  return data[grade];
}

/** All subcategories for a category — personal + professional, de-duplicated by label. */
export function getMergedSubcategories(category: string): SubcategoryItem[] {
  if (!category.trim()) return [];
  const data = CATEGORIES[category];
  if (!data) return [];
  const seen = new Set<string>();
  const merged: SubcategoryItem[] = [];
  for (const sub of [...data.personal, ...data.professional]) {
    if (seen.has(sub.label)) continue;
    seen.add(sub.label);
    merged.push(sub);
  }
  return merged;
}

/** Infer grade from which shelf the subcategory lives on; empty if it appears on both. */
export function gradeForSubcategory(
  category: string,
  subcategoryLabel: string,
): CategoryGrade | "" {
  const data = CATEGORIES[category];
  if (!data || !subcategoryLabel.trim()) return "";
  const inPersonal = data.personal.some((sub) => sub.label === subcategoryLabel);
  const inProfessional = data.professional.some((sub) => sub.label === subcategoryLabel);
  if (inPersonal && inProfessional) return "";
  if (inProfessional) return "professional";
  if (inPersonal) return "personal";
  return "";
}

export function getSubcategoryLabels(
  category: string,
  grade: CategoryGrade | "",
): string[] {
  return getSubcategories(category, grade).map((item) => item.label);
}

function matchOption<T extends string>(options: readonly T[], aiValue: string): T | "" {
  const normalized = aiValue.trim().toLowerCase();
  if (!normalized) return "";

  const exact = options.find((opt) => opt.toLowerCase() === normalized);
  if (exact) return exact;

  const partial = options.find(
    (opt) =>
      opt.toLowerCase().includes(normalized) ||
      normalized.includes(opt.toLowerCase()),
  );
  if (partial) return partial;

  const words = normalized.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
  const wordMatch = options.find((opt) => {
    const optLower = opt.toLowerCase();
    return words.some((word) => {
      const stems = [word];
      if (word.endsWith("s") && word.length > 3) {
        stems.push(word.slice(0, -1));
      }
      return stems.some((stem) => stem.length >= 3 && optLower.includes(stem));
    });
  });

  return wordMatch ?? "";
}

export function matchListingCategory(value: string): ListingCategory | "" {
  const match = matchOption(CATEGORY_NAMES, value);
  return match || "";
}

export function matchListingSubcategory(
  category: string,
  grade: CategoryGrade | "",
  value: string,
): string {
  const labels = getSubcategoryLabels(category, grade);
  if (!labels.length) return "";
  return matchOption(labels, value);
}

export function categoryGridLabel(name: string): string {
  const ampersand = name.indexOf(" & ");
  if (ampersand > 0 && ampersand <= 14) {
    return name.slice(0, ampersand);
  }
  return name;
}

export function categoryIdFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type CategoryModeKey = "rent" | "sell" | "rentToOwn" | "gift";

export type CategoryModeRules = {
  rent: boolean;
  sell: boolean;
  rentToOwn: boolean;
  gift: boolean;
  replacementValueLabel: string;
  replacementValueHelper: string;
  showDailyRate: boolean;
  showMonthlyRate: boolean;
};

const DEFAULT_CATEGORY_MODES: CategoryModeRules = {
  rent: true,
  sell: true,
  rentToOwn: false,
  gift: true,
  replacementValueLabel: "Estimated Replacement Value",
  replacementValueHelper: "Cost to buy new — used for deposit protection ceiling",
  showDailyRate: true,
  showMonthlyRate: true,
};

export const CATEGORY_MODES: Record<string, CategoryModeRules> = {
  "Tools & DIY": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Photo & Video": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Electronics & Tech": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Home & Kitchen": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Outdoor & Camping": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Sports & Recreation": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Bikes & Scooters": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Music & Audio": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Gym & Fitness": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Baby & Kids": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Office & Business": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Garden & Yard": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Unique & Other": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Party & Events": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: false,
  },
  "Costume & Cosplay": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Estimated Replacement Value",
    replacementValueHelper: "Cost to buy new",
    showDailyRate: true,
    showMonthlyRate: false,
  },
  Vehicles: {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Market Value",
    replacementValueHelper: "Current market value of this vehicle",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Boats & Water": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Market Value",
    replacementValueHelper: "Current market value",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Heavy Equipment": {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Replacement Cost",
    replacementValueHelper: "Cost to replace if damaged or lost",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  Construction: {
    rent: true,
    sell: true,
    rentToOwn: false,
    gift: true,
    replacementValueLabel: "Replacement Cost",
    replacementValueHelper: "Cost to replace if damaged or lost",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Real Estate": {
    rent: true,
    sell: false,
    rentToOwn: false,
    gift: false,
    replacementValueLabel: "Monthly Market Rate",
    replacementValueHelper: "Typical monthly rental price for this space in your area",
    showDailyRate: false,
    showMonthlyRate: true,
  },
};

export function getCategoryModeRules(
  category: string,
  _subcategory = "",
): CategoryModeRules {
  return CATEGORY_MODES[category] ?? DEFAULT_CATEGORY_MODES;
}

export function categoryHasRestrictedModes(
  category: string,
  subcategory = "",
): boolean {
  const rules = getCategoryModeRules(category, subcategory);
  return !rules.rent || !rules.sell || !rules.gift;
}

/** Period-tier rental pricing — always prefer a daily rate (checkout is daily × days). */
function calculateTieredRentalPrices(
  v: number,
  d: number,
  minimumPeriod: string,
  dailyPct: number,
  weeklyPct: number,
  monthlyPct: number,
  depositPct: number,
): { daily: number; weekly: number; monthly: number; deposit: number } {
  let daily = 0;
  let weekly = 0;
  let monthly = 0;

  if (minimumPeriod === "1 month") {
    monthly = Math.round(v * monthlyPct * d);
    daily = Math.round(monthly / 30);
    weekly = Math.round(daily * 5);
  } else {
    daily = Math.round(v * dailyPct * d);
    weekly = Math.round(v * weeklyPct * d) || Math.round(daily * 5);
    monthly = Math.round(v * monthlyPct * d) || Math.round(weekly * 3.5);
  }

  return { daily, weekly, monthly, deposit: Math.round(v * depositPct) };
}

export function calculateRentalPrices(
  category: string,
  value: number,
  minimumPeriod: string = "1 week",
  options?: { insuranceMaxDeductible?: string | null },
): { daily: number; weekly: number; monthly: number; deposit: number } {
  const v = value;
  const d = 0.85;
  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  let deposit = 0;

  switch (category) {
    case "Tools & DIY": {
      const pct = v < 200 ? 0.14 : v < 500 ? 0.27 : v < 2000 ? 0.18 : 0.1;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 4.0);
      monthly = Math.round(daily * 12);
      deposit = Math.round(v * 0.25);
      break;
    }
    case "Garden & Yard": {
      const pct = v < 300 ? 0.18 : v < 800 ? 0.12 : v < 3000 ? 0.08 : 0.05;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 4.0);
      monthly = Math.round(daily * 12);
      deposit = Math.round(v * 0.2);
      break;
    }
    case "Construction": {
      const pct = v < 1000 ? 0.12 : v < 5000 ? 0.09 : 0.06;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 4.0);
      monthly = Math.round(daily * 12);
      deposit = Math.round(v * 0.25);
      break;
    }
    case "Heavy Equipment": {
      const pct = v < 2000 ? 0.1 : v < 8000 ? 0.07 : 0.03;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 4.0);
      monthly = Math.round(daily * 12);
      deposit = Math.round(v * 0.3);
      break;
    }
    case "Photo & Video": {
      const pct = v < 400 ? 0.14 : v < 1500 ? 0.11 : v < 5000 ? 0.06 : 0.04;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 5.0);
      monthly = Math.round(daily * 16);
      deposit = Math.round(v * 0.3);
      break;
    }
    case "Bikes & Scooters": {
      const pct = v < 300 ? 0.08 : v < 800 ? 0.05 : v < 3000 ? 0.03 : 0.02;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 5.0);
      monthly = Math.round(daily * 18);
      deposit = Math.round(v * 0.25);
      break;
    }
    case "Vehicles": {
      const pct = v < 10000 ? 0.007 : v < 30000 ? 0.004 : v < 60000 ? 0.003 : 0.002;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 5.5);
      monthly = Math.round(daily * 20);
      deposit = Math.round(v * 0.3);
      break;
    }
    case "Boats & Water": {
      const pct = v < 1000 ? 0.1 : v < 5000 ? 0.06 : 0.02;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 5.0);
      monthly = Math.round(daily * 18);
      deposit = Math.round(v * 0.3);
      break;
    }
      case "Outdoor & Camping": {
      const pct = v < 200 ? 0.12 : v < 600 ? 0.09 : v < 1500 ? 0.07 : 0.05;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 4.5);
      // Long stays for camping gear: stay well under buying new
      monthly = Math.round(Math.min(daily * 10, v * 0.45));
      deposit = Math.round(v * 0.2);
      break;
    }
    case "Sports & Recreation": {
      const pct = v < 200 ? 0.14 : v < 600 ? 0.1 : v < 2000 ? 0.07 : 0.05;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 4.5);
      monthly = Math.round(daily * 14);
      deposit = Math.round(v * 0.2);
      break;
    }
    case "Music & Audio": {
      const monthlyPct = v < 300 ? 0.1 : v < 800 ? 0.08 : v < 3000 ? 0.06 : 0.04;
      monthly = Math.round(v * monthlyPct * d);
      daily = Math.round(v * (monthlyPct * 0.8) * d);
      weekly = Math.round(daily * 4.5);
      deposit = Math.round(v * 0.25);
      break;
    }
    case "Party & Events": {
      const pct = v < 300 ? 0.18 : v < 1000 ? 0.16 : 0.12;
      daily = Math.round(v * pct * d);
      weekly = Math.round(daily * 3.5);
      monthly = 0;
      deposit = Math.round(v * 0.25);
      break;
    }
    case "Costume & Cosplay": {
      daily = Math.round(v * 0.15 * d);
      weekly = Math.round(daily * 3.0);
      monthly = 0;
      deposit = Math.round(v * 0.2);
      break;
    }
    case "Electronics & Tech": {
      daily = Math.round(v * 0.25 * d);
      weekly = Math.round(v * 0.045 * d) || Math.round(daily * 5);
      monthly = Math.round(v * 0.13 * d) || Math.round(weekly * 3.5);
      if (minimumPeriod === "1 month") {
        daily = Math.round(monthly / 30);
      }
      deposit = Math.round(v * 0.25);
      break;
    }
    case "Home & Kitchen": {
      ({ daily, weekly, monthly, deposit } = calculateTieredRentalPrices(
        v,
        d,
        minimumPeriod,
        0.2,
        0.04,
        0.1,
        0.2,
      ));
      break;
    }
    case "Furniture": {
      ({ daily, weekly, monthly, deposit } = calculateTieredRentalPrices(
        v,
        d,
        minimumPeriod,
        0.15,
        0.035,
        0.09,
        0.2,
      ));
      break;
    }
    case "Gym & Fitness": {
      ({ daily, weekly, monthly, deposit } = calculateTieredRentalPrices(
        v,
        d,
        minimumPeriod,
        0.08,
        0.04,
        0.11,
        0.2,
      ));
      break;
    }
    case "Baby & Kids": {
      ({ daily, weekly, monthly, deposit } = calculateTieredRentalPrices(
        v,
        d,
        minimumPeriod,
        0.04,
        0.025,
        0.08,
        0.2,
      ));
      break;
    }
    case "Office & Business": {
      ({ daily, weekly, monthly, deposit } = calculateTieredRentalPrices(
        v,
        d,
        minimumPeriod,
        0.2,
        0.05,
        0.11,
        0.25,
      ));
      break;
    }
    case "Real Estate": {
      daily = 0;
      weekly = 0;
      monthly = 0;
      deposit = Math.round(v * 0.5);
      break;
    }
    default: {
      daily = Math.round(v * 0.07 * d);
      weekly = Math.round(daily * 4.5);
      monthly = Math.round(daily * 14);
      deposit = Math.round(v * 0.2);
    }
  }

  if (daily > 0 && weekly > 0 && weekly > daily * 7) weekly = Math.round(daily * 6);
  if (monthly > 0 && weekly > 0 && monthly < weekly) monthly = Math.round(weekly * 2.5);
  if (monthly > 0 && weekly > 0 && monthly > weekly * 6) monthly = Math.round(weekly * 5);

  daily = Math.max(daily, daily > 0 ? 1 : 0);
  weekly = Math.max(weekly, weekly > 0 ? 5 : 0);
  monthly = Math.max(monthly, monthly > 0 ? 15 : 0);

  return finalizeRentalPriceSuggestion(v, { daily, weekly, monthly, deposit }, category, {
    insuranceMaxDeductible: options?.insuranceMaxDeductible,
  });
}

/**
 * Manufacturer serial / equipment ID.
 * Required only for heavy jobsite gear (claims + asset tracking).
 * Photo / Electronics / Drones: optional recommendation — don't block Continue.
 * Vehicles use VIN instead.
 */
const SERIAL_REQUIRED_CATEGORIES = new Set([
  "Heavy Equipment",
  "Construction",
]);

const SERIAL_OPTIONAL_CATEGORIES = new Set([
  "Photo & Video",
  "Electronics & Tech",
  "Drones",
]);

/** Heavy equipment / construction — serial required to publish. */
export function requiresAssetSerialNumber(category: string): boolean {
  return SERIAL_REQUIRED_CATEGORIES.has(category.trim());
}

/** High-value consumer gear — show serial as optional tip, never a hard gate. */
export function suggestsAssetSerialNumber(category: string): boolean {
  return SERIAL_OPTIONAL_CATEGORIES.has(category.trim());
}

export function showsAssetSerialNumber(category: string): boolean {
  return (
    requiresAssetSerialNumber(category) || suggestsAssetSerialNumber(category)
  );
}

/** VIN required for all Vehicles subcategories (cars, trucks, trailers, ATVs, RVs…). */
export function requiresAssetVin(category: string): boolean {
  return category.trim() === "Vehicles";
}

export function requiresAssetIdentity(category: string): boolean {
  return (
    showsAssetSerialNumber(category) || requiresAssetVin(category)
  );
}
