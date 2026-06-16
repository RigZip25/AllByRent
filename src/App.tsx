import { type CSSProperties, useEffect, useState } from "react";

import createNewPasswordScreen from "./assets/auth/create-new-password.png";
import earningYourStuffScreen from "./assets/auth/earning-your-stuff.png";
import likeToDoListScreen from "./assets/auth/like-to-do-list.png";
import likeToDoRentScreen from "./assets/auth/like-to-do-rent.png";
import loginScreen from "./assets/auth/login.png";
import rentalScreen from "./assets/auth/rental.png";
import resetPasswordScreen from "./assets/auth/reset-password.png";
import signupScreen from "./assets/auth/signup.png";
import verificationCodeScreen from "./assets/auth/verification-code.png";
import verificationPhoneScreen from "./assets/auth/verification-phone.png";
import bookingScreen from "./assets/browsing/booking.png";
import categoriesScreen from "./assets/browsing/categories.png";
import favoritesScreen from "./assets/browsing/favorites.png";
import homeScreen from "./assets/browsing/home.png";
import orderConfirmScreen from "./assets/browsing/order-confirm.png";
import orderDetailScreen from "./assets/browsing/order-detail.png";
import productDetailScreen from "./assets/browsing/product-detail.png";
import productListScreen from "./assets/browsing/product-list.png";
import subcategoriesScreen from "./assets/browsing/subcategories.png";
import addItemCategoriesScreen from "./assets/listing/add-item-categories.png";
import addItemDetailScreen from "./assets/listing/add-item-detail.png";
import addItemSubcategoriesScreen from "./assets/listing/add-item-subcategories.png";
import expectedPriceScreen from "./assets/listing/expected-price.png";
import listingOrderScreen from "./assets/listing/listing-order.png";
import policyRulesScreen from "./assets/listing/policy-rules.png";
import uploadPhotosScreen from "./assets/listing/upload-photos.png";
import whereYourPlaceScreen from "./assets/listing/where-your-place.png";
import businessRentalsScreen from "./assets/onboarding/business-rentals.png";
import mrRentanoScreen from "./assets/onboarding/mr-rentano.png";
import { MASCOT_NAME } from "./lib/brand";
import rentalHubScreen from "./assets/onboarding/rental-hub.png";
import rentLocallyScreen from "./assets/onboarding/rent-locally.png";
import secureLocalFlexibleScreen from "./assets/onboarding/secure-local-flexible.png";
import welcomeScreen from "./assets/onboarding/welcome.png";
import {
  createEmptyListingDraft,
  createPublishedListing,
  encodeAssetQrPayload,
  type ListingScope,
  type PublishedListing,
} from "./data/listing";
import { type ComplianceFlag, type ListingIntent } from "./data/taxonomy";

type Hotspot = {
  className: string;
  label: string;
  rect?: RectPercent;
  targetId: string;
};

type RectPercent = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type LocaleCode = "en" | "es";

type LocaleSettings = {
  code: LocaleCode;
  currency: string;
  dateLocale: string;
  dir: "ltr" | "rtl";
  label: string;
};

type TranslationKey =
  | "assistant.introHint"
  | "assistant.locale"
  | "locale.english"
  | "locale.spanish";

type FormFieldName =
  | "loginEmail"
  | "loginPassword"
  | "fullName"
  | "signupEmail"
  | "phone"
  | "signupPassword"
  | "verificationCode"
  | "resetEmail"
  | "newPassword"
  | "confirmPassword";

type FormField = {
  autoComplete?: string;
  className: string;
  inputMode?: "email" | "numeric" | "tel" | "text";
  label: string;
  maxLength?: number;
  name: FormFieldName;
  placeholder?: string;
  type?: "email" | "password" | "tel" | "text";
};

type AppScreen = {
  backTargetId?: string;
  id: string;
  title: string;
  image?: string;
  fields?: FormField[];
  hotspots?: Hotspot[];
  primaryLabel?: string;
  primaryTargetId?: string;
  render?: "asset-qr" | "listing-scope";
  hasSkip?: boolean;
  tall?: boolean;
  showDots?: boolean;
};

type AuthForm = Record<FormFieldName, string>;

type SessionState = {
  email?: string;
  isAuthenticated: boolean;
  lastBookingId?: string;
  lastPublishedListing?: PublishedListing;
  listingIntent?: ListingIntent;
};

const emptyAuthForm: AuthForm = {
  loginEmail: "",
  loginPassword: "",
  fullName: "",
  signupEmail: "",
  phone: "",
  signupPassword: "",
  verificationCode: "",
  resetEmail: "",
  newPassword: "",
  confirmPassword: "",
};

