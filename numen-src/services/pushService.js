// Push Notification Service - Connects to backend push notification endpoints
import apiClient from "./apiClient";

/**
 * Get the VAPID public key from the server
 */
export const getVapidPublicKey = async () => {
  const response = await apiClient.get("/notifications/vapid-public-key/");
  return response.data.vapid_public_key;
};

/**
 * Subscribe browser to push notifications
 * @param {PushSubscription} subscription - The browser push subscription object
 */
export const subscribeToPush = async (subscription) => {
  const response = await apiClient.post("/notifications/subscribe/", {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
      auth: arrayBufferToBase64(subscription.getKey("auth")),
    },
  });
  return response.data;
};

/**
 * Unsubscribe from push notifications
 * @param {string} endpoint - The subscription endpoint to remove
 */
export const unsubscribeFromPush = async (endpoint) => {
  const response = await apiClient.post("/notifications/unsubscribe/", {
    endpoint,
  });
  return response.data;
};

/**
 * Convert ArrayBuffer to base64 string (required for push subscription keys)
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array (for applicationServerKey)
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request notification permission and subscribe to push
 * Returns the subscription if successful, null otherwise
 */
export const requestPushSubscription = async () => {
  // Check if push is supported
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported");
    return null;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  try {
    // Get VAPID key from server
    const vapidPublicKey = await getVapidPublicKey();

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend
    await subscribeToPush(subscription);

    console.log("✅ Push subscription successful");
    return subscription;
  } catch (error) {
    console.error("❌ Push subscription failed:", error);
    return null;
  }
};

/**
 * Check if user is already subscribed to push
 */
export const checkPushSubscription = async () => {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error("Error checking push subscription:", error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications completely
 */
export const removePushSubscription = async () => {
  try {
    const subscription = await checkPushSubscription();
    if (subscription) {
      // Unsubscribe from backend
      await unsubscribeFromPush(subscription.endpoint);
      // Unsubscribe locally
      await subscription.unsubscribe();
      console.log("✅ Push unsubscription successful");
    }
    return true;
  } catch (error) {
    console.error("❌ Push unsubscription failed:", error);
    return false;
  }
};
