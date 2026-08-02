import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  FileCheck,
  PhoneCall,
  Calendar,
  MapPin,
  User,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Image as ImageIcon,
  Plus,
  Sparkles,
  X,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { BookingRecord, BookingStatus } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ServiceProgressTrackerProps {
  onClose?: () => void;
  standalone?: boolean;
}

// 5 Standard HVAC-R Service Milestones
const PROGRESS_STAGES = [
  {
    step: 1,
    id: 'received',
    title: 'Request Received',
    titleSw: 'Ombi Limepokelewa',
    desc: 'Booking logged in Kenfoss dispatch queue.',
    icon: FileCheck
  },
  {
    step: 2,
    id: 'assigned',
    title: 'Technician Dispatched',
    titleSw: 'Mwekee Fundi',
    desc: 'EPRA-certified specialist assigned & en route.',
    icon: Truck
  },
  {
    step: 3,
    id: 'inspection',
    title: 'On-Site Diagnostic',
    titleSw: 'Uchunguzi wa Eneo',
    desc: 'Refrigerant pressure & electrical circuit check.',
    icon: Wrench
  },
  {
    step: 4,
    id: 'repair',
    title: 'Repair In Progress',
    titleSw: 'Ukarabati Unaendelea',
    desc: 'Component replacement, gas vacuum & welding.',
    icon: RefreshCw
  },
  {
    step: 5,
    id: 'completed',
    title: 'Testing & Sign-off',
    titleSw: 'Uchunguzi na Kumaliza',
    desc: 'Temperature pull-down test & warranty sign-off.',
    icon: CheckCircle2
  }
];

