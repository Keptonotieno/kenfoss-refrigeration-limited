import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ServiceItem, ServiceCategory } from '../types';
import { ImageWithFallback } from './common/ImageWithFallback';
import { resolveImageUrl } from '../utils/imageRegistry';
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
  CheckCircle2,
  Clock,
  Info,
  X,
  Phone,
  Wrench,
  Building2,
  AlertTriangle,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Briefcase
} from 'lucide-react';

import freezerRepairImg from '../assets/images/kenya_freezer_repair_1785251736978.jpg';
import fridgeRepairNewImg from '../assets/images/kenya_fridge_repair_af_1785656923848.jpg';
import coldRoomNewImg from '../assets/images/kenya_walkin_cooler_1785656893057.jpg';
import microwaveImg from '../assets/images/kenya_microwave_repair_1785251865437.jpg';
import ovenImg from '../assets/images/kenya_oven_repair_af_1785656952345.jpg';
import dishwasherImg from '../assets/images/kenya_dishwasher_repair_1785251896358.jpg';
import dryerImg from '../assets/images/kenya_dryer_repair_af_1785656965525.jpg';
import singleDoorFridgeImg from '../assets/images/kenya_single_door_fridge_1785252155392.jpg';
import miniFridgeImg from '../assets/images/kenya_minifridge_af_1785656937308.jpg';
import fridgeInstallImg from '../assets/images/kenya_fridge_install_af_1785656908678.jpg';
import coldRoomBuildImg from '../assets/images/kenya_coldroom_build_1785252517070.jpg';
import hvacAcImg from '../assets/images/kenya_hvac_ac_1785253019004.jpg';
import preventiveMaintImg from '../assets/images/kenya_amc_maint_af_1785656981168.jpg';
import emergencyRepairImg from '../assets/images/kenya_emergency_repair_1785253048831.jpg';
import waterIceServicingImg from '../assets/images/kenya_water_ice_servicing_1785253063233.jpg';
import washerRepairImg from '../assets/images/kenya_washer_repair_1785253077335.jpg';

const SERVICE_IMAGE_MAP: Record<string, string> = {
  'freezer-repair': freezerRepairImg,
  'refrigerator-freezer-repair': fridgeRepairNewImg,
  'refrigerator-repair': singleDoorFridgeImg,
  'mini-refrigerator-repair': miniFridgeImg,
  'walk-in-cooler-repair': coldRoomNewImg,
  'refrigerator-installation': fridgeInstallImg,
  'cold-room-installation': coldRoomBuildImg,
  'dishwasher-repair': dishwasherImg,
  'washing-machine-repair': washerRepairImg,
  'dryer-repair': dryerImg,
  'microwave-repair': microwaveImg,
  'oven-repair': ovenImg,
  'hvac-air-con': hvacAcImg,
  'preventive-maintenance': preventiveMaintImg,
  'emergency-breakdown': emergencyRepairImg,
  'water-dispenser-ice-machine': waterIceServicingImg,
};

const getServiceImage = (service: ServiceItem): string => {
  if (SERVICE_IMAGE_MAP[service.id]) {
    return SERVICE_IMAGE_MAP[service.id];
  }
  return resolveImageUrl(service.image, service.category);
};

interface ServicesSectionProps {
  onOpenBooking: (type?: string, serviceId?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  const { services, contactInfo } = useAdmin();
  const whatsappNum = contactInfo?.whatsappNumber || '254745411923';
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);

