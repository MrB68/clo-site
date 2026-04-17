import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { ScrollToTop } from "./components/ScrollToTop";
import { WishlistProvider } from "./contexts/WishlistContext";
import { NotificationProvider } from "./contexts/NotificationContext";


import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { initMessaging } from "../lib/firebase";

const seenMessages = new Set<string>();

let userInteracted = false;
if (typeof window !== "undefined") {
  window.addEventListener("click", () => {
    userInteracted = true;
  });
}
if (typeof window !== "undefined") {
  window.addEventListener(
    "click",
    () => {
      const audio = new Audio("/notification.mp3");
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {});
    },
    { once: true }
  );
}

export default function App() {
useEffect(() => {
  let isMounted = true;

  let unsubscribe: any;

  const setupMessaging = async () => {
    const messaging = await initMessaging();

    if (!messaging) {
      // FCM not supported
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
    }

    unsubscribe = onMessage(messaging, (payload) => {
      if (!isMounted) return;

      const messageId = (payload as any)?.messageId;
      if (messageId && seenMessages.has(messageId)) {
        return; // prevent duplicates
      }
      if (messageId) seenMessages.add(messageId);

      const title = payload.notification?.title || payload.data?.title || "New Notification";
      const body = payload.notification?.body || payload.data?.body || "";

      if (Notification.permission === "granted") {
        navigator.serviceWorker?.ready
          .then((registration) => {
            registration.showNotification(title, {
              body,
              icon: "/icon.png",
            });
          })
          .catch(() => {
            new Notification(title, {
              body,
              icon: "/icon.png",
            });
          });
      } else {
        // Notification not shown due to permission
      }

      if (userInteracted) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      }
    });
  };

  setupMessaging();

  const clickHandler = (e: any) => {
    const orderId = e.detail?.orderId;
    if (orderId) {
      window.location.href = `/admin/orders/${orderId}`;
    }
  };

  window.addEventListener("notification-click", clickHandler);

  return () => {
    isMounted = false;
    if (unsubscribe) unsubscribe();
    window.removeEventListener("notification-click", clickHandler);
  };
}, []);

  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <ProductsProvider>
            <WishlistProvider>
              <NotificationProvider>
                <RouterProvider router={router} />
              </NotificationProvider>
            </WishlistProvider>
          </ProductsProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
