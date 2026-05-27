import { useState, useCallback, useEffect } from "react";
import { resolveHomeLocation } from "../lib/geolocation";
import { AppBrandHeader } from "../components/AppBrandHeader";
import { OfflineScreen } from "./components/OfflineScreen";
import { SplashScreen } from "./components/SplashScreen";
import { FirstHello } from "../screens/onboarding/FirstHello";
import { WhatDoYouWant } from "../screens/onboarding/WhatDoYouWant";
import { WhereAreYou } from "../screens/onboarding/WhereAreYou";
import { WhereAreYouHeading } from "../screens/onboarding/WhereAreYouHeading";
import { WhereAreYouManual } from "../screens/onboarding/WhereAreYouManual";
import { HomeFeed } from "./components/HomeFeed";
import { Subcategory } from "./components/Subcategory";
import { ItemDetail } from "./components/ItemDetail";
import { BookingScreen } from "./components/BookingScreen";
import { PostRequest } from "./components/PostRequest";
import { ActiveRental } from "./components/ActiveRental";
import { ListingIntro } from "../screens/listing/ListingIntro";
import { ListingWizard } from "../screens/listing/ListingWizard";
import { HostListingDetailScreen } from "../screens/listing/HostListingDetailScreen";
import { AttachmentViewerScreen } from "../screens/AttachmentViewerScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { RentalsScreen } from "../screens/RentalsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { EarnBusinessScreen } from "../screens/EarnBusinessScreen";
import { SubscriptionPlansScreen } from "../screens/SubscriptionPlansScreen";
import { PwaInstallProvider } from "../hooks/PwaInstallProvider";
import { PwaUpdateProvider } from "../hooks/PwaUpdateProvider";
import { getAppMode, setAppMode } from "../lib/appMode";
import {
  completeOnboarding,
  isOnboardingComplete,
  isIntroDone,
  markIntroDone,
} from "../lib/onboardingStorage";
import { getPublishedListingById, hasRentLocationSetup } from "../lib/listingStorage";
import type { ShelfPrefill } from "../lib/shelfListings";
import { isSimulateUpdateRequested } from "../lib/pwaUpdateStorage";
import { isResetAppQueryParam, resetAllAppData } from "../lib/resetAppStorage";

type Screen =
  | "splash"
  | "firstHello"
  | "whatDoYouWant"
  | "whereAreYou"
  | "whereAreYouHeading"
  | "whereAreYouManual"
  | "home"
  | "notifications"
  | "subcategory"
  | "itemDetail"
  | "booking"
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
  | "subscriptionPlans";

/** When nav stack is empty, in-app Back still returns to the prior onboarding step. */
const ONBOARDING_BACK_FALLBACK: Partial<Record<Screen, Screen>> = {
  whatDoYouWant: "firstHello",
  whereAreYou: "whatDoYouWant",
  whereAreYouManual: "whereAreYou",
  whereAreYouHeading: "whereAreYou",
};

/** Listing flow only — used when the nav stack is empty (not onboarding fallbacks). */
const LISTING_BACK_FALLBACK: Partial<Record<Screen, Screen>> = {
  listItem: "listingIntro",
  listingIntro: "home",
};

function isOnboardingScreen(screen: Screen): boolean {
  return screen in ONBOARDING_BACK_FALLBACK || screen === "firstHello";
}

