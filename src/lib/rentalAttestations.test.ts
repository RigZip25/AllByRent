import { test, expect } from "vitest";
import {
  applyRenterAttestationSnapshot,
  buildRenterAttestationSnapshot,
  formatAttestationAgreementLines,
} from "./rentalAttestations";

test("buildRenterAttestationSnapshot captures true flags with timestamp", () => {
  const snap = buildRenterAttestationSnapshot(
    {
      cdlAttested: true,
      physicalDamageAttested: true,
      motorcycleEndorsementAttested: false,
    },
    "2026-09-09T12:00:00.000Z",
  );
  expect(snap).not.toBeNull();
  expect(snap!.entries.map((e) => e.key).sort()).toEqual([
    "cdlAttested",
    "physicalDamageAttested",
  ]);
  expect(snap!.entries.every((e) => e.attestedAt === "2026-09-09T12:00:00.000Z")).toBe(true);
});

test("applyRenterAttestationSnapshot restores booleans", () => {
  const patch = applyRenterAttestationSnapshot({
    version: 1,
    attestedAt: "2026-09-09T12:00:00.000Z",
    entries: [
      { key: "cdlAttested", attested: true, attestedAt: "2026-09-09T12:00:00.000Z" },
      {
        key: "startIdDriverMatchAttested",
        attested: true,
        attestedAt: "2026-09-09T13:00:00.000Z",
      },
    ],
  });
  expect(patch.cdlAttested).toBe(true);
  expect(patch.startIdDriverMatchAttested).toBe(true);
  expect(patch.startIdCheckedAt).toBe("2026-09-09T13:00:00.000Z");
});

test("formatAttestationAgreementLines includes labels and times", () => {
  const lines = formatAttestationAgreementLines({
    version: 1,
    attestedAt: "2026-09-09T12:00:00.000Z",
    entries: [
      { key: "cdlAttested", attested: true, attestedAt: "2026-09-09T12:00:00.000Z" },
    ],
  });
  expect(lines[0]).toContain("attestations");
  expect(lines.some((l) => l.includes("CDL") && l.includes("2026-09-09"))).toBe(true);
});
