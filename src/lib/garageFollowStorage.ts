const FOLLOWS_KEY = "allbyrent_garage_follows";

export type GarageFollow = {
  hostId: string;
  displayName: string;
  followedAt: string;
  notifyNewListings: boolean;
  notifyOpenHouse: boolean;
};

export function loadGarageFollows(): GarageFollow[] {
  try {
    const raw = localStorage.getItem(FOLLOWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as GarageFollow[]) : [];
  } catch {
    return [];
  }
}

function saveGarageFollows(follows: GarageFollow[]): void {
  try {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
  } catch {
    /* ignore */
  }
}

export function isFollowingGarage(hostId: string): boolean {
  return loadGarageFollows().some((f) => f.hostId === hostId);
}

export function getGarageFollow(hostId: string): GarageFollow | null {
  return loadGarageFollows().find((f) => f.hostId === hostId) ?? null;
}

export function followGarage(params: {
  hostId: string;
  displayName: string;
  notifyNewListings?: boolean;
  notifyOpenHouse?: boolean;
}): GarageFollow {
  const existing = loadGarageFollows().filter((f) => f.hostId !== params.hostId);
  const entry: GarageFollow = {
    hostId: params.hostId,
    displayName: params.displayName,
    followedAt: new Date().toISOString(),
    notifyNewListings: params.notifyNewListings ?? true,
    notifyOpenHouse: params.notifyOpenHouse ?? true,
  };
  saveGarageFollows([entry, ...existing]);
  return entry;
}

export function unfollowGarage(hostId: string): void {
  saveGarageFollows(loadGarageFollows().filter((f) => f.hostId !== hostId));
}

export function updateGarageFollow(
  hostId: string,
  patch: Partial<Pick<GarageFollow, "notifyNewListings" | "notifyOpenHouse" | "displayName">>,
): GarageFollow | null {
  const follows = loadGarageFollows();
  const index = follows.findIndex((f) => f.hostId === hostId);
  if (index < 0) return null;
  const next = { ...follows[index]!, ...patch };
  follows[index] = next;
  saveGarageFollows(follows);
  return next;
}

export function saveGarageFollowsFromRemote(follows: GarageFollow[]): void {
  saveGarageFollows(follows);
}