const sessionStorageKey = "all-by-rent-session";
const localeStorageKey = "all-by-rent-locale";

const localeSettings: Record<LocaleCode, LocaleSettings> = {
  en: {
    code: "en",
    currency: "USD",
    dateLocale: "en-US",
    dir: "ltr",
    label: "English",
  },
  es: {
    code: "es",
    currency: "EUR",
    dateLocale: "es-ES",
    dir: "ltr",
    label: "Español",
  },
};

const translations: Record<LocaleCode, Record<TranslationKey, string>> = {
  en: {
    "assistant.introHint": "If you ever get stuck, call me from the app footer.",
    "assistant.locale": "Language",
    "locale.english": "English",
    "locale.spanish": "Spanish",
  },
  es: {
    "assistant.introHint": "Si te atascas, llamame desde el pie de la app.",
    "assistant.locale": "Idioma",
    "locale.english": "Ingles",
    "locale.spanish": "Espanol",
  },
};

const getStoredLocale = (): LocaleCode => {
  const storedLocale = window.localStorage.getItem(localeStorageKey);
  return storedLocale === "es" ? "es" : "en";
};

const getStoredSession = (): SessionState => {
  try {
    const storedSession = window.localStorage.getItem(sessionStorageKey);

    if (storedSession) {
      return JSON.parse(storedSession) as SessionState;
    }
  } catch {
    window.localStorage.removeItem(sessionStorageKey);
  }

  return { isAuthenticated: false };
};

const onboardingScreens: AppScreen[] = [
  {
    id: "welcome",
    title: "Welcome to All By Rent",
    image: welcomeScreen,
    primaryLabel: "Welcome to All By Rent",
    primaryTargetId: "rent-locally",
    showDots: true,
  },
  {
    id: "rent-locally",
    title: "Rent locally",
    image: rentLocallyScreen,
    primaryLabel: "Next",
    primaryTargetId: "rental-hub",
    hasSkip: true,
    showDots: true,
  },
  {
    backTargetId: "rent-locally",
    id: "rental-hub",
    title: "Get what you need. Profit from what you don't.",
    image: rentalHubScreen,
    primaryLabel: "Next",
    primaryTargetId: "business-rentals",
    hasSkip: true,
    showDots: true,
  },
  {
    backTargetId: "rental-hub",
    id: "business-rentals",
    title: "Unlock Business Potential with Rentals",
    image: businessRentalsScreen,
    primaryLabel: "Next",
    primaryTargetId: "secure-local-flexible",
    hasSkip: true,
    showDots: true,
  },
  {
    backTargetId: "business-rentals",
    id: "secure-local-flexible",
    title: "Secure. Local. Flexible.",
    image: secureLocalFlexibleScreen,
    primaryLabel: "Next",
    primaryTargetId: "mr-rentano",
    hasSkip: true,
    showDots: true,
  },
  {
    backTargetId: "secure-local-flexible",
    id: "mr-rentano",
    title: `Hi, I'm ${MASCOT_NAME}.`,
    image: mrRentanoScreen,
    showDots: true,
    hotspots: [
      {
        className: "hotspot-login-signup",
        label: "Log in or sign up",
        targetId: "login",
      },
    ],
  },
];

