self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, badge, url, tag } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || "/icon.svg",
      badge: badge || "/badge.png",
      tag: tag || "taskflow-notification",
      data: { url },
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Open Task" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
