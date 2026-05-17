# Product architecture notes

This project is currently a Figma-faithful frontend prototype. The goal is to move toward a real
international marketplace/PWA without letting prototype artifacts become product architecture.

## Implementation layers

### 1. Prototype screen layer

- Uses exported Figma PNG frames.
- Good for validating screen order, layout, and stakeholder feedback.
- Not a source of truth for data models, taxonomy, currencies, dates, legal requirements, or copy.
- Hotspots should use percentage-based `rect` coordinates for scale-safe interactions.

### 2. Canonical domain layer

- Lives in TypeScript data/models first, then backend seed data later.
- Must be reviewed and cleaned before connecting to backend.
- Current first piece: `src/data/taxonomy.ts`.
- Listing flow contract: `src/data/listing.ts`.

### 3. Functional frontend layer

- Adds real input overlays, validation, local state, and session state.
- Should gradually replace PNG-only screens with reusable components:
  - buttons
  - inputs
  - cards
  - category grids
  - booking controls
  - navigation
  - assistant surfaces

### 4. Backend/API layer

Do not start backend from raw Figma labels. Start backend after canonical models are agreed.

Suggested backend modules:

1. `users/auth`
2. `profiles/locales`
3. `taxonomy/categories`
4. `listings/items`
5. `availability/calendars`
6. `bookings/orders`
7. `favorites`
8. `messages/chat`
9. `payments/deposits`
10. `assistant/rentano`

## Listing model

Listing is not one flow. It has at least three intents:

- `rent` - user wants to find and book items/spaces/services
- `list-personal` - owner lists personal assets
- `list-business` - business/pro owner lists inventory, locations, equipment, or services

The current Figma choice screen only shows "I want to list something for rent". Product flow must
insert a Personal vs Business/Professional decision before listing forms.

The first implementation contract is `src/data/listing.ts`:

- `ListingScope`: `list-personal` or `list-business`
- `ListingStepId`: normalized listing step ids
- `ListingDraft`: local draft shape
- `listingSteps`: ordered required steps

Business/pro listings currently require an additional `rules` step for compliance requirements.

## Internationalization requirements

- All component text must use locale dictionaries.
- Dates and currencies must use `Intl`.
- Store user `locale`, `country`, `currency`, and `timezone` separately.
- Do not assume US address, phone, tax, insurance, or identity verification rules.
- Design and data model should be ready for RTL languages, even if the current UI only ships LTR.

## Mr. Rentano

Mr. Rentano is a product assistant, not a static mascot.

Near-term frontend responsibilities:

- Be screen-aware.
- Explain current screen.
- Suggest next action.
- Help users choose rent vs list.
- Warn when a category has compliance requirements.

Later backend/LLM responsibilities:

- Answer natural-language questions.
- Understand current screen, listing, booking, locale, and policy context.
- Help create listings.
- Help compare rental options.
- Explain deposits, insurance, delivery, and pickup terms.

## Content quality rule

Any new screen or taxonomy imported from Figma must pass:

1. spelling review
2. duplicate review
3. Personal vs Business split review
4. compliance risk review
5. i18n readiness review

If it fails, document it and do not make it backend seed data.
