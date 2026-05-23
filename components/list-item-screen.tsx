"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  ChevronDown,
  QrCode,
  DollarSign,
  ImageIcon,
} from "lucide-react";

interface ListItemScreenProps {
  onBack: () => void;
  onSubmit: () => void;
}

const categories = [
  "Cameras & Photography",
  "Bikes & Scooters",
  "Vehicles",
  "Camping & Outdoors",
  "Tools & Equipment",
  "Audio & Music",
  "Gaming",
  "Party & Events",
  "Sports",
  "Electronics",
];

export function ListItemScreen({ onBack, onSubmit }: ListItemScreenProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [priceDay, setPriceDay] = useState("");
  const [priceWeek, setPriceWeek] = useState("");
  const [priceMonth, setPriceMonth] = useState("");
  const [generateQR, setGenerateQR] = useState(true);
  const [description, setDescription] = useState("");

  const handleAddPhoto = () => {
    // Simulate photo selection
    const demoPhotos = [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606986628253-e7a5f77cc5e8?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=400&h=400&fit=crop",
    ];
    if (photos.length < 5) {
      setPhotos([...photos, demoPhotos[photos.length % demoPhotos.length]]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const isValid = title.trim() && category && priceDay && photos.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background screen-transition">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">List an Item</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 px-4 py-4 pb-28 overflow-y-auto">
        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Photos <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Add up to 5 photos. First photo will be the cover.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-border"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] font-medium text-center py-0.5">
                    Cover
                  </div>
                )}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/80 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-background" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={handleAddPhoto}
                className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors"
              >
                {photos.length === 0 ? (
                  <>
                    <Camera className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                  </>
                ) : (
                  <Plus className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sony A7 IV Camera Kit"
            className="w-full h-12 px-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Category <span className="text-destructive">*</span>
          </label>
          <button
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="w-full h-12 px-4 rounded-xl bg-muted text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <span className={category ? "text-foreground" : "text-muted-foreground"}>
              {category || "Select a category"}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                showCategoryPicker ? "rotate-180" : ""
              }`}
            />
          </button>
          {showCategoryPicker && (
            <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                    category === cat ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item, included accessories, condition..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Pricing <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Set at least a daily rate. Weekly/monthly rates are optional.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={priceDay}
                  onChange={(e) => setPriceDay(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 pl-9 pr-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <span className="text-sm text-muted-foreground w-16">/ day *</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={priceWeek}
                  onChange={(e) => setPriceWeek(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 pl-9 pr-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <span className="text-sm text-muted-foreground w-16">/ week</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={priceMonth}
                  onChange={(e) => setPriceMonth(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 pl-9 pr-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <span className="text-sm text-muted-foreground w-16">/ month</span>
            </div>
          </div>
        </div>

        {/* QR Code Toggle */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Generate QR Code</p>
                <p className="text-xs text-muted-foreground">For easy check-in & tracking</p>
              </div>
            </div>
            <button
              onClick={() => setGenerateQR(!generateQR)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                generateQR ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${
                  generateQR ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          {generateQR && (
            <p className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg p-3">
              A unique QR code will be generated for your item. Attach it to your item so renters
              can easily check in, verify authenticity, and track rental status.
            </p>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-[390px] mx-auto">
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isValid ? (
              <>
                <ImageIcon className="w-5 h-5" />
                List Item
              </>
            ) : (
              "Complete all required fields"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
