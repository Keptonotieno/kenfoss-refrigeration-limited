import React, { useEffect } from 'react';
import { useToast, ToastData } from '../context/ToastContext';
import { useAdmin } from '../context/AdminContext';
import { 
  CheckCircle2, 
  Wrench, 
  FileText, 
  MessageSquare, 
  X, 
  PhoneCall, 
  Clock, 
  ShieldCheck,
  Building2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[200] space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <NotificationToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const NotificationToastItem: React.FC<{ toast: ToastData; onClose: () => void }> = ({ toast, onClose }) => {
  const { contactInfo } = useAdmin();
  const whatsappNum = contactInfo?.whatsappNumber || '254745411923';

  // Auto dismiss after 10 seconds unless user interacts
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 12000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleWhatsAppClick = () => {
    const text = `Hello Kenfoss Refrigeration Support, I submitted inquiry ${toast.refCode || ''} for ${toast.title}. Please confirm receipt.`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isQuote = toast.type === 'quote';
  const isBooking = toast.type === 'booking';

  return (
    <div className="pointer-events-auto bg-slate-900/95 border border-slate-700/80 dark:bg-slate-900/95 dark:border-slate-700 text-white p-4 sm:p-5 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 relative overflow-hidden space-y-3">
      {/* Accent Top Border */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        isQuote ? 'bg-gradient-to-r from-[#0057B8] to-cyan-400' : 'bg-gradient-to-r from-[#FF7A00] to-amber-400'
      }`} />

      {/* Close Icon */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        title="Dismiss confirmation"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start space-x-3 pr-6">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          isQuote ? 'bg-blue-500/15 text-[#00AEEF] border border-blue-500/30' : 'bg-amber-500/15 text-[#FF7A00] border border-amber-500/30'
        }`}>
          {isQuote ? <FileText className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Request Received Real-Time
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{toast.timestamp}</span>
          </div>
          <h4 className="text-sm font-black text-white mt-1">{toast.title}</h4>
        </div>
      </div>

      {/* Message Body */}
      <p className="text-xs text-slate-300 leading-relaxed">
        {toast.message}
      </p>

      {/* Ref Code & Details Chip */}
      {toast.refCode && (
        <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Tracking Reference</span>
            <span className="font-mono font-black text-[#00AEEF] text-sm">{toast.refCode}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Support Status</span>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Engineer Assigned
            </span>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={handleWhatsAppClick}
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Connect via WhatsApp</span>
        </button>

        <a
          href={`tel:${contactInfo.mainPhone}`}
          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center space-x-1 cursor-pointer border border-slate-700"
          title="Call Dispatch Hotline"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>Call 24/7</span>
        </a>
      </div>

    </div>
  );
};
