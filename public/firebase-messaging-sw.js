importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCorcdkvKIW3HlXfzd87Rrxfr4mYTUxl9Y",
  authDomain: "clo-site-b9930.firebaseapp.com",
  projectId: "clo-site-b9930",
  storageBucket: "clo-site-b9930.firebasestorage.app",
  messagingSenderId: "911074373575",
  appId: "1:911074373575:web:19f8c4a95d8bbafaf5b3e2",
});

const messaging = firebase.messaging();

// 🔔 Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);

  const title = payload.notification?.title || payload.data?.title || 'New Notification';
  const body = payload.notification?.body || payload.data?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/icon.png',
    data: {
      orderId: payload.data?.order_id || payload.data?.orderId || null,
    },
  });
});

// 🔗 Handle notification click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const orderId = event.notification.data?.orderId;

  let url = '/admin/orders';
  if (orderId) {
    url = `/admin/orders/${orderId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});