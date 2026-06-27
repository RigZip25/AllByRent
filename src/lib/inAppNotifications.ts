const NOTIF_KEY = "allbyrent_in_app_notifications";

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: "booking_request" | "running_late" | "return" | "general";
  rentalId?: string;
  listingId?: string;
};

export function loadInAppNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InAppNotification[];
  } catch {
    return [];
  }
}

export function pushInAppNotification(
  notification: Omit<InAppNotification, "id" | "createdAt" | "read">,
): void {
  const list = loadInAppNotifications();
  list.unshift({
    ...notification,
    id: `n-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function unreadNotificationCount(): number {
  return loadInAppNotifications().filter((n) => !n.read).length;
}

export function markInAppNotificationRead(id: string): void {
  const list = loadInAppNotifications();
  const next = list.map((n) => (n.id === id ? { ...n, read: true } : n));
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next.slice(0, 50)));
  } catch {
    /* ignore */
  }
}
