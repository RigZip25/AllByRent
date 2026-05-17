# All By Rent

React/Vite implementation of the All By Rent onboarding, authentication, and browsing/rental flows
from the provided Figma design. The screens use PNG exports from the Figma frames for visual
fidelity.

The authentication screens include interactive input overlays, basic local validation, and a
localStorage-backed demo session. The browsing flow includes local demo booking state. There is no
backend integration yet.

Foundation notes:

- New hotspots can use percentage-based `rect` coordinates so tap areas scale with the screen frame.
- Locale state is stored locally and currently supports English/Spanish system UI strings.
- Locale-aware currency/date formatting uses `Intl`.
- Mr. Rentano is represented as a screen-aware assistant layer with mock responses; backend/LLM
  integration is intentionally left for a later API layer.
- Figma category/listing content is being audited before it becomes backend seed data. See
  `docs/figma-content-audit.md`.
- Canonical category data lives in `src/data/taxonomy.ts` and separates Personal vs
  Business/Professional subcategories.
- Listing flow and per-asset QR identity contracts live in `src/data/listing.ts` and
  `docs/asset-qr-identity.md`.
- Screen-source and architecture rules live in `docs/figma-screen-inventory.md` and
  `docs/product-architecture.md`.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - type-check and build the app
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

Open `http://localhost:5173` after starting the dev server. To jump directly to a specific screen,
pass `?step=0` through `?step=15`, or use screen ids such as:

- `?screen=login`
- `?screen=signup`
- `?screen=verification-phone`
- `?screen=verification-code`
- `?screen=reset-password`
- `?screen=create-new-password`
- `?screen=like-to-do-rent`
- `?screen=like-to-do-list`
- `?screen=rental`
- `?screen=earning-your-stuff`
- `?screen=home`
- `?screen=categories`
- `?screen=subcategories`
- `?screen=product-list`
- `?screen=product-detail`
- `?screen=booking`
- `?screen=order-confirm`
- `?screen=order-detail`
- `?screen=favorites`

## Deployment

The app includes a GitHub Pages workflow. After the changes are merged into `main` and Pages is
configured to use GitHub Actions, the deployed site will be available at:

`https://rigzip25.github.io/AllByRent/`
