import { z } from "zod";
import { taxonomyIdsForNames } from "../taxonomyCatalog";
import { postListingAi } from "./listingAiClient";

export type ListingCopyFact = { label: string; value: string };

export type ListingCopyOutcome =
  | { status: "ready"; title: string; description: string }
  | { status: "failed"; reason: "unknown_category" | "invalid_response" | "unavailable" };

const responseSchema = z.object({
  ok: z.literal(true),
  title: z.string(),
  description: z.string(),
});

/**
 * Generates title and description from confirmed data.
 *
 * No photos are sent: everything here has already been reviewed by the host,
 * which is what keeps the copy free of invented specifications.
 */
export async function generateListingCopyFromConfirmedData(params: {
  category: string;
  subcategory: string;
  listingType: "personal" | "professional";
  itemName: string;
  facts: ListingCopyFact[];
  locale?: string;
}): Promise<ListingCopyOutcome> {
  const ids = taxonomyIdsForNames(params.category, params.subcategory);
  if (!ids) return { status: "failed", reason: "unknown_category" };

  const facts = params.facts
    .filter((fact) => fact.label.trim() && fact.value.trim())
    .slice(0, 40)
    .map((fact) => ({
      label: fact.label.trim().slice(0, 80),
      value: fact.value.trim().slice(0, 160),
    }));

  const call = await postListingAi<unknown>("copy", {
    ...ids,
    listingType: params.listingType,
    itemName: params.itemName.trim().slice(0, 80) || params.subcategory,
    facts,
    ...(params.locale ? { locale: params.locale } : {}),
  });

  if (!call.ok) {
    return {
      status: "failed",
      reason: call.code === "invalid_response" ? "invalid_response" : "unavailable",
    };
  }

  const parsed = responseSchema.safeParse(call.data);
  if (!parsed.success) return { status: "failed", reason: "invalid_response" };

  return { status: "ready", title: parsed.data.title, description: parsed.data.description };
}