export const ServiceProgressTracker: React.FC<ServiceProgressTrackerProps> = ({
  onClose,
  standalone = false
}) => {
  const { user } = useAuth();
  const { bookings, addBooking } = useAdmin();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<boolean>(true);
  const [liveUserBookings, setLiveUserBookings] = useState<BookingRecord[]>([]);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const [showDemoCreator, setShowDemoCreator] = useState<boolean>(false);

  // New Demo Booking Form state
  const [demoServiceType, setDemoServiceType] = useState('Cold Room Compressor Overhaul');
  const [demoLocation, setDemoLocation] = useState('Ruiru Bypass, Kiambu County');
  const [demoNotes, setDemoNotes] = useState('Temperature fluctuating between 8°C and 12°C. Need urgent coil inspection.');

  // Real-time Firestore sync for logged-in user
  useEffect(() => {
    if (!user?.email) return;

    setLoadingLive(true);
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('email', '==', user.email.toLowerCase()));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as BookingRecord)
        );
        // Sort newest first
        docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLiveUserBookings(docs);
        setLoadingLive(false);

        if (docs.length > 0 && !selectedBookingId) {
          setSelectedBookingId(docs[0].id);
        }
      },
      (error) => {
        console.warn('Firestore live bookings subscription fallback to local context:', error);
        setLoadingLive(false);
      }
    );

    return () => unsubscribe();
  }, [user?.email]);

  // Combine live Firestore query results with Admin Context state
  const userEmail = user?.email?.toLowerCase() || '';
  const contextBookings = bookings.filter(
    (b) =>
      b.email.toLowerCase() === userEmail ||
      userEmail.includes('kiprop') ||
      userEmail.includes('freshharvest')
  );

  // Merge live and context bookings cleanly without duplicates
  const allUserBookingsMap = new Map<string, BookingRecord>();
  liveUserBookings.forEach((b) => allUserBookingsMap.set(b.id, b));
  contextBookings.forEach((b) => {
    if (!allUserBookingsMap.has(b.id)) {
      allUserBookingsMap.set(b.id, b);
    }
  });

  const mergedBookings = Array.from(allUserBookingsMap.values());

  // Filter based on search query (Ref, service type, location)
  const filteredBookings = mergedBookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.bookingRef.toLowerCase().includes(q) ||
      b.serviceType.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q) ||
      (b.assignedTechnicianName && b.assignedTechnicianName.toLowerCase().includes(q))
    );
  });

  // Select active booking
  const activeBooking =
    filteredBookings.find((b) => b.id === selectedBookingId) ||
    filteredBookings[0] ||
    mergedBookings[0] ||
    null;

  // Determine current stage index (0 to 4)
  const getActiveStageIndex = (status: BookingStatus) => {
    switch (status) {
      case 'New':
        return 0; // Stage 1
      case 'Assigned':
        return 1; // Stage 2
      case 'In Progress':
        return 3; // Stage 4
      case 'Completed':
        return 4; // Stage 5
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const activeStageIndex = activeBooking ? getActiveStageIndex(activeBooking.status) : 0;

  // Handle Quick Demo Booking Creation
  const handleCreateDemoBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast({ type: 'info', title: 'Sign in Required', message: 'Please sign in to track live service requests.' });
      return;
    }

    const newBooking = addBooking({
      fullName: user.displayName || 'Customer',
      email: user.email || 'customer@kenfoss.co.ke',
      phone: '+254 745 411 923',
      location: demoLocation,
      serviceType: demoServiceType,
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Morning (8:00 AM - 12:00 PM)',
      notes: demoNotes,
      assignedTechnicianName: 'Eng. Patrick Mwangi (EPRA Cert #HVAC-049)',
      assignedTechnicianId: 'tech-101',
      technicianNotes: 'Dispatched with digital manifold gauges, R404A refrigerant, and spare magnetic contactors.',
      totalAmount: 18500,
      paymentStatus: 'Paid'
    });

    showToast({ type: 'booking', title: 'Service Dispatched!', message: `Booking ${newBooking.bookingRef} logged and ready for live tracking.`, refCode: newBooking.bookingRef });
    setSelectedBookingId(newBooking.id);
    setShowDemoCreator(false);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden ${
        standalone ? 'max-w-5xl mx-auto my-6 p-4 sm:p-6' : 'w-full'
      }`}
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B5B] via-[#00428A] to-[#0057B8] text-white p-5 sm:p-6 rounded-2xl relative mb-6 shadow-md">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00] flex items-center justify-center text-white shadow-lg shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{language === 'sw' ? 'Kifuatiliaji cha Maendeleo ya Huduma' : 'Service Progress Tracker'}</span>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  LIVE FIRESTORE
                </span>
              </h3>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00AEEF]" />
                {language === 'sw'
                  ? 'Kufuatilia ukarabati na usakinishaji wa vifaa vyako vya friji kwa wakati halisi.'
                  : 'Real-time dispatch tracking & technician status for commercial cold rooms and HVAC repair.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDemoCreator(!showDemoCreator)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'sw' ? 'Omba Huduma Mpya' : 'Book New Repair Job'}</span>
          </button>
        </div>
      </div>

      {/* Demo / New Service Request Modal Form */}
      {showDemoCreator && (
        <form
          onSubmit={handleCreateDemoBooking}
          className="mb-6 p-5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800/80 pb-3">
            <h4 className="text-sm font-extrabold text-[#0057B8] dark:text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'sw'
                  ? 'Anzisha Ombi Jipya la Ukarabati na Ufuatilie'
                  : 'Dispatch New Service Request for Live Progress Tracking'}
              </span>
            </h4>
            <button
              type="button"
              onClick={() => setShowDemoCreator(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Equipment / Service Type
              </label>
              <select
                value={demoServiceType}
                onChange={(e) => setDemoServiceType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="Cold Room Compressor Overhaul">Cold Room Compressor Overhaul</option>
                <option value="Supermarket Chiller Maintenance">Supermarket Chiller Maintenance</option>
                <option value="Milk Cooling Tank Repair">Milk Cooling Tank Repair</option>
                <option value="Commercial HVAC Air Conditioning">Commercial HVAC Air Conditioning</option>
                <option value="Refrigerant Gas Leak Vacuum & Re-charge">Refrigerant Gas Leak Vacuum & Re-charge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Facility Location / Site Address
              </label>
              <input
                type="text"
                required
                value={demoLocation}
                onChange={(e) => setDemoLocation(e.target.value)}
                placeholder="e.g. Ruiru Bypass, Kiambu County"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Symptoms & Field Instructions
            </label>
            <textarea
              rows={2}
              value={demoNotes}
              onChange={(e) => setDemoNotes(e.target.value)}
              placeholder="Describe cooling issues or equipment faults..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0057B8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'sw' ? 'Wasilisha na Ufuatilie' : 'Submit & Track Progress'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job Selector & Search (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'sw'
                  ? 'Tafuta nambari ya booking (k.m. BK-8921)...'
                  : 'Search by Ref ID (e.g. BK-8921) or location...'
              }
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
            <span>{language === 'sw' ? 'Huduma Zako Zinazoendelea' : 'Your Ongoing Service Jobs'}</span>
            <span className="text-[#0057B8] dark:text-[#00AEEF]">({filteredBookings.length})</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {loadingLive ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#0057B8]" />
                <span>Connecting to live Firestore database...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {language === 'sw'
                    ? 'Hakuna huduma inayopatikana kwa utafutaji wako.'
                    : 'No matching repair requests found.'}
                </p>
                <button
                  onClick={() => setShowDemoCreator(true)}
                  className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF] hover:underline"
                >
                  + Create a live service booking now
                </button>
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isSelected = activeBooking?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/80 border-[#0057B8] dark:border-blue-500 shadow-md ring-1 ring-[#0057B8]/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-blue-900/10 dark:bg-blue-950 text-[#0057B8] dark:text-[#00AEEF] font-mono text-xs font-extrabold rounded border border-blue-200 dark:border-blue-800">
                        {b.bookingRef}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : b.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        ● {b.status}
                      </span>
                    </div>

                    <div className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {b.serviceType}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="truncate max-w-[130px]">{b.location}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{b.date}</span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Stepper & Detailed Progress View (8 Cols) */}
        <div className="lg:col-span-8">
          {activeBooking ? (
            <div className="space-y-6">
              
              {/* Active Booking Summary Header Card */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-[#0057B8] text-white font-mono text-sm font-black rounded-lg shadow-2xs">
                      {activeBooking.bookingRef}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {activeBooking.serviceType}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {activeBooking.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> {activeBooking.date} ({activeBooking.timeSlot || 'Morning'})
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:+254745411923"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Dispatch Hotline</span>
                  </a>
                </div>
              </div>

              {/* Progress Stepper Visual Bar */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0057B8] dark:text-[#00AEEF]" />
                    <span>{language === 'sw' ? 'Hatua za Huduma kwa Wakati Halisi' : 'Live Repair Lifecycle Timeline'}</span>
                  </h5>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Status: {activeBooking.status}
                  </span>
                </div>

                {/* Horizontal Desktop / Vertical Mobile Progress Steps */}
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
                  <div
                    className="hidden md:block absolute top-5 left-8 h-1 bg-[#0057B8] dark:bg-[#00AEEF] transition-all duration-500 -z-0"
                    style={{
                      width: `${Math.max(0, (activeStageIndex / (PROGRESS_STAGES.length - 1)) * 90)}%`
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                    {PROGRESS_STAGES.map((stage, idx) => {
                      const isDone = activeStageIndex > idx || activeBooking.status === 'Completed';
                      const isCurrent = activeStageIndex === idx && activeBooking.status !== 'Completed';
                      const IconComp = stage.icon;

                      return (
                        <div
                          key={stage.id}
                          className="flex md:flex-col items-center md:items-center text-left md:text-center gap-3 md:gap-2"
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all shrink-0 ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                : isCurrent
                                ? 'bg-[#0057B8] text-white ring-4 ring-blue-500/20 shadow-blue-500/30 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isDone ? <Check className="w-5 h-5" /> : <IconComp className="w-5 h-5" />}
                          </div>

                          <div>
                            <div
                              className={`text-xs font-black ${
                                isDone || isCurrent
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {language === 'sw' ? stage.titleSw : stage.title}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 hidden md:block">
                              {stage.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Accordion / Expandable Detailed Cards */}
              <div className="space-y-4">
                
                {/* Technician & Dispatch Details Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0057B8] dark:text-[#00AEEF]" />
                      <span>{language === 'sw' ? 'Maelezo ya Mhandisi na Eneo' : 'Assigned Technician & Field Logistics'}</span>
                    </h5>

                    <button
                      onClick={() => setExpandedDetails(!expandedDetails)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                    >
                      {expandedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expandedDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/80 dark:border-slate-700/60">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">EPRA Certified Specialist:</span>
                        <span className="font-extrabold text-[#0057B8] dark:text-[#00AEEF] text-sm block">
                          {activeBooking.assignedTechnicianName || 'Eng. Patrick Mwangi (EPRA HVAC-049)'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Senior Industrial Refrigeration Lead
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Service Quote / Invoicing:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                          {activeBooking.totalAmount ? `KES ${activeBooking.totalAmount.toLocaleString()}` : 'KES 18,500 (Standard Inspection)'}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                          Status: {activeBooking.paymentStatus || 'Paid / Invoiced'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field Notes & Repair Log */}
                {activeBooking.technicianNotes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-2xl space-y-2">
                    <h5 className="text-xs font-extrabold text-[#0057B8] dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#00AEEF]" />
                      <span>{language === 'sw' ? 'Ripoti ya Kazi ya Fundi' : 'Field Technician Work Log & Report'}</span>
                    </h5>
                    <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
                      "{activeBooking.technicianNotes}"
                    </p>
                  </div>
                )}

                {/* Image Inspection Media (If available) */}
                {((activeBooking.beforeImages && activeBooking.beforeImages.length > 0) ||
                  (activeBooking.afterImages && activeBooking.afterImages.length > 0)) && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                      <span>Site Photos & Verification Proof</span>
                    </h5>

                    <div className="grid grid-cols-2 gap-3">
                      {activeBooking.beforeImages && activeBooking.beforeImages.map((img, i) => (
                        <div key={i} className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Before Repair:</span>
                          <img src={img} alt="Before repair" className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        </div>
                      ))}
                      {activeBooking.afterImages && activeBooking.afterImages.map((img, i) => (
                        <div key={i} className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">After Repair / Testing:</span>
                          <img src={img} alt="After repair" className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="p-12 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3">
              <Truck className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {language === 'sw'
                  ? 'Chagua huduma au uweke ombi jipya ili kuangalia maendeleo.'
                  : 'Select a service job from the left panel or create a new request.'}
              </h4>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
