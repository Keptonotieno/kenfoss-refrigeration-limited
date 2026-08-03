import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { NotificationItem } from '../../types';
import { MessageSquare, Camera, X, Bell, ExternalLink, Volume2, VolumeX, Eye, CheckCircle2 } from 'lucide-react';

interface RealTimeAlertToast {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  imageName?: string;
  timestamp: string;
  type: string;
}

export const RealTimeAdminNotificationListener: React.FC = () => {
  const [alerts, setAlerts] = useState<RealTimeAlertToast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const isInitialLoadRef = useRef<boolean>(true);

  // Synthesize a pleasant two-tone audio alert chime
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);

      // Tone 2 (delayed accent)
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
          gain2.gain.setValueAtTime(0.2, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.3);
        } catch {
          // ignore
        }
      }, 120);
    } catch {
      // ignore autoplay policy blocks
    }
  };

  useEffect(() => {
    // Real-time Firestore snapshot listener on notifications collection with composite indexing & query optimization
    const notifQuery = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(
      notifQuery,
      (snapshot) => {
        if (isInitialLoadRef.current) {
          // First initial snapshot: ignore historic docs to avoid noisy popups on refresh
          isInitialLoadRef.current = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as Partial<NotificationItem>;
            const notifTime = data.createdAt
              ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newAlert: RealTimeAlertToast = {
              id: change.doc.id,
              title: data.title || 'New Real-Time Submission',
              message: data.message || 'New user activity received.',
              imageUrl: data.imageUrl,
              imageName: data.imageName,
              timestamp: notifTime,
              type: data.type || 'whatsapp',
            };

            playAlertChime();

            setAlerts((prev) => [newAlert, ...prev].slice(0, 3)); // Keep max 3 active alerts
          }
        });
      },
      (err) => {
        console.warn("RealTimeAdminNotificationListener snapshot listener notice:", err);
      }
    );

    return () => unsub();
  }, [soundEnabled]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <>
      {/* Real-time Pop-up Toast Container for Admin Portal */}
      <div className="fixed top-20 right-4 sm:right-6 z-[110] space-y-3 max-w-md w-full pointer-events-none">
        {alerts.map((alert) => {
          const isWhatsApp = alert.type === 'whatsapp' || alert.title.toLowerCase().includes('whatsapp');
          const hasImage = !!alert.imageUrl;

          return (
            <div
              key={alert.id}
              className="pointer-events-auto bg-slate-900/95 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/50 shadow-2xl shadow-black/80 backdrop-blur-md animate-in slide-in-from-top-5 fade-in duration-300 relative overflow-hidden space-y-3"
            >
              {/* Glowing Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-pulse" />

              {/* Close & Sound Controls */}
              <div className="absolute top-3 right-3 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss notification alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Header Badge */}
              <div className="flex items-start space-x-3 pr-14">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {hasImage ? <Camera className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Firestore Alert
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">{alert.title}</h4>
                </div>
              </div>

              {/* Message Body */}
              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                {alert.message}
              </p>

              {/* Equipment Photo Attachment Preview */}
              {hasImage && alert.imageUrl && (
                <div className="p-2 bg-slate-950/90 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 min-w-0">
                    <img
                      src={alert.imageUrl}
                      alt={alert.imageName || 'Faulty Equipment Attachment'}
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-500/50 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewImageUrl(alert.imageUrl!)}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-300 truncate flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Equipment Photo Received</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {alert.imageName || 'Faulty Equipment Inspection Photo'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewImageUrl(alert.imageUrl!)}
                    className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Photo</span>
                  </button>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge Real-Time Alert</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Photo Inspection */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Submission Photo Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black rounded-xl overflow-hidden max-h-[70vh] flex items-center justify-center border border-slate-800">
              <img
                src={previewImageUrl}
                alt="Faulty Equipment Detailed Inspection"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
