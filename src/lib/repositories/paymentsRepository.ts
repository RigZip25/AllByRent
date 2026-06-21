import type { GarageCartLine } from "../garageShopStorage";
import { clearGarageCart, formatShopUsd } from "../garageShopStorage";
import { markAuctionCheckoutComplete } from "../garageAuctionState";
import { pushInAppNotification } from "../inAppNotifications";
import { isGarageCommerceBackendReady } from "../config/integrations";
import { isStripePaymentsEnabled } from "../stripeConfig";
import { createAuctionCheckoutIntent, createGarageCartCheckoutIntent, getAccessToken } from "../stripePayments";

export type CheckoutMode = "demo" | "stripe";

export type GarageCartCheckoutInput = {
  hostId: string;
  garageName: string;
  lines: GarageCartLine[];
  subtotalUsd: number;
  platformFeeUsd: number;
  totalUsd: number;
};

export type AuctionCheckoutInput = {
  listingId: string;
  hostId: string;
  hostName: string;
  itemTitle: string;
  winningBidUsd: number;
  platformFeeUsd: number;
  totalUsd: number;
  runnerUpAttempt: number;
};

export type CheckoutIntentResult =
  | { ok: true; mode: "demo" }
  | { ok: true; mode: "stripe"; clientSecret: string; paymentIntentId: string; orderId: string }
  | { ok: false; reason: string };

export function getGarageCheckoutMode(): CheckoutMode {
  return isGarageCommerceBackendReady() ? "stripe" : "demo";
}

export function formatCheckoutModeLabel(mode: CheckoutMode): string {
  return mode === "stripe" ? "Live Stripe checkout" : "Demo checkout";
}

export async function startGarageCartCheckout(
  input: GarageCartCheckoutInput,
): Promise<CheckoutIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: true, mode: "demo" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required for live checkout" };
  }

  const amountCents = Math.max(50, Math.round(input.totalUsd * 100));
  const result = await createGarageCartCheckoutIntent({
    hostId: input.hostId,
    lines: input.lines.map((line) => ({
      listingId: line.listingId,
      priceUsd: line.priceUsd,
      title: line.title,
    })),
    amountCents,
    subtotalCents: Math.round(input.subtotalUsd * 100),
    platformFeeCents: Math.round(input.platformFeeUsd * 100),
  });

  if (!result.ok) {
    if (result.reason === "Stripe not configured" || result.reason.includes("not implemented")) {
      return { ok: true, mode: "demo" };
    }
    return result;
  }

  return {
    ok: true,
    mode: "stripe",
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
    orderId: result.orderId,
  };
}

export async function startAuctionCheckout(
  input: AuctionCheckoutInput,
): Promise<CheckoutIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: true, mode: "demo" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required for live checkout" };
  }

  const amountCents = Math.max(50, Math.round(input.totalUsd * 100));
  const result = await createAuctionCheckoutIntent({
    listingId: input.listingId,
    hostId: input.hostId,
    winningBidUsd: input.winningBidUsd,
    amountCents,
    platformFeeCents: Math.round(input.platformFeeUsd * 100),
    runnerUpAttempt: input.runnerUpAttempt,
  });

  if (!result.ok) {
    if (result.reason === "Stripe not configured" || result.reason.includes("not implemented")) {
      return { ok: true, mode: "demo" };
    }
    return result;
  }

  return {
    ok: true,
    mode: "stripe",
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
    orderId: result.orderId,
  };
}

export function completeGarageCartCheckoutDemo(input: GarageCartCheckoutInput): void {
  pushInAppNotification({
    type: "general",
    title: "Order placed (demo)",
    body: `${input.lines.length} item(s) from ${input.garageName} · ${formatShopUsd(input.totalUsd)} total.`,
  });
  clearGarageCart();
}

export function completeGarageCartCheckoutLive(input: GarageCartCheckoutInput): void {
  pushInAppNotification({
    type: "general",
    title: "Garage order paid",
    body: `${input.lines.length} item(s) from ${input.garageName} · pick up at the sale.`,
  });
  clearGarageCart();
}

export function completeAuctionCheckoutDemo(input: AuctionCheckoutInput): void {
  markAuctionCheckoutComplete(input.listingId, input.winningBidUsd, input.itemTitle);
  pushInAppNotification({
    type: "general",
    title: "Auction paid (demo)",
    body: `${input.itemTitle} — pick up from ${input.hostName}.`,
  });
}

export function completeAuctionCheckoutLive(input: AuctionCheckoutInput): void {
  markAuctionCheckoutComplete(input.listingId, input.winningBidUsd, input.itemTitle);
  pushInAppNotification({
    type: "general",
    title: "Auction paid",
    body: `${input.itemTitle} — pick up from ${input.hostName}.`,
  });
}
