// Firebase Messaging Service Worker for deepakAdmin
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDL1-axgFBZsEgHGgszYTBnII7mOaNvZyQ",
  authDomain: "sfcbakery-1d6ad.firebaseapp.com",
  projectId: "sfcbakery-1d6ad",
  storageBucket: "sfcbakery-1d6ad.firebasestorage.app",
  messagingSenderId: "477617336446",
  appId: "1:477617336446:web:975ccf06c1658f2c44a82f",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const title = payload.notification?.title || payload.data?.title || "SFC Cafe";
  const body =
    payload.notification?.body ||
    payload.data?.body ||
    `New order received - Order #${payload.data?.orderNumber || ""}`;

  const notificationOptions = {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.data?.orderId ? `order-${payload.data.orderId}` : "sfc-order",
    renotify: true,
    requireInteraction: true,
    data: {
      orderId: payload.data?.orderId,
      orderNumber: payload.data?.orderNumber,
      url: payload.data?.url || "/orders",
    },
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/orders";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
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
