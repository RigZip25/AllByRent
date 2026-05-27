
  # AllByRent Mobile App UI

  This is a code bundle for AllByRent Mobile App UI. The original project is available at https://www.figma.com/design/2yZhDZ7DQtITTvIcRhkFTb/AllByRent-Mobile-App-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## AI API keys (Anthropic + PhotoRoom)

API keys stay **server-side**. The app calls `/api/anthropic` and `/api/photoroom`; Vercel serverless functions proxy to the upstream APIs.

**Vercel (production):** Project → Settings → Environment Variables:

- `ANTHROPIC_API_KEY`
- `PHOTOROOM_API_KEY`

**Local dev (`npm run dev`):** Add the same keys to `.env.local` (see `.env.example`). Vite proxies `/api/*` and injects the key on the dev server only.

For full parity with production handlers, you can also run `npx vercel dev`.

## Supabase Auth (Passkeys-first)

This app can run in **demo mode** if Supabase env vars are missing. To enable real auth, set:

- **`VITE_SUPABASE_URL`**
- **`VITE_SUPABASE_ANON_KEY`**

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase dashboard setup

- **Auth → URL Configuration**
  - **Site URL**: `http://localhost:5173`
  - **Additional Redirect URLs**: `http://localhost:5173/**`
- **Auth → Providers**
  - Enable **Google** and/or **Apple**.
- **Auth → Passkeys (WebAuthn)**
  - Enable **Passkeys** and configure relying party origins for:
    - `http://localhost:5173`

### Notes

- **Account deletion**: a frontend-only app can’t securely call `auth.admin.deleteUser`. The UI implements a **“Request account deletion”** placeholder and signs out locally. To fully support deletion, add a Supabase **Edge Function** using the **service role key**.
  