const CACHE_NAME = 'kenfoss-pwa-v4';
const DYNAMIC_CACHE_NAME = 'kenfoss-dynamic-v4';

// App shell files pre-cached on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.svg',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512.png',
  '/apple-touch-icon.png'
];

const ICON_ASSETS = [
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon.ico'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache warning:', err);
      });
    })
  );
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('[ServiceWorker] Deleting legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Force refresh icon assets in current cache
      return caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          ICON_ASSETS.map((iconUrl) => {
            return fetch(iconUrl, { cache: 'reload' })
              .then((res) => {
                if (res && res.status === 200) {
                  return cache.put(iconUrl, res);
                }
              })
              .catch((err) => console.warn('[ServiceWorker] Failed to refresh icon:', iconUrl, err));
          })
        );
      });
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests or Firebase / API calls that need real-time network
  if (req.method !== 'GET') return;
  if (
    url.origin.includes('firebase') ||
    url.origin.includes('googleapis') ||
    url.origin.includes('identitytoolkit') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Handle Page Navigations (HTML) with Network-First, then Cache, then Offline Fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(req, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse && cachedResponse.ok) return cachedResponse;
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Handle Static Assets (JS, CSS, Images, Fonts) with Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const isOK = cachedResponse && cachedResponse.ok;
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(req, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => (isOK ? cachedResponse : null));

      if (isOK) {
        return cachedResponse;
      }
      return fetchPromise;
    })
  );
});

// Message handling for client controls
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.action === 'CLEAR_ICON_CACHE' || event.data.action === 'FORCE_REFRESH_ICONS') {
    console.log('[ServiceWorker] Clearing and re-fetching icon assets in cache...');
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ICON_ASSETS.map((iconUrl) => {
          return fetch(iconUrl, { cache: 'reload' })
            .then((res) => {
              if (res && res.status === 200) {
                return cache.put(iconUrl, res);
              }
            })
            .catch((err) => console.warn('[SW] Failed icon refresh on message:', iconUrl, err));
        })
      );
    });
  }
});
