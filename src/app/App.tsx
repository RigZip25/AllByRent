import { useState, useCallback, useEffect, useRef } from "react";
import { resolveHomeLocation } from "../lib/geolocation";
import { AppBrandHeader } from "../components/AppBrandHeader";
import { OfflineScreen } from "./components/OfflineScreen";
import { SplashScreen } from "./components/SplashScreen";
import { FirstHello } from "../screens/onboarding/FirstHello";
import { WhatDoYouWant } from "../screens/onboarding/WhatDoYouWant";
import { WhereAreYou } from "../screens/onboarding/WhereAreYou";
import { WhereAreYouHeading } from "../screens/onboarding/WhereAreYouHeading";
import { WhereAreYouManual } from "../screens/onboarding/WhereAreYouManual";
import { YouAreAllSet } from "../screens/onboarding/YouAreAllSet";
import { HomeFeed } from "./components/HomeFeed";
import { Subcategory } from "./components/Subcategory";
import { ItemDetail } from "./components/ItemDetail";
import { BookingScreen } from "./components/BookingScreen";
import { BookingConfirmedScreen } from "./components/BookingConfirmedScreen";
import { PostRequest } from "./components/PostRequest";
import { ActiveRental } from "./components/ActiveRental";
import { ListingIntro } from "../screens/listing/ListingIntro";
import { ListingWizard } from "../screens/listing/ListingWizard";
import { HostListingDetailScreen } from "../screens/listing/HostListingDetailScreen";
import { AttachmentViewerScreen } from "../screens/AttachmentViewerScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { RentalsScreen } from "../screens/RentalsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { GarageScreen } from "../screens/GarageScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { NeighborGarageScreen } from "../screens/NeighborGarageScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { EarnBusinessScreen } from "../screens/EarnBusinessScreen";
import { SubscriptionPlansScreen } from "../screens/SubscriptionPlansScreen";
import { PwaInstallProvider } from "../hooks/PwaInstallProvider";
import { PwaUpdateProvider } from "../hooks/PwaUpdateProvider";
import { AuthProvider, useAuth } from "../hooks/AuthProvider";
import { RequireAuthProvider } from "../hooks/RequireAuth";
import {
  consumeAuthReturn,
  peekAuthReturn,
  peekPendingAuthEmail,
  setAuthIntent,
  setAuthReturn,
  type AuthIntent,
} from "../lib/authReturn";
import { getAppMode, setAppMode } from "../lib/appMode";
import {
  completeOnboarding,
  isOnboardingComplete,
  isIntroDone,
  markIntroDone,
  markRoleChosen,
  resolveOnboardingResumeScreen,
} from "../lib/onboardingStorage";
import { getPublishedListingById, hasRentLocationSetup } from "../lib/listingStorage";
import type { ShelfPrefill } from "../lib/shelfListings";
import { isSimulateUpdateRequested } from "../lib/pwaUpdateStorage";
import { isResetAppQueryParam, resetAllAppData } from "../lib/resetAppStorage";
import {
  consumeAuthCallbackResume,
  consumeLastOauthProvider,
  shouldPromptEnablePasskey,
  userHasPasskey,
} from "../lib/auth";
import { AuthGate } from "../components/AuthGate";
import { PasskeySetup } from "../components/PasskeySetup";
import { DeleteAccountScreen } from "../screens/profile/DeleteAccount";
import { IdentityVerificationScreen } from "../screens/IdentityVerificationScreen";
import { AgentActivityScreen } from "../screens/AgentActivityScreen";

type Screen =
  | "splash"
  | "firstHello"
  | "whatDoYouWant"
  | "whereAreYou"
  | "whereAreYouHeading"
  | "whereAreYouManual"
  | "onboardingAllSet"
  | "home"
  | "search"
  | "garage"
  | "more"
  | "neighborGarage"
  | "notifications"
  | "subcategory"
  | "itemDetail"
  | "booking"
  | "bookingConfirmed"
  | "postRequest"
  | "activeRental"
  | "listingIntro"
  | "listItem"
  | "hostListingDetail"
  | "attachmentViewer"
  | "rentals"
  | "profile"
  | "favorites"
  | "earnBusiness"
  | "subscriptionPlans"
  | "identity"
  | "agentActivity"
  | "deleteAccount";

