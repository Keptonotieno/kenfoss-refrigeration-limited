import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ServiceAreasProps {
  onOpenBooking?: (type?: string, details?: any) => void;
}

interface ServiceZone {
  id: string;
  name: string;
  nameSw: string;
  county: 'Kiambu' | 'Nairobi' | 'Machakos' | 'Regional';
  distanceFromHQ: string;
  emergencySLA: string;
  standardSLA: string;
  status: 'Primary Hub' | 'Express Coverage' | 'Extended Zone' | 'On-Demand Nationwide';
  keyEstates: string[];
  keyIndustries: string[];
  isHQ?: boolean;
  serviceHours: string;
  contactDetails: {
    hotline: string;
    dispatchLead: string;
    email: string;
  };
}

const SERVICE_ZONES: ServiceZone[] = [
  {
    id: 'ruiru-hq',
    name: 'Ruiru Bypass & Industrial Park (HQ)',
    nameSw: 'Ruiru Bypass na Eneo la Viwanda (Makao Makuu)',
    county: 'Kiambu',
    distanceFromHQ: '0 km (Central Dispatch)',
    emergencySLA: '< 15 Mins',
    standardSLA: 'Immediate Dispatch',
    status: 'Primary Hub',
    keyEstates: ['Ruiru Town', 'Kenyatta University', 'Kimbo', 'Kahawa Sukari', 'Tatu City Industrial Park', 'Membley'],
    keyIndustries: ['Cold Storage Warehouses', 'Food Processing Facilities', 'Supermarket Distribution'],
    isHQ: true,
    serviceHours: '24/7 Non-Stop Emergency & Routine Dispatch',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Eng. John Mwangi (Central HQ Commander)',
      email: 'dispatch@kenfoss.co.ke'
    }
  },
  {
    id: 'thika-corridor',
    name: 'Thika Superhighway & Juja Corridor',
    nameSw: 'Njia Kuu ya Thika na Sehemu ya Juja',
    county: 'Kiambu',
    distanceFromHQ: '12 - 25 km',
    emergencySLA: '20 - 30 Mins',
    standardSLA: 'Same Day (< 2 Hours)',
    status: 'Express Coverage',
    keyEstates: ['Thika Town', 'Juja HighPoint', 'Gatundu', 'Witeithie', 'Del Monte Processing Zone', 'Kalimoni'],
    keyIndustries: ['Pineapple & Horticultural Packhouses', 'Macadamia Oil Cooling', 'Dairy Farms'],
    serviceHours: '24 Hours Emergency / 07:00 - 19:00 Regular',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Tech. Peter Njuguna (Thika Response Team)',
      email: 'thika@kenfoss.co.ke'
    }
  },
  {
    id: 'nairobi-industrial',
    name: 'Nairobi Industrial Area & Sameer Park',
    nameSw: 'Eneo la Viwanda Nairobi na Sameer Park',
    county: 'Nairobi',
    distanceFromHQ: '22 km',
    emergencySLA: '25 - 35 Mins',
    standardSLA: 'Same Day (< 2 Hours)',
    status: 'Express Coverage',
    keyEstates: ['Industrial Area Road A/B/C', 'Mombasa Road', 'Sameer Business Park', 'Imara Daima', 'Syokimau Industrial'],
    keyIndustries: ['Meat Processing Plants', 'Pharmaceutical Cold Stores', 'Logistics Depots'],
    serviceHours: '24/7 Industrial Rapid Response Support',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Eng. David Ochieng (Industrial Specialist)',
      email: 'industrial@kenfoss.co.ke'
    }
  },
  {
    id: 'westlands-cbd',
    name: 'Nairobi CBD, Westlands & Kilimani',
    nameSw: 'Nairobi CBD, Westlands na Kilimani',
    county: 'Nairobi',
    distanceFromHQ: '20 - 28 km',
    emergencySLA: '30 - 40 Mins',
    standardSLA: 'Scheduled / Priority',
    status: 'Express Coverage',
    keyEstates: ['Westlands', 'Kilimani', 'Lavington', 'Upper Hill', 'Nairobi CBD', 'Parklands', 'Kileleshwa'],
    keyIndustries: ['Five-Star Hotels & Restaurants', 'Private Hospitals & Labs', 'Supermarket Chains'],
    serviceHours: '06:00 - 22:00 Daily + 24/7 Emergency Gas Support',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Tech. Kelvin Mutua (CBD & Hotel Lead)',
      email: 'nairobi@kenfoss.co.ke'
    }
  },
  {
    id: 'kiambu-limuru',
    name: 'Kiambu Town, Banana & Limuru',
    nameSw: 'Mji wa Kiambu, Banana na Limuru',
    county: 'Kiambu',
    distanceFromHQ: '18 - 35 km',
    emergencySLA: '30 - 45 Mins',
    standardSLA: 'Same Day',
    status: 'Express Coverage',
    keyEstates: ['Kiambu Town', 'Banana Hill', 'Limuru Tea Zone', 'Tigoni', 'Ndenderu', 'Kikuyu'],
    keyIndustries: ['Tea Factory Chillers', 'Floriculture Export Cold Rooms', 'Poultry Cold Storage'],
    serviceHours: '06:30 - 20:00 Mon-Sat / Emergency On-Call',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Eng. Samuel Kamau (Agri-Cold Lead)',
      email: 'kiambu@kenfoss.co.ke'
    }
  },
  {
    id: 'karen-langata',
    name: 'Karen, Langata & Ngong Road',
    nameSw: 'Karen, Langata na Barabara ya Ngong',
    county: 'Nairobi',
    distanceFromHQ: '35 - 42 km',
    emergencySLA: '40 - 55 Mins',
    standardSLA: 'Same Day',
    status: 'Extended Zone',
    keyEstates: ['Karen Shopping Centre', 'Langata', 'Bulls Café', 'Ngong Town', 'Dagoretti Corner'],
    keyIndustries: ['Boutique Hotels', 'Dairy Processing', 'Private Estates & Estates HVAC'],
    serviceHours: '07:00 - 19:00 Daily / On-Call Breakdown Van',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Tech. Brian Otieno (South West Fleet)',
      email: 'karen@kenfoss.co.ke'
    }
  },
  {
    id: 'athi-river',
    name: 'Athi River, Kitengela & EPZ Zone',
    nameSw: 'Athi River, Kitengela na Eneo la EPZ',
    county: 'Machakos',
    distanceFromHQ: '40 - 50 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day',
    status: 'Extended Zone',
    keyEstates: ['Athi River EPZ', 'Kitengela Town', 'Mlolongo', 'Daystar', 'Lukenya'],
    keyIndustries: ['Export EPZ Cold Storage', 'Flower Export Hubs', 'Beverage Bottling Chillers'],
    serviceHours: '24 Hours EPZ Export Refrigeration Support',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Eng. Francis Wambua (EPZ & Machakos Lead)',
      email: 'epz@kenfoss.co.ke'
    }
  },
  {
    id: 'nationwide-kenya',
    name: 'Regional & Countrywide Kenya Projects',
    nameSw: 'Miradi ya Kitaifa kote Kenya',
    county: 'Regional',
    distanceFromHQ: '100 - 500+ km',
    emergencySLA: '24 Hours Flight/Vehicle',
    standardSLA: 'Turnkey Project Team',
    status: 'On-Demand Nationwide',
    keyEstates: ['Eldoret', 'Nakuru', 'Mombasa', 'Kisumu', 'Meru', 'Nanyuki', 'Naivasha', 'Machakos'],
    keyIndustries: ['Flower Farms (Naivasha)', 'Fish Cold Chains (Kisumu)', 'Horticulture (Meru/Nanyuki)'],
    serviceHours: '08:00 - 18:00 Project Team / 24/7 Emergency Flight Team',
    contactDetails: {
      hotline: '+254 745 411 923',
      dispatchLead: 'Eng. James Kiptoo (National Projects Mgr)',
      email: 'projects@kenfoss.co.ke'
    }
  }
];

