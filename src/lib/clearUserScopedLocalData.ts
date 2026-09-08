import { clearDeviceKnownAccount, clearAuthWelcomeDone } from "./onboardingStorage";
import { createDefaultProfile, saveUserProfile } from "./userProfileStorage";

/**
 * Keys that hold the signed-in user's bookings, cart, chats, and profile on this device.
 * Intentionally leaves browse/onboarding prefs so "Explore as guest" still works.
 */
const USER_SCOPED_KEYS = [
  "allbyrent_rental_bookings",
  "allbyrent_rental_bookings_version",
  "allbyrent_rental_sync_queue",
  "allbyrent_user_profile",
  "abr_chat_messages_v1",
  "abr_chat_thread_reads_v1",
  "allbyrent_in_app_notifications",
  "evorios_open_sale_cart",
  "evorios_garage_cart",
  "evorios_garage_auth_bidder_id",
  "abr_pending_auth_email",
  "abr_auth_last_oauth_provider",
];

const USER_SCOPED_PREFIXES = [
  "allbyrent_co_hosts",
  "evorios_pending_cohost",
  "abr_passkey_setup_dismissed",
];

function shouldClearUserScopedKey(key: string): boolean {
  if (USER_SCOPED_KEYS.includes(key)) return true;
  return USER_SCOPED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/** Wipe signed-in leftovers without resetting guest explore / onboarding progress. */
export function clearUserScopedLocalData(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && shouldClearUserScopedKey(key)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* private mode */
  }

  clearDeviceKnownAccount();
  // Keep AUTH_WELCOME_DONE cleared so AuthWelcome reappears with Explore as guest.
  clearAuthWelcomeDone();
  try {
    saveUserProfile(createDefaultProfile());
  } catch {
    /* ignore */
  }
}
