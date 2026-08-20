# Deposit holds: partial capture vs invoices

## Market practice

Peer car-share typically:

1. Authorize a **security / deductible hold** at booking.
2. Bill **tolls, fuel shortfall, late fees, and fines** as **separate post-trip charges**.
3. Capture the hold only for **damage / deductible** claims (often once), then release the rest.

## What Stripe supports here

| Approach | Available on standard Stripe pricing? | Behavior |
|----------|----------------------------------------|----------|
| Full capture of deposit PI | Yes | Captures entire authorized hold |
| Single **partial** capture (`amount_to_capture`) | Yes | Captures N cents and **releases the remainder** |
| **Multicapture** (capture toll now, keep damage hold) | **No** (IC+ feature) | Not enabled for this platform |

We do **not** rely on multicapture.

## Implemented path

1. **Prefer invoices** (`/api/stripe/rental_invoice`) for fuel top-up, fuel fee, late fee, tolls, fines. These are separate PaymentIntents; the deposit hold stays intact.
2. **Deposit claim** (`/api/stripe/deposit_claim`) accepts optional `amountCents`:
   - If omitted or ≥ capturable → full capture.
   - If `50 ≤ amountCents < amount_capturable` → partial capture; remainder auto-released.
3. Host UI: claim full hold, or enter a partial amount. Copy points hosts to invoices when they need incremental charges without releasing the damage hold.

## Webhook

`payment_type: rental_invoice` successes update `rentals.rental_invoices` so ActiveRental / invoice panel reflect **paid** even if the renter’s device closed mid-checkout.
