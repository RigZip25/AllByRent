import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const LOCAL_REVIEWS_KEY = "allbyrent_reviews_v1";

export type Review = {
  id: string;
  rentalId: string;
  reviewerId: string;
  revieweeId: string;
  role: "renter" | "host";
  rating: number;
  comment: string;
  createdAt: string;
};

type SupabaseReviewRow = {
  id: string;
  rental_id: string;
  reviewer_id: string;
  reviewee_id: string;
  role: string;
  rating: number;
  comment: string;
  created_at: string;
};

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `rev-${Date.now()}`;
}

function rowToReview(row: SupabaseReviewRow): Review {
  return {
    id: row.id,
    rentalId: row.rental_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    role: row.role === "host" ? "host" : "renter",
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export function loadLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Review[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalReviews(next: Review[]): void {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(next.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

export function hasLocalReview(rentalId: string, reviewerId: string): boolean {
  return loadLocalReviews().some((r) => r.rentalId === rentalId && r.reviewerId === reviewerId);
}

export async function submitReviewRemote(params: Omit<Review, "id" | "createdAt">): Promise<Review> {
  const review: Review = {
    ...params,
    id: safeUuid(),
    createdAt: new Date().toISOString(),
  };

  // Always keep local copy for offline/demo.
  const local = loadLocalReviews();
  local.unshift(review);
  saveLocalReviews(local);

  if (!isSupabaseConfigured()) return review;
  const supabase = getSupabaseClient();
  if (!supabase) return review;

  const row: Omit<SupabaseReviewRow, "created_at"> = {
    id: review.id,
    rental_id: review.rentalId,
    reviewer_id: review.reviewerId,
    reviewee_id: review.revieweeId,
    role: review.role,
    rating: review.rating,
    comment: review.comment,
  };

  const { error } = await supabase.from("reviews").insert(row);
  if (error) {
    // ignore; local copy already saved
  }
  return review;
}

export async function fetchReviewsForUserRemote(userId: string): Promise<Review[]> {
  // If Supabase is configured, RLS enforces blind-review visibility.
  if (!isSupabaseConfigured()) {
    return loadLocalReviews().filter((r) => r.revieweeId === userId);
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadLocalReviews().filter((r) => r.revieweeId === userId);
  }
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) {
    return loadLocalReviews().filter((r) => r.revieweeId === userId);
  }
  return (data as unknown as SupabaseReviewRow[]).map(rowToReview);
}

