import { useState } from "react";
import { ShellTour } from "./ShellTour";
import { EmptySubcategoryShelf } from "./EmptySubcategoryShelf";
import { Emoji } from "./Emoji";
import { BottomNav } from "./BottomNav";
import { RentanoChatSheet } from "../../components/RentanoChat";
import { subcategoriesData } from "../data/subcategories";
import type { AppMode } from "../../lib/appMode";
import { isShellTourDone, markShellTourDone } from "../../lib/tourStorage";
import {
  ArrowLeft,
  Shield,
  QrCode,
  Heart,
  Star,
} from "lucide-react";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

function findSubcategoryLabel(category: string, subId: string): string {
  const data = subcategoriesData[category];
  if (!data) return "this shelf";
  const match = [...data.personal, ...data.professional].find((sub) => sub.id === subId);
  return match?.label ?? "this shelf";
}

function SubcategoryCard({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 border bg-white transition-colors hover:border-[#1A9E6E]"
      style={{
        minHeight: 112,
        padding: 14,
        borderRadius: 16,
        borderColor: BORDER,
      }}
    >
      <Emoji emoji={emoji} size={52} />
      <span
        className="line-clamp-2 w-full px-0.5 text-center text-[14px] font-semibold leading-snug"
        style={{ color: "#888" }}
      >
        {label}
      </span>
    </button>
  );
}

interface ItemCardProps {
  title: string;
  price: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  offerType: string;
  onSelect: () => void;
}

function ItemCard({ title, price, rating, reviews, distance, image, offerType, onSelect }: ItemCardProps) {
  const offerColors: Record<string, string> = {
    Rent: "bg-primary",
    Buy: "bg-blue-500",
    "Rent to Own": "bg-purple-500",
    Gift: "bg-accent",
  };

  return (
    <button
      onClick={onSelect}
      className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all text-left"
    >
      <div className="relative aspect-square bg-[#F0F4F2]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Emoji emoji="📷" size={32} />
          <span className="text-xs text-muted-foreground">Photo by owner</span>
        </div>

        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Auto-Insurance</span>
        </div>

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-md">
          <QrCode className="w-4 h-4 text-foreground" />
        </div>

        <button className="absolute top-10 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-md hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{title}</h3>
          <span className="text-sm font-bold text-primary ml-2">${price}/day</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="font-medium text-foreground">{rating}</span>
            <span>({reviews})</span>
          </div>
          <span>·</span>
          <span>{distance}</span>
        </div>

        <div className={`${offerColors[offerType] || "bg-primary"} text-white text-xs px-2 py-1 rounded-md inline-block`}>
          {offerType}
        </div>
      </div>
    </button>
  );
}

interface SubcategoryProps {
  category: string;
  appMode: AppMode;
  onBack: () => void;
  onPostRequest: () => void;
  onStartListing: () => void;
  onItemSelect: (id: string) => void;
  onHome: () => void;
  onRentals: () => void;
  onFourthTab: () => void;
  onProfile: () => void;
}

export function Subcategory({
  category,
  appMode,
  onBack,
  onPostRequest,
  onStartListing,
  onItemSelect,
  onHome,
  onRentals,
  onFourthTab,
  onProfile,
}: SubcategoryProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [postTourActive, setPostTourActive] = useState(false);
  const [rentanoOpen, setRentanoOpen] = useState(false);

  const categoryData = subcategoriesData[category];
  const personalSubcategories = categoryData?.personal || [];
  const professionalSubcategories = categoryData?.professional || [];

  // Mock data - in real app, this would come from props or API
  const hasItemsInSubcategory = false; // Set to true to see items

  const mockItems = [
    {
      id: "1",
      title: "Power Drill Set",
      price: "15",
      rating: 4.8,
      reviews: 24,
      distance: "0.3 mi",
      image: "🔨",
      offerType: "Rent",
    },
    {
      id: "2",
      title: "Circular Saw",
      price: "20",
      rating: 5.0,
      reviews: 12,
      distance: "0.5 mi",
      image: "🪚",
      offerType: "Rent to Own",
    },
  ];

  const handleSubcategorySelect = (subId: string) => {
    if (!isShellTourDone()) {
      setSelectedSubcategory(subId);
      setTourOpen(true);
      return;
    }
    setSelectedSubcategory(subId);
    setPostTourActive(false);
  };

  const finishTour = () => {
    markShellTourDone();
    setTourOpen(false);
    setPostTourActive(true);
  };

  const handleBackFromShelf = () => {
    setSelectedSubcategory(null);
    setPostTourActive(false);
  };

  const handleShare = (platform: string) => {
    const subLabel = selectedSubcategory
      ? findSubcategoryLabel(category, selectedSubcategory)
      : category;
    const message =
      appMode === "earn"
        ? `I'm listing ${subLabel} on AllByRent — be an early host in our neighborhood! allbyrent.app`
        : `Looking for ${subLabel} to rent near me on AllByRent. Join and help fill local shelves → allbyrent.app`;
    console.log(`Share to ${platform}:`, message);
  };

  const showEmptyState = selectedSubcategory && !tourOpen && !hasItemsInSubcategory;
  const subcategoryLabel = selectedSubcategory
    ? findSubcategoryLabel(category, selectedSubcategory)
    : "";

  return (
    <div className="screen bg-[#F0F4F2] flex flex-col overflow-hidden">
      {tourOpen ? (
        <ShellTour appMode={appMode} onComplete={finishTour} onSkip={finishTour} />
      ) : null}

      <div className="shrink-0 bg-white border-b px-4 py-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-[#F0F4F2] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: GREEN_DARK }} />
          </button>
          <h1 className="text-[17px] font-bold flex-1 truncate" style={{ color: GREEN_DARK }}>{category}</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {!selectedSubcategory ? (
          <div className="p-4 space-y-6">
            <div>
              <h2 className="font-bold text-[15px] mb-3" style={{ color: GREEN }}>Personal Use</h2>
              <div className="grid grid-cols-2 gap-[10px]">
                {personalSubcategories.map((sub) => (
                  <SubcategoryCard
                    key={sub.id}
                    emoji={sub.emoji}
                    label={sub.label}
                    onClick={() => handleSubcategorySelect(sub.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-bold text-[15px] mb-3" style={{ color: GREEN_DARK }}>Professional Use</h2>
              <div className="grid grid-cols-2 gap-[10px]">
                {professionalSubcategories.map((sub) => (
                  <SubcategoryCard
                    key={sub.id}
                    emoji={sub.emoji}
                    label={sub.label}
                    onClick={() => handleSubcategorySelect(sub.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : showEmptyState ? (
          <EmptySubcategoryShelf
            category={category}
            subcategoryLabel={subcategoryLabel}
            appMode={appMode}
            postTour={postTourActive}
            onBack={handleBackFromShelf}
            onPostRequest={onPostRequest}
            onStartListing={onStartListing}
            onShare={handleShare}
          />
        ) : hasItemsInSubcategory ? (
          <div className="p-4 space-y-4">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to subcategories
            </button>

            <div className="grid grid-cols-2 gap-3">
              {mockItems.map((item) => (
                <ItemCard
                  key={item.id}
                  title={item.title}
                  price={item.price}
                  rating={item.rating}
                  reviews={item.reviews}
                  distance={item.distance}
                  image={item.image}
                  offerType={item.offerType}
                  onSelect={() => onItemSelect(item.id)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <BottomNav
        activeTab="none"
        appMode={appMode}
        onHome={onHome}
        onRentals={onRentals}
        onRentano={() => setRentanoOpen(true)}
        onFourthTab={onFourthTab}
        onProfile={onProfile}
      />
      <RentanoChatSheet
        open={rentanoOpen}
        onClose={() => setRentanoOpen(false)}
        context={{ screen: "subcategory", appMode }}
      />
    </div>
  );
}
