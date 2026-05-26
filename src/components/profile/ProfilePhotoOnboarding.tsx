import { useState } from "react";
import { MrRentano } from "../../app/components/MrRentano";
import { RentanoTip } from "../RentanoTip";
import { ProfilePhotoCapture } from "./ProfilePhotoCapture";
import { setPhotoPromptDeferred } from "../../lib/avatarStorage";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";

export function ProfilePhotoOnboarding({
  onPhotoSaved,
  onDeferred,
}: {
  onPhotoSaved: (blob: Blob) => void;
  onDeferred: () => void;
}) {
  const [captureMode, setCaptureMode] = useState<"camera" | "library" | null>(null);
  const [libraryWarningOpen, setLibraryWarningOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col overflow-y-auto px-5 pb-8 pt-6"
      style={{ backgroundColor: "#F0F4F2" }}
    >
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col">
        <div className="mb-6 flex justify-center">
          <MrRentano size={100} />
        </div>

        <RentanoTip
          message={
            <span className="text-[15px] leading-relaxed text-gray-700">
              People trust you with their things. A real photo builds that trust — let&apos;s take
              one now.
            </span>
          }
        />

        <h1 className="mt-6 text-center text-[22px] font-bold" style={{ color: GREEN }}>
          Add your profile photo
        </h1>
        <p className="mt-2 text-center text-[14px] leading-relaxed text-gray-600">
          A clear photo of your face is required on AllByRent. No emoji or random avatars — this is
          a trust platform.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setCaptureMode("camera")}
            className="w-full rounded-2xl py-4 text-[16px] font-bold text-white shadow-sm"
            style={{ backgroundColor: CTA }}
          >
            Take photo
          </button>

          <button
            type="button"
            onClick={() => setLibraryWarningOpen(true)}
            className="w-full rounded-2xl border bg-white py-3.5 text-[15px] font-semibold"
            style={{ borderColor: "#E8E6E0", color: GREEN }}
          >
            Choose from library
          </button>
        </div>

        {libraryWarningOpen ? (
          <div
            className="mt-4 rounded-2xl border bg-white p-4"
            style={{ borderColor: "#F59E0B88" }}
          >
            <p className="text-[14px] leading-relaxed text-gray-700">
              Use a recent photo where your face is clearly visible. Library photos that don&apos;t
              look like you at pickup may delay rentals.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-gray-500"
                onClick={() => setLibraryWarningOpen(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
                onClick={() => {
                  setLibraryWarningOpen(false);
                  setCaptureMode("library");
                }}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="mt-auto pt-8 text-center text-[12px] text-gray-400 underline"
          onClick={() => {
            setPhotoPromptDeferred(true);
            onDeferred();
          }}
        >
          Remind me later
        </button>
      </div>

      <ProfilePhotoCapture
        open={captureMode !== null}
        mode={captureMode ?? "camera"}
        onClose={() => setCaptureMode(null)}
        onCaptured={(blob) => {
          setCaptureMode(null);
          onPhotoSaved(blob);
        }}
      />
    </div>
  );
}
