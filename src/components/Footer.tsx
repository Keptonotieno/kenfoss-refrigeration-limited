import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Send,
  ShieldCheck,
  Award
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { contactInfo, websiteSettings } = useAdmin();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setSubscribed(true);
  };

  return (
    <footer className="bg-[#002B5B] dark:bg-[#020D1C] text-slate-300 text-xs border-t border-blue-900/80 dark:border-slate-800">
      
      {/* Upper Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0057B8] to-[#00AEEF] flex items-center justify-center text-white font-black text-xl shadow-md">
                K
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl font-extrabold text-white tracking-tight">KENFOSS</span>
                  <span className="text-[10px] bg-[#FF7A00] text-white font-extrabold px-1.5 py-0.5 rounded uppercase">KE</span>
                </div>
                <p className="text-[10px] text-[#00AEEF] font-semibold tracking-wider uppercase mt-0.5">
                  Refrigeration Engineering
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Kenfoss Refrigeration Limited is Kenya's leading commercial refrigeration, cold room engineering, HVAC systems, and appliance repair firm. EPRA Class C1 Licensed Contractor.
            </p>

            <div className="pt-2 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                <span>EPRA Class C1 Licensed Practice</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Award className="w-4 h-4 text-[#00AEEF]" />
                <span>90-Day Parts & Workmanship Warranty</span>
              </div>
            </div>
          </div>

          {/* Column 2: Engineering Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Engineering Services
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• Cold Room Design & Installation</a></li>
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• Domestic & Commercial Fridge Repair</a></li>
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• Commercial VRF Air Conditioning & HVAC</a></li>
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• Supermarket Display Refrigeration</a></li>
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• Annual Preventive Maintenance (AMC)</a></li>
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• 24/7 Emergency Breakdown Dispatch</a></li>
              <li><a href="#services" className="hover:text-[#00AEEF] transition-colors">• Washing Machine & Laundry Engineering</a></li>
            </ul>
          </div>

          {/* Column 3: Industries & Coverage */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Industries & Coverage
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#industries" className="hover:text-[#00AEEF] transition-colors">• Hotels, Lodges & Restaurants</a></li>
              <li><a href="#industries" className="hover:text-[#00AEEF] transition-colors">• Supermarket Chains & Megastores</a></li>
              <li><a href="#industries" className="hover:text-[#00AEEF] transition-colors">• Hospitals & Pharmaceutical Cold Chains</a></li>
              <li><a href="#industries" className="hover:text-[#00AEEF] transition-colors">• Naivasha Flower Farms & Horticulture</a></li>
              <li><a href="#contact" className="hover:text-[#00AEEF] transition-colors">• Nairobi Metropolitan & Kiambu</a></li>
              <li><a href="#contact" className="hover:text-[#00AEEF] transition-colors">• Mombasa, Kisumu, Nakuru & Eldoret</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Engineering Newsletter
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe for cold room energy saving tips, equipment maintenance checklists, and refrigerant regulatory updates in Kenya.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-[#00AEEF]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe Newsletter</span>
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-300">
              <p>Direct Line: <a href={`tel:${contactInfo.secondaryPhone || contactInfo.mainPhone}`} className="text-white font-bold hover:underline">{contactInfo.secondaryPhone || contactInfo.mainPhone}</a></p>
              <p>Email: <a href={`mailto:${contactInfo.email}`} className="text-[#00AEEF] hover:underline">{contactInfo.email}</a></p>
              <div>
                <span className="font-semibold text-slate-400">Address: </span>
                <a 
                  href="https://www.google.com/maps/dir//Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County/@-1.1620371,36.9537816,17z/data=!4m16!1m7!3m6!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2sKenfoss+Refrigeration+limited!8m2!3d-1.1620371!4d36.9586472!16s%2Fg%2F11xp9xzg41!4m7!1m0!1m5!1m1!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2m2!1d36.9586472!2d-1.1620371?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-200 hover:text-[#00AEEF] underline transition-colors cursor-pointer"
                  title="Open directions in Google Maps"
                >
                  <strong>{websiteSettings.companyName || 'Kenfoss Refrigeration Limited'}</strong>, {contactInfo.address}, {contactInfo.city}.
                </a>
              </div>
              <p className="text-emerald-400 font-bold">Hours: {contactInfo.workingHours}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="bg-[#060912] dark:bg-[#01040A] py-6 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>{websiteSettings.footerCopyright || `© ${new Date().getFullYear()} ${websiteSettings.companyName}. All Rights Reserved.`}</p>
          <div className="flex flex-wrap items-center space-x-6">
            <a href="#services" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#services" className="hover:text-slate-300">Terms of Service</a>
            <a href="#services" className="hover:text-slate-300">EPRA License Verification</a>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                Staff Admin Portal
              </button>
            )}
          </div>
        </div>
      </div>

    </footer>
  );
};
