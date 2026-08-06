# QR + PIN handoff (dual-sided)

Handoff is **QR (item) + 6-digit PIN (stage)** and **both cabinets confirm**.

## Pickup

1. Host scans + PIN → `host_handed_over_at` (cabinet: **Handed over**)
2. Renter scans + PIN → `renter_received_at` (cabinet: **Received**)
3. When **both** are set → status `active`, `picked_up_at`, generate `return_pin`

## Return

1. Renter scans + PIN → `renter_returned_at`
2. Host scans + PIN → `host_accepted_return_at`
3. When **both** are set → status `completed`, `returned_at`

## API

`POST /api/rentals/confirm-handoff`  
Body: `{ rentalId, stage: "pickup"|"return", pin }`  
Auth: Bearer (owner or renter). Verifies PIN server-side.

## Client

`src/lib/rentalHandoff.ts` — calls API, falls back to local dual-confirm if offline/columns missing.  
UI timeline: `ActiveRental` handoff checklist.

## DB

Migration `028_rental_handoff_sides.sql` adds:

- `host_handed_over_at`
- `renter_received_at`
- `renter_returned_at`
- `host_accepted_return_at`
