import { useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { useMftStore } from "./store";
import { WelcomeScreen } from "./screens/Welcome";
import { InterestsScreen } from "./screens/Interests";
import { ProfileOnboardingScreen } from "./screens/ProfileOnboarding";
import { HomeScreen } from "./screens/Home";
import { ExploreScreen } from "./screens/Explore";
import { DestinationScreen } from "./screens/Destination";
import { TripCreateScreen } from "./screens/TripCreate";
import { TripOverviewScreen } from "./screens/TripOverview";
import { BookingScreen } from "./screens/Booking";
import { PackingScreen } from "./screens/Packing";
import { GroupScreen } from "./screens/Group";
import { CountdownScreen } from "./screens/Countdown";
import { LiveDayScreen } from "./screens/LiveDay";
import { RestaurantsScreen } from "./screens/Restaurants";
import { TranslatorScreen } from "./screens/Translator";
import { SummaryScreen } from "./screens/Summary";
import { MemoriesScreen } from "./screens/Memories";
import { WishlistScreen } from "./screens/Wishlist";
import { ProfileScreen } from "./screens/Profile";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const el = document.querySelector(".mft-scroll");
    if (el) el.scrollTop = 0;
  }, [pathname]);
  return null;
}

function RequireOnboarding({ children }: { children: ReactNode }) {
  const done = useMftStore((s) => s.profile.onboardingComplete);
  const location = useLocation();
  if (!done && !location.pathname.startsWith("/onboarding") && location.pathname !== "/welcome") {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

function ResetGate({ children }: { children: ReactNode }) {
  const resetDemo = useMftStore((s) => s.resetDemo);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("reset") || params.get("resetApp") === "1") {
      resetDemo();
      params.delete("reset");
      params.delete("resetApp");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}`,
      );
    }
  }, [resetDemo]);
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ResetGate>
        <div className="mft-shell">
          <div className="mft-phone">
            <ScrollToTop />
            <RequireOnboarding>
              <Routes>
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/onboarding/interests" element={<InterestsScreen />} />
                <Route path="/onboarding/profile" element={<ProfileOnboardingScreen />} />
                <Route path="/" element={<HomeScreen />} />
                <Route path="/explore" element={<ExploreScreen />} />
                <Route path="/destination/:id" element={<DestinationScreen />} />
                <Route path="/trip/create" element={<TripCreateScreen />} />
                <Route path="/trip/:id" element={<TripOverviewScreen />} />
                <Route path="/trip/:id/booking" element={<BookingScreen />} />
                <Route path="/trip/:id/packing" element={<PackingScreen />} />
                <Route path="/trip/:id/group" element={<GroupScreen />} />
                <Route path="/trip/:id/countdown" element={<CountdownScreen />} />
                <Route path="/trip/:id/live" element={<LiveDayScreen />} />
                <Route path="/trip/:id/restaurants" element={<RestaurantsScreen />} />
                <Route path="/trip/:id/translator" element={<TranslatorScreen />} />
                <Route path="/trip/:id/summary" element={<SummaryScreen />} />
                <Route path="/trip/:id/memories" element={<MemoriesScreen />} />
                <Route path="/wishlist" element={<WishlistScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </RequireOnboarding>
          </div>
        </div>
      </ResetGate>
    </BrowserRouter>
  );
}