export const KENYA_47_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
  'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo',
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet',
  'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu',
  'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

export const ServiceAreas: React.FC<ServiceAreasProps> = ({ onOpenBooking }) => {
  const { language } = useLanguage();
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [selectedKenyaCounty, setSelectedKenyaCounty] = useState<string>('All 47 Counties');
  const [activeZoneId, setActiveZoneId] = useState<string>('ruiru-hq');
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Filtered zones
  const filteredZones = SERVICE_ZONES.filter((zone) => {
    const matchesCounty = selectedCounty === 'All' || zone.county === selectedCounty;
    const matchesSearch =
      !searchLocation.trim() ||
      zone.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
      zone.keyEstates.some((e) => e.toLowerCase().includes(searchLocation.toLowerCase())) ||
      zone.keyIndustries.some((i) => i.toLowerCase().includes(searchLocation.toLowerCase()));
    return matchesCounty && matchesSearch;
  });

  const activeZone = SERVICE_ZONES.find((z) => z.id === activeZoneId) || SERVICE_ZONES[0];
  const tooltipZone = SERVICE_ZONES.find((z) => z.id === (hoveredZoneId || activeZoneId)) || activeZone;

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
                    setSearchLocation(val);
                  } else {
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

          {/* Location Search & Filter Controls */}
          <div className="space-y-3 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Search Box */}
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder={
                    language === 'sw'
                      ? 'Tafuta mtaa au mji wako (k.m. Thika, Kilimani, Ruiru, Westlands, Tatu City, Juja)...'
                      : 'Type your neighborhood or town (e.g., Thika, Kilimani, Tatu City, Westlands, Juja, EPZ)...'
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

              {/* County Selector Tabs */}
              <div className="md:col-span-4 flex items-center bg-slate-800/90 p-1 border border-slate-700/80 rounded-xl">
                {['All', 'Kiambu', 'Nairobi', 'Machakos'].map((county) => (
                  <button
                    key={county}
                    onClick={() => setSelectedCounty(county)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedCounty === county
                        ? 'bg-[#0057B8] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {county}
                  </button>
                ))}
              </div>

            </div>

            {/* Quick Neighborhood & Town Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00AEEF]" />
                {language === 'sw' ? 'Miji Mashuhuri:' : 'Popular Towns:'}
              </span>
              {['Ruiru', 'Thika', 'Westlands', 'Kilimani', 'Tatu City', 'Juja', 'Industrial Area', 'Karen', 'Limuru'].map((town) => (
                <button
                  key={town}
                  onClick={() => setSearchLocation(town)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                    searchLocation.toLowerCase() === town.toLowerCase()
                      ? 'bg-[#00AEEF] text-slate-950 border-[#00AEEF] font-extrabold shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {town}
                </button>
              ))}
              {searchLocation && (
                <span className="ml-auto text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                  {filteredZones.length} {filteredZones.length === 1 ? 'Zone Found' : 'Zones Found'}
                </span>
              )}
            </div>
          </div>

        {/* Interactive Map Layout & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Interactive Coverage Hub Diagram & Zone Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Visual SVG Map / Hub Schema Card */}
            <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Interactive Dispatch Matrix (Nairobi - Kiambu Corridor)</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-900/80 text-blue-200 rounded border border-blue-700">
                  Ruiru HQ Hub
                </span>
              </div>

              {/* Graphic Representation of Dispatch Distance Nodes with Interactive Hover Tooltips */}
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
                        : 'We cover all of Kenya for cold room & HVAC projects! Clear search or call dispatch directly.'}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      onClick={() => setSearchLocation('')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg border border-slate-600 transition-colors cursor-pointer"
                    >
                      {language === 'sw' ? 'Odosha Tuta' : 'Clear Search'}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredZones.map((zone) => {
                      const isActive = zone.id === activeZoneId;
                      const isHovered = zone.id === hoveredZoneId;
                      return (
                        <button
                          key={zone.id}
                          onClick={() => setActiveZoneId(zone.id)}
                          onMouseEnter={() => setHoveredZoneId(zone.id)}
                          onMouseLeave={() => setHoveredZoneId(null)}
                          onFocus={() => setHoveredZoneId(zone.id)}
                          onBlur={() => setHoveredZoneId(null)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 group ${
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

                          <div className="flex items-center gap-1.5">
                            <MapPin
                              className={`w-4 h-4 shrink-0 ${
                                zone.isHQ
                                  ? 'text-amber-400'
                                  : isActive || isHovered
                                  ? 'text-white'
                                  : 'text-[#00AEEF]'
                              }`}
                            />
                            <span className="text-xs font-black text-white line-clamp-1">
                              {zone.county}
                            </span>
                          </div>

                          <div className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight">
                            {language === 'sw' ? zone.nameSw : zone.name}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium pt-1 border-t border-white/10">
                            <span>SLA: {zone.emergencySLA}</span>
                            <span className="text-amber-300 font-bold">{zone.distanceFromHQ}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Live Tooltip Card for Hovered/Selected Zone */}
                  {tooltipZone && (
                    <div className="p-3.5 bg-slate-900/95 border border-[#00AEEF]/50 rounded-xl space-y-2 shadow-xl animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-[#00AEEF]" />
                          <span className="text-xs font-extrabold text-white">
                            {language === 'sw' ? tooltipZone.nameSw : tooltipZone.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950 text-[#00AEEF] rounded border border-blue-800">
                          {tooltipZone.county} • {tooltipZone.status}
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
                            <span className="font-bold text-emerald-300 block text-[10px] uppercase">Zone Contact & Hotline:</span>
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
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-white">
                    {language === 'sw' ? 'Mji au Mtaa Wako Upo Kwenye Orodha?' : 'Found Your Estate or Industrial Zone?'}
                  </h4>
                  <p className="text-[11px] text-emerald-200">
                    {language === 'sw'
                      ? 'Fundi wetu anaweza kufika eneo lako haraka. Omba huduma sasa.'
                      : 'Our emergency service vehicles are on standby for immediate cold room & chiller dispatch.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenBooking?.('service', {
                    location: `${activeZone.name} (${activeZone.county} County)`
                  })
                }
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                {language === 'sw' ? 'Omba Fundi Eneo Hilo' : 'Book Tech for This Area'}
              </button>
            </div>

          </div>

          {/* Right Side: Detailed Selected Zone Breakdown (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-2xl">
            
            {/* Active Zone Header */}
            <div className="border-b border-slate-700/80 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-blue-900/80 text-[#00AEEF] text-xs font-extrabold rounded-lg border border-blue-700">
                  {activeZone.county} County Zone
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
                <span>Distance from Ruiru Bypass HQ: <strong>{activeZone.distanceFromHQ}</strong></span>
              </p>
            </div>

            {/* SLA Response Times & Service Hours Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Emergency SLA:
                </span>
                <span className="text-sm font-black text-amber-400 block">
                  {activeZone.emergencySLA}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  For gas leaks & temp alarms
                </span>
              </div>

              <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
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

            {/* Zone Service Hours & Dispatch Commander Card */}
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
                <span>{language === 'sw' ? 'Mitaa na Maeneo Yanayofunikwa' : 'Key Covered Estates & Centres:'}</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeZone.keyEstates.map((estate, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg"
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
                    location: `${activeZone.name} (${activeZone.county})`
                  })
                }
                className="w-full py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'sw' ? 'Mwekee Fundi Wako Sasa' : 'Dispatch Technician to This Area'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:+254745411923"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Hotline: +254 745 411 923</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
