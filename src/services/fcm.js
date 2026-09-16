import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDL1-axgFBZsEgHGgszYTBnII7mOaNvZyQ",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "sfcbakery-1d6ad.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "sfcbakery-1d6ad",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "sfcbakery-1d6ad.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "477617336446",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:477617336446:web:975ccf06c1658f2c44a82f",
};

const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  "BBIIh2bWEqkyE8pGRaseGoz4KoOckWsXsuNcfz-zd5RKP6fvAEhq6whhy4cG9AA6zgnRKlkm7eZZ6GAvqhiNmGQ";

let messaging = null;

export function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.warn("[FCM Admin] Notifications or Service Workers not supported in this browser.");
    return null;
  }

  if (!messaging) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      messaging = getMessaging(app);
    } catch (err) {
      console.error("[FCM Admin] Failed to initialize Firebase Messaging:", err);
      return null;
    }
  }

  return messaging;
}

/**
 * Request notification permission, register service worker, and retrieve FCM token.
 */
export async function requestAdminPushToken() {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[FCM Admin] Notification permission was not granted:", permission);
      return null;
    }

    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) return null;

    // Register our Firebase messaging service worker and wait until ready
    let registration = null;
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        registration = await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn("[FCM Admin] Service worker registration warning:", swErr);
      }
    }

    let currentToken = null;
    try {
      currentToken = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration || undefined,
      });
    } catch (tokenErr) {
      console.warn("[FCM Admin] Initial getToken failed, clearing stale token cache and retrying...", tokenErr?.message);
      try {
        await deleteToken(messagingInstance);
      } catch (_) {
        // Ignore if no existing token
      }
      // Retry once after clearing stale/corrupted credentials
      currentToken = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration || undefined,
      });
    }

    if (currentToken) {
      console.log("[FCM Admin] FCM Device Token obtained successfully.");
      return currentToken;
    } else {
      console.warn("[FCM Admin] No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("[FCM Admin] Error retrieving FCM token:", error);
    return null;
  }
}

/**
 * Subscribe to foreground messages when the admin tab is open.
 */
export function onForegroundFcmMessage(callback) {
  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, (payload) => {
    console.log("[FCM Admin] Foreground push message received:", payload);
    if (callback) {
      callback(payload);
    }
  });
}
