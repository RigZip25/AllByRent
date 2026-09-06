import { Emoji } from "../app/components/Emoji";
import babyKids from "../imports/categories/baby-kids.webp";
import bikesScooters from "../imports/categories/bikes-scooters.webp";
import boatsWater from "../imports/categories/boats-water.webp";
import construction from "../imports/categories/construction.webp";
import costumeCosplay from "../imports/categories/costume-cosplay.webp";
import electronicsTech from "../imports/categories/electronics-tech.webp";
import gardenYard from "../imports/categories/garden-yard.webp";
import gymFitness from "../imports/categories/gym-fitness.webp";
import heavyEquipment from "../imports/categories/heavy-equipment.webp";
import homeKitchen from "../imports/categories/home-kitchen.webp";
import musicAudio from "../imports/categories/music-audio.webp";
import officeBusiness from "../imports/categories/office-business.webp";
import outdoorCamping from "../imports/categories/outdoor-camping.webp";
import partyEvents from "../imports/categories/party-events.webp";
import photoVideo from "../imports/categories/photo-video.webp";
import realEstate from "../imports/categories/real-estate.webp";
import sportsRecreation from "../imports/categories/sports-recreation.webp";
import toolsDiy from "../imports/categories/tools-diy.webp";
import uniqueOther from "../imports/categories/unique-other.webp";
import vehicles from "../imports/categories/vehicles.webp";

/**
 * Artwork per top-level category, keyed by the canonical English name that
 * `CATEGORIES` uses — localized labels are display-only and never keys here.
 */
const CATEGORY_ART: Record<string, string> = {
  "Baby & Kids": babyKids,
  "Bikes & Scooters": bikesScooters,
  "Boats & Water": boatsWater,
  Construction: construction,
  "Costume & Cosplay": costumeCosplay,
  "Electronics & Tech": electronicsTech,
  "Garden & Yard": gardenYard,
  "Gym & Fitness": gymFitness,
  "Heavy Equipment": heavyEquipment,
  "Home & Kitchen": homeKitchen,
  "Music & Audio": musicAudio,
  "Office & Business": officeBusiness,
  "Outdoor & Camping": outdoorCamping,
  "Party & Events": partyEvents,
  "Photo & Video": photoVideo,
  "Real Estate": realEstate,
  "Sports & Recreation": sportsRecreation,
  "Tools & DIY": toolsDiy,
  "Unique & Other": uniqueOther,
  Vehicles: vehicles,
};

/**
 * Artwork sits on a podium with air around it, so at the box an emoji fills it
 * reads noticeably smaller. Same trick the SVG glyphs use in `ShelfIcon`.
 */
const OPTICAL_SCALE = 1.25;

export function categoryArtSrc(category: string | null | undefined): string | null {
  if (!category) return null;
  return CATEGORY_ART[category.trim()] ?? null;
}

/**
 * A category's icon: its artwork, or the emoji it used to be drawn with.
 *
 * The fallback matters — a category added to the taxonomy before its artwork
 * is drawn still gets an icon everywhere instead of an empty box.
 */
export function CategoryIcon({
  category,
  emoji,
  size = 28,
  className = "",
}: {
  category: string | null | undefined;
  emoji?: string;
  size?: number;
  className?: string;
}) {
  const src = categoryArtSrc(category);

  if (!src) {
    return emoji ? <Emoji emoji={emoji} size={size} className={className} /> : null;
  }

  const box = Math.round(size * OPTICAL_SCALE);

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className={`inline-block shrink-0 select-none object-contain ${className}`}
      style={{ width: box, height: box }}
    />
  );
}