const authScreens: AppScreen[] = [
  {
    backTargetId: "mr-rentano",
    id: "login",
    title: "Login",
    image: loginScreen,
    fields: [
      {
        autoComplete: "email",
        className: "field-login-email",
        inputMode: "email",
        label: "Email",
        name: "loginEmail",
        placeholder: "Your email",
        type: "email",
      },
      {
        autoComplete: "current-password",
        className: "field-login-password",
        label: "Password",
        name: "loginPassword",
        placeholder: "Password",
        type: "password",
      },
    ],
    hotspots: [
      { className: "hotspot-login-primary", label: "Log in", targetId: "like-to-do-rent" },
      { className: "hotspot-auth-forgot", label: "Forgot password", targetId: "reset-password" },
      { className: "hotspot-auth-signup", label: "Sign up", targetId: "signup" },
      { className: "hotspot-auth-provider-left", label: "Apple login", targetId: "like-to-do-rent" },
      { className: "hotspot-auth-provider-right", label: "Google login", targetId: "like-to-do-rent" },
    ],
  },
  {
    backTargetId: "login",
    id: "signup",
    title: "Sign Up",
    image: signupScreen,
    fields: [
      {
        autoComplete: "name",
        className: "field-signup-full-name",
        label: "Full name",
        name: "fullName",
        placeholder: "Your name",
        type: "text",
      },
      {
        autoComplete: "email",
        className: "field-signup-email",
        inputMode: "email",
        label: "Email",
        name: "signupEmail",
        placeholder: "Your email",
        type: "email",
      },
      {
        autoComplete: "tel",
        className: "field-signup-phone",
        inputMode: "tel",
        label: "Mobile number",
        name: "phone",
        placeholder: "+1 555 000 0000",
        type: "tel",
      },
      {
        autoComplete: "new-password",
        className: "field-signup-password",
        label: "Password",
        name: "signupPassword",
        placeholder: "Password",
        type: "password",
      },
    ],
    hotspots: [
      { className: "hotspot-signup-primary", label: "Sign up", targetId: "verification-phone" },
      { className: "hotspot-auth-signin-bottom", label: "Log in", targetId: "login" },
      { className: "hotspot-auth-provider-left", label: "Apple sign up", targetId: "verification-phone" },
      { className: "hotspot-auth-provider-right", label: "Google sign up", targetId: "verification-phone" },
    ],
  },
  {
    backTargetId: "signup",
    id: "verification-phone",
    title: "Verification Code",
    image: verificationPhoneScreen,
    fields: [
      {
        className: "field-verification-code",
        inputMode: "numeric",
        label: "Verification code",
        maxLength: 4,
        name: "verificationCode",
        placeholder: "5319",
        type: "text",
      },
    ],
    hotspots: [
      { className: "hotspot-otp-area", label: "Enter verification code", targetId: "verification-code" },
    ],
  },
  {
    backTargetId: "verification-phone",
    id: "verification-code",
    title: "Verification Code",
    image: verificationCodeScreen,
    fields: [
      {
        className: "field-verification-code",
        inputMode: "numeric",
        label: "Verification code",
        maxLength: 4,
        name: "verificationCode",
        placeholder: "5319",
        type: "text",
      },
    ],
    hotspots: [
      { className: "hotspot-otp-area", label: "Complete verification", targetId: "like-to-do-rent" },
    ],
  },
  {
    backTargetId: "login",
    id: "reset-password",
    title: "Reset Password",
    image: resetPasswordScreen,
    fields: [
      {
        autoComplete: "email",
        className: "field-reset-email",
        inputMode: "email",
        label: "Email",
        name: "resetEmail",
        placeholder: "Enter your email",
        type: "email",
      },
    ],
    hotspots: [
      { className: "hotspot-reset-primary", label: "Send OTP", targetId: "create-new-password" },
    ],
  },
  {
    backTargetId: "reset-password",
    id: "create-new-password",
    title: "Create New Password",
    image: createNewPasswordScreen,
    fields: [
      {
        autoComplete: "new-password",
        className: "field-new-password",
        label: "Password",
        name: "newPassword",
        placeholder: "Password",
        type: "password",
      },
      {
        autoComplete: "new-password",
        className: "field-confirm-password",
        label: "Confirm password",
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: "password",
      },
    ],
    hotspots: [
      { className: "hotspot-auth-primary", label: "Save new password", targetId: "login" },
    ],
  },
  {
    backTargetId: "mr-rentano",
    id: "like-to-do-rent",
    title: "What would you like to do? Rent or List?",
    image: likeToDoRentScreen,
    hotspots: [
      { className: "hotspot-choice-left", label: "I want to rent something", targetId: "like-to-do-rent" },
      { className: "hotspot-choice-right", label: "I want to list something", targetId: "like-to-do-list" },
      { className: "hotspot-auth-primary", label: "Continue", targetId: "rental" },
    ],
  },
  {
    backTargetId: "mr-rentano",
    id: "like-to-do-list",
    title: "What would you like to do? Rent or List?",
    image: likeToDoListScreen,
    hotspots: [
      { className: "hotspot-choice-left", label: "I want to rent something", targetId: "like-to-do-rent" },
      { className: "hotspot-choice-right", label: "I want to list something", targetId: "like-to-do-list" },
      { className: "hotspot-auth-primary", label: "Continue", targetId: "earning-your-stuff" },
    ],
  },
  {
    backTargetId: "like-to-do-rent",
    id: "rental",
    title: "Ready to explore rentals near you?",
    image: rentalScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Start exploring", targetId: "home" },
      { className: "hotspot-auth-signin-bottom", label: "Log in", targetId: "login" },
    ],
  },
  {
    backTargetId: "like-to-do-list",
    id: "earning-your-stuff",
    title: "How much is your clutter worth?",
    image: earningYourStuffScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Start listing", targetId: "listing-scope" },
      { className: "hotspot-auth-signin-bottom", label: "Log in", targetId: "login" },
    ],
  },
];

