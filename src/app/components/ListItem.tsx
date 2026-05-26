import { useState } from "react";
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Key,
  Gift,
  Check,
  Info,
} from "lucide-react";

type OfferType = "rent" | "sell" | "rentToOwn" | "gift";

interface OfferState {
  rent: boolean;
  sell: boolean;
  rentToOwn: boolean;
  gift: boolean;
}

export function ListItem({ onBack, onPublish }: { onBack: () => void; onPublish: () => void }) {
  const [selectedOffers, setSelectedOffers] = useState<OfferState>({
    rent: true,
    sell: false,
    rentToOwn: false,
    gift: false,
  });

  const [rentPrice, setRentPrice] = useState("25");
  const [sellPrice, setSellPrice] = useState("500");
  const [negotiable, setNegotiable] = useState(true);
  const [monthlyPayment, setMonthlyPayment] = useState("50");
  const [totalPrice, setTotalPrice] = useState("600");

  const toggleOffer = (type: OfferType) => {
    setSelectedOffers({ ...selectedOffers, [type]: !selectedOffers[type] });
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
        <h1 className="font-semibold flex-1">List Your Item</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-3 sm:p-4 space-y-5 sm:space-y-6 pb-24">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h2 className="font-semibold mb-1 text-center">
            How would you like to offer this?
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Select one or more options
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => toggleOffer("rent")}
            className={`w-full rounded-xl border-2 transition-all ${
              selectedOffers.rent
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedOffers.rent ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedOffers.rent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h3 className="font-semibold mb-1">RENT</h3>
                  <p className="text-sm text-muted-foreground">
                    Let others rent for a daily, weekly, or monthly rate
                  </p>
                </div>
              </div>

              {selectedOffers.rent && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Per day
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          value={rentPrice}
                          onChange={(e) => setRentPrice(e.target.value)}
                          className="w-full pl-6 pr-2 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Per week
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          value={(Number(rentPrice) * 7 * 0.9).toFixed(0)}
                          readOnly
                          className="w-full pl-6 pr-2 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Per month
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          value={(Number(rentPrice) * 30 * 0.8).toFixed(0)}
                          readOnly
                          className="w-full pl-6 pr-2 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Minimum rental period
                    </label>
                    <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                      <option>1 day</option>
                      <option>2 days</option>
                      <option>3 days</option>
                      <option>1 week</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Security deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Optional"
                        className="w-full pl-7 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => toggleOffer("sell")}
            className={`w-full rounded-xl border-2 transition-all ${
              selectedOffers.sell
                ? "border-blue-500 bg-blue-500/5"
                : "border-border bg-card hover:border-blue-500/30"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedOffers.sell ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedOffers.sell ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h3 className="font-semibold mb-1">SELL</h3>
                  <p className="text-sm text-muted-foreground">
                    Offer your item for sale at a fixed price
                  </p>
                </div>
              </div>

              {selectedOffers.sell && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Sale price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        className="w-full pl-7 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-500/20"
                    />
                    <span>Price is negotiable</span>
                  </label>
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => toggleOffer("rentToOwn")}
            className={`w-full rounded-xl border-2 transition-all ${
              selectedOffers.rentToOwn
                ? "border-purple-500 bg-purple-500/5"
                : "border-border bg-card hover:border-purple-500/30"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedOffers.rentToOwn
                      ? "bg-purple-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedOffers.rentToOwn ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Key className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">RENT TO OWN</h3>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly payments with ownership transfer
                  </p>
                </div>
              </div>

              {selectedOffers.rentToOwn && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Monthly payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          value={monthlyPayment}
                          onChange={(e) => setMonthlyPayment(e.target.value)}
                          className="w-full pl-7 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Total price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          value={totalPrice}
                          onChange={(e) => setTotalPrice(e.target.value)}
                          className="w-full pl-7 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-3 text-xs">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold ml-1">
                      {Math.ceil(Number(totalPrice) / Number(monthlyPayment))} months
                    </span>
                  </div>
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => toggleOffer("gift")}
            className={`w-full rounded-xl border-2 transition-all ${
              selectedOffers.gift
                ? "border-accent bg-accent/5"
                : "border-border bg-card hover:border-accent/30"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedOffers.gift ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selectedOffers.gift ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Gift className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h3 className="font-semibold mb-1">GIFT</h3>
                  <p className="text-sm text-muted-foreground">
                    Give away for free · Pickup only
                  </p>
                </div>
              </div>

              {selectedOffers.gift && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <div className="bg-accent/10 rounded-lg p-3 text-sm">
                    <p className="font-medium mb-1">Free — no payment</p>
                    <p className="text-xs text-muted-foreground">
                      Pickup only
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Why I'm giving this away (optional)
                    </label>
                    <textarea
                      placeholder="Share your reason..."
                      rows={2}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4">
        <button
          onClick={onPublish}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl transition-colors font-medium"
        >
          Publish Listing
        </button>
      </div>
    </div>
  );
}