function screenToAuthIntent(screen: Screen): AuthIntent {
  if (
    screen === "listingIntro" ||
    screen === "listItem" ||
    screen === "hostListingDetail"
  ) {
    return "list";
  }
  if (screen === "booking" || screen === "activeRental") return "book";
  if (screen === "postRequest") return "message";
  return "generic";
}

/** When nav stack is empty, in-app Back still returns to the prior onboarding step. */
const ONBOARDING_BACK_FALLBACK: Partial<Record<Screen, Screen>> = {
  firstHello: "splash",
  whatDoYouWant: "firstHello",
  whereAreYou: "firstHello",
  whereAreYouManual: "whereAreYou",
  whereAreYouHeading: "whereAreYou",
  onboardingAllSet: "whereAreYou",
};

/** Listing flow only — used when the nav stack is empty (not onboarding fallbacks). */
const LISTING_BACK_FALLBACK: Partial<Record<Screen, Screen>> = {
  listItem: "listingIntro",
  listingIntro: "home",
};

function isOnboardingScreen(screen: Screen): boolean {
  return screen in ONBOARDING_BACK_FALLBACK || screen === "firstHello" || screen === "onboardingAllSet";
}

function readBootQuery() {
  if (typeof window === "undefined") {
    return { skipSplash: false, openNotifications: false, simulateUpdate: false, screen: null as string | null, splashArtOnly: false, splashDynamicPreview: false };
  }
  const params = new URLSearchParams(window.location.search);
  const screen = params.get("screen");
  // When returning from magic-link callback, skip splash immediately (prevents a visible flash).
  const hasAuthCode = params.get("code")?.trim().length ? true : false;
  const hash = window.location.hash ?? "";
  const hasAuthHash =
    hash.includes("access_token=") ||
    hash.includes("refresh_token=") ||
    hash.includes("error=") ||
    hash.includes("error_description=");
  const simulateUpdate =
    params.get("simulateUpdate") === "1" || isSimulateUpdateRequested();
  return {
    skipSplash: params.get("skipSplash") === "1" || hasAuthCode || hasAuthHash,
    openNotifications: params.get("openNotifications") === "1",
    simulateUpdate,
    screen,
    splashArtOnly: screen === "splash" && params.get("art") === "1",
    splashDynamicPreview: screen === "splash" && params.get("dynamic") === "1",
  };
}

function clearBootQuery(keys: string[]) {
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  for (const key of keys) {
    if (params.has(key)) {
      params.delete(key);
      changed = true;
    }
  }
  if (!changed) return;
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", next);
}

function cleanupSplashGlobals() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("splash-v2-active");
}

function resolvePostSplashScreen(): Screen {
  const resume = resolveOnboardingResumeScreen();
  if (resume === "home") return "home";
  return resume;
}

/** After sign-in, prefer finishing onboarding over jumping to home. */
function resolveScreenAfterAuth(storedTarget: Screen | null): Screen {
  if (!isOnboardingComplete()) {
    const resume = resolveOnboardingResumeScreen();
    if (resume !== "home") return resume;
    if (getAppMode() === "rent" && !hasRentLocationSetup()) {
      return "whereAreYou";
    }
  }
  return storedTarget ?? "home";
}