const browsingScreens: AppScreen[] = [
  {
    id: "home",
    title: "Home",
    image: homeScreen,
    tall: true,
    hotspots: [
      {
        className: "hotspot-home-search",
        label: "Search",
        rect: { height: 5, left: 4, top: 5, width: 92 },
        targetId: "product-list",
      },
      {
        className: "hotspot-home-category",
        label: "Browse categories",
        rect: { height: 15.5, left: 4, top: 10.5, width: 92 },
        targetId: "categories",
      },
      {
        className: "hotspot-home-product-left",
        label: "Open product",
        rect: { height: 26, left: 4, top: 61.7, width: 44 },
        targetId: "product-detail",
      },
      {
        className: "hotspot-bottom-categories",
        label: "Categories",
        rect: { height: 8.5, left: 40, top: 91.5, width: 19 },
        targetId: "categories",
      },
      {
        className: "hotspot-bottom-favorites",
        label: "Favorites",
        rect: { height: 8.5, left: 75, top: 91.5, width: 19 },
        targetId: "favorites",
      },
    ],
  },
  {
    backTargetId: "home",
    id: "categories",
    title: "Categories",
    image: categoriesScreen,
    hotspots: [
      {
        className: "hotspot-category-grid",
        label: "Open subcategories",
        rect: { height: 73, left: 3, top: 10, width: 94 },
        targetId: "subcategories",
      },
      {
        className: "hotspot-bottom-home",
        label: "Home",
        rect: { height: 8.5, left: 5.5, top: 91.5, width: 19 },
        targetId: "home",
      },
      {
        className: "hotspot-bottom-favorites",
        label: "Favorites",
        rect: { height: 8.5, left: 75, top: 91.5, width: 19 },
        targetId: "favorites",
      },
    ],
  },
  {
    backTargetId: "categories",
    id: "subcategories",
    title: "Subcategories",
    image: subcategoriesScreen,
    hotspots: [
      {
        className: "hotspot-product-list-area",
        label: "Open product list",
        rect: { height: 71.5, left: 0, top: 10, width: 100 },
        targetId: "product-list",
      },
      {
        className: "hotspot-bottom-home",
        label: "Home",
        rect: { height: 8.5, left: 5.5, top: 91.5, width: 19 },
        targetId: "home",
      },
      {
        className: "hotspot-bottom-categories",
        label: "Categories",
        rect: { height: 8.5, left: 40, top: 91.5, width: 19 },
        targetId: "categories",
      },
    ],
  },
  {
    backTargetId: "subcategories",
    id: "product-list",
    title: "Product List",
    image: productListScreen,
    hotspots: [
      {
        className: "hotspot-product-list-area",
        label: "Open product detail",
        rect: { height: 71.5, left: 0, top: 10, width: 100 },
        targetId: "product-detail",
      },
      {
        className: "hotspot-bottom-home",
        label: "Home",
        rect: { height: 8.5, left: 5.5, top: 91.5, width: 19 },
        targetId: "home",
      },
      {
        className: "hotspot-bottom-categories",
        label: "Categories",
        rect: { height: 8.5, left: 40, top: 91.5, width: 19 },
        targetId: "categories",
      },
      {
        className: "hotspot-bottom-favorites",
        label: "Favorites",
        rect: { height: 8.5, left: 75, top: 91.5, width: 19 },
        targetId: "favorites",
      },
    ],
  },
  {
    backTargetId: "product-list",
    id: "product-detail",
    title: "Product Detail",
    image: productDetailScreen,
    hotspots: [
      {
        className: "hotspot-product-favorite",
        label: "Favorite product",
        rect: { height: 6.2, left: 85, top: 4.7, width: 12 },
        targetId: "favorites",
      },
      {
        className: "hotspot-product-book",
        label: "Book product",
        rect: { height: 6.8, left: 4.4, top: 88.3, width: 91.2 },
        targetId: "booking",
      },
    ],
  },
  {
    backTargetId: "product-detail",
    id: "booking",
    title: "Booking",
    image: bookingScreen,
    tall: true,
    hotspots: [
      {
        className: "hotspot-booking-confirm",
        label: "Confirm booking",
        rect: { height: 6.6, left: 4.4, top: 50.5, width: 91.2 },
        targetId: "order-confirm",
      },
    ],
  },
  {
    backTargetId: "booking",
    id: "order-confirm",
    title: "Order Confirmed",
    image: orderConfirmScreen,
    hotspots: [
      {
        className: "hotspot-view-booking",
        label: "View booking details",
        rect: { height: 6.4, left: 4.4, top: 63, width: 91.2 },
        targetId: "order-detail",
      },
      {
        className: "hotspot-continue-explore",
        label: "Continue exploring",
        rect: { height: 6.4, left: 4.4, top: 70.2, width: 91.2 },
        targetId: "home",
      },
    ],
  },
  {
    backTargetId: "order-confirm",
    id: "order-detail",
    title: "Order Detail",
    image: orderDetailScreen,
    hotspots: [
      {
        className: "hotspot-checkout",
        label: "Checkout",
        rect: { height: 6.8, left: 4.4, top: 88.3, width: 91.2 },
        targetId: "home",
      },
    ],
  },
  {
    backTargetId: "home",
    id: "favorites",
    title: "Favorites",
    image: favoritesScreen,
    hotspots: [
      {
        className: "hotspot-product-list-area",
        label: "Open favorite product",
        rect: { height: 71.5, left: 0, top: 10, width: 100 },
        targetId: "product-detail",
      },
      {
        className: "hotspot-bottom-home",
        label: "Home",
        rect: { height: 8.5, left: 5.5, top: 91.5, width: 19 },
        targetId: "home",
      },
      {
        className: "hotspot-bottom-categories",
        label: "Categories",
        rect: { height: 8.5, left: 40, top: 91.5, width: 19 },
        targetId: "categories",
      },
    ],
  },
];

