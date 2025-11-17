// public/sw.js - Service Worker untuk PWA
const CACHE_NAME = 'story-app-v1';
const OFFLINE_URL = '/offline.html';

// Assets yang akan di-precache saat install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/app.bundle.js',
  '/styles/main.css',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// ───────────────────────────────
// INSTALL EVENT
// ───────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ───────────────────────────────
// ACTIVATE EVENT
// ───────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ───────────────────────────────
// FETCH EVENT - CACHING STRATEGY
// ───────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network First untuk API calls
  if (url.pathname.startsWith('/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response dan simpan ke cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache First untuk assets (images, css, js)
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Network First untuk navigasi (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ───────────────────────────────
// PUSH NOTIFICATION HANDLER
// ───────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
      console.log('[SW] Push data:', data);
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      data = {
        title: 'New Notification',
        options: {
          body: event.data.text()
        }
      };
    }
  }

  const title = data.title || 'Story App';
  const options = {
    body: data.options?.body || data.body || 'You have a new notification',
    icon: data.options?.icon || '/images/icon-192x192.png',
    badge: data.options?.badge || '/images/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.options?.tag || 'story-notification',
    data: {
      url: data.options?.url || data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: data.options?.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ───────────────────────────────
// NOTIFICATION CLICK HANDLER
// ───────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah ada window yang sudah buka
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Jika tidak ada, buka window baru
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ───────────────────────────────
// NOTIFICATION CLOSE HANDLER
// ───────────────────────────────
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});