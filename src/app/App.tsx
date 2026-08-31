import { useState, useCallback, useEffect, useRef, startTransition } from "react";
import { formatGeolocationErrorMessage, resolveHomeLocation } from "../lib/geolocation";
import { AppBrandHeader } from "../components/AppBrandHeader";
import { OfflineScreen } from "./components/OfflineScreen";
import { GarageShopMissingScreen } from "./components/GarageShopMissingScreen";
import { SplashScreen } from "./components/SplashScreen";
import { InstallGateScreen } from "../screens/InstallGateScreen";
import { InstallHintToast } from "../components/InstallHintToast";
import { FirstHello } from "../screens/onboarding/FirstHello";
import { AuthWelcome } from "../screens/onboarding/AuthWelcome";
import { GuestShowcase } from "../screens/onboarding/GuestShowcase";
import { WhatIsEvorios } from "../screens/onboarding/WhatIsEvorios";
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
import { SellPathChoiceScreen } from "../screens/open-sale/SellPathChoiceScreen";
import { CreateOpenSaleScreen } from "../screens/open-sale/CreateOpenSaleScreen";
import { GarageHostOffersScreen } from "../screens/GarageHostOffersScreen";
import { HomeFeed } from "./components/HomeFeed";
import { Subcategory } from "./components/Subcategory";
import { ItemDetail } from "./components/ItemDetail";
import { BookingScreen } from "./components/BookingScreen";
import { BookingConfirmedScreen } from "./components/BookingConfirmedScreen";
import { PostRequest } from "./components/PostRequest";
import { RequestDetail } from "./components/RequestDetail";
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
import { HowEvoriosWorksScreen } from "../screens/HowEvoriosWorksScreen";
import { MessagesInboxScreen } from "../screens/MessagesInboxScreen";
import { ListingChatScreen } from "../screens/ListingChatScreen";
import { MrEvoriosScreen } from "../screens/MrEvoriosScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { EarnBusinessScreen } from "../screens/EarnBusinessScreen";
import { SetupRequiredScreen } from "../screens/SetupRequiredScreen";
import { RentLandingScreen } from "../screens/RentLandingScreen";
import { OpsConsoleScreen } from "../screens/ops/OpsConsoleScreen";
import { FeedbackScreen } from "../screens/FeedbackScreen";
import { parseRentPath } from "../lib/seo/parseRentPath";
import type { SeoCategory } from "../lib/seo/rentCategories";
import { formatSeoLocationLabel, type SeoLocation } from "../lib/seo/seoLocations";
import { APP_ORIGIN, isSeoApexHost } from "../lib/brand";
import { isOpsPath } from "../lib/ops/opsAuth";
import { ConnectOnboardingHost } from "../components/ConnectOnboardingHost";
import { BirthdayGreetingHost } from "../components/BirthdayGreetingHost";
import { PwaInstallProvider } from "../hooks/PwaInstallProvider";
import { useBrowserBackTrap } from "../hooks/useBrowserBackTrap";
import { PwaUpdateProvider } from "../hooks/PwaUpdateProvider";
import { AuthProvider, useAuth } from "../hooks/AuthProvider";
import { RequireAuthProvider } from "../hooks/RequireAuth";
import { PageTranslateBridge } from "../components/PageTranslateBridge";
import {
  consumeAuthReturn,
  clearPendingAuthEmail,
  peekPendingAuthEmail,
  setAuthIntent,
  setAuthReturn,
  setEditingListingReturn,
  consumeEditingListingReturn,
  peekEditingListingReturn,
  peekBootListingIdFromUrl,
  type AuthIntent,
} from "../lib/authReturn";
import { markGoPublicPending } from "../lib/sellerGoPublic";
import { getAppMode, setAppMode, type AppMode } from "../lib/appMode";
import {
  completeOnboarding,
  hasRoleChoice,
  hasProductIntro,
  isOnboardingComplete,
  markIntroDone,
  markProductIntroDone,
  markRoleChosen,
  resolveOnboardingResumeScreen,
  hasAuthWelcomeDone,
  markAuthWelcomeDone,
  clearAuthWelcomeDone,
  hasGuestShowcaseDone,
  markGuestShowcaseDone,
} from "../lib/onboardingStorage";
import {
  getPublishedListingById,
  getActiveRentLocationLabel,
  hasRentLocationSetup,
  loadPublishedListings,
  setTripDestination,
} from "../lib/listingStorage";
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
import {
  markInstallGateDone,
  markInstallHintSeen,
  shouldShowInstallGate,
  shouldShowInstallHint,
} from "../lib/pwaInstallGate";
import { isStandalonePwa } from "../lib/pwaInstall";
import {
  consumeAuthCallbackResume,
  consumeLastOauthProvider,
  shouldPromptEnablePasskey,
  shouldShowPasskeyLogin,
  signInWithPasskey,
  userHasPasskey,
} from "../lib/auth";
import { AuthGate, type AuthGateMode } from "../components/AuthGate";
import { PasskeySetup } from "../components/PasskeySetup";
import { DeleteAccountScreen } from "../screens/profile/DeleteAccount";
import { CoHostsScreen } from "../screens/profile/CoHostsScreen";
import { PersonalInfoScreen } from "../screens/profile/PersonalInfoScreen";
import { IdentityVerificationScreen } from "../screens/IdentityVerificationScreen";
import { AgentActivityScreen } from "../screens/AgentActivityScreen";
import { ActivityScreen } from "../screens/ActivityScreen";
import { BottomNav, type BottomNavTab } from "./components/BottomNav";
import { removeStripeControllerIframes } from "../lib/stripeCleanup";
import { onConnectOnboardingDone, emitConnectOnboardingDone } from "../lib/connectOnboardingBus";
import { captureConnectReturnFromUrl, peekConnectReturn } from "../lib/connectReturn";
import { syncConnectAccountStatus } from "../lib/stripePayments";
import {
  clearYardSaleListingActive,
  isYardSaleListingActive,
} from "../lib/yardSaleListing";
import { hasSeenGarageWorkflow } from "../lib/garageWorkflowStorage";
import { hasSeenGarageSaleRules } from "../lib/garageSaleRulesStorage";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { loadUserProfile, syncUserProfileFromAuth } from "../lib/userProfileStorage";
import {
  saveHomeFeedLens,
  saveHomeFeedMode,
  saveHomeFeedQuery,
  saveHomeFeedCategory,
} from "../lib/homeFeedStorage";
import { hideNativeSplash } from "../lib/nativeShell";

type BrowseHubChoice = "findGear" | "yardSales";
type YardSaleHubChoice = "browse" | "host";

type Screen =
  | "splash"
  | "installGate"
  | "installHint"
  | "authWelcome"
  | "guestShowcase"
  | "firstHello"
  | "whatIsEvorios"
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
  | "sellPathChoice"
  | "createOpenSale"
  | "garageHostOffers"
  | "home"
  | "yardSales"
  | "mre"
  | "garage"
  | "more"
  | "activity"
  | "howEvoriosWorks"
  | "messages"
  | "listingChat"
  | "neighborGarage"
  | "garageShop"
  | "garageCart"
  | "garageWinnerCheckout"
  | "notifications"
  | "subcategory"
  | "itemDetail"
  | "requestDetail"
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
  | "identity"
  | "agentActivity"
  | "deleteAccount"
  | "coHosts"
  | "personalInfo"
  | "publicProfile"
  | "rentLanding"
  | "ops"
  | "feedback";

