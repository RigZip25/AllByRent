/**
 * Example listing titles by shelf — keep concrete and short so hosts copy the pattern.
 * Fallback chain: subcategory → category → generic.
 */

const BY_SUBCATEGORY: Record<string, string> = {
  // Tools & DIY
  "Hand Tools": "Socket wrench set + toolbox",
  "Power Drills": "Milwaukee M18 compact drill kit",
  "Measuring Tools": "Laser distance measurer",
  Ladders: "6 ft aluminum step ladder",
  "Painting Tools": "Paint sprayer + roller kit",
  "Industrial Drills": "Rotary hammer drill SDS-Max",
  "Welding Equipment": "MIG welder with leads",
  "Scaffolding Systems": "Rolling scaffold tower section",
  "Laser Measuring": "Rotary laser level kit",
  "Power Saws": "Circular saw + rip guide",

  // Photo & Video
  "Camera Kits": "Sony A7 III + 28–70mm kit",
  "Action Cameras": "GoPro Hero with chest mount",
  Drones: "DJI Mini drone + spare batteries",
  "Cinema Cameras": "Blackmagic Pocket Cinema Camera",
  "Professional Lenses": "Canon 24–70mm f/2.8 lens",
  "Studio Lighting": "Softbox light kit (2 lights)",
  "Stabilizers & Rigs": "Gimbal stabilizer for mirrorless",
  "Broadcast Gear": "Wireless lav mic set",
  "Tripods & Mounts": "Manfrotto tripod with fluid head",
  "Basic Lighting": "LED panel light with stand",

  // Electronics & Tech
  Laptops: "MacBook Pro 14″ for weekend use",
  Projectors: "1080p home projector + HDMI",
  "Smart Home Devices": "Smart thermostat + hubs",
  "Gaming Gear": "PlayStation console + 2 controllers",
  Speakers: "Bluetooth party speaker",
  "Servers & Workstations": "Workstation PC for renders",
  "Pro Audio": "Audio interface + headphones",
  "Network Gear": "Mesh Wi‑Fi system (3 nodes)",
  "Display Systems": "55″ TV on rolling stand",

  // Home & Kitchen
  "Coffee Makers": "Espresso machine + grinder",
  "Baking Equipment": "Stand mixer with bowls",
  "Stand Mixers": "KitchenAid stand mixer",
  "Blenders & Juicers": "High-power blender",
  "Cleaning Appliances": "Robot vacuum",
  "Commercial Coffee": "Commercial espresso machine",
  "Catering Equipment": "Chafing dishes (set of 3)",

  // Outdoor & Camping
  Tents: "4-person camping tent",
  "Sleeping Bags": "0°F sleeping bag",
  Backpacks: "65L hiking backpack",
  "Camp Cooking": "Camping stove + cook set",
  "Navigation & GPS": "Handheld GPS unit",
  "Expedition Tents": "Expedition dome tent",
  "Group Shelters": "Large group canopy",

  // Sports & Recreation
  "Snow Sports": "Adult ski set + poles",
  "Water Sports": "Inflatable paddleboard",
  "Racket Sports": "Tennis racket pair",
  Skating: "Inline skates size 42",
  "Fishing Gear": "Spinning rod + reel combo",

  // Bikes & Scooters
  "Mountain Bikes": "Trek mountain bike, size M",
  "Road Bikes": "Road bike, size 54",
  "Kids Bikes": "Kids bike 20″ wheels",
  "Electric Scooters": "Electric scooter, foldable",
  Cruisers: "Beach cruiser bike",
  "E-Bikes Pro": "Cargo e-bike with rack",
  "Cargo Bikes": "Family cargo bike",

  // Vehicles
  "Cars & Trucks": "2019 Toyota RAV4 AWD",
  Motorcycles: "Motorcycle for weekend trips",
  Trailers: "Utility trailer 5×8",
  ATVs: "ATV with helmets",
  "RVs & Campers": "Camper van weekend rental",
  "Commercial Trucks": "Box truck for moving day",
  "Cargo Vans": "Cargo van with shelves",

  // Boats & Water
  "Kayaks & Canoes": "Sit-on-top kayak + paddle",
  "SUP Boards": "Inflatable SUP with pump",
  "Fishing Boats": "Small fishing boat",
  "Jet Skis": "Jet ski with life jackets",
  Motorboats: "Motorboat for day trips",

  // Garden & Yard — plants
  Trees: "Japanese maple in 5-gal pot",
  "Shrubs & Bushes": "Boxwood shrubs (set of 4)",
  Perennials: "Lavender plants — ready to plant",
  "Seasonal Flowers": "Seasonal patio flower pots",
  "Houseplants & Seedlings": "Fiddle-leaf fig in ceramic pot",
  "Nursery Stock": "Olive tree, nursery 10-gal",
  // Garden equipment
  "Lawn Mowers": "Honda self-propelled lawn mower",
  Trimmers: "String trimmer + spare line",
  "Leaf Blowers": "Battery leaf blower",
  "Garden Tools": "Garden tool set (shovel, rake, hoe)",
  Sprinklers: "Oscillating sprinkler set",
  "Ride-On Mowers": "Ride-on lawn mower",
  "Tillers & Cultivators": "Front-tine garden tiller",
  "Stump Grinders": "Stump grinder (towable)",
  "Irrigation Systems": "Drip irrigation kit",
  "Landscape Equipment": "Landscape rake + wheelbarrow",

  // Party & Events
  "Tables & Chairs": "Folding chairs (set of 10)",
  "Tents & Canopies": "10×10 pop-up canopy",
  "Party Decor": "Balloon arch kit",
  "Sound Systems": "PA speaker pair + mixer",
  "Event Lighting": "Uplighting pack for events",
  "Photo Booths": "Photo booth with props",

  // Music & Audio
  "Guitars & Bass": "Acoustic guitar with case",
  Keyboards: "88-key digital piano",
  Drums: "Electronic drum kit",
  "Portable Speakers": "Battery PA speaker",
  Microphones: "Wireless handheld mic",
  Amplifiers: "Guitar amp 50W",
  "PA Systems": "Portable PA system",

  // Gym & Fitness
  "Yoga & Pilates": "Yoga mats (set of 4)",
  "Cardio Equipment": "Foldable treadmill",
  "Free Weights": "Dumbbell set 5–25 lb",
  "Resistance Bands": "Resistance band kit",
  "Commercial Treadmills": "Commercial treadmill",
  "Weight Machines": "Cable weight machine",
  "Boxing Equipment": "Heavy bag + gloves",

  // Baby & Kids
  Strollers: "Double stroller, travel system",
  "Car Seats": "Infant car seat + base",
  "Cribs & Beds": "Pack-and-play crib",
  "Baby Carriers": "Baby carrier soft wrap",
  "Toys & Games": "Kids outdoor play set",

  // Office & Business
  Printers: "Color laser printer",
  "Monitors & Displays": "27″ monitor with stand",
  "Webcams & Streaming": "4K webcam + ring light",
  "Office Furniture": "Folding banquet tables",
  "POS Systems": "POS tablet + receipt printer",

  // Heavy Equipment
  Generators: "Portable generator 3500W",
  "Air Compressors": "Air compressor 20 gal",
  "Pressure Washers": "Pressure washer 3000 PSI",
  Forklifts: "Warehouse forklift",
  "Industrial Generators": "Trailer generator",

  // Construction
  "Concrete Mixers": "Portable concrete mixer",
  "Safety Equipment": "Hard hats + harness kit",
  "Site Lighting": "LED tower light",
  "Crane & Lifting": "Material lift / hoist",

  // Costume & Cosplay
  "Halloween Costumes": "Adult Halloween costume set",
  "Character Costumes": "Full character costume",
  "Theater Costumes": "Period theater costume",
  "Film & TV Props": "Film prop set for shoot",

  // Real Estate
  "Rooms & Spaces": "Spare room for short stay",
  "Garages & Storage": "Garage bay for storage",
  "Parking Spots": "Covered parking spot",
  "Backyard & Outdoor": "Backyard for private event",
  "Commercial Space": "Studio loft for shoot day",
  "Event Venues": "Garden venue for 40 guests",
  "Studio Space": "Daylight photo studio",

  // Unique & Other
  Collectibles: "Vintage collectible piece",
  "Art & Sculpture": "Outdoor sculpture for display",
  "Hobby Equipment": "Hobby kiln / craft gear",
  "Seasonal Items": "Holiday décor set",
};

