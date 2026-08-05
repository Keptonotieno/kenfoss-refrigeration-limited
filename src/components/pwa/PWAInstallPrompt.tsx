import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 1. Detect if already installed as standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissedUntil = localStorage.getItem('kenfoss_pwa_dismissed_until');
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setShowPrompt(true);
      }
    };

    // 3. Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('[PWA] Application successfully installed to home screen');
    };

    // 4. Listen to network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // 5. Listen for Service Worker custom update event
    const handlePwaUpdate = () => setUpdateAvailable(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-update-available', handlePwaUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handlePwaUpdate);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Error during installation prompt:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('kenfoss_pwa_dismissed_until', nextWeek.toString());
  };

  const handleReloadApp = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 1. Offline Notification Bar */}
      {isOffline && (
        <div 
          id="pwa-offline-bar"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-between text-xs sm:text-sm font-medium animate-in slide-in-from-top duration-300"
        >
          <div className="flex items-center space-x-2.5 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
            <span>
              <strong>You are currently working offline.</strong> Cached pages and tools remain active.
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="ml-3 shrink-0 bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 2. New Version Update Banner */}
      {updateAvailable && (
        <div 
          id="pwa-update-banner"
          className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm animate-in zoom-in-95 duration-200 max-w-md w-[90%]"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">App Update Ready</p>
            <p className="text-slate-300 text-xs">A fresh version of Kenfoss is ready to load.</p>
          </div>
          <button
            onClick={handleReloadApp}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            Update Now
          </button>
        </div>
      )}

      {/* 3. Floating Install Banner / Trigger */}
      {showPrompt && !isInstalled && (
        <div 
          id="pwa-install-modal"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white p-4 sm:p-5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002B5B] to-slate-800 border border-cyan-500/30 flex items-center justify-center shrink-0 p-1 shadow-inner">
                <img src="/pwa-192x192.png" alt="Kenfoss App Icon" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Install Kenfoss App
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-1.5 py-0.5 rounded border border-cyan-500/30">PWA</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Get fast home-screen access & offline support for equipment booking & cold room calculations.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Install Application
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </>
  );
};