const HIDE_BRAND_HEADER_SCREENS = new Set<Screen>([
  "browseHub",
  "yardSaleHub",
  "openGarageSale",
  "snapSale",
  "garageWorkflow",
  "garageSaleRules",
  "sellPathChoice",
  "createOpenSale",
  "home",
  "garageShop",
  "garageCart",
  "garageWinnerCheckout",
  "rentLanding",
  "ops",
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
  "activity",
  "rentals",
  "profile",
  "favorites",
  "earnBusiness",
  "messages",
  "notifications",
  "howEvoriosWorks",
  "feedback",
  "subcategory",
]);

const TAB_BOOT_SCREENS: Partial<Record<string, Screen>> = {
  home: "home",
  browseHub: "browseHub",
  yardSaleHub: "yardSaleHub",
  yardSales: "yardSales",
  garageShop: "garageShop",
  garageCart: "garageCart",
  openGarageSale: "openGarageSale",
  snapSale: "snapSale",
  mre: "mre",
  garage: "garage",
  more: "more",
  activity: "activity",
  profile: "profile",
  rentals: "rentals",
  favorites: "favorites",
  notifications: "notifications",
  messages: "messages",
  login: "home",
  signup: "home",
};

/** Explicit ?screen= deep links for QA and return URLs (skips unfinished onboarding). */
const BOOT_SCREEN_ALIASES: Partial<Record<string, Screen>> = {
  ...TAB_BOOT_SCREENS,
  listItem: "listItem",
  identity: "identity",
  coHosts: "coHosts",
  /** Stripe Connect return from Account settings */
  personalInfo: "personalInfo",
  postRequest: "postRequest",
  activeRental: "activeRental",
  listingChat: "listingChat",
  messages: "messages",
  "verification-phone": "home",
  "verification-code": "home",
  "reset-password": "home",
  "create-new-password": "home",
  "like-to-do-rent": "home",
  "like-to-do-list": "home",
  rental: "rentals",
  "earning-your-stuff": "earnBusiness",
  ops: "ops",
  admin: "ops",
  feedback: "feedback",
};

function resolveBootScreenParam(raw: string | null): Screen | null {
  if (!raw) return null;
  const key = raw.trim();
  return BOOT_SCREEN_ALIASES[key] ?? null;
}

function bottomNavTabForScreen(screen: Screen): BottomNavTab {
  // Home tab covers Browse + My Garage (role switcher).
  if (
    screen === "garage" ||
    screen === "browseHub" ||
    screen === "home" ||
    screen === "yardSaleHub" ||
    screen === "yardSales" ||
    screen === "openGarageSale" ||
    screen === "earnBusiness"
  ) {
    return "home";
  }
  if (screen === "mre") return "mre";
  if (
    screen === "activity" ||
    screen === "rentals" ||
    screen === "favorites" ||
    screen === "messages" ||
    screen === "notifications"
  ) {
    return "activity";
  }
  if (
    screen === "more" ||
    screen === "profile" ||
    screen === "personalInfo" ||
    screen === "howEvoriosWorks" ||
    screen === "feedback"
  ) {
    return "more";
  }
  return "none";
}

function screenToAuthIntent(screen: Screen): AuthIntent {
  if (
    screen === "listingIntro" ||
    screen === "listItem" ||
    screen === "hostListingDetail" ||
    screen === "snapSale"
  ) {
    return "list";
  }
  if (screen === "booking" || screen === "activeRental") return "book";
  if (screen === "postRequest") return "message";
  return "generic";
}

/** When nav stack is empty, in-app Back still returns to the prior onboarding step. */
const ONBOARDING_BACK_FALLBACK: Partial<Record<Screen, Screen>> = {
  authWelcome: "splash",
  guestShowcase: "authWelcome",
  firstHello: "authWelcome",
  installHint: "firstHello",
  whatIsEvorios: "firstHello",
  whatDoYouWant: "whatIsEvorios",
  whereAreYou: "whatDoYouWant",
  whereAreYouManual: "whereAreYou",
  whereAreYouHeading: "whereAreYou",
  onboardingAllSet: "whereAreYou",
  installGate: "splash",
};

/** Listing flow only — used when the nav stack is empty (not onboarding fallbacks). */
const LISTING_BACK_FALLBACK: Partial<Record<Screen, Screen>> = {
  // Hosts who opened the wizard should land in My Garage, not listing intro / browse.
  listItem: "garage",
  listingIntro: "garage",
};

/**
 * Post-onboarding land. Still Garage (host storefront) so new hosts land in their
 * shop; the Home tab opens the neighbor browse feed separately.
 */
const PRIMARY_LAND_SCREEN: Screen = "garage";

function landAfterOnboarding(): Screen {
  return PRIMARY_LAND_SCREEN;
}

