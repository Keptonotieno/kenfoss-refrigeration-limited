import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2,
  Navigation,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { saveContactToFirestore } from '../lib/firebase';

export const ContactSection: React.FC = () => {
  const { contactInfo } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Cold Room / Service Inquiry',
    location: 'Ruiru / Kiambu',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveContactToFirestore(formData);
    } catch (err) {
      console.error("Firestore contact save error:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const googleDirectionsUrl = "https://www.google.com/maps/dir//Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County/@-1.1620371,36.9537816,17z/data=!4m16!1m7!3m6!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2sKenfoss+Refrigeration+limited!8m2!3d-1.1620371!4d36.9586472!16s%2Fg%2F11xp9xzg41!4m7!1m0!1m5!1m1!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2m2!1d36.9586472!2d-1.1620371?entry=ttu";

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white relative scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="bg-[#00AEEF]/15 border-l-4 border-[#00AEEF] px-4 py-1 inline-block text-xs font-bold uppercase tracking-[0.1em] text-[#00AEEF]">
            Contact Us & Directions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Kenfoss Refrigeration Limited
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Kenya's leading Refrigerator Repair Service & Cold Room Engineers. Open 24 Hours for emergency repairs, technical service, and site visits across Ruiru, Kiambu, Nairobi, and nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Information & Office Locations */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <Building2 className="w-5 h-5 text-[#FF7A00]" />
                Official Business Details
              </h3>

              {/* Physical Location */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#00AEEF] uppercase tracking-wider">Main Office & Workshop Address</p>
                <a 
                  href={googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-slate-900/90 hover:bg-slate-950 rounded-xl border border-slate-700/80 space-y-1 text-xs text-slate-200 transition-all cursor-pointer group hover:border-[#00AEEF]/60"
                  title="Click to open Google Maps directions"
                >
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="w-5 h-5 text-[#FF7A00] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-white text-sm">Kenfoss Refrigeration Limited</p>
                      <p className="text-slate-200 font-medium">Ivy's Park Business Park,</p>
                      <p className="text-slate-300">Next to Mark Hotel,</p>
                      <p className="text-slate-300">Thika Superhighway Service Lane,</p>
                      <p className="text-slate-300 font-semibold text-white/90">Ruiru, Kiambu County, Kenya.</p>
                      <p className="text-[11px] text-[#00AEEF] font-bold pt-1.5 flex items-center gap-1 group-hover:underline">
                        <span>Get Driving Directions on Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </a>
              </div>

              {/* Contact Directs & Hours */}
              <div className="space-y-3 pt-2 border-t border-slate-700 text-xs">
                <a 
                  href={`tel:${contactInfo.mainPhone}`} 
                  className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-700/80 transition-colors border border-slate-700/50"
                >
                  <Phone className="w-5 h-5 text-[#FF7A00]" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">24/7 Phone & WhatsApp Hotline</span>
                    <span className="font-extrabold text-white text-base">{contactInfo.mainPhone}</span>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-700/50">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Business Hours</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{contactInfo.workingHours}</span>
                  </div>
                </div>

                <a 
                  href={`mailto:${contactInfo.email}`} 
                  className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-700/80 transition-colors border border-slate-700/50"
                >
                  <Mail className="w-4 h-4 text-[#00AEEF]" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Email</span>
                    <span className="font-bold text-white">{contactInfo.email}</span>
                  </div>
                </a>
              </div>

              {/* Get Directions Button */}
              <div className="pt-2">
                <a
                  href={googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
                >
                  <Navigation className="w-4 h-4 text-[#00AEEF]" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

            </div>

            {/* Embedded Google Maps Box */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <MapPin className="w-4 h-4 text-[#FF7A00]" />
                  <span>Google Maps Location</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Ivy's Park, Ruiru
                </span>
              </div>

              <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 relative">
                <iframe
                  title="Kenfoss Refrigeration Location Map"
                  src="https://maps.google.com/maps?q=-1.1620371,36.9586472+(Kenfoss+Refrigeration+Limited)&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center block text-[11px] text-[#00AEEF] hover:underline font-bold"
              >
                Open full map & driving route in Google Maps →
              </a>
            </div>

          </div>

          {/* Contact & RFQ Form */}
          <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white">Inquiry Received Successfully!</h3>
                <p className="text-slate-300 text-xs max-w-md mx-auto">
                  Thank you for contacting Kenfoss Refrigeration Limited. An engineer from our Ivy's Park Business Park facility in Ruiru will call <strong>{formData.phone}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    Send Technical Service Inquiry
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2.5 py-1 rounded">
                    Open 24 Hours
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Kamau"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0745 411923"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@company.co.ke"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Facility / Town Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Ruiru, Thika Rd, Westlands, Naivasha"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Service / Requirement Type</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                  >
                    <option value="Refrigerator Repair Service">Domestic & Commercial Refrigerator Repair</option>
                    <option value="Cold Room / Sizing Quote">Cold Room Sizing & Construction Quote</option>
                    <option value="Emergency Breakdown Repair">Emergency 24/7 Breakdown Repair</option>
                    <option value="Commercial HVAC Contract">Commercial HVAC & VRF Air Conditioning</option>
                    <option value="Preventive Maintenance AMC">Annual Preventive Maintenance Contract (AMC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Message / Fridge Model / Issue</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide appliance model, error description, or cold room dimensions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div className="p-3 bg-blue-950/80 border border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-200">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
                    <span>EPRA Class C1 Licensed Contractor</span>
                  </div>
                  <span className="text-[#FF7A00] font-bold text-[11px]">Open 24 Hours</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Service Inquiry</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};

