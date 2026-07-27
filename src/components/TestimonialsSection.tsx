import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Star, CheckCircle2, ThumbsUp, Quote, ShieldCheck } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { testimonials } = useAdmin();
  const approvedTestimonials = (testimonials || []).filter(t => t.status === 'Approved');
  return (
    <section className="py-20 bg-[#F8FAFC] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          
          {/* Verified Google Badge */}
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">4.9 / 5.0 Rating</span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">|</span>
            <span className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF]">480+ Google Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
            Trusted by Kenya's Leading Corporate Facilities & Homeowners
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Read real feedback from hotel managers, property developers, hospital directors, and homeowners who rely on Kenfoss Refrigeration.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {approvedTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between space-y-4"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-blue-100 dark:text-blue-950/60" />

              <div className="space-y-3">
                {/* Star rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-sm italic leading-relaxed relative z-10">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-1">
                      {t.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}, {t.company}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{t.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 block">
                    {t.verifiedService}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{t.date}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
