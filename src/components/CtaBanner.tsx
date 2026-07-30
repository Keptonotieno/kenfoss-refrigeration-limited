import React from 'react';
import { Phone, Wrench, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface CtaBannerProps {
  onOpenBooking: (type?: string) => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onOpenBooking }) => {
  const { contactInfo } = useAdmin();
  const whatsappNum = contactInfo?.whatsappNumber || '254745411923';

  return (
    <section className="bg-gradient-to-r from-[#002B5B] via-[#0057B8] to-[#002B5B] text-white py-16 px-4 relative overflow-hidden">
      
      {/* Decorative radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,174,239,0.2),transparent_60%)]" />

      <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
        
        <div className="bg-[#00AEEF]/15 border-l-4 border-[#00AEEF] px-4 py-1 inline-block text-xs font-bold uppercase tracking-[0.1em] text-[#00AEEF]">
          24/7 Rapid Field Engineer Dispatch
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Need Emergency Refrigeration Repair or Commercial Cold Room Sizing?
        </h2>

        <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal">
          Don't let a cooling failure put your perishable inventory at risk. Call Kenya's trusted EPRA-certified engineering team right now.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={`tel:${contactInfo.mainPhone}`}
            className="flex items-center space-x-2 px-7 py-3.5 bg-white text-[#0057B8] hover:bg-slate-100 text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4 text-[#FF7A00]" />
            <span>Call Now: {contactInfo.mainPhone}</span>
          </a>

          <button
            onClick={() => onOpenBooking('service')}
            className="flex items-center space-x-2 px-7 py-3.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-sm font-bold rounded-lg shadow-[0_4px_10px_rgba(255,122,0,0.2)] transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>BOOK SERVICE ONLINE</span>
          </button>

          <a
            href={`https://wa.me/${whatsappNum}?text=Hello%20Kenfoss%20Refrigeration,%20I%20have%20an%20urgent%20service%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Dispatch</span>
          </a>
        </div>

        <div className="pt-2 text-xs text-blue-200 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
          <span>Covering Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika & Regional East Africa</span>
        </div>

      </div>
    </section>
  );
};
