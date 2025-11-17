// sw.js (final clean version)

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// ───────────────────────────────
// 1. PRECACHE (GENERATED MANIFEST)
// ───────────────────────────────
precacheAndRoute(self.__WB_MANIFEST || []);

const OFFLINE_URL = '/offline.html';

// ───────────────────────────────
// 2. INSTALL: Precache offline.html
// ───────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-cache-v1').then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

// ───────────────────────────────
// 3. ACTIVATE
// ───────────────────────────────
self.addEventListener('activate', () => {
  self.clients.claim();
});

// ───────────────────────────────
// 4. STATIC ASSETS RUNTIME CACHING
// ───────────────────────────────
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

// ───────────────────────────────
// 5. NAVIGATION OFFLINE HANDLING
// ───────────────────────────────
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await new NetworkFirst({
        cacheName: 'pages-cache',
      }).handle({ event });
    } catch (err) {
      return caches.match(OFFLINE_URL);
    }
  }
);

// ───────────────────────────────
// 6. PUSH NOTIFICATION HANDLER
// ───────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.options?.body || '',
    icon: data.options?.icon || '/icons/icon-192.png',
    badge: data.options?.badge || '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: data.options?.tag || 'general-tag',
    data: {
      url: data.options?.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ───────────────────────────────
// 7. NOTIFICATION CLICK
// ───────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});
