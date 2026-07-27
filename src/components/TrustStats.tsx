import React, { useEffect, useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Building2, 
  Users, 
  Briefcase, 
  ThumbsUp 
} from 'lucide-react';

export const TrustStats: React.FC = () => {
  const [repairs, setRepairs] = useState(0);
  const [years, setYears] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [projects, setProjects] = useState(0);

  useEffect(() => {
    // Smooth counting animation effect
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setRepairs(Math.floor(progress * 5000));
      setYears(Math.floor(progress * 15));
      setSatisfaction(Math.floor(progress * 98));
      setProjects(Math.floor(progress * 500));

      if (step >= steps) {
        clearInterval(timer);
        setRepairs(5000);
        setYears(15);
        setSatisfaction(98);
        setProjects(500);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      id: 1,
      value: `${repairs.toLocaleString()}+`,
      label: 'Repairs & Installs Completed',
      subtext: 'Across Nairobi & 47 Kenyan Counties',
      icon: Briefcase,
      color: 'text-[#0057B8]'
    },
    {
      id: 2,
      value: `${years}+`,
      label: 'Years Engineering Experience',
      subtext: 'Pioneering Cold Chain Excellence',
      icon: Award,
      color: 'text-[#FF7A00]'
    },
    {
      id: 3,
      value: `${satisfaction}%`,
      label: 'Customer Satisfaction Rate',
      subtext: '480+ Verified 5-Star Reviews',
      icon: ThumbsUp,
      color: 'text-[#16A34A]'
    },
    {
      id: 4,
      value: '24/7',
      label: 'Emergency Response Support',
      subtext: '< 2-Hour Arrival in Nairobi',
      icon: Clock,
      color: 'text-[#00AEEF]'
    },
    {
      id: 5,
      value: `${projects}+`,
      label: 'Commercial Cold Rooms & HVAC',
      subtext: 'Hotels, Hospitals & Supermarkets',
      icon: Building2,
      color: 'text-[#0057B8]'
    }
  ];

  return (
    <section id="trust-stats" className="bg-white dark:bg-slate-900 border-y border-[#E2E8F0] dark:border-slate-800 py-6 md:py-0 md:h-[128px] flex items-center scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
        
        {/* Professional Polish Stats Bar with Dividers */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] dark:divide-slate-800 items-center text-center">
          
          <div className="py-3 md:py-0 px-4 flex flex-col items-center">
            <span className="text-3xl lg:text-[32px] font-extrabold text-[#0057B8] dark:text-[#00AEEF] leading-tight">
              {repairs.toLocaleString()}+
            </span>
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mt-1">
              Repairs Completed
            </span>
          </div>

          <div className="py-3 md:py-0 px-4 flex flex-col items-center">
            <span className="text-3xl lg:text-[32px] font-extrabold text-[#0057B8] dark:text-[#00AEEF] leading-tight">
              {years}+
            </span>
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mt-1">
              Years Experience
            </span>
          </div>

          <div className="py-3 md:py-0 px-4 flex flex-col items-center">
            <span className="text-3xl lg:text-[32px] font-extrabold text-[#0057B8] dark:text-[#00AEEF] leading-tight">
              24/7
            </span>
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mt-1">
              Emergency Support
            </span>
          </div>

          <div className="py-3 md:py-0 px-4 flex flex-col items-center">
            <span className="text-3xl lg:text-[32px] font-extrabold text-[#0057B8] dark:text-[#00AEEF] leading-tight">
              {projects}+
            </span>
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mt-1">
              Commercial Clients
            </span>
          </div>

          <div className="py-3 md:py-0 px-4 flex flex-col items-center col-span-2 md:col-span-1">
            <div className="flex gap-1 text-[#FF7A00] text-sm mb-1">
              ★★★★★
            </div>
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
              Google Rated 4.9/5
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
