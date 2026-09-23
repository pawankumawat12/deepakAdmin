// Firebase Messaging Service Worker for deepakAdmin
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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

  // If payload already has 'notification' object, browser/FCM automatically displays it.
  // Calling showNotification again causes duplicate notifications on Chrome/Edge.
  if (payload.notification) {
    console.log("[firebase-messaging-sw.js] Browser handles notification payload automatically, skipping manual showNotification.");
    return Promise.resolve();
  }

  const title = payload.data?.title || "SFC Cafe";
  const body =
    payload.data?.body ||
    `New order received - Order #${payload.data?.orderNumber || ""}`;

  const notificationOptions = {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.data?.orderId ? `order-${payload.data.orderId}` : "sfc-order",
    renotify: false,
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
