"use client";

import { useState } from "react";
import { HomeScreen, type Listing } from "@/components/home-screen";
import { ItemDetailScreen } from "@/components/item-detail-screen";
import { MrRentanoChat } from "@/components/mr-rentano-chat";
import { ListItemScreen } from "@/components/list-item-screen";
import { ActiveRentalScreen } from "@/components/active-rental-screen";
import { RentalRequestScreen } from "@/components/rental-request-screen";
import { RequestsFeedScreen } from "@/components/requests-feed-screen";
import { CategoriesScreen } from "@/components/categories-screen";
import { BottomNavigation, type Screen } from "@/components/bottom-navigation";
import { OnboardingFlow, resetOnboarding } from "@/components/onboarding/onboarding-flow";
import { LocaleProvider, useLocale } from "@/lib/locale-context";
import { locales, localeNames } from "@/lib/i18n";
import { Globe, ChevronDown, RotateCcw } from "lucide-react";

type AppScreen =
  | { type: "home" }
  | { type: "detail"; item: Listing }
  | { type: "chat" }
  | { type: "list" }
  | { type: "rental" }
  | { type: "search" }
  | { type: "profile" }
  | { type: "request" }
  | { type: "requests-feed" }
  | { type: "categories" };

interface OnboardingData {
  role: "owner" | "renter" | "both";
  initialScreen: "home" | "list";
  locale?: string;
}

function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-2 right-2 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span>{localeNames[locale]}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  locale === loc 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ResetOnboardingButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={() => {
        resetOnboarding();
        onReset();
      }}
      className="fixed bottom-24 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-destructive/90 backdrop-blur-sm rounded-full shadow-lg text-xs font-medium text-destructive-foreground hover:bg-destructive transition-colors"
      title="Reset onboarding (for testing)"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      <span>Reset</span>
    </button>
  );
}

function AppContent() {
  const { setLocale } = useLocale();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>({ type: "home" });
  const [navScreen, setNavScreen] = useState<Screen>("home");

  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setOnboardingComplete(true);
    
    // Set locale if provided
    if (data.locale) {
      setLocale(data.locale as any);
    }
    
    // Set initial screen based on role
    if (data.initialScreen === "list") {
      setCurrentScreen({ type: "list" });
      setNavScreen("list");
    } else {
      setCurrentScreen({ type: "home" });
      setNavScreen("home");
    }
  };

  const handleLocaleChange = (locale: any) => {
    setLocale(locale);
  };

  const handleNavigate = (screen: Screen) => {
    setNavScreen(screen);
    if (screen === "home") {
      setCurrentScreen({ type: "home" });
    } else if (screen === "list") {
      setCurrentScreen({ type: "list" });
    } else if (screen === "rentals") {
      setCurrentScreen({ type: "rental" });
    } else if (screen === "search") {
      setCurrentScreen({ type: "requests-feed" });
    } else if (screen === "profile") {
      setCurrentScreen({ type: "profile" });
    }
  };

  const handleItemClick = (item: Listing) => {
    setCurrentScreen({ type: "detail", item });
  };

  const handleChatClick = () => {
    setCurrentScreen({ type: "chat" });
  };

  const handleRequestsClick = () => {
    setCurrentScreen({ type: "requests-feed" });
    setNavScreen("search");
  };

  const handleCategoriesClick = () => {
    setCurrentScreen({ type: "categories" });
  };

  const handleBack = () => {
    setCurrentScreen({ type: "home" });
    setNavScreen("home");
  };

  const handleResetOnboarding = () => {
    setOnboardingComplete(false);
    setOnboardingData(null);
    setCurrentScreen({ type: "home" });
    setNavScreen("home");
  };

  // Show onboarding if not complete
  if (!onboardingComplete) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete} 
        onLocaleChange={handleLocaleChange}
      />
    );
  }

  const showNav =
    currentScreen.type === "home" ||
    currentScreen.type === "requests-feed" ||
    currentScreen.type === "profile";

  return (
    <div className="mobile-frame">
      <LanguageSelector />
      <ResetOnboardingButton onReset={handleResetOnboarding} />
      
      {currentScreen.type === "home" && (
        <HomeScreen 
          onItemClick={handleItemClick} 
          onChatClick={handleChatClick}
          onRequestsClick={handleRequestsClick}
          onCategoriesClick={handleCategoriesClick}
        />
      )}

      {currentScreen.type === "detail" && (
        <ItemDetailScreen
          item={currentScreen.item}
          onBack={handleBack}
          onBook={() => {
            setCurrentScreen({ type: "rental" });
            setNavScreen("rentals");
          }}
        />
      )}

      {currentScreen.type === "chat" && <MrRentanoChat onBack={handleBack} />}

      {currentScreen.type === "list" && (
        <ListItemScreen
          onBack={handleBack}
          onSubmit={() => {
            setCurrentScreen({ type: "home" });
            setNavScreen("home");
          }}
        />
      )}

      {currentScreen.type === "rental" && (
        <ActiveRentalScreen
          onBack={handleBack}
          onReturn={() => {
            setCurrentScreen({ type: "home" });
            setNavScreen("home");
          }}
        />
      )}

      {currentScreen.type === "request" && (
        <RentalRequestScreen
          onBack={() => setCurrentScreen({ type: "requests-feed" })}
          onPost={() => {
            setCurrentScreen({ type: "requests-feed" });
          }}
        />
      )}

      {currentScreen.type === "requests-feed" && (
        <RequestsFeedScreen
          onBack={handleBack}
          onCreateRequest={() => setCurrentScreen({ type: "request" })}
        />
      )}

      {currentScreen.type === "categories" && (
        <CategoriesScreen
          onBack={handleBack}
          onCreateRequest={() => setCurrentScreen({ type: "request" })}
        />
      )}

      {currentScreen.type === "profile" && (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center px-8 pb-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Your Profile</h2>
          <p className="text-sm text-muted-foreground text-center">
            Manage your listings, reviews, verification status, and account settings.
          </p>
          {onboardingData && (
            <div className="mt-4 px-4 py-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-primary font-medium">
                Mode: {onboardingData.role === "owner" ? "Listing items" : "Renting items"}
              </p>
            </div>
          )}
        </div>
      )}

      {showNav && <BottomNavigation activeScreen={navScreen} onNavigate={handleNavigate} />}
    </div>
  );
}

export default function AllByRentApp() {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
}
