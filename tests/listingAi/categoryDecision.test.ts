import { describe, expect, it } from "vitest";
import {
  applyCategoryDecision,
  applyListingType,
  candidateFromIds,
  candidateFromNames,
  clearCategoryDecision,
  isCorrectionOfSuggestion,
  selectCategoryOnly,
  suggestionsFromOutcome,
} from "../../src/screens/listing/ai/categoryDecision";
import type { ClassificationOutcome } from "../../src/screens/listing/ai/listingClassifier";
import { createInitialListingDraft, LISTING_STEP } from "../../src/screens/listing/types";
import { isListingStepValid } from "../../src/screens/listing/validation";
import { gradeForSubcategory } from "../../src/screens/listing/listingItemCategories";

const CAMERA = candidateFromIds("photo-video", "camera-kits", 0.91)!;
const RIG = candidateFromIds("photo-video", "stabilizers-rigs", 0.4)!;

function matchOutcome(): ClassificationOutcome {
  return {
    status: "match",
    itemName: "Mirrorless camera",
    primary: CAMERA,
    alternatives: [RIG],
    attributes: { brand: null, model: null, condition: null },
  };
}

describe("resolving candidates", () => {
  it("maps ids onto the display names the wizard renders", () => {
    expect(CAMERA).toMatchObject({
      categoryName: "Photo & Video",
      subcategoryLabel: "Camera Kits",
    });
  });

  it("refuses ids outside the taxonomy", () => {
    expect(candidateFromIds("photo-video", "display-systems")).toBeNull();
    expect(candidateFromIds("nope", "camera-kits")).toBeNull();
    expect(candidateFromNames("Photo & Video", "Not A Subcategory")).toBeNull();
  });
});

describe("confirming a suggestion", () => {
  it("records the decision but leaves the listing type to the host", () => {
    const draft = applyCategoryDecision(
      createInitialListingDraft(),
      CAMERA,
      "ai_confirmed",
      "Mirrorless camera",
    );

    expect(draft.category).toBe("Photo & Video");
    expect(draft.subcategory).toBe("Camera Kits");
    expect(draft.listingType).toBe("");
    expect(draft.grade).toBe("");
    expect(draft.categoryDecision).toMatchObject({
      source: "ai_confirmed",
      categoryId: "photo-video",
      subcategoryId: "camera-kits",
      itemName: "Mirrorless camera",
      score: 0.91,
    });
    // Category is confirmed but the step is not done until the host answers.
    expect(isListingStepValid(LISTING_STEP.category, draft)).toBe(false);
  });
});

describe("host corrects the suggestion", () => {
  it("detects a correction and stores it as a manual decision", () => {
    const outcome = matchOutcome();
    const picked = candidateFromNames("Electronics & Tech", "Display Systems")!;

    expect(isCorrectionOfSuggestion(outcome, picked)).toBe(true);
    expect(isCorrectionOfSuggestion(outcome, CAMERA)).toBe(false);

    const confirmed = applyListingType(
      applyCategoryDecision(createInitialListingDraft(), CAMERA, "ai_confirmed", "Camera"),
      "personal",
    );
    const corrected = applyCategoryDecision(confirmed, picked, "manual", "Television");

    expect(corrected.category).toBe("Electronics & Tech");
    expect(corrected.subcategory).toBe("Display Systems");
    expect(corrected.categoryDecision?.source).toBe("manual");
    expect(corrected.categoryDecision?.score).toBeUndefined();
    // A different schema now applies, so nothing from the old one survives.
    expect(corrected.listingType).toBe("");
    expect(corrected.categorySpecs).toEqual({});
    expect(corrected.aiFields).toBeNull();
    expect(corrected.aiFilledSpecKeys).toEqual([]);
  });

  it("keeps low-confidence candidates as suggestions for the manual selector", () => {
    const manual: ClassificationOutcome = {
      status: "manual",
      reason: "low_confidence",
      candidates: [CAMERA, RIG],
      itemName: "Unclear object",
      attributes: { brand: null, model: null, condition: null },
    };
    expect(suggestionsFromOutcome(manual)).toHaveLength(2);
    expect(suggestionsFromOutcome(matchOutcome())).toHaveLength(2);
    expect(suggestionsFromOutcome(null)).toEqual([]);
  });
});

describe("personal / professional", () => {
  it("addresses the shelf the confirmed subcategory lives on", () => {
    const base = applyCategoryDecision(
      createInitialListingDraft(),
      CAMERA,
      "ai_confirmed",
      "Camera",
    );

    const personal = applyListingType(base, "personal");
    expect(personal.listingType).toBe("personal");
    expect(personal.grade).toBe(gradeForSubcategory("Photo & Video", "Camera Kits"));
    expect(isListingStepValid(LISTING_STEP.category, personal)).toBe(true);

    const pro = applyListingType(
      applyCategoryDecision(createInitialListingDraft(), RIG, "manual", ""),
      "professional",
    );
    expect(pro.listingType).toBe("professional");
    expect(pro.grade).toBe("professional");
    expect(isListingStepValid(LISTING_STEP.category, pro)).toBe(true);
  });

  it("lets the host's answer decide when the label sits on both shelves", () => {
    const both = candidateFromNames("Photo & Video", "Other")!;
    expect(gradeForSubcategory("Photo & Video", "Other")).toBe("");

    const base = applyCategoryDecision(createInitialListingDraft(), both, "manual", "");
    expect(applyListingType(base, "personal").grade).toBe("personal");
    expect(applyListingType(base, "professional").grade).toBe("professional");
  });
});

describe("manual flow without AI", () => {
  it("completes the category step with no classification at all", () => {
    let draft = createInitialListingDraft();

    draft = selectCategoryOnly(draft, "Tools & DIY");
    expect(draft.subcategory).toBe("");
    expect(isListingStepValid(LISTING_STEP.category, draft)).toBe(false);

    const picked = candidateFromNames("Tools & DIY", "Welding Equipment")!;
    draft = applyCategoryDecision(draft, picked, "manual", "");
    draft = applyListingType(draft, "professional");

    expect(draft.categoryDecision?.source).toBe("manual");
    expect(draft.grade).toBe("professional");
    expect(isListingStepValid(LISTING_STEP.category, draft)).toBe(true);
  });

  it("clears everything when the host starts the pick over", () => {
    const draft = clearCategoryDecision(
      applyListingType(
        applyCategoryDecision(createInitialListingDraft(), CAMERA, "ai_confirmed", "Camera"),
        "personal",
      ),
    );

    expect(draft.category).toBe("");
    expect(draft.subcategory).toBe("");
    expect(draft.listingType).toBe("");
    expect(draft.categoryDecision).toBeNull();
    expect(isListingStepValid(LISTING_STEP.category, draft)).toBe(false);
  });
});
