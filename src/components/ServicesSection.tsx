import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ServiceItem, ServiceCategory } from '../types';
import { SEO } from './SEO';
import { 
  Warehouse, 
  Store, 
  Refrigerator, 
  Wind, 
  ShieldCheck, 
  Zap, 
  WashingMachine, 
  Droplets,
  ArrowRight,
  Check,
  Clock,
  Info,
  X,
  Phone,
  Wrench
} from 'lucide-react';

interface ServicesSectionProps {
  onOpenBooking: (type?: string, serviceId?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  const { services } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);

  const filteredServices = (services || []).filter((service) => {
    if (activeCategory === 'all') return true;
    return service.category === activeCategory;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Warehouse': return Warehouse;
      case 'Store': return Store;
      case 'Refrigerator': return Refrigerator;
      case 'Wind': return Wind;
      case 'ShieldCheck': return ShieldCheck;
      case 'Zap': return Zap;
      case 'WashingMachine': return WashingMachine;
      case 'Droplets': return Droplets;
      default: return Refrigerator;
    }
  };

  return (
    <section id="services" className="py-20 bg-[#F8FAFC] dark:bg-slate-950 scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="bg-[#00AEEF]/15 border-l-4 border-[#00AEEF] px-4 py-1 inline-block text-xs font-bold uppercase tracking-[0.1em] text-[#0057B8] dark:text-[#00AEEF]">
            Engineering & Repair Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] dark:text-slate-100 tracking-tight">
            Precision Refrigeration & HVAC Engineering Solutions
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            From residential inverter fridge repairs to multi-megawatt commercial cold room facilities, Kenfoss engineers deliver world-class reliability across Kenya.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Engineering Services' },
            { id: 'residential', label: 'Residential Appliance Repairs' },
            { id: 'commercial', label: 'Commercial & Supermarket' },
            { id: 'industrial', label: 'Industrial Cold Rooms & Emergency' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as ServiceCategory)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#0057B8] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const IconComponent = getIcon(service.iconName);
            return (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image Header with Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-[#0057B8]/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{service.category}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center space-x-1 shadow">
                    <Clock className="w-3 h-3 text-[#FF7A00]" />
                    <span>{service.estimatedTime}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 group-hover:text-[#0057B8] dark:group-hover:text-[#00AEEF] transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    {/* Features checklist */}
                    <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Pricing Model:</span>
                        <span className="font-extrabold text-[#0057B8] dark:text-[#00AEEF] bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded text-[11px]">
                          {service.startingPrice}
                        </span>
                      </div>
                      {service.pricingNote && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-400 dark:text-slate-500 font-medium">Requirement:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{service.pricingNote}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedServiceModal(service)}
                        className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Specs & Details</span>
                      </button>

                      <button
                        onClick={() => onOpenBooking(service.ctaLabel?.includes('Inspection') ? 'service' : 'quote', service.id)}
                        className="py-2.5 px-2.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        <span>{service.ctaLabel || 'Request a Quote'}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Detailed Service Specifications Modal */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <SEO 
            title={`${selectedServiceModal.title} | Kenfoss Refrigeration Kenya`}
            description={selectedServiceModal.shortDescription}
            keywords={[selectedServiceModal.title, selectedServiceModal.category, ...selectedServiceModal.features]}
            canonicalUrl={`https://kenfoss.co.ke/#service-${selectedServiceModal.id}`}
            schemaData={{
              "@context": "https://schema.org",
              "@type": "Service",
              "name": selectedServiceModal.title,
              "description": selectedServiceModal.fullDesc,
              "provider": {
                "@type": "LocalBusiness",
                "name": "Kenfoss Refrigeration Limited"
              },
              "offers": {
                "@type": "Offer",
                "price": selectedServiceModal.startingPrice,
                "priceCurrency": "KES"
              }
            }}
          />
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] flex items-center justify-center font-bold">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF] uppercase tracking-wider">
                  {selectedServiceModal.category} Engineering
                </span>
                <h3 className="text-2xl font-black text-[#1E293B] dark:text-slate-100">
                  {selectedServiceModal.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {selectedServiceModal.fullDesc}
            </p>

            {/* Scope Features */}
            <div>
              <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 mb-2">Technical Capabilities & Scope:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedServiceModal.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Issues Handled */}
            {selectedServiceModal.commonIssues && (
              <div>
                <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 mb-2">Common Faults Resolved On-Site:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedServiceModal.commonIssues.map((issue, idx) => (
                    <span key={idx} className="text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 rounded-md font-medium">
                      ⚠️ {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Reassurance Box */}
            <div className="bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium text-[11px]">Pricing Structure:</span>
                <span className="font-extrabold text-[#0057B8] dark:text-[#00AEEF] text-sm">{selectedServiceModal.startingPrice}</span>
              </div>
              {selectedServiceModal.pricingNote && (
                <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-[11px] self-start sm:self-auto">
                  {selectedServiceModal.pricingNote}
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Service Guarantee</p>
                <p className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF]">90 Days EPRA Warranty</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedServiceModal(null);
                    onOpenBooking('service', selectedServiceModal.id);
                  }}
                  className="px-5 py-2.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Book Service Now
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
