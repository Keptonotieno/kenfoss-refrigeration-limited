import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, Wifi, WifiOff, RefreshCw, X, Database, ShieldCheck } from 'lucide-react';

export const FirestoreSyncStatus: React.FC = () => {
  const { showToast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [restoredBanner, setRestoredBanner] = useState<{ show: boolean; timestamp: string } | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    let internalWasOffline = !navigator.onLine;

    const triggerRestored = () => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setIsOffline(false);
      setIsFromCache(false);
      setRestoredBanner({ show: true, timestamp: nowStr });

      // Trigger high-visibility toast
      showToast({
        type: 'success',
        title: 'Firestore Connection Restored',
        message: 'Cloud database connection re-established. Real-time updates and queued mutations are fully synchronized with Kenfoss Cloud.',
        refCode: 'LIVE-SYNC-RESTORED'
      });

      // Auto-dismiss banner after 7 seconds
      setTimeout(() => {
        setRestoredBanner(prev => prev ? { ...prev, show: false } : null);
      }, 7000);
    };

    const handleOffline = () => {
      internalWasOffline = true;
      setWasOffline(true);
      setIsOffline(true);
    };

    const handleOnline = () => {
      if (internalWasOffline) {
        internalWasOffline = false;
        setWasOffline(false);
        triggerRestored();
      } else {
        setIsOffline(false);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Real-Time Firestore Snapshot Metadata Listener
    let unsub: (() => void) | null = null;
    try {
      unsub = onSnapshot(
        doc(db, 'settings', 'contact_info'),
        { includeMetadataChanges: true },
        (snap) => {
          const fromCache = snap.metadata.fromCache;
          setIsFromCache(fromCache);

          if (fromCache) {
            internalWasOffline = true;
            setWasOffline(true);
          } else if (!fromCache && (internalWasOffline || wasOffline)) {
            internalWasOffline = false;
            setWasOffline(false);
            triggerRestored();
          }
        },
        (err) => {
          console.warn('[FirestoreSyncStatus] Metadata notice:', err);
        }
      );
    } catch (e) {
      console.warn('[FirestoreSyncStatus] Listener setup notice:', e);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (unsub) unsub();
    };
  }, [showToast]);

  return (
    <>
      {/* 1. Connection Restored Success Banner */}
      {restoredBanner && restoredBanner.show && (
        <div 
          id="firestore-restored-banner"
          className="fixed top-0 left-0 right-0 z-[250] bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-3 shadow-2xl border-b border-emerald-500/50 flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top duration-300"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-300 tracking-wide uppercase text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Firestore Live Sync Active
                  </span>
                  <span className="text-[10px] text-emerald-200/80 font-mono hidden sm:inline">
                    Synced at {restoredBanner.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5 font-medium">
                  <strong>Connection Restored!</strong> Real-time database streams and queued requests are fully synchronized with Kenfoss cloud servers.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setRestoredBanner(prev => prev ? { ...prev, show: false } : null)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/50 transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Live Sync State Indicator Pill (Fixed at bottom left) */}
      <div 
        id="firestore-sync-pill"
        className="fixed bottom-4 left-4 z-[180] hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg backdrop-blur-md border transition-all duration-300 pointer-events-auto bg-slate-900/90 border-slate-700 text-slate-200"
        title={isOffline ? "Operating in cached offline mode" : isFromCache ? "Serving cached snapshot" : "Connected live to Firestore"}
      >
        <div className={`w-2 h-2 rounded-full ${
          isOffline 
            ? 'bg-amber-500 animate-ping' 
            : isFromCache 
              ? 'bg-cyan-400' 
              : 'bg-emerald-400 animate-pulse'
        }`} />
        <span className="flex items-center gap-1 font-mono">
          <Database className="w-3 h-3 text-slate-400" />
          {isOffline ? (
            <span className="text-amber-400">Sync: Offline Cache</span>
          ) : isFromCache ? (
            <span className="text-cyan-400">Sync: Local Cache</span>
          ) : (
            <span className="text-emerald-400">Firestore: Live</span>
          )}
        </span>
      </div>
    </>
  );
};
