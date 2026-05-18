# Asset QR identity

Every published listing can represent one or many physical asset units. This matters when an owner
has several identical items, for example five microphones of the same brand/model.

## Product rule

- A **listing** describes the rentable offer.
- An **asset unit** describes one physical thing.
- Each asset unit gets its own stable `assetUnitId`.
- Each asset unit gets its own QR code payload.
- Insurance, damage, loss, check-in/check-out, and disputes should reference `assetUnitId`, not just
  `listingId`.

## Why listing id alone is not enough

If an owner lists five identical microphones:

- there is one listing users browse;
- there are five asset units behind it;
- each microphone needs a separate QR/identity;
- if microphone #3 is damaged, the claim must attach to microphone #3 only.

## QR payload policy

The QR should not expose sensitive private owner data directly. It should contain:

- QR payload version
- `listingId`
- `assetUnitId`
- public label, for example brand/model/title
- category id
- owner reference id
- checksum/signature

The backend record behind the QR stores the full asset information:

- owner profile
- listing details
- photos
- serial number, when available
- condition history
- booking history
- insurance/claim records
- check-in/check-out evidence

## Current implementation

The first frontend/domain contract lives in `src/data/listing.ts`:

- `ListingDraft.quantity`
- `ListingDraft.serialNumbers`
- `PublishedListing.assetUnits`
- `AssetUnit.assetUnitId`
- `AssetQrPayload`
- `createPublishedListing`
- `buildAssetQrPayload`
- `encodeAssetQrPayload`

This is still local/domain code. Real production QR generation should be moved behind a backend API
so ids can be stable, signed, and auditable.

The prototype flow is reachable at:

- `?screen=listing-scope`
- `?screen=listing-categories`
- `?screen=listing-subcategories`
- `?screen=listing-detail`
- `?screen=listing-price`
- `?screen=listing-location`
- `?screen=listing-rules`
- `?screen=listing-photos`
- `?screen=listing-order-preview`
- `?screen=listing-published`

The `listing-published` screen currently demonstrates five identical Shure SM58 microphones and
creates five separate `AssetUnit` records locally.

The prototype now distinguishes listing scope:

- Personal listing path publishes one personal asset unit.
- Business/Professional listing path publishes five inventory units in the microphone demo.
- Personal listing skips the business rules/compliance screen; Business/Professional listing keeps
  it in the flow.
- The current automated check verifies both branches:
  - Personal: Categories -> Subcategories -> Detail -> Price -> Location -> Photos -> Preview -> QR
  - Business: Categories -> Subcategories -> Detail -> Price -> Location -> Rules -> Photos ->
    Preview -> QR

## Backend implications

Suggested tables/collections:

1. `listings`
2. `asset_units`
3. `asset_qr_codes`
4. `asset_condition_events`
5. `asset_insurance_claims`
6. `asset_check_in_out_events`

Important constraints:

- `asset_units.assetUnitId` must be unique.
- `asset_qr_codes.assetUnitId` must be unique.
- Claims must reference `assetUnitId`.
- Bookings may reference `listingId`, but fulfillment/check-in should reference selected
  `assetUnitId` where possible.
