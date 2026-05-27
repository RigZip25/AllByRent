import { useMemo, useState } from "react";
import { hasPostRequestContext, type ShelfPrefill } from "../../lib/shelfListings";
import {
  ArrowLeft,
  Wrench,
  Bike,
  Camera,
  Gamepad2,
  Music,
  Home,
  Calendar,
  Share2,
  Copy,
} from "lucide-react";
import { MrRentano } from "./MrRentano";

const categories = [
  { id: "tools", label: "Tools", icon: <Wrench className="w-6 h-6" /> },
  { id: "sports", label: "Sports", icon: <Bike className="w-6 h-6" /> },
  { id: "photo", label: "Photo", icon: <Camera className="w-6 h-6" /> },
  { id: "gaming", label: "Gaming", icon: <Gamepad2 className="w-6 h-6" /> },
  { id: "music", label: "Music", icon: <Music className="w-6 h-6" /> },
  { id: "home", label: "Home", icon: <Home className="w-6 h-6" /> },
];

const radiusOptions = ["5mi", "10mi", "25mi", "50mi"];

function buildPrefillDescription(prefill: ShelfPrefill | null | undefined): string {
  if (!prefill?.subcategory && !prefill?.category) return "";
  const parts: string[] = [];
  const query = (prefill?.query ?? "").trim();
  if (prefill.subcategory) {
    parts.push(`Looking for ${prefill.subcategory}`);
    if (prefill.category) parts[0] += ` (${prefill.category})`;
  } else if (prefill.category) {
    parts.push(`Looking for items in ${prefill.category}`);
  }
  if (query) parts.push(`matching "${query}"`);
  if (prefill.city) parts.push(`near ${prefill.city}`);
  return `${parts.join(" ")}.`;
}

export function PostRequest({
  prefill,
  onBack,
  onPost,
}: {
  prefill?: ShelfPrefill | null;
  onBack: () => void;
  onPost: () => void;
}) {
  const prefillDescription = useMemo(() => buildPrefillDescription(prefill), [prefill]);
  const lockedContext = hasPostRequestContext(prefill);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState(prefillDescription);
  const [selectedRadius, setSelectedRadius] = useState("10mi");
  const [budget, setBudget] = useState(25);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDateRange = () => {
    if (!startDate && !endDate) return "Select dates";
    if (!endDate) return `From ${new Date(startDate).toLocaleDateString()}`;
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
  };

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">Post a Request</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-3 sm:p-4 space-y-5 sm:space-y-6 pb-24">
        <div className="flex items-start gap-3">
          <MrRentano size={40} className="flex-shrink-0" />
          <div className="flex-1">
            <h2 className="font-semibold text-lg mb-1">
              {lockedContext ? "Tell neighbors what you need" : "Can't find it? Ask your neighbors"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lockedContext
                ? "Add details below — hosts in your area will see your request"
                : "Someone nearby might have exactly what you need"}
            </p>
          </div>
        </div>

        {lockedContext && prefill ? (
          <div
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm"
            aria-live="polite"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Request for
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {prefill.subcategory} in {prefill.category}
              {prefill.city ? (
                <>
                  {" "}
                  <span className="font-normal text-muted-foreground">· {prefill.city}</span>
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        {!lockedContext ? (
          <div>
            <label className="block text-sm font-medium mb-3">Select category</label>

            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === cat.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`${
                      selectedCategory === cat.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium mb-3">
            Describe what you need
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., Professional camera with tripod for weekend event..."
            rows={4}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Location radius
          </label>

          <div className="flex gap-2">
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => setSelectedRadius(radius)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedRadius === radius
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {radius}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Date range
          </label>

          <button
            onClick={() => setShowDatePicker(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className={`text-sm ${startDate ? "text-foreground" : "text-muted-foreground"}`}>
              {formatDateRange()}
            </span>
          </button>
        </div>

        {showDatePicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Select Date Range</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                onClick={() => setShowDatePicker(false)}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl transition-colors font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-3">
            Budget per day
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">I'd pay up to</span>
              <span className="text-xl font-bold text-primary">${budget}</span>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$5</span>
              <span>$100+</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share with your community
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            The more people see it, the faster you find it.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-2.5 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-lg transition-colors text-sm font-medium">
              <span className="text-base">🎵</span>
              TikTok
            </button>

            <button className="flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#1565c0] text-white rounded-lg transition-colors text-sm font-medium">
              <Share2 className="w-4 h-4" />
              Facebook
            </button>

            <button className="flex items-center justify-center gap-2 py-2.5 bg-[#00B87C] hover:bg-[#009a68] text-white rounded-lg transition-colors text-sm font-medium">
              <Home className="w-4 h-4" />
              Nextdoor
            </button>

            <button className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white rounded-lg transition-opacity text-sm font-medium">
              <Camera className="w-4 h-4" />
              Instagram
            </button>

            <button className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg transition-colors text-sm font-medium">
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4">
        <button
          onClick={onPost}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl transition-colors font-medium"
        >
          Post Request
        </button>
      </div>
    </div>
  );
}
