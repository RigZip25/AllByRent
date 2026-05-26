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
import { getAppMode, setAppMode } from "../lib/appMode";
import { completeOnboarding, getInitialRoute } from "../lib/onboardingStorage";

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

function AppRoutes() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() =>
    getInitialRoute() === "home" ? "home" : "splash",
  );
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

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
    setAppMode("rent");
    setNavStack([]);
    setCurrentScreen("home");
  }, []);

  const finishOnboardingToHome = useCallback(() => {
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("home");
  }, []);

  const handleSplashContinue = () => {
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
          <SplashScreen onGetStarted={handleSplashContinue} />
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
    <PwaInstallProvider>
      <AppRoutes />
    </PwaInstallProvider>
  );
}
