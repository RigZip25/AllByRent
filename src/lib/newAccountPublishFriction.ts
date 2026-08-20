/**
 * Soft multi-account publish notice (non-blocking).
 * Client-side only — never blocks a signed-in seller from going live.
 */

const DEVICE_KEY = "evorios:device-publish:v1";

type DevicePublishStore = {
  firstUserId?: string;
  lastUserId?: string;
  lastPublishAt?: number;
  userIds?: string[];
};

export type PublishFrictionResult =
  | { ok: true; softNotice?: string }
  | { ok: false; reason: string };

function readDevice(): DevicePublishStore {
  try {
    const raw = localStorage.getItem(DEVICE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DevicePublishStore;
  } catch {
    return {};
  }
}

function writeDevice(store: DevicePublishStore) {
  try {
    localStorage.setItem(DEVICE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

/**
 * Gate before publish: must be signed in.
 * Shared-device soft notice is optional and never blocks Go live.
 * No per-account live-listing cap (hosts can publish freely once signed in).
 */
export async function checkNewAccountPublishFriction(opts: {
  userId: string;
  isEdit?: boolean;
}): Promise<PublishFrictionResult> {
  if (opts.isEdit) return { ok: true };
  const userId = opts.userId.trim();
  if (!userId) {
    return { ok: false, reason: "Sign in to publish your listing." };
  }

  const device = readDevice();
  const knownUsers = new Set(device.userIds ?? []);
  if (device.firstUserId) knownUsers.add(device.firstUserId);
  if (device.lastUserId) knownUsers.add(device.lastUserId);

  // Soft notice only — never blocks publish.
  if (knownUsers.size > 0 && !knownUsers.has(userId)) {
    return {
      ok: true,
      softNotice: "Publishing from a shared device — keep listings accurate and neighborly.",
    };
  }

  return { ok: true };
}

/** Call after a successful publish to update device fingerprint soft state. */
export function recordDevicePublish(userId: string) {
  const id = userId.trim();
  if (!id) return;
  const device = readDevice();
  const userIds = [...new Set([...(device.userIds ?? []), id])].slice(-8);
  writeDevice({
    firstUserId: device.firstUserId || id,
    lastUserId: id,
    lastPublishAt: Date.now(),
    userIds,
  });
}
