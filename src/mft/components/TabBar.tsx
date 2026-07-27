import { Heart, Home, Map, Plus, User } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "../lib/cn";

const tabs = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/explore", icon: Map, label: "Map" },
  { to: "/trip/create", icon: Plus, label: "Create", center: true },
  { to: "/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function TabBar() {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-white/5 bg-[var(--bg-elevated)]/95 backdrop-blur-md pb-[var(--safe-bottom)]">
      <div className="flex h-[var(--tab-bar-height)] items-end justify-around px-2 pb-2">
        {tabs.map((tab) => {
          if (tab.center) {
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-gold)] text-[var(--text-inverse)] shadow-[0_8px_24px_rgba(226,176,94,0.35)] transition hover:brightness-105"
                aria-label="Создать трип"
              >
                <Plus className="h-7 w-7" strokeWidth={2.5} />
              </NavLink>
            );
          }
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-[10px]",
                  isActive
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.4 : 1.8}
                    fill={
                      tab.label === "Wishlist" && isActive
                        ? "currentColor"
                        : "none"
                    }
                  />
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
