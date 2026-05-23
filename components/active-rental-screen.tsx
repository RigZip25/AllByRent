"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  QrCode,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Phone,
  MessageCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

interface ActiveRentalScreenProps {
  onBack: () => void;
  onReturn: () => void;
}

export function ActiveRentalScreen({ onBack, onReturn }: ActiveRentalScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Demo rental start time (2 hours ago)
  const rentalStart = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const rentalEnd = new Date(Date.now() + 22 * 60 * 60 * 1000);

  // Update elapsed time
  useEffect(() => {
    if (isCheckedIn) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - rentalStart.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCheckedIn, rentalStart]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      setIsCheckedIn(true);
      setElapsedTime(Math.floor((Date.now() - rentalStart.getTime()) / 1000));
    }, 2000);
  };

  const progress = isCheckedIn
    ? ((Date.now() - rentalStart.getTime()) / (rentalEnd.getTime() - rentalStart.getTime())) * 100
    : 0;

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
          <h1 className="font-semibold text-foreground">Active Rental</h1>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Phone className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 pb-28">
        {/* Item Card */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&h=160&fit=crop"
                alt="Sony A7 IV"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground mb-1">Sony A7 IV Camera Kit</h2>
              <p className="text-sm text-muted-foreground mb-2">From Michael R.</p>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isCheckedIn
                      ? "bg-success/10 text-success"
                      : "bg-accent/30 text-accent-foreground"
                  }`}
                >
                  {isCheckedIn ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Checked In
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Pending Check-in
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Check-in */}
        {!isCheckedIn && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Scan to Check In</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find the QR code on the item and scan it to confirm pickup and activate insurance.
              </p>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base disabled:opacity-70 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Scan QR Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Rental Timer */}
        {isCheckedIn && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Rental Timer</span>
              </div>
              <span className="text-sm text-muted-foreground">24h rental</span>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-4">
              <p className="text-4xl font-mono font-bold text-foreground mb-1">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-muted-foreground">Time elapsed</p>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {rentalStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span>Return by: {rentalEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        )}

        {/* Insurance Status */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCheckedIn ? "bg-success/10" : "bg-muted"
              }`}
            >
              <Shield className={`w-6 h-6 ${isCheckedIn ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Auto-Insurance</p>
              <p className={`text-sm ${isCheckedIn ? "text-success" : "text-muted-foreground"}`}>
                {isCheckedIn ? "Active — Coverage up to $3,500" : "Activates on check-in"}
              </p>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                isCheckedIn ? "bg-success insurance-badge" : "bg-muted-foreground"
              }`}
            />
          </div>
        </div>

        {/* Item QR Code */}
        {isCheckedIn && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="qr-badge bg-muted p-3 rounded-xl">
                <QRCodeSVG
                  value="allbyrent://rental/abc123"
                  size={64}
                  level="M"
                  bgColor="transparent"
                  fgColor="var(--primary)"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">Rental QR Code</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Show this code to the owner when returning the item for quick check-out.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Owner */}
        <button className="w-full bg-card border border-border rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                alt="Michael R."
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Michael R.</p>
              <p className="text-xs text-muted-foreground">Usually responds within 5 min</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-foreground" />
          </div>
        </button>
      </div>

      {/* Bottom CTA */}
      {isCheckedIn && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
          <div className="max-w-[390px] mx-auto">
            <button
              onClick={onReturn}
              className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Start Return Process
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
