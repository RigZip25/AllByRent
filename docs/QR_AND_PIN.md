# QR + PIN + geo presence handoff

Handoff locks the deal with **presence + PIN**. Presence is either:

1. **GPS** within ~100–150m of the stamped handoff coordinates (tighter for vehicles), or  
2. **Physical item QR** scanned on-camera at the item (sticker / screen QR)

A listing code typed from the couch is **not** presence. Hosts are not geo-gated (staging/preview from home).

## Pickup (in-person)

1. Host scans + PIN → `host_handed_over_at`  
2. Renter proves presence (GPS or QR) + PIN → `renter_received_at`  
3. When **both** are set → status `active`, `picked_up_at`, generate `return_pin`

## Pickup (contactless)

1. Booking paid / approved; access codes stay locked  
2. Renter at the spot: GPS or item QR → PIN unlocks lockbox instructions  
3. That single renter confirm also stamps host hand-over and **starts the rental** (clock / calendar busy)

## Return

1. Renter proves presence + PIN (+ optional condition photo) → `renter_returned_at`  
2. Host confirms + PIN → `host_accepted_return_at`  
3. Contactless: if host doesn’t accept within **24h**, return auto-completes

## API

`POST /api/rentals/confirm-handoff`  
Body: `{ rentalId, stage: "pickup"|"return", pin }`  
Auth: Bearer (owner or renter). Verifies PIN server-side.  
Contactless pickup: renter confirm alone activates the rental.

## Client

- `src/lib/rentalHandoff.ts` — confirm + contactless solo start + auto-return  
- `src/lib/handoffPresence.ts` — geo radius / haversine / renter near-check  
- `src/components/rentals/QrScanPanel.tsx` — QR or GPS presence before PIN  
- Timeline UI: `ActiveRental` handoff checklist  

Handoff coords are stamped from the host’s home location at **approve**.

## DB

Migration `033_rental_handoff_sides.sql` adds:

- `host_handed_over_at`
- `renter_received_at`
- `renter_returned_at`
- `host_accepted_return_at`
