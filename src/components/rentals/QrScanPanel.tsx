import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMessages } from "../../lib/i18n/react";
import { getListingQrUrl } from "../../lib/listingQr";
import { decodeListingQrFromVideoFrame } from "../../lib/verifyListingQrPhoto";
import {
  assertRenterNearHandoff,
  formatPresenceFailure,
  isValidHandoffCoords,
  type HandoffCoords,
  type PresenceProof,
} from "../../lib/handoffPresence";
import { putMediaBlob, type MediaRef } from "../../lib/mediaStore";
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
  expectedListingId,
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
  handoffCoords,
  isVehicle,
  contactlessMode,
}: {
  open: boolean;
  phase: QrScanPhase;
  mode: "pickup" | "return";
  itemTitle: string;
  itemEmoji: string;
  expectedCode?: string;
  expectedListingId?: string;
  expectedPin?: string;
  contactlessInstructions?: string;
  alreadyConfirmed?: boolean;
  returnByLabel?: string;
  onClose: () => void;
  onScanned: () => void;
  onConfirm: (pin: string, conditionPhoto?: MediaRef | null) => void;
  onManualCode: (code: string) => void;
  onOwnerManualConfirm?: () => void;
  isHost?: boolean;
  /** Pickup/return point for geo-gated PIN (renter only). */
  handoffCoords?: HandoffCoords | null;
  isVehicle?: boolean;
  contactlessMode?: boolean;
}) {
  const { qrScan: copy } = useMessages();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [scanHint, setScanHint] = useState(() => copy.scanHint);
  const [presenceProof, setPresenceProof] = useState<PresenceProof | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [conditionPhoto, setConditionPhoto] = useState<MediaRef | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const renterNeedsPresence = !isHost;
  const hasPresence = Boolean(isHost || presenceProof);
  const hasGeoTarget = isValidHandoffCoords(handoffCoords ?? null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || phase !== "camera") return;
    let cancelled = false;
    scannedRef.current = false;
    setError(null);
    setScanHint(copy.scanHint);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError(copy.cameraUnavailable);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
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
        setError(copy.cameraAccessNeeded);
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, phase, stopStream, copy.scanHint, copy.cameraUnavailable, copy.cameraAccessNeeded]);

  useEffect(() => {
    if (!open || phase !== "camera" || error) return;
    const listingId = (expectedListingId || expectedCode || "").trim();
    if (!listingId) {
      setScanHint(copy.scanHintMissing);
      return;
    }

    let cancelled = false;
    let raf = 0;
    const tick = () => {
      if (cancelled || scannedRef.current) return;
      const video = videoRef.current;
      if (video) {
        const match = decodeListingQrFromVideoFrame(video, {
          listingId,
          qrToken: expectedCode,
          publicUrl: getListingQrUrl(listingId),
        });
        if (match) {
          scannedRef.current = true;
          setPresenceProof("qr_scan");
          setScanHint(copy.scanHintMatched);
          stopStream();
          onScanned();
          return;
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [open, phase, error, expectedListingId, expectedCode, onScanned, stopStream, copy.scanHintMissing, copy.scanHintMatched]);

  useEffect(() => {
    if (!open) {
      setManualOpen(false);
      setCodeInput("");
      setPinInput("");
      setPresenceProof(null);
      setConditionPhoto(null);
      setError(null);
      scannedRef.current = false;
    }
  }, [open]);

  const runGeoCheck = useCallback(async () => {
    if (isHost) {
      setPresenceProof("geo");
      stopStream();
      onScanned();
      return;
    }
    setGeoBusy(true);
    setError(null);
    const result = await assertRenterNearHandoff({
      target: handoffCoords,
      isVehicle,
    });
    setGeoBusy(false);
    if (!result.ok) {
      setError(
        formatPresenceFailure(result, {
          noTarget: copy.geoNoTarget,
          tooFar: copy.geoTooFar,
          geoDenied: copy.geoDenied,
          geoUnavailable: copy.geoUnavailable,
        }),
      );
      return;
    }
    setPresenceProof("geo");
    stopStream();
    onScanned();
  }, [
    isHost,
    handoffCoords,
    isVehicle,
    stopStream,
    onScanned,
    copy.geoNoTarget,
    copy.geoTooFar,
    copy.geoDenied,
    copy.geoUnavailable,
  ]);

  if (!open) return null;

  if (phase === "confirm") {
    const pinUnlocksContactless =
      mode === "pickup" &&
      Boolean(contactlessInstructions?.trim()) &&
      pinInput.length === 6 &&
      (!expectedPin || pinInput === expectedPin) &&
      hasPresence;

    return (
      <div className="fixed inset-0 z-[90] flex flex-col bg-[#F0F4F2]">
        <header className="flex items-center justify-between px-4 py-3">
          <button type="button" onClick={onClose} aria-label={copy.closeAria}>
            <X className="h-6 w-6" style={{ color: GREEN }} />
          </button>
          <p className="text-[16px] font-bold" style={{ color: GREEN }}>
            {mode === "pickup" ? copy.confirmPickup : copy.confirmReturn}
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
            {presenceProof === "qr_scan"
              ? copy.qrVerified
              : presenceProof === "geo"
                ? copy.geoVerified
                : copy.presenceRequired}
          </p>

          <div className="mt-4">
            <RentanoTip
              message={
                mode === "pickup" ? (
                  <>
                    {contactlessMode ? copy.tipPickupContactless : copy.tipPickup}
                    {returnByLabel ? copy.tipPickupReturnBy(returnByLabel) : null}
                  </>
                ) : contactlessMode ? (
                  copy.tipReturnContactless
                ) : (
                  copy.tipReturn
                )
              }
            />
          </div>

          {renterNeedsPresence && !hasPresence ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[13px] font-bold text-amber-950">{copy.presenceTitle}</p>
              <p className="mt-1 text-[12px] text-amber-900/90">{copy.presenceBody}</p>
              <button
                type="button"
                disabled={geoBusy || !hasGeoTarget}
                onClick={() => void runGeoCheck()}
                className="mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: GREEN }}
              >
                {geoBusy ? copy.geoChecking : copy.geoUnlockCta}
              </button>
              {!hasGeoTarget ? (
                <p className="mt-2 text-[12px] text-amber-900/80">{copy.geoNoTargetScanQr}</p>
              ) : null}
              {error ? <p className="mt-2 text-[12px] font-semibold text-red-700">{error}</p> : null}
            </div>
          ) : null}

          {mode === "pickup" && contactlessInstructions?.trim() ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[13px] font-bold text-amber-950">{copy.contactlessTitle}</p>
              <p className="mt-1 text-[12px] text-amber-900/90">{copy.contactlessBody}</p>
              {pinUnlocksContactless ? (
                <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                  {contactlessInstructions.trim()}
                </p>
              ) : (
                <p className="mt-3 text-[13px] italic text-gray-600">{copy.contactlessLocked}</p>
              )}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border bg-white p-4">
            <p className="text-[13px] font-bold" style={{ color: GREEN }}>
              {mode === "pickup" ? copy.enterPinPickup : copy.enterPinReturn}
            </p>
            <p className="mt-1 text-[12px] text-gray-500">
              {mode === "pickup" && contactlessInstructions?.trim()
                ? copy.pinBodyContactless
                : copy.pinBody}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              disabled={!hasPresence}
              onChange={(e) => {
                setError(null);
                setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              className="mt-3 w-full rounded-xl border px-4 py-3 text-center text-[20px] tracking-widest disabled:opacity-50"
              placeholder={copy.pinPlaceholder}
              aria-label={copy.pinAria}
            />
            {error ? <p className="mt-2 text-[12px] font-semibold text-red-700">{error}</p> : null}
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-4">
            <p className="text-[13px] font-bold" style={{ color: GREEN }}>
              {copy.conditionPhotoTitle}
            </p>
            <p className="mt-1 text-[12px] text-gray-500">{copy.conditionPhotoBody}</p>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-3 text-[13px] font-semibold text-gray-700">
              {photoBusy
                ? copy.conditionPhotoSaving
                : conditionPhoto
                  ? copy.conditionPhotoAdded
                  : copy.conditionPhotoAdd}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPhotoBusy(true);
                  void putMediaBlob(file, { kind: "image" })
                    .then((result) => {
                      if (result.ok) setConditionPhoto(result.ref);
                    })
                    .finally(() => setPhotoBusy(false));
                }}
              />
            </label>
          </div>

          <button
            type="button"
            disabled={
              !hasPresence ||
              pinInput.length !== 6 ||
              (Boolean(expectedPin) && pinInput !== expectedPin)
            }
            onClick={() => {
              if (!hasPresence) {
                setError(copy.presenceRequired);
                return;
              }
              if (expectedPin && pinInput !== expectedPin) {
                setError(copy.pinMismatch(mode === "pickup" ? "pickup" : "return"));
                return;
              }
              onConfirm(pinInput, conditionPhoto);
            }}
            className="mt-4 w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: CTA }}
          >
            {mode === "pickup" ? copy.confirmPickup : copy.confirmReturn}
          </button>

          {alreadyConfirmed ? (
            <p className="mt-3 text-center text-[12px] text-gray-500">{copy.alreadyConfirmed}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={onClose} aria-label={copy.closeAria}>
          <X className="h-6 w-6 text-white" />
        </button>
        <p className="text-[16px] font-bold text-white">
          {mode === "pickup" ? copy.scanPickup : copy.scanReturn}
        </p>
        <span className="w-6" />
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        {error && !manualOpen ? (
          <p className="max-w-[280px] px-6 text-center text-[15px] text-white/90">{error}</p>
        ) : (
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        )}
      </div>

      <div className="shrink-0 space-y-2 px-4 pb-8 pt-4">
        <p className="text-center text-[14px] font-semibold text-white">{scanHint}</p>
        <p className="text-center text-[12px] text-white/80">
          {renterNeedsPresence ? copy.stickerOrGeo : copy.stickerMustMatch}
        </p>
        {renterNeedsPresence ? (
          <button
            type="button"
            disabled={geoBusy}
            onClick={() => void runGeoCheck()}
            className="w-full rounded-xl py-3 text-[14px] font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            {geoBusy ? copy.geoChecking : copy.geoUnlockCta}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="w-full rounded-xl py-2.5 text-[14px] font-semibold text-white/90 underline"
        >
          {copy.enterCodeManually}
        </button>
        {isHost && onOwnerManualConfirm ? (
          <button
            type="button"
            onClick={onOwnerManualConfirm}
            className="w-full rounded-xl border border-white/30 py-2.5 text-[14px] font-semibold text-white"
          >
            {copy.ownerConfirms}
          </button>
        ) : null}
        {error && manualOpen === false && renterNeedsPresence ? (
          <p className="text-center text-[12px] font-semibold text-amber-200">{error}</p>
        ) : null}
      </div>

      {manualOpen ? (
        <div className="absolute inset-0 flex items-end bg-black/60 p-4">
          <div className="w-full rounded-2xl bg-white p-4">
            <p className="mb-2 text-[15px] font-bold" style={{ color: GREEN }}>
              {copy.manualTitle}
            </p>
            <p className="mb-3 text-[12px] text-gray-600">
              {renterNeedsPresence ? copy.manualNeedsPresence : copy.manualTitle}
            </p>
            <input
              type="text"
              inputMode="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.trim())}
              className="mb-3 w-full rounded-xl border px-4 py-3 text-center text-[16px]"
              placeholder={copy.manualPlaceholder}
            />
            <button
              type="button"
              disabled={codeInput.length < 4 || (renterNeedsPresence && !hasPresence)}
              onClick={() => {
                const expected = (expectedCode || expectedListingId || "").trim();
                if (
                  expected &&
                  codeInput !== expected &&
                  codeInput !== (expectedListingId || "").trim()
                ) {
                  setError(copy.codeMismatch);
                  setManualOpen(false);
                  return;
                }
                // Manual listing code alone is not presence — renters still need geo or QR camera.
                if (renterNeedsPresence && !hasPresence) {
                  setError(copy.manualNeedsPresence);
                  return;
                }
                stopStream();
                onManualCode(codeInput);
              }}
              className="w-full rounded-xl py-3 text-[15px] font-bold text-white disabled:opacity-40"
              style={{ backgroundColor: GREEN }}
            >
              {copy.verifyCode}
            </button>
            {renterNeedsPresence && !hasPresence ? (
              <button
                type="button"
                disabled={geoBusy}
                onClick={() => void runGeoCheck()}
                className="mt-2 w-full rounded-xl border py-2.5 text-[13px] font-semibold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {geoBusy ? copy.geoChecking : copy.geoUnlockCta}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
