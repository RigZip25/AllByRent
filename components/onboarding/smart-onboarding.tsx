"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Building2,
  User,
  Package,
  Search,
  DollarSign,
  Globe,
  Plane,
  Home,
  TrendingUp,
  Shield,
  QrCode,
  Share2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Check,
  Heart,
  Gift,
  ShoppingCart,
  Tag,
  HandHeart,
  Users,
  Recycle,
  Leaf,
} from "lucide-react";
import { Locale, localeNames, locales } from "@/lib/i18n";

type UserType = "personal" | "business" | null;
type Intent = "get" | "give" | "both" | null;
type GetAction = "rent" | "buy" | "request_gift" | null;
type GiveAction = "list_rent" | "sell" | "donate" | null;
type LocationMode = "local" | "traveling" | null;

interface OnboardingData {
  locale: Locale;
  userType: UserType;
  intent: Intent;
  getActions: GetAction[];
  giveActions: GiveAction[];
  locationMode: LocationMode;
  location: string;
  travelDestination: string;
  travelRegion: "local" | "usa" | "world" | null;
}

interface SmartOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onLocaleChange: (locale: Locale) => void;
}

// Concept slides data
const CONCEPT_SLIDES = [
  {
    icon: Recycle,
    title: "The Sharing Revolution",
    description: "Every home holds thousands in unused items. Every neighbor needs something you own.",
    stat: "$3 trillion",
    statLabel: "idle assets globally",
  },
  {
    icon: Users,
    title: "Social Rental Network",
    description: "Connect with neighbors, travelers, and businesses. Rent, buy, sell, or gift — all in one place.",
    stat: "6 actions",
    statLabel: "in one platform",
  },
  {
    icon: Leaf,
    title: "New Economy",
    description: "Why buy new when you can borrow? Why throw away when someone needs it? Build a sustainable future.",
    stat: "Zero",
    statLabel: "waste philosophy",
  },
];

