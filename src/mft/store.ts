import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CompanionType,
  InterestId,
  PaceType,
  Trip,
  UserProfile,
} from "./types";
import { DEMO_TRIPS, createTripFromDestination } from "./data/trips";
import { DESTINATIONS } from "./data/destinations";

interface MftState {
  _hasHydrated: boolean;
  profile: UserProfile;
  trips: Trip[];
  selectedMapDestinationId: string | null;
  aiDraftQuery: string;
  setHasHydrated: (v: boolean) => void;
  setName: (name: string) => void;
  toggleInterest: (id: InterestId) => void;
  setCompanions: (c: CompanionType) => void;
  setPace: (p: PaceType) => void;
  setComfort: (n: number) => void;
  setBudget: (min: number, max: number) => void;
  completeOnboarding: () => void;
  toggleWishlist: (destinationId: string) => void;
  setSelectedMapDestination: (id: string | null) => void;
  setAiDraftQuery: (q: string) => void;
  addTrip: (destinationId: string, title?: string) => string;
  updateTrip: (tripId: string, patch: Partial<Trip>) => void;
  togglePackingItem: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, item: string) => void;
  confirmBookings: (tripId: string) => void;
  setTripStatus: (tripId: string, status: Trip["status"]) => void;
  resetDemo: () => void;
}

const defaultProfile: UserProfile = {
  name: "",
  interests: [],
  companions: "couple",
  pace: "contemplative",
  comfortLevel: 80,
  budgetMin: 3000,
  budgetMax: 12000,
  onboardingComplete: false,
  wishlist: [],
};

export const useMftStore = create<MftState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      profile: defaultProfile,
      trips: DEMO_TRIPS,
      selectedMapDestinationId: DESTINATIONS[0].id,
      aiDraftQuery: "",

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setName: (name) =>
        set((s) => ({ profile: { ...s.profile, name } })),

      toggleInterest: (id) =>
        set((s) => {
          const has = s.profile.interests.includes(id);
          return {
            profile: {
              ...s.profile,
              interests: has
                ? s.profile.interests.filter((x) => x !== id)
                : [...s.profile.interests, id],
            },
          };
        }),

      setCompanions: (companions) =>
        set((s) => ({ profile: { ...s.profile, companions } })),

      setPace: (pace) => set((s) => ({ profile: { ...s.profile, pace } })),

      setComfort: (comfortLevel) =>
        set((s) => ({ profile: { ...s.profile, comfortLevel } })),

      setBudget: (budgetMin, budgetMax) =>
        set((s) => ({ profile: { ...s.profile, budgetMin, budgetMax } })),

      completeOnboarding: () =>
        set((s) => ({
          profile: { ...s.profile, onboardingComplete: true },
        })),

      toggleWishlist: (destinationId) =>
        set((s) => {
          const has = s.profile.wishlist.includes(destinationId);
          return {
            profile: {
              ...s.profile,
              wishlist: has
                ? s.profile.wishlist.filter((x) => x !== destinationId)
                : [...s.profile.wishlist, destinationId],
            },
          };
        }),

      setSelectedMapDestination: (id) =>
        set({ selectedMapDestinationId: id }),

      setAiDraftQuery: (q) => set({ aiDraftQuery: q }),

      addTrip: (destinationId, title) => {
        const trip = createTripFromDestination(destinationId, title);
        set((s) => ({ trips: [trip, ...s.trips] }));
        return trip.id;
      },

      updateTrip: (tripId, patch) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? { ...t, ...patch } : t)),
        })),

      togglePackingItem: (tripId, itemId) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== tripId) return t;
            const packing = t.packing.map((p) =>
              p.id === itemId ? { ...p, checked: !p.checked } : p,
            );
            const checked = packing.filter((p) => p.checked).length;
            const progress = packing.length
              ? Math.round((checked / packing.length) * 100)
              : 0;
            const members = t.members.map((m, i) =>
              i === 0 ? { ...m, packingProgress: progress } : m,
            );
            return { ...t, packing, members };
          }),
        })),

      addPackingItem: (tripId, item) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              packing: [
                ...t.packing,
                {
                  id: `pack-${Date.now()}`,
                  category: "clothes" as const,
                  item,
                  checked: false,
                  aiSuggested: true,
                },
              ],
            };
          }),
        })),

      confirmBookings: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        get().updateTrip(tripId, {
          status: "preparing",
          bookings:
            trip?.bookings.map((b) => ({
              ...b,
              status: "confirmed" as const,
            })) ?? [],
        });
      },

      setTripStatus: (tripId, status) => get().updateTrip(tripId, { status }),

      resetDemo: () =>
        set({
          profile: defaultProfile,
          trips: DEMO_TRIPS,
          selectedMapDestinationId: DESTINATIONS[0].id,
          aiDraftQuery: "",
        }),
    }),
    {
      name: "mft-store-v2",
      partialize: (s) => ({
        profile: s.profile,
        trips: s.trips,
        selectedMapDestinationId: s.selectedMapDestinationId,
        aiDraftQuery: s.aiDraftQuery,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
