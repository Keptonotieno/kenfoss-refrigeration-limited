import React from 'react';
import { 
  Building2, 
  Utensils, 
  Hospital, 
  Factory, 
  GraduationCap, 
  Warehouse, 
  Home, 
  ShoppingCart, 
  Building,
  ArrowRight
} from 'lucide-react';
import factoryImg from '../assets/images/factory_african_1785119292045.jpg';
import universityImg from '../assets/images/university_african_1785119305210.jpg';
import coldRoomImg from '../assets/images/service_cold_room_1785117713918.jpg';
import commRefImg from '../assets/images/service_commercial_1785117738944.jpg';
import hvacImg from '../assets/images/service_hvac_1785117727139.jpg';
import maintImg from '../assets/images/service_maintenance_1785117752181.jpg';
import fridgeRepairImg from '../assets/images/service_refrigerator_repair_1785117702454.jpg';
import aboutImg from '../assets/images/about_african_engineers_1785117690454.jpg';
import heroImg from '../assets/images/hero_african_engineer_1785117677250.jpg';

interface IndustriesSectionProps {
  onOpenBooking: (type?: string, details?: string) => void;
}

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({ onOpenBooking }) => {
  const industries = [
    {
      id: 'hotels',
      name: 'Hotels & Hospitality',
      image: commRefImg,
      icon: Building2,
      solutions: 'Walk-in Kitchen Chillers, Ice Machines, Banqueting Refrigeration, Hotel Room AC'
    },
    {
      id: 'supermarkets',
      name: 'Supermarkets & Retail',
      image: coldRoomImg,
      icon: ShoppingCart,
      solutions: 'Multi-deck Display Chillers, Island Freezers, Central Compressor Racks'
    },
    {
      id: 'hospitals',
      name: 'Hospitals & Healthcare',
      image: hvacImg,
      icon: Hospital,
      solutions: 'Vaccine Ultra-Low Freezers, Blood Bank Refrigeration, Operating Theater HVAC'
    },
    {
      id: 'agriculture',
      name: 'Flower Farms & Agriculture',
      image: aboutImg,
      icon: Warehouse,
      solutions: 'Naivasha Flower Pre-cooling Rooms, Packhouse Cold Chains, Milk Cooling Tanks'
    },
    {
      id: 'restaurants',
      name: 'Restaurants & Commercial Kitchens',
      image: heroImg,
      icon: Utensils,
      solutions: 'Under-counter Chillers, Saladette Counters, Exhaust Canopy Ventilation'
    },
    {
      id: 'factories',
      name: 'Factories & Food Processing',
      image: factoryImg,
      icon: Factory,
      solutions: 'Blast Freezers, Meat Processing Chillers, Industrial Process Chilling'
    },
    {
      id: 'offices',
      name: 'Office Buildings & Towers',
      image: maintImg,
      icon: Building,
      solutions: 'VRF Central Air Conditioning, Server Room Precision Cooling, Fresh Air Units'
    },
    {
      id: 'schools',
      name: 'Schools & Universities',
      image: universityImg,
      icon: GraduationCap,
      solutions: 'Institutional Kitchen Cold Storage, Water Dispensers, Laboratory Cooling'
    },
    {
      id: 'residential',
      name: 'Residential Homes & Estates',
      image: fridgeRepairImg,
      icon: Home,
      solutions: 'Samsung & LG Inverter Fridge Repair, Home AC Installation, Wine Cellar Cooling'
    }
  ];

  return (
    <section id="industries" className="py-20 bg-[#F8FAFC] dark:bg-slate-950 scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-blue-200 dark:border-blue-800">
            <span>Commercial & Industrial Sectors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
            Tailored Engineering for Kenya's Key Industries
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            We understand the exact thermal requirements, regulatory compliance, and operational pressures of your industry sector.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center space-x-2 text-white">
                    <div className="w-8 h-8 rounded-lg bg-[#0057B8] flex items-center justify-center shadow">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white drop-shadow">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#0057B8] dark:text-[#00AEEF] uppercase tracking-wider block mb-1">
                      Key Cooling & HVAC Solutions:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                      {item.solutions}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenBooking('quote', `Industry Enquiry: ${item.name}`)}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-[#0057B8] text-slate-800 dark:text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 hover:border-blue-600 cursor-pointer"
                  >
                    <span>Request Industry Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