const listingScreens: AppScreen[] = [
  {
    backTargetId: "earning-your-stuff",
    id: "listing-scope",
    render: "listing-scope",
    title: "Choose Listing Type",
  },
  {
    backTargetId: "listing-scope",
    id: "listing-categories",
    image: addItemCategoriesScreen,
    title: "Add Item Categories",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-scope" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-subcategories" },
      { className: "hotspot-category-grid", label: "Choose category", targetId: "listing-subcategories" },
    ],
  },
  {
    backTargetId: "listing-categories",
    id: "listing-subcategories",
    image: addItemSubcategoriesScreen,
    title: "Listing Subcategories",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-categories" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-detail" },
      { className: "hotspot-category-grid", label: "Choose subcategory", targetId: "listing-detail" },
    ],
  },
  {
    backTargetId: "listing-subcategories",
    id: "listing-detail",
    image: addItemDetailScreen,
    title: "Add Item Detail",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-subcategories" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-price" },
    ],
  },
  {
    backTargetId: "listing-detail",
    id: "listing-price",
    image: expectedPriceScreen,
    title: "Expected Price",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-detail" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-location" },
    ],
  },
  {
    backTargetId: "listing-price",
    id: "listing-location",
    image: whereYourPlaceScreen,
    tall: true,
    title: "Where's Your Place",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-price" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-rules" },
    ],
  },
  {
    backTargetId: "listing-location",
    id: "listing-rules",
    image: policyRulesScreen,
    title: "Policy & Rules",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-location" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-photos" },
    ],
  },
  {
    backTargetId: "listing-rules",
    id: "listing-photos",
    image: uploadPhotosScreen,
    title: "Upload Photos",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-rules" },
      { className: "hotspot-listing-next", label: "Next", targetId: "listing-order-preview" },
    ],
  },
  {
    backTargetId: "listing-photos",
    id: "listing-order-preview",
    image: listingOrderScreen,
    title: "Listing Order Preview",
    hotspots: [
      { className: "hotspot-listing-previous", label: "Previous", targetId: "listing-photos" },
      { className: "hotspot-listing-next", label: "Publish", targetId: "listing-published" },
    ],
  },
  {
    backTargetId: "listing-order-preview",
    id: "listing-published",
    render: "asset-qr",
    title: "Asset QR Identity",
  },
];

const screens = [...onboardingScreens, ...authScreens, ...browsingScreens, ...listingScreens];

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const getHotspotStyle = (hotspot: Hotspot): CSSProperties | undefined => {
  if (!hotspot.rect) {
    return undefined;
  }

  return {
    height: `${hotspot.rect.height}%`,
    left: `${hotspot.rect.left}%`,
    top: `${hotspot.rect.top}%`,
    width: `${hotspot.rect.width}%`,
  };
};

const getInitialStep = () => {
  const screenFromUrl = new URLSearchParams(window.location.search).get("screen");
  const screenIndex = screens.findIndex((screen) => screen.id === screenFromUrl);

  if (screenIndex >= 0) {
    return screenIndex;
  }

  const stepFromUrl = Number(new URLSearchParams(window.location.search).get("step"));

  if (Number.isInteger(stepFromUrl) && stepFromUrl >= 0 && stepFromUrl < screens.length) {
    return stepFromUrl;
  }

  if (getStoredSession().isAuthenticated) {
    const choiceScreenIndex = screens.findIndex((screen) => screen.id === "like-to-do-rent");

    if (choiceScreenIndex >= 0) {
      return choiceScreenIndex;
    }
  }

  return 0;
};

