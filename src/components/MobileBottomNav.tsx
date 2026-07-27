import React from 'react';
import { Phone, MessageSquare, Wrench } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenBooking: (type?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenBooking }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 p-2 shadow-2xl">
      <div className="grid grid-cols-3 gap-2">
        <a
          href="tel:0745411923"
          className="flex flex-col items-center justify-center py-2 bg-slate-800 text-white rounded-xl text-[10px] font-bold active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-[#FF7A00] mb-0.5" />
          <span>Call Now</span>
        </a>

        <a
          href="https://wa.me/254745411923?text=Hello%20Kenfoss%20Refrigeration,%20I%20need%20urgent%20engineering%20support."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 bg-emerald-700 text-white rounded-xl text-[10px] font-bold active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4 text-white mb-0.5" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={() => onOpenBooking('service')}
          className="flex flex-col items-center justify-center py-2 bg-[#FF7A00] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-transform cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-white mb-0.5" />
          <span>Book Repair</span>
        </button>
      </div>
    </div>
  );
};
