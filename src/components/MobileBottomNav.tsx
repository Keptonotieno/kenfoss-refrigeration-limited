import React from 'react';
import { Phone, MessageSquare, Wrench } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface MobileBottomNavProps {
  onOpenBooking: (type?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenBooking }) => {
  const { contactInfo } = useAdmin();
  const whatsappNum = contactInfo?.whatsappNumber || '254745411923';

  return (
    <nav 
      aria-label="Quick mobile actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 shadow-2xl transition-all"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))'
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`tel:${contactInfo?.mainPhone || '+254745411923'}`}
          className="flex flex-col items-center justify-center min-h-[48px] py-2 px-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold active:scale-95 transition-transform shadow-xs"
        >
          <Phone className="w-4 h-4 text-[#FF7A00] mb-0.5 shrink-0" />
          <span className="truncate max-w-full">Call Now</span>
        </a>

        <a
          href={`https://wa.me/${whatsappNum}?text=Hello%20Kenfoss%20Refrigeration,%20I%20need%20urgent%20engineering%20support.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-h-[48px] py-2 px-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold active:scale-95 transition-transform shadow-xs"
        >
          <MessageSquare className="w-4 h-4 text-white mb-0.5 shrink-0" />
          <span className="truncate max-w-full">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => onOpenBooking('service')}
          className="flex flex-col items-center justify-center min-h-[48px] py-2 px-1 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white rounded-xl text-[11px] font-bold active:scale-95 transition-transform cursor-pointer shadow-xs"
        >
          <Wrench className="w-4 h-4 text-white mb-0.5 shrink-0" />
          <span className="truncate max-w-full">Book Repair</span>
        </button>
      </div>
    </nav>
  );
};
