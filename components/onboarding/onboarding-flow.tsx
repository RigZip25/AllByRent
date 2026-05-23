"use client";

import { useState, useEffect } from "react";
import { SmartOnboarding } from "./smart-onboarding";
import { Locale } from "@/lib/i18n";

interface OnboardingData {
  locale: Locale;
  userType: "personal" | "business" | null;
  intent: "get" | "give" | "both" | null;
  getActions: ("rent" | "buy" | "request_gift" | null)[];
  giveActions: ("list_rent" | "sell" | "donate" | null)[];
  locationMode: "local" | "traveling" | null;
  location: string;
  travelDestination: string;
  travelRegion: "local" | "usa" | "world" | null;
}

interface OnboardingFlowProps {
  onComplete: (data: { 
    role: "owner" | "renter" | "both"; 
    initialScreen: "home" | "list";
    locale: Locale;
    fullData: OnboardingData;
  }) => void;
  onLocaleChange: (locale: Locale) => void;
}

const ONBOARDING_KEY = "allbyrent_onboarding_v3";

export function resetOnboarding() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ONBOARDING_KEY);
  }
}

export function OnboardingFlow({ onComplete, onLocaleChange }: OnboardingFlowProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem(ONBOARDING_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        onComplete(parsed);
      } catch {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [onComplete]);

  const handleComplete = (data: OnboardingData) => {
    // Determine role based on intent
    let role: "owner" | "renter" | "both" = "both";
    if (data.intent === "give") role = "owner";
    else if (data.intent === "get") role = "renter";
    
    // Determine initial screen
    const initialScreen = data.giveActions.length > 0 ? "list" as const : "home" as const;
    
    const mappedData = {
      role,
      initialScreen,
      locale: data.locale,
      fullData: data,
    };
    
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(mappedData));
    onComplete(mappedData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SmartOnboarding 
      onComplete={handleComplete} 
      onLocaleChange={onLocaleChange}
    />
  );
}
