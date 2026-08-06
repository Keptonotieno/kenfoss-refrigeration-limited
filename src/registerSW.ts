/**
 * Service Worker & Icon Cache Management for Kenfoss Progressive Web App (PWA)
 */

const ICON_ASSET_PATHS = [
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon.ico'
];

/**
 * Forces a refresh of all icon assets in the browser CacheStorage and browser HTTP cache.
 * Ensures home screen installed PWAs receive the updated Kenfoss logo immediately.
 */
export async function forceRefreshIconCache(): Promise<void> {
  if (typeof window === 'undefined') return;

  console.log('[PWA SW Update] Initiating forced icon cache purge & re-fetch...');

  try {
    // 1. Purge icon entries from main-thread CacheStorage API
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        const cache = await caches.open(key);
        for (const iconPath of ICON_ASSET_PATHS) {
          await cache.delete(iconPath);
          await cache.delete(`${iconPath}?v=3`);
          await cache.delete(`${iconPath}?v=2`);
        }
      }
      console.log('[PWA SW Update] Cleaned icon assets from all CacheStorage buckets.');
    }

    // 2. Notify active Service Worker to purge internal icon caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'CLEAR_ICON_CACHE' });
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }

    // 3. Perform network-reload fetches to populate clean HTTP cache
    await Promise.allSettled(
      ICON_ASSET_PATHS.map((iconPath) =>
        fetch(iconPath, { cache: 'reload' }).catch((err) =>
          console.warn('[PWA SW Update] Network reload fetch warning for:', iconPath, err)
        )
      )
    );

    console.log('[PWA SW Update] Icon assets successfully refreshed in browser cache.');
  } catch (error) {
    console.error('[PWA SW Update] Error during icon cache refresh:', error);
  }
}

/**
 * Registers the Service Worker and checks for icon cache updates.
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] ServiceWorker registered with scope:', registration.scope);

          // Trigger a SW update check
          registration.update().catch(() => {});

          // One-time check for icon version stamp to ensure migration to new logo
          const ICON_VERSION_KEY = 'kenfoss_icon_cache_version';
          const TARGET_VERSION = 'v4';
          const currentVer = localStorage.getItem(ICON_VERSION_KEY);

          if (currentVer !== TARGET_VERSION) {
            forceRefreshIconCache().then(() => {
              localStorage.setItem(ICON_VERSION_KEY, TARGET_VERSION);
            });
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[SW] New version detected; purging legacy icon cache...');
                    forceRefreshIconCache();
                    window.dispatchEvent(new CustomEvent('pwa-update-available'));
                  } else {
                    console.log('[SW] Content cached for offline use.');
                    window.dispatchEvent(new CustomEvent('pwa-installed'));
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('[SW] ServiceWorker registration failed:', error);
        });
    });
  }
}
