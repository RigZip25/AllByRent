# Backend API draft

This is a draft contract for backend planning. It should not be treated as final API documentation,
but it defines the domain boundaries we should protect while the frontend is still a prototype.

## Auth / users

### `POST /auth/signup`

Creates a user account.

Required:

- name
- email
- phone
- password
- locale
- country

### `POST /auth/login`

Creates a session.

Required:

- email
- password

### `POST /auth/verify`

Verifies phone/email code.

Required:

- channel
- code

## Taxonomy

### `GET /taxonomy/categories`

Returns canonical categories, not raw Figma labels.

Each category includes:

- id
- localized display names
- availability
- personal subcategories
- professional subcategories
- compliance flags

## Listings

### `POST /listings/draft`

Creates a listing draft.

Required:

- ownerId
- listingScope: `list-personal` or `list-business`

### `PATCH /listings/:listingId`

Updates listing draft data.

Fields:

- categoryId
- subcategoryId
- title
- brand
- model
- description
- quantity
- serialNumbers
- price
- currency
- location
- availability
- rules
- photos

### `POST /listings/:listingId/publish`

Publishes listing and creates physical asset units.

Backend responsibilities:

- validate required fields
- validate category compliance flags
- create one `asset_unit` per quantity
- create one QR identity per asset unit
- sign QR payloads
- store publish event

Response:

- listing
- assetUnits
- qrCodes

## Asset units / QR

### `GET /asset-units/:assetUnitId`

Returns public asset unit summary.

Should not expose private owner details.

### `GET /asset-units/:assetUnitId/qr`

Returns signed QR payload or rendered QR image.

Payload should contain:

- version
- listingId
- assetUnitId
- public label
- checksum/signature

### `POST /asset-units/:assetUnitId/condition-events`

Adds condition event.

Examples:

- owner check-out
- renter check-in
- damage report
- cleaning/maintenance
- insurance inspection

Required:

- bookingId, when linked to a booking
- actorId
- eventType
- photos/evidence
- timestamp

## Bookings

### `POST /bookings`

Creates booking request.

Required:

- listingId
- renterId
- date range
- quantity

Backend should reserve actual `assetUnitId`s before fulfillment when possible.

### `POST /bookings/:bookingId/confirm`

Confirms booking and locks assigned asset units.

## Insurance / claims

### `POST /claims`

Creates claim.

Required:

- assetUnitId
- bookingId, when applicable
- claimantId
- claimType
- description
- evidence photos

Claims should never reference only `listingId`. They must reference `assetUnitId`.

## Assistant / Mr. Rentano

### `POST /assistant/message`

Future LLM endpoint.

Context:

- user locale
- current screen id
- listing id, if present
- asset unit id, if present
- booking id, if present
- user role: renter, owner, business owner
- compliance flags

The assistant should not invent policy or insurance outcomes. It should explain product flows and
hand off to support/legal workflows where required.
