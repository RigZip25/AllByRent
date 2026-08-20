import { SUPPORT_EMAIL } from "./brand";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import {
  looksLikeMaskedHostileProfanity,
  looksLikeOffPlatformContact,
} from "./peerChatModeration";
import { sanitizeUserText } from "./textSanitize";

const DISPUTES_KEY = "allbyrent_disputes_v1";

export type DisputeStatus = "open" | "under_review" | "resolved";
export type DisputeReasonCode =
  | "damage"
  | "missing_item"
  | "condition"
  | "deposit"
  | "other";
export type DisputeResolutionOutcome =
  | "favor_renter"
  | "favor_host"
  | "split"
  | "withdrawn";

export type Dispute = {
  id: string;
  rentalId: string;
  openedBy: string;
  status: DisputeStatus;
  reasonCode: DisputeReasonCode;
  notes: string;
  depositFrozen: boolean;
  evidenceDeadline: string;
  renterEvidence: string[]; // data URLs
  ownerEvidence: string[]; // data URLs
  createdAt: string;
  proposedOutcome?: DisputeResolutionOutcome | null;
  proposedBy?: string | null;
  resolutionOutcome?: DisputeResolutionOutcome | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  acknowledgedBy?: string | null;
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
  reason_code?: string | null;
  notes?: string | null;
  proposed_outcome?: string | null;
  proposed_by?: string | null;
  resolution_outcome?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  acknowledged_by?: string | null;
};

const REASON_CODES: DisputeReasonCode[] = [
  "damage",
  "missing_item",
  "condition",
  "deposit",
  "other",
];

const OUTCOMES: DisputeResolutionOutcome[] = [
  "favor_renter",
  "favor_host",
  "split",
  "withdrawn",
];

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `disp-${Date.now()}`;
}

function parseReasonCode(raw: unknown): DisputeReasonCode {
  const v = String(raw ?? "other");
  return REASON_CODES.includes(v as DisputeReasonCode) ? (v as DisputeReasonCode) : "other";
}

function parseOutcome(raw: unknown): DisputeResolutionOutcome | null {
  if (raw == null || raw === "") return null;
  const v = String(raw);
  return OUTCOMES.includes(v as DisputeResolutionOutcome)
    ? (v as DisputeResolutionOutcome)
    : null;
}

function parseStatus(raw: unknown): DisputeStatus {
  const v = String(raw ?? "open");
  if (v === "under_review") return "under_review";
  if (v === "resolved" || v === "closed") return "resolved";
  return "open";
}