  const filteredServices = useMemo(() => {
    const allServices = (services && services.length > 0) ? services : [];
    const seenNormKeys = new Set<string>();
    const result: ServiceItem[] = [];

    for (const service of allServices) {
      if (service.enabled === false) continue;

      let normKey = (service.id || service.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      if (normKey.includes('preventive') || normKey.includes('amc')) {
        normKey = 'preventivemaintenance';
      } else if (normKey.includes('walkin') || normKey.includes('walkincooler')) {
        normKey = 'walkincoolerrepair';
      } else if (normKey.includes('minirefrigerator') || normKey.includes('minifridge')) {
        normKey = 'minirefrigeratorrepair';
      } else if (normKey.includes('refrigeratorfreezer') || normKey.includes('fridgefreezer')) {
        normKey = 'refrigeratorfreezerrepair';
      } else if (normKey === 'refrigeratorrepair' || normKey === 'fridgerepair') {
        normKey = 'refrigeratorrepair';
      } else if (normKey.includes('dryerrepair') || normKey === 'dryer') {
        normKey = 'dryerrepair';
      } else if (normKey.includes('ovenrepair') || normKey === 'oven') {
        normKey = 'ovenrepair';
      }

      if (seenNormKeys.has(normKey)) {
        continue;
      }

      seenNormKeys.add(normKey);
      result.push(service);
    }

    if (activeCategory === 'all') return result;
    return result.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

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

  const getRelatedServices = (currentService: ServiceItem) => {
    return (services || [])
      .filter(s => s.id !== currentService.id && s.enabled !== false)
      .slice(0, 3);
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
            Comprehensive Refrigeration, HVAC & Appliance Services
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            From residential inverter fridge and washer repairs to commercial cold room installations, Kenfoss Refrigeration Limited offers EPRA-certified expertise across Kenya.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Services' },
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
                  <ImageWithFallback
                    src={getServiceImage(service)}
                    alt={service.title}
                    category={service.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    containerClassName="w-full h-full"
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

                    {/* Real-World Application Highlight */}
                    {service.realWorldApplications && service.realWorldApplications.length > 0 && (
                      <div className="mt-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 rounded-xl p-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-[#0057B8] dark:text-[#00AEEF]" />
                          <span>Real-World Application:</span>
                        </span>
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                          <strong className="text-[#0057B8] dark:text-[#00AEEF] font-bold">{service.realWorldApplications[0].title}:</strong> {service.realWorldApplications[0].scenario}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Pricing:</span>
                        <span className="font-extrabold text-[#0057B8] dark:text-[#00AEEF] bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded text-[11px]">
                          Official Quote by Admin
                        </span>
                      </div>
                      {service.pricingNote && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-slate-400 dark:text-slate-500 font-medium">Estimation:</span>
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
                        <span>Full Service Details</span>
                      </button>

                      <button
                        onClick={() => onOpenBooking(service.ctaLabel?.includes('Inspection') || service.ctaLabel?.includes('Servicing') ? 'service' : 'quote', service.id)}
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
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <SEO 
            title={`${selectedServiceModal.title} | Kenfoss Refrigeration Limited Kenya`}
            description={selectedServiceModal.shortDesc}
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
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-5 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto">
            
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header with image */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 h-48 sm:h-56 -mx-1 sm:-mx-2 -mt-1 sm:-mt-2">
              <ImageWithFallback 
                src={getServiceImage(selectedServiceModal)} 
                alt={selectedServiceModal.title} 
                category={selectedServiceModal.category}
                className="w-full h-full object-cover opacity-85"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="bg-[#0057B8] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md inline-block">
                  {selectedServiceModal.category} Engineering Service
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {selectedServiceModal.title}
                </h3>
              </div>
            </div>

            {/* Overview */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] mb-1">
                Service Overview
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {selectedServiceModal.fullDesc}
              </p>
            </div>

            {/* Equipment Serviced */}
            {selectedServiceModal.equipmentServiced && selectedServiceModal.equipmentServiced.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] mb-2 flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#0057B8] dark:text-[#00AEEF]" />
                  <span>Equipment & Models Serviced:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedServiceModal.equipmentServiced.map((eq, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg font-semibold">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features & Scope */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0057B8] dark:text-[#00AEEF]" />
                <span>Technical Capabilities & Deliverables:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedServiceModal.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Issues Handled */}
            {selectedServiceModal.commonIssues && selectedServiceModal.commonIssues.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Common Faults Repaired On-Site:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedServiceModal.commonIssues.map((issue, idx) => (
                    <div key={idx} className="text-xs bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60 p-2 rounded-lg font-medium flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits of Choosing Kenfoss */}
            {selectedServiceModal.benefits && selectedServiceModal.benefits.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0057B8] dark:text-[#00AEEF]" />
                  <span>Why Choose Kenfoss for {selectedServiceModal.title}:</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedServiceModal.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-[#0057B8] dark:text-[#00AEEF] flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industries Served */}
            {selectedServiceModal.industriesServed && selectedServiceModal.industriesServed.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] mb-2 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0057B8] dark:text-[#00AEEF]" />
                  <span>Industries & Clients Served:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedServiceModal.industriesServed.map((ind, idx) => (
                    <span key={idx} className="text-[11px] bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] border border-blue-200/60 dark:border-blue-800/80 px-2.5 py-1 rounded-md font-semibold">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Real-World Applications & Field Scenarios */}
            {selectedServiceModal.realWorldApplications && selectedServiceModal.realWorldApplications.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0057B8] dark:text-[#00AEEF] mb-2.5 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#0057B8] dark:text-[#00AEEF]" />
                  <span>Real-World Applications & Field Scenarios:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedServiceModal.realWorldApplications.map((app, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-blue-50/90 to-slate-50 dark:from-slate-800/90 dark:to-slate-900 border border-blue-200/70 dark:border-slate-700/80 p-3 rounded-xl space-y-1 shadow-sm">
                      <span className="text-xs font-extrabold text-[#0057B8] dark:text-[#00AEEF] block leading-tight">
                        {app.title}
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {app.scenario}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & Guarantee Box */}
            <div className="bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium text-[11px]">Pricing Model:</span>
                <span className="font-extrabold text-[#0057B8] dark:text-[#00AEEF] text-base">{selectedServiceModal.startingPrice}</span>
                {selectedServiceModal.pricingNote && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{selectedServiceModal.pricingNote}</p>
                )}
              </div>
              
              <div className="border-t sm:border-t-0 sm:border-l border-blue-200 dark:border-blue-800/80 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-slate-500 dark:text-slate-400 block font-medium text-[11px]">Kenfoss Quality Guarantee:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">90-Day EPRA Parts & Workmanship Warranty</span>
              </div>
            </div>

            {/* Primary Call To Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <a
                href={`https://wa.me/${whatsappNum}?text=Hello%20Kenfoss%2C%20I%20am%20interested%20in%20your%20${encodeURIComponent(selectedServiceModal.title)}%20service.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Direct Support</span>
              </a>

              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <button
                  onClick={() => {
                    const svc = selectedServiceModal;
                    setSelectedServiceModal(null);
                    onOpenBooking('quote', svc.id);
                  }}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Request Quotation
                </button>

                <button
                  onClick={() => {
                    const svc = selectedServiceModal;
                    setSelectedServiceModal(null);
                    onOpenBooking('service', svc.id);
                  }}
                  className="flex-1 sm:flex-initial py-2.5 px-5 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Book Service Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Related Services */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Other Related Services
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {getRelatedServices(selectedServiceModal).map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => setSelectedServiceModal(rel)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl text-left border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0057B8] dark:group-hover:text-[#00AEEF] line-clamp-1">
                      {rel.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {rel.startingPrice}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

