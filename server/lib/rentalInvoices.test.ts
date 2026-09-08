import { describe, expect, it } from "vitest";
import { readInvoices, sanitizeLines, sumLines } from "./rentalInvoices";

describe("sanitizeLines", () => {
  it("drops lines below the minimum and above the dispute ceiling", () => {
    const lines = sanitizeLines([
      { kind: "fuel_fee", label: "Fuel", amountCents: 2000 },
      { kind: "toll", label: "Toll", amountCents: 20 },
      { kind: "damage", label: "Damage", amountCents: 900_000 },
    ]);
    expect(lines.map((line) => line.label)).toEqual(["Fuel"]);
  });

  it("falls back to a custom line for a kind it does not know", () => {
    const [line] = sanitizeLines([{ kind: "made_up", label: "", amountCents: 500 }]);
    expect(line.kind).toBe("custom");
    expect(line.label).toBe("custom");
  });

  it("keeps at most twelve lines and sums them", () => {
    const lines = sanitizeLines(
      Array.from({ length: 20 }, () => ({ kind: "toll", label: "Toll", amountCents: 100 })),
    );
    expect(lines).toHaveLength(12);
    expect(sumLines(lines)).toBe(1200);
  });
});

describe("readInvoices", () => {
  it("ignores anything that is not an invoice", () => {
    expect(readInvoices([null, 3, {}, { id: "inv-1" }])).toEqual([{ id: "inv-1" }]);
  });

  it("reads an empty list from a column that was never written", () => {
    expect(readInvoices(null)).toEqual([]);
  });
});