function AppRoutes() {
  const auth = useAuth();
  const boot = readBootQuery();
  const handledSessionTokenRef = useRef<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (boot.screen === "splash") return "splash";
    if (boot.skipSplash || isIntroDone()) {
      if (boot.openNotifications || boot.simulateUpdate) {
        markIntroDone();
        completeOnboarding();
        return "home";
      }
      return resolvePostSplashScreen();
    }
    return "splash";
  });
  const [navStack, setNavStack] = useState<Screen[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedHostListingId, setSelectedHostListingId] = useState<string | null>(null);
  const [selectedNeighborGarageHostId, setSelectedNeighborGarageHostId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [listingPrefill, setListingPrefill] = useState<ShelfPrefill | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [postRequestPrefill, setPostRequestPrefill] = useState<ShelfPrefill | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentTitle, setAttachmentTitle] = useState<string | null>(null);
  const [postAuthTarget, setPostAuthTarget] = useState<Screen | null>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authIntent, setAuthIntentState] = useState<AuthIntent>("generic");
  const [passkeySetupOpen, setPasskeySetupOpen] = useState(false);
  const [isLocatingHome, setIsLocatingHome] = useState(false);
  const [homeLocationError, setHomeLocationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );
  /** `?screen=splash` static layout · `&dynamic=1` animated · `&art=1` PNG only */
  const [splashPreview] = useState(() => boot.screen === "splash" && !boot.splashDynamicPreview);
  const [splashArtOnly] = useState(() => boot.splashArtOnly);
  const [splashDynamicPreview] = useState(() => boot.splashDynamicPreview);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!boot.screen) return;
    const screen = boot.screen.trim();
    if (screen === "splash") {
      setNavStack([]);
      setCurrentScreen("splash");
      clearBootQuery(["screen"]);
      return;
    }
    if (screen === "identity") {
      // Don't force auth; existing route guard will show AuthGate if needed.
      setNavStack([]);
      setCurrentScreen("identity");
      clearBootQuery(["screen"]);
    }
    if (screen === "agent-activity") {
      setNavStack([]);
      setCurrentScreen("agentActivity");
      clearBootQuery(["screen"]);
    }
  }, [boot.screen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!isResetAppQueryParam(params)) return;
    clearBootQuery(["reset", "resetApp"]);
    void resetAllAppData();
  }, []);

  useEffect(() => {
    if (!boot.openNotifications) return;
    if (currentScreen !== "home" && currentScreen !== "notifications") return;
    setNavStack([]);
    setCurrentScreen("notifications");
    clearBootQuery(["openNotifications", "skipSplash", "simulateUpdate"]);
  }, [boot.openNotifications, currentScreen]);

  const finishOnboardingToHome = useCallback(() => {
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("home");
  }, []);

  /** Push the screen we are leaving, then open the next screen (avoids stale currentScreen in the stack). */
  const showAuthGate = useCallback((target: Screen, intentOverride?: AuthIntent) => {
    const intent = intentOverride ?? screenToAuthIntent(target);
    setPostAuthTarget(target);
    setAuthReturn(target);
    setAuthIntent(intent);
    setAuthIntentState(intent);
    setAuthGateOpen(true);
  }, []);

  const navigateTo = useCallback((screen: Screen) => {
    const authRequired =
      screen === "booking" ||
      screen === "postRequest" ||
      screen === "listingIntro" ||
      screen === "listItem" ||
      screen === "hostListingDetail" ||
      screen === "activeRental" ||
      screen === "identity" ||
      screen === "agentActivity";

    if (authRequired && auth.configured && !auth.session) {
      showAuthGate(screen);
      return;
    }

    setCurrentScreen((from) => {
      setNavStack((stack) => [...stack, from]);
      return screen;
    });
  }, [auth.configured, auth.session, showAuthGate]);

  const finishRentOnboarding = useCallback(() => {
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("home");
  }, []);

  const requireAuth = useCallback(
    (intentOverride?: AuthIntent) => {
      if (!auth.configured || auth.session) return true;
      showAuthGate(currentScreen, intentOverride);
      return false;
    },
    [auth.configured, auth.session, currentScreen, showAuthGate],
  );

  const resolvePostAuthScreen = useCallback((): Screen => {
    const stored = consumeAuthReturn();
    const candidate = (postAuthTarget ?? stored) as Screen | null;
    const validScreens: Screen[] = [
      "home",
      "search",
      "garage",
      "more",
      "booking",
      "postRequest",
      "listingIntro",
      "listItem",
      "hostListingDetail",
      "activeRental",
      "profile",
      "rentals",
      "favorites",
      "earnBusiness",
      "subcategory",
      "itemDetail",
      "identity",
      "agentActivity",
    ];
    const storedTarget =
      candidate && validScreens.includes(candidate)
        ? candidate
        : "home";
    return resolveScreenAfterAuth(storedTarget);
  }, [postAuthTarget]);

  const finishAuthFlow = useCallback(() => {
    setAuthGateOpen(false);
    const target = resolvePostAuthScreen();
    setNavStack([]);
    setCurrentScreen(target);
    setPostAuthTarget(null);
  }, [resolvePostAuthScreen]);

  const resetToHome = () => {
    setNavStack([]);
    setCurrentScreen("home");
  };

  const goToTab = useCallback((screen: Screen) => {
    setNavStack([]);
    setCurrentScreen(screen);
  }, []);

  const handleOpenHome = useCallback(() => goToTab("home"), [goToTab]);
  const handleOpenSearch = useCallback(() => goToTab("search"), [goToTab]);
  const handleOpenGarage = useCallback(() => goToTab("garage"), [goToTab]);
  const handleOpenMore = useCallback(() => goToTab("more"), [goToTab]);
  const handleOpenRentals = useCallback(() => goToTab("rentals"), [goToTab]);
  const handleOpenProfile = useCallback(() => goToTab("profile"), [goToTab]);
  const handleOpenFavorites = useCallback(() => goToTab("favorites"), [goToTab]);
  const handleOpenBusiness = useCallback(() => goToTab("earnBusiness"), [goToTab]);
  const handleOpenPlans = useCallback(() => navigateTo("subscriptionPlans"), [navigateTo]);

  const openRentLocationSetup = useCallback(() => {
    setHomeLocationError(null);
    navigateTo("whereAreYou");
  }, [navigateTo]);

  useEffect(() => {
    if (currentScreen !== "home" && currentScreen !== "search") return;
    if (hasRentLocationSetup()) return;
    if (isOnboardingComplete()) return;
    openRentLocationSetup();
  }, [currentScreen, openRentLocationSetup]);

  const skipOnboarding = useCallback(() => {
    cleanupSplashGlobals();

    if (currentScreen === "firstHello") {
      markIntroDone();
      setNavStack([]);
      setCurrentScreen(isOnboardingComplete() ? "home" : "whereAreYou");
      return;
    }

    if (currentScreen === "whatDoYouWant") {
      markIntroDone();
      markRoleChosen();
      setNavStack([]);
      setCurrentScreen(isOnboardingComplete() ? "home" : "whereAreYou");
      return;
    }

    markIntroDone();

    if (
      currentScreen === "whereAreYou" ||
      currentScreen === "whereAreYouManual" ||
      currentScreen === "whereAreYouHeading"
    ) {
      completeOnboarding();
      setNavStack([]);
      setCurrentScreen("home");
      return;
    }

    setAppMode("rent");
    setNavStack([]);
    setCurrentScreen("home");
  }, [currentScreen, navigateTo]);

  const handleSplashContinue = () => {
    cleanupSplashGlobals();
    setNavStack([]);
    setCurrentScreen(resolvePostSplashScreen());
  };

  const handleContinueFromHello = () => {
    markIntroDone();
    if (isOnboardingComplete()) {
      setNavStack([]);
      setCurrentScreen("home");
      return;
    }
    navigateTo("whereAreYou");
  };

  const handleEarn = () => {
    markRoleChosen();
    setAppMode("earn");
    completeOnboarding();
    navigateTo("listingIntro");
  };

  const handleSave = () => {
    markRoleChosen();
    setAppMode("rent");
    navigateTo("whereAreYou");
  };

  const handleAtHome = useCallback(async () => {
    setHomeLocationError(null);
    setIsLocatingHome(true);
    try {
      const result = await resolveHomeLocation();
      if (result.ok) {
        finishRentOnboarding();
      } else {
        const message =
          result.reason === "denied"
            ? "Location access was blocked. Allow location in your browser, or enter it manually."
            : result.reason === "timeout"
              ? "Location timed out. Check GPS/Wi‑Fi or enter your address manually."
              : result.reason === "unsupported"
                ? "On your phone, open the app via https:// (not http://). Or enter your street address below."
                : "We couldn't detect your location. Enter it manually.";
        setHomeLocationError(message);
        navigateTo("whereAreYouManual");
      }
    } finally {
      setIsLocatingHome(false);
    }
  }, [finishRentOnboarding, navigateTo]);

  const handleManualLocationContinue = () => {
    finishRentOnboarding();
  };

  const handleTraveling = () => {
    navigateTo("whereAreYouHeading");
  };

  const handleDestinationContinue = () => {
    finishRentOnboarding();
  };

  const handleListingIntroStart = () => {
    setEditingListingId(null);
    navigateTo("listItem");
  };

  const handleListingIntroSkip = () => {
    setEditingListingId(null);
    navigateTo("listItem");
  };

  const handleListingWizardExit = () => {
    handleBack();
  };

  const handleCategorySelect = (categoryId: string, categoryLabel: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryLabel);
    navigateTo("subcategory");
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    navigateTo("itemDetail");
  };

  const handleOpenAttachment = (url: string, title?: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setAttachmentUrl(trimmed);
    setAttachmentTitle(title?.trim() ? title.trim() : "Attachment");
    navigateTo("attachmentViewer");
  };

  const handlePostRequest = (prefill?: ShelfPrefill) => {
    setPostRequestPrefill(prefill ?? null);
    navigateTo("postRequest");
  };

  const handleOpenNotifications = () => {
    navigateTo("notifications");
  };

  const handleBook = () => {
    navigateTo("booking");
  };

  const handleBookingConfirmed = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setNavStack((stack) => [...stack, currentScreen]);
    setCurrentScreen("bookingConfirmed");
  };

  const handleBack = useCallback(() => {
    setNavStack((stack) => {
      if (stack.length > 0) {
        const previous = stack[stack.length - 1];
        setCurrentScreen(previous);
        return stack.slice(0, -1);
      }
      if (currentScreen === "listItem" || currentScreen === "listingIntro") {
        const listingFallback = LISTING_BACK_FALLBACK[currentScreen];
        if (listingFallback) {
          setCurrentScreen(listingFallback);
        } else {
          setCurrentScreen("home");
        }
        return stack;
      }
      if (isOnboardingScreen(currentScreen)) {
        const fallback = ONBOARDING_BACK_FALLBACK[currentScreen];
        if (fallback) {
          setCurrentScreen(fallback);
        } else {
          setCurrentScreen("home");
        }
        return stack;
      }
      setCurrentScreen("home");
      return stack;
    });
  }, [currentScreen]);

  useEffect(() => {
    if (!auth.configured) return;
    if (auth.loading) return;
    if (!auth.session) return;

    const token = auth.session.access_token ?? null;
    if (token && handledSessionTokenRef.current === token) return;
    handledSessionTokenRef.current = token;

    const resumeAfterAuthCallback = () => {
      if (!consumeAuthCallbackResume()) return;
      markIntroDone();
      cleanupSplashGlobals();
      setNavStack([]);
      // Prefer returning to the intent screen that triggered auth (e.g. list/book/message),
      // not just "post splash". This makes magic-link callbacks feel like a real continuation.
      setCurrentScreen(resolvePostAuthScreen());
      setPostAuthTarget(null);
    };

    resumeAfterAuthCallback();

    // If we just came back from OAuth, prompt for passkey enrollment once.
    const provider = consumeLastOauthProvider();
    const afterLogin = () => {
      if (authGateOpen || peekPendingAuthEmail()) {
        finishAuthFlow();
      }
    };

    const maybePromptPasskey = () => {
      if (!shouldPromptEnablePasskey()) return;
      void userHasPasskey().then((has) => {
        if (!has) setPasskeySetupOpen(true);
      });
    };

    afterLogin();
    if (!provider) {
      maybePromptPasskey();
      return;
    }

    maybePromptPasskey();
  }, [auth.configured, auth.loading, auth.session, authGateOpen, currentScreen, finishAuthFlow]);

  const handleBackFromSubcategory = () => {
    handleBack();
  };

  const handlePost = () => {
    resetToHome();
  };

  const handleNavigate = (screen: string) => {
    if (screen.startsWith("hostListingDetail:")) {
      const id = screen.slice("hostListingDetail:".length).trim();
      if (!id) return;
      setSelectedHostListingId(id);
      navigateTo("hostListingDetail");
      return;
    }
    if (screen.startsWith("neighborGarage:")) {
      const hostId = screen.slice("neighborGarage:".length).trim();
      if (!hostId) return;
      setSelectedNeighborGarageHostId(hostId);
      navigateTo("neighborGarage");
      return;
    }
    if (screen === "listItem" || screen === "startEarning") {
      navigateTo("listingIntro");
    }
  };

  const handleStartListing = (prefill?: ShelfPrefill) => {
    setListingPrefill(prefill ?? null);
    setEditingListingId(null);
    navigateTo("listingIntro");
  };

  const showBrandHeader = currentScreen !== "splash";

  if (!isOnline) {
    return (
      <div className="app-shell">
        <div className="app-container bg-background">
          <OfflineScreen />
        </div>
      </div>
    );
  }

  return (
    <RequireAuthProvider requireAuth={requireAuth}>
    <div className="app-shell">
      <div
        className={`app-container bg-background ${showBrandHeader ? "app-container--with-brand" : ""}`}
      >
        {showBrandHeader ? <AppBrandHeader /> : null}

        <div className="app-screen-host">
        {currentScreen === "splash" && (
          <SplashScreen
            onDone={handleSplashContinue}
            preview={splashPreview || splashDynamicPreview}
            artOnly={splashArtOnly}
            dynamicPreview={splashDynamicPreview}
          />
        )}

        {currentScreen === "firstHello" && (
          <FirstHello
            onNext={handleContinueFromHello}
            onSkip={skipOnboarding}
            onBack={handleBack}
          />
        )}

        {currentScreen === "whatDoYouWant" && (
          <WhatDoYouWant
            onEarn={handleEarn}
            onSave={handleSave}
            onSkip={skipOnboarding}
            onBack={handleBack}
          />
        )}

        {currentScreen === "whereAreYou" && (
          <WhereAreYou
            onAtHome={handleAtHome}
            onTraveling={handleTraveling}
            onBack={handleBack}
            isLocatingHome={isLocatingHome}
            locationError={homeLocationError}
            onSkip={skipOnboarding}
          />
        )}

        {currentScreen === "whereAreYouHeading" && (
          <WhereAreYouHeading
            onBack={handleBack}
            onContinue={handleDestinationContinue}
            onSkip={skipOnboarding}
          />
        )}

        {currentScreen === "whereAreYouManual" && (
          <WhereAreYouManual
            onBack={handleBack}
            onContinue={handleManualLocationContinue}
            hint={homeLocationError ?? undefined}
            onSkip={skipOnboarding}
          />
        )}

        {currentScreen === "onboardingAllSet" && (
          <YouAreAllSet
            onExplore={finishOnboardingToHome}
            onBack={handleBack}
            onSkip={finishOnboardingToHome}
          />
        )}

        {currentScreen === "home" && (
          <HomeFeed
            variant="home"
            onNavigate={handleNavigate}
            onOpenNotifications={handleOpenNotifications}
            onEditLocation={openRentLocationSetup}
            onPostRequest={handlePostRequest}
            onStockGarage={handleStartListing}
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onMore={handleOpenMore}
            onRentals={handleOpenRentals}
          />
        )}

        {currentScreen === "search" && (
          <HomeFeed
            variant="search"
            onNavigate={handleNavigate}
            onOpenNotifications={handleOpenNotifications}
            onEditLocation={openRentLocationSetup}
            onPostRequest={handlePostRequest}
            onStockGarage={handleStartListing}
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onMore={handleOpenMore}
            onRentals={handleOpenRentals}
          />
        )}

        {currentScreen === "more" && (
          <MoreScreen
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onStockGarage={handleStartListing}
            onGarage={handleOpenGarage}
            onProfile={handleOpenProfile}
            onRentals={handleOpenRentals}
            onFavorites={handleOpenFavorites}
            onNotifications={handleOpenNotifications}
            onEarnBusiness={handleOpenBusiness}
          />
        )}

        {currentScreen === "garage" && (
          <GarageScreen
            onNavigate={handleNavigate}
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onStockGarage={handleStartListing}
            onMore={handleOpenMore}
          />
        )}

        {currentScreen === "neighborGarage" && selectedNeighborGarageHostId && (
          <NeighborGarageScreen
            hostId={selectedNeighborGarageHostId}
            onBack={handleBack}
            onOpenListing={(id) => {
              setSelectedHostListingId(id);
              navigateTo("hostListingDetail");
            }}
          />
        )}

        {currentScreen === "rentals" && (
          <RentalsScreen
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onStockGarage={handleStartListing}
            onProfile={handleOpenProfile}
            onMore={handleOpenMore}
            onOpenRental={() => navigateTo("activeRental")}
            onViewProfile={() => undefined}
            onReRent={() => {
              setNavStack([]);
              setCurrentScreen("home");
            }}
          />
        )}

        {currentScreen === "profile" && (
          <ProfileScreen
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onStockGarage={handleStartListing}
            onRentals={handleOpenRentals}
            onMore={handleOpenMore}
            onEditLocation={openRentLocationSetup}
            onOpenPlans={handleOpenPlans}
            onDeleteAccount={() => navigateTo("deleteAccount")}
          />
        )}

        {currentScreen === "favorites" && (
          <FavoritesScreen
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onStockGarage={handleStartListing}
            onRentals={handleOpenRentals}
            onProfile={handleOpenProfile}
            onMore={handleOpenMore}
          />
        )}

        {currentScreen === "earnBusiness" && (
          <EarnBusinessScreen
            onHome={handleOpenHome}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onStockGarage={handleStartListing}
            onRentals={handleOpenRentals}
            onProfile={handleOpenProfile}
            onMore={handleOpenMore}
          />
        )}

        {currentScreen === "subscriptionPlans" && (
          <SubscriptionPlansScreen onBack={handleBack} />
        )}

        {currentScreen === "identity" && (
          <IdentityVerificationScreen onBack={handleBack} />
        )}

        {currentScreen === "agentActivity" && (
          <AgentActivityScreen onBack={handleBack} />
        )}

        {currentScreen === "notifications" && (
          <NotificationsScreen onBack={handleBack} mode={getAppMode()} />
        )}

        {currentScreen === "subcategory" && selectedCategory && (
          <Subcategory
            category={selectedCategory}
            appMode={getAppMode()}
            onBack={handleBackFromSubcategory}
            onPostRequest={handlePostRequest}
            onStartListing={handleStartListing}
            onItemSelect={handleItemSelect}
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
            onSearch={handleOpenSearch}
            onGarage={handleOpenGarage}
            onStockGarage={handleStartListing}
            onMore={handleOpenMore}
            onUnlock={() => requireAuth("generic")}
          />
        )}

        {currentScreen === "itemDetail" && selectedItemId && (
          <ItemDetail
            itemId={selectedItemId}
            onBack={handleBack}
            onBook={handleBook}
            onOpenAttachment={handleOpenAttachment}
          />
        )}

        {currentScreen === "booking" && selectedItemId && (
          <BookingScreen
            listingId={selectedItemId}
            onBack={handleBack}
            onConfirmed={handleBookingConfirmed}
          />
        )}

        {currentScreen === "bookingConfirmed" && (
          <BookingConfirmedScreen
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
          />
        )}

        {currentScreen === "postRequest" && (
          <PostRequest
            prefill={postRequestPrefill}
            onBack={() => {
              setPostRequestPrefill(null);
              handleBack();
            }}
            onPost={() => {
              setPostRequestPrefill(null);
              handlePost();
            }}
          />
        )}

        {currentScreen === "activeRental" && (
          <ActiveRental onBack={handleBack} />
        )}

        {currentScreen === "listingIntro" && (
          <ListingIntro
            onStart={handleListingIntroStart}
            onSkip={handleListingIntroSkip}
            onBack={handleBack}
          />
        )}

        {currentScreen === "listItem" && (
          <ListingWizard
            initialPrefill={listingPrefill}
            initialDraft={editingListingId ? getPublishedListingById(editingListingId) : null}
            onExit={() => {
              setListingPrefill(null);
              setEditingListingId(null);
              handleListingWizardExit();
            }}
          />
        )}

        {currentScreen === "hostListingDetail" && selectedHostListingId && (
          <HostListingDetailScreen
            listingId={selectedHostListingId}
            onBack={handleBack}
            onEdit={(listingId) => {
              setSelectedHostListingId(listingId);
              setListingPrefill(null);
              setEditingListingId(listingId);
              navigateTo("listItem");
            }}
          />
        )}

        {currentScreen === "attachmentViewer" && attachmentUrl && (
          <AttachmentViewerScreen
            url={attachmentUrl}
            title={attachmentTitle ?? undefined}
            onBack={() => {
              setAttachmentUrl(null);
              setAttachmentTitle(null);
              handleBack();
            }}
          />
        )}

        {currentScreen === "deleteAccount" && (
          <DeleteAccountScreen
            onBack={handleBack}
            onDone={() => {
              setNavStack([]);
              setCurrentScreen("profile");
            }}
          />
        )}
        </div>
      </div>

      <AuthGate
        open={authGateOpen}
        intent={authIntent}
        initialStep={peekPendingAuthEmail() ? "sent" : undefined}
        onDismiss={() => setAuthGateOpen(false)}
      />

      <PasskeySetup open={passkeySetupOpen} onDone={() => setPasskeySetupOpen(false)} />
    </div>
    </RequireAuthProvider>
  );
}

export default function App() {
  return (
    <PwaUpdateProvider>
      <PwaInstallProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </PwaInstallProvider>
    </PwaUpdateProvider>
  );
}
