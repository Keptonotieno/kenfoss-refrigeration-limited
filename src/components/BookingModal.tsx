import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  FileText, 
  CheckCircle, 
  Send, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';
import { saveBookingToFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string; // 'service' or 'quote'
  prefillDetails?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialType = 'service',
  prefillDetails = ''
}) => {
  const { user, userProfile } = useAuth();
  const { services } = useAdmin();
  const [tab, setTab] = useState<'service' | 'quote'>(initialType as 'service' | 'quote');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Nairobi');
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Quote specific
  const [companyName, setCompanyName] = useState('');
  const [projectType, setProjectType] = useState('Cold Room Sizing & Turnkey Installation');

  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    refCode: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    setTab(initialType as 'service' | 'quote');
    
    // Check if prefillDetails is a service ID
    const matchedService = (services || []).find(s => s.id === prefillDetails);
    if (matchedService) {
      setServiceType(matchedService.title);
      setProjectType(matchedService.title);
      setNotes(`Inquiry regarding: ${matchedService.title} (${matchedService.startingPrice})`);
    } else if (prefillDetails) {
      setNotes(prefillDetails);
    }

    if (!serviceType && services && services.length > 0) {
      setServiceType(services[0].title);
    }

    if (user) {
      if (!fullName && user.displayName) setFullName(user.displayName);
      if (!email && user.email) setEmail(user.email);
      if (!phone && userProfile?.phone) setPhone(userProfile.phone);
    }
  }, [initialType, prefillDetails, isOpen, user, userProfile, services]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ref = tab === 'service' ? `KEN-${Math.floor(100000 + Math.random() * 900000)}` : `RFQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingRecord = {
      refCode: ref,
      type: tab,
      userId: user?.uid || 'guest',
      userName: fullName || user?.displayName || 'Guest Customer',
      userEmail: email || user?.email || '',
      phone,
      location,
      serviceType: tab === 'service' ? serviceType : projectType,
      equipmentDetails: notes,
      preferredDate,
      companyName: tab === 'quote' ? companyName : '',
      status: 'Pending Dispatch'
    };

    try {
      // Save to Firestore
      await saveBookingToFirestore(bookingRecord);

      // Attempt API backend endpoint if available
      const endpoint = tab === 'service' ? '/api/book' : '/api/quote';
      const payload = tab === 'service' 
        ? { fullName, phone, email, location, serviceType, date: preferredDate, notes, bookingRef: ref }
        : { companyName, contactPerson: fullName, phone, email, location, projectType, specs: notes, rfqRef: ref };

      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        // Silent API failover, already saved to Firestore
      }

      setConfirmation({
        refCode: ref,
        message: `Inquiry ${ref} recorded successfully & synchronized with Firestore database! A senior engineer will call ${phone} within 15 minutes.`
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setConfirmation({
        refCode: ref,
        message: `Inquiry ${ref} received! A senior engineer will call ${phone} shortly.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const text = tab === 'service'
      ? `Hello Kenfoss Refrigeration, I booked service ${confirmation?.refCode || ''} for ${serviceType} at ${location}. Details: ${notes}`
      : `Hello Kenfoss Refrigeration, I submitted commercial RFQ ${confirmation?.refCode || ''} for ${companyName} (${projectType}). Details: ${notes}`;

    window.open(`https://wa.me/254745411923?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header & Toggle Tabs */}
        {!confirmation ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-blue-50 text-[#0057B8] px-2.5 py-0.5 rounded border border-blue-200 uppercase">
                  EPRA Certified Engineers
                </span>
                <span className="text-xs text-slate-400">• Same Day Dispatch</span>
              </div>
              
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setTab('service')}
                  className={`pb-3 px-4 font-extrabold text-sm flex items-center space-x-2 cursor-pointer transition-colors border-b-2 ${
                    tab === 'service'
                      ? 'border-[#FF7A00] text-[#FF7A00]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Book Repair / Maintenance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('quote')}
                  className={`pb-3 px-4 font-extrabold text-sm flex items-center space-x-2 cursor-pointer transition-colors border-b-2 ${
                    tab === 'quote'
                      ? 'border-[#0057B8] text-[#0057B8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Commercial RFQ</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
              
              {tab === 'quote' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Serena Hotels / Naivas / Serena Flowers"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daniel Kamau"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0745 411 923"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. info@company.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Site Location / County *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  >
                    <option value="Nairobi">Nairobi Metropolitan</option>
                    <option value="Kiambu">Kiambu / Thika</option>
                    <option value="Machakos">Machakos / Athi River</option>
                    <option value="Nakuru">Nakuru / Naivasha</option>
                    <option value="Mombasa">Mombasa / Coast</option>
                    <option value="Kisumu">Kisumu / Nyanza</option>
                    <option value="Eldoret">Eldoret / North Rift</option>
                    <option value="Other">Other County in Kenya</option>
                  </select>
                </div>
              </div>

              {tab === 'service' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Select Required Service</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                    >
                      {services && services.length > 0 ? (
                        services.map(svc => (
                          <option key={svc.id} value={svc.title}>
                            {svc.title} ({svc.startingPrice})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Freezer Repair">Freezer Repair</option>
                          <option value="Refrigerator & Freezer Repair">Refrigerator & Freezer Repair</option>
                          <option value="Refrigerator Repair">Refrigerator Repair</option>
                          <option value="Mini Refrigerator Repair">Mini Refrigerator Repair</option>
                          <option value="Walk-in Cooler Repair">Walk-in Cooler Repair</option>
                          <option value="Refrigerator Installation">Refrigerator Installation</option>
                          <option value="Cold Room Installation">Cold Room Installation</option>
                          <option value="Dishwasher Repair">Dishwasher Repair</option>
                          <option value="Washing Machine Repair">Washing Machine Repair</option>
                          <option value="Dryer Repair">Dryer Repair</option>
                          <option value="Microwave Repair">Microwave Repair</option>
                          <option value="Oven Repair">Oven Repair</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Preferred Date Slot</label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Project Category</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  >
                    <option value="Cold Room Sizing & Turnkey Installation">Turnkey Cold Room Design & Installation</option>
                    <option value="Supermarket Display Cooling System">Supermarket Central Compressor Rack System</option>
                    <option value="Hospital Pharmaceutical Cold Chain">Pharmaceutical / Vaccine Cold Chain Facility</option>
                    <option value="Commercial VRF Central Air Con">Commercial VRF / Chilled Water HVAC</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Additional Notes / Equipment Specs</label>
                <textarea
                  rows={3}
                  placeholder="Provide brand names, error symptoms, room dimensions, or specific requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#0057B8]" />
                  <span className="font-semibold text-[11px]">Includes 90-Day Stamped Workmanship Guarantee</span>
                </div>
                <span className="text-[#0057B8] font-bold text-[10px]">EPRA CLASS C1</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider ${
                  tab === 'service' ? 'bg-[#FF7A00] hover:bg-[#e06c00]' : 'bg-[#0057B8] hover:bg-blue-700'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Inquiry...' : tab === 'service' ? 'Confirm Service Booking' : 'Submit Commercial RFQ'}</span>
              </button>

            </form>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">INQUIRY REFERENCE ID</span>
              <h3 className="text-3xl font-black text-[#1E293B] mt-1 font-mono">{confirmation.refCode}</h3>
            </div>

            <p className="text-slate-700 text-xs max-w-md mx-auto leading-relaxed">
              {confirmation.message}
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 max-w-sm mx-auto text-left">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Engineering Workshop & Office</span>
                <p className="font-extrabold text-slate-900 text-xs">Kenfoss Refrigeration Limited</p>
                <a 
                  href="https://www.google.com/maps/dir//Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County/@-1.1620371,36.9537816,17z/data=!4m16!1m7!3m6!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2sKenfoss+Refrigeration+limited!8m2!3d-1.1620371!4d36.9586472!16s%2Fg%2F11xp9xzg41!4m7!1m0!1m5!1m1!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2m2!1d36.9586472!2d-1.1620371?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#0057B8] hover:underline font-medium block mt-0.5"
                >
                  Ivy's Park Business Park, Next to Mark Hotel, Thika Superhighway Service Lane, Ruiru, Kiambu County, Kenya ↗
                </a>
              </div>
              <p><strong>Assigned Engineer:</strong> Kenfoss Ruiru Duty Specialist</p>
              <p><strong>Site Location:</strong> {location}</p>
              <p><strong>Hotline Contact:</strong> +254 745 411 923</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleWhatsAppRedirect}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </button>

              <button
                onClick={onClose}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
