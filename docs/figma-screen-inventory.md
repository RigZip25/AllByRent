# Figma screen inventory notes

This inventory summarizes the currently observed Figma structure. It is not exhaustive product
approval; it is a working map for deciding which screens are safe to implement next.

## Source-of-truth rule

- Use **Page 4** frames as the current implementation source unless design ownership says otherwise.
- Other pages contain duplicated or older frames and should be treated as references only.

## Implemented / in progress

- Intro/onboarding:
  - welcome/logo
  - rent locally
  - rental hub
  - business rentals
  - secure/local/flexible
  - Mr. Rentano intro
- Auth/choice:
  - login
  - signup
  - verification
  - reset password
  - create new password
  - rent/list choice
  - rental intro
  - earning/list intro
- Browsing:
  - home
  - categories
  - subcategories
  - product list
  - product detail
  - booking
  - order confirmed
  - order detail
  - favorites

## Screen groups to audit before implementation

### Listing/add-item flow

Frames around Page 2 / later Page 4 groups suggest:

- calendar
- add item categories
- subcategories
- add item detail
- expected price
- place/location
- policy & rules
- upload photos
- order/payment

Before implementing, split into:

- personal listing flow
- business/pro listing flow

Do not reuse the same listing form for personal and business without a scope decision.

### Chat and messaging

Multiple chat frames exist. Needs review for:

- renter vs owner perspective
- booking-linked messages
- unread states
- assistant vs human chat separation

### Reviews

Multiple review frames exist. Needs review for:

- review target: user, item, booking, owner, renter
- moderation/reporting
- post-booking timing

### Payments

Payment/add-card frames exist. Needs backend/legal review before implementation:

- country support
- card processing vendor
- deposits
- refunds
- taxes/fees

## Suspicious frame naming

- `earning your atuff`
- `verifection`
- `verifecation`
- `Returan request`
- many number-only frames (`36`, `37`, `412654...`)
- multiple duplicated pages with similar flows

These names should be cleaned or ignored before becoming route names or analytics events.

## Next safe implementation recommendation

1. Merge foundation/audit PR.
2. Build listing intent split screen/component:
   - Personal owner
   - Business/Professional owner
3. Export and implement listing flow only after selecting which Figma frames correspond to each
   branch.
4. Keep chat/reviews/payments for later because they require backend policy decisions.
