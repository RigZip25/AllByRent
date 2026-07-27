import type { GarageCartLine } from "../garageShopStorage";
import { clearGarageCart, formatShopUsd } from "../garageShopStorage";
import { getGarageBidderId } from "../garageAuctionState";
import { pushInAppNotification } from "../inAppNotifications";
import { createNotificationRemote } from "../notificationsStorage";
import {
  getAuctionSignInRequiredMessage,
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
  /** Guest one-time purchase — email receipt only, no account required. */
  guestEmail?: string;
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

function isValidGuestEmail(value: string | undefined): boolean {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

export async function startGarageCartCheckout(
  input: GarageCartCheckoutInput,
): Promise<CheckoutIntentResult> {
  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  const guestEmail = input.guestEmail?.trim().toLowerCase() ?? "";
  if (!token && !isValidGuestEmail(guestEmail)) {
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
    guestEmail: token ? undefined : guestEmail,
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
    return { ok: false, reason: getAuctionSignInRequiredMessage() };
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

  const itemLabel =
    input.lines.length === 1
      ? input.lines[0]?.title || "Sale item"
      : `${input.lines.length} items`;
  const buyerId = getGarageBidderId();

  // Direct buy — no offer negotiation. Seller is notified; buyer arranges pickup next.
  if (input.hostId && input.hostId !== buyerId) {
    void createNotificationRemote({
      recipientId: input.hostId,
      actorId: buyerId.startsWith("bidder-") ? null : buyerId,
      type: "general",
      title: "Sold — arrange pickup",
      body: `${itemLabel} paid · ${formatShopUsd(input.totalUsd)}. Buyer will message you about a pickup time.`,
      listingId: input.lines[0]?.listingId,
      skipLocal: true,
    });
  }

  pushInAppNotification({
    type: "general",
    title: "Paid — arrange pickup",
    body: `${itemLabel} from ${input.garageName}. Message the seller to pick a convenient pickup time.`,
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

  const buyerId = getGarageBidderId();
  if (input.hostId && input.hostId !== buyerId) {
    void createNotificationRemote({
      recipientId: input.hostId,
      actorId: buyerId.startsWith("bidder-") ? null : buyerId,
      type: "general",
      title: "Auction paid — arrange pickup",
      body: `${input.itemTitle} · ${formatShopUsd(input.winningBidUsd)}. Winner will message you about pickup.`,
      listingId: input.listingId,
      skipLocal: true,
    });
  }

  pushInAppNotification({
    type: "general",
    title: "Paid — arrange pickup",
    body: `${input.itemTitle} — message ${input.hostName} to pick a pickup time.`,
  });
}
