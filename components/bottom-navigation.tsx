"use client";

import { Home, MessageCircle, PlusCircle, Clock, User } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

type Screen = "home" | "search" | "list" | "rentals" | "profile";

interface BottomNavigationProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

function NavItems() {
  const { t } = useLocale();
  
  return [
    { screen: "home" as Screen, icon: Home, label: t("nav.home") },
    { screen: "search" as Screen, icon: MessageCircle, label: t("nav.requests") },
    { screen: "list" as Screen, icon: PlusCircle, label: t("nav.list") },
    { screen: "rentals" as Screen, icon: Clock, label: t("nav.rentals") },
    { screen: "profile" as Screen, icon: User, label: t("nav.profile") },
  ];
}

export function BottomNavigation({ activeScreen, onNavigate }: BottomNavigationProps) {
  const navItems = NavItems();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-30">
      <div className="max-w-[390px] mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          const isListButton = item.screen === "list";

          if (isListButton) {
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className="flex flex-col items-center gap-0.5 py-1.5 px-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center -mt-5 shadow-lg">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[56px]"
            >
              <item.icon
                className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { Screen };