export function loadLocalDisputes(): Dispute[] {
  try {
    const raw = localStorage.getItem(DISPUTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Dispute[];
    return Array.isArray(parsed) ? parsed.map(normalizeDispute) : [];
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

function upsertLocal(dispute: Dispute): Dispute {
  const list = loadLocalDisputes().filter((d) => d.id !== dispute.id && d.rentalId !== dispute.rentalId);
  list.unshift(dispute);
  saveLocalDisputes(list);
  return dispute;
}

function normalizeDispute(d: Dispute): Dispute {
  return {
    ...d,
    status: parseStatus(d.status),
    reasonCode: parseReasonCode(d.reasonCode),
    notes: typeof d.notes === "string" ? d.notes : "",
    proposedOutcome: parseOutcome(d.proposedOutcome),
    resolutionOutcome: parseOutcome(d.resolutionOutcome),
  };
}

export function getLocalDisputeForRental(rentalId: string): Dispute | null {
  return loadLocalDisputes().find((d) => d.rentalId === rentalId) ?? null;
}

function rowToDispute(row: SupabaseDisputeRow): Dispute {
  return normalizeDispute({
    id: row.id,
    rentalId: row.rental_id,
    openedBy: row.opened_by,
    status: parseStatus(row.status),
    reasonCode: parseReasonCode(row.reason_code),
    notes: typeof row.notes === "string" ? row.notes : "",
    depositFrozen: Boolean(row.deposit_frozen),
    evidenceDeadline: row.evidence_deadline,
    renterEvidence: Array.isArray(row.renter_evidence) ? (row.renter_evidence as string[]) : [],
    ownerEvidence: Array.isArray(row.owner_evidence) ? (row.owner_evidence as string[]) : [],
    createdAt: row.created_at,
    proposedOutcome: parseOutcome(row.proposed_outcome),
    proposedBy: row.proposed_by ?? null,
    resolutionOutcome: parseOutcome(row.resolution_outcome),
    resolvedAt: row.resolved_at ?? null,
    resolvedBy: row.resolved_by ?? null,
    acknowledgedBy: row.acknowledged_by ?? null,
  });
}

/** Soft gate for dispute notes — reuses peer-chat heuristics (no LLM round-trip). */
export function moderateDisputeText(text: string): {
  ok: boolean;
  cleaned: string;
  reason: "ok" | "blocked" | "off_platform" | "empty";
} {
  const cleaned = sanitizeUserText(text).trim();
  if (!cleaned) return { ok: true, cleaned: "", reason: "empty" };
  if (looksLikeOffPlatformContact(cleaned)) {
    return { ok: false, cleaned, reason: "off_platform" };
  }
  if (looksLikeMaskedHostileProfanity(cleaned)) {
    return { ok: false, cleaned, reason: "blocked" };
  }
  return { ok: true, cleaned, reason: "ok" };
}

export function disputeSupportMailto(params: {
  rentalId: string;
  disputeId?: string | null;
  itemTitle?: string | null;
}): string {
  const subject = encodeURIComponent(
    `Dispute support — rental ${params.rentalId}${params.disputeId ? ` / ${params.disputeId}` : ""}`,
  );
  const body = encodeURIComponent(
    [
      "Hello Evorios support,",
      "",
      "I need help with a rental dispute.",
      `Rental ID: ${params.rentalId}`,
      params.disputeId ? `Dispute ID: ${params.disputeId}` : null,
      params.itemTitle ? `Item: ${params.itemTitle}` : null,
      "",
      "Please describe what happened below:",
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export function isDisputeActive(dispute: Dispute | null | undefined): boolean {
  return Boolean(dispute && dispute.status !== "resolved");
}

export async function openDisputeRemote(params: {
  rentalId: string;
  openedBy: string;
  reasonCode: DisputeReasonCode;
  notes?: string;
}): Promise<Dispute> {
  const mod = moderateDisputeText(params.notes ?? "");
  if (!mod.ok) {
    throw new Error(mod.reason === "off_platform" ? "off_platform" : "blocked");
  }

  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(deadline.getHours() + 48);

  const dispute: Dispute = {
    id: safeUuid(),
    rentalId: params.rentalId,
    openedBy: params.openedBy,
    status: "open",
    reasonCode: params.reasonCode,
    notes: mod.cleaned,
    depositFrozen: true,
    evidenceDeadline: deadline.toISOString(),
    renterEvidence: [],
    ownerEvidence: [],
    createdAt: now.toISOString(),
    proposedOutcome: null,
    proposedBy: null,
    resolutionOutcome: null,
    resolvedAt: null,
    resolvedBy: null,
    acknowledgedBy: null,
  };

  upsertLocal(dispute);

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
    reason_code: dispute.reasonCode,
    notes: dispute.notes,
  };
  const { error } = await supabase.from("disputes").insert(row);
  if (error) {
    // Unique on rental_id — return the existing open dispute instead of duplicating.
    const code = (error as { code?: string }).code;
    const msg = String((error as { message?: string }).message ?? "").toLowerCase();
    const isUnique =
      code === "23505" || msg.includes("disputes_unique_rental") || msg.includes("duplicate");
    if (isUnique) {
      const existing = await fetchDisputeForRentalRemote(params.rentalId);
      if (existing) return existing;
    }
    // else keep local draft; remote may catch up later
  }
  return dispute;
}

export async function addEvidenceRemote(params: {
  dispute: Dispute;
  side: "renter" | "owner";
  dataUrl: string;
}): Promise<Dispute> {
  if (params.dispute.status === "resolved") return params.dispute;

  const next: Dispute =
    params.side === "renter"
      ? { ...params.dispute, renterEvidence: [...params.dispute.renterEvidence, params.dataUrl] }
      : { ...params.dispute, ownerEvidence: [...params.dispute.ownerEvidence, params.dataUrl] };

  upsertLocal(next);

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

export async function submitDisputeForReviewRemote(params: {
  dispute: Dispute;
  actorId: string;
}): Promise<Dispute> {
  if (params.dispute.status === "resolved") return params.dispute;

  const next: Dispute = {
    ...params.dispute,
    status: "under_review",
  };
  upsertLocal(next);

  if (!isSupabaseConfigured()) return next;
  const supabase = getSupabaseClient();
  if (!supabase) return next;

  await supabase
    .from("disputes")
    .update({ status: "under_review" })
    .eq("id", next.id);
  return next;
}

export async function proposeDisputeResolutionRemote(params: {
  dispute: Dispute;
  actorId: string;
  outcome: DisputeResolutionOutcome;
}): Promise<Dispute> {
  if (params.dispute.status === "resolved") return params.dispute;

  // Withdrawal by opener can finalize immediately.
  if (params.outcome === "withdrawn" && params.dispute.openedBy === params.actorId) {
    return finalizeDisputeRemote({
      dispute: params.dispute,
      actorId: params.actorId,
      outcome: "withdrawn",
      acknowledgedBy: params.actorId,
    });
  }

  const next: Dispute = {
    ...params.dispute,
    status: params.dispute.status === "open" ? "under_review" : params.dispute.status,
    proposedOutcome: params.outcome,
    proposedBy: params.actorId,
  };
  upsertLocal(next);

  if (!isSupabaseConfigured()) return next;
  const supabase = getSupabaseClient();
  if (!supabase) return next;

  await supabase
    .from("disputes")
    .update({
      status: next.status,
      proposed_outcome: next.proposedOutcome,
      proposed_by: next.proposedBy,
    })
    .eq("id", next.id);
  return next;
}

export async function acknowledgeDisputeResolutionRemote(params: {
  dispute: Dispute;
  actorId: string;
}): Promise<Dispute> {
  if (params.dispute.status === "resolved") return params.dispute;
  if (!params.dispute.proposedOutcome || !params.dispute.proposedBy) {
    throw new Error("no_proposal");
  }
  if (params.dispute.proposedBy === params.actorId) {
    throw new Error("cannot_self_ack");
  }

  return finalizeDisputeRemote({
    dispute: params.dispute,
    actorId: params.dispute.proposedBy,
    outcome: params.dispute.proposedOutcome,
    acknowledgedBy: params.actorId,
  });
}

async function finalizeDisputeRemote(params: {
  dispute: Dispute;
  actorId: string;
  outcome: DisputeResolutionOutcome;
  acknowledgedBy: string;
}): Promise<Dispute> {
  const now = new Date().toISOString();
  const next: Dispute = {
    ...params.dispute,
    status: "resolved",
    depositFrozen: false,
    resolutionOutcome: params.outcome,
    resolvedAt: now,
    resolvedBy: params.actorId,
    acknowledgedBy: params.acknowledgedBy,
    proposedOutcome: params.outcome,
    proposedBy: params.actorId,
  };
  upsertLocal(next);

  if (!isSupabaseConfigured()) return next;
  const supabase = getSupabaseClient();
  if (!supabase) return next;

  await supabase
    .from("disputes")
    .update({
      status: "resolved",
      deposit_frozen: false,
      resolution_outcome: next.resolutionOutcome,
      resolved_at: next.resolvedAt,
      resolved_by: next.resolvedBy,
      acknowledged_by: next.acknowledgedBy,
      proposed_outcome: next.proposedOutcome,
      proposed_by: next.proposedBy,
    })
    .eq("id", next.id);
  return next;
}

export async function fetchDisputeForRentalRemote(rentalId: string): Promise<Dispute | null> {
  if (!isSupabaseConfigured()) return getLocalDisputeForRental(rentalId);
  const supabase = getSupabaseClient();
  if (!supabase) return getLocalDisputeForRental(rentalId);
  const { data, error } = await supabase.from("disputes").select("*").eq("rental_id", rentalId).maybeSingle();
  if (error || !data) return getLocalDisputeForRental(rentalId);
  const dispute = rowToDispute(data as SupabaseDisputeRow);
  upsertLocal(dispute);
  return dispute;
}
