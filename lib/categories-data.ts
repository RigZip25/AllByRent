export interface Subcategory {
  id: string;
  name: string;
  emoji: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  personal: Subcategory[];
  professional: Subcategory[];
}

export const categories: Category[] = [
  {
    id: "outdoor",
    name: "Outdoor & Patio",
    emoji: "🏕️",
    personal: [
      { id: "camping-tents", name: "Camping Tents & Sleeping Bags", emoji: "⛺" },
      { id: "hiking-backpacks", name: "Hiking Backpacks & Trekking Poles", emoji: "🎒" },
      { id: "portable-grills", name: "Portable Grills & Stoves", emoji: "🔥" },
      { id: "inflatable-boats", name: "Inflatable Boats & Kayaks", emoji: "🛶" },
      { id: "coolers", name: "Coolers & Outdoor Fridges", emoji: "🧊" },
      { id: "outdoor-event", name: "Outdoor Event Shelter", emoji: "🎪" },
    ],
    professional: [
      { id: "large-tents", name: "Large Group Tents & Canopies", emoji: "🏗️" },
      { id: "adventure-filming", name: "Adventure Filming Equipment", emoji: "🎬" },
      { id: "event-shelters", name: "Outdoor Event Shelters", emoji: "🎪" },
      { id: "solar-stations", name: "Portable Solar Power Stations", emoji: "☀️" },
      { id: "survival-kits", name: "Wilderness Survival Kits", emoji: "🧭" },
      { id: "other-outdoor-pro", name: "Other Professional Outdoor", emoji: "🏔️" },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    emoji: "📱",
    personal: [
      { id: "home-theater", name: "Home Theater Setup", emoji: "📺" },
      { id: "gaming-console", name: "Gaming Console & VR Headset", emoji: "🎮" },
      { id: "smart-home", name: "Smart Home Devices", emoji: "🏠" },
      { id: "dj-party", name: "DJ & Party Equipment", emoji: "🎧" },
      { id: "audio-speakers", name: "High-End Audio & Speakers", emoji: "🔊" },
      { id: "other-electronics", name: "Other Consumer Electronics", emoji: "🔌" },
    ],
    professional: [
      { id: "event-av", name: "Event AV Equipment", emoji: "🎛️" },
      { id: "workstations", name: "Workstation Computers", emoji: "🖥️" },
      { id: "3d-printer", name: "3D Printer & Scanner", emoji: "🖨️" },
      { id: "server-racks", name: "Server Racks & Networking", emoji: "🌐" },
      { id: "pro-electronics", name: "Professional Electronics", emoji: "⚡" },
      { id: "other-pro-electronics", name: "Other Pro Electronics", emoji: "🔧" },
    ],
  },
  {
    id: "photography",
    name: "Photography & Video",
    emoji: "📷",
    personal: [
      { id: "dslr-camera", name: "DSLR & Mirrorless Cameras", emoji: "📸" },
      { id: "gimbals", name: "Gimbals & Stabilizers", emoji: "🎥" },
      { id: "vlogging-kit", name: "Vlogging & Streaming Kits", emoji: "🎙️" },
      { id: "mobile-creator", name: "Mobile Creator Kits", emoji: "📱" },
      { id: "action-cameras", name: "GoPro & Action Cameras", emoji: "🏃" },
      { id: "other-photo", name: "Other Photography Items", emoji: "🖼️" },
    ],
    professional: [
      { id: "cinema-cameras", name: "Cinema Cameras & Lens Kits", emoji: "🎬" },
      { id: "light-grip", name: "Light & Grip Equipment", emoji: "💡" },
      { id: "audio-equipment", name: "Audio Equipment", emoji: "🎤" },
      { id: "studio-backdrop", name: "Studio Door & Backdrop", emoji: "🎭" },
      { id: "editing-workstation", name: "Video Editing Workstation", emoji: "🖥️" },
      { id: "other-pro-photo", name: "Other Pro Equipment", emoji: "📽️" },
    ],
  },
  {
    id: "lawn-garden",
    name: "Lawn & Garden",
    emoji: "🌿",
    personal: [
      { id: "lawn-mower", name: "Lawn Mower & Trimmer", emoji: "🌱" },
      { id: "tree-trimming", name: "Tree & Bush Trimming Sets", emoji: "✂️" },
      { id: "seasonal-cleanup", name: "Seasonal Cleanup Equipment", emoji: "🍂" },
      { id: "snow-removal", name: "Snow Removal Gear", emoji: "❄️" },
      { id: "garden-tiller", name: "Garden Tiller & Cultivator", emoji: "🚜" },
      { id: "other-garden", name: "Other Garden Tools", emoji: "🧤" },
    ],
    professional: [
      { id: "commercial-mowers", name: "Commercial Lawn Mowers", emoji: "🚜" },
      { id: "mini-excavators", name: "Mini Excavators & Trenchers", emoji: "🏗️" },
      { id: "soil-aerators", name: "Soil Aerators & Seeders", emoji: "🌾" },
      { id: "tree-removal", name: "Tree Removal & Chainsaw Kits", emoji: "🪓" },
      { id: "irrigation", name: "Sprinklers & Irrigation", emoji: "💧" },
      { id: "other-pro-garden", name: "Other Pro Garden Tools", emoji: "🔧" },
    ],
  },
  {
    id: "drones",
    name: "Drones",
    emoji: "🚁",
    personal: [
      { id: "camera-drones", name: "Consumer Camera Drones", emoji: "📷" },
      { id: "fpv-racing", name: "FPV Racing Drones", emoji: "🏎️" },
      { id: "travel-drones", name: "Compact Travel Drones", emoji: "✈️" },
      { id: "beginner-drones", name: "Beginner Drones", emoji: "🎯" },
      { id: "action-drones", name: "Action Drones for Social", emoji: "📱" },
      { id: "other-drones", name: "Other Personal Drones", emoji: "🎮" },
    ],
    professional: [
      { id: "inspection-drones", name: "Industrial Inspection Drones", emoji: "🔍" },
      { id: "agriculture-drones", name: "Agriculture Drones", emoji: "🌾" },
      { id: "cinematography-drones", name: "Cinematography Drones", emoji: "🎬" },
      { id: "surveying-drones", name: "Surveying & Mapping Drones", emoji: "🗺️" },
      { id: "security-drones", name: "Security & Surveillance", emoji: "🛡️" },
      { id: "other-pro-drones", name: "Other Pro Drones", emoji: "🚀" },
    ],
  },
  {
    id: "events-party",
    name: "Event & Party",
    emoji: "🎉",
    personal: [
      { id: "party-furniture", name: "Party Furniture & Decor", emoji: "🪑" },
      { id: "lighting-effects", name: "Lighting & Effects", emoji: "✨" },
      { id: "sound-system", name: "Sound System & Speakers", emoji: "🔊" },
      { id: "kids-party", name: "Kids Party Sets", emoji: "🎈" },
      { id: "tents-canopies", name: "Tents & Canopies", emoji: "⛺" },
      { id: "other-party", name: "Other Party Items", emoji: "🎊" },
    ],
    professional: [
      { id: "wedding-setup", name: "Wedding Setup", emoji: "💒" },
      { id: "stage-lights", name: "Stage & Lights", emoji: "🎭" },
      { id: "conference-gear", name: "Conference & Expo Gear", emoji: "🎤" },
      { id: "festival-booths", name: "Festival & Fair Booths", emoji: "🎡" },
      { id: "catering", name: "Concession & Catering", emoji: "🍽️" },
      { id: "other-event-pro", name: "Other Event Equipment", emoji: "📋" },
    ],
  },
  {
    id: "gym-fitness",
    name: "Gym & Fitness",
    emoji: "💪",
    personal: [
      { id: "home-gym", name: "Home Gym Station", emoji: "🏋️" },
      { id: "cardio-equipment", name: "High-End Cardio Equipment", emoji: "🏃" },
      { id: "yoga-kits", name: "Premium Yoga Kits", emoji: "🧘" },
      { id: "tennis-golf", name: "Tennis & Golf Sets", emoji: "🎾" },
      { id: "massage-recovery", name: "Massage & Recovery Tools", emoji: "💆" },
      { id: "other-fitness", name: "Other Fitness Equipment", emoji: "⚽" },
    ],
    professional: [
      { id: "commercial-gym", name: "Commercial Gym Machines", emoji: "🏢" },
      { id: "training-rings", name: "Portable Training Rings", emoji: "🥊" },
      { id: "sport-class", name: "Sport Class Equipment", emoji: "🏀" },
      { id: "group-class", name: "Group Class Gear", emoji: "👥" },
      { id: "sport-event", name: "Sport Event Equipment", emoji: "🏆" },
      { id: "other-pro-fitness", name: "Other Pro Fitness Gear", emoji: "🎖️" },
    ],
  },
  {
    id: "boats",
    name: "Boats & Watercraft",
    emoji: "🚤",
    personal: [
      { id: "motor-boats", name: "Motor Boats", emoji: "🚤" },
      { id: "fishing-boats", name: "Fishing Boats", emoji: "🎣" },
      { id: "personal-watercraft", name: "Personal Watercraft", emoji: "🌊" },
      { id: "pontoons", name: "Pontoons & Party Boats", emoji: "🎉" },
      { id: "kayaks-canoes", name: "Kayaks & Canoes", emoji: "🛶" },
      { id: "other-watercraft", name: "Other Recreation Watercraft", emoji: "⛵" },
    ],
    professional: [
      { id: "charter-yachts", name: "Charter Yachts", emoji: "🛥️" },
      { id: "event-boats", name: "Event & Party Boats", emoji: "🎊" },
      { id: "tour-boats", name: "Tour & Excursion Boats", emoji: "🗺️" },
      { id: "water-sports", name: "Water Sports Support Boats", emoji: "🏄" },
      { id: "floating-stage", name: "Floating Stage & Platforms", emoji: "🎭" },
      { id: "other-pro-boats", name: "Other Professional Watercraft", emoji: "⚓" },
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    emoji: "🏠",
    personal: [
      { id: "vacation-home", name: "Vacation Home Rental", emoji: "🏖️" },
      { id: "short-term-apt", name: "Short-Term Apartment", emoji: "🏢" },
      { id: "lake-house", name: "Lake House & Cabin", emoji: "🏡" },
      { id: "tiny-home", name: "Tiny Home & Studio Pod", emoji: "🏘️" },
      { id: "private-event-space", name: "Private Event Space", emoji: "🎪" },
      { id: "other-personal-re", name: "Other Personal Real Estate", emoji: "🔑" },
    ],
    professional: [
      { id: "office-space", name: "Office Space Rental", emoji: "🏬" },
      { id: "pop-up-retail", name: "Pop-Up Retail & Store", emoji: "🛍️" },
      { id: "commercial-kitchen", name: "Commercial Kitchen", emoji: "👨‍🍳" },
      { id: "warehouse", name: "Warehouse & Storage Unit", emoji: "📦" },
      { id: "conference-room", name: "Event & Conference Room", emoji: "📊" },
      { id: "other-commercial", name: "Other Commercial Property", emoji: "🏗️" },
    ],
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    emoji: "🛋️",
    personal: [
      { id: "bedroom-sets", name: "Bedroom Sets & Mattresses", emoji: "🛏️" },
      { id: "living-room", name: "Living Room Furniture", emoji: "🛋️" },
      { id: "dining-tables", name: "Dining Tables & Chairs", emoji: "🪑" },
      { id: "kids-furniture", name: "Kids Furniture", emoji: "🧒" },
      { id: "decor", name: "Decor & Home Accessories", emoji: "🖼️" },
      { id: "other-home", name: "Other Home Items", emoji: "🏡" },
    ],
    professional: [
      { id: "event-furniture", name: "Event Furniture", emoji: "🎪" },
      { id: "staging-props", name: "Staging & Set Design Props", emoji: "🎭" },
      { id: "office-furniture", name: "Office Furniture Packages", emoji: "🖥️" },
      { id: "luxury-furniture", name: "Luxury Furniture", emoji: "👑" },
      { id: "open-house", name: "Furniture for Open House", emoji: "🏘️" },
      { id: "other-pro-furniture", name: "Other Pro Furniture", emoji: "📦" },
    ],
  },
  {
    id: "musical",
    name: "Musical Instruments",
    emoji: "🎸",
    personal: [
      { id: "digital-piano", name: "Digital Piano & Keyboard", emoji: "🎹" },
      { id: "electric-guitars", name: "Electric Guitars & Amps", emoji: "🎸" },
      { id: "drum-kits", name: "Drum Kits", emoji: "🥁" },
      { id: "dj-kits", name: "DJ & Performance Kits", emoji: "🎧" },
      { id: "portable-pa", name: "Portable PA Systems", emoji: "🔊" },
      { id: "other-music", name: "Other Music Instruments", emoji: "🎵" },
    ],
    professional: [
      { id: "pro-keyboard", name: "Pro-Grade Keyboard", emoji: "🎹" },
      { id: "pro-guitar", name: "Electric & Acoustic Guitar", emoji: "🎸" },
      { id: "string-instruments", name: "Professional String Instruments", emoji: "🎻" },
      { id: "wind-instruments", name: "Wind Instruments", emoji: "🎺" },
      { id: "pro-audio", name: "Professional Audio Instruments", emoji: "🎼" },
      { id: "other-pro-audio", name: "Other Pro Audio Gear", emoji: "🎚️" },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles & Camper",
    emoji: "🚗",
    personal: [
      { id: "sedans", name: "Sedans & Compact Cars", emoji: "🚗" },
      { id: "suvs", name: "SUVs & Crossovers", emoji: "🚙" },
      { id: "passenger-vans", name: "Passenger Vans & Minivans", emoji: "🚐" },
      { id: "travel-trailers", name: "Travel Trailers & Small Campers", emoji: "🏕️" },
      { id: "luxury-rv", name: "Luxury RV & Motorhome", emoji: "🚌" },
      { id: "other-vehicles", name: "Other Personal Vehicles", emoji: "🛻" },
    ],
    professional: [
      { id: "box-vans", name: "Box Vans & Moving Vehicles", emoji: "📦" },
      { id: "production-vans", name: "Production & Film Transport", emoji: "🎬" },
      { id: "branded-vans", name: "Branded & Promo Vehicles", emoji: "📢" },
      { id: "rental-fleet", name: "Rental Fleet Vans", emoji: "🚚" },
      { id: "tour-vans", name: "Tour & Explorer Vans", emoji: "🗺️" },
      { id: "other-rv", name: "Other Recreational Vehicles", emoji: "🚎" },
    ],
  },
  {
    id: "costumes",
    name: "Costume & Special Wear",
    emoji: "🎭",
    personal: [
      { id: "party-costumes", name: "Party Costumes", emoji: "🎃" },
      { id: "cosplay", name: "Historical, Fantasy & Cosplay", emoji: "🧙" },
      { id: "themed-outfits", name: "Themed & Family Outfits", emoji: "👨‍👩‍👧" },
      { id: "evening-wear", name: "Luxury Evening Wear", emoji: "👗" },
      { id: "wedding-attire", name: "Wedding Dresses & Tuxedos", emoji: "💍" },
      { id: "other-costumes", name: "Other Personal Costumes", emoji: "🎀" },
    ],
    professional: [
      { id: "theater-costumes", name: "Theater & Film Costumes", emoji: "🎬" },
      { id: "mascot-costumes", name: "Mascot Costumes", emoji: "🐻" },
      { id: "cultural-dress", name: "Cultural & Traditional Dress", emoji: "🌍" },
      { id: "dance-wear", name: "Dance & Sport Performance", emoji: "💃" },
      { id: "promo-wear", name: "Promotional Wear", emoji: "📢" },
      { id: "other-pro-wear", name: "Other Professional Wear", emoji: "👔" },
    ],
  },
  {
    id: "auto-tools",
    name: "Auto Tools & Accessories",
    emoji: "🔧",
    personal: [
      { id: "jump-starter", name: "Jump Starter & Power Bank", emoji: "🔋" },
      { id: "obd-scanner", name: "OBD Diagnostic Scanner", emoji: "📟" },
      { id: "portable-lift", name: "Portable Car Lift", emoji: "🔧" },
      { id: "detailing-kit", name: "Wheel Cleaning & Detailing Kit", emoji: "✨" },
      { id: "paint-gauge", name: "Paint Thickness Gauge", emoji: "🎨" },
      { id: "other-auto-kit", name: "Other Personal Auto Kit", emoji: "🚗" },
    ],
    professional: [
      { id: "pro-car-lift", name: "Professional Car Lift", emoji: "🏗️" },
      { id: "engine-hoist", name: "Engine Hoist (Cherry Picker)", emoji: "⚙️" },
      { id: "wheel-balancer", name: "Wheel Balancer Machine", emoji: "⚖️" },
      { id: "paint-booth", name: "Paint Booth Pro Sprayer", emoji: "🎨" },
      { id: "ac-diagnostic", name: "Auto AC Diagnostic Station", emoji: "❄️" },
      { id: "other-pro-auto", name: "Other Pro Auto Tools", emoji: "🔩" },
    ],
  },
  {
    id: "heavy-equipment",
    name: "Heavy Equipment",
    emoji: "🚜",
    personal: [
      { id: "mini-excavator", name: "Mini Excavator", emoji: "🏗️" },
      { id: "compact-skid", name: "Compact Skid Steer", emoji: "🚜" },
      { id: "backhoe-loader", name: "Backhoe Loader", emoji: "🔧" },
      { id: "stump-grinder", name: "Stump Grinder", emoji: "🪵" },
      { id: "landscape-trencher", name: "Landscape Trencher", emoji: "🌱" },
      { id: "other-equipment", name: "Other Personal Equipment", emoji: "⚙️" },
    ],
    professional: [
      { id: "bulldozer", name: "Bulldozer", emoji: "🚧" },
      { id: "crawler-excavator", name: "Crawler Excavator", emoji: "🏗️" },
      { id: "road-roller", name: "Road Roller", emoji: "🛣️" },
      { id: "mobile-crane", name: "Mobile Crane", emoji: "🏗️" },
      { id: "dump-truck", name: "Dump Truck (Large)", emoji: "🚛" },
      { id: "other-machinery", name: "Other Machinery", emoji: "🔩" },
    ],
  },
  {
    id: "construction",
    name: "Construction Tools",
    emoji: "🔨",
    personal: [
      { id: "rotary-drill", name: "Rotary & Hammer Drill Kit", emoji: "🔨" },
      { id: "tile-saw", name: "Tile & Stone Wet Saw", emoji: "🪨" },
      { id: "laser-level", name: "Laser Level & Tripod Kit", emoji: "📐" },
      { id: "drywall-lift", name: "Drywall Lift", emoji: "🏗️" },
      { id: "cement-mixer", name: "Compact Cement Mixer", emoji: "🧱" },
      { id: "wall-scanner", name: "Wall Scanner & Detector", emoji: "📡" },
    ],
    professional: [
      { id: "jackhammer", name: "Electric Jackhammer", emoji: "⚡" },
      { id: "concrete-saw", name: "Industrial Concrete Saw", emoji: "🪚" },
      { id: "pro-scanner", name: "Wall Scanner & Detector", emoji: "📡" },
      { id: "co-meter", name: "Carbon Monoxide Meter", emoji: "⚠️" },
      { id: "scaffolding", name: "Scaffolding Set", emoji: "🏗️" },
      { id: "other-pro-tools", name: "Other Pro Tools", emoji: "🔧" },
    ],
  },
  {
    id: "bicycles",
    name: "Bicycles & Scooters",
    emoji: "🚲",
    personal: [
      { id: "electric-scooter", name: "Electric Scooter", emoji: "🛴" },
      { id: "e-bikes", name: "Electric Bicycles & E-Bikes", emoji: "🚴" },
      { id: "folding-bikes", name: "Folding Bikes & Scooters", emoji: "🚲" },
      { id: "mountain-bikes", name: "Mountain & Trail Bikes", emoji: "🏔️" },
      { id: "kids-bikes", name: "Kids Bikes & Ride-Ons", emoji: "🧒" },
      { id: "other-bikes", name: "Other Personal Bikes", emoji: "🛹" },
    ],
    professional: [
      { id: "delivery-bikes", name: "Delivery E-Bikes & Cargo", emoji: "📦" },
      { id: "utility-scooters", name: "Electric Utility Scooters", emoji: "🛵" },
      { id: "fleet-packages", name: "Fleet Rental Packages", emoji: "🚲" },
      { id: "racing-bikes", name: "Performance & Racing Bicycles", emoji: "🏆" },
      { id: "tour-gear", name: "Tour & Rental Operator Gear", emoji: "🗺️" },
      { id: "other-pro-bikes", name: "Other Professional Bike Gear", emoji: "⚙️" },
    ],
  },
  {
    id: "tech-maker",
    name: "Tech & Maker",
    emoji: "🖨️",
    personal: [
      { id: "3d-printer-compact", name: "3D Printer (Compact)", emoji: "🖨️" },
      { id: "laser-engraver", name: "Portable Laser Engraver", emoji: "✨" },
      { id: "drawing-tablet", name: "Drawing Tablet (Pro Level)", emoji: "🎨" },
      { id: "vinyl-cutter", name: "Vinyl Cutter & Label Maker", emoji: "✂️" },
      { id: "mini-cnc", name: "Portable CNC Machine (Mini)", emoji: "⚙️" },
      { id: "other-creative", name: "Other Creative Tech Gear", emoji: "💡" },
    ],
    professional: [
      { id: "industrial-3d", name: "Industrial 3D Printer", emoji: "🏭" },
      { id: "e-textiles", name: "Electronic Textiles System", emoji: "🧵" },
      { id: "laser-cutter", name: "Advanced Laser Cutter", emoji: "🔥" },
      { id: "robotic-arm", name: "Robotic Arm with Controller", emoji: "🤖" },
      { id: "laser-scanner", name: "Pro Laser Scanning System", emoji: "📡" },
      { id: "other-industrial", name: "Other Industrial Equipment", emoji: "🔧" },
    ],
  },
  {
    id: "services",
    name: "Services & Experiences",
    emoji: "🎟️",
    personal: [
      { id: "private-cinema", name: "Private Cinema & Hall Rental", emoji: "🎬" },
      { id: "bar-lounge", name: "Beer Lounge & Bar Takeover", emoji: "🍺" },
      { id: "vintage-experience", name: "Vintage Train & Car Experience", emoji: "🚂" },
      { id: "art-gallery", name: "Art Gallery & Museum Room", emoji: "🖼️" },
      { id: "rooftop-terrace", name: "Rooftop Terrace with View", emoji: "🌆" },
      { id: "other-experiences", name: "Other Immersive Experiences", emoji: "✨" },
    ],
    professional: [
      { id: "film-studio", name: "Film Studio & Soundstage", emoji: "🎬" },
      { id: "flight-simulator", name: "Flight Simulator Rental", emoji: "✈️" },
      { id: "test-kitchen", name: "Test Kitchen & Culinary Lab", emoji: "👨‍🍳" },
      { id: "training-room", name: "Training Simulation Room", emoji: "📊" },
      { id: "escape-room", name: "Corporate Escape Room", emoji: "🔐" },
      { id: "other-pro-exp", name: "Other Professional Experiences", emoji: "🎯" },
    ],
  },
  {
    id: "unique",
    name: "Unique & Miscellaneous",
    emoji: "🌟",
    personal: [
      { id: "art-installation", name: "Art Installation", emoji: "🎨" },
      { id: "robot-assistant", name: "Personal Robot Assistant", emoji: "🤖" },
      { id: "home-planetarium", name: "Home Planetarium", emoji: "🌌" },
      { id: "custom-furniture", name: "Custom Furniture Test Models", emoji: "🛋️" },
      { id: "vr-setup", name: "VR Setup", emoji: "🥽" },
      { id: "experimental-tech", name: "Experimental Tech", emoji: "🔬" },
    ],
    professional: [
      { id: "ai-robots", name: "AI Robot & Promo Bots", emoji: "🤖" },
      { id: "display-modules", name: "Futuristic Display Modules", emoji: "📺" },
      { id: "rd-stations", name: "R&D Testing Stations", emoji: "🔬" },
      { id: "interaction-panels", name: "Smart Interaction Panels", emoji: "📱" },
      { id: "bio-labs", name: "Bio-Installations & Experiment Labs", emoji: "🧬" },
      { id: "other-pro-unique", name: "Other Professional Unique", emoji: "💎" },
    ],
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};

export const searchCategories = (query: string): Category[] => {
  const lowerQuery = query.toLowerCase();
  return categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.personal.some((sub) => sub.name.toLowerCase().includes(lowerQuery)) ||
      cat.professional.some((sub) => sub.name.toLowerCase().includes(lowerQuery))
  );
};
