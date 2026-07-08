import { useState } from "react";
import { createPortal } from "react-dom";
import { APP_NAME } from "../../lib/brand";
import { RentanoHint } from "../RentanoHint";
import { ProfilePhotoCapture } from "./ProfilePhotoCapture";
import { setPhotoPromptDeferred } from "../../lib/avatarStorage";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";
const BORDER = "#E8E6E0";

export function ProfilePhotoOnboarding({
  onPhotoSaved,
  onDeferred,
  onOpenPersonalInfo,
  onViewPublicProfile,
}: {
  onPhotoSaved: (blob: Blob) => void;
  onDeferred: () => void;
  onOpenPersonalInfo?: () => void;
  onViewPublicProfile?: () => void;
}) {
  const [captureMode, setCaptureMode] = useState<"camera" | "library" | null>(null);
  const [libraryWarningOpen, setLibraryWarningOpen] = useState(false);

  const skipForNow = () => {
    setPhotoPromptDeferred(true);
    onDeferred();
  };

  const content = (
    <div
      className="profile-photo-onboarding fixed inset-0 flex flex-col overflow-y-auto px-5 pt-6"
      style={{
        backgroundColor: "#F0F4F2",
        paddingBottom: "max(6.5rem, calc(5.25rem + env(safe-area-inset-bottom, 0px)))",
      }}
    >
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col">
        <RentanoHint
          className="mb-6 flex justify-center"
          size={100}
          hint={
            <span className="text-[15px] leading-relaxed text-gray-700 not-italic">
              People trust you with their things. A real photo builds that trust — let&apos;s take
              one now.
            </span>
          }
        />

        <h1 className="mt-6 text-center text-[22px] font-bold" style={{ color: GREEN }}>
          Add your profile photo
        </h1>
        <p className="mt-2 text-center text-[14px] leading-relaxed text-gray-600">
          A clear photo of your face is required on {APP_NAME}. No emoji or random avatars — this is
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
            style={{ borderColor: BORDER, color: GREEN }}
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

        <div
          className="mt-8 rounded-2xl border bg-white p-4"
          style={{ borderColor: BORDER }}
        >
          <p className="text-[13px] leading-relaxed text-gray-600">
            Need to add email, your name, or preview how neighbors see you? Open full profile
            settings — you can return to your photo anytime.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={skipForNow}
              className="w-full rounded-xl py-3 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              Open full profile
            </button>
            {onOpenPersonalInfo ? (
              <button
                type="button"
                onClick={() => {
                  skipForNow();
                  onOpenPersonalInfo();
                }}
                className="w-full rounded-xl border bg-white py-3 text-[14px] font-semibold"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                Personal info &amp; email
              </button>
            ) : null}
            {onViewPublicProfile ? (
              <button
                type="button"
                onClick={() => {
                  skipForNow();
                  onViewPublicProfile();
                }}
                className="w-full rounded-xl border bg-white py-3 text-[14px] font-semibold"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                Preview public profile
              </button>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="mt-6 pb-2 text-center text-[12px] text-gray-400 underline"
          onClick={skipForNow}
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

  if (typeof document === "undefined") return content;

  return createPortal(content, document.body);
}
