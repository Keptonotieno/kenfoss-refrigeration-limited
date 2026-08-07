import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Truck,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Zap,
  Building2,
  ArrowRight,
  Compass,
  Radio,
  X,
  UserCheck,
  Mail,
  Info,
  Globe,
  Crosshair
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getServiceZonesForCounty,
  getAllFeaturedZones,
  getAll47CountyZones,
  KENYA_47_COUNTIES,
  COUNTY_CODES_MAP,
  cleanCountySearchString,
  ServiceZone
} from '../data/kenyaServiceZonesData';
import { getCountyCoords } from '../data/countyCoordinates';
import { getTownsForCounty } from '../data/kenyaCountiesAndTowns';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export { KENYA_47_COUNTIES };

interface ServiceAreasProps {
  onOpenBooking?: (type?: string, details?: any) => void;
}

export const ServiceAreas: React.FC<ServiceAreasProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const [selectedRegionTab, setSelectedRegionTab] = useState<string>('All');
  const [selectedKenyaCounty, setSelectedKenyaCounty] = useState<string>('All 47 Counties');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [activeZoneId, setActiveZoneId] = useState<string>('kiambu-ruiru');
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Google Maps Key resolution
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  // Base county zones resolution
  const activeCountyZones = useMemo(() => {
    if (selectedKenyaCounty !== 'All 47 Counties') {
      return getServiceZonesForCounty(selectedKenyaCounty);
    }
    if (selectedRegionTab !== 'All') {
      const regionCountiesMap: Record<string, string[]> = {
        'Central': ['Kiambu', 'Nairobi', 'Murang\'a', 'Nyeri', 'Kirinyaga', 'Nyandarua'],
        'Rift Valley': ['Nakuru', 'Uasin Gishu', 'Kajiado', 'Narok', 'Kericho', 'Bomet', 'Trans-Nzoia', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Samburu', 'Turkana', 'West Pokot'],
        'Coast': ['Mombasa', 'Kilifi', 'Kwale', 'Lamu', 'Taita-Taveta', 'Tana River'],
        'Western & Nyanza': ['Kisumu', 'Kakamega', 'Kisii', 'Bungoma', 'Busia', 'Siaya', 'Homa Bay', 'Migori', 'Vihiga', 'Nyamira'],
        'Eastern & Northern': ['Embu', 'Meru', 'Machakos', 'Makueni', 'Kitui', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Tharaka-Nithi']
      };
      const counties = regionCountiesMap[selectedRegionTab] || [];
      const zones: ServiceZone[] = [];
      counties.forEach(c => zones.push(...getServiceZonesForCounty(c)));
      return zones;
    }
    if (searchLocation.trim()) {
      return getAll47CountyZones();
    }
    return getAllFeaturedZones();
  }, [selectedKenyaCounty, selectedRegionTab, searchLocation]);

  // Apply search filter
  const filteredZones = useMemo(() => {
    if (!searchLocation.trim()) return activeCountyZones;
    const term = searchLocation.toLowerCase().trim();
    const cleanTerm = cleanCountySearchString(term);
    return activeCountyZones.filter(zone => {
      const code = COUNTY_CODES_MAP[zone.county] || '';
      return (
        zone.county.toLowerCase().includes(term) ||
        cleanCountySearchString(zone.county).includes(cleanTerm) ||
        zone.subCounty.toLowerCase().includes(term) ||
        cleanCountySearchString(zone.subCounty).includes(cleanTerm) ||
        zone.name.toLowerCase().includes(term) ||
        zone.keyEstates.some(e => e.toLowerCase().includes(term) || cleanCountySearchString(e).includes(cleanTerm)) ||
        zone.keyIndustries.some(i => i.toLowerCase().includes(term)) ||
        getTownsForCounty(zone.county).some(t => t.toLowerCase().includes(term)) ||
        code === term || code === term.padStart(3, '0')
      );
    });
  }, [activeCountyZones, searchLocation]);

  // Safe active zone resolution
  const activeZone = useMemo(() => {
    if (filteredZones.length === 0) return null;
    const found = filteredZones.find((z) => z.id === activeZoneId);
    return found || filteredZones[0];
  }, [filteredZones, activeZoneId]);

  const tooltipZone = useMemo(() => {
    if (filteredZones.length === 0) return null;
    const hovered = filteredZones.find((z) => z.id === hoveredZoneId);
    return hovered || activeZone || filteredZones[0];
  }, [filteredZones, hoveredZoneId, activeZone]);

  // Map coordinates for active zone
  const activeZoneCoords = useMemo(() => {
    if (!activeZone) return { lat: -1.1461, lng: 36.9602 };
    if (activeZone.coordinates) return activeZone.coordinates;
    const countyLoc = getCountyCoords(activeZone.county);
    return { lat: countyLoc.lat, lng: countyLoc.lng };
  }, [activeZone]);

  return (
    <section id="service-areas" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decorative Grids & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#0057B8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0057B8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00AEEF]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-[#00AEEF] text-xs font-extrabold uppercase tracking-widest shadow-inner">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'sw'
                ? 'Maeneo ya Huduma Za Kenfoss Refrigeration'
                : 'Kenfoss Rapid Dispatch & Coverage Network'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {language === 'sw' ? (
              <span>
                Tunahudumia <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] via-blue-300 to-amber-400">Kaunti Zote 47 Nchini Kenya</span>
              </span>
            ) : (
              <span>
                Enterprise Operations Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] via-blue-300 to-amber-400">All 47 Counties in Kenya</span>
              </span>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {language === 'sw'
              ? 'Kenfoss Refrigeration Limited inatekeleza miradi ya viwanda, installation ya cold rooms, commercial HVAC na matengenezo ya 24/7 katika kaunti zote 47 za Kenya kutoka Ruiru HQ.'
              : 'Kenfoss Refrigeration Limited provides turnkey commercial refrigeration, cold room engineering, VRF HVAC systems, and 24/7 mobile emergency dispatch across all 47 counties in Kenya.'}
          </p>
        </div>

        {/* Live Mobile Fleet & 47 Counties Nationwide Badge */}
        <div className="mb-10 p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>100% Turnkey Coverage Across All 47 Counties in Kenya</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Truck className="w-4 h-4 text-amber-400" />
              Central Ruiru HQ & Regional Field Teams Active
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Clock className="w-4 h-4" />
              24/7 Emergency Technical Support
            </span>
          </div>
        </div>

        {/* 47 Kenya Counties Quick Select Explorer Bar */}
        <div className="mb-8 p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00AEEF]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Kenya 47 Counties Coverage Explorer
              </h3>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
              Active Enterprise Installations & Mobile Teams
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            <div className="col-span-full sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Select Any County in Kenya:
              </label>
              <select
                value={selectedKenyaCounty}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedKenyaCounty(val);
                  if (val !== 'All 47 Counties') {
                    setSearchLocation('');
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl p-2.5 outline-none focus:border-[#00AEEF] cursor-pointer"
              >
                <option value="All 47 Counties">🇰🇪 All 47 Kenya Counties (Nationwide)</option>
                {KENYA_47_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    County: {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-full sm:col-span-1 md:col-span-2 lg:col-span-3 flex items-center bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 text-xs">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mr-2.5" />
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-white">Operating in {selectedKenyaCounty}:</strong> Kenfoss deploys mobile engineering teams, turnkey cold storage erection, VRF air conditioning, and emergency compressor repair in <span className="text-amber-300 font-bold">{selectedKenyaCounty === 'All 47 Counties' ? 'all 47 counties of Kenya' : `${selectedKenyaCounty} County`}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Location Search & Regional Filter Controls */}
        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Box */}
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder={
                  language === 'sw'
                    ? 'Tafuta mtaa, mji au kaunti yako (k.m. Embu, Mombasa, Kisumu, Eldoret, Thika, Westlands)...'
                    : 'Search any county, town, ward or estate (e.g., Embu, Mombasa, Kisumu, Eldoret, Thika, Westlands)...'
                }
                className="w-full pl-11 pr-10 py-3 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] shadow-inner"
              />
              {searchLocation && (
                <button
                  onClick={() => setSearchLocation('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Region Selector Filter Tabs */}
            <div className="md:col-span-5 flex items-center bg-slate-800/90 p-1 border border-slate-700/80 rounded-xl overflow-x-auto no-scrollbar">
              {['All', 'Central', 'Rift Valley', 'Coast', 'Western & Nyanza', 'Eastern & Northern'].map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    setSelectedRegionTab(region);
                    setSelectedKenyaCounty('All 47 Counties');
                  }}
                  className={`flex-1 min-w-[70px] py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                    selectedRegionTab === region && selectedKenyaCounty === 'All 47 Counties'
                      ? 'bg-[#0057B8] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

          </div>

          {/* Quick Town Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00AEEF]" />
              {language === 'sw'
                ? 'Miji & Vituo Mashuhuri:'
                : `Popular Hubs (${selectedKenyaCounty === 'All 47 Counties' ? 'Nationwide' : `${selectedKenyaCounty} County`}):`}
            </span>
            {getTownsForCounty(selectedKenyaCounty).map((town) => (
              <button
                key={town}
                onClick={() => {
                  setSearchLocation(town);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  searchLocation.toLowerCase() === town.toLowerCase()
                    ? 'bg-[#00AEEF] text-slate-950 border-[#00AEEF] font-extrabold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {town}
              </button>
            ))}
            <span className="ml-auto text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
              {filteredZones.length} {filteredZones.length === 1 ? 'Zone Found' : 'Zones Active'}
            </span>
          </div>
        </div>

        {/* Interactive Map Layout & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Interactive Coverage Hub Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Visual Coverage Container Card */}
            <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>
                    Dispatch Matrix ({selectedKenyaCounty === 'All 47 Counties' ? `${selectedRegionTab} Region` : `${selectedKenyaCounty} County`})
                  </span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-900/80 text-blue-200 rounded border border-blue-700">
                  {filteredZones.length} Dispatch Stations
                </span>
              </div>

              {filteredZones.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/90 border border-dashed border-slate-700 rounded-xl space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {language === 'sw' ? 'Hakuna eneo lililopatikana kwa utafutaji wako.' : 'No direct match found for "' + searchLocation + '"'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'sw'
                        ? 'Tunafika kote Kenya kwa miradi ya viwanda. Wasiliana nasi kwa uthibitisho.'
                        : 'We cover all 47 counties in Kenya! Clear search or call dispatch directly.'}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSearchLocation('');
                        setSelectedKenyaCounty('All 47 Counties');
                        setSelectedRegionTab('All');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg border border-slate-600 transition-colors cursor-pointer"
                    >
                      {language === 'sw' ? 'Ondoa Tuta' : 'Clear Filters'}
                    </button>
                    <button
                      onClick={() => onOpenBooking?.('service', { location: searchLocation })}
                      className="px-3 py-1.5 bg-[#0057B8] hover:bg-blue-600 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                    >
                      {language === 'sw' ? 'Omba Dispatch' : 'Request Mobile Dispatch'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredZones.map((zone) => {
                      const isActive = activeZone && zone.id === activeZone.id;
                      const isHovered = zone.id === hoveredZoneId;
                      return (
                        <button
                          key={zone.id}
                          onClick={() => setActiveZoneId(zone.id)}
                          onMouseEnter={() => setHoveredZoneId(zone.id)}
                          onMouseLeave={() => setHoveredZoneId(null)}
                          onFocus={() => setHoveredZoneId(zone.id)}
                          onBlur={() => setHoveredZoneId(null)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-32 group ${
                            isActive
                              ? 'bg-gradient-to-b from-[#0057B8] to-blue-900 border-[#00AEEF] ring-2 ring-[#00AEEF]/40 shadow-lg scale-[1.02]'
                              : isHovered
                              ? 'bg-slate-800 border-blue-500/80 shadow-md scale-[1.01]'
                              : 'bg-slate-900/80 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {zone.isHQ && (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded">
                              HQ
                            </span>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  zone.isHQ
                                    ? 'text-amber-400'
                                    : isActive || isHovered
                                    ? 'text-white'
                                    : 'text-[#00AEEF]'
                                }`}
                              />
                              <span className="text-xs font-black text-white line-clamp-1">
                                {zone.county} County
                              </span>
                            </div>

                            <div className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight">
                              {language === 'sw' ? zone.nameSw : zone.name}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-300/90 block line-clamp-1">
                              • {zone.keyEstates[0] || zone.subCounty}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium pt-1 border-t border-white/10">
                              <span>SLA: {zone.emergencySLA}</span>
                              <span className="text-amber-300 font-bold">{zone.distanceFromHQ}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tooltip Quick-View Component */}
                  {tooltipZone && (
                    <div className="p-3.5 bg-slate-900/95 border border-[#00AEEF]/50 rounded-xl space-y-2 shadow-xl animate-in fade-in duration-200 mt-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-[#00AEEF]" />
                          <span className="text-xs font-extrabold text-white">
                            {language === 'sw' ? tooltipZone.nameSw : tooltipZone.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950 text-[#00AEEF] rounded border border-blue-800">
                          {tooltipZone.county} County • {tooltipZone.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-start gap-2 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300 block text-[10px] uppercase">Service Hours:</span>
                            <span className="text-[11px] font-medium">{tooltipZone.serviceHours}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-300">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-300 block text-[10px] uppercase">Zone Hotline:</span>
                            <a href={`tel:${tooltipZone.contactDetails.hotline.replace(/\s+/g, '')}`} className="text-[11px] font-bold text-white hover:underline">
                              {tooltipZone.contactDetails.hotline}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-blue-300 block text-[10px] uppercase">Dispatch Commander:</span>
                            <span className="text-[11px] font-medium">{tooltipZone.contactDetails.dispatchLead}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-purple-300 block text-[10px] uppercase">Zone Email:</span>
                            <a href={`mailto:${tooltipZone.contactDetails.email}`} className="text-[11px] font-medium hover:underline text-slate-200">
                              {tooltipZone.contactDetails.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Verification Banner */}
            {activeZone && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-white">
                      {language === 'sw' ? 'Mji au Mtaa Wako Upo Kwenye Orodha?' : `Found Your Site in ${activeZone.county} County?`}
                    </h4>
                    <p className="text-[11px] text-emerald-200">
                      {language === 'sw'
                        ? 'Fundi wetu anaweza kufika eneo lako haraka. Omba huduma sasa.'
                        : `Our mobile engineering units cover ${activeZone.subCounty} & surrounding wards.`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onOpenBooking?.('service', {
                      county: activeZone.county,
                      subCounty: activeZone.subCounty,
                      area: activeZone.keyEstates[0] || 'Central',
                      location: `${activeZone.name} (${activeZone.county} County)`
                    })
                  }
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {language === 'sw' ? 'Omba Fundi Eneo Hilo' : 'Book Tech for This Area'}
                </button>
              </div>
            )}

          </div>

          {/* Right Side: Detailed Selected Zone Breakdown (5 Cols) */}
          {activeZone && (
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* Active Zone Header */}
              <div className="border-b border-slate-700/80 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-blue-900/80 text-[#00AEEF] text-xs font-extrabold rounded-lg border border-blue-700">
                    {activeZone.county} County
                  </span>
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-extrabold rounded-lg border border-amber-500/20">
                    {activeZone.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white leading-snug">
                  {language === 'sw' ? activeZone.nameSw : activeZone.name}
                </h3>

                <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <Compass className="w-3.5 h-3.5 text-[#00AEEF]" />
                  <span>Distance from Ruiru HQ: <strong>{activeZone.distanceFromHQ}</strong></span>
                </p>
              </div>

              {/* SLA Response Times & Service Hours Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Emergency SLA:
                  </span>
                  <span className="text-sm font-black text-amber-400 block">
                    {activeZone.emergencySLA}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Gas leaks & temp alarms
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" /> Routine Service:
                  </span>
                  <span className="text-sm font-black text-emerald-400 block">
                    {activeZone.standardSLA}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Maintenance & audits
                  </span>
                </div>
              </div>

              {/* Interactive Google Map Preview / Site Coordinate Visualizer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#00AEEF]" />
                    <span>Zone Coordinates & Live Location</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {activeZoneCoords.lat.toFixed(4)}, {activeZoneCoords.lng.toFixed(4)}
                  </span>
                </div>

                <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 relative">
                  {hasValidKey ? (
                    <APIProvider apiKey={API_KEY}>
                      <Map
                        center={activeZoneCoords}
                        zoom={11}
                        gestureHandling="cooperative"
                        disableDefaultUI={true}
                        className="w-full h-full"
                      >
                        <AdvancedMarker position={activeZoneCoords}>
                          <Pin background="#0057B8" borderColor="#00AEEF" glyphColor="#ffffff" />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-[radial-gradient(#0057B8_1px,transparent_1px)] [background-size:16px_16px]">
                      <Crosshair className="w-8 h-8 text-[#00AEEF] animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {activeZone.county} County Dispatch Station
                        </div>
                        <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                          GPS: {activeZoneCoords.lat.toFixed(4)}° N, {activeZoneCoords.lng.toFixed(4)}° E
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Central Ruiru HQ Dispatch Vector Locked
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Zone Operating Hours & Dispatch Commander Card */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-700/90 rounded-xl space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'sw' ? 'Masaa Ya Huduma Katika Eneo Hili:' : 'Zone Operating Hours:'}
                    </span>
                    <p className="text-xs font-bold text-amber-300">
                      {activeZone.serviceHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'sw' ? 'Mkuu wa Uhusiano na Dispatch:' : 'Zone Dispatch Lead:'}
                    </span>
                    <p className="text-xs font-bold text-white">
                      {activeZone.contactDetails.dispatchLead}
                    </p>
                    <a href={`tel:${activeZone.contactDetails.hotline.replace(/\s+/g, '')}`} className="text-xs text-[#00AEEF] hover:underline font-extrabold flex items-center gap-1 mt-0.5">
                      <PhoneCall className="w-3 h-3" />
                      <span>Direct: {activeZone.contactDetails.hotline}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Key Covered Estates List */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'sw' ? 'Mitaa na Maeneo Yanayofunikwa' : 'Key Wards & Estates Covered:'}</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {activeZone.keyEstates.map((estate, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold rounded-lg"
                    >
                      • {estate}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Industries Served */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'sw' ? 'Sekta Zilizopo Eneo Hilo' : 'Primary Sector Installations:'}</span>
                </h4>
                <ul className="space-y-1">
                  {activeZone.keyIndustries.map((ind, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() =>
                    onOpenBooking?.('service', {
                      county: activeZone.county,
                      subCounty: activeZone.subCounty,
                      area: activeZone.keyEstates[0] || 'Central',
                      location: `${activeZone.name} (${activeZone.county} County)`
                    })
                  }
                  className="w-full py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'sw' ? 'Mwekee Fundi Wako Sasa' : 'Dispatch Technician to This Area'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`tel:${activeZone.contactDetails.hotline.replace(/\s+/g, '')}`}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Hotline: {activeZone.contactDetails.hotline}</span>
                </a>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