export const App = () => {
  const [authForm, setAuthForm] = useState<AuthForm>(emptyAuthForm);
  const [locale, setLocale] = useState<LocaleCode>(getStoredLocale);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<SessionState>(getStoredSession);
  const [activeIndex, setActiveIndex] = useState(getInitialStep);
  const activeScreen = screens[activeIndex];
  const isVerificationScreen =
    activeScreen.id === "verification-phone" || activeScreen.id === "verification-code";
  const hasDeepLink =
    new URLSearchParams(window.location.search).has("screen") ||
    new URLSearchParams(window.location.search).has("step");
  const currentLocale = localeSettings[locale];
  const t = (key: TranslationKey) => translations[locale][key];

  const changeLocale = (nextLocale: LocaleCode) => {
    setLocale(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  };

  const updateSession = (nextSession: SessionState) => {
    setSession(nextSession);
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
  };

  const goToScreen = (targetId: string) => {
    const targetIndex = screens.findIndex((screen) => screen.id === targetId);

    if (targetIndex >= 0) {
      setMessage("");
      setActiveIndex(targetIndex);
    }
  };

  useEffect(() => {
    if (!hasDeepLink && session.isAuthenticated && activeScreen.id === "welcome") {
      goToScreen("like-to-do-rent");
    }
  });

  const updateField = (fieldName: FormFieldName, value: string) => {
    const nextValue =
      fieldName === "verificationCode" ? value.replace(/\D/g, "").slice(0, 4) : value;

    setMessage("");
    setAuthForm((currentForm) => ({ ...currentForm, [fieldName]: nextValue }));
  };

  const submitLogin = (targetId: string) => {
    if (!isValidEmail(authForm.loginEmail) || authForm.loginPassword.length < 6) {
      setMessage("Enter a valid email and a password with at least 6 characters.");
      return;
    }

    updateSession({
      ...session,
      email: authForm.loginEmail,
      isAuthenticated: true,
    });
    goToScreen(targetId);
  };

  const submitProviderAuth = (targetId: string) => {
    updateSession({
      ...session,
      email: session.email ?? "demo@allbyrent.app",
      isAuthenticated: true,
    });
    goToScreen(targetId);
  };

  const submitSignup = (targetId: string) => {
    if (
      authForm.fullName.trim().length < 2 ||
      !isValidEmail(authForm.signupEmail) ||
      authForm.phone.replace(/\D/g, "").length < 7 ||
      authForm.signupPassword.length < 6
    ) {
      setMessage("Fill name, email, phone, and a password with at least 6 characters.");
      return;
    }

    goToScreen(targetId);
  };

  const submitVerification = (targetId: string) => {
    if (authForm.verificationCode.length !== 4) {
      setMessage("Enter the 4 digit verification code.");
      return;
    }

    updateSession({
      ...session,
      email: authForm.signupEmail || authForm.loginEmail || session.email,
      isAuthenticated: true,
    });
    goToScreen(targetId);
  };

  const submitResetPassword = (targetId: string) => {
    if (!isValidEmail(authForm.resetEmail)) {
      setMessage("Enter a valid email to receive the reset code.");
      return;
    }

    goToScreen(targetId);
  };

  const submitNewPassword = (targetId: string) => {
    if (authForm.newPassword.length < 6 || authForm.newPassword !== authForm.confirmPassword) {
      setMessage("Passwords must match and be at least 6 characters.");
      return;
    }

    setAuthForm((currentForm) => ({
      ...currentForm,
      loginEmail: currentForm.resetEmail || currentForm.loginEmail,
      loginPassword: currentForm.newPassword,
    }));
    setMessage("Password updated. Log in with your new password.");
    goToScreen(targetId);
  };

  const choosePreference = (listingIntent: ListingIntent, targetId: string) => {
    updateSession({ ...session, listingIntent });
    goToScreen(targetId);
  };

  const confirmBooking = (targetId: string) => {
    updateSession({
      ...session,
      lastBookingId: `ABR-${Date.now().toString().slice(-6)}`,
    });
    goToScreen(targetId);
  };

  const chooseListingScope = (scope: ListingScope, targetId: string) => {
    updateSession({
      ...session,
      listingIntent: scope,
    });
    goToScreen(targetId);
  };

  const publishDemoListing = (targetId: string) => {
    const isBusinessListing = session.listingIntent === "list-business";
    const draft = {
      ...createEmptyListingDraft(
        isBusinessListing ? "list-business" : "list-personal",
      ),
      brand: isBusinessListing ? "Shure" : "Coleman",
      categoryId: isBusinessListing ? "electronics" : "outdoor-patio",
      complianceFlags: isBusinessListing ? (["deposit-required"] as ComplianceFlag[]) : [],
      description: isBusinessListing
        ? "Five identical microphones tracked as separate physical asset units."
        : "One personal camping tent tracked as a single physical asset.",
      model: isBusinessListing ? "SM58" : "Sundome",
      priceAmount: isBusinessListing ? 20 : 12,
      priceCurrency: currentLocale.currency,
      quantity: isBusinessListing ? 5 : 1,
      serialNumbers: isBusinessListing
        ? ["MIC-001", "MIC-002", "MIC-003", "MIC-004", "MIC-005"]
        : ["TENT-001"],
      subcategoryId: isBusinessListing ? "event-av" : "camping-tents-sleeping-bags",
      title: isBusinessListing ? "Shure SM58 Microphone" : "Personal Camping Tent",
    };
    const listing = createPublishedListing(draft, session.email ?? "demo-owner");

    updateSession({
      ...session,
      lastPublishedListing: listing,
      listingIntent: draft.scope,
    });
    goToScreen(targetId);
  };

  const getDynamicTarget = (hotspot: Hotspot) => {
    if (activeScreen.id === "listing-location" && hotspot.className === "hotspot-listing-next") {
      return session.listingIntent === "list-business" ? "listing-rules" : "listing-photos";
    }

    if (activeScreen.id === "listing-photos" && hotspot.className === "hotspot-listing-previous") {
      return session.listingIntent === "list-business" ? "listing-rules" : "listing-location";
    }

    return hotspot.targetId;
  };

  const getActiveBackTarget = () => {
    if (activeScreen.id === "listing-photos") {
      return session.listingIntent === "list-business" ? "listing-rules" : "listing-location";
    }

    return activeScreen.backTargetId;
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    const targetId = getDynamicTarget(hotspot);

    switch (activeScreen.id) {
      case "login":
        if (hotspot.className.includes("primary")) {
          submitLogin(targetId);
          return;
        }

        if (hotspot.className.includes("provider")) {
          submitProviderAuth(targetId);
          return;
        }
        break;

      case "signup":
        if (hotspot.className.includes("primary")) {
          submitSignup(targetId);
          return;
        }

        if (hotspot.className.includes("provider")) {
          submitProviderAuth(targetId);
          return;
        }
        break;

      case "verification-phone":
      case "verification-code":
        if (hotspot.className === "hotspot-otp-area") {
          submitVerification(targetId);
          return;
        }
        break;

      case "reset-password":
        if (hotspot.className.includes("primary")) {
          submitResetPassword(targetId);
          return;
        }
        break;

      case "create-new-password":
        if (hotspot.className.includes("primary")) {
          submitNewPassword(targetId);
          return;
        }
        break;

      case "like-to-do-rent":
      case "like-to-do-list":
        if (hotspot.className === "hotspot-choice-left") {
          choosePreference("rent", targetId);
          return;
        }

        if (hotspot.className === "hotspot-choice-right") {
          choosePreference("list-undecided", targetId);
          return;
        }
        break;

      case "listing-scope":
        if (hotspot.className === "hotspot-listing-personal") {
          chooseListingScope("list-personal", targetId);
          return;
        }

        if (hotspot.className === "hotspot-listing-business") {
          chooseListingScope("list-business", targetId);
          return;
        }
        break;

      case "booking":
        if (hotspot.className === "hotspot-booking-confirm") {
          confirmBooking(targetId);
          return;
        }
        break;

      case "listing-order-preview":
        if (hotspot.className === "hotspot-listing-next") {
          publishDemoListing(targetId);
          return;
        }
        break;

      default:
        break;
    }

    goToScreen(targetId);
  };

  const activeBackTarget = getActiveBackTarget();

  const goToPrimaryTarget = () => {
    if (activeScreen.primaryTargetId) {
      goToScreen(activeScreen.primaryTargetId);
      return;
    }

    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, onboardingScreens.length - 1));
  };

  const skipToFinalStep = () => {
    setActiveIndex(onboardingScreens.length - 1);
  };

  return (
    <main className="screen-shell" aria-label="All By Rent onboarding" dir={currentLocale.dir}>
      <div className="app-toolbar" aria-label={t("assistant.locale")}>
        <span>{t("assistant.locale")}</span>
        <select
          onChange={(event) => changeLocale(event.target.value as LocaleCode)}
          value={locale}
        >
          <option value="en">{t("locale.english")}</option>
          <option value="es">{t("locale.spanish")}</option>
        </select>
      </div>
      <section className="phone-frame">
        {activeScreen.image ? (
          <img
            className={activeScreen.tall ? "figma-screen figma-screen-tall" : "figma-screen"}
            src={activeScreen.image}
            alt={activeScreen.title}
          />
        ) : null}
        {activeScreen.id === "mr-rentano" ? (
          <div className="rentano-intro-hint">{t("assistant.introHint")}</div>
        ) : null}
        {isVerificationScreen ? (
          <>
            <div className="verification-clean-copy">
              Please type the verification code sent to your email.
            </div>
            <div className="verification-code-mask" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </>
        ) : null}
        {activeScreen.render === "listing-scope" ? (
          <div className="custom-screen listing-scope-screen">
            <h1>What are you listing?</h1>
            <p>Choose the right owner type before the listing form starts.</p>
            <button
              className="listing-card listing-card-personal"
              onClick={() => chooseListingScope("list-personal", "listing-categories")}
              type="button"
            >
              <strong>Personal item</strong>
              <span>One-off items you own personally.</span>
            </button>
            <button
              className="listing-card listing-card-business"
              onClick={() => chooseListingScope("list-business", "listing-categories")}
              type="button"
            >
              <strong>Business / Professional inventory</strong>
              <span>Fleet, equipment, locations, services, or multiple units.</span>
            </button>
          </div>
        ) : null}
        {activeScreen.render === "asset-qr" ? (
          <div className="custom-screen asset-qr-screen">
            <h1>Asset QR created</h1>
            <p>
              {session.lastPublishedListing?.quantity === 1
                ? "This personal listing creates one QR identity for one physical item."
                : "Business inventory creates one QR identity for each physical unit, even when items are identical."}
            </p>
            <div className="qr-card">
              <div className="qr-visual" aria-hidden="true">
                {Array.from({ length: 49 }, (_, index) => {
                  const payload =
                    session.lastPublishedListing?.assetUnits[0]?.qrPayload.assetUnitId ??
                    "asset-demo";
                  const isDark = (payload.charCodeAt(index % payload.length) + index) % 3 !== 0;
                  return <span className={isDark ? "qr-cell qr-cell-dark" : "qr-cell"} key={index} />;
                })}
              </div>
              <strong>{session.lastPublishedListing?.assetUnits[0]?.assetUnitId ?? "asset-demo"}</strong>
              <small>
                {session.lastPublishedListing
                  ? encodeAssetQrPayload(session.lastPublishedListing.assetUnits[0].qrPayload)
                  : "Publish the listing to generate QR payloads."}
              </small>
            </div>
            <ul>
              {(session.lastPublishedListing?.assetUnits ?? []).map((assetUnit) => (
                <li key={assetUnit.assetUnitId}>
                  Unit {assetUnit.unitIndex}: {assetUnit.assetUnitId}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {activeBackTarget ? (
          <button
            className="hotspot hotspot-back"
            onClick={() => goToScreen(activeBackTarget)}
            type="button"
          >
            Back
          </button>
        ) : null}

        {activeScreen.fields?.map((field) => (
          <label className={`form-field ${field.className}`} key={field.name}>
            <span>{field.label}</span>
            <input
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              onChange={(event) => updateField(field.name, event.target.value)}
              placeholder={field.placeholder}
              type={field.type ?? "text"}
              value={authForm[field.name]}
            />
          </label>
        ))}

        {activeScreen.hasSkip ? (
          <button className="hotspot hotspot-skip" type="button" onClick={skipToFinalStep}>
            Skip
          </button>
        ) : null}

        {activeScreen.primaryLabel ? (
          <button className="hotspot hotspot-primary" type="button" onClick={goToPrimaryTarget}>
            {activeScreen.primaryLabel}
          </button>
        ) : null}

        {activeScreen.hotspots?.map((hotspot) => (
          <button
            className={`hotspot ${hotspot.className}${hotspot.rect ? " hotspot-rect" : ""}`}
            key={`${activeScreen.id}-${hotspot.className}`}
            onClick={() => handleHotspotClick(hotspot)}
            style={getHotspotStyle(hotspot)}
            type="button"
          >
            {hotspot.label}
          </button>
        ))}

        {message ? <div className="screen-message" role="status">{message}</div> : null}

        {activeScreen.showDots ? (
          <nav
            className="hotspot-dots"
            aria-label={`Intro step ${activeIndex + 1} of ${onboardingScreens.length}`}
          >
            {onboardingScreens.map((screen, index) => (
              <button
                aria-label={`Go to ${screen.title}`}
                className="hotspot-dot"
                key={screen.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
};
