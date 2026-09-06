import { describe, expect, it } from "vitest";
import {
  parseFieldExtraction,
  resolveExtractedFields,
  type AllowedField,
} from "../../server/lib/listingAi/fields";
import {
  allowedFieldsPayload,
  applyFilledFieldsToSpecs,
} from "../../src/screens/listing/ai/listingFieldFill";
import { getCategorySpecFields } from "../../src/screens/listing/categorySpecs";

const ALLOWED: AllowedField[] = [
  { key: "brand", type: "brand", required: true, options: ["Sony", "Canon", "Nikon"] },
  { key: "model", type: "text", required: true },
  {
    key: "kitIncludes",
    type: "select",
    required: true,
    options: ["body_only", "kit_lens", "full_kit"],
  },
  { key: "replacementValue", type: "number", required: true },
  { key: "weightKg", type: "number", required: false },
];

describe("field extraction guardrails", () => {
  it("keeps a brand the model actually read off the item", () => {
    const fields = resolveExtractedFields(
      { fields: [{ fieldKey: "brand", value: "Sony", confidence: "high", source: "image" }] },
      ALLOWED,
    );
    expect(fields).toEqual([
      { fieldKey: "brand", value: "Sony", confidence: "high", source: "image" },
    ]);
  });

  it("nulls a brand the model only inferred from the item type", () => {
    const fields = resolveExtractedFields(
      { fields: [{ fieldKey: "brand", value: "Canon", confidence: "medium", source: "inferred" }] },
      ALLOWED,
    );
    expect(fields[0]).toMatchObject({ fieldKey: "brand", value: null, confidence: "low" });
  });

  it("nulls a brand that is not one of the offered options", () => {
    const fields = resolveExtractedFields(
      { fields: [{ fieldKey: "brand", value: "Acme", confidence: "high", source: "image" }] },
      ALLOWED,
    );
    expect(fields[0]!.value).toBeNull();
  });

  it("never reports a replacement value, even a confident one", () => {
    const fields = resolveExtractedFields(
      {
        fields: [
          { fieldKey: "replacementValue", value: "1200", confidence: "high", source: "image" },
        ],
      },
      ALLOWED,
    );
    expect(fields).toEqual([]);
  });

  it("drops fields that are not in the schema", () => {
    const fields = resolveExtractedFields(
      {
        fields: [
          { fieldKey: "favouriteColour", value: "green", confidence: "high", source: "image" },
        ],
      },
      ALLOWED,
    );
    expect(fields).toEqual([]);
  });

  it("snaps select values onto the schema's options", () => {
    const fields = resolveExtractedFields(
      {
        fields: [
          { fieldKey: "kitIncludes", value: "Kit Lens", confidence: "medium", source: "image" },
        ],
      },
      ALLOWED,
    );
    expect(fields[0]!.value).toBe("kit_lens");
  });

  it("nulls a number the model wrote as prose", () => {
    const fields = resolveExtractedFields(
      { fields: [{ fieldKey: "weightKg", value: "fairly light", confidence: "low", source: "inferred" }] },
      ALLOWED,
    );
    expect(fields[0]!.value).toBeNull();
  });

  it("leaves undetectable required fields for the host", () => {
    const parsed = parseFieldExtraction(
      JSON.stringify({
        fields: [
          { fieldKey: "brand", value: null, confidence: "low", source: "image" },
          { fieldKey: "model", value: "unknown", confidence: "low", source: "inferred" },
          { fieldKey: "kitIncludes", value: "full_kit", confidence: "high", source: "image" },
        ],
      }),
      ALLOWED,
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const detected = parsed.fields.filter((field) => field.value !== null);
    expect(detected.map((field) => field.fieldKey)).toEqual(["kitIncludes"]);

    const stillRequired = ALLOWED.filter(
      (field) => field.required && !detected.some((hit) => hit.fieldKey === field.key),
    ).map((field) => field.key);
    expect(stillRequired).toEqual(["brand", "model", "replacementValue"]);
  });

  it("reports invalid JSON instead of guessing", () => {
    const parsed = parseFieldExtraction("The camera looks like a Sony.", ALLOWED);
    expect(parsed.ok).toBe(false);
  });
});

describe("applying filled fields to the draft", () => {
  it("fills blanks and never overwrites what the host typed", () => {
    const { specs, appliedKeys } = applyFilledFieldsToSpecs(
      { model: "A7 IV" },
      [
        { fieldKey: "brand", value: "Sony", confidence: "high", source: "image" },
        { fieldKey: "model", value: "A7 III", confidence: "medium", source: "image" },
        { fieldKey: "kitIncludes", value: null, confidence: "low", source: "image" },
      ],
    );
    expect(specs).toEqual({ model: "A7 IV", brand: "Sony" });
    expect(appliedKeys).toEqual(["brand"]);
  });
});

describe("schema handed to the model", () => {
  it("offers only the confirmed subcategory's fields, with their options", () => {
    const fields = getCategorySpecFields("Photo & Video", "Camera Kits", {
      rent: true,
      sell: false,
    });
    const payload = allowedFieldsPayload(fields, { rent: true, sell: false });
    const keys = payload.map((field) => field.key);

    expect(keys).toContain("cameraSensorOrMount");
    // Tripod-only fields belong to a different subcategory's schema.
    expect(keys).not.toContain("tripodHeadType");
    expect(payload.find((field) => field.key === "kitIncludes")?.options).toContain("full_kit");
    expect(payload.find((field) => field.key === "model")?.required).toBe(true);
  });

  it("uses a professional subcategory's own schema", () => {
    const fields = getCategorySpecFields("Photo & Video", "Stabilizers & Rigs", {
      rent: true,
      sell: false,
    });
    const keys = allowedFieldsPayload(fields, { rent: true, sell: false }).map(
      (field) => field.key,
    );

    expect(keys).toContain("tripodPayloadBand");
    expect(keys).not.toContain("cameraSensorOrMount");
  });
});
