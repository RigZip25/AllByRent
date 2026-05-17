# All By Rent

React/Vite implementation of the All By Rent onboarding and authentication flows from the provided
Figma design. The screens use PNG exports from the Figma frames for visual fidelity.

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

## Deployment

The app includes a GitHub Pages workflow. After the changes are merged into `main` and Pages is
configured to use GitHub Actions, the deployed site will be available at:

`https://rigzip25.github.io/AllByRent/`
