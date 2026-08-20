import { useState } from "react";
import { ScanFace, X } from "lucide-react";
import { putMediaBlob, type MediaRef } from "../../lib/mediaStore";
import {
  buildVehicleStartIdPatch,
  resolveVehicleStartIdProfileLink,
} from "../../lib/vehicleStartIdCheck";
import { updateProfileFields } from "../../lib/userProfileStorage";
import { useMessages } from "../../lib/i18n/react";
import { useAuth } from "../../hooks/AuthProvider";
import type { RentalBooking } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";

/**
 * Start-of-rental ID gate for Vehicles.
 * Requires license photo + selfie + driver-match attestation before PIN.
 * Face-match stays best-effort (profile / identity link when present).
 */
export function VehicleStartIdGate({
  open,
  bookingId: _bookingId,
  onClose,
  onComplete,
}: {
  open: boolean;
  bookingId: string;
  onClose: () => void;
  onComplete: (patch: Partial<RentalBooking>) => void;
}) {
  const t = useMessages();
  const auth = useAuth();
  const copy = t.rentalDetail;
  const profile = resolveVehicleStartIdProfileLink(auth.userId);
  const [licensePhoto, setLicensePhoto] = useState<MediaRef | null>(null);
  const [selfie, setSelfie] = useState<MediaRef | null>(null);
  const [dob, setDob] = useState(profile.dateOfBirth ?? "");
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const savePhoto = (
    file: File | undefined,
    setter: (ref: MediaRef) => void,
  ) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    void putMediaBlob(file, { kind: "image" })
      .then((result) => {
        if (result.ok) setter(result.ref);
        else setError(copy.startIdSelfieFailed);
      })
      .catch(() => setError(copy.startIdSelfieFailed))
      .finally(() => setBusy(false));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <ScanFace className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} aria-hidden />
            <div>
              <p className="text-[15px] font-bold text-gray-900">{copy.startIdTitle}</p>
              <p className="mt-1 text-[13px] text-gray-600">{copy.startIdBody}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={copy.close}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {profile.hasProfilePhoto || profile.displayName || profile.identityVerified ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: GREEN }}
              >
                {(profile.displayName || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900">
                {profile.displayName || copy.startIdBookerFallback}
              </p>
              <p className="text-[12px] text-gray-500">
                {profile.identityVerified
                  ? copy.startIdProfileVerified
                  : profile.hasProfilePhoto
                    ? copy.startIdProfileLinked
                    : copy.startIdProfileHint}
              </p>
            </div>
          </div>
        ) : null}

        <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-3 text-[13px] font-semibold text-gray-700">
          {busy
            ? copy.startIdSaving
            : licensePhoto
              ? copy.startIdLicenseAdded
              : copy.startIdLicenseAdd}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              savePhoto(file, setLicensePhoto);
            }}
          />
        </label>

        <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-3 text-[13px] font-semibold text-gray-700">
          {busy
            ? copy.startIdSaving
            : selfie
              ? copy.startIdSelfieAdded
              : copy.startIdSelfieAdd}
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              savePhoto(file, setSelfie);
            }}
          />
        </label>

        <label className="mt-3 block text-[12px] font-semibold text-gray-700">
          {copy.startIdDobLabel}
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[14px] outline-none focus:border-[#0D5C3A]"
          />
        </label>
        <p className="mt-1 text-[11px] text-gray-500">{copy.startIdDobHint}</p>

        <label className="mt-3 flex items-start gap-2 text-[13px] text-gray-800">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={attested}
            onChange={(e) => setAttested(e.target.checked)}
          />
          <span>{copy.startIdAttest}</span>
        </label>

        <p className="mt-2 text-[12px] text-gray-500">{copy.startIdOnceHint}</p>
        {error ? <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={!licensePhoto || !selfie || !attested || !dob.trim() || busy}
          className="mt-4 w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: CTA }}
          onClick={() => {
            if (!licensePhoto || !selfie || !attested || !dob.trim()) return;
            updateProfileFields({ dateOfBirth: dob.trim() });
            onComplete(
              buildVehicleStartIdPatch({
                licensePhoto,
                selfie,
                driverMatchAttested: true,
                profilePhotoLinked: profile.hasProfilePhoto || profile.identityVerified,
                checkedAt: new Date().toISOString(),
                dateOfBirth: dob.trim(),
              }),
            );
          }}
        >
          {copy.startIdContinue}
        </button>
      </div>
    </div>
  );
}
