import { initializeApp } from "firebase/app";
import { getMessaging, isSupported, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCorcdkvKIW3HlXfzd87Rrxfr4mYTUxl9Y",
  authDomain: "clo-site-b9930.firebaseapp.com",
  projectId: "clo-site-b9930",
  storageBucket: "clo-site-b9930.firebasestorage.app",
  messagingSenderId: "911074373575",
  appId: "1:911074373575:web:19f8c4a95d8bbafaf5b3e2",
};

const app = initializeApp(firebaseConfig);

const VAPID_KEY = "BODpALFDlbc0JLm5gEbwhnyp643mFV9tfrM4vLi5bvwwgweDlTMejP2aYiaIjdxrhVF-SXXHHyuMkO8vk-Nan2E";

// ✅ SAFER export (prevents browser errors)
let messaging: any = null;

export const initMessaging = async () => {
  const supported = await isSupported();
  if (!supported) {
    console.warn("FCM not supported in this browser");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log("🔥 FCM TOKEN:", token);

    return messaging;
  } catch (err) {
    console.error("FCM init error:", err);
    return null;
  }
};