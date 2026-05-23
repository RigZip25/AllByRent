"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  Bell,
  Star,
  Shield,
  QrCode,
  Heart,
  Camera,
  Bike,
  Car,
  Tent,
  Wrench,
  Music2,
  Gamepad2,
  Sparkles,
  Plane,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";

const categories = [
  { id: "electronics", icon: Camera, color: "bg-primary/10 text-primary" },
  { id: "sports", icon: Bike, color: "bg-accent/30 text-accent-foreground" },
  { id: "vehicles", icon: Car, color: "bg-success/10 text-success" },
  { id: "outdoor", icon: Tent, color: "bg-chart-5/20 text-chart-5" },
  { id: "tools", icon: Wrench, color: "bg-muted text-muted-foreground" },
  { id: "music", icon: Music2, color: "bg-chart-4/20 text-chart-4" },
  { id: "gaming", icon: Gamepad2, color: "bg-destructive/10 text-destructive" },
  { id: "party", icon: Sparkles, color: "bg-primary/10 text-primary" },
];

interface Listing {
  id: number;
  title: string;
  price: number;
  period: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  owner: string;
  ownerAvatar: string;
  insured: boolean;
  hasQR: boolean;
  liked: boolean;
}

const nearbyListings: Listing[] = [
  {
    id: 1,
    title: "Sony A7 IV Camera Kit",
    price: 45,
    period: "day",
    rating: 4.9,
    reviews: 127,
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
    owner: "Michael R.",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    insured: true,
    hasQR: true,
    liked: false,
  },
  {
    id: 2,
    title: "Electric Mountain Bike",
    price: 35,
    period: "day",
    rating: 4.8,
    reviews: 89,
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
    owner: "Sarah K.",
    ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    insured: true,
    hasQR: true,
    liked: true,
  },
  {
    id: 3,
    title: "DJI Mini 3 Pro Drone",
    price: 55,
    period: "day",
    rating: 4.7,
    reviews: 64,
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop",
    owner: "David L.",
    ownerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    insured: true,
    hasQR: true,
    liked: false,
  },
  {
    id: 4,
    title: "Camping Tent 4-Person",
    price: 25,
    period: "day",
    rating: 4.9,
    reviews: 156,
    distance: "0.5 km",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
    owner: "Emma T.",
    ownerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    insured: true,
    hasQR: true,
    liked: false,
  },
];

// Mock neighbor requests
const neighborRequests = [
  {
    id: 1,
    title: "Drone for wedding",
    user: "Alex M.",
    budget: 75,
    when: "This Saturday",
  },
  {
    id: 2,
    title: "Baby stroller",
    user: "Emma L.",
    budget: 25,
    when: "Next week",
  },
  {
    id: 3,
    title: "Pressure washer",
    user: "Robert C.",
    budget: 35,
    when: "Sunday",
  },
];

interface HomeScreenProps {
  onItemClick: (item: Listing) => void;
  onChatClick: () => void;
  onRequestsClick: () => void;
  onCategoriesClick: () => void;
}

export function HomeScreen({ onItemClick, onChatClick, onRequestsClick, onCategoriesClick }: HomeScreenProps) {
  const { t, formatCurrency } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set([2]));

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="AllByRent"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <button className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                San Francisco, CA
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onChatClick}
              className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors overflow-hidden"
            >
              <Image
                src="/mr-rentano.png"
                alt="Mr. Rentano"
                width={40}
                height={40}
                className="object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </button>
            <button className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("home.search_placeholder")}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </header>

      {/* Traveler Mode Banner */}
      <section className="px-4 pt-4">
        <button className="w-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-2xl p-4 flex items-center gap-4 hover:from-primary/30 hover:to-accent/30 transition-colors">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Plane className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">{t("home.traveling")}</p>
            <p className="text-xs text-muted-foreground">{t("home.traveling_desc")}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </section>

      {/* Categories */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Categories</h2>
          <button onClick={onCategoriesClick} className="text-sm text-primary font-medium">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex flex-col items-center gap-2 min-w-[72px] ${
                selectedCategory === cat.id ? "scale-95" : ""
              } transition-transform`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedCategory === cat.id ? "bg-primary text-primary-foreground" : cat.color
                } transition-colors`}
              >
                <cat.icon className="w-6 h-6" />
              </div>
              <span
                className={`text-xs font-medium ${
                  selectedCategory === cat.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t(`cat.${cat.id}`)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Neighbor Requests Feed */}
      <section className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">{t("home.requests_feed")}</h2>
          <button onClick={onRequestsClick} className="text-sm text-primary font-medium">
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {neighborRequests.map((request) => (
            <button
              key={request.id}
              onClick={onRequestsClick}
              className="min-w-[200px] bg-card border border-border rounded-xl p-3 text-left hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{request.user}</span>
              </div>
              <p className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                {request.title}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary font-semibold">{formatCurrency(request.budget)}/day</span>
                <span className="text-muted-foreground">{request.when}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Nearby Listings */}
      <section className="px-4 pb-24 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t("home.nearby")}</h2>
          <button className="text-sm text-primary font-medium">View map</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {nearbyListings.map((item) => (
            <article
              key={item.id}
              onClick={() => onItemClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onItemClick(item)}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {/* Insurance Badge */}
                <div className="absolute top-2 left-2 insurance-badge flex items-center gap-1 bg-success/90 backdrop-blur-sm text-success-foreground text-[10px] font-semibold px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  {t("item.insurance")}
                </div>
                {/* QR Badge */}
                <div className="absolute top-2 right-2 qr-badge bg-card/90 backdrop-blur-sm p-1.5 rounded-lg">
                  <QrCode className="w-4 h-4 text-primary" />
                </div>
                {/* Like Button */}
                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                  aria-label={favorites.has(item.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(item.id) ? "fill-destructive text-destructive" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                  <span className="text-xs text-muted-foreground">({item.reviews})</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.distance}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-primary font-bold">
                    {formatCurrency(item.price)}
                    <span className="text-xs text-muted-foreground font-normal">{t("item.per_day")}</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export type { Listing };
