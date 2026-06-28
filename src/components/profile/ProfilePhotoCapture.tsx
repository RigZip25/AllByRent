import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cropAvatarToJpeg } from "../../lib/avatarStorage";

const CTA = "#F59E0B";

type CaptureMode = "camera" | "library";

export function ProfilePhotoCapture({
  open,
  mode,
  onClose,
  onCaptured,
}: {
  open: boolean;
  mode: CaptureMode;
  onClose: () => void;
  onCaptured: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open || mode !== "camera") return;

    let cancelled = false;
    setError(null);

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera is not available in this browser. Try “Choose from library”.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
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
        setError("Camera access is needed for a trust-building profile photo.");
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, mode, stopStream]);

  useEffect(() => {
    if (open && mode === "library") {
      fileInputRef.current?.click();
    }
  }, [open, mode]);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    setBusy(true);
    try {
      const blob = await cropAvatarToJpeg(video, video.videoWidth, video.videoHeight);
      stopStream();
      onCaptured(blob);
    } catch {
      setError("Could not process photo. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("load failed"));
        img.src = url;
      });
      const blob = await cropAvatarToJpeg(img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      onCaptured(blob);
    } catch {
      setError("Could not process image. Use a clear photo of your face.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  if (mode === "library") {
    return (
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex max-h-[100dvh] min-h-[100dvh] flex-col bg-black"
      style={{ height: "100dvh" }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] text-white">
        <button type="button" onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] shrink-0">
          <X className="h-6 w-6" />
        </button>
        <p className="min-w-0 truncate text-center text-[15px] font-semibold">Take profile photo</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] shrink-0 px-1 text-[13px] font-semibold text-white/80 disabled:opacity-50"
        >
          Library
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
            <p className="max-w-[280px] text-center text-[15px] text-white/90">{error}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl px-6 py-3 text-[15px] font-bold text-white"
              style={{ backgroundColor: CTA }}
            >
              Choose from library
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <div
                className="rounded-full border-4 border-white/80"
                style={{ width: "min(72vw, 280px)", height: "min(72vw, 280px)" }}
              />
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/80 via-black/35 to-transparent pt-16"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleCapture()}
                aria-label={busy ? "Processing photo" : "Take photo"}
                aria-busy={busy}
                className="pointer-events-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white disabled:opacity-50"
              >
                <span className="h-[56px] w-[56px] rounded-full bg-white" />
              </button>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
