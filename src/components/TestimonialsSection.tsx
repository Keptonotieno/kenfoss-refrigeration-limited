import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ImageWithFallback } from './common/ImageWithFallback';
import { Star, CheckCircle2, Quote, MessageSquarePlus, X, Send, Sparkles, Building2, MapPin, Check } from 'lucide-react';

const SERVICE_CATEGORIES = [
  'All Services',
  'Commercial Cold Room Repair',
  'Cold Room Installation & Build',
  'VRF HVAC System Maintenance',
  'Supermarket Chiller Overhaul',
  'Milk Cooling Plant Servicing'
];

export const TestimonialsSection: React.FC = () => {
  const { testimonials, addTestimonial } = useAdmin();

  const [selectedService, setSelectedService] = useState('All Services');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state for customer self-submission
  const [reviewForm, setReviewForm] = useState({
    name: '',
    role: '',
    company: '',
    location: 'Nairobi',
    rating: 5,
    verifiedService: 'Commercial Cold Room Repair',
    comment: '',
    email: ''
  });

  // Filter approved testimonials & sort featured ones first
  const approvedTestimonials = (testimonials || [])
    .filter(t => (t.status || 'Approved') === 'Approved')
    .filter(t => {
      if (selectedService === 'All Services') return true;
      return t.verifiedService === selectedService;
    })
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      alert('Please fill in your name and review details.');
      return;
    }

    // Default avatar based on name seed
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(reviewForm.name)}`;

    addTestimonial({
      name: reviewForm.name,
      role: reviewForm.role || 'Facility Manager',
      company: reviewForm.company || 'Private Commercial Enterprise',
      location: reviewForm.location || 'Nairobi',
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      avatar,
      verifiedService: reviewForm.verifiedService,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      featured: false,
      email: reviewForm.email
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      setReviewForm({
        name: '',
        role: '',
        company: '',
        location: 'Nairobi',
        rating: 5,
        verifiedService: 'Commercial Cold Room Repair',
        comment: '',
        email: ''
      });
    }, 2500);
  };

  return (
    <section className="py-20 bg-[#F8FAFC] dark:bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          
          {/* Rating Badge */}
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">4.9 / 5.0 Rating</span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
            <span className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF]">480+ Verified Client Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
            Trusted by Kenya's Leading Corporate Facilities & Homeowners
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Read real feedback from hotel managers, floriculture exporters, supermarket chains, and homeowners who trust Kenfoss Refrigeration.
          </p>

          {/* Action Button & Service Filters */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl inline-flex items-center space-x-2 transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Leave a Client Review</span>
            </button>

          </div>

          {/* Category Pills Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {SERVICE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedService(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedService === category
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {approvedTestimonials.map((t) => (
            <div
              key={t.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between space-y-6 ${
                t.featured 
                  ? 'border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/30' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-blue-100/80 dark:text-blue-950/40 pointer-events-none" />

              <div className="space-y-4 relative z-10">
                
                {/* Featured Highlight Pill */}
                {t.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase border border-amber-500/30">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>Featured Corporate Case Study</span>
                  </span>
                )}

                {/* Star rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < (t.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                    />
                  ))}
                </div>

                <p className="text-slate-700 dark:text-slate-200 text-sm italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <ImageWithFallback
                    src={t.avatar}
                    alt={t.name}
                    category="avatar"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-100 dark:border-blue-900 shrink-0 bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-1.5">
                      <span>{t.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}, <span className="font-semibold">{t.company}</span></p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{t.location}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 block">
                    {t.verifiedService}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 font-mono">{t.date}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* CUSTOMER REVIEW SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-6">
            
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Review Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Thank you for your feedback! Your review has been sent to our quality management team and will appear live once verified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>Client Service Feedback</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Submit Your Feedback on Kenfoss
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Share your experience with our cold room engineers and HVAC servicing team.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eng. Peter Omondi"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address (Private)</label>
                      <input
                        type="email"
                        placeholder="peter@company.co.ke"
                        value={reviewForm.email}
                        onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Role / Title</label>
                      <input
                        type="text"
                        placeholder="Facilities Manager"
                        value={reviewForm.role}
                        onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company / Organization</label>
                      <input
                        type="text"
                        placeholder="Kilimani Heights Hotel"
                        value={reviewForm.company}
                        onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location / Region</label>
                      <input
                        type="text"
                        placeholder="Nairobi, Mombasa, Nakuru..."
                        value={reviewForm.location}
                        onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Service Received</label>
                      <select
                        value={reviewForm.verifiedService}
                        onChange={(e) => setReviewForm({ ...reviewForm, verifiedService: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        {SERVICE_CATEGORIES.filter(c => c !== 'All Services').map(srv => (
                          <option key={srv} value={srv}>{srv}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Overall Rating</label>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${s <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-500 ml-2">{reviewForm.rating}.0 Stars</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Review / Feedback *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tell us about the engineering service, repair turnaround speed, and technician professionalism..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
