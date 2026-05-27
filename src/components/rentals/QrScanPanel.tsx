import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { RentanoTip } from "../RentanoTip";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";

export type QrScanPhase = "camera" | "confirm" | "manual";

export function QrScanPanel({
  open,
  phase,
  mode,
  itemTitle,
  itemEmoji,
  expectedCode,
  expectedPin,
  contactlessInstructions,
  alreadyConfirmed,
  returnByLabel,
  onClose,
  onScanned,
  onConfirm,
  onManualCode,
  onOwnerManualConfirm,
  isHost,
}: {
  open: boolean;
  phase: QrScanPhase;
  mode: "pickup" | "return";
  itemTitle: string;
  itemEmoji: string;
  expectedCode?: string;
  expectedPin?: string;
  contactlessInstructions?: string;
  alreadyConfirmed?: boolean;
  returnByLabel?: string;
  onClose: () => void;
  onScanned: () => void;
  onConfirm: () => void;
  onManualCode: (code: string) => void;
  onOwnerManualConfirm?: () => void;
  isHost?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [pinInput, setPinInput] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || phase !== "camera") return;
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera is not available in this browser. Use manual code entry.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("Camera access is needed to scan the QR code on the item.");
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, phase, stopStream]);

  useEffect(() => {
    if (!open) {
      setManualOpen(false);
      setCodeInput("");
      setPinInput("");
    }
  }, [open]);

  if (!open) return null;

  if (phase === "confirm") {
    const pinUnlocksContactless =
      mode === "pickup" &&
      Boolean(contactlessInstructions?.trim()) &&
      pinInput.length === 6 &&
      (!expectedPin || pinInput === expectedPin);

    return (
      <div className="fixed inset-0 z-[90] flex flex-col bg-[#F0F4F2]">
        <header className="flex items-center justify-between px-4 py-3">
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-6 w-6" style={{ color: GREEN }} />
          </button>
          <p className="text-[16px] font-bold" style={{ color: GREEN }}>
            Confirm {mode === "pickup" ? "pickup" : "return"}
          </p>
          <span className="w-6" />
        </header>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div
            className="mb-4 flex aspect-video items-center justify-center rounded-2xl text-6xl"
            style={{ backgroundColor: "#E8E6E0" }}
          >
            {itemEmoji}
          </div>
          <h2 className="text-[18px] font-bold" style={{ color: GREEN }}>
            {itemTitle}
          </h2>
          <p className="mt-1 text-[14px] text-gray-600">
            QR scan verified · PIN required
          </p>

          <div className="mt-4">
            <RentanoTip
              message={
                mode === "pickup" ? (
                  <>
                    Item received! Your rental starts now.
                    {returnByLabel ? ` Return by ${returnByLabel}.` : null}
                  </>
                ) : (
                  "All done! We'll notify the owner."
                )
              }
            />
          </div>

          {mode === "pickup" && contactlessInstructions?.trim() ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[13px] font-bold text-amber-950">Contactless access details</p>
              <p className="mt-1 text-[12px] text-amber-900/90">
                Step-by-step access instructions and codes unlock at check-in with PIN — not
                before. Your pickup address is on the rental screen so you can travel here
                first.
              </p>
              {pinUnlocksContactless ? (
                <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                  {contactlessInstructions.trim()}
                </p>
              ) : (
                <p className="mt-3 text-[13px] italic text-gray-600">
                  Enter the correct 6-digit pickup PIN below to view access codes and
                  instructions.
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border bg-white p-4">
            <p className="text-[13px] font-bold" style={{ color: GREEN }}>
              Enter the {mode === "pickup" ? "pickup" : "return"} PIN
            </p>
            <p className="mt-1 text-[12px] text-gray-500">
              This scan only works inside the AllByRent app for the renter/host on this booking.
              The PIN prevents random scans
              {mode === "pickup" && contactlessInstructions?.trim()
                ? " and unlocks contactless access details (codes and steps)."
                : "."}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setError(null);
                setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              className="mt-3 w-full rounded-xl border px-4 py-3 text-center text-[20px] tracking-widest"
              placeholder="000000"
              aria-label="6-digit PIN"
            />
            {error ? (
              <p className="mt-2 text-[12px] font-semibold text-red-700">{error}</p>
            ) : null}
          </div>

          {mode === "pickup" ? (
            <button
              type="button"
              className="mt-4 w-full rounded-xl border py-3 text-[14px] font-semibold"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              Take a photo of the item condition now
            </button>
          ) : null}

          <button
            type="button"
            disabled={alreadyConfirmed || pinInput.length !== 6}
            onClick={() => {
              if (alreadyConfirmed) {
                setError("Already confirmed.");
                return;
              }
              if (expectedPin && pinInput !== expectedPin) {
                setError("PIN doesn't match. Ask your counterparty for the correct PIN.");
                return;
              }
              onConfirm();
            }}
            className="mt-4 w-full rounded-2xl py-4 text-[16px] font-bold text-white"
            style={{ backgroundColor: CTA }}
          >
            {alreadyConfirmed
              ? "Already confirmed"
              : `Confirm ${mode === "pickup" ? "pickup" : "return"}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button type="button" onClick={onClose} aria-label="Close">
          <X className="h-6 w-6" />
        </button>
        <p className="text-[15px] font-semibold">
          Scan QR — {mode === "pickup" ? "pickup" : "return"}
        </p>
        <span className="w-6" />
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        {error ? (
          <p className="max-w-[280px] px-6 text-center text-[15px] text-white/90">{error}</p>
        ) : (
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        )}
      </div>

      <div className="shrink-0 space-y-2 px-4 pb-8 pt-4">
        <button
          type="button"
          disabled={Boolean(error)}
          onClick={() => {
            stopStream();
            onScanned();
          }}
          className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: CTA }}
        >
          {error ? "Camera unavailable" : "Simulate QR scan (demo)"}
        </button>
        <p className="text-center text-[12px] text-white/80">
          Tip: scanning is not enough — you’ll still need the 6‑digit PIN from your counterparty.
        </p>
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="w-full rounded-xl py-2.5 text-[14px] font-semibold text-white/90 underline"
        >
          Enter code manually
        </button>
        {isHost && onOwnerManualConfirm ? (
          <button
            type="button"
            onClick={onOwnerManualConfirm}
            className="w-full rounded-xl border border-white/30 py-2.5 text-[14px] font-semibold text-white"
          >
            Owner confirms manually
          </button>
        ) : null}
      </div>

      {manualOpen ? (
        <div className="absolute inset-0 flex items-end bg-black/60 p-4">
          <div className="w-full rounded-2xl bg-white p-4">
            <p className="mb-2 text-[15px] font-bold" style={{ color: GREEN }}>
              6-digit check-in code
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mb-3 w-full rounded-xl border px-4 py-3 text-center text-[20px] tracking-widest"
              placeholder="000000"
            />
            <button
              type="button"
              disabled={codeInput.length !== 6}
              onClick={() => {
                if (expectedCode && codeInput !== expectedCode) {
                  setError("Code doesn't match. Try again or scan the QR.");
                  setManualOpen(false);
                  return;
                }
                stopStream();
                onManualCode(codeInput);
              }}
              className="w-full rounded-xl py-3 text-[15px] font-bold text-white disabled:opacity-40"
              style={{ backgroundColor: GREEN }}
            >
              Verify code
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
