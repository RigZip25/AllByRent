import type { CategoryFactsBundle } from "./types";
import { facts_Vehicles } from "./categories/Vehicles";
import { facts_VehiclesCommercial } from "./categories/VehiclesCommercial";
import { facts_Heavy_Equipment } from "./categories/Heavy_Equipment";
import { facts_Construction } from "./categories/Construction";
import { facts_Boats_and_Water } from "./categories/Boats_and_Water";
import { facts_Real_Estate } from "./categories/Real_Estate";
import { facts_Photo_and_Video } from "./categories/Photo_and_Video";
import { facts_Electronics_and_Tech } from "./categories/Electronics_and_Tech";
import { facts_Gym_and_Fitness } from "./categories/Gym_and_Fitness";
import { facts_Sports_and_Recreation } from "./categories/Sports_and_Recreation";
import { facts_Outdoor_and_Camping } from "./categories/Outdoor_and_Camping";
import { facts_Bikes_and_Scooters } from "./categories/Bikes_and_Scooters";
import { facts_Party_and_Events } from "./categories/Party_and_Events";
import { facts_Tools_and_DIY } from "./categories/Tools_and_DIY";
import { facts_Unique_and_Other } from "./categories/Unique_and_Other";
import { facts_Garden_and_Yard } from "./categories/Garden_and_Yard";
import { facts_Home_and_Kitchen } from "./categories/Home_and_Kitchen";
import { facts_Office_and_Business } from "./categories/Office_and_Business";
import { facts_Music_and_Audio } from "./categories/Music_and_Audio";
import { facts_Costume_and_Cosplay } from "./categories/Costume_and_Cosplay";
import { facts_Baby_and_Kids } from "./categories/Baby_and_Kids";
import { subs_Unique_and_Other } from "./subcategories/Unique_and_Other";
import { subs_Tools_and_DIY } from "./subcategories/Tools_and_DIY";
import { subs_Sports_and_Recreation } from "./subcategories/Sports_and_Recreation";
import { subs_Photo_and_Video } from "./subcategories/Photo_and_Video";
import { subs_Office_and_Business } from "./subcategories/Office_and_Business";
import { subs_Music_and_Audio } from "./subcategories/Music_and_Audio";
import { subs_Home_and_Kitchen } from "./subcategories/Home_and_Kitchen";
import { subs_Real_Estate } from "./subcategories/Real_Estate";
import { subs_Vehicles } from "./subcategories/Vehicles";
import { subs_Construction } from "./subcategories/Construction";
import { subs_Boats_and_Water } from "./subcategories/Boats_and_Water";
import { subs_Bikes_and_Scooters } from "./subcategories/Bikes_and_Scooters";
import { subs_Electronics_and_Tech } from "./subcategories/Electronics_and_Tech";
import { subs_Garden_and_Yard } from "./subcategories/Garden_and_Yard";
import { subs_Gym_and_Fitness } from "./subcategories/Gym_and_Fitness";
import { subs_Costume_and_Cosplay } from "./subcategories/Costume_and_Cosplay";
import { subs_Baby_and_Kids } from "./subcategories/Baby_and_Kids";
import { subs_Heavy_Equipment } from "./subcategories/Heavy_Equipment";
import { subs_Party_and_Events } from "./subcategories/Party_and_Events";
import { subs_Outdoor_and_Camping } from "./subcategories/Outdoor_and_Camping";

/** Canonical English category / subcategory FactCards — source of truth for all locales. */
export const categoryFactsEn: CategoryFactsBundle = {
  expand: "Learn more",
  collapse: "Hide details",
  byCategory: {
    Vehicles: facts_Vehicles,
    VehiclesCommercial: facts_VehiclesCommercial,
    "Heavy Equipment": facts_Heavy_Equipment,
    Construction: facts_Construction,
    "Boats & Water": facts_Boats_and_Water,
    "Real Estate": facts_Real_Estate,
    "Photo & Video": facts_Photo_and_Video,
    "Electronics & Tech": facts_Electronics_and_Tech,
    "Gym & Fitness": facts_Gym_and_Fitness,
    "Sports & Recreation": facts_Sports_and_Recreation,
    "Outdoor & Camping": facts_Outdoor_and_Camping,
    "Bikes & Scooters": facts_Bikes_and_Scooters,
    "Party & Events": facts_Party_and_Events,
    "Tools & DIY": facts_Tools_and_DIY,
    "Unique & Other": facts_Unique_and_Other,
    "Garden & Yard": facts_Garden_and_Yard,
    "Home & Kitchen": facts_Home_and_Kitchen,
    "Office & Business": facts_Office_and_Business,
    "Music & Audio": facts_Music_and_Audio,
    "Costume & Cosplay": facts_Costume_and_Cosplay,
    "Baby & Kids": facts_Baby_and_Kids,
  },
  bySubcategory: {
    "Unique & Other": subs_Unique_and_Other,
    "Tools & DIY": subs_Tools_and_DIY,
    "Sports & Recreation": subs_Sports_and_Recreation,
    "Photo & Video": subs_Photo_and_Video,
    "Office & Business": subs_Office_and_Business,
    "Music & Audio": subs_Music_and_Audio,
    "Home & Kitchen": subs_Home_and_Kitchen,
    "Real Estate": subs_Real_Estate,
    Vehicles: subs_Vehicles,
    Construction: subs_Construction,
    "Boats & Water": subs_Boats_and_Water,
    "Bikes & Scooters": subs_Bikes_and_Scooters,
    "Electronics & Tech": subs_Electronics_and_Tech,
    "Garden & Yard": subs_Garden_and_Yard,
    "Gym & Fitness": subs_Gym_and_Fitness,
    "Costume & Cosplay": subs_Costume_and_Cosplay,
    "Baby & Kids": subs_Baby_and_Kids,
    "Heavy Equipment": subs_Heavy_Equipment,
    "Party & Events": subs_Party_and_Events,
    "Outdoor & Camping": subs_Outdoor_and_Camping,
  },
};