const BY_CATEGORY: Record<string, string> = {
  "Tools & DIY": "Milwaukee compact drill kit",
  "Photo & Video": "Mirrorless camera kit",
  "Electronics & Tech": "Laptop for weekend project",
  "Home & Kitchen": "Stand mixer with bowls",
  "Outdoor & Camping": "4-person camping tent",
  "Sports & Recreation": "Ski set or paddleboard",
  "Bikes & Scooters": "Mountain bike, size M",
  Vehicles: "Weekend car or utility trailer",
  "Boats & Water": "Kayak with paddle",
  "Garden & Yard": "Japanese maple in 5-gal pot",
  "Party & Events": "Folding chairs (set of 10)",
  "Music & Audio": "Acoustic guitar with case",
  "Gym & Fitness": "Dumbbell set",
  "Baby & Kids": "Travel stroller",
  "Office & Business": "Monitor + webcam kit",
  "Heavy Equipment": "Portable generator",
  Construction: "Concrete mixer",
  "Costume & Cosplay": "Costume set for event",
  "Real Estate": "Studio loft for shoot day",
  "Unique & Other": "Unique item for neighbors",
};

const GENERIC = "Camera kit, tent, or plant";

/** Concrete example title for the listing title field. */
export function listingTitleExample(category: string, subcategory: string): string {
  const sub = subcategory.trim();
  if (sub && sub !== "Other" && BY_SUBCATEGORY[sub]) {
    return BY_SUBCATEGORY[sub];
  }
  const cat = category.trim();
  if (cat && BY_CATEGORY[cat]) return BY_CATEGORY[cat];
  return GENERIC;
}
