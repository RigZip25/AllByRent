import {
  ArrowLeft,
  Star,
  QrCode,
  Shield,
  Truck,
  Headphones,
  ScanLine,
  MessageCircle,
  CheckCircle2,
  Share2,
  Calendar,
  Camera,
} from "lucide-react";

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
  onBook: () => void;
}

export function ItemDetail({ itemId, onBack, onBook }: ItemDetailProps) {
  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">Item Details</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 pb-24">
        <div className="relative aspect-square bg-[#F0F4F2] flex flex-col items-center justify-center gap-3">
          <Camera className="w-16 h-16 text-primary" />
          <span className="text-sm text-muted-foreground">Photo by owner</span>

          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Auto-Insurance Included</span>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold flex-1">DSLR Camera</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">$35</div>
                <div className="text-sm text-muted-foreground">/day</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-semibold">5.0</span>
              </div>
              <span className="text-muted-foreground">(12 reviews)</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">0.5 mi away</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium flex items-center gap-1.5">
                <span>🔄</span>
                <span>Rent</span>
              </span>
              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <span>💰</span>
                <span>Buy</span>
              </span>
              <span className="px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <span>🔑</span>
                <span>Rent to Own</span>
              </span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-primary/20 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-foreground" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold mb-1">Unique QR Code</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Scan to instantly check-in, track rental status, and verify
                  authenticity
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">
                JD
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">John Davis</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Verified owner · 47 rentals
                </p>
              </div>

              <button className="flex-shrink-0 p-2 hover:bg-muted rounded-full transition-colors">
                <MessageCircle className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">About this item</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional Canon DSLR camera with 24-70mm lens. Perfect for
              events, portraits, and everyday photography. Comes with battery,
              charger, memory card, and carrying case. Great condition, well
              maintained.
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Rental includes</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">Free delivery within 5mi</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">Auto-insurance coverage</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">24/7 support</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ScanLine className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">QR tracking system</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-card border border-border py-3 rounded-xl flex items-center justify-between px-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Check availability</span>
            </div>
            <span className="text-sm text-primary">View calendar</span>
          </button>
        </div>
      </div>

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4 flex gap-3">
        <button className="flex-shrink-0 border border-border py-3 px-5 rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>

        <button
          onClick={onBook}
          className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl transition-colors font-medium"
        >
          Book Now · $35/day
        </button>
      </div>
    </div>
  );
}