export function SmartOnboarding({ onComplete, onLocaleChange }: SmartOnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    locale: "en",
    userType: null,
    intent: null,
    getActions: [],
    giveActions: [],
    locationMode: null,
    location: "",
    travelDestination: "",
    travelRegion: null,
  });
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Detect browser language on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language.split("-")[0] as Locale;
      if (locales.includes(browserLang)) {
        setData((prev) => ({ ...prev, locale: browserLang }));
      }
    }
  }, []);

  const detectLocation = () => {
    setDetectingLocation(true);
    setTimeout(() => {
      setData((prev) => ({ ...prev, location: "San Francisco, CA" }));
      setDetectingLocation(false);
    }, 1500);
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const handleLocaleSelect = (locale: Locale) => {
    setData((prev) => ({ ...prev, locale }));
    onLocaleChange(locale);
  };

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <LanguageStep
            key="language"
            selected={data.locale}
            onSelect={(locale) => {
              handleLocaleSelect(locale);
              nextStep();
            }}
          />
        )}
        {step === 1 && (
          <ConceptStep key="concept" onNext={nextStep} onBack={prevStep} />
        )}
        {step === 2 && (
          <UserTypeStep
            key="userType"
            selected={data.userType}
            onSelect={(userType) => {
              setData((prev) => ({ ...prev, userType }));
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {step === 3 && (
          <IntentStep
            key="intent"
            selected={data.intent}
            onSelect={(intent) => {
              setData((prev) => ({ ...prev, intent }));
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {step === 4 && (
          <ActionsStep
            key="actions"
            intent={data.intent}
            getActions={data.getActions}
            giveActions={data.giveActions}
            onUpdate={(updates) => setData((prev) => ({ ...prev, ...updates }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 5 && (
          <LocationStep
            key="location"
            data={data}
            detectingLocation={detectingLocation}
            onDetectLocation={detectLocation}
            onUpdate={(updates) => setData((prev) => ({ ...prev, ...updates }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 6 && (
          <ShowcaseStep
            key="showcase"
            data={data}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Step 0: Welcome Screen (Apple-style)
function LanguageStep({
  selected,
  onSelect,
}: {
  selected: Locale;
  onSelect: (locale: Locale) => void;
}) {
  const [showLanguages, setShowLanguages] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-gradient-to-b from-background via-background to-primary/5"
    >
      {/* Language selector at top */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-card"
        >
          <Globe className="w-4 h-4" />
          {localeNames[selected]}
        </button>
      </div>

      {/* Language dropdown */}
      <AnimatePresence>
        {showLanguages && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 bg-card border border-border rounded-xl shadow-lg p-2 z-50 max-h-80 overflow-y-auto"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => {
                  onSelect(locale);
                  setShowLanguages(false);
                }}
                className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                  selected === locale
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Hello in multiple languages - Apple style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-light text-foreground tracking-tight">Hello</h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-2xl text-muted-foreground font-light"
          >
            {selected === "ru" ? "Привет" : 
             selected === "es" ? "Hola" : 
             selected === "zh" ? "你好" : 
             selected === "hi" ? "नमस्ते" : 
             selected === "ar" ? "مرحبا" : 
             selected === "pt" ? "Ola" : 
             selected === "fr" ? "Bonjour" : 
             selected === "de" ? "Hallo" : 
             selected === "ja" ? "こんにちは" : 
             selected === "ko" ? "안녕하세요" : "Welcome"}
          </motion.div>
        </motion.div>

        {/* Mr. Rentano */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Image
            src="/mr-rentano.png"
            alt="Mr. Rentano"
            width={140}
            height={140}
            className="rounded-3xl shadow-lg"
          />
        </motion.div>

        {/* AI Platform badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">AI-Powered Platform</span>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <h2 className="text-xl font-semibold text-foreground">AllByRent</h2>
          <p className="text-muted-foreground mt-1">The Social Rental Network</p>
        </motion.div>

        {/* Features preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: Shield, label: "Insured" },
            { icon: QrCode, label: "QR Track" },
            { icon: Sparkles, label: "AI Match" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ delay: 1.2 }}
        className="px-6 pb-8"
      >
        <button
          onClick={() => onSelect(selected)}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </motion.div>
  );
}

// Step 1: Concept Introduction
function ConceptStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (currentSlide < CONCEPT_SLIDES.length - 1) {
      const timer = setTimeout(() => setCurrentSlide((s) => s + 1), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  const slide = CONCEPT_SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-6"
    >
      <button onClick={onBack} className="text-muted-foreground text-sm mb-4 self-start">
        ← Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <IconComponent className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">{slide.title}</h1>
            <p className="text-muted-foreground max-w-xs">{slide.description}</p>

            <div className="mt-8 bg-card border border-border rounded-2xl p-6">
              <div className="text-3xl font-bold text-primary">{slide.stat}</div>
              <div className="text-sm text-muted-foreground">{slide.statLabel}</div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {CONCEPT_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? "w-6 bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {currentSlide === CONCEPT_SLIDES.length - 1 ? "Get Started" : "Skip intro"}
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// Step 2: User Type (Personal / Business)
function UserTypeStep({
  selected,
  onSelect,
  onBack,
}: {
  selected: UserType;
  onSelect: (type: UserType) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col p-6"
    >
      <button onClick={onBack} className="text-muted-foreground text-sm mb-4 self-start">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Image src="/mr-rentano.png" alt="Mr. Rentano" width={50} height={50} className="rounded-full" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Who are you?</h1>
          <p className="text-sm text-muted-foreground">This helps us personalize your experience</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <button
          onClick={() => onSelect("personal")}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            selected === "personal" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${selected === "personal" ? "bg-primary/20" : "bg-muted"}`}>
              <User className={`w-6 h-6 ${selected === "personal" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">Individual</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Rent, buy, sell, or share with neighbors and travelers
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect("business")}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            selected === "business" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${selected === "business" ? "bg-primary/20" : "bg-muted"}`}>
              <Building2 className={`w-6 h-6 ${selected === "business" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">Business</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Rent equipment, manage fleet, B2B transactions
              </p>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// Step 3: Intent (Get / Give / Both)
function IntentStep({
  selected,
  onSelect,
  onBack,
}: {
  selected: Intent;
  onSelect: (intent: Intent) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col p-6"
    >
      <button onClick={onBack} className="text-muted-foreground text-sm mb-4 self-start">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Image src="/mr-rentano.png" alt="Mr. Rentano" width={50} height={50} className="rounded-full" />
        <div>
          <h1 className="text-xl font-bold text-foreground">What brings you here?</h1>
          <p className="text-sm text-muted-foreground">Choose your primary goal</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <button
          onClick={() => onSelect("get")}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            selected === "get" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${selected === "get" ? "bg-primary/20" : "bg-muted"}`}>
              <Search className={`w-6 h-6 ${selected === "get" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">I need something</h3>
              <p className="text-sm text-muted-foreground">Rent, buy, or request a gift</p>
            </div>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
        </button>

        <button
          onClick={() => onSelect("give")}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            selected === "give" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${selected === "give" ? "bg-primary/20" : "bg-muted"}`}>
              <Package className={`w-6 h-6 ${selected === "give" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">I have something to share</h3>
              <p className="text-sm text-muted-foreground">List for rent, sell, or donate</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </button>

        <button
          onClick={() => onSelect("both")}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            selected === "both" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${selected === "both" ? "bg-primary/20" : "bg-muted"}`}>
              <Share2 className={`w-6 h-6 ${selected === "both" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Both — full participation</h3>
              <p className="text-sm text-muted-foreground">Join the circular economy</p>
            </div>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// Step 4: Specific Actions
function ActionsStep({
  intent,
  getActions,
  giveActions,
  onUpdate,
  onNext,
  onBack,
}: {
  intent: Intent;
  getActions: GetAction[];
  giveActions: GiveAction[];
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const showGet = intent === "get" || intent === "both";
  const showGive = intent === "give" || intent === "both";

  const toggleGetAction = (action: GetAction) => {
    if (!action) return;
    const newActions = getActions.includes(action)
      ? getActions.filter((a) => a !== action)
      : [...getActions, action];
    onUpdate({ getActions: newActions });
  };

  const toggleGiveAction = (action: GiveAction) => {
    if (!action) return;
    const newActions = giveActions.includes(action)
      ? giveActions.filter((a) => a !== action)
      : [...giveActions, action];
    onUpdate({ giveActions: newActions });
  };

  const canContinue = (showGet && getActions.length > 0) || (showGive && giveActions.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col p-6"
    >
      <button onClick={onBack} className="text-muted-foreground text-sm mb-4 self-start">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Image src="/mr-rentano.png" alt="Mr. Rentano" width={50} height={50} className="rounded-full" />
        <div>
          <h1 className="text-xl font-bold text-foreground">What would you like to do?</h1>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-6">
        {showGet && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" /> I WANT TO GET
            </h2>
            <div className="space-y-3">
              <ActionButton
                selected={getActions.includes("rent")}
                onClick={() => toggleGetAction("rent")}
                icon={Package}
                title="Rent"
                description="Borrow items temporarily"
                color="primary"
              />
              <ActionButton
                selected={getActions.includes("buy")}
                onClick={() => toggleGetAction("buy")}
                icon={ShoppingCart}
                title="Buy"
                description="Purchase items from neighbors"
                color="success"
              />
              <ActionButton
                selected={getActions.includes("request_gift")}
                onClick={() => toggleGetAction("request_gift")}
                icon={Gift}
                title="Request as Gift"
                description="Ask if someone can donate"
                color="accent"
              />
            </div>
          </div>
        )}

        {showGive && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> I WANT TO GIVE
            </h2>
            <div className="space-y-3">
              <ActionButton
                selected={giveActions.includes("list_rent")}
                onClick={() => toggleGiveAction("list_rent")}
                icon={Tag}
                title="List for Rent"
                description="Earn by renting out your items"
                color="primary"
              />
              <ActionButton
                selected={giveActions.includes("sell")}
                onClick={() => toggleGiveAction("sell")}
                icon={DollarSign}
                title="Sell"
                description="Sell items you no longer need"
                color="success"
              />
              <ActionButton
                selected={giveActions.includes("donate")}
                onClick={() => toggleGiveAction("donate")}
                icon={HandHeart}
                title="Donate"
                description="Gift items to those in need"
                color="accent"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={`w-full py-4 rounded-xl font-semibold mt-6 flex items-center justify-center gap-2 transition-all ${
          canContinue
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function ActionButton({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  color,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Package;
  title: string;
  description: string;
  color: "primary" | "success" | "accent";
}) {
  const colorClasses = {
    primary: selected ? "border-primary bg-primary/5" : "border-border",
    success: selected ? "border-success bg-success/5" : "border-border",
    accent: selected ? "border-accent bg-accent/5" : "border-border",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${colorClasses[color]} bg-card hover:border-primary/50`}
    >
      <div className={`p-2 rounded-lg ${selected ? `bg-${color}/20` : "bg-muted"}`}>
        <Icon className={`w-5 h-5 ${selected ? `text-${color}` : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {selected && <Check className="w-5 h-5 text-primary" />}
    </button>
  );
}

// Step 5: Location
function LocationStep({
  data,
  detectingLocation,
  onDetectLocation,
  onUpdate,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  detectingLocation: boolean;
  onDetectLocation: () => void;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = data.locationMode && (data.location || data.travelDestination);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col p-6"
    >
      <button onClick={onBack} className="text-muted-foreground text-sm mb-4 self-start">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Image src="/mr-rentano.png" alt="Mr. Rentano" width={50} height={50} className="rounded-full" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Where are you?</h1>
          <p className="text-sm text-muted-foreground">We will find items near you</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <button
          onClick={() => onUpdate({ locationMode: "local", travelRegion: null })}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            data.locationMode === "local" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${data.locationMode === "local" ? "bg-primary/20" : "bg-muted"}`}>
              <Home className={`w-6 h-6 ${data.locationMode === "local" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">I am home</h3>
              <p className="text-sm text-muted-foreground">Connect with local community</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onUpdate({ locationMode: "traveling" })}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            data.locationMode === "traveling" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${data.locationMode === "traveling" ? "bg-primary/20" : "bg-muted"}`}>
              <Plane className={`w-6 h-6 ${data.locationMode === "traveling" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">I am traveling</h3>
              <p className="text-sm text-muted-foreground">Rent at your destination</p>
            </div>
          </div>
        </button>

        {/* Location input for local */}
        {data.locationMode === "local" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={data.location}
                onChange={(e) => onUpdate({ location: e.target.value })}
                placeholder="Your location"
                className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={onDetectLocation}
                disabled={detectingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg"
              >
                <Navigation className={`w-5 h-5 ${detectingLocation ? "animate-spin" : ""}`} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Travel options */}
        {data.locationMode === "traveling" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <div className="flex gap-3">
              <button
                onClick={() => onUpdate({ travelRegion: "usa" })}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                  data.travelRegion === "usa" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">🇺🇸</span>
                <p className="text-sm font-medium text-foreground mt-1">Within USA</p>
              </button>
              <button
                onClick={() => onUpdate({ travelRegion: "world" })}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                  data.travelRegion === "world" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">🌍</span>
                <p className="text-sm font-medium text-foreground mt-1">International</p>
              </button>
            </div>

            <div className="relative">
              <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={data.travelDestination}
                onChange={(e) => onUpdate({ travelDestination: e.target.value })}
                placeholder="Where are you going?"
                className="w-full pl-12 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={`w-full py-4 rounded-xl font-semibold mt-6 flex items-center justify-center gap-2 transition-all ${
          canContinue
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// Step 6: Showcase
function ShowcaseStep({
  data,
  onComplete,
  onBack,
}: {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}) {
  const getActionLabels = data.getActions.map((a) => {
    if (a === "rent") return "Rent items";
    if (a === "buy") return "Buy items";
    if (a === "request_gift") return "Request gifts";
    return "";
  });

  const giveActionLabels = data.giveActions.map((a) => {
    if (a === "list_rent") return "List for rent";
    if (a === "sell") return "Sell items";
    if (a === "donate") return "Donate items";
    return "";
  });

  const allActions = [...getActionLabels, ...giveActionLabels].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col p-6"
    >
      <button onClick={onBack} className="text-muted-foreground text-sm mb-4 self-start">
        ← Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <Image src="/mr-rentano.png" alt="Mr. Rentano" width={100} height={100} className="rounded-full" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mt-6">You are all set!</h1>
        <p className="text-muted-foreground mt-2">Welcome to the sharing economy</p>

        <div className="w-full max-w-sm mt-8 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 text-left">
            <div className="text-xs text-muted-foreground mb-2">YOUR PROFILE</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground capitalize">{data.userType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">
                  {data.locationMode === "traveling" ? data.travelDestination : data.location}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-left">
            <div className="text-xs text-muted-foreground mb-2">YOUR GOALS</div>
            <div className="flex flex-wrap gap-2">
              {allActions.map((action, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {action}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-primary/10 rounded-xl p-3">
              <div className="text-xl font-bold text-primary">2.4K</div>
              <div className="text-xs text-muted-foreground">Items nearby</div>
            </div>
            <div className="bg-success/10 rounded-xl p-3">
              <div className="text-xl font-bold text-success">847</div>
              <div className="text-xs text-muted-foreground">Neighbors</div>
            </div>
            <div className="bg-accent/10 rounded-xl p-3">
              <div className="text-xl font-bold text-accent">$34K</div>
              <div className="text-xs text-muted-foreground">Earned/mo</div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        Enter AllByRent
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
