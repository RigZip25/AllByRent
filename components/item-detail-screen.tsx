"use client";

import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Shield,
  QrCode,
  MapPin,
  Calendar,
  MessageCircle,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import type { Listing } from "./home-screen";

interface ItemDetailScreenProps {
  item: Listing;
  onBack: () => void;
  onBook: () => void;
}

export function ItemDetailScreen({ item, onBack, onBook }: ItemDetailScreenProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out this rental on AllByRent: ${item.title}`,
          url: `https://allbyrent.app/item/${item.id}`,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background screen-transition">
      {/* Hero Image */}
      <div className="relative h-72">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
            <button className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Insurance Badge */}
        <div className="absolute bottom-4 left-4 insurance-badge flex items-center gap-2 bg-success text-success-foreground text-sm font-semibold px-3 py-2 rounded-full">
          <Shield className="w-4 h-4" />
          Auto-Insurance Included
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-28">
        {/* Title & Price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">{item.title}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="text-sm font-semibold text-foreground">{item.rating}</span>
                <span className="text-sm text-muted-foreground">({item.reviews} reviews)</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {item.distance} away
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${item.price}</p>
            <p className="text-sm text-muted-foreground">per {item.period}</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="qr-badge bg-muted p-3 rounded-xl">
              <QRCodeSVG
                value={`allbyrent://item/${item.id}`}
                size={64}
                level="M"
                bgColor="transparent"
                fgColor="var(--primary)"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Unique QR Code</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan to instantly check-in, track rental status, and verify authenticity.
              </p>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={item.ownerAvatar}
                  alt={item.owner}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center border-2 border-card">
                  <CheckCircle className="w-3 h-3 text-success-foreground" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.owner}</p>
                <p className="text-xs text-muted-foreground">Verified · Superhost</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">About this item</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Professional-grade camera kit perfect for photography enthusiasts and content creators. 
            Includes the camera body, 24-70mm f/2.8 lens, 2 batteries, charger, and carrying case. 
            Well-maintained and regularly serviced.
          </p>
        </div>

        {/* Rental Includes */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Rental includes</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Free delivery within 5mi",
              "24/7 support",
              "Auto-insurance coverage",
              "QR tracking",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <button className="w-full bg-card border border-border rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Check availability</p>
              <p className="text-xs text-muted-foreground">Available from tomorrow</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-[390px] mx-auto flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-shrink-0 w-14 h-14 rounded-xl border border-border bg-card flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={onBook}
            className="flex-1 h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            Book Now · ${item.price}/{item.period}
          </button>
        </div>
      </div>
    </div>
  );
}
