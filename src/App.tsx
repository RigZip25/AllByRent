import { useState } from "react";

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
import businessRentalsScreen from "./assets/onboarding/business-rentals.png";
import mrRentanoScreen from "./assets/onboarding/mr-rentano.png";
import rentalHubScreen from "./assets/onboarding/rental-hub.png";
import rentLocallyScreen from "./assets/onboarding/rent-locally.png";
import secureLocalFlexibleScreen from "./assets/onboarding/secure-local-flexible.png";
import welcomeScreen from "./assets/onboarding/welcome.png";

type Hotspot = {
  className: string;
  label: string;
  targetId: string;
};

type AppScreen = {
  id: string;
  title: string;
  image: string;
  hotspots?: Hotspot[];
  primaryLabel?: string;
  hasSkip?: boolean;
  showDots?: boolean;
};

const onboardingScreens: AppScreen[] = [
  {
    id: "welcome",
    title: "Welcome to All By Rent",
    image: welcomeScreen,
    primaryLabel: "Welcome to All By Rent",
    showDots: true,
  },
  {
    id: "rent-locally",
    title: "Rent locally",
    image: rentLocallyScreen,
    primaryLabel: "Next",
    hasSkip: true,
    showDots: true,
  },
  {
    id: "rental-hub",
    title: "Get what you need. Profit from what you don't.",
    image: rentalHubScreen,
    primaryLabel: "Next",
    hasSkip: true,
    showDots: true,
  },
  {
    id: "business-rentals",
    title: "Unlock Business Potential with Rentals",
    image: businessRentalsScreen,
    primaryLabel: "Next",
    hasSkip: true,
    showDots: true,
  },
  {
    id: "secure-local-flexible",
    title: "Secure. Local. Flexible.",
    image: secureLocalFlexibleScreen,
    primaryLabel: "Next",
    hasSkip: true,
    showDots: true,
  },
  {
    id: "mr-rentano",
    title: "Hi, I'm Mr. Rentano.",
    image: mrRentanoScreen,
    hasSkip: true,
    showDots: true,
    hotspots: [
      {
        className: "hotspot-explore",
        label: "Explore categories",
        targetId: "like-to-do-rent",
      },
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
    id: "login",
    title: "Login",
    image: loginScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Log in", targetId: "like-to-do-rent" },
      { className: "hotspot-auth-forgot", label: "Forgot password", targetId: "reset-password" },
      { className: "hotspot-auth-signup", label: "Sign up", targetId: "signup" },
      { className: "hotspot-auth-provider-left", label: "Apple login", targetId: "like-to-do-rent" },
      { className: "hotspot-auth-provider-right", label: "Google login", targetId: "like-to-do-rent" },
      { className: "hotspot-back", label: "Back to intro", targetId: "mr-rentano" },
    ],
  },
  {
    id: "signup",
    title: "Sign Up",
    image: signupScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Sign up", targetId: "verification-phone" },
      { className: "hotspot-auth-signin", label: "Log in", targetId: "login" },
      { className: "hotspot-auth-provider-left", label: "Apple sign up", targetId: "verification-phone" },
      { className: "hotspot-auth-provider-right", label: "Google sign up", targetId: "verification-phone" },
      { className: "hotspot-back", label: "Back to login", targetId: "login" },
    ],
  },
  {
    id: "verification-phone",
    title: "Verification Code",
    image: verificationPhoneScreen,
    hotspots: [
      { className: "hotspot-otp-area", label: "Enter verification code", targetId: "verification-code" },
      { className: "hotspot-back", label: "Back to sign up", targetId: "signup" },
    ],
  },
  {
    id: "verification-code",
    title: "Verification Code",
    image: verificationCodeScreen,
    hotspots: [
      { className: "hotspot-otp-area", label: "Complete verification", targetId: "like-to-do-rent" },
      { className: "hotspot-back", label: "Back to verification", targetId: "verification-phone" },
    ],
  },
  {
    id: "reset-password",
    title: "Reset Password",
    image: resetPasswordScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Send OTP", targetId: "create-new-password" },
      { className: "hotspot-back", label: "Back to login", targetId: "login" },
    ],
  },
  {
    id: "create-new-password",
    title: "Create New Password",
    image: createNewPasswordScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Save new password", targetId: "login" },
      { className: "hotspot-back", label: "Back to reset password", targetId: "reset-password" },
    ],
  },
  {
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
    id: "rental",
    title: "Ready to explore rentals near you?",
    image: rentalScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Sign up", targetId: "signup" },
      { className: "hotspot-auth-signin", label: "Log in", targetId: "login" },
      { className: "hotspot-back", label: "Back to choice", targetId: "like-to-do-rent" },
    ],
  },
  {
    id: "earning-your-stuff",
    title: "How much is your clutter worth?",
    image: earningYourStuffScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Sign up", targetId: "signup" },
      { className: "hotspot-auth-signin", label: "Log in", targetId: "login" },
      { className: "hotspot-back", label: "Back to choice", targetId: "like-to-do-list" },
    ],
  },
];

const screens = [...onboardingScreens, ...authScreens];

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

  return 0;
};

export const App = () => {
  const [activeIndex, setActiveIndex] = useState(getInitialStep);
  const activeScreen = screens[activeIndex];

  const goToScreen = (targetId: string) => {
    const targetIndex = screens.findIndex((screen) => screen.id === targetId);

    if (targetIndex >= 0) {
      setActiveIndex(targetIndex);
    }
  };

  const goToNextStep = () => {
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, onboardingScreens.length - 1));
  };

  const skipToFinalStep = () => {
    setActiveIndex(onboardingScreens.length - 1);
  };

  return (
    <main className="screen-shell" aria-label="All By Rent onboarding">
      <section className="phone-frame">
        <img className="figma-screen" src={activeScreen.image} alt={activeScreen.title} />

        {activeScreen.hasSkip ? (
          <button className="hotspot hotspot-skip" type="button" onClick={skipToFinalStep}>
            Skip
          </button>
        ) : null}

        {activeScreen.primaryLabel ? (
          <button className="hotspot hotspot-primary" type="button" onClick={goToNextStep}>
            {activeScreen.primaryLabel}
          </button>
        ) : null}

        {activeScreen.hotspots?.map((hotspot) => (
          <button
            className={`hotspot ${hotspot.className}`}
            key={`${activeScreen.id}-${hotspot.className}`}
            onClick={() => goToScreen(hotspot.targetId)}
            type="button"
          >
            {hotspot.label}
          </button>
        ))}

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
