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
import { PostRequest } from "./components/PostRequest";
import { ActiveRental } from "./components/ActiveRental";
import { ListingIntro } from "../screens/listing/ListingIntro";
import { ListingWizard } from "../screens/listing/ListingWizard";
import { YouAreAllSet } from "../screens/onboarding/YouAreAllSet";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { PwaInstallProvider } from "../hooks/PwaInstallProvider";
import { PwaUpdateProvider } from "../hooks/PwaUpdateProvider";
import { getAppMode, setAppMode } from "../lib/appMode";
import {
  completeOnboarding,
  isOnboardingComplete,
  isIntroDone,
  markIntroDone,
} from "../lib/onboardingStorage";
import { hasRentLocationSetup } from "../lib/listingStorage";
import { isSimulateUpdateRequested } from "../lib/pwaUpdateStorage";

type Screen =
  | "splash"
  | "firstHello"
  | "whatDoYouWant"
  | "whereAreYou"
  | "whereAreYouHeading"
  | "whereAreYouManual"
  | "youAreAllSet"
  | "home"
  | "notifications"
  | "subcategory"
  | "itemDetail"
  | "postRequest"
  | "activeRental"
  | "listingIntro"
  | "listItem";

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    if (!boot.openNotifications) return;
    if (currentScreen !== "home" && currentScreen !== "notifications") return;
    setNavStack([]);
    setCurrentScreen("notifications");
    clearBootQuery(["openNotifications", "skipSplash", "simulateUpdate"]);
  }, [boot.openNotifications, currentScreen]);

  const finishRentOnboarding = () => {
    setNavStack([]);
    setCurrentScreen("youAreAllSet");
  };

  const navigateTo = (screen: Screen) => {
    setNavStack((stack) => [...stack, currentScreen]);
    setCurrentScreen(screen);
  };

  const resetToHome = () => {
    setNavStack([]);
    setCurrentScreen("home");
  };

  const openRentLocationSetup = useCallback(() => {
    setHomeLocationError(null);
    setNavStack([]);
    setCurrentScreen("whereAreYou");
  }, []);

  useEffect(() => {
    if (currentScreen !== "home") return;
    if (getAppMode() !== "rent") return;
    if (hasRentLocationSetup()) return;
    if (isOnboardingComplete()) return;
    openRentLocationSetup();
  }, [currentScreen, openRentLocationSetup]);

  const skipOnboarding = useCallback(() => {
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
      setNavStack([]);
      setCurrentScreen("whereAreYou");
      return;
    }

    setAppMode("rent");
    setNavStack([]);
    setCurrentScreen("home");
  }, [currentScreen]);

  const finishOnboardingToHome = useCallback(() => {
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("home");
  }, []);

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
    setCurrentScreen("whatDoYouWant");
  };

  const handleEarn = () => {
    completeOnboarding();
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
  }, []);

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
    navigateTo("listItem");
  };

  const handleListingIntroSkip = () => {
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

  const handlePostRequest = () => {
    navigateTo("postRequest");
  };

  const handleOpenNotifications = () => {
    navigateTo("notifications");
  };

  const handleBook = () => {
    navigateTo("activeRental");
  };

  const handleBack = () => {
    setNavStack((stack) => {
      if (stack.length === 0) {
        setCurrentScreen("home");
        return stack;
      }
      const previous = stack[stack.length - 1];
      setCurrentScreen(previous);
      return stack.slice(0, -1);
    });
  };

  const handleBackFromSubcategory = () => {
    handleBack();
  };

  const handlePost = () => {
    resetToHome();
  };

  const handleNavigate = (screen: string) => {
    if (screen === "listItem" || screen === "startEarning") {
      navigateTo("listingIntro");
    }
  };

  const showBrandHeader =
    currentScreen !== "splash" && currentScreen !== "youAreAllSet";

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
          />
        )}

        {currentScreen === "whereAreYou" && (
          <WhereAreYou
            onAtHome={handleAtHome}
            onTraveling={handleTraveling}
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

        {currentScreen === "youAreAllSet" && (
          <YouAreAllSet onContinue={finishOnboardingToHome} />
        )}

        {currentScreen === "home" && (
          <HomeFeed
            selectedCategoryId={selectedCategoryId}
            onPostRequest={handlePostRequest}
            onNavigate={handleNavigate}
            onCategorySelect={handleCategorySelect}
            onOpenNotifications={handleOpenNotifications}
            onEditLocation={openRentLocationSetup}
          />
        )}

        {currentScreen === "notifications" && (
          <NotificationsScreen onBack={handleBack} mode={getAppMode()} />
        )}

        {currentScreen === "subcategory" && selectedCategory && (
          <Subcategory
            category={selectedCategory}
            onBack={handleBackFromSubcategory}
            onPostRequest={handlePostRequest}
            onItemSelect={handleItemSelect}
          />
        )}

        {currentScreen === "itemDetail" && selectedItemId && (
          <ItemDetail
            itemId={selectedItemId}
            onBack={handleBack}
            onBook={handleBook}
          />
        )}

        {currentScreen === "postRequest" && (
          <PostRequest onBack={handleBack} onPost={handlePost} />
        )}

        {currentScreen === "activeRental" && (
          <ActiveRental onBack={handleBack} />
        )}

        {currentScreen === "listingIntro" && (
          <ListingIntro
            onStart={handleListingIntroStart}
            onSkip={handleListingIntroSkip}
          />
        )}

        {currentScreen === "listItem" && (
          <ListingWizard
            onExit={handleListingWizardExit}
            onListAnother={() => navigateTo("listingIntro")}
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
