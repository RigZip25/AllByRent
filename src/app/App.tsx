import { useState, useCallback, useEffect, useRef, startTransition } from "react";
import { resolveHomeLocation } from "../lib/geolocation";
import { AppBrandHeader } from "../components/AppBrandHeader";
import { OfflineScreen } from "./components/OfflineScreen";
import { GarageShopMissingScreen } from "./components/GarageShopMissingScreen";
import { SplashScreen } from "./components/SplashScreen";
import { FirstHello } from "../screens/onboarding/FirstHello";
import { WhatDoYouWant } from "../screens/onboarding/WhatDoYouWant";
import { WhereAreYou } from "../screens/onboarding/WhereAreYou";
import { WhereAreYouHeading } from "../screens/onboarding/WhereAreYouHeading";
import { WhereAreYouManual } from "../screens/onboarding/WhereAreYouManual";
import { YouAreAllSet } from "../screens/onboarding/YouAreAllSet";
import { BrowseHubScreen } from "../screens/BrowseHubScreen";
import { YardSaleHubScreen } from "../screens/YardSaleHubScreen";
import { YardSalesScreen } from "../screens/YardSalesScreen";
import { OpenGarageSaleScreen } from "../screens/OpenGarageSaleScreen";
import { SnapSaleScreen } from "../screens/garage-sale/SnapSaleScreen";
import { GarageWorkflowScreen } from "../screens/garage-sale/GarageWorkflowScreen";
import { GarageSaleRulesScreen } from "../screens/garage-sale/GarageSaleRulesScreen";
import { GarageHostOffersScreen } from "../screens/GarageHostOffersScreen";
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
import { PublicProfileScreen } from "../screens/PublicProfileScreen";
import { GarageScreen } from "../screens/GarageScreen";
import { ActiveGarageShopScreen } from "../screens/ActiveGarageShopScreen";
import { GarageCartScreen } from "../screens/GarageCartScreen";
import { GarageWinnerCheckoutScreen } from "../screens/GarageWinnerCheckoutScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { MrEvoriosScreen } from "../screens/MrEvoriosScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { EarnBusinessScreen } from "../screens/EarnBusinessScreen";
import { SetupRequiredScreen } from "../screens/SetupRequiredScreen";
import { IntegrationStatusScreen } from "../screens/IntegrationStatusScreen";
import { PwaInstallProvider } from "../hooks/PwaInstallProvider";
import { PwaUpdateProvider } from "../hooks/PwaUpdateProvider";
import { AuthProvider, useAuth } from "../hooks/AuthProvider";
import { RequireAuthProvider } from "../hooks/RequireAuth";
import {
  consumeAuthReturn,
  clearPendingAuthEmail,
  peekPendingAuthEmail,
  setAuthIntent,
  setAuthReturn,
  setEditingListingReturn,
  consumeEditingListingReturn,
  peekEditingListingReturn,
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
import { categoryIdFromName } from "../screens/listing/listingItemCategories";
import { getPublishedListingById, hasRentLocationSetup, loadPublishedListings } from "../lib/listingStorage";
import { getListingDisplayTitle } from "../lib/listingQr";
import type { RentalBooking } from "../lib/rentalsStorage";
import { canManageListing } from "../lib/hostAccess";
import {
  deepLinkQueryKeys,
  parseDeepLink,
  resolveListingDeepLink,
  type DeepLinkTarget,
} from "../lib/deepLinks";
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
import { CoHostsScreen } from "../screens/profile/CoHostsScreen";
import { PersonalInfoScreen } from "../screens/profile/PersonalInfoScreen";
import { IdentityVerificationScreen } from "../screens/IdentityVerificationScreen";
import { AgentActivityScreen } from "../screens/AgentActivityScreen";
import { BottomNav, type BottomNavTab } from "./components/BottomNav";
import { removeStripeControllerIframes } from "../lib/stripeCleanup";
import {
  clearYardSaleListingActive,
  isYardSaleListingActive,
  setYardSaleListingActive,
} from "../lib/yardSaleListing";
import { hasSeenGarageWorkflow } from "../lib/garageWorkflowStorage";
import { hasSeenGarageSaleRules } from "../lib/garageSaleRulesStorage";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { loadUserProfile, syncUserProfileFromAuth } from "../lib/userProfileStorage";

import {
  saveHomeFeedLens,
  saveHomeFeedMode,
  saveHomeFeedQuery,
} from "../lib/homeFeedStorage";

type BrowseHubChoice = "findGear" | "yardSales";
type YardSaleHubChoice = "browse" | "host";

type Screen =
  | "splash"
  | "firstHello"
  | "whatDoYouWant"
  | "whereAreYou"
  | "whereAreYouHeading"
  | "whereAreYouManual"
  | "onboardingAllSet"
  | "browseHub"
  | "yardSaleHub"
  | "openGarageSale"
  | "snapSale"
  | "garageWorkflow"
  | "garageSaleRules"
  | "garageHostOffers"
  | "home"
  | "yardSales"
  | "mre"
  | "garage"
  | "more"
  | "neighborGarage"
  | "garageShop"
  | "garageCart"
  | "garageWinnerCheckout"
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
  | "integrationStatus"
  | "identity"
  | "agentActivity"
  | "deleteAccount"
  | "coHosts"
  | "personalInfo"
  | "publicProfile";

const HIDE_BRAND_HEADER_SCREENS = new Set<Screen>([
  "browseHub",
  "yardSaleHub",
  "openGarageSale",
  "snapSale",
  "garageWorkflow",
  "garageSaleRules",
]);

const BOTTOM_NAV_SCREENS = new Set<Screen>([
  "browseHub",
  "yardSaleHub",
  "openGarageSale",
  "home",
  "yardSales",
  "mre",
  "garage",
  "more",
  "rentals",
  "profile",
  "favorites",
  "earnBusiness",
  "subcategory",
]);

const TAB_BOOT_SCREENS: Partial<Record<string, Screen>> = {
  home: "browseHub",
  mre: "mre",
  garage: "garage",
  more: "more",
};

function bottomNavTabForScreen(screen: Screen): BottomNavTab {
  if (screen === "browseHub" || screen === "home" || screen === "yardSaleHub" || screen === "yardSales" || screen === "openGarageSale") return "home";
  if (screen === "mre") return "mre";
  if (screen === "garage") return "garage";
  if (screen === "more") return "more";
  if (
    screen === "rentals" ||
    screen === "profile" ||
    screen === "favorites" ||
    screen === "earnBusiness"
  ) {
    return "more";
  }
  return "none";
}

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
  listingIntro: "browseHub",
};

