/**
 * VANGUARD Service Worker for W3C Web Push Notifications
 * Handles background push alerts even when the browser or app is closed.
 */

self.addEventListener("push", (event) => {
  if (!event.data) {
    console.warn("[VANGUARD SW] Push event received with no payload.");
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: "VANGUARD Civic Alert", body: event.data.text() };
  }

  const title = payload.title || "🚨 VANGUARD Emergency Alert";
  const options = {
    body: payload.body || "Critical civic update requires immediate field attention.",
    icon: payload.icon || "/icon",
    badge: payload.badge || "/icon",
    vibrate: payload.vibrate || [300, 150, 300, 150, 450],
    tag: payload.tag || "vanguard-" + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || "/",
      timestamp: Date.now(),
      category: payload.category || "emergency",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
