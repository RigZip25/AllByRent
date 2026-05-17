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
  image: string;
  fields?: FormField[];
  hotspots?: Hotspot[];
  primaryLabel?: string;
  primaryTargetId?: string;
  hasSkip?: boolean;
  showDots?: boolean;
};

type AuthForm = Record<FormFieldName, string>;

type SessionState = {
  email?: string;
  isAuthenticated: boolean;
  preference?: "list" | "rent";
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
        placeholder: "prelookstudio@gmail.com",
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
      { className: "hotspot-auth-primary", label: "Sign up", targetId: "signup" },
      { className: "hotspot-auth-signin-bottom", label: "Log in", targetId: "login" },
    ],
  },
  {
    backTargetId: "like-to-do-list",
    id: "earning-your-stuff",
    title: "How much is your clutter worth?",
    image: earningYourStuffScreen,
    hotspots: [
      { className: "hotspot-auth-primary", label: "Sign up", targetId: "signup" },
      { className: "hotspot-auth-signin-bottom", label: "Log in", targetId: "login" },
    ],
  },
];

const screens = [...onboardingScreens, ...authScreens];

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

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
  const [authForm, setAuthForm] = useState<AuthForm>(emptyAuthForm);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<SessionState>(getStoredSession);
  const [activeIndex, setActiveIndex] = useState(getInitialStep);
  const activeScreen = screens[activeIndex];

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

    if (!authForm.verificationCode) {
      setAuthForm((currentForm) => ({ ...currentForm, verificationCode: "5319" }));
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

  const choosePreference = (preference: "list" | "rent", targetId: string) => {
    updateSession({ ...session, preference });
    goToScreen(targetId);
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    switch (activeScreen.id) {
      case "login":
        if (hotspot.className.includes("primary")) {
          submitLogin(hotspot.targetId);
          return;
        }

        if (hotspot.className.includes("provider")) {
          submitProviderAuth(hotspot.targetId);
          return;
        }
        break;

      case "signup":
        if (hotspot.className.includes("primary")) {
          submitSignup(hotspot.targetId);
          return;
        }

        if (hotspot.className.includes("provider")) {
          submitProviderAuth(hotspot.targetId);
          return;
        }
        break;

      case "verification-phone":
      case "verification-code":
        if (hotspot.className === "hotspot-otp-area") {
          submitVerification(hotspot.targetId);
          return;
        }
        break;

      case "reset-password":
        if (hotspot.className.includes("primary")) {
          submitResetPassword(hotspot.targetId);
          return;
        }
        break;

      case "create-new-password":
        if (hotspot.className.includes("primary")) {
          submitNewPassword(hotspot.targetId);
          return;
        }
        break;

      case "like-to-do-rent":
      case "like-to-do-list":
        if (hotspot.className === "hotspot-choice-left") {
          choosePreference("rent", hotspot.targetId);
          return;
        }

        if (hotspot.className === "hotspot-choice-right") {
          choosePreference("list", hotspot.targetId);
          return;
        }
        break;

      default:
        break;
    }

    goToScreen(hotspot.targetId);
  };

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
    <main className="screen-shell" aria-label="All By Rent onboarding">
      <section className="phone-frame">
        <img className="figma-screen" src={activeScreen.image} alt={activeScreen.title} />

        {activeScreen.backTargetId ? (
          <button
            className="hotspot hotspot-back"
            onClick={() => goToScreen(activeScreen.backTargetId!)}
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
            className={`hotspot ${hotspot.className}`}
            key={`${activeScreen.id}-${hotspot.className}`}
            onClick={() => handleHotspotClick(hotspot)}
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
