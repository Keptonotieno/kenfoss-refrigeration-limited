import React from 'react';
import aboutImg from '../assets/images/about_african_engineers_1785117690454.jpg';
import { ImageWithFallback } from './common/ImageWithFallback';
import { 
  Award, 
  Zap, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Cpu, 
  Wrench,
  ThumbsUp
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      id: 1,
      title: 'EPRA Certified Engineers',
      desc: 'All field technicians hold Class C1 Electrical & Refrigeration practicing licenses issued by EPRA Kenya.',
      icon: Award,
      badge: 'Certified'
    },
    {
      id: 2,
      title: 'Fast 2-Hour Rapid Response',
      desc: 'Dedicated mobile field vans stationed across Nairobi, Mombasa, Nakuru, Eldoret & Kisumu for emergency breakdowns.',
      icon: Zap,
      badge: 'Rapid Dispatch'
    },
    {
      id: 3,
      title: '100% Genuine OEM Parts',
      desc: 'Direct imports of authentic Danfoss, Bitzer, Copeland, Samsung, LG, and Bosch factory replacement components.',
      icon: Cpu,
      badge: 'Genuine OEM'
    },
    {
      id: 4,
      title: '90-Day Parts & Labor Warranty',
      desc: 'Every repair and cold room installation comes with an official stamped 90-day warranty card.',
      icon: ShieldCheck,
      badge: 'Guaranteed'
    },
    {
      id: 5,
      title: '24/7 Emergency Support',
      desc: '365 days a year active hotline to safeguard your perishable inventory worth millions from spoilage.',
      icon: Clock,
      badge: '24/7 Hotline'
    },
    {
      id: 6,
      title: 'Transparent Commercial Pricing',
      desc: 'Clear, itemized diagnostic quotes prior to work starting. Zero hidden fees or unexpected extras.',
      icon: DollarSign,
      badge: 'Upfront Quotes'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Feature Image & Experience Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <ImageWithFallback
                src={aboutImg}
                alt="African Kenfoss Lead Engineers Inspecting Cold Room System"
                category="field"
                className="w-full h-[520px] object-cover object-center"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-[#0057B8] dark:text-[#00AEEF]">
                  <ThumbsUp className="w-5 h-5 text-[#FF7A00]" />
                  <span className="text-xs font-black uppercase tracking-wider">Engineering Excellence</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs font-bold leading-snug">
                  "Positioned as Kenya's premier refrigeration & HVAC engineering contractor — serving over 500 commercial facilities and 5,000 homes."
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Headquarters: Ivy's Park, Ruiru, Kiambu County</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Class C1 EPRA</span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Accent Box */}
            <div className="absolute -top-6 -left-6 bg-[#0057B8] text-white p-4 rounded-2xl shadow-xl hidden sm:flex items-center space-x-3 border border-blue-400">
              <Wrench className="w-8 h-8 text-[#FF7A00]" />
              <div>
                <p className="text-2xl font-black leading-none">15+</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Years in Kenya</p>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Feature Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            <div>
              <div className="bg-[#00AEEF]/15 border-l-4 border-[#00AEEF] px-3.5 py-1 inline-block mb-3">
                <span className="text-[#0057B8] dark:text-[#00AEEF] text-xs font-bold uppercase tracking-[0.1em]">
                  Why Choose Kenfoss
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] dark:text-slate-100 tracking-tight">
                Built on Engineering Precision, Speed & Uncompromising Integrity
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
                When you partner with Kenfoss Refrigeration Limited, you are engaging a corporate engineering firm dedicated to operational reliability, energy efficiency, and total customer satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 hover:border-[#0057B8]/40 dark:hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-200 space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#0057B8] dark:text-[#00AEEF] group-hover:bg-[#0057B8] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold text-[#FF7A00] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/60 uppercase">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 group-hover:text-[#0057B8] dark:group-hover:text-[#00AEEF] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