function isOnboardingScreen(screen: Screen): boolean {
  return (
    screen in ONBOARDING_BACK_FALLBACK ||
    screen === "authWelcome" ||
    screen === "guestShowcase" ||
    screen === "firstHello" ||
    screen === "installHint" ||
    screen === "onboardingAllSet" ||
    screen === "installGate"
  );
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

function readBootRentLanding(): {
  active: boolean;
  category: SeoCategory | null;
  location: SeoLocation | null;
} {
  if (typeof window === "undefined") {
    return { active: false, category: null, location: null };
  }
  const parsed = parseRentPath(window.location.pathname);
  if (!parsed || parsed.kind === "invalid") {
    return { active: Boolean(parsed), category: null, location: null };
  }
  return {
    active: true,
    category: parsed.category,
    location: parsed.location,
  };
}

function readBootOps(): boolean {
  if (typeof window === "undefined") return false;
  if (isOpsPath(window.location.pathname)) return true;
  const screen = new URLSearchParams(window.location.search).get("screen");
  return screen === "ops" || screen === "admin";
}

function readBootQuery() {
  if (typeof window === "undefined") {
    return {
      skipSplash: false,
      openNotifications: false,
      simulateUpdate: false,
      screen: null as string | null,
      splashArtOnly: false,
      splashDynamicPreview: false,
      rentalId: null as string | null,
      chat: false,
      listingChatListingId: null as string | null,
      listingChatPeerId: null as string | null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const screen = params.get("screen");
  // When returning from OAuth callback, skip splash immediately (prevents a visible flash).
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
    rentalId: params.get("rentalId")?.trim() || null,
    chat: params.get("chat") === "1",
    listingChatListingId: params.get("listingId")?.trim() || null,
    listingChatPeerId: params.get("peerId")?.trim() || null,
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
  root.classList.remove("splash-v2-active", "splash-v2-light");
}

function resolvePostSplashScreen(): Screen {
  if (shouldShowInstallGate()) return "installGate";
  if (!hasAuthWelcomeDone()) return "authWelcome";
  // Guest marketing tour in progress (Sign in / Sign up mark onboarding complete and skip this).
  if (!hasGuestShowcaseDone() && !isOnboardingComplete()) return "guestShowcase";
  const resume = resolveOnboardingResumeScreen();
  // Returning users → Home. Incomplete legacy onboarding → resume that step.
  if (resume === "home") return "home";
  return resume;
}

/**
 * Guest path: platform benefits showcase, then Sign up CTA (or browse Home).
 */
function resolveGuestExplorePath(): Screen {
  if (!hasGuestShowcaseDone() && !isOnboardingComplete()) return "guestShowcase";
  return "home";
}

/** Screens the user was mid-flow on — never yank them back into role/location onboarding. */
const AUTH_RESUME_PRESERVE = new Set<Screen>([
  "booking",
  "listItem",
  "hostListingDetail",
  "activeRental",
  "itemDetail",
  "requestDetail",
  "postRequest",
  "snapSale",
  "garageShop",
  "garageCart",
  "profile",
  "identity",
  "coHosts",
]);

/** After sign-in, finish onboarding unless they were already in a transaction/listing flow. */
function resolveScreenAfterAuth(storedTarget: Screen | null): Screen {
  if (storedTarget && AUTH_RESUME_PRESERVE.has(storedTarget)) {
    return storedTarget;
  }
  // Existing-account Sign in asks for Home — never replay the guest soft-tour.
  if (storedTarget === "home") {
    return "home";
  }
  if (!isOnboardingComplete()) {
    const resume = resolveOnboardingResumeScreen();
    if (resume !== "home") return resume;
    if (getAppMode() === "rent" && !hasRentLocationSetup()) {
      return "whereAreYou";
    }
  }
  // Returning signed-in users land on Home (browse). Garage stays for host flows.
  if (
    storedTarget &&
    storedTarget !== "authWelcome" &&
    storedTarget !== "splash" &&
    storedTarget !== "guestShowcase"
  ) {
    return storedTarget;
  }
  return "home";
}

function bootScreenForDeepLink(target: DeepLinkTarget | null): Screen | null {
  if (!target) return null;
  if (target.kind === "garage") return "garageShop";
  if (target.kind === "request") return "requestDetail";
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
  const bootRent = useRef(readBootRentLanding()).current;
  const bootOps = useRef(readBootOps()).current;
  const handledSessionTokenRef = useRef<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (bootOps) {
      markIntroDone();
      completeOnboarding();
      return "ops";
    }
    if (bootRent.active && bootRent.category) {
      markIntroDone();
      completeOnboarding();
      return "rentLanding";
    }
    // Invalid /rent/... path — fall through to normal app rather than trapping.
    if (boot.screen === "splash") return "splash";

    // After Stripe Account Link: land in Account settings to confirm bank status
    // (list/snap flows keep their resume screen so drafts aren't lost).
    const connectReturn = captureConnectReturnFromUrl();
    if (connectReturn) {
      markIntroDone();
      completeOnboarding();
      const resume = resolveBootScreenParam(boot.screen);
      if (resume === "listItem" || resume === "snapSale") return resume;
      return "personalInfo";
    }

    const bootScreen = resolveBootScreenParam(boot.screen);
    // Explicit screen= wins over listingId deep links (Stripe Connect return URLs).
    if (bootScreen) {
      markIntroDone();
      completeOnboarding();
      return bootScreen;
    }
    const deepScreen = bootScreenForDeepLink(bootDeepLink.target);
    // Intentional skip only (share/deep links, OAuth). Do NOT skip branded splash
    // just because the user finished intro on a prior launch — cold start must show it.
    if (deepScreen && (boot.skipSplash || bootDeepLink.skipSplash)) {
      markIntroDone();
      completeOnboarding();
      return deepScreen;
    }
    if (boot.skipSplash) {
      if (boot.openNotifications || boot.simulateUpdate) {
        markIntroDone();
        completeOnboarding();
        return "home";
      }
      return resolvePostSplashScreen();
    }
    return "splash";
  });
  const [rentLandingCategory, setRentLandingCategory] = useState<SeoCategory | null>(
    () => bootRent.category,
  );
  const [rentLandingLocation, setRentLandingLocation] = useState<SeoLocation | null>(
    () => bootRent.location,
  );
  const [navStack, setNavStack] = useState<Screen[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() =>
    bootDeepLink.target?.kind === "listing" ? bootDeepLink.target.listingId : null,
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(() =>
    bootDeepLink.target?.kind === "request" ? bootDeepLink.target.requestId : null,
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(() => boot.rentalId);
  const [activeRentalChatOpen, setActiveRentalChatOpen] = useState(() => Boolean(boot.rentalId && boot.chat));
  const [listingChatListingId, setListingChatListingId] = useState<string | null>(() =>
    boot.screen === "listingChat" ? boot.listingChatListingId : null,
  );
  const [listingChatPeerId, setListingChatPeerId] = useState<string | null>(() =>
    boot.screen === "listingChat" ? boot.listingChatPeerId : null,
  );
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
  const [selectedCategory] = useState<string | null>(null);
  const [listingPrefill, setListingPrefill] = useState<ShelfPrefill | null>(null);
  const [openSalePrefillListingIds, setOpenSalePrefillListingIds] = useState<string[]>([]);
  const [sellPathListingId, setSellPathListingId] = useState<string | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(() => {
    // Stripe / go-public return must resolve listingId on first paint — waiting for
    // useEffect remounts the wizard on category with an empty draft.
    const fromUrl = peekBootListingIdFromUrl();
    if (fromUrl) {
      setEditingListingReturn(fromUrl);
      return fromUrl;
    }
    return peekEditingListingReturn();
  });
  const [postRequestPrefill, setPostRequestPrefill] = useState<ShelfPrefill | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentTitle, setAttachmentTitle] = useState<string | null>(null);
  const [postAuthTarget, setPostAuthTarget] = useState<Screen | null>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateMode, setAuthGateMode] = useState<AuthGateMode>("auto");
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

  // Deep links / OAuth skip React splash — still dismiss native launch splash.
  useEffect(() => {
    if (currentScreen !== "splash") {
      void hideNativeSplash();
    }
  }, [currentScreen]);

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
    } else if (bootDeepLink.target.kind === "request") {
      setSelectedRequestId(bootDeepLink.target.requestId);
      setNavStack([]);
      setCurrentScreen("requestDetail");
    } else {
      setSelectedItemId(bootDeepLink.target.listingId);
      setNavStack([]);
      setCurrentScreen("itemDetail");
    }
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (/^\/item\/[^/]+\/?$/i.test(path) || /^\/r\/[^/]+\/?$/i.test(path)) {
        const params = new URLSearchParams(window.location.search);
        const next = `/${params.toString() ? `?${params}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", next);
      }
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
    if (screen === "agent-activity") {
      // Agent activity is internal-only — do not surface via deep link.
      clearBootQuery(["screen"]);
      return;
    }
    if (screen === "listItem") {
      const params = new URLSearchParams(window.location.search);
      const listingId = params.get("listingId")?.trim() || "";
      const seoCategory = params.get("seoCategory")?.trim() || "";
      const seoCity = params.get("seoCity")?.trim() || "";
      markIntroDone();
      completeOnboarding();
      if (seoCity) setTripDestination(seoCity);
      setListingPrefill(seoCategory ? { category: seoCategory, city: seoCity || undefined } : null);
      if (listingId) {
        setEditingListingId(listingId);
        setEditingListingReturn(listingId);
      } else {
        setEditingListingId(null);
        setEditingListingReturn(null);
      }
      setNavStack([]);
      // SEO apex CTAs land on listing intro when starting a new garage stock.
      setCurrentScreen(listingId ? "listItem" : "listingIntro");
      clearBootQuery([
        "screen",
        "listingId",
        "skipSplash",
        "connect",
        "seoCategory",
        "seoCity",
        "skipInstall",
      ]);
      return;
    }
    const resolved = resolveBootScreenParam(screen);
    if (resolved) {
      markIntroDone();
      completeOnboarding();
      setNavStack([]);
      setCurrentScreen(resolved);
      clearBootQuery(["screen", "skipSplash", "connect", "listingId", "rentalId", "chat", "peerId"]);
    }
  }, [boot.screen]);

  useEffect(() => {
    if (!boot.openNotifications) return;
    if (currentScreen !== "browseHub" && currentScreen !== "home" && currentScreen !== "notifications") return;
    setNavStack([]);
    setCurrentScreen("notifications");
    clearBootQuery(["openNotifications", "skipSplash", "simulateUpdate"]);
  }, [boot.openNotifications, currentScreen]);

  /** After Connect payouts sheet closes, land on the requested screen (default: garage). */
  useEffect(() => {
    return onConnectOnboardingDone((detail) => {
      const raw = detail?.screen?.trim();
      if (!raw) return;
      const allowed: Screen[] = [
        "garage",
        "personalInfo",
        "profile",
        "more",
        "listItem",
        "snapSale",
        "earnBusiness",
      ];
      if (!allowed.includes(raw as Screen)) return;
      startTransition(() => {
        setNavStack([]);
        setCurrentScreen(raw as Screen);
      });
    });
  }, []);

  /** Stripe Account Link return: sync status, celebrate in settings, clean URL. */
  useEffect(() => {
    const flag = captureConnectReturnFromUrl() ?? peekConnectReturn();
    if (!flag) return;

    markIntroDone();
    completeOnboarding();

    const params = new URLSearchParams(window.location.search);
    const resume = resolveBootScreenParam(params.get("screen"));
    const land: Screen =
      resume === "listItem" || resume === "snapSale" ? resume : "personalInfo";

    startTransition(() => {
      setNavStack([]);
      setCurrentScreen(land);
    });

    let cancelled = false;
    void (async () => {
      await syncConnectAccountStatus().catch(() => null);
      if (cancelled) return;
      emitConnectOnboardingDone({
        screen: land,
        outcome: flag === "done" ? "done" : "refresh",
      });
      clearBootQuery(["screen", "skipSplash", "connect", "listingId"]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const finishOnboardingToHome = useCallback(() => {
    completeOnboarding();
    setAppMode("earn");
    setNavStack([]);
    setCurrentScreen(landAfterOnboarding());
  }, []);

  /** Push the screen we are leaving, then open the next screen (avoids stale currentScreen in the stack). */
  const showAuthGate = useCallback((
    target: Screen,
    intentOverride?: AuthIntent,
    mode: AuthGateMode = "auto",
  ) => {
    const intent = intentOverride ?? screenToAuthIntent(target);
    setPostAuthTarget(target);
    setAuthReturn(target);
    setAuthIntent(intent);
    setAuthIntentState(intent);
    setAuthGateMode(mode);
    setAuthGateOpen(true);
  }, []);

  const navigateTo = useCallback((screen: Screen) => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }

    // Listing draft is allowed without sign-in; AuthGate runs on “Go public”.
    const authRequired =
      screen === "booking" ||
      screen === "postRequest" ||
      screen === "hostListingDetail" ||
      screen === "activeRental" ||
      screen === "listingChat" ||
      screen === "identity" ||
      screen === "agentActivity" ||
      screen === "personalInfo" ||
      screen === "coHosts" ||
      screen === "deleteAccount";

    if (authRequired && auth.configured && !auth.session) {
      showAuthGate(screen);
      return;
    }

    setCurrentScreen((from) => {
      setNavStack((stack) => [...stack, from]);
      return screen;
    });
  }, [auth.configured, auth.session, showAuthGate]);

  const finishLocationSetup = useCallback(() => {
    setHomeLocationError(null);
    setNavStack((stack) => {
      const previous = stack.length > 0 ? stack[stack.length - 1]! : null;
      if (previous && !isOnboardingScreen(previous)) {
        if (!isOnboardingComplete()) completeOnboarding();
        setCurrentScreen(previous);
        return stack.slice(0, -1);
      }
      if (!isOnboardingComplete()) {
        setCurrentScreen("onboardingAllSet");
        return [];
      }
      completeOnboarding();
      setCurrentScreen(landAfterOnboarding());
      return [];
    });
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
      "requestDetail",
      "identity",
      "agentActivity",
      "coHosts",
      "publicProfile",
      "snapSale",
      "garageSaleRules",
      "garageCart",
      "garageShop",
      "garageWinnerCheckout",
    ];
    const storedTarget =
      candidate && validScreens.includes(candidate)
        ? candidate
        : landAfterOnboarding();
    return resolveScreenAfterAuth(storedTarget);
  }, [postAuthTarget]);

  const finishAuthFlow = useCallback(() => {
    setAuthGateOpen(false);
    clearPendingAuthEmail();
    markAuthWelcomeDone();
    markGuestShowcaseDone();
    // Sign in / Sign up → skip guest marketing tour permanently on this device.
    if (authGateMode === "signIn" || authGateMode === "signUp") {
      completeOnboarding();
    }
    const restoredEditId = peekEditingListingReturn();
    if (restoredEditId) {
      setEditingListingId(restoredEditId);
      setSelectedHostListingId(restoredEditId);
    }
    const target =
      authGateMode === "signIn" || authGateMode === "signUp"
        ? resolveScreenAfterAuth(
            postAuthTarget && AUTH_RESUME_PRESERVE.has(postAuthTarget)
              ? postAuthTarget
              : postAuthTarget &&
                  postAuthTarget !== "authWelcome" &&
                  postAuthTarget !== "splash" &&
                  postAuthTarget !== "guestShowcase"
                ? postAuthTarget
                : "home",
          )
        : resolvePostAuthScreen();
    setNavStack([]);
    setCurrentScreen(target);
    setPostAuthTarget(null);
  }, [authGateMode, postAuthTarget, resolvePostAuthScreen]);

  useEffect(() => {
    if (currentScreen !== "authWelcome") return;
    if (auth.loading) return;
    if (!auth.session) return;
    // Already signed in on the welcome sheet → Home, not guest tour.
    markAuthWelcomeDone();
    markGuestShowcaseDone();
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("home");
  }, [currentScreen, auth.loading, auth.session]);

  const resetToHome = () => {
    setNavStack([]);
    setCurrentScreen(landAfterOnboarding());
  };

  const openHomeFeed = useCallback(() => {
    setNavStack([]);
    setCurrentScreen("home");
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

  const handleOpenHome = useCallback(() => {
    if (getAppMode() === "earn") {
      goToTab("garage");
      return;
    }
    setAppMode("rent");
    goToTab("home");
  }, [goToTab]);
  const handleOpenMrE = useCallback(() => goToTab("mre"), [goToTab]);
  const handleOpenGarage = useCallback(() => {
    setAppMode("earn");
    goToTab("garage");
  }, [goToTab]);
  const handleOpenMore = useCallback(() => goToTab("more"), [goToTab]);
  const handleOpenActivity = useCallback(() => goToTab("activity"), [goToTab]);
  const handleSignedOut = useCallback(() => {
    // Back to the post-splash welcome: Sign in / Sign up / Continue as guest.
    clearAuthWelcomeDone();
    setNavStack([]);
    setCurrentScreen("authWelcome");
  }, []);
  const handleSignIn = useCallback(() => {
    // Explicit Sign in → Face ID / account sheet, not a leftover OTP step.
    clearPendingAuthEmail();
    showAuthGate("more", "generic", "signIn");
  }, [showAuthGate]);
  const handleOpenRentals = useCallback(() => navigateTo("rentals"), [navigateTo]);
  const handleOpenMessages = useCallback(() => navigateTo("messages"), [navigateTo]);
  const handleOpenRentalChat = useCallback(
    (bookingId: string) => {
      setSelectedBookingId(bookingId);
      setActiveRentalChatOpen(true);
      navigateTo("activeRental");
    },
    [navigateTo],
  );
  const handleOpenListingChat = useCallback(
    (listingId: string, peerId: string) => {
      setListingChatListingId(listingId);
      setListingChatPeerId(peerId);
      navigateTo("listingChat");
    },
    [navigateTo],
  );
  const handleOpenProfile = useCallback(() => {
    if (auth.configured && !auth.loading && !auth.session) {
      showAuthGate("profile");
      return;
    }
    goToTab("profile");
  }, [auth.configured, auth.loading, auth.session, goToTab, showAuthGate]);
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
          showAuthGate("publicProfile");
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
  const handleOpenFavorites = useCallback(() => navigateTo("favorites"), [navigateTo]);
  const handleOpenBusiness = useCallback(() => navigateTo("earnBusiness"), [navigateTo]);

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
        saveHomeFeedCategory(null);
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

  const handlePreviewMyGarageShop = useCallback(
    (listingId?: string | null) => {
      const hostId = resolveHostAccountId(auth.userId);
      // Leave the publish wizard completely — Back must not remount an empty category step.
      setEditingListingId(null);
      setEditingListingReturn(null);
      setListingPrefill(null);
      setSelectedNeighborGarageHostId(hostId);
      // Guard: onClick may pass a MouseEvent if wired as onClick={handler}.
      const focusId = typeof listingId === "string" ? listingId.trim() || null : null;
      setFocusGarageItemId(focusId);
      setGarageShopPreview(true);
      setNavStack([]);
      setCurrentScreen("garageShop");
    },
    [auth.userId],
  );

  const handleOpenListingFromGarageShop = useCallback(
    (listingId: string) => {
      // Neighbor preview must open public ItemDetail, not host manage screen.
      if (garageShopPreview) {
        setSelectedItemId(listingId);
        navigateTo("itemDetail");
        return;
      }
      const listing = getPublishedListingById(listingId);
      if (listing && canManageListing(listing, auth.userId, auth.userEmail)) {
        setSelectedHostListingId(listingId);
        navigateTo("hostListingDetail");
        return;
      }
      setSelectedItemId(listingId);
      navigateTo("itemDetail");
    },
    [auth.userEmail, auth.userId, garageShopPreview, navigateTo],
  );

  const handleOpenGarageCart = useCallback(() => {
    navigateTo("garageCart");
  }, [navigateTo]);

  const handleOpenGarageShopForListing = useCallback(
    (hostId: string, listingId: string) => {
      setSelectedNeighborGarageHostId(hostId);
      setFocusGarageItemId(listingId);
      setGarageShopPreview(false);
      navigateTo("garageShop");
    },
    [navigateTo],
  );

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

  const skipOnboarding = useCallback(() => {
    cleanupSplashGlobals();

    if (currentScreen === "firstHello") {
      markIntroDone();
      setNavStack([]);
      if (shouldShowInstallHint()) {
        setCurrentScreen("installHint");
        return;
      }
      setCurrentScreen(
        isOnboardingComplete()
          ? landAfterOnboarding()
          : hasProductIntro()
            ? hasRoleChoice()
              ? "whereAreYou"
              : "whatDoYouWant"
            : "whatIsEvorios",
      );
      return;
    }

    if (currentScreen === "installHint") {
      markInstallHintSeen();
      setNavStack([]);
      setCurrentScreen(
        isOnboardingComplete()
          ? landAfterOnboarding()
          : hasProductIntro()
            ? hasRoleChoice()
              ? "whereAreYou"
              : "whatDoYouWant"
            : "whatIsEvorios",
      );
      return;
    }

    if (currentScreen === "whatIsEvorios") {
      markProductIntroDone();
      setNavStack([]);
      setCurrentScreen(isOnboardingComplete() ? landAfterOnboarding() : hasRoleChoice() ? "whereAreYou" : "whatDoYouWant");
      return;
    }

    if (currentScreen === "whatDoYouWant") {
      markIntroDone();
      markProductIntroDone();
      markRoleChosen();
      setNavStack([]);
      setCurrentScreen(isOnboardingComplete() ? landAfterOnboarding() : "whereAreYou");
      return;
    }

    markIntroDone();

    if (
      currentScreen === "whereAreYou" ||
      currentScreen === "whereAreYouManual" ||
      currentScreen === "whereAreYouHeading"
    ) {
      completeOnboarding();
      setAppMode("earn");
      setNavStack([]);
      setCurrentScreen(landAfterOnboarding());
      return;
    }

    setAppMode("earn");
    setNavStack([]);
    setCurrentScreen(landAfterOnboarding());
  }, [currentScreen, navigateTo]);

  const handleSplashContinue = useCallback(() => {
    cleanupSplashGlobals();
    setNavStack([]);
    setCurrentScreen(resolvePostSplashScreen());
  }, []);

  const continueFromAuthWelcome = useCallback(() => {
    // Guest: platform benefits showcase, then Sign up (or browse).
    markAuthWelcomeDone();
    setNavStack([]);
    setCurrentScreen(resolveGuestExplorePath());
  }, []);

  const handleAuthWelcomeSignIn = useCallback(() => {
    clearPendingAuthEmail();
    // Existing account → Face ID / quick login first; land on Home (no guest tour).
    if (shouldShowPasskeyLogin()) {
      const email = loadUserProfile().email?.trim() || undefined;
      void signInWithPasskey(email).catch(() => {
        showAuthGate("home", "generic", "signIn");
      });
      return;
    }
    showAuthGate("home", "generic", "signIn");
  }, [showAuthGate]);

  const handleAuthWelcomeSignUp = useCallback(() => {
    clearPendingAuthEmail();
    // Already chose Sign up — skip marketing; land on Home after account create.
    showAuthGate("home", "generic", "signUp");
  }, [showAuthGate]);

  const handleGuestShowcaseSignUp = useCallback(() => {
    markGuestShowcaseDone();
    clearPendingAuthEmail();
    showAuthGate("home", "generic", "signUp");
  }, [showAuthGate]);

  const handleGuestShowcaseBrowse = useCallback(() => {
    markGuestShowcaseDone();
    completeOnboarding();
    setNavStack([]);
    setCurrentScreen("home");
  }, []);

  const handleInstallGateInstalled = useCallback(() => {
    markInstallGateDone();
    setNavStack([]);
    // Gate is done — resolve again without re-entering installGate.
    setCurrentScreen(resolvePostSplashScreen());
  }, []);

  const continueAfterHello = useCallback(() => {
    if (isOnboardingComplete()) {
      setNavStack([]);
      setCurrentScreen(landAfterOnboarding());
      return;
    }
    if (!hasProductIntro()) {
      navigateTo("whatIsEvorios");
      return;
    }
    if (!hasRoleChoice()) {
      navigateTo("whatDoYouWant");
      return;
    }
    navigateTo("whereAreYou");
  }, [navigateTo]);

  const handleContinueFromHello = () => {
    markIntroDone();
    if (shouldShowInstallHint()) {
      navigateTo("installHint");
      return;
    }
    continueAfterHello();
  };

  const handleInstallHintDone = useCallback(() => {
    continueAfterHello();
  }, [continueAfterHello]);

  const handleContinueFromProductIntro = () => {
    markProductIntroDone();
    if (isOnboardingComplete()) {
      setNavStack([]);
      setCurrentScreen(landAfterOnboarding());
      return;
    }
    if (!hasRoleChoice()) {
      navigateTo("whatDoYouWant");
      return;
    }
    navigateTo("whereAreYou");
  };

  const handleEarn = () => {
    markRoleChosen();
    setAppMode("earn");
    completeOnboarding();
    // Open My Garage dashboard — listing creation stays on Stock (+), not role choice.
    setNavStack([]);
    setCurrentScreen("garage");
  };

  const handleSave = () => {
    markRoleChosen();
    setAppMode("rent");
    navigateTo("whereAreYou");
  };

  const handlePreferredModeChange = useCallback(
    (mode: AppMode) => {
      setAppMode(mode);
      if (mode === "earn") {
        goToTab("garage");
        return;
      }
      // Browse mode → neighbor feed (same destination as the Home / Browse tab).
      goToTab("home");
    },
    [goToTab],
  );

  const handleAtHome = useCallback(async () => {
    setHomeLocationError(null);
    setIsLocatingHome(true);
    try {
      const result = await resolveHomeLocation();
      if (result.ok) {
        finishLocationSetup();
      } else {
        setHomeLocationError(formatGeolocationErrorMessage(result.reason));
        navigateTo("whereAreYouManual");
      }
    } finally {
      setIsLocatingHome(false);
    }
  }, [finishLocationSetup, navigateTo]);

  const handleManualLocationContinue = () => {
    finishLocationSetup();
  };

  const handleTraveling = () => {
    navigateTo("whereAreYouHeading");
  };

  const handleDestinationContinue = () => {
    finishLocationSetup();
  };

  const handleListingIntroStart = () => {
    setEditingListingId(null);
    navigateTo("listItem");
  };

  const handleListingIntroSkip = () => {
    setEditingListingId(null);
    navigateTo("listItem");
  };

  const handleListingWizardExit = (reason: "finished" | "discarded" = "finished") => {
    const yardSaleActive = isYardSaleListingActive();
    clearYardSaleListingActive();
    setListingPrefill(null);
    setEditingListingId(null);
    setEditingListingReturn(null);

    // Anyone who created/edited a listing is a host — never replay role onboarding.
    completeOnboarding();
    markRoleChosen();
    setAppMode("earn");

    if (reason === "finished") {
      setNavStack([]);
      setCurrentScreen(yardSaleActive ? "openGarageSale" : "garage");
      return;
    }

    // Discard: land in My Garage — not Home (which may force location search).
    setNavStack([]);
    setCurrentScreen(yardSaleActive ? "openGarageSale" : "garage");
  };

  const handlePlanOpenSaleFromPublish = (listingId: string) => {
    setSellPathListingId(listingId);
    setOpenSalePrefillListingIds([listingId]);
    setListingPrefill(null);
    setEditingListingId(null);
    setEditingListingReturn(null);
    completeOnboarding();
    markRoleChosen();
    setAppMode("earn");
    navigateTo("sellPathChoice");
  };

  const handleSellPathChoice = (path: "live" | "open_sale_pick" | "open_sale_snap") => {
    if (path === "live") {
      setSellPathListingId(null);
      setOpenSalePrefillListingIds([]);
      setNavStack([]);
      setCurrentScreen("garage");
      return;
    }
    if (path === "open_sale_snap") {
      navigateTo("createOpenSale");
      // After create, host can snap; also allow jumping to snap from create screen.
      return;
    }
    navigateTo("createOpenSale");
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
    setCurrentScreen(landAfterOnboarding());
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
      if (currentScreen === "installGate") {
        // Stay on the install coach — going back to splash auto-advances and
        // used to skip the instructions after the gate was marked done.
        return stack;
      }
      if (currentScreen === "createOpenSale") {
        setCurrentScreen(sellPathListingId ? "sellPathChoice" : "openGarageSale");
        return stack;
      }
      if (currentScreen === "sellPathChoice") {
        setSellPathListingId(null);
        setOpenSalePrefillListingIds([]);
        setCurrentScreen("garage");
        return stack;
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
      if (currentScreen === "garageShop") {
        setGarageShopPreview(false);
        setFocusGarageItemId(null);
        setCurrentScreen("garage");
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
        setCurrentScreen(landAfterOnboarding());
        return stack;
      }
      if (currentScreen === "earnBusiness") {
        setCurrentScreen("garage");
        return stack;
      }
      if (currentScreen === "home" || currentScreen === "garage") {
        // Garage is the primary root — stay put.
        return stack;
      }
      if (
        currentScreen === "favorites" ||
        currentScreen === "messages" ||
        currentScreen === "notifications" ||
        currentScreen === "rentals"
      ) {
        setCurrentScreen(currentScreen === "rentals" ? "profile" : "more");
        return stack;
      }
      if (currentScreen === "listItem" || currentScreen === "listingIntro") {
        const listingFallback = isYardSaleListingActive()
          ? "openGarageSale"
          : LISTING_BACK_FALLBACK[currentScreen];
        if (listingFallback) {
          setCurrentScreen(listingFallback);
        } else {
          setCurrentScreen(landAfterOnboarding());
        }
        return stack;
      }
      if (isOnboardingScreen(currentScreen)) {
        const fallback = ONBOARDING_BACK_FALLBACK[currentScreen];
        if (fallback) {
          setCurrentScreen(fallback);
        } else {
          setCurrentScreen(landAfterOnboarding());
        }
        return stack;
      }
      setCurrentScreen(landAfterOnboarding());
      return stack;
    });
  }, [currentScreen]);

  useBrowserBackTrap(!isStandalonePwa() && currentScreen !== "splash", handleBack);

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
      navigateTo("listItem");
      return;
    }
    if (screen === "personalInfo") {
      handleOpenPersonalInfo();
      return;
    }
    if (screen === "profile") {
      handleOpenProfile();
      return;
    }
  };

  const handleStartListing = (prefill?: ShelfPrefill) => {
    clearYardSaleListingActive();
    setListingPrefill(prefill ?? null);
    setEditingListingId(null);
    setEditingListingReturn(null);
    navigateTo("listItem");
  };

  const handleRentLandingNavigate = useCallback((path: string) => {
    const parsed = parseRentPath(path);
    if (!parsed || parsed.kind === "invalid" || !parsed.category) return;
    window.history.pushState({}, "", path);
    setRentLandingCategory(parsed.category);
    setRentLandingLocation(parsed.location);
    setCurrentScreen("rentLanding");
    setNavStack([]);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (isOpsPath(window.location.pathname) || readBootOps()) {
        setCurrentScreen("ops");
        setNavStack([]);
        return;
      }
      const parsed = parseRentPath(window.location.pathname);
      if (parsed && parsed.kind !== "invalid" && parsed.category) {
        setRentLandingCategory(parsed.category);
        setRentLandingLocation(parsed.location);
        setCurrentScreen("rentLanding");
        setNavStack([]);
        return;
      }
      if (currentScreen === "ops") {
        setCurrentScreen(landAfterOnboarding());
        return;
      }
      if (currentScreen === "rentLanding") {
        setRentLandingCategory(null);
        setRentLandingLocation(null);
        setCurrentScreen(landAfterOnboarding());
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [currentScreen]);

  const handleResumeDraft = useCallback(
    (listingId: string) => {
      clearYardSaleListingActive();
      setListingPrefill(null);
      setEditingListingId(listingId);
      setEditingListingReturn(listingId);
      navigateTo("listItem");
    },
    [navigateTo],
  );

  const showBrandHeader =
    currentScreen !== "splash" &&
    !isOnboardingScreen(currentScreen) &&
    !HIDE_BRAND_HEADER_SCREENS.has(currentScreen);
  const showBottomNav = BOTTOM_NAV_SCREENS.has(currentScreen);

  // Owner ops console works even when consumer integrations are missing.
  if (currentScreen === "ops") {
    return (
      <div className="app-shell">
        <div className="app-container bg-background">
          <div className="app-screen-host">
            <OpsConsoleScreen
              onExitToApp={() => {
                window.history.pushState({}, "", "/?skipSplash=1&skipInstall=1");
                setNavStack([]);
                setCurrentScreen(isOnboardingComplete() ? landAfterOnboarding() : resolvePostSplashScreen());
              }}
            />
          </div>
        </div>
      </div>
    );
  }

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

        {currentScreen === "rentLanding" && rentLandingCategory && (
          <RentLandingScreen
            category={rentLandingCategory}
            location={rentLandingLocation}
            onOpenListing={(listingId) => {
              // Apex SEO host → deep-link into the PWA (keep authority on evorios.com for /rent only).
              if (isSeoApexHost()) {
                window.location.assign(
                  `${APP_ORIGIN}/item/${encodeURIComponent(listingId)}?skipSplash=1`,
                );
                return;
              }
              window.history.pushState({}, "", "/");
              setSelectedItemId(listingId);
              navigateTo("itemDetail");
            }}
            onStockGarage={({ category, city }) => {
              if (isSeoApexHost()) {
                const params = new URLSearchParams({
                  screen: "listItem",
                  skipSplash: "1",
                  skipInstall: "1",
                });
                if (category) params.set("seoCategory", category);
                if (city) params.set("seoCity", city);
                window.location.assign(`${APP_ORIGIN}/?${params.toString()}`);
                return;
              }
              if (city) setTripDestination(city);
              window.history.pushState({}, "", "/");
              handleStartListing({ category, city });
            }}
            onOpenApp={() => {
              if (isSeoApexHost()) {
                window.location.assign(`${APP_ORIGIN}/?skipSplash=1&skipInstall=1`);
                return;
              }
              if (rentLandingLocation) {
                setTripDestination(formatSeoLocationLabel(rentLandingLocation));
              }
              window.history.pushState({}, "", "/");
              setNavStack([]);
              setCurrentScreen(landAfterOnboarding());
            }}
            onNavigateRentPath={handleRentLandingNavigate}
          />
        )}

        {currentScreen === "installGate" && (
          <InstallGateScreen
            onInstalledContinue={handleInstallGateInstalled}
          />
        )}

        {currentScreen === "authWelcome" && (
          <AuthWelcome
            onSignIn={handleAuthWelcomeSignIn}
            onSignUp={handleAuthWelcomeSignUp}
            onContinueAsGuest={continueFromAuthWelcome}
          />
        )}

        {currentScreen === "guestShowcase" && (
          <GuestShowcase
            onSignUp={handleGuestShowcaseSignUp}
            onBrowseAsGuest={handleGuestShowcaseBrowse}
            onBack={handleBack}
          />
        )}

        {currentScreen === "firstHello" && (
          <FirstHello
            onNext={handleContinueFromHello}
            onSkip={skipOnboarding}
            onBack={handleBack}
          />
        )}

        {currentScreen === "installHint" && (
          <InstallHintToast
            mode="step"
            enabled
            onDone={handleInstallHintDone}
            onBack={handleBack}
          />
        )}

        {currentScreen === "whatIsEvorios" && (
          <WhatIsEvorios
            onContinue={handleContinueFromProductIntro}
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
          />
        )}

        {currentScreen === "home" && (
          <HomeFeed
            onNavigate={handleNavigate}
            onOpenNotifications={handleOpenNotifications}
            onEditLocation={openRentLocationSetup}
            onPostRequest={(opts) =>
              handlePostRequest({
                category: opts?.category?.trim() ?? "",
                subcategory: opts?.subcategory?.trim() || undefined,
                query: opts?.query?.trim() ?? "",
                city: getActiveRentLocationLabel().trim() || undefined,
              })
            }
            onStockGarage={handleStartListing}
            onRentals={handleOpenRentals}
            onYardSales={openYardSaleHub}
            onRoleModeChange={handlePreferredModeChange}
          />
        )}

        {currentScreen === "yardSaleHub" && (
          <YardSaleHubScreen
            onBack={openHomeFeed}
            onChoose={handleYardSaleHubChoice}
          />
        )}

        {currentScreen === "openGarageSale" && (
          <OpenGarageSaleScreen
            onBack={openYardSaleHub}
            onAddSaleItems={handleStartYardSaleListing}
            onOpenMyGarage={handleOpenMyGarageShop}
            onViewSaleRules={handleOpenGarageSaleRules}
            onPlanOpenSale={() => {
              setOpenSalePrefillListingIds([]);
              setSellPathListingId(null);
              navigateTo("createOpenSale");
            }}
          />
        )}

        {currentScreen === "sellPathChoice" && (
          <SellPathChoiceScreen
            listingTitle={
              sellPathListingId
                ? getListingDisplayTitle(getPublishedListingById(sellPathListingId)?.title ?? "Item")
                : "Your item"
            }
            onBack={handleBack}
            onChoose={handleSellPathChoice}
          />
        )}

        {currentScreen === "createOpenSale" && (
          <CreateOpenSaleScreen
            hostId={resolveHostAccountId(auth.userId)}
            preselectedListingIds={openSalePrefillListingIds}
            onBack={handleBack}
            onCreated={() => {
              setSellPathListingId(null);
              setOpenSalePrefillListingIds([]);
              setNavStack([]);
              setCurrentScreen("garageShop");
            }}
            onSnapMore={handleStartYardSaleListing}
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
            onViewShop={handlePreviewMyGarageShop}
            onRequireAuth={() => showAuthGate("snapSale", "list")}
          />
        )}

        {currentScreen === "yardSales" && (
          <YardSalesScreen
            onBack={openYardSaleHub}
            onOpenGarage={handleOpenNeighborGarage}
            onBrowseGear={() => handleBrowseHubChoice("findGear")}
          />
        )}

        {currentScreen === "mre" && (
          <MrEvoriosScreen
            onHowItWorks={() => navigateTo("howEvoriosWorks")}
            onListItem={() => handleStartListing()}
            onBrowse={openHomeFeed}
            onGarage={handleOpenGarage}
            onProfile={handleOpenProfile}
          />
        )}

        {currentScreen === "howEvoriosWorks" && (
          <HowEvoriosWorksScreen
            onBack={handleBack}
            onOpenBrowse={openHomeFeed}
            onOpenStock={handleStartListing}
            onAskEvorios={handleOpenMrE}
          />
        )}

        {currentScreen === "activity" && (
          <ActivityScreen
            onRentals={handleOpenRentals}
            onMessages={handleOpenMessages}
            onFavorites={handleOpenFavorites}
            onNotifications={handleOpenNotifications}
          />
        )}

        {currentScreen === "more" && (
          <MoreScreen
            onMrE={handleOpenMrE}
            onAccountSettings={() => handleOpenPersonalInfo()}
            onSignIn={handleSignIn}
            onHowItWorks={() => navigateTo("howEvoriosWorks")}
            onFeedback={() => navigateTo("feedback")}
          />
        )}

        {currentScreen === "feedback" && (
          <FeedbackScreen onBack={handleBack} />
        )}

        {currentScreen === "messages" && (
          <MessagesInboxScreen
            onBack={handleBack}
            onOpenRentalChat={handleOpenRentalChat}
            onOpenListingChat={handleOpenListingChat}
          />
        )}

        {currentScreen === "listingChat" && listingChatListingId && listingChatPeerId && (
          <ListingChatScreen
            listingId={listingChatListingId}
            peerId={listingChatPeerId}
            onBack={handleBack}
            onRequireAuth={() => showAuthGate("listingChat", "message")}
          />
        )}

        {currentScreen === "garage" && (
          <GarageScreen
            onBack={navStack.length > 0 ? handleBack : undefined}
            onNavigate={handleNavigate}
            onStockGarage={handleStartListing}
            onResumeDraft={handleResumeDraft}
            onViewShop={handleOpenMyGarageShop}
            onPreviewAsNeighbor={handlePreviewMyGarageShop}
            onViewProfile={handleViewPublicProfile}
            onRoleModeChange={handlePreferredModeChange}
            onOpenRental={(bookingId) => {
              setSelectedBookingId(bookingId);
              navigateTo("activeRental");
            }}
            onOpenEarnings={handleOpenBusiness}
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
            onOpenListing={handleOpenListingFromGarageShop}
            onOpenHostOffers={
              selectedNeighborGarageHostId !== resolveHostAccountId(auth.userId)
                ? undefined
                : handleOpenHostOffers
            }
            onStockShelf={() => {
              navigateTo(hasSeenGarageSaleRules() ? "snapSale" : "garageSaleRules");
            }}
          />
        )}

        {currentScreen === "garageHostOffers" && (
          <GarageHostOffersScreen
            hostId={resolveHostAccountId(auth.userId)}
            onBack={handleBack}
          />
        )}

        {currentScreen === "garageWinnerCheckout" && (
          winnerCheckoutListingId ? (
            <GarageWinnerCheckoutScreen
              listingId={winnerCheckoutListingId}
              onBack={handleBack}
              onComplete={() => {
                setNavStack([]);
                setCurrentScreen("garageShop");
              }}
              onRequireAuth={() => showAuthGate("garageWinnerCheckout", "book")}
            />
          ) : (
            <GarageShopMissingScreen
              onBack={handleBack}
              onBrowseYardSales={() => {
                setNavStack([]);
                setCurrentScreen("yardSales");
              }}
            />
          )
        )}

        {currentScreen === "garageCart" && (
          <GarageCartScreen
            onBack={handleBack}
            onCheckoutComplete={() => {
              setNavStack([]);
              setCurrentScreen("garageShop");
            }}
            onRequireAuth={() => showAuthGate("garageCart", "book")}
          />
        )}

        {currentScreen === "rentals" && (
          <RentalsScreen
            onBack={handleBack}
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
            onOpenCoHosts={() => navigateTo("coHosts")}
            onOpenPersonalInfo={handleOpenPersonalInfo}
            onOpenAgentActivity={() => navigateTo("agentActivity")}
            onPreferredModeChange={handlePreferredModeChange}
            onViewPublicProfile={handleViewPublicProfile}
            onSignedOut={handleSignedOut}
            onRequireAuth={() => {
              if (auth.configured && !auth.session) {
                showAuthGate("profile");
              }
            }}
          />
        )}

        {currentScreen === "publicProfile" && selectedPublicProfileUserId && (
          <PublicProfileScreen
            userId={selectedPublicProfileUserId}
            onBack={handleBack}
            onOpenListing={handleOpenListingFromFeed}
            onOpenProfileSettings={
              auth.userId && selectedPublicProfileUserId === auth.userId
                ? () => handleOpenPersonalInfo()
                : undefined
            }
          />
        )}

        {currentScreen === "coHosts" && <CoHostsScreen onBack={handleBack} />}

        {currentScreen === "personalInfo" && (
          <PersonalInfoScreen
            initialEdit={personalInfoInitialEdit}
            onDeleteAccount={() => navigateTo("deleteAccount")}
            onOpenCoHosts={() => navigateTo("coHosts")}
            onOpenEarnings={() => navigateTo("earnBusiness")}
            onSignedOut={handleSignedOut}
            onSignIn={handleSignIn}
            onBack={() => {
              setPersonalInfoInitialEdit(undefined);
              handleBack();
            }}
          />
        )}

        {currentScreen === "favorites" && (
          <FavoritesScreen
            onBack={handleBack}
            onHome={handleOpenHome}
            onOpenListing={(id) => handleOpenListingFromFeed(id)}
          />
        )}

        {currentScreen === "earnBusiness" && (
          <EarnBusinessScreen
            onBack={handleBack}
            onHome={handleOpenHome}
            onRentals={handleOpenRentals}
            onStock={handleStartListing}
            onGarage={() => goToTab("garage")}
            onOpenPayoutSettings={() => navigateTo("personalInfo")}
          />
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
            onOpenGarageCart={handleOpenGarageCart}
            onOpenGarageShop={handleOpenGarageShopForListing}
            onViewHostProfile={handleViewPublicProfile}
            onOpenListingChat={handleOpenListingChat}
          />
        )}

        {currentScreen === "requestDetail" && selectedRequestId && (
          <RequestDetail
            requestId={selectedRequestId}
            onBack={handleBack}
            onFulfill={(prefill) => {
              setSelectedRequestId(null);
              handleStartListing(prefill);
            }}
            onHome={handleOpenHome}
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
            initialChatOpen={activeRentalChatOpen}
            onBack={() => {
              setActiveRentalChatOpen(false);
              handleBack();
            }}
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
            onRequireAuth={(listingId) => {
              setEditingListingId(listingId);
              setEditingListingReturn(listingId);
              // Keep Seller setup pending across AuthGate so we don't drop back to category.
              markGoPublicPending(listingId);
              showAuthGate("listItem", "list");
            }}
            onExit={handleListingWizardExit}
            onPreviewShop={handlePreviewMyGarageShop}
            onPlanOpenSale={handlePlanOpenSaleFromPublish}
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
            onDeleted={() => {
              setSelectedHostListingId(null);
              setNavStack([]);
              setCurrentScreen("garage");
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
            onActivity={handleOpenActivity}
            onMore={handleOpenMore}
          />
        ) : null}
      </div>

      <AuthGate
        open={authGateOpen}
        intent={authIntent}
        mode={authGateMode}
        initialStep={
          peekPendingAuthEmail() && !shouldShowPasskeyLogin() && authGateMode !== "signUp"
            ? "confirm"
            : undefined
        }
        onDismiss={() => {
          setAuthGateOpen(false);
          if (currentScreen === "profile" && auth.configured && !auth.loading && !auth.session) {
            goToTab("more");
          }
        }}
        onAuthenticated={finishAuthFlow}
      />

      <PasskeySetup open={passkeySetupOpen} onDone={() => setPasskeySetupOpen(false)} />

      <ConnectOnboardingHost />

      <BirthdayGreetingHost
        enabled={
          currentScreen !== "splash" &&
          currentScreen !== "installGate" &&
          currentScreen !== "installHint" &&
          !isOnboardingScreen(currentScreen)
        }
      />

      <InstallHintToast
        mode="overlay"
        enabled={
          currentScreen !== "splash" &&
          currentScreen !== "installGate" &&
          currentScreen !== "installHint" &&
          !isOnboardingScreen(currentScreen)
        }
      />
    </div>
    </RequireAuthProvider>
  );
}

export default function App() {
  return (
    <PwaUpdateProvider>
      <PwaInstallProvider>
        <AuthProvider>
          <PageTranslateBridge />
          <AppRoutes />
        </AuthProvider>
      </PwaInstallProvider>
    </PwaUpdateProvider>
  );
}
