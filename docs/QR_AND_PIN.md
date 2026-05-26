# QR + PIN security model (demo / localStorage)

This demo app implements a **QR + PIN** handoff model entirely in `localStorage` (no backend).

## Model

### QR is per physical item (stable)

- Each `RentalBooking` has a stable `itemQrToken`.
- In this demo, `itemQrToken` is **derived from `itemTitle`** (e.g. `abr-item-canon-eos-r6-kit`).
- This token is **not regenerated per rental** and represents the *physical item identity* at a very lightweight/demo level.

> Demo simplification: we treat `itemTitle` as the item identity. In production you’d use a stable `assetUnitId` (or similar) and sign QR payloads server-side.

### PIN is per rental + stage

Each booking has stage-specific 6-digit PINs:

- `pickupPin`: generated when a booking enters `pending_checkin`
- `returnPin`: generated when a booking becomes `active` (and used for return/closeout)

PINs are stored on the booking and are required in the scan confirmation UI.

## Why QR + PIN

- **QR alone is not enough**: anyone could scan a sticker and attempt to confirm.
- **PIN mitigates random scans**: only the renter/host participating in the handoff (who can obtain the PIN from their counterparty) can confirm pickup/return.
- **In-app constraint (demo)**: the UI copy communicates that the scan works only inside the app for the logged-in participant; this demo has no real backend auth.

## Idempotency / double-scan behavior

- Pickup confirmation is guarded so confirming pickup twice shows **“Already confirmed”** and does not corrupt state.
- Return confirmation is similarly guarded.
- The UI also disables confirmation when it detects the action is already completed.

## What’s demo vs production

- **Demo**:
  - `itemQrToken` derived from title (not secure, not signed).
  - PIN generation uses `Math.random()` and is stored client-side.
  - No real authentication/authorization enforcement.
- **Production**:
  - QR payload should contain signed identifiers (`assetUnitId`, `listingId`, version, checksum/signature).
  - PINs should be generated and validated server-side, with audit logs and rate limiting.
  - Idempotency should be enforced server-side with transactional updates.

