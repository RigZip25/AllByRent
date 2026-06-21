import type { GarageCartLine } from "../garageShopStorage";
import { clearGarageCart, formatShopUsd } from "../garageShopStorage";
import { pushInAppNotification } from "../inAppNotifications";
import {
  getSignInRequiredMessage,
  getStripeRequiredMessage,
  isPaymentsReady,
} from "../config/production";
import { completeAuctionPayment, completeBuyNowSale } from "./garageRepository";
import { createAuctionCheckoutIntent, createGarageCartCheckoutIntent, getAccessToken } from "../stripePayments";

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
  | { ok: true; clientSecret: string; paymentIntentId: string; orderId: string }
  | { ok: false; reason: string };

export function canProcessGaragePayments(): boolean {
  return isPaymentsReady();
}

export async function startGarageCartCheckout(
  input: GarageCartCheckoutInput,
): Promise<CheckoutIntentResult> {
  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
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
    return result;
  }

  return {
    ok: true,
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
    orderId: result.orderId,
  };
}

export async function startAuctionCheckout(
  input: AuctionCheckoutInput,
): Promise<CheckoutIntentResult> {
  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
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
    return result;
  }

  return {
    ok: true,
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
    orderId: result.orderId,
  };
}

export async function completeGarageCartCheckout(input: GarageCartCheckoutInput): Promise<void> {
  await Promise.all(
    input.lines.map((line) =>
      completeBuyNowSale({
        listingId: line.listingId,
        hostId: input.hostId,
        priceUsd: line.priceUsd,
        listingTitle: line.title,
      }),
    ),
  );
  pushInAppNotification({
    type: "general",
    title: "Garage order paid",
    body: `${input.lines.length} item(s) from ${input.garageName} · ${formatShopUsd(input.totalUsd)} total.`,
  });
  clearGarageCart();
}

export async function completeAuctionCheckout(input: AuctionCheckoutInput): Promise<void> {
  await completeAuctionPayment({
    listingId: input.listingId,
    hostId: input.hostId,
    priceUsd: input.winningBidUsd,
    listingTitle: input.itemTitle,
  });
  pushInAppNotification({
    type: "general",
    title: "Auction paid",
    body: `${input.itemTitle} — pick up from ${input.hostName}.`,
  });
}
