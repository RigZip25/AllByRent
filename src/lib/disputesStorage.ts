import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const DISPUTES_KEY = "allbyrent_disputes_v1";

export type Dispute = {
  id: string;
  rentalId: string;
  openedBy: string;
  status: "open" | "closed";
  depositFrozen: boolean;
  evidenceDeadline: string;
  renterEvidence: string[]; // data URLs
  ownerEvidence: string[]; // data URLs
  createdAt: string;
};

type SupabaseDisputeRow = {
  id: string;
  rental_id: string;
  opened_by: string;
  status: string;
  deposit_frozen: boolean;
  evidence_deadline: string;
  renter_evidence: unknown;
  owner_evidence: unknown;
  created_at: string;
};

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `disp-${Date.now()}`;
}

export function loadLocalDisputes(): Dispute[] {
  try {
    const raw = localStorage.getItem(DISPUTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Dispute[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalDisputes(next: Dispute[]): void {
  try {
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(next.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function getLocalDisputeForRental(rentalId: string): Dispute | null {
  return loadLocalDisputes().find((d) => d.rentalId === rentalId) ?? null;
}

function rowToDispute(row: SupabaseDisputeRow): Dispute {
  return {
    id: row.id,
    rentalId: row.rental_id,
    openedBy: row.opened_by,
    status: row.status === "closed" ? "closed" : "open",
    depositFrozen: Boolean(row.deposit_frozen),
    evidenceDeadline: row.evidence_deadline,
    renterEvidence: Array.isArray(row.renter_evidence) ? (row.renter_evidence as string[]) : [],
    ownerEvidence: Array.isArray(row.owner_evidence) ? (row.owner_evidence as string[]) : [],
    createdAt: row.created_at,
  };
}

export async function openDisputeRemote(params: {
  rentalId: string;
  openedBy: string;
}): Promise<Dispute> {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(deadline.getHours() + 48);

  const dispute: Dispute = {
    id: safeUuid(),
    rentalId: params.rentalId,
    openedBy: params.openedBy,
    status: "open",
    depositFrozen: true,
    evidenceDeadline: deadline.toISOString(),
    renterEvidence: [],
    ownerEvidence: [],
    createdAt: now.toISOString(),
  };

  // local always
  const list = loadLocalDisputes().filter((d) => d.rentalId !== params.rentalId);
  list.unshift(dispute);
  saveLocalDisputes(list);

  if (!isSupabaseConfigured()) return dispute;
  const supabase = getSupabaseClient();
  if (!supabase) return dispute;

  const row = {
    id: dispute.id,
    rental_id: dispute.rentalId,
    opened_by: dispute.openedBy,
    status: dispute.status,
    deposit_frozen: dispute.depositFrozen,
    evidence_deadline: dispute.evidenceDeadline,
    renter_evidence: [],
    owner_evidence: [],
  };
  const { error } = await supabase.from("disputes").insert(row);
  if (error) {
    // ignore; local saved
  }
  return dispute;
}

export async function addEvidenceRemote(params: {
  dispute: Dispute;
  side: "renter" | "owner";
  dataUrl: string;
}): Promise<Dispute> {
  const next: Dispute =
    params.side === "renter"
      ? { ...params.dispute, renterEvidence: [...params.dispute.renterEvidence, params.dataUrl] }
      : { ...params.dispute, ownerEvidence: [...params.dispute.ownerEvidence, params.dataUrl] };

  const list = loadLocalDisputes().filter((d) => d.id !== next.id);
  list.unshift(next);
  saveLocalDisputes(list);

  if (!isSupabaseConfigured()) return next;
  const supabase = getSupabaseClient();
  if (!supabase) return next;

  const patch =
    params.side === "renter"
      ? { renter_evidence: next.renterEvidence }
      : { owner_evidence: next.ownerEvidence };
  const { error } = await supabase.from("disputes").update(patch).eq("id", next.id);
  if (error) {
    // ignore
  }
  return next;
}

export async function fetchDisputeForRentalRemote(rentalId: string): Promise<Dispute | null> {
  if (!isSupabaseConfigured()) return getLocalDisputeForRental(rentalId);
  const supabase = getSupabaseClient();
  if (!supabase) return getLocalDisputeForRental(rentalId);
  const { data, error } = await supabase.from("disputes").select("*").eq("rental_id", rentalId).maybeSingle();
  if (error || !data) return getLocalDisputeForRental(rentalId);
  return rowToDispute(data as SupabaseDisputeRow);
}

