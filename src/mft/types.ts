export type InterestId =
  | "diving"
  | "hiking"
  | "safari"
  | "beaches"
  | "yachting"
  | "gastronomy"
  | "culture"
  | "extreme"
  | "roadtrip";

export type CompanionType = "solo" | "couple" | "family" | "friends" | "group";
export type PaceType = "active" | "contemplative" | "mix";
export type TripStatus =
  | "draft"
  | "planning"
  | "booked"
  | "preparing"
  | "live"
  | "completed";
export type BookingStatus = "confirmed" | "pending" | "failed";
export type PackingCategory = "documents" | "health" | "clothes" | "tech";

export interface UserProfile {
  name: string;
  interests: InterestId[];
  companions: CompanionType;
  pace: PaceType;
  comfortLevel: number;
  budgetMin: number;
  budgetMax: number;
  onboardingComplete: boolean;
  wishlist: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  categories: InterestId[];
  bestSeasons: string[];
  safetyRating: number;
  visaInfo: string;
  temperatureRange: string;
  description: string;
  photos: string[];
  highlights: string[];
  accommodations: Accommodation[];
  seasonBadge: string;
  rating: number;
  activities: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  photo: string;
  rating: number;
}

export interface ItineraryStop {
  id: string;
  dayNumber: number;
  location: string;
  accommodation: string;
  activities: string[];
  notes?: string;
  photo: string;
}

export interface TripBooking {
  id: string;
  type: "flight" | "hotel" | "transfer" | "excursion";
  provider: string;
  reference: string;
  status: BookingStatus;
  cost: number;
  details: string;
}

export interface PackingItem {
  id: string;
  category: PackingCategory;
  item: string;
  checked: boolean;
  aiSuggested?: boolean;
}

export interface TripMember {
  id: string;
  name: string;
  role: "owner" | "co-host" | "guest";
  interests: string[];
  packingProgress: number;
  avatarColor: string;
}

export interface ActivityFeedItem {
  id: string;
  userName: string;
  type: "member" | "ai";
  content: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  price: string;
  photo: string;
}

export interface TripPhoto {
  id: string;
  url: string;
  locationTag: string;
}

export interface Trip {
  id: string;
  destinationId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  participantCount: number;
  totalCost: number;
  heroPhoto: string;
  itinerary: ItineraryStop[];
  bookings: TripBooking[];
  packing: PackingItem[];
  members: TripMember[];
  activityFeed: ActivityFeedItem[];
  restaurants: Restaurant[];
  photos: TripPhoto[];
  highlights: string[];
  stats?: {
    days: number;
    cities: number;
    km: number;
    photos: number;
  };
  aiTip?: string;
}
