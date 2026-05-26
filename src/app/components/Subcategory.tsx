import { useState } from "react";
import { MrRentano } from "./MrRentano";
import { Emoji } from "./Emoji";
import { BottomNav } from "./BottomNav";
import { RentanoChatSheet } from "../../components/RentanoChat";
import { subcategoriesData } from "../data/subcategories";
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
  onBack: () => void;
  onPostRequest: () => void;
  onItemSelect: (id: string) => void;
}

export function Subcategory({ category, onBack, onPostRequest, onItemSelect }: SubcategoryProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
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

  const handleShare = (platform: string) => {
    const message = `Hey! Looking for ${category} to rent near San Francisco. Anyone have one? Check AllByRent → allbyrent.app`;
    console.log(`Share to ${platform}:`, message);
  };

  const shareText = "Share with your community";
  const shareSubtext = "The more people see it, the faster you find it.";

  return (
    <div className="screen bg-[#F0F4F2] flex flex-col overflow-hidden">
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
                    onClick={() => setSelectedSubcategory(sub.id)}
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
                    onClick={() => setSelectedSubcategory(sub.id)}
                  />
                ))}
              </div>
            </div>
          </div>
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
        ) : (
          <div className="p-6 space-y-6">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to subcategories
            </button>

            <div className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <MrRentano size={80} />
              </div>

              <div className="bg-card rounded-2xl p-4 inline-block mb-8 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card rotate-45 border-l border-t border-border" />
                <p className="text-sm font-medium">
                  Nothing here yet — but you<br />can change that.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">💬</span>
                Post a Request
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tell neighbors what you need. Someone nearby might have exactly this.
              </p>
              <button
                onClick={onPostRequest}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl transition-colors font-medium text-sm"
              >
                Post a Request
              </button>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 rounded-xl p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">📢</span>
                {shareText}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {shareSubtext}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => handleShare("tiktok")}
                  className="p-3 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-lg transition-colors flex flex-col items-center gap-1"
                >
                  <span className="text-xl">🎵</span>
                  <span className="text-xs font-medium">TikTok</span>
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-3 bg-[#1877F2] hover:bg-[#1565c0] text-white rounded-lg transition-colors flex flex-col items-center gap-1"
                >
                  <span className="text-xl">📘</span>
                  <span className="text-xs font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("nextdoor")}
                  className="p-3 bg-[#00B87C] hover:bg-[#009a68] text-white rounded-lg transition-colors flex flex-col items-center gap-1"
                >
                  <span className="text-xl">🏡</span>
                  <span className="text-xs font-medium">Nextdoor</span>
                </button>
                <button
                  onClick={() => handleShare("instagram")}
                  className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors flex flex-col items-center gap-1"
                >
                  <span className="text-xl">📷</span>
                  <span className="text-xs font-medium">Instagram</span>
                </button>
              </div>

              <button
                onClick={() => handleShare("copy")}
                className="w-full p-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">🔗</span>
                <span className="text-xs font-medium">Copy Link</span>
              </button>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Be the first to list in this category.
                  <br />
                  Early listers get priority placement.
                </p>
                <button className="w-full text-primary hover:underline text-sm font-medium">
                  List an item here →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav
        activeTab="none"
        onHome={onBack}
        onPostRequest={onPostRequest}
        onRentano={() => setRentanoOpen(true)}
      />
      <RentanoChatSheet open={rentanoOpen} onClose={() => setRentanoOpen(false)} />
    </div>
  );
}
