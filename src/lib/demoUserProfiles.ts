export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
};

export type PublicUserProfile = {
  id: string;
  displayName: string;
  memberSince: string;
  avatarUrl: string | null;
  identityVerified: boolean;
  phoneVerified: boolean;
  rating: number;
  transactionCount: number;
  reviewCount: number;
  noShowCount: number;
  listings: { id: string; title: string; emoji: string; pricePerDay: number }[];
  reviews: PublicReview[];
};

const PROFILES: Record<string, PublicUserProfile> = {
  "john-davis": {
    id: "john-davis",
    displayName: "John Davis",
    memberSince: "2024-03-12",
    avatarUrl: null,
    identityVerified: true,
    phoneVerified: true,
    rating: 4.9,
    transactionCount: 47,
    reviewCount: 42,
    noShowCount: 0,
    listings: [
      { id: "l1", title: "Canon EOS R6 Kit", emoji: "📷", pricePerDay: 42 },
      { id: "l2", title: "Studio Lighting Kit", emoji: "💡", pricePerDay: 35 },
    ],
    reviews: [
      {
        id: "r1",
        authorName: "Alex M.",
        rating: 5,
        text: "Gear was spotless and pickup was easy.",
        date: "2026-04-02",
      },
      {
        id: "r2",
        authorName: "Sam K.",
        rating: 5,
        text: "Great communicator, would rent again.",
        date: "2026-03-18",
      },
      {
        id: "r3",
        authorName: "Lee P.",
        rating: 4,
        text: "Flexible on return time. Recommended.",
        date: "2026-02-10",
      },
    ],
  },
  "chris-t": {
    id: "chris-t",
    displayName: "Chris T.",
    memberSince: "2025-01-08",
    avatarUrl: null,
    identityVerified: true,
    phoneVerified: false,
    rating: 4.7,
    transactionCount: 12,
    reviewCount: 10,
    noShowCount: 1,
    listings: [],
    reviews: [
      {
        id: "r1",
        authorName: "Jordan M.",
        rating: 5,
        text: "Returned drill on time.",
        date: "2026-05-01",
      },
    ],
  },
  "maria-s": {
    id: "maria-s",
    displayName: "Maria S.",
    memberSince: "2023-11-20",
    avatarUrl: null,
    identityVerified: true,
    phoneVerified: true,
    rating: 5,
    transactionCount: 88,
    reviewCount: 76,
    noShowCount: 0,
    listings: [
      { id: "l1", title: "4-Person Camping Tent", emoji: "⛺", pricePerDay: 40 },
    ],
    reviews: [],
  },
};

export function getPublicProfile(userId: string): PublicUserProfile | null {
  return PROFILES[userId] ?? null;
}

export function resolveCounterpartyId(name: string | undefined): string {
  if (!name || !name.trim()) return "unknown-user";
  const map: Record<string, string> = {
    "John Davis": "john-davis",
    "Chris T.": "chris-t",
    "Maria S.": "maria-s",
    "Sam K.": "sam-k",
    "Pat R.": "pat-r",
    "Dana W.": "dana-w",
    "Mike L.": "mike-l",
    "Taylor H.": "taylor-h",
    "Riley N.": "riley-n",
    "Lee P.": "lee-p",
    "Jordan M.": "jordan-m",
  };
  return map[name] ?? name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
}
