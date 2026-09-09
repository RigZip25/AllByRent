/**
 * Renter trust attestation snapshot for rentals (Stage 21 L1 / L9).
 * Persists which checkboxes were attested and when — for disputes and agreement text.
 */

import type { RentalBooking } from "./rentalsStorage";

export type RenterAttestationEntry = {
  key: string;
  attested: true;
  attestedAt: string;
};

export type RenterAttestationSnapshot = {
  version: 1;
  attestedAt: string;
  entries: RenterAttestationEntry[];
};

const ATTESTATION_KEYS = [
  "physicalDamageAttested",
  "proRenterAttested",
  "cdlAttested",
  "operatorCertAttested",
  "boaterLicenseAttested",
  "driverLicenseValidAttested",
  "driverRecordSoftAttested",
  "motorcycleEndorsementAttested",
  "ohvTerrainWaiverAttested",
  "uscgSafetyAck",
  "droneCertAttested",
  "droneRemoteIdAck",
  "safetyBriefingAck",
  "ppeAckAttested",
  "liabilityWaiverAttested",
  "startIdDriverMatchAttested",
] as const;

type AttestationKey = (typeof ATTESTATION_KEYS)[number];

const LABEL: Record<AttestationKey, string> = {
  physicalDamageAttested: "Physical damage coverage attested",
  proRenterAttested: "Pro-renter credential attested",
  cdlAttested: "CDL attested",
  operatorCertAttested: "Operator credential attested",
  boaterLicenseAttested: "Boater / PWC license attested",
  driverLicenseValidAttested: "Valid driver’s license attested",
  driverRecordSoftAttested: "Driving-record soft attestation",
  motorcycleEndorsementAttested: "Motorcycle endorsement attested",
  ohvTerrainWaiverAttested: "OHV / ATV terrain waiver attested",
  uscgSafetyAck: "USCG safety kit acknowledged",
  droneCertAttested: "Drone / Remote ID attestation",
  droneRemoteIdAck: "Remote ID hardware acknowledged",
  safetyBriefingAck: "Safety briefing acknowledged",
  ppeAckAttested: "PPE acknowledgment",
  liabilityWaiverAttested: "Liability waiver attested",
  startIdDriverMatchAttested: "Start ID driver-match attested",
};

/** Build a durable snapshot from the booking’s boolean attestation flags. */
export function buildRenterAttestationSnapshot(
  booking: Partial<RentalBooking>,
  attestedAt: string = new Date().toISOString(),
): RenterAttestationSnapshot | null {
  const entries: RenterAttestationEntry[] = [];
  for (const key of ATTESTATION_KEYS) {
    if (booking[key] === true) {
      entries.push({ key, attested: true, attestedAt });
    }
  }
  if (booking.startIdCheckedAt && booking.startIdDriverMatchAttested) {
    if (!entries.some((e) => e.key === "startIdDriverMatchAttested")) {
      entries.push({
        key: "startIdDriverMatchAttested",
        attested: true,
        attestedAt: booking.startIdCheckedAt,
      });
    }
  }
  if (entries.length === 0) return null;
  return { version: 1, attestedAt, entries };
}

/** Apply a remote snapshot back onto booking boolean fields. */
export function applyRenterAttestationSnapshot(
  snapshot: RenterAttestationSnapshot | null | undefined,
): Partial<RentalBooking> {
  if (!snapshot?.entries?.length) return {};
  const patch: Partial<RentalBooking> = {};
  for (const entry of snapshot.entries) {
    if (entry.attested !== true) continue;
    if ((ATTESTATION_KEYS as readonly string[]).includes(entry.key)) {
      (patch as Record<string, unknown>)[entry.key] = true;
    }
    if (entry.key === "startIdDriverMatchAttested") {
      patch.startIdDriverMatchAttested = true;
      patch.startIdCheckedAt = entry.attestedAt;
    }
  }
  return patch;
}

/** Human-readable lines for the rental agreement download / enriched summary. */
export function formatAttestationAgreementLines(
  snapshot: RenterAttestationSnapshot | null | undefined,
): string[] {
  if (!snapshot?.entries?.length) return [];
  return [
    "— Renter attestations —",
    ...snapshot.entries.map((entry) => {
      const label =
        LABEL[entry.key as AttestationKey] ?? entry.key.replace(/([A-Z])/g, " $1").trim();
      return `${label} · ${entry.attestedAt}`;
    }),
  ];
}

export function isRenterAttestationSnapshot(
  value: unknown,
): value is RenterAttestationSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as RenterAttestationSnapshot;
  return v.version === 1 && Array.isArray(v.entries);
}
