/* eslint-disable no-restricted-globals */
/** Web Push handlers — imported by Workbox service worker. */
self.addEventListener("push", (event) => {
  const data = (() => {
    try {
      return event.data?.json() ?? {};
    } catch {
      return { title: "Evorios", body: event.data?.text() ?? "New update" };
    }
  })();

  const title = typeof data.title === "string" ? data.title : "Evorios";
  const body = typeof data.body === "string" ? data.body : "You have a new notification";
  const url = typeof data.url === "string" ? data.url : "/?openNotifications=1";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/pwa-192.png",
      badge: "/pwa-192.png",
      data: { url },
      tag: typeof data.tag === "string" ? data.tag : "evorios",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string | undefined) ?? "/?openNotifications=1";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          void client.focus();
          if ("navigate" in client && typeof client.navigate === "function") {
            void client.navigate(url);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    }),
  );
});
