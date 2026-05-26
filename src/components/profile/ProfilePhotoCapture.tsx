import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cropAvatarToJpeg } from "../../lib/avatarStorage";

const GREEN = "#0D5C3A";
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
    <div className="fixed inset-0 z-[80] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button type="button" onClick={onClose} aria-label="Close">
          <X className="h-6 w-6" />
        </button>
        <p className="text-[15px] font-semibold">Take profile photo</p>
        <span className="w-6" />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <p className="max-w-[280px] px-6 text-center text-[15px] text-white/90">{error}</p>
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
          </>
        )}
      </div>

      <div className="shrink-0 px-4 pb-8 pt-4">
        <button
          type="button"
          disabled={Boolean(error) || busy}
          onClick={() => void handleCapture()}
          className="w-full rounded-2xl py-4 text-[16px] font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: CTA }}
        >
          {busy ? "Processing…" : "Use this photo"}
        </button>
      </div>
    </div>
  );
}