function isOnboardingScreen(screen: Screen): boolean {
  return screen in ONBOARDING_BACK_FALLBACK || screen === "firstHello" || screen === "onboardingAllSet";
}

function resolveBootDeepLinkTarget(target: DeepLinkTarget | null): DeepLinkTarget | null {
  if (!target) return null;
  if (target.kind === "listing") return resolveListingDeepLink(target.listingId);
  return target;
}

function readBootDeepLink() {
  if (typeof window === "undefined") {
    return { skipSplash: false, target: null as DeepLinkTarget | null };
  }
  const parsed = parseDeepLink(window.location.search, window.location.pathname);
  return {
    skipSplash: parsed.skipSplash,
    target: resolveBootDeepLinkTarget(parsed.target),
  };
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
  const deepLink = parseDeepLink(window.location.search, window.location.pathname);
  return {
    skipSplash:
      params.get("skipSplash") === "1" ||
      hasAuthCode ||
      hasAuthHash ||
      deepLink.skipSplash,
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
  if (resume === "browseHub") return "browseHub";
  return resume;
}

/** After sign-in, prefer finishing onboarding over jumping to home. */
function resolveScreenAfterAuth(storedTarget: Screen | null): Screen {
  if (!isOnboardingComplete()) {
    const resume = resolveOnboardingResumeScreen();
    if (resume !== "browseHub") return resume;
    if (getAppMode() === "rent" && !hasRentLocationSetup()) {
      return "whereAreYou";
    }
  }
  return storedTarget ?? "browseHub";
}

function bootScreenForDeepLink(target: DeepLinkTarget | null): Screen | null {
  if (!target) return null;
  if (target.kind === "garage") return "garageShop";
  return "itemDetail";
}

function bootHostIdForDeepLink(target: DeepLinkTarget | null): string | null {
  if (!target) return null;
  if (target.kind === "garage") return target.hostId;
  return null;
}

function bootItemIdForDeepLink(target: DeepLinkTarget | null): string | null {
  if (!target) return null;
  if (target.kind === "garage") return target.itemId ?? null;
  if (target.kind === "listing") return target.listingId;
  return null;
}

function AppRoutes() {
  const auth = useAuth();
  const boot = readBootQuery();
  const bootDeepLink = useRef(readBootDeepLink()).current;
  const handledSessionTokenRef = useRef<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (boot.screen === "splash") return "splash";
    const deepScreen = bootScreenForDeepLink(bootDeepLink.target);
    if (deepScreen && (boot.skipSplash || bootDeepLink.skipSplash)) {
      markIntroDone();
      completeOnboarding();
      return deepScreen;
    }
    if (boot.skipSplash || isIntroDone()) {
      if (boot.openNotifications || boot.simulateUpdate) {
        markIntroDone();
        completeOnboarding();
        return "browseHub";
      }
      return resolvePostSplashScreen();
    }
    return "splash";
  });
  const [navStack, setNavStack] = useState<Screen[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() =>
    bootDeepLink.target?.kind === "listing" ? bootDeepLink.target.listingId : null,
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [personalInfoInitialEdit, setPersonalInfoInitialEdit] = useState<"name" | "phone" | undefined>(
    undefined,
  );
  const [selectedPublicProfileUserId, setSelectedPublicProfileUserId] = useState<string | null>(null);
  const [selectedHostListingId, setSelectedHostListingId] = useState<string | null>(null);
  const [selectedNeighborGarageHostId, setSelectedNeighborGarageHostId] = useState<string | null>(() =>
    bootHostIdForDeepLink(bootDeepLink.target),
  );
  const [focusGarageItemId, setFocusGarageItemId] = useState<string | null>(() =>
    bootItemIdForDeepLink(bootDeepLink.target),
  );
  const [garageShopPreview, setGarageShopPreview] = useState(false);
  const [winnerCheckoutListingId, setWinnerCheckoutListingId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [listingPrefill, setListingPrefill] = useState<ShelfPrefill | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(() =>
    peekEditingListingReturn(),
  );
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
    if (!bootDeepLink.target) return;
    markIntroDone();
    completeOnboarding();
    setGarageShopPreview(false);
    if (bootDeepLink.target.kind === "garage") {
      setSelectedNeighborGarageHostId(bootDeepLink.target.hostId);
      setFocusGarageItemId(bootDeepLink.target.itemId ?? null);
      setNavStack([]);
      setCurrentScreen("garageShop");
    } else {
      setSelectedItemId(bootDeepLink.target.listingId);
      setNavStack([]);
      setCurrentScreen("itemDetail");
    }
    if (typeof window !== "undefined" && /^\/item\/[^/]+\/?$/i.test(window.location.pathname)) {
      const params = new URLSearchParams(window.location.search);
      const next = `${window.location.pathname.replace(/\/item\/[^/]+\/?$/i, "/")}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }
    clearBootQuery(deepLinkQueryKeys());
  }, [bootDeepLink.target, bootDeepLink.skipSplash]);

  useEffect(() => {
    removeStripeControllerIframes();
  }, [currentScreen]);

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
    const tabScreen = TAB_BOOT_SCREENS[screen];
    if (tabScreen) {
      markIntroDone();
      setNavStack([]);
      setCurrentScreen(tabScreen);
      clearBootQuery(["screen", "skipSplash"]);
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
    if (currentScreen !== "browseHub" && currentScreen !== "home" && currentScreen !== "notifications") return;
    setNavStack([]);
    setCurrentScreen("notifications");
    clearBootQuery(["openNotifications", "skipSplash", "simulateUpdate"]);
  }, [boot.openNotifications, currentScreen]);

  const finishOnboardingToHome = useCallback(() => {
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("browseHub");
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
    setCurrentScreen("browseHub");
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
      "browseHub",
      "yardSaleHub",
      "openGarageSale",
      "home",
      "yardSales",
      "mre",
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
      "coHosts",
      "publicProfile",
    ];
    const storedTarget =
      candidate && validScreens.includes(candidate)
        ? candidate
        : "browseHub";
    return resolveScreenAfterAuth(storedTarget);
  }, [postAuthTarget]);

  const finishAuthFlow = useCallback(() => {
    setAuthGateOpen(false);
    clearPendingAuthEmail();
    const restoredEditId = peekEditingListingReturn();
    if (restoredEditId) {
      setEditingListingId(restoredEditId);
      setSelectedHostListingId(restoredEditId);
    }
    const target = resolvePostAuthScreen();
    setNavStack([]);
    setCurrentScreen(target);
    setPostAuthTarget(null);
  }, [resolvePostAuthScreen]);

  const resetToHome = () => {
    setNavStack([]);
    setCurrentScreen("browseHub");
  };

  const openBrowseHub = useCallback(() => {
    setNavStack([]);
    setCurrentScreen("browseHub");
  }, []);

  const goToTab = useCallback((screen: Screen) => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
    removeStripeControllerIframes();
    startTransition(() => {
      setNavStack([]);
      setCurrentScreen(screen);
    });
  }, []);

  const handleOpenHome = useCallback(() => goToTab("browseHub"), [goToTab]);
  const handleOpenMrE = useCallback(() => goToTab("mre"), [goToTab]);
  const handleOpenGarage = useCallback(() => goToTab("garage"), [goToTab]);
  const handleOpenMore = useCallback(() => goToTab("more"), [goToTab]);
  const handleOpenRentals = useCallback(() => goToTab("rentals"), [goToTab]);
  const handleOpenProfile = useCallback(() => goToTab("profile"), [goToTab]);
  const handleViewPublicProfile = useCallback(
    (userId?: string | null) => {
      const id = (
        userId?.trim() ||
        auth.userId?.trim() ||
        loadUserProfile().id?.trim() ||
        ""
      );
      if (!id) {
        if (auth.configured && !auth.session) {
          showAuthGate("profile");
        }
        return;
      }
      if (auth.userId?.trim() === id) {
        syncUserProfileFromAuth({
          userId: auth.userId,
          userEmail: auth.userEmail,
        });
      }
      setSelectedPublicProfileUserId(id);
      navigateTo("publicProfile");
    },
    [auth.configured, auth.session, auth.userId, auth.userEmail, navigateTo, showAuthGate],
  );
  const handleOpenFavorites = useCallback(() => goToTab("favorites"), [goToTab]);
  const handleOpenBusiness = useCallback(() => goToTab("earnBusiness"), [goToTab]);
  const handleOpenIntegrations = useCallback(() => navigateTo("integrationStatus"), [navigateTo]);

  const handleOpenPersonalInfo = useCallback(
    (field?: "name" | "phone") => {
      setPersonalInfoInitialEdit(field);
      navigateTo("personalInfo");
    },
    [navigateTo],
  );

  const handleBrowseHubChoice = useCallback(
    (choice: BrowseHubChoice) => {
      if (choice === "findGear") {
        saveHomeFeedLens("feed");
        saveHomeFeedMode("all");
        saveHomeFeedQuery("");
        navigateTo("home");
        return;
      }
      if (choice === "yardSales") {
        navigateTo("yardSaleHub");
        return;
      }
    },
    [navigateTo],
  );

  const handleYardSaleHubChoice = useCallback(
    (choice: YardSaleHubChoice) => {
      if (choice === "browse") {
        navigateTo("yardSales");
        return;
      }
      navigateTo("openGarageSale");
    },
    [navigateTo],
  );

  const handleStartYardSaleListing = useCallback(() => {
    clearYardSaleListingActive();
    setListingPrefill(null);
    setEditingListingId(null);
    if (!hasSeenGarageWorkflow()) {
      navigateTo("garageWorkflow");
      return;
    }
    if (!hasSeenGarageSaleRules()) {
      navigateTo("garageSaleRules");
      return;
    }
    navigateTo("snapSale");
  }, [navigateTo]);

  const handleGarageWorkflowContinue = useCallback(() => {
    navigateTo(hasSeenGarageSaleRules() ? "snapSale" : "garageSaleRules");
  }, [navigateTo]);

  const handleGarageSaleRulesContinue = useCallback(() => {
    navigateTo("snapSale");
  }, [navigateTo]);

  const handleOpenGarageSaleRules = useCallback(() => {
    navigateTo("garageSaleRules");
  }, [navigateTo]);

  const handleOpenHostOffers = useCallback(() => {
    navigateTo("garageHostOffers");
  }, [navigateTo]);

  const openYardSaleHub = useCallback(() => {
    setNavStack([]);
    setCurrentScreen("yardSaleHub");
  }, []);

  const handleOpenNeighborGarage = useCallback(
    (hostId: string) => {
      setSelectedNeighborGarageHostId(hostId);
      setFocusGarageItemId(null);
      setGarageShopPreview(false);
      navigateTo("garageShop");
    },
    [navigateTo],
  );

  const handleOpenMyGarageShop = useCallback(() => {
    const hostId = resolveHostAccountId(auth.userId);
    setSelectedNeighborGarageHostId(hostId);
    setFocusGarageItemId(null);
    setGarageShopPreview(false);
    navigateTo("garageShop");
  }, [auth.userId, navigateTo]);

  const handleOpenGarageCart = useCallback(() => {
    navigateTo("garageCart");
  }, [navigateTo]);

  const handleOpenWinnerCheckout = useCallback(
    (listingId: string) => {
      setWinnerCheckoutListingId(listingId);
      navigateTo("garageWinnerCheckout");
    },
    [navigateTo],
  );

  const openRentLocationSetup = useCallback(() => {
    setHomeLocationError(null);
    navigateTo("whereAreYou");
  }, [navigateTo]);

  useEffect(() => {
    if (currentScreen !== "home") return;
    if (hasRentLocationSetup()) return;
    if (isOnboardingComplete()) return;
    openRentLocationSetup();
  }, [currentScreen, openRentLocationSetup]);

  const skipOnboarding = useCallback(() => {
    cleanupSplashGlobals();

    if (currentScreen === "firstHello") {
      markIntroDone();
      setNavStack([]);
      setCurrentScreen(isOnboardingComplete() ? "browseHub" : "whereAreYou");
      return;
    }

    if (currentScreen === "whatDoYouWant") {
      markIntroDone();
      markRoleChosen();
      setNavStack([]);
      setCurrentScreen(isOnboardingComplete() ? "browseHub" : "whereAreYou");
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
      setCurrentScreen("browseHub");
      return;
    }

    setAppMode("rent");
    setNavStack([]);
    setCurrentScreen("browseHub");
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
      setCurrentScreen("browseHub");
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

  const handleEnterManualLocation = useCallback(() => {
    setHomeLocationError(null);
    navigateTo("whereAreYouManual");
  }, [navigateTo]);

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
    clearYardSaleListingActive();
    handleBack();
  };

  const handleCategorySelect = (categoryId: string, categoryLabel: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryLabel);
    navigateTo("subcategory");
  };

  const handleItemSelect = (itemId: string) => {
    const listing = getPublishedListingById(itemId);
    if (listing && canManageListing(listing, auth.userId, auth.userEmail)) {
      setSelectedHostListingId(itemId);
      navigateTo("hostListingDetail");
      return;
    }
    setSelectedItemId(itemId);
    navigateTo("itemDetail");
  };

  const handleOpenListingFromFeed = (itemId: string) => {
    handleItemSelect(itemId);
  };

  const handleReRent = (booking: RentalBooking) => {
    if (booking.listingId) {
      handleOpenListingFromFeed(booking.listingId);
      return;
    }
    const titleNorm = booking.itemTitle.trim().toLowerCase();
    const listings = loadPublishedListings();
    const match =
      listings.find((l) => getListingDisplayTitle(l.title).toLowerCase() === titleNorm) ??
      listings.find((l) => getListingDisplayTitle(l.title).toLowerCase().includes(titleNorm));
    if (match) {
      handleOpenListingFromFeed(match.id);
      return;
    }
    setNavStack([]);
    setCurrentScreen("browseHub");
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
      if (currentScreen === "garageWinnerCheckout") {
        setCurrentScreen("garageShop");
        return stack;
      }
      if (currentScreen === "garageSaleRules") {
        setCurrentScreen(hasSeenGarageWorkflow() ? "openGarageSale" : "garageWorkflow");
        return stack;
      }
      if (currentScreen === "garageHostOffers") {
        setCurrentScreen("garageShop");
        return stack;
      }
      if (currentScreen === "snapSale") {
        setCurrentScreen("openGarageSale");
        return stack;
      }
      if (currentScreen === "garageWorkflow") {
        setCurrentScreen("openGarageSale");
        return stack;
      }
      if (currentScreen === "openGarageSale") {
        setCurrentScreen("yardSaleHub");
        return stack;
      }
      if (currentScreen === "yardSales") {
        setCurrentScreen("yardSaleHub");
        return stack;
      }
      if (currentScreen === "yardSaleHub") {
        setCurrentScreen("browseHub");
        return stack;
      }
      if (currentScreen === "home") {
        setCurrentScreen("browseHub");
        return stack;
      }
      if (currentScreen === "listItem" || currentScreen === "listingIntro") {
        const listingFallback = isYardSaleListingActive()
          ? "openGarageSale"
          : LISTING_BACK_FALLBACK[currentScreen];
        if (listingFallback) {
          setCurrentScreen(listingFallback);
        } else {
          setCurrentScreen("browseHub");
        }
        return stack;
      }
      if (isOnboardingScreen(currentScreen)) {
        const fallback = ONBOARDING_BACK_FALLBACK[currentScreen];
        if (fallback) {
          setCurrentScreen(fallback);
        } else {
          setCurrentScreen("browseHub");
        }
        return stack;
      }
      setCurrentScreen("browseHub");
      return stack;
    });
  }, [currentScreen]);

  useEffect(() => {
    if (!auth.configured) return;
    if (auth.loading) return;
    if (!auth.session) return;

    const token = auth.session.access_token;
    if (!token) return;
    if (handledSessionTokenRef.current === token) return;
    handledSessionTokenRef.current = token;

    const resumeAfterAuthCallback = () => {
      if (!consumeAuthCallbackResume()) return;
      markIntroDone();
      cleanupSplashGlobals();
      setNavStack([]);
      const restoredEditId = consumeEditingListingReturn();
      if (restoredEditId) {
        setEditingListingId(restoredEditId);
        setSelectedHostListingId(restoredEditId);
      }
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
  }, [auth.configured, auth.loading, auth.session, authGateOpen, finishAuthFlow, resolvePostAuthScreen]);

  const handleBackFromSubcategory = () => {
    handleBack();
  };

  const handlePost = () => {
    resetToHome();
  };

  const handleNavigate = (screen: string) => {
    if (screen.startsWith("itemDetail:")) {
      const id = screen.slice("itemDetail:".length).trim();
      if (!id) return;
      handleOpenListingFromFeed(id);
      return;
    }
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
      setGarageShopPreview(false);
      navigateTo("garageShop");
      return;
    }
    if (screen === "listItem" || screen === "startEarning") {
      navigateTo("listingIntro");
    }
  };

  const handleStartListing = (prefill?: ShelfPrefill) => {
    clearYardSaleListingActive();
    setListingPrefill(prefill ?? null);
    setEditingListingId(null);
    setEditingListingReturn(null);
    navigateTo("listingIntro");
  };

  const showBrandHeader =
    currentScreen !== "splash" &&
    !isOnboardingScreen(currentScreen) &&
    !HIDE_BRAND_HEADER_SCREENS.has(currentScreen);
  const showBottomNav = BOTTOM_NAV_SCREENS.has(currentScreen);

  if (!auth.configured) {
    return <SetupRequiredScreen />;
  }

  if (!isOnline) {
    return (
      <div className="app-shell">
        <div className="app-container bg-background">
          <OfflineScreen onRetry={() => setIsOnline(typeof navigator === "undefined" || navigator.onLine)} />
        </div>
      </div>
    );
  }

  return (
    <RequireAuthProvider requireAuth={requireAuth}>
    <div className="app-shell">
      <div
        className={`app-container bg-background ${showBrandHeader ? "app-container--with-brand" : ""} ${showBottomNav ? "app-container--with-bottom-nav" : ""}`}
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
            onEnterManually={handleEnterManualLocation}
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

        {currentScreen === "browseHub" && (
          <BrowseHubScreen
            onChoose={handleBrowseHubChoice}
            onEditLocation={openRentLocationSetup}
          />
        )}

        {currentScreen === "home" && (
          <HomeFeed
            onNavigate={handleNavigate}
            onOpenNotifications={handleOpenNotifications}
            onEditLocation={openRentLocationSetup}
            onPostRequest={(query) =>
              handlePostRequest(query?.trim() ? { category: "", query: query.trim() } : undefined)
            }
            onStockGarage={handleStartListing}
            onBrowseCategory={(label) =>
              handleCategorySelect(categoryIdFromName(label), label)
            }
            onRentals={handleOpenRentals}
            onBackToHub={openBrowseHub}
          />
        )}

        {currentScreen === "yardSaleHub" && (
          <YardSaleHubScreen
            onBack={openBrowseHub}
            onChoose={handleYardSaleHubChoice}
            onEditLocation={openRentLocationSetup}
          />
        )}

        {currentScreen === "openGarageSale" && (
          <OpenGarageSaleScreen
            onBack={openYardSaleHub}
            onAddSaleItems={handleStartYardSaleListing}
            onOpenMyGarage={handleOpenMyGarageShop}
            onViewSaleRules={handleOpenGarageSaleRules}
          />
        )}

        {currentScreen === "garageWorkflow" && (
          <GarageWorkflowScreen
            onBack={handleBack}
            onContinue={handleGarageWorkflowContinue}
          />
        )}

        {currentScreen === "garageSaleRules" && (
          <GarageSaleRulesScreen
            onBack={handleBack}
            onContinue={() => {
              const prev = navStack[navStack.length - 1];
              if (prev === "openGarageSale") handleBack();
              else handleGarageSaleRulesContinue();
            }}
          />
        )}

        {currentScreen === "snapSale" && (
          <SnapSaleScreen
            onBack={handleBack}
            onViewShop={handleOpenMyGarageShop}
          />
        )}

        {currentScreen === "yardSales" && (
          <YardSalesScreen
            onBack={openYardSaleHub}
            onEditLocation={openRentLocationSetup}
            onOpenGarage={handleOpenNeighborGarage}
          />
        )}

        {currentScreen === "mre" && <MrEvoriosScreen />}

        {currentScreen === "more" && (
          <MoreScreen
            onMrE={handleOpenMrE}
            onGarage={handleOpenGarage}
            onProfile={handleOpenProfile}
            onRentals={handleOpenRentals}
            onFavorites={handleOpenFavorites}
            onNotifications={handleOpenNotifications}
            onEarnBusiness={handleOpenBusiness}
            onOpenIntegrations={handleOpenIntegrations}
          />
        )}

        {currentScreen === "garage" && (
          <GarageScreen
            onNavigate={handleNavigate}
            onStockGarage={handleStartListing}
            onViewShop={handleOpenMyGarageShop}
            onViewProfile={handleViewPublicProfile}
            onOpenRental={(bookingId) => {
              setSelectedBookingId(bookingId);
              navigateTo("activeRental");
            }}
          />
        )}

        {currentScreen === "garageShop" && !selectedNeighborGarageHostId && (
          <GarageShopMissingScreen
            onBack={handleBack}
            onBrowseYardSales={() => {
              setNavStack([]);
              setCurrentScreen("yardSales");
            }}
          />
        )}

        {currentScreen === "garageShop" && selectedNeighborGarageHostId && (
          <ActiveGarageShopScreen
            hostId={selectedNeighborGarageHostId}
            preview={garageShopPreview}
            focusListingId={focusGarageItemId}
            onFocusListingHandled={() => setFocusGarageItemId(null)}
            onBack={handleBack}
            onOpenCart={handleOpenGarageCart}
            onOpenWinnerCheckout={handleOpenWinnerCheckout}
            onOpenHostOffers={
              selectedNeighborGarageHostId !== resolveHostAccountId(auth.userId)
                ? undefined
                : handleOpenHostOffers
            }
          />
        )}

        {currentScreen === "garageHostOffers" && (
          <GarageHostOffersScreen
            hostId={resolveHostAccountId(auth.userId)}
            onBack={handleBack}
          />
        )}

        {currentScreen === "garageWinnerCheckout" && winnerCheckoutListingId && (
          <GarageWinnerCheckoutScreen
            listingId={winnerCheckoutListingId}
            onBack={handleBack}
            onComplete={() => {
              setNavStack([]);
              setCurrentScreen("garageShop");
            }}
          />
        )}

        {currentScreen === "garageCart" && (
          <GarageCartScreen
            onBack={handleBack}
            onCheckoutComplete={() => {
              setNavStack([]);
              setCurrentScreen("garageShop");
            }}
          />
        )}

        {currentScreen === "rentals" && (
          <RentalsScreen
            onOpenRental={(bookingId) => {
              setSelectedBookingId(bookingId);
              navigateTo("activeRental");
            }}
            onViewProfile={handleViewPublicProfile}
            onReRent={handleReRent}
          />
        )}

        {currentScreen === "profile" && (
          <ProfileScreen
            onMrE={handleOpenMrE}
            onRentals={handleOpenRentals}
            onEditLocation={openRentLocationSetup}
            onOpenNotifications={handleOpenNotifications}
            onOpenIntegrations={handleOpenIntegrations}
            onDeleteAccount={() => navigateTo("deleteAccount")}
            onOpenCoHosts={() => navigateTo("coHosts")}
            onOpenPersonalInfo={handleOpenPersonalInfo}
            onOpenIdentity={() => navigateTo("identity")}
            onOpenAgentActivity={() => navigateTo("agentActivity")}
            onViewPublicProfile={handleViewPublicProfile}
          />
        )}

        {currentScreen === "publicProfile" && selectedPublicProfileUserId && (
          <PublicProfileScreen
            userId={selectedPublicProfileUserId}
            onBack={handleBack}
            onOpenListing={handleOpenListingFromFeed}
          />
        )}

        {currentScreen === "coHosts" && <CoHostsScreen onBack={handleBack} />}

        {currentScreen === "personalInfo" && (
          <PersonalInfoScreen
            initialEdit={personalInfoInitialEdit}
            onBack={() => {
              setPersonalInfoInitialEdit(undefined);
              handleBack();
            }}
          />
        )}

        {currentScreen === "favorites" && (
          <FavoritesScreen
            onHome={handleOpenHome}
            onOpenListing={(id) => handleOpenListingFromFeed(id)}
          />
        )}

        {currentScreen === "earnBusiness" && (
          <EarnBusinessScreen onHome={handleOpenHome} onRentals={handleOpenRentals} />
        )}

        {currentScreen === "integrationStatus" && (
          <IntegrationStatusScreen onBack={handleBack} />
        )}

        {currentScreen === "identity" && (
          <IdentityVerificationScreen onBack={handleBack} />
        )}

        {currentScreen === "agentActivity" && (
          <AgentActivityScreen onBack={handleBack} />
        )}

        {currentScreen === "notifications" && (
          <NotificationsScreen
            onBack={handleBack}
            mode={getAppMode()}
            onOpenRentals={handleOpenRentals}
            onOpenRental={(bookingId) => {
              setSelectedBookingId(bookingId);
              navigateTo("activeRental");
            }}
          />
        )}

        {currentScreen === "subcategory" && selectedCategory && (
          <Subcategory
            category={selectedCategory}
            appMode={getAppMode()}
            onBack={handleBackFromSubcategory}
            onPostRequest={handlePostRequest}
            onStartListing={handleStartListing}
            onItemSelect={handleItemSelect}
            onUnlock={() => requireAuth("generic")}
          />
        )}

        {currentScreen === "itemDetail" && selectedItemId && (
          <ItemDetail
            itemId={selectedItemId}
            onBack={handleBack}
            onBook={handleBook}
            onOpenAttachment={handleOpenAttachment}
            onViewHostProfile={handleViewPublicProfile}
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
            bookingId={selectedBookingId}
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
          <ActiveRental
            bookingId={selectedBookingId}
            onBack={handleBack}
            onViewProfile={handleViewPublicProfile}
          />
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
            editingListingId={editingListingId}
            onExit={() => {
              setListingPrefill(null);
              setEditingListingId(null);
              setEditingListingReturn(null);
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
              setEditingListingReturn(listingId);
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

        {showBottomNav ? (
          <BottomNav
            activeTab={bottomNavTabForScreen(currentScreen)}
            onHome={handleOpenHome}
            onMrE={handleOpenMrE}
            onAdd={handleStartListing}
            onGarage={handleOpenGarage}
            onMore={handleOpenMore}
          />
        ) : null}
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