function readBootQuery() {
  if (typeof window === "undefined") {
    return { skipSplash: false, openNotifications: false, simulateUpdate: false };
  }
  const params = new URLSearchParams(window.location.search);
  const simulateUpdate =
    params.get("simulateUpdate") === "1" || isSimulateUpdateRequested();
  return {
    skipSplash: params.get("skipSplash") === "1",
    openNotifications: params.get("openNotifications") === "1",
    simulateUpdate,
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

function AppRoutes() {
  const boot = readBootQuery();
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (boot.skipSplash) {
      if (boot.openNotifications || boot.simulateUpdate) {
        markIntroDone();
        completeOnboarding();
        return "home";
      }
      return isIntroDone() ? "home" : "firstHello";
    }
    return "splash";
  });
  const [navStack, setNavStack] = useState<Screen[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedHostListingId, setSelectedHostListingId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [listingPrefill, setListingPrefill] = useState<ShelfPrefill | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [postRequestPrefill, setPostRequestPrefill] = useState<ShelfPrefill | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentTitle, setAttachmentTitle] = useState<string | null>(null);
  const [isLocatingHome, setIsLocatingHome] = useState(false);
  const [homeLocationError, setHomeLocationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

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

  const finishRentOnboarding = finishOnboardingToHome;

  /** Push the screen we are leaving, then open the next screen (avoids stale currentScreen in the stack). */
  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen((from) => {
      setNavStack((stack) => [...stack, from]);
      return screen;
    });
  }, []);

  const resetToHome = () => {
    setNavStack([]);
    setCurrentScreen("home");
  };

  const goToTab = useCallback((screen: Screen) => {
    setNavStack([]);
    setCurrentScreen(screen);
  }, []);

  const handleOpenHome = useCallback(() => goToTab("home"), [goToTab]);
  const handleOpenRentals = useCallback(() => goToTab("rentals"), [goToTab]);
  const handleOpenProfile = useCallback(() => goToTab("profile"), [goToTab]);
  const handleOpenFavorites = useCallback(() => goToTab("favorites"), [goToTab]);
  const handleOpenBusiness = useCallback(() => goToTab("earnBusiness"), [goToTab]);
  const handleOpenFourthTab = useCallback(() => {
    if (getAppMode() === "earn") {
      goToTab("earnBusiness");
    } else {
      goToTab("favorites");
    }
  }, [goToTab]);
  const handleOpenPlans = useCallback(() => navigateTo("subscriptionPlans"), [navigateTo]);

  const openRentLocationSetup = useCallback(() => {
    setHomeLocationError(null);
    navigateTo("whereAreYou");
  }, [navigateTo]);

  useEffect(() => {
    if (currentScreen !== "home") return;
    if (getAppMode() !== "rent") return;
    if (hasRentLocationSetup()) return;
    if (isOnboardingComplete()) return;
    openRentLocationSetup();
  }, [currentScreen, openRentLocationSetup]);

  const skipOnboarding = useCallback(() => {
    cleanupSplashGlobals();
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

    if (currentScreen === "firstHello" || currentScreen === "whatDoYouWant") {
      setAppMode("rent");
      navigateTo("whereAreYou");
      return;
    }

    setAppMode("rent");
    setNavStack([]);
    setCurrentScreen("home");
  }, [currentScreen, navigateTo]);

  const handleSplashContinue = () => {
    // Splash is always shown. After it finishes, route:
    // - If intro already done (user completed onboarding before), go to home.
    // - Otherwise show the Rentano intro.
    if (isIntroDone()) {
      setCurrentScreen("home");
      return;
    }
    setCurrentScreen("firstHello");
  };

  const handleContinueFromHello = () => {
    navigateTo("whatDoYouWant");
  };

  const handleEarn = () => {
    setAppMode("earn");
    navigateTo("listingIntro");
  };

  const handleSave = () => {
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

  const handleBookingConfirmed = () => {
    navigateTo("activeRental");
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
    <div className="app-shell">
      <div
        className={`app-container bg-background ${showBrandHeader ? "app-container--with-brand" : ""}`}
      >
        {showBrandHeader ? <AppBrandHeader /> : null}

        <div className="app-screen-host">
        {currentScreen === "splash" && (
          <SplashScreen onDone={handleSplashContinue} />
        )}

        {currentScreen === "firstHello" && (
          <FirstHello onNext={handleContinueFromHello} onSkip={skipOnboarding} />
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

        {currentScreen === "home" && (
          <HomeFeed
            selectedCategoryId={selectedCategoryId}
            onNavigate={handleNavigate}
            onCategorySelect={handleCategorySelect}
            onOpenNotifications={handleOpenNotifications}
            onEditLocation={openRentLocationSetup}
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
            onFourthTab={handleOpenFourthTab}
            onProfile={handleOpenProfile}
          />
        )}

        {currentScreen === "rentals" && (
          <RentalsScreen
            onHome={handleOpenHome}
            onProfile={handleOpenProfile}
            onFourthTab={handleOpenFourthTab}
            onOpenRental={() => navigateTo("activeRental")}
            onViewProfile={() => undefined}
          />
        )}

        {currentScreen === "profile" && (
          <ProfileScreen
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
            onFourthTab={handleOpenFourthTab}
            onEditLocation={openRentLocationSetup}
            onOpenPlans={handleOpenPlans}
          />
        )}

        {currentScreen === "favorites" && (
          <FavoritesScreen
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
            onFourthTab={handleOpenFourthTab}
            onProfile={handleOpenProfile}
          />
        )}

        {currentScreen === "earnBusiness" && (
          <EarnBusinessScreen
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
            onFourthTab={handleOpenFourthTab}
            onProfile={handleOpenProfile}
          />
        )}

        {currentScreen === "subscriptionPlans" && (
          <SubscriptionPlansScreen onBack={handleBack} />
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
            onFourthTab={handleOpenFourthTab}
            onProfile={handleOpenProfile}
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
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PwaUpdateProvider>
      <PwaInstallProvider>
        <AppRoutes />
      </PwaInstallProvider>
    </PwaUpdateProvider>
  );
}
