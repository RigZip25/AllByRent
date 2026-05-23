"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, ChevronRight, ArrowLeft, Shield, QrCode, Share2, MessageCircle } from "lucide-react";
import { categories, Category, Subcategory } from "@/lib/categories-data";
import { useLocale } from "@/lib/locale-context";

type ViewMode = "personal" | "professional";

interface CategoriesScreenProps {
  onBack: () => void;
  onCreateRequest: () => void;
}

export function CategoriesScreen({ onBack, onCreateRequest }: CategoriesScreenProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("personal");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.personal.some((sub) => sub.name.toLowerCase().includes(query)) ||
        cat.professional.some((sub) => sub.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  // Subcategory detail view
  if (selectedCategory) {
    const subcategories = viewMode === "personal" ? selectedCategory.personal : selectedCategory.professional;
    
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={handleBackToCategories}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">{selectedCategory.emoji}</span>
                {selectedCategory.name}
              </h1>
            </div>
          </div>

          {/* Personal/Professional Toggle */}
          <div className="px-4 pb-3">
            <div className="flex bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode("personal")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "personal"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Personal Use
              </button>
              <button
                onClick={() => setViewMode("professional")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "professional"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Professional Use
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {subcategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  className="bg-card rounded-2xl p-4 border border-border hover:border-primary hover:shadow-md transition-all text-left group"
                >
                  <div className="text-3xl mb-2">{sub.emoji}</div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-success font-medium">
                      <Shield className="w-3 h-3" />
                      Insured
                    </div>
                    <QrCode className="w-3 h-3 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nothing here yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                Be the first to list something in this category or post a request!
              </p>
              <button
                onClick={onCreateRequest}
                className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl"
              >
                Post a Request
              </button>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-4 px-4">
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Can&apos;t find what you need?</p>
                <p className="text-xs text-muted-foreground">Post a request and share with neighbors</p>
              </div>
              <button
                onClick={onCreateRequest}
                className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main categories list
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Categories</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Personal/Professional Toggle */}
        <div className="px-4 pb-3">
          <div className="flex bg-muted rounded-xl p-1">
            <button
              onClick={() => setViewMode("personal")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "personal"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Personal Use
            </button>
            <button
              onClick={() => setViewMode("professional")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "professional"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Professional Use
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredCategories.length > 0 ? (
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const subcategories = viewMode === "personal" ? category.personal : category.professional;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full bg-card rounded-2xl p-4 border border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-4 text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl">
                    {category.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subcategories.length} subcategories
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                        >
                          {sub.emoji} {sub.name.split(" ")[0]}
                        </span>
                      ))}
                      {subcategories.length > 3 && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          +{subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No categories found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
              Can&apos;t find what you&apos;re looking for? Post a request and share it with your neighbors!
            </p>
            <button
              onClick={onCreateRequest}
              className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Post a Request
            </button>
          </div>
        )}
      </div>

      {/* Bottom Banner */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-4 px-4">
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Can&apos;t find what you need?</p>
              <p className="text-xs text-muted-foreground">Post a request and share with neighbors</p>
            </div>
            <button
              onClick={onCreateRequest}
              className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
