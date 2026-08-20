import { hasAvatarPhoto, loadAvatarDataUrl } from "./avatarStorage";
import type { MediaRef } from "./mediaStore";
import type { RentalBooking } from "./rentalsStorage";
import { loadUserProfile } from "./userProfileStorage";

/**
 * Start-of-rental ID gate is complete when license photo + selfie +
 * driver-match attestation exist. Face-match stays best-effort.
 */
export function isVehicleStartIdComplete(booking: RentalBooking | null | undefined): boolean {
  if (!booking) return false;
  return Boolean(
    booking.startIdLicensePhoto &&
      booking.startIdSelfie &&
      booking.startIdCheckedAt &&
      booking.startIdDriverMatchAttested,
  );
}

export type VehicleStartIdProfileLink = {
  hasProfilePhoto: boolean;
  profilePhotoUrl: string | null;
  displayName: string;
  identityVerified: boolean;
  dateOfBirth: string | null;
};

/** Link start check to existing profile / avatar / identity badge when present. */
export function resolveVehicleStartIdProfileLink(
  userId: string | null | undefined,
): VehicleStartIdProfileLink {
  const id = userId?.trim() ?? "";
  const profile = loadUserProfile();
  const hasPhoto = Boolean(id && hasAvatarPhoto(id));
  return {
    hasProfilePhoto: hasPhoto,
    profilePhotoUrl: hasPhoto && id ? loadAvatarDataUrl(id) : profile.avatarUrl,
    displayName: profile.displayName.trim() || [profile.firstName, profile.lastName].filter(Boolean).join(" "),
    identityVerified: Boolean(profile.verification.identity),
    dateOfBirth: (profile.dateOfBirth ?? "").trim() || null,
  };
}

export type VehicleStartIdResult = {
  licensePhoto: MediaRef;
  selfie: MediaRef;
  driverMatchAttested: boolean;
  profilePhotoLinked: boolean;
  checkedAt: string;
  /** Optional DOB captured / confirmed at start ID (wires into age gate). */
  dateOfBirth?: string | null;
};

export function buildVehicleStartIdPatch(result: VehicleStartIdResult): Partial<RentalBooking> {
  return {
    startIdLicensePhoto: result.licensePhoto,
    startIdSelfie: result.selfie,
    startIdCheckedAt: result.checkedAt,
    startIdDriverMatchAttested: result.driverMatchAttested,
    startIdProfilePhotoLinked: result.profilePhotoLinked,
    startIdDateOfBirth: result.dateOfBirth?.trim() || undefined,
  };
}
