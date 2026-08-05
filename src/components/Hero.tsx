import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import heroRefrigerationImg from '../assets/images/refrigeration_hero_bg_1785179699828.jpg';
import kenyanEngineersImg from '../assets/images/kenyan_engineers_refrigeration_1785180429060.jpg';
import { ImageWithFallback } from './common/ImageWithFallback';
import { 
  Wrench, 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Calculator,
  Building,
  Thermometer,
  Bot
} from 'lucide-react';

interface HeroProps {
  onOpenBooking: (type?: string, prefillService?: string) => void;
  onOpenCalculator: () => void;
  onOpenAiDiagnostic: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  onOpenCalculator,
  onOpenAiDiagnostic
}) => {
  const { contactInfo } = useAdmin();
  const whatsappNum = contactInfo?.whatsappNumber || '254745411923';
  const [selectedQuickService, setSelectedQuickService] = useState('cold-room');
  const [selectedCounty, setSelectedCounty] = useState('Nairobi');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking('service', selectedQuickService);
  };

  return (
    <section className="relative bg-[#0F172A] text-white overflow-hidden py-16 lg:py-24">
      {/* Background Cinematic Visual Effects with 50% Dark Blue Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src={heroRefrigerationImg} 
          alt="Kenfoss Commercial & Industrial Refrigeration Equipment" 
          priority
          category="refrigeration"
          className="w-full h-full object-cover object-center opacity-45 filter brightness-95 saturate-110"
          containerClassName="w-full h-full"
        />
        {/* 50% Dark Blue Overlay Layer */}
        <div className="absolute inset-0 bg-[#001D4A]/50 backdrop-brightness-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/85 via-[#002B5B]/50 to-[#0F172A]/80" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Main Hero Content (~60% width) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Premier Engineering Eyebrow Badge */}
            <div className="bg-[#00AEEF]/15 border-l-4 border-[#00AEEF] px-3.5 py-1.5 inline-block rounded-r-md">
              <span className="text-[#00AEEF] text-xs sm:text-[13px] font-bold uppercase tracking-[0.1em]">
                Kenya's Premier Refrigeration Engineering Experts
              </span>
            </div>

            {/* Breathtaking Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white leading-[1.08] tracking-[-0.03em]">
              Keeping Kenya Cool with <span className="text-[#00AEEF]">Precision Engineering.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-[620px] font-normal leading-[1.6]">
              Trusted experts in commercial cold room design, HVAC systems, industrial refrigeration, and 24/7 technical repair across Kenya and East Africa.
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF7A00] flex-shrink-0" />
                <span>EPRA Certified Engineers</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF7A00] flex-shrink-0" />
                <span>90-Day Parts Guarantee</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF7A00] flex-shrink-0" />
                <span>Genuine OEM Spare Parts</span>
              </div>
            </div>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                onClick={() => onOpenBooking('service')}
                className="flex items-center space-x-2 px-6 sm:px-7 py-3.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-sm sm:text-base font-bold rounded-lg shadow-[0_4px_14px_rgba(255,122,0,0.25)] hover:shadow-xl transition-all cursor-pointer tracking-wide"
              >
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Request a Quote</span>
              </button>

              <a
                href={`https://wa.me/${whatsappNum}?text=Hello%20Kenfoss%20Refrigeration,%20I%20need%20urgent%20engineering%20assistance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 sm:px-6 py-3.5 bg-white/5 border border-white/20 hover:border-white/50 text-white text-sm sm:text-base font-bold rounded-lg transition-all cursor-pointer backdrop-blur-xs"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span>WhatsApp Engineering</span>
              </a>

              <button
                onClick={onOpenAiDiagnostic}
                className="flex items-center space-x-2 px-5 py-3.5 bg-blue-950/60 border border-blue-500/30 hover:border-blue-400 text-blue-200 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#00AEEF]" />
                <span>AI Diagnostics</span>
              </button>
            </div>

          </div>

          {/* Compact Glassy Industrial Solutions Right Card Panel (~40% width) */}
          <div className="lg:col-span-5">
            <div className="bg-white/[0.04] border border-white/12 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4">
              
              {/* Featured Refrigeration Equipment & Engineers Image Card */}
              <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-lg h-44 sm:h-48 group">
                <ImageWithFallback 
                  src={kenyanEngineersImg} 
                  alt="Black African Kenyan Refrigeration Engineers Kenfoss" 
                  category="field"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-semibold text-white">
                  <span className="bg-[#0057B8]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-blue-400/40 text-[11px] text-blue-100 font-bold">
                    Kenyan Engineering Team
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    Nairobi Workshop
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-white text-base sm:text-lg font-bold block">Industrial Cold Storage</span>
                  <span className="text-xs text-[#00AEEF] font-semibold">Turnkey Engineering Services</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center space-x-2.5 text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                  <span>Cold Room Design & Modular Panel Assembly</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                  <span>Preventive Maintenance Contracts (AMC)</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                  <span>HVAC Central Cooling & VRF Air Conditioning</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                  <span>24/7 Emergency Refrigeration Dispatch</span>
                </div>
              </div>

              {/* Quick Service Dispatch Form */}
              <form onSubmit={handleQuickSubmit} className="pt-1 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Select Required Service
                  </label>
                  <select
                    value={selectedQuickService}
                    onChange={(e) => setSelectedQuickService(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#00AEEF] outline-none"
                  >
                    <option value="cold-room-installation">Cold Room Installation & Design</option>
                    <option value="freezer-repair">Freezer Repair (Chest / Upright)</option>
                    <option value="refrigerator-freezer-repair">Refrigerator & Freezer Repair (Side-by-Side / Inverter)</option>
                    <option value="refrigerator-repair">Refrigerator Repair (Single / Double Door)</option>
                    <option value="mini-refrigerator-repair">Mini Refrigerator Repair (Minibar / Wine Chiller)</option>
                    <option value="walk-in-cooler-repair">Walk-in Cooler Repair (Chiller Vaults)</option>
                    <option value="refrigerator-installation">Refrigerator Installation & Plumbing</option>
                    <option value="dishwasher-repair">Dishwasher Repair</option>
                    <option value="washing-machine-repair">Washing Machine Repair</option>
                    <option value="dryer-repair">Dryer Repair (Heat Pump / Condenser)</option>
                    <option value="microwave-repair">Microwave Repair</option>
                    <option value="oven-repair">Oven & Bakery Equipment Repair</option>
                    <option value="hvac-air-con">Commercial Air Conditioning & HVAC</option>
                    <option value="preventive-maintenance">Preventive Maintenance Contract (AMC)</option>
                    <option value="emergency-breakdown">URGENT 24/7 Emergency Breakdown</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  Fast Dispatch Request
                </button>
              </form>

              {/* Stat Indicator Bar */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-[#00AEEF]">98%</span>
                  <span className="text-[11px] text-slate-400 font-medium">On-Time SLA Completion</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold">EPRA & NEMA</span>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="pt-12 text-center hidden md:block">
          <a href="#trust-stats" className="inline-flex flex-col items-center text-xs text-slate-400 hover:text-white transition-colors">
            <span>Scroll To Explore Engineering Capabilities</span>
            <ChevronDown className="w-4 h-4 mt-1 animate-bounce text-[#00AEEF]" />
          </a>
        </div>

      </div>
    </section>
  );
};
