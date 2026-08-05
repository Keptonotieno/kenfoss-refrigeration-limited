/**
  * Register Service Worker for Kenfoss Progressive Web App (PWA)
  */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] ServiceWorker registration successful with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[SW] New content is available; please refresh.');
                    window.dispatchEvent(new CustomEvent('pwa-update-available'));
                  } else {
                    console.log('[SW] Content is cached for offline use.');
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
