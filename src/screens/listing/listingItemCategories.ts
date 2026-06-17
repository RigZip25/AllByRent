export type CategoryGrade = "personal" | "professional";

export type SubcategoryItem = {
  label: string;
  emoji: string;
};

export type CategoryData = {
  icon: string;
  personal: SubcategoryItem[];
  professional: SubcategoryItem[];
};

/** Shorthand for subcategory rows — last slot is always Other (➕). */
function sub(label: string, emoji: string): SubcategoryItem {
  return { label, emoji };
}

export const CATEGORIES: Record<string, CategoryData> = {
  "Tools & DIY": {
    icon: "🔧",
    personal: [
      sub("Hand Tools", "🛠️"),
      sub("Power Drills", "🔩"),
      sub("Measuring Tools", "📏"),
      sub("Ladders", "🪜"),
      sub("Painting Tools", "🖌️"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Industrial Drills", "⚙️"),
      sub("Welding Equipment", "🔥"),
      sub("Scaffolding Systems", "🏗️"),
      sub("Laser Measuring", "📐"),
      sub("Power Saws", "🪚"),
      sub("Other", "➕"),
    ],
  },
  "Photo & Video": {
    icon: "📷",
    personal: [
      sub("Camera Kits", "📷"),
      sub("Action Cameras", "🎥"),
      sub("Tripods & Mounts", "🎬"),
      sub("Basic Lighting", "💡"),
      sub("Drones", "🛸"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Cinema Cameras", "🎞️"),
      sub("Professional Lenses", "🔭"),
      sub("Studio Lighting", "✨"),
      sub("Stabilizers & Rigs", "🎬"),
      sub("Broadcast Gear", "📡"),
      sub("Other", "➕"),
    ],
  },
  "Electronics & Tech": {
    icon: "💻",
    personal: [
      sub("Laptops", "💻"),
      sub("Projectors", "📽️"),
      sub("Smart Home Devices", "🏠"),
      sub("Gaming Gear", "🎮"),
      sub("Speakers", "🔊"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Servers & Workstations", "🖥️"),
      sub("Pro Audio", "🎧"),
      sub("Broadcast Equipment", "📺"),
      sub("Network Gear", "🌐"),
      sub("Display Systems", "🖼️"),
      sub("Other", "➕"),
    ],
  },
  "Home & Kitchen": {
    icon: "🍳",
    personal: [
      sub("Coffee Makers", "☕"),
      sub("Baking Equipment", "🧁"),
      sub("Stand Mixers", "🥣"),
      sub("Blenders & Juicers", "🥤"),
      sub("Cleaning Appliances", "🧹"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Commercial Coffee", "☕"),
      sub("Catering Equipment", "🍽️"),
      sub("Industrial Mixers", "⚙️"),
      sub("Food Processors Pro", "🔪"),
      sub("Beverage Systems", "🧃"),
      sub("Other", "➕"),
    ],
  },
  "Outdoor & Camping": {
    icon: "⛺",
    personal: [
      sub("Tents", "⛺"),
      sub("Sleeping Bags", "🛏️"),
      sub("Backpacks", "🎒"),
      sub("Camp Cooking", "🍳"),
      sub("Navigation & GPS", "🧭"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Expedition Tents", "🏔️"),
      sub("Survival Gear", "🆘"),
      sub("Group Shelters", "🏕️"),
      sub("Professional Navigation", "🛰️"),
      sub("Base Camp Equipment", "⛺"),
      sub("Other", "➕"),
    ],
  },
  "Sports & Recreation": {
    icon: "🏄",
    personal: [
      sub("Snow Sports", "⛷️"),
      sub("Water Sports", "🏄"),
      sub("Racket Sports", "🎾"),
      sub("Skating", "⛸️"),
      sub("Fishing Gear", "🎣"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Competition Gear", "🏆"),
      sub("Coaching Equipment", "📋"),
      sub("Timing Systems", "⏱️"),
      sub("Pro Water Sports", "🚤"),
      sub("Team Sports Gear", "⚽"),
      sub("Other", "➕"),
    ],
  },
  "Bikes & Scooters": {
    icon: "🚲",
    personal: [
      sub("Mountain Bikes", "🚵"),
      sub("Road Bikes", "🚴"),
      sub("Kids Bikes", "🧒"),
      sub("Electric Scooters", "🛴"),
      sub("Cruisers", "🚲"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("E-Bikes Pro", "⚡"),
      sub("Racing Bikes", "🏁"),
      sub("Cargo Bikes", "📦"),
      sub("Professional Scooters", "🛵"),
      sub("Adaptive Bikes", "♿"),
      sub("Other", "➕"),
    ],
  },
  Vehicles: {
    icon: "🚗",
    personal: [
      sub("Cars & Trucks", "🚗"),
      sub("Motorcycles", "🏍️"),
      sub("Trailers", "🛞"),
      sub("ATVs", "🏜️"),
      sub("RVs & Campers", "🚐"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Commercial Trucks", "🚛"),
      sub("Cargo Vans", "🚐"),
      sub("Equipment Trailers", "🔗"),
      sub("Special Vehicles", "🚙"),
      sub("Tow Vehicles", "🪝"),
      sub("Other", "➕"),
    ],
  },
  "Boats & Water": {
    icon: "⛵",
    personal: [
      sub("Kayaks & Canoes", "🛶"),
      sub("SUP Boards", "🏄"),
      sub("Fishing Boats", "🎣"),
      sub("Inflatable Boats", "🛟"),
      sub("Jet Skis", "🌊"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Motorboats", "🚤"),
      sub("Pontoon Boats", "🛥️"),
      sub("Commercial Fishing", "🐟"),
      sub("Dive Boats", "🤿"),
      sub("Charter Vessels", "⛴️"),
      sub("Other", "➕"),
    ],
  },
  "Garden & Yard": {
    icon: "🌿",
    personal: [
      sub("Lawn Mowers", "🌱"),
      sub("Trimmers", "✂️"),
      sub("Leaf Blowers", "🍃"),
      sub("Garden Tools", "🪴"),
      sub("Sprinklers", "💧"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Ride-On Mowers", "🚜"),
      sub("Tillers & Cultivators", "🌾"),
      sub("Stump Grinders", "🪵"),
      sub("Irrigation Systems", "🚿"),
      sub("Landscape Equipment", "🏡"),
      sub("Other", "➕"),
    ],
  },
  "Party & Events": {
    icon: "🎉",
    personal: [
      sub("Tables & Chairs", "🪑"),
      sub("Tents & Canopies", "⛱️"),
      sub("Party Decor", "🎈"),
      sub("Games & Activities", "🎯"),
      sub("Serving Equipment", "🍴"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Stage & Risers", "🎭"),
      sub("Sound Systems", "🔊"),
      sub("Event Lighting", "💡"),
      sub("Photo Booths", "📸"),
      sub("Catering Equipment", "🍽️"),
      sub("Other", "➕"),
    ],
  },
  "Music & Audio": {
    icon: "🎸",
    personal: [
      sub("Guitars & Bass", "🎸"),
      sub("Keyboards", "🎹"),
      sub("Drums", "🥁"),
      sub("Portable Speakers", "🔉"),
      sub("Microphones", "🎤"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Amplifiers", "📢"),
      sub("Mixing Consoles", "🎛️"),
      sub("Studio Monitors", "🔈"),
      sub("PA Systems", "📣"),
      sub("Recording Gear", "🎙️"),
      sub("Other", "➕"),
    ],
  },
  "Gym & Fitness": {
    icon: "💪",
    personal: [
      sub("Yoga & Pilates", "🧘"),
      sub("Cardio Equipment", "🏃"),
      sub("Free Weights", "🏋️"),
      sub("Resistance Bands", "🎯"),
      sub("Recovery Tools", "💆"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Commercial Treadmills", "🏃"),
      sub("Weight Machines", "🏋️"),
      sub("Boxing Equipment", "🥊"),
      sub("Competition Gear", "🥇"),
      sub("Training Systems", "📊"),
      sub("Other", "➕"),
    ],
  },
  "Baby & Kids": {
    icon: "🍼",
    personal: [
      sub("Strollers", "👶"),
      sub("Car Seats", "🚗"),
      sub("Cribs & Beds", "🛏️"),
      sub("Baby Carriers", "🎒"),
      sub("Toys & Games", "🧸"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Commercial Play Equipment", "🛝"),
      sub("Group Activity Gear", "👥"),
      sub("Educational Tools", "📚"),
      sub("Safety Systems", "🛡️"),
      sub("Childcare Equipment", "🏫"),
      sub("Other", "➕"),
    ],
  },
  "Office & Business": {
    icon: "🖨️",
    personal: [
      sub("Printers", "🖨️"),
      sub("Monitors & Displays", "🖥️"),
      sub("Webcams & Streaming", "📹"),
      sub("Office Furniture", "🪑"),
      sub("Presentation Gear", "📊"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Large Format Printers", "🖨️"),
      sub("POS Systems", "💳"),
      sub("Commercial Copiers", "📄"),
      sub("Conference Systems", "📞"),
      sub("Server Equipment", "🗄️"),
      sub("Other", "➕"),
    ],
  },
  "Heavy Equipment": {
    icon: "⚙️",
    personal: [
      sub("Generators", "🔋"),
      sub("Air Compressors", "💨"),
      sub("Pressure Washers", "🚿"),
      sub("Winches", "⚓"),
      sub("Pumps", "🔧"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Industrial Generators", "⚡"),
      sub("Forklifts", "🏗️"),
      sub("Industrial Compressors", "💨"),
      sub("Hydraulic Equipment", "🔩"),
      sub("Heavy Pumps", "🚰"),
      sub("Other", "➕"),
    ],
  },
  Construction: {
    icon: "🏗️",
    personal: [
      sub("Concrete Mixers", "🧱"),
      sub("Safety Equipment", "🦺"),
      sub("Site Lighting", "💡"),
      sub("Hand Tools Pro", "🔨"),
      sub("Formwork Basic", "📐"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Large Concrete Equipment", "🏗️"),
      sub("Crane & Lifting", "🏗️"),
      sub("Professional Formwork", "📏"),
      sub("Excavation Tools", "⛏️"),
      sub("Structural Equipment", "🔩"),
      sub("Other", "➕"),
    ],
  },
  "Costume & Cosplay": {
    icon: "🎭",
    personal: [
      sub("Halloween Costumes", "🎃"),
      sub("Character Costumes", "🦸"),
      sub("Wigs & Accessories", "💇"),
      sub("Period Costumes", "👘"),
      sub("Masks & Makeup", "🎭"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Theater Costumes", "🎭"),
      sub("Film & TV Props", "🎬"),
      sub("Professional Makeup Kits", "💄"),
      sub("Animatronic Props", "🤖"),
      sub("Full Character Suits", "🦹"),
      sub("Other", "➕"),
    ],
  },
  "Real Estate": {
    icon: "🏠",
    personal: [
      sub("Rooms & Spaces", "🛋️"),
      sub("Garages & Storage", "🚗"),
      sub("Parking Spots", "🅿️"),
      sub("Shared Offices", "💼"),
      sub("Backyard & Outdoor", "🌳"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Commercial Space", "🏢"),
      sub("Event Venues", "🎪"),
      sub("Studio Space", "🎬"),
      sub("Warehouse & Storage", "📦"),
      sub("Retail Space", "🏪"),
      sub("Other", "➕"),
    ],
  },
  "Unique & Other": {
    icon: "🎁",
    personal: [
      sub("Collectibles", "🏺"),
      sub("Art & Sculpture", "🎨"),
      sub("Hobby Equipment", "🧩"),
      sub("Unusual Items", "❓"),
      sub("Seasonal Items", "🎄"),
      sub("Other", "➕"),
    ],
    professional: [
      sub("Specialty Equipment", "🔬"),
      sub("Industrial Oddities", "⚗️"),
      sub("Professional Props", "🎬"),
      sub("Rare Instruments", "🎻"),
      sub("Custom Builds", "🛠️"),
      sub("Other", "➕"),
    ],
  },
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];

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
  replacementValueHelper: "Cost to buy new — used for insurance calculation",
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
    sell: false,
    rentToOwn: false,
    gift: false,
    replacementValueLabel: "Market Value",
    replacementValueHelper: "Current market value of this vehicle",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Boats & Water": {
    rent: true,
    sell: false,
    rentToOwn: false,
    gift: false,
    replacementValueLabel: "Market Value",
    replacementValueHelper: "Current market value",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  "Heavy Equipment": {
    rent: true,
    sell: false,
    rentToOwn: false,
    gift: false,
    replacementValueLabel: "Replacement Cost",
    replacementValueHelper: "Cost to replace if damaged or lost",
    showDailyRate: true,
    showMonthlyRate: true,
  },
  Construction: {
    rent: true,
    sell: false,
    rentToOwn: false,
    gift: false,
    replacementValueLabel: "Replacement Cost",
    replacementValueHelper: "Cost to replace if damaged or lost",
    showDailyRate: true,
    showMonthlyRate: false,
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

export function getCategoryModeRules(category: string): CategoryModeRules {
  return CATEGORY_MODES[category] ?? DEFAULT_CATEGORY_MODES;
}

export function categoryHasRestrictedModes(category: string): boolean {
  const rules = getCategoryModeRules(category);
  return !rules.rent || !rules.sell || !rules.gift;
}

/** Period-tier rental pricing: event (1 day), short-term (3 days / 1 week), long-term (2 weeks / 1 month). */
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

  if (minimumPeriod === "1 day") {
    daily = Math.round(v * dailyPct * d);
  } else if (minimumPeriod === "1 week" || minimumPeriod === "3 days") {
    weekly = Math.round(v * weeklyPct * d);
    monthly = Math.round(weekly * 3.5);
  } else {
    monthly = Math.round(v * monthlyPct * d);
  }

  return { daily, weekly, monthly, deposit: Math.round(v * depositPct) };
}

export function calculateRentalPrices(
  category: string,
  value: number,
  minimumPeriod: string = "1 week",
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
      monthly = 0;
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
      monthly = Math.round(daily * 14);
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
      if (minimumPeriod === "1 day") {
        daily = Math.round(v * 0.25 * d);
      } else if (minimumPeriod === "1 week" || minimumPeriod === "3 days") {
        weekly = Math.round(v * 0.045 * d);
        monthly = Math.round(weekly * 3.5);
      } else {
        monthly = Math.round(v * 0.13 * d);
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

  return { daily, weekly, monthly, deposit };
}
