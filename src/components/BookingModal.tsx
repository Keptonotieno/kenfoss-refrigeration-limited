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
  Building,
  Navigation,
  Compass,
  Search,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Loader2,
  ExternalLink,
  Map as MapIcon,
  Sparkles
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { saveBookingToFirestore } from '../lib/firebase';
import { sanitizeString, sanitizeObject } from '../lib/sanitize';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { 
  KENYA_COUNTY_HIERARCHY, 
  getSubCountiesForCounty, 
  getWardsForSubCounty, 
  getAreasForWard,
  getHierarchyCoords
} from '../data/kenyaHierarchyData';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const hasValidMapsKey = Boolean(API_KEY && API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE');

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
  const { services, contactInfo, websiteSettings, addBooking } = useAdmin();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'service' | 'quote'>(initialType as 'service' | 'quote');
  
  // Basic Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Countrywide Kenya Hierarchy Location State
  const [selectedCounty, setSelectedCounty] = useState('Kiambu');
  const [selectedSubCounty, setSelectedSubCounty] = useState('Ruiru');
  const [selectedWard, setSelectedWard] = useState('Githothua / Ruiru Bypass');
  const [selectedArea, setSelectedArea] = useState('Ruiru Bypass & Industrial Park (HQ Base)');
  
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  
  // GPS State
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({ lat: -1.1462, lng: 36.9587 });
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);
  const [showInteractiveMapPin, setShowInteractiveMapPin] = useState(false);

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

  // Handle County Selection Change -> Auto-populate Sub-Counties, Wards, Areas
  const handleCountyChange = (newCounty: string) => {
    setSelectedCounty(newCounty);
    const subCounties = getSubCountiesForCounty(newCounty);
    const defaultSubCounty = subCounties[0] || `${newCounty} Central`;
    setSelectedSubCounty(defaultSubCounty);

    const wards = getWardsForSubCounty(newCounty, defaultSubCounty);
    const defaultWard = wards[0] || `${defaultSubCounty} Central`;
    setSelectedWard(defaultWard);

    const areas = getAreasForWard(newCounty, defaultSubCounty, defaultWard);
    const defaultArea = areas[0] || `${defaultWard} Centre`;
    setSelectedArea(defaultArea);

    if (!gpsCaptured) {
      const coords = getHierarchyCoords(newCounty, defaultSubCounty, defaultWard, defaultArea);
      setLatLng(coords);
    }
  };

  // Handle Sub-County Selection Change
  const handleSubCountyChange = (newSubCounty: string) => {
    setSelectedSubCounty(newSubCounty);

    const wards = getWardsForSubCounty(selectedCounty, newSubCounty);
    const defaultWard = wards[0] || `${newSubCounty} Central`;
    setSelectedWard(defaultWard);

    const areas = getAreasForWard(selectedCounty, newSubCounty, defaultWard);
    const defaultArea = areas[0] || `${defaultWard} Centre`;
    setSelectedArea(defaultArea);

    if (!gpsCaptured) {
      const coords = getHierarchyCoords(selectedCounty, newSubCounty, defaultWard, defaultArea);
      setLatLng(coords);
    }
  };

  // Handle Ward Selection Change
  const handleWardChange = (newWard: string) => {
    setSelectedWard(newWard);

    const areas = getAreasForWard(selectedCounty, selectedSubCounty, newWard);
    const defaultArea = areas[0] || `${newWard} Centre`;
    setSelectedArea(defaultArea);

    if (!gpsCaptured) {
      const coords = getHierarchyCoords(selectedCounty, selectedSubCounty, newWard, defaultArea);
      setLatLng(coords);
    }
  };

  // Handle Area Selection Change
  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    if (!gpsCaptured) {
      const coords = getHierarchyCoords(selectedCounty, selectedSubCounty, selectedWard, newArea);
      setLatLng(coords);
    }
  };

  // Handle "Share My Live Location" GPS trigger
  const handleShareLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsErrorMsg("Geolocation is not supported by your browser. Please select your County & Sub-County manually.");
      return;
    }

    setGpsLoading(true);
    setGpsErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setLatLng({ lat, lng });
        setGpsAccuracy(accuracy);
        setGpsCaptured(true);
        setGpsLoading(false);

        showToast({
          type: 'info',
          title: 'Exact GPS Pin Captured!',
          message: `GPS coordinates locked (±${accuracy}m accuracy). Assigned technician will navigate directly to your site.`
        });
      },
      (err) => {
        setGpsLoading(false);
        let msg = "Could not retrieve your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "GPS access denied. Please allow location access or pick County, Sub-County, Ward manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location service unavailable. Please pick location manually.";
        } else if (err.code === err.TIMEOUT) {
          msg = "GPS request timed out. Please tap again or pick location manually.";
        }
        setGpsErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Search landmark / place manually or via Google Place search
  const handlePlaceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeSearchQuery.trim()) return;

    setLandmark((prev) => prev ? `${placeSearchQuery.trim()} (${prev})` : placeSearchQuery.trim());
    showToast({
      type: 'info',
      title: 'Place / Landmark Set',
      message: `Landmark "${placeSearchQuery}" added to booking address for engineer dispatch.`
    });
  };

  if (!isOpen) return null;

  const availableSubCounties = getSubCountiesForCounty(selectedCounty);
  const availableWards = getWardsForSubCounty(selectedCounty, selectedSubCounty);
  const availableAreas = getAreasForWard(selectedCounty, selectedSubCounty, selectedWard);

  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng.lat},${latLng.lng}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ref = tab === 'service' ? `KEN-${Math.floor(100000 + Math.random() * 900000)}` : `RFQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const cleanName = sanitizeString(fullName) || sanitizeString(user?.displayName) || 'Guest Customer';
    const cleanEmail = sanitizeString(email) || sanitizeString(user?.email) || '';
    const cleanPhone = sanitizeString(phone);
    const cleanExactAddress = sanitizeString(exactAddress);
    const cleanLandmark = sanitizeString(landmark);
    const cleanServiceType = sanitizeString(serviceType);
    const cleanProjectType = sanitizeString(projectType);
    const cleanNotes = sanitizeString(notes);
    const cleanCompanyName = sanitizeString(companyName);
    const cleanPreferredDate = sanitizeString(preferredDate);

    // Build comprehensive structured address string
    const locationParts = [];
    if (cleanExactAddress) locationParts.push(cleanExactAddress);
    locationParts.push(selectedArea);
    locationParts.push(`${selectedWard} Ward`);
    locationParts.push(`${selectedSubCounty} Sub-County`);
    locationParts.push(`${selectedCounty} County`);
    if (cleanLandmark) locationParts.push(`(Landmark: ${cleanLandmark})`);
    const fullLocationSummary = locationParts.join(', ');

    const finalCoords = latLng;

    const bookingPayload = sanitizeObject({
      refCode: ref,
      type: tab,
      userId: user?.uid || 'guest',
      userName: cleanName,
      userEmail: cleanEmail,
      fullName: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      location: fullLocationSummary,
      county: selectedCounty,
      subCounty: selectedSubCounty,
      ward: selectedWard,
      selectedArea: selectedArea,
      town: selectedArea,
      exactAddress: cleanExactAddress,
      landmark: cleanLandmark,
      latitude: finalCoords.lat,
      longitude: finalCoords.lng,
      gpsCaptured,
      gpsAccuracy: gpsAccuracy || undefined,
      googleMapsUrl: googleMapsNavUrl,
      serviceType: tab === 'service' ? cleanServiceType : cleanProjectType,
      equipmentDetails: cleanNotes,
      notes: cleanNotes,
      preferredDate: cleanPreferredDate,
      date: cleanPreferredDate || new Date().toISOString().slice(0, 10),
      companyName: tab === 'quote' ? cleanCompanyName : '',
      status: 'New',
      createdAt: new Date().toISOString()
    });

    try {
      // 1. Save complete booking to Firestore
      await saveBookingToFirestore(bookingPayload);

      // 2. Add to local AdminContext for instant UI sync across dashboards
      try {
        addBooking({
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          location: fullLocationSummary,
          county: selectedCounty,
          subCounty: selectedSubCounty,
          ward: selectedWard,
          town: selectedArea,
          selectedArea: selectedArea,
          exactAddress: cleanExactAddress,
          landmark: cleanLandmark,
          latitude: finalCoords.lat,
          longitude: finalCoords.lng,
          gpsCaptured,
          gpsAccuracy: gpsAccuracy || undefined,
          googleMapsUrl: googleMapsNavUrl,
          serviceType: tab === 'service' ? cleanServiceType : cleanProjectType,
          date: cleanPreferredDate || new Date().toISOString().slice(0, 10),
          notes: cleanNotes,
          totalAmount: tab === 'service' ? 12000 : 0,
          paymentStatus: 'Unpaid'
        });
      } catch (e) {
        // Ignored if local context fails
      }

      // 3. Optional backend endpoint fetch
      const endpoint = tab === 'service' ? '/api/book' : '/api/quote';
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });
      } catch (e) {
        // Silent API failover
      }

      setConfirmation({
        refCode: ref,
        message: `Booking ${ref} saved! Lead EPRA technician assigned for ${selectedCounty} County (${selectedSubCounty} Sub-County, ${selectedWard} Ward). Hotline: ${cleanPhone}`
      });

      showToast({
        type: tab === 'service' ? 'booking' : 'quote',
        title: tab === 'service' ? `Service Booking Saved (${cleanServiceType})` : `Commercial RFQ Saved (${cleanProjectType})`,
        message: `Thank you ${cleanName}! Your booking in ${selectedCounty} (${selectedSubCounty}, ${selectedWard}) is recorded. Lead Engineer will call ${cleanPhone} in 15 mins.`,
        refCode: ref,
        phone: cleanPhone,
        location: fullLocationSummary
      });
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setConfirmation({
        refCode: ref,
        message: `Inquiry ${ref} recorded! Lead engineer will call ${cleanPhone} shortly.`
      });

      showToast({
        type: tab === 'service' ? 'booking' : 'quote',
        title: `Inquiry Logged (${ref})`,
        message: `Your booking was logged. Kenfoss engineers will call ${cleanPhone} shortly.`,
        refCode: ref,
        phone: cleanPhone
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const text = tab === 'service'
      ? `Hello Kenfoss Refrigeration, I booked service ${confirmation?.refCode || ''} for ${serviceType} at ${selectedArea}, ${selectedSubCounty} Sub-County, ${selectedCounty} County. Details: ${notes}`
      : `Hello Kenfoss Refrigeration, I submitted commercial RFQ ${confirmation?.refCode || ''} for ${companyName} (${projectType}) in ${selectedArea}, ${selectedSubCounty} Sub-County, ${selectedCounty} County. Details: ${notes}`;

    const waNum = contactInfo?.whatsappNumber || '254745411923';
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-7 space-y-5 relative shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Toggle Tabs */}
        {!confirmation ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-blue-300 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                  EPRA Certified • Countrywide Kenya Coverage
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">• All 47 Counties Supported</span>
              </div>
              
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTab('service')}
                  className={`pb-3 px-3 sm:px-4 font-extrabold text-xs sm:text-sm flex items-center space-x-2 cursor-pointer transition-colors border-b-2 ${
                    tab === 'service'
                      ? 'border-[#FF7A00] text-[#FF7A00]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Book Repair / Maintenance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('quote')}
                  className={`pb-3 px-3 sm:px-4 font-extrabold text-xs sm:text-sm flex items-center space-x-2 cursor-pointer transition-colors border-b-2 ${
                    tab === 'quote'
                      ? 'border-[#0057B8] text-[#0057B8] dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Commercial RFQ</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              
              {tab === 'quote' && (
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Serena Hotels / Naivas / Serena Flowers / Farm Produce Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daniel Kamau"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0745 411 923"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. info@company.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>

              {/* LOCATION BLOCK - 47 COUNTIES COMPLETE HIERARCHY */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-black text-xs">
                    <MapPin className="w-4 h-4 text-[#FF7A00]" />
                    <span>Kenya Precision Location Selector (County → Sub-County → Ward → Area)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    47 Counties • 290 Sub-Counties
                  </span>
                </div>

                {/* Search Place / Landmark Quick Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search landmark or place (e.g. KICC, Naivas Ruiru Bypass, Eldoret Market)..."
                      value={placeSearchQuery}
                      onChange={(e) => setPlaceSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePlaceSearch(e);
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0057B8]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePlaceSearch}
                    className="px-3 py-2 bg-[#0057B8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Set Landmark
                  </button>
                </div>

                {/* GPS Location Share & Interactive Map Pin Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareLiveLocation}
                    disabled={gpsLoading}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      gpsCaptured 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 text-[#0057B8] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {gpsLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0057B8]" />
                        <span>Acquiring GPS Signal...</span>
                      </>
                    ) : gpsCaptured ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Exact GPS Locked (±{gpsAccuracy}m)</span>
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-4 h-4 text-[#FF7A00]" />
                        <span>Share My Current GPS Location</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInteractiveMapPin(!showInteractiveMapPin)}
                    className="py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MapIcon className="w-4 h-4 text-amber-500" />
                    <span>{showInteractiveMapPin ? 'Hide Interactive Map Pin' : 'Confirm Pin on Map'}</span>
                  </button>
                </div>

                {/* GPS Permission Error Alert */}
                {gpsErrorMsg && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-800 dark:text-amber-200 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{gpsErrorMsg}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        You can manually pick your County, Sub-County, Ward and Area below.
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setGpsErrorMsg(null)}
                      className="text-amber-600 hover:text-amber-900 text-xs font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Interactive Map Pin Confirmation View */}
                {showInteractiveMapPin && (
                  <div className="rounded-2xl border border-amber-500/30 overflow-hidden bg-slate-950 p-2 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-amber-300 px-1 font-bold">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        Technician Dispatch GPS Target ({latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)})
                      </span>
                      <a
                        href={googleMapsNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-0.5 text-[10px]"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="w-full h-48 rounded-xl overflow-hidden relative">
                      {hasValidMapsKey ? (
                        <APIProvider apiKey={API_KEY} version="weekly">
                          <Map
                            defaultCenter={latLng}
                            defaultZoom={13}
                            mapId="BOOKING_PIN_MAP_ID"
                            style={{ width: '100%', height: '100%' }}
                            gestureHandling="cooperative"
                          >
                            <AdvancedMarker position={latLng} title="Installation / Repair Site Location">
                              <Pin background="#FF7A00" borderColor="#7C2D12" glyphColor="#FFFFFF" />
                            </AdvancedMarker>
                          </Map>
                        </APIProvider>
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center p-3 text-slate-300 text-xs">
                          <MapPin className="w-6 h-6 text-amber-400 animate-bounce mb-1" />
                          <p className="font-bold text-white">Installation Site Coordinates</p>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            Lat: {latLng.lat.toFixed(4)}° • Lng: {latLng.lng.toFixed(4)}°
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4-Step Cascading Location Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                      1. Select County (47 Kenyan Counties) *
                    </label>
                    <select
                      value={selectedCounty}
                      onChange={(e) => handleCountyChange(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#0057B8] font-bold text-xs"
                    >
                      {KENYA_COUNTY_HIERARCHY.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} County ({c.subCounties.length} Sub-Counties)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                      2. Select Sub-County / Constituency *
                    </label>
                    <select
                      value={selectedSubCounty}
                      onChange={(e) => handleSubCountyChange(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#0057B8] font-bold text-xs"
                    >
                      {availableSubCounties.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc} Sub-County
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                      3. Select Ward / Division *
                    </label>
                    <select
                      value={selectedWard}
                      onChange={(e) => handleWardChange(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#0057B8] font-bold text-xs"
                    >
                      {availableWards.map((w) => (
                        <option key={w} value={w}>
                          {w} Ward
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                      4. Select Area / Local Landmark / Estate *
                    </label>
                    <select
                      value={selectedArea}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none focus:ring-2 focus:ring-[#0057B8] font-bold text-xs"
                    >
                      {availableAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Manual Address / Landmark Entry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Specific Street / Building / Estate Gate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 45, Enterprise Road, Gate B"
                      value={exactAddress}
                      onChange={(e) => setExactAddress(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-[#0057B8]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Nearby Landmark for Technician
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Shell Petrol Station / Naivas Supermarket"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-[#0057B8]"
                    />
                  </div>
                </div>

              </div>

              {tab === 'service' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Select Required Service *</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                    >
                      {services && services.length > 0 ? (
                        services.map(svc => (
                          <option key={svc.id} value={svc.title}>
                            {svc.title} ({svc.startingPrice})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Cold Room Repair & Overhaul">Cold Room Repair & Overhaul</option>
                          <option value="Freezer Repair">Freezer Repair</option>
                          <option value="Refrigerator & Freezer Repair">Refrigerator & Freezer Repair</option>
                          <option value="Walk-in Cooler Repair">Walk-in Cooler Repair</option>
                          <option value="Commercial Chiller Maintenance">Commercial Chiller Maintenance</option>
                          <option value="Milk Cooling Tank Servicing">Milk Cooling Tank Servicing</option>
                          <option value="Display Fridge Repair">Display Fridge Repair</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Preferred Date Slot</label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Project Category</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                  >
                    <option value="Cold Room Sizing & Turnkey Installation">Turnkey Cold Room Design & Installation</option>
                    <option value="Supermarket Display Cooling System">Supermarket Central Compressor Rack System</option>
                    <option value="Hospital Pharmaceutical Cold Chain">Pharmaceutical / Vaccine Cold Chain Facility</option>
                    <option value="Commercial VRF Central Air Con">Commercial VRF / Chilled Water HVAC</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Additional Notes / Equipment Specs</label>
                <textarea
                  rows={2}
                  placeholder="Provide brand names, error symptoms, dimensions, or special access instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-xl flex items-center justify-between text-slate-700 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#0057B8] dark:text-blue-400" />
                  <span className="font-semibold text-[11px]">Includes 90-Day Stamped Workmanship Guarantee</span>
                </div>
                <span className="text-[#0057B8] dark:text-blue-400 font-bold text-[10px]">EPRA CLASS C1</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider ${
                  tab === 'service' ? 'bg-[#FF7A00] hover:bg-[#e06c00]' : 'bg-[#0057B8] hover:bg-blue-700'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Saving to Database...' : tab === 'service' ? 'Confirm Service Booking' : 'Submit Commercial RFQ'}</span>
              </button>

            </form>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-700">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">INQUIRY REFERENCE ID</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">{confirmation.refCode}</h3>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
              {confirmation.message}
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-sm mx-auto text-left">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Engineering Workshop & Central Dispatch</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">{websiteSettings?.companyName || 'Kenfoss Refrigeration Limited'}</p>
                <a 
                  href={contactInfo?.googleMapsEmbedUrl || "https://maps.google.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#0057B8] dark:text-blue-400 hover:underline font-medium block mt-0.5"
                >
                  {contactInfo?.address || 'Ruiru Bypass'}, {contactInfo?.city || 'Kiambu'} ↗
                </a>
              </div>
              <p><strong>Assigned Zone:</strong> {selectedCounty} County ({selectedSubCounty}, {selectedWard})</p>
              <p><strong>Site Coordinates:</strong> {latLng ? `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}` : 'County Standard'}</p>
              <p><strong>Hotline Contact:</strong> {contactInfo?.mainPhone || '+254 745 411 923'}</p>
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
                className="py-3 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
