export type ListingIntent = "rent" | "list-undecided" | "list-personal" | "list-business";

export type CategoryAvailability = "rent" | "list" | "rent-and-list";

export type ComplianceFlag =
  | "age-restriction"
  | "calendar-required"
  | "delivery-logistics"
  | "deposit-required"
  | "identity-verification"
  | "insurance-recommended"
  | "license-or-operator-required"
  | "location-contract-required"
  | "safety-briefing-required";

export type Subcategory = {
  id: string;
  label: string;
  complianceFlags?: ComplianceFlag[];
};

export type Category = {
  availability: CategoryAvailability;
  complianceFlags?: ComplianceFlag[];
  id: string;
  label: string;
  personal: Subcategory[];
  professional: Subcategory[];
};

export const canonicalCategories: Category[] = [
  {
    availability: "rent-and-list",
    id: "outdoor-patio",
    label: "Outdoor & Patio Gear",
    personal: [
      { id: "camping-tents-sleeping-bags", label: "Camping Tents & Sleeping Bags" },
      { id: "backpacks-trekking-poles", label: "Hiking Backpacks & Trekking Poles" },
      { id: "portable-grills-stoves", label: "Portable Grills & Stoves" },
      { id: "coolers-fridges", label: "Coolers & Outdoor Fridges" },
    ],
    professional: [
      { id: "large-tents-canopies", label: "Large Group Tents & Canopies" },
      { id: "event-shelters", label: "Outdoor Event Shelters & Gear" },
      { id: "solar-power-stations", label: "Portable Solar Power Stations" },
      { id: "survival-kits-pro", label: "Wilderness Survival Kits" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "electronics",
    label: "Electronics",
    personal: [
      { id: "home-theater", label: "Home Theater Setup" },
      { id: "gaming-vr", label: "Gaming Consoles & VR Headsets" },
      { id: "smart-home", label: "Smart Home Devices & Systems" },
      { id: "audio-systems", label: "High-End Audio Systems" },
    ],
    professional: [
      { id: "event-av", label: "Event AV Equipment", complianceFlags: ["deposit-required"] },
      { id: "workstations-laptops", label: "Workstation Computers & Laptops" },
      { id: "printers-scanners-3d", label: "3D Printers & Scanners" },
      { id: "server-networking", label: "Server Racks & Networking Gear" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "photography-video",
    label: "Photography & Video",
    personal: [
      { id: "dslr-mirrorless", label: "DSLR & Mirrorless Camera Kits" },
      { id: "gimbals-stabilizers", label: "Gimbals & Stabilizers" },
      { id: "vlogging-streaming", label: "Vlogging & Streaming Kits" },
      { id: "action-cameras", label: "GoPro & Action Cameras" },
    ],
    professional: [
      { id: "cinema-camera-lens", label: "Cinema Camera & Lens Kits", complianceFlags: ["deposit-required"] },
      { id: "lighting-grip", label: "Lighting & Grip Equipment" },
      { id: "shotgun-mics-recorders", label: "Audio Equipment & Recorders" },
      { id: "studio-backdrop", label: "Studio Gear & Backdrops" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "vehicles-campers",
    label: "Vehicles & Campers",
    complianceFlags: ["identity-verification", "deposit-required", "insurance-recommended"],
    personal: [
      { id: "sedans-compact", label: "Sedans & Compact Cars" },
      { id: "suv-crossovers", label: "SUVs & Crossovers" },
      { id: "passenger-vans", label: "Passenger Vans & Minivans" },
      { id: "trailers-campers", label: "Travel Trailers & Small Campers" },
    ],
    professional: [
      { id: "box-vans", label: "Box Vans & Moving Vehicles", complianceFlags: ["license-or-operator-required"] },
      { id: "production-transport", label: "Production & Film Transport Vans" },
      { id: "branded-promo-vans", label: "Branded Vans & Promo Vehicles" },
      { id: "fleet-units", label: "Rental Fleet Units" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "boats-watercraft",
    label: "Boats & Watercraft",
    complianceFlags: ["identity-verification", "deposit-required", "insurance-recommended"],
    personal: [
      { id: "motor-boats", label: "Motor Boats" },
      { id: "fishing-boats", label: "Fishing Boats" },
      { id: "personal-watercraft", label: "Personal Watercraft" },
      { id: "kayaks-canoes", label: "Kayaks & Canoes" },
    ],
    professional: [
      { id: "charter-yachts", label: "Charter Yachts", complianceFlags: ["license-or-operator-required"] },
      { id: "event-party-boats", label: "Event & Party Boats" },
      { id: "tour-excursion-boats", label: "Tour & Excursion Boats" },
      { id: "watersports-support", label: "Water Sports Support Boats" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "real-estate",
    label: "Residential & Commercial Real Estate",
    complianceFlags: ["calendar-required", "deposit-required", "location-contract-required"],
    personal: [
      { id: "vacation-home", label: "Vacation Home Rental" },
      { id: "short-term-apartment", label: "Short-Term Apartment" },
      { id: "lake-house-cabin", label: "Lake House or Cabin" },
      { id: "private-event-space", label: "Private Event Space" },
    ],
    professional: [
      { id: "office-space", label: "Office Space Rental" },
      { id: "pop-up-retail", label: "Pop-up Retail Store" },
      { id: "commercial-kitchen", label: "Commercial Kitchen" },
      { id: "warehouse-storage", label: "Warehouse or Storage Unit" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "construction-tools",
    label: "Construction Tools & Equipment",
    complianceFlags: ["deposit-required", "safety-briefing-required"],
    personal: [
      { id: "rotary-hammer", label: "Rotary Hammer Drill Kit" },
      { id: "electric-jackhammer", label: "Electric Jackhammer" },
      { id: "drywall-lift", label: "Drywall Lift" },
      { id: "wall-scanner", label: "Wall Scanner & Detector" },
    ],
    professional: [
      { id: "scaffolding", label: "Scaffolding Set", complianceFlags: ["safety-briefing-required"] },
      { id: "concrete-saw", label: "Industrial Concrete Saw" },
      { id: "laser-level", label: "Laser Level Tripod Kit" },
      { id: "compact-mixer", label: "Compact Cement Mixer" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "heavy-equipment",
    label: "Heavy Equipment & Machinery",
    complianceFlags: [
      "deposit-required",
      "insurance-recommended",
      "license-or-operator-required",
      "safety-briefing-required",
    ],
    personal: [
      { id: "mini-excavator", label: "Mini Excavator" },
      { id: "compact-skid-steer", label: "Compact Skid Steer" },
      { id: "backhoe-loader", label: "Backhoe Loader" },
      { id: "stump-grinder", label: "Stump Grinder" },
    ],
    professional: [
      { id: "bulldozer", label: "Bulldozer" },
      { id: "crawler-excavator", label: "Crawler Excavator" },
      { id: "road-roller", label: "Road Roller" },
      { id: "mobile-crane", label: "Mobile Crane" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "services-experiences",
    label: "Services & Experiences",
    complianceFlags: ["calendar-required", "location-contract-required"],
    personal: [
      { id: "private-cinema", label: "Private Cinema Hall Rental" },
      { id: "art-gallery-room", label: "Art Gallery or Museum Room Rental" },
      { id: "roof-terrace", label: "Roof Terrace with View" },
      { id: "immersive-experience", label: "Immersive Experiences" },
    ],
    professional: [
      { id: "film-studio", label: "Film Studio or Soundstage Rental" },
      { id: "flight-simulator", label: "Flight Simulator Rental" },
      { id: "test-kitchen", label: "Test Kitchen or Culinary Lab" },
      { id: "training-simulation", label: "Training Simulation Room" },
    ],
  },
  {
    availability: "rent-and-list",
    id: "unique-misc",
    label: "Unique & Miscellaneous",
    complianceFlags: ["identity-verification"],
    personal: [
      { id: "vr-setup", label: "VR Setup" },
      { id: "home-planetarium", label: "Home Planetarium" },
      { id: "personal-robot", label: "Personal Robot Rental" },
      { id: "art-installation", label: "Art Installation" },
    ],
    professional: [
      { id: "promo-robots", label: "AI Robots & Promo Bots" },
      { id: "smart-panels", label: "Smart Interaction Panels" },
      { id: "display-modules", label: "Futuristic Display Modules" },
      { id: "testing-station", label: "R&D Testing Station" },
    ],
  },
];

export const getCategoryById = (categoryId: string) =>
  canonicalCategories.find((category) => category.id === categoryId);

export const categoryRequiresComplianceReview = (category: Category) =>
  Boolean(category.complianceFlags?.length);
