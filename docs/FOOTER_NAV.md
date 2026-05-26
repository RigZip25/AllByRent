# Footer navigation model

The main app shell (`src/app/App.tsx`) uses a five-slot bottom bar on primary tab screens.

## Layout (left → right)

| Slot | Label | Rent mode | Earn mode |
|------|-------|-----------|-----------|
| 1 | Home | Category browse | Host dashboard overview |
| 2 | Rentals | `RentalsScreen` — bookings as renter/host | Same |
| 3 | **Rentano** (center) | Elevated circle with Rentano avatar; opens `RentanoChatSheet` | Same |
| 4 | Fourth tab | **Favorites** — saved listing IDs (`favoritesStorage`) | **Business** — earnings dashboard & growth (`earnStats`) |
| 5 | Profile | `ProfileScreen` | Same |

`appMode` (`rent` \| `earn`) from `src/lib/appMode.ts` controls Home content and the fourth tab label/icon. It is toggled on Home via the Earn/Rent switcher and can be changed on Profile.

## Intentionally removed

- The large green **+** footer button that opened **Post Request** is gone.
- `PostRequest` remains reachable from **Subcategory** empty state (“Post a Request”) only.

## Tab navigation behavior

Footer taps call `goToTab` in `App.tsx`, which clears the navigation stack and switches `currentScreen`. Nested flows (category → item detail, plans, etc.) still use `navigateTo` / `handleBack`.

## Implementation

- Component: `src/app/components/BottomNav.tsx`
- Favorites: `src/lib/favoritesStorage.ts`, `src/screens/FavoritesScreen.tsx`
- Business stats: `src/lib/earnStats.ts`, `src/screens/EarnBusinessScreen.tsx`
