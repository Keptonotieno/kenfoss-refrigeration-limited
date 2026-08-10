import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Phone, UserCheck, Users, Sparkles, Navigation, Signal, ShieldCheck, RefreshCw, Key, ExternalLink, Zap, Maximize2, Minimize2, X, Award, CheckCircle2, Clock, Star, Wrench, FileText, Calendar, Building2, BadgeCheck, Briefcase } from 'lucide-react';
import { Technician } from './FloatingWhatsApp';
import { getCountyCoords } from '../data/countyCoordinates';

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  code: string;
  year: string;
  badgeColor: string;
  category: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  location: string;
  client: string;
  system: string;
  workDone: string;
  status: 'Completed' | 'Verified' | 'Maintenance';
  rating: number;
}

export const getTechnicianCertifications = (tech: Technician): Certification[] => {
  const name = tech.name || '';
  if (name.includes('Mwangi')) {
    return [
      {
        id: 'cert-1',
        title: 'EPA Section 608 Universal Master Certification',
        issuer: 'Environmental Protection Agency / HVAC Excellence',
        code: 'EPA-KE-88910-UNIV',
        year: '2016',
        badgeColor: 'emerald',
        category: 'Refrigerant Safety'
      },
      {
        id: 'cert-2',
        title: 'Bitzer Germany Screw & Reciprocating Master Technician',
        issuer: 'Bitzer Refrigeration Competence Centre (Rottenburg)',
        code: 'BTZ-GER-2021-99',
        year: '2021',
        badgeColor: 'amber',
        category: 'Compressors'
      },
      {
        id: 'cert-3',
        title: 'Engineers Board of Kenya (EBK) Licensed Technologist',
        issuer: 'Engineers Board of Kenya',
        code: 'EBK-A4109-MECH',
        year: '2018',
        badgeColor: 'blue',
        category: 'Engineering License'
      },
      {
        id: 'cert-4',
        title: 'Copeland Discus & Scroll Rack System Specialist',
        issuer: 'Emerson Climate Technologies',
        code: 'EMR-COP-7721',
        year: '2019',
        badgeColor: 'cyan',
        category: 'Rack Controls'
      },
      {
        id: 'cert-5',
        title: 'OSHA 30-Hour Industrial Cold Storage & Ammonia Safety',
        issuer: 'Occupational Safety & Health Administration',
        code: 'OSHA-30-KE-104',
        year: '2020',
        badgeColor: 'rose',
        category: 'Safety'
      }
    ];
  } else if (name.includes('Said')) {
    return [
      {
        id: 'cert-1',
        title: 'EPA Section 608 Universal Certification',
        issuer: 'Air Conditioning, Heating, and Refrigeration Institute',
        code: 'EPA-KE-77210-UNIV',
        year: '2017',
        badgeColor: 'emerald',
        category: 'Refrigerant Safety'
      },
      {
        id: 'cert-2',
        title: 'R717 (Anhydrous Ammonia) High-Pressure Master Lead',
        issuer: 'International Institute of Ammonia Refrigeration (IIAR)',
        code: 'IIAR-AM-2020-044',
        year: '2020',
        badgeColor: 'amber',
        category: 'Ammonia Systems'
      },
      {
        id: 'cert-3',
        title: 'Bureau Veritas Marine Refrigeration & Port Logistics',
        issuer: 'Bureau Veritas Maritime',
        code: 'BV-MAR-6019',
        year: '2019',
        badgeColor: 'blue',
        category: 'Marine Cold Chain'
      },
      {
        id: 'cert-4',
        title: 'Sabroe & Mycom Industrial Screw Compressor Overhaul',
        issuer: 'Johnson Controls Industrial',
        code: 'JCI-SAB-9920',
        year: '2022',
        badgeColor: 'indigo',
        category: 'Heavy Compressors'
      }
    ];
  } else if (name.includes('Bett')) {
    return [
      {
        id: 'cert-1',
        title: 'EPA Section 608 Universal Certification',
        issuer: 'HVAC Excellence Institute',
        code: 'EPA-KE-66512-UNIV',
        year: '2018',
        badgeColor: 'emerald',
        category: 'Refrigerant Safety'
      },
      {
        id: 'cert-2',
        title: 'Kenya Flower Council (KFC) Cold Chain Quality Lead',
        issuer: 'Kenya Flower Council Standardisation Board',
        code: 'KFC-CC-2021-31',
        year: '2021',
        badgeColor: 'purple',
        category: 'Agricultural Quality'
      },
      {
        id: 'cert-3',
        title: 'Controlled Atmosphere (CA) Room Automation Specialist',
        issuer: 'Danfoss Climate Solutions',
        code: 'DNF-CA-8831',
        year: '2022',
        badgeColor: 'blue',
        category: 'Automated CA Systems'
      },
      {
        id: 'cert-4',
        title: 'Bock & Frascold Pre-Cooling Evaporator Master',
        issuer: 'Bock Compressors Europe',
        code: 'BCK-EUR-4410',
        year: '2020',
        badgeColor: 'amber',
        category: 'Pre-Cooling'
      }
    ];
  } else if (name.includes('Otieno')) {
    return [
      {
        id: 'cert-1',
        title: 'EPA Section 608 Universal Certification',
        issuer: 'HVAC Certification Board',
        code: 'EPA-KE-55419-UNIV',
        year: '2019',
        badgeColor: 'emerald',
        category: 'Refrigerant Safety'
      },
      {
        id: 'cert-2',
        title: 'FAO Food Cold Chain & Rapid Blast Freezing Specialist',
        issuer: 'Food and Agriculture Organization Cold Chain Academy',
        code: 'FAO-KE-2022-81',
        year: '2022',
        badgeColor: 'blue',
        category: 'Post-Harvest Freezing'
      },
      {
        id: 'cert-3',
        title: 'Solar-Hybrid Cold Storage & Thermal Battery Specialist',
        issuer: 'Renewable Energy & Climate Cooling Association',
        code: 'RECCA-SOL-112',
        year: '2023',
        badgeColor: 'amber',
        category: 'Solar Refrigeration'
      },
      {
        id: 'cert-4',
        title: 'Thermo King & Carrier Transicold Mobile Fleet Lead',
        issuer: 'Carrier Commercial Systems',
        code: 'CAR-TRN-9021',
        year: '2021',
        badgeColor: 'cyan',
        category: 'Mobile Fleet'
      }
    ];
  }

  return [
    {
      id: 'cert-def-1',
      title: 'EPA Section 608 Universal Master Certification',
      issuer: 'HVAC Excellence Board',
      code: `EPA-KE-${tech.id.toUpperCase()}`,
      year: '2020',
      badgeColor: 'emerald',
      category: 'Refrigerant Safety'
    },
    {
      id: 'cert-def-2',
      title: 'Kenfoss Commercial Refrigeration Master Engineer',
      issuer: 'Kenfoss Technical Training Centre',
      code: 'KF-ENG-CERT',
      year: '2021',
      badgeColor: 'amber',
      category: 'Master Refrigeration'
    },
    {
      id: 'cert-def-3',
      title: 'EBK Registered Mechanical Engineering Technologist',
      issuer: 'Engineers Board of Kenya',
      code: 'EBK-LICENSED',
      year: '2019',
      badgeColor: 'blue',
      category: 'Engineering License'
    }
  ];
};

export const getTechnicianServiceHistory = (tech: Technician): ServiceRecord[] => {
  const name = tech.name || '';
  if (name.includes('Mwangi')) {
    return [
      {
        id: 'srv-101',
        date: '2026-08-03',
        location: 'Kiambu County — Limuru Flower Exporters',
        client: 'AA Growers Ltd',
        system: 'Bitzer 40HP Multi-Compressor Chiller Rack',
        workDone: 'Emergency R404A valve seal overhaul & pressure drop balancing. System restored to -18°C setpoint in 90 minutes.',
        status: 'Completed',
        rating: 5.0
      },
      {
        id: 'srv-102',
        date: '2026-07-24',
        location: 'Ruiru Bypass — Kenfoss Central Hub',
        client: 'Kenfoss Fleet Logistics',
        system: '300-Tonne Modular Cold Storage Facility',
        workDone: 'Quarterly preventative maintenance, sensor recalibration, expansion valve thermal tuning, and condenser coil wash.',
        status: 'Verified',
        rating: 5.0
      },
      {
        id: 'srv-103',
        date: '2026-07-11',
        location: 'Nairobi — Westlands Supermarket Depot',
        client: 'Chandarana Foodplus Chain',
        system: 'Central VRF & Open Display Chiller Loop',
        workDone: 'Replaced failed digital scroll controller board and restored precise multi-deck humidity control.',
        status: 'Completed',
        rating: 4.9
      },
      {
        id: 'srv-104',
        date: '2026-06-28',
        location: 'Machakos County — Athi River Meat Packers',
        client: 'Kenya Meat Commission (KMC)',
        system: 'Blast Freezer Tunnel (-35°C)',
        workDone: 'Fixed defrost cycle timing error and replaced 2x high-temperature evaporator fans.',
        status: 'Completed',
        rating: 5.0
      },
      {
        id: 'srv-105',
        date: '2026-06-15',
        location: 'Murang\'a County — Maragua Avocado Processing',
        client: 'Kakuzi PLC Horticultural',
        system: 'Pre-Cooling Hydro-Chiller',
        workDone: 'Flushed glycol piping loop, calibrated digital expansion valves, verified export phytosanitary compliance.',
        status: 'Verified',
        rating: 4.8
      }
    ];
  } else if (name.includes('Said')) {
    return [
      {
        id: 'srv-201',
        date: '2026-08-01',
        location: 'Mombasa Port — Berth 5 Deep Freeze Hub',
        client: 'Kenya Ports Authority & SeaHarvest',
        system: 'Industrial Ammonia (R717) Pack Unit',
        workDone: 'Emergency purge of non-condensables, shaft seal inspection, oil filter replacement on Sabroe screw compressor.',
        status: 'Completed',
        rating: 5.0
      },
      {
        id: 'srv-202',
        date: '2026-07-21',
        location: 'Kilifi County — Malindi Seafood Processors',
        client: 'Bahari Catch Exporters',
        system: 'Contact Plate Freezer & Ice Flaker',
        workDone: 'Replaced solenoid valves and recalibrated ice flaker thickness sensor for 10-ton daily output.',
        status: 'Completed',
        rating: 4.9
      },
      {
        id: 'srv-203',
        date: '2026-07-08',
        location: 'Kwale County — Ukunda Resort & Logistics',
        client: 'Alliance Hotels Cold Chain',
        system: 'Walk-In Modular Freezer Room',
        workDone: 'Leak detection using electronic sniffer, brazed copper suction line, recharged R134a eco-refrigerant.',
        status: 'Verified',
        rating: 5.0
      },
      {
        id: 'srv-204',
        date: '2026-06-20',
        location: 'Taita-Taveta — Voi Horticultural Depot',
        client: 'Taita Fresh Produce Co-op',
        system: 'Walk-In Cold Room 50 MT',
        workDone: 'Annual overhaul, replaced magnetic contactors and outdoor condenser fan motor.',
        status: 'Completed',
        rating: 4.8
      }
    ];
  } else if (name.includes('Bett')) {
    return [
      {
        id: 'srv-301',
        date: '2026-08-04',
        location: 'Nakuru County — Naivasha Flower Farm Belt',
        client: 'Oserian & Vegpro Group',
        system: 'Pre-Cooling Vacuum Chamber & Evaporators',
        workDone: 'Replaced vacuum seal gasket and recalibrated pressure transducer for export rose chilling cycle.',
        status: 'Completed',
        rating: 5.0
      },
      {
        id: 'srv-302',
        date: '2026-07-22',
        location: 'Uasin Gishu County — Eldoret Dairy Processing',
        client: 'New KCC Eldoret Plant',
        system: 'Ice Bank Storage System (50,000 L)',
        workDone: 'Agitator motor repair and ice-thickness sensor realignment to prevent thermal overload during peak intake.',
        status: 'Verified',
        rating: 4.9
      },
      {
        id: 'srv-303',
        date: '2026-07-09',
        location: 'Kericho County — Tea & Horticultural Cold Hub',
        client: 'Finlays Fresh Kenya',
        system: 'Controlled Atmosphere (CA) Room Automation',
        workDone: 'Calibrated CO2 and O2 scrubber sensors, tested pneumatic door seals for airtight export standard.',
        status: 'Completed',
        rating: 5.0
      },
      {
        id: 'srv-304',
        date: '2026-06-25',
        location: 'Trans-Nzoia — Kitale Seed Storage Facility',
        client: 'Kenya Seed Company',
        system: 'Precision Dehumidified Cold Store',
        workDone: 'Serviced desiccant wheel rotor, adjusted defrost timer, verified 4°C / 50% RH parameters.',
        status: 'Completed',
        rating: 4.8
      }
    ];
  } else if (name.includes('Otieno')) {
    return [
      {
        id: 'srv-401',
        date: '2026-08-02',
        location: 'Kisumu County — Lake Victoria Fish Hub',
        client: 'Kisumu Fish Processors Union',
        system: 'Continuous Belt Spiral Blast Freezer (-40°C)',
        workDone: 'Aligned stainless steel conveyor drive, overhauled Danfoss thermostatic expansion valve.',
        status: 'Completed',
        rating: 5.0
      },
      {
        id: 'srv-402',
        date: '2026-07-20',
        location: 'Homa Bay County — Mbita Agriculture Cold Chain',
        client: 'South Nyanza Farmers Co-op',
        system: 'Solar-Hybrid Containerised Cold Room',
        workDone: 'Serviced lithium thermal storage inverter bank and verified off-grid 24hr chilling performance.',
        status: 'Verified',
        rating: 5.0
      },
      {
        id: 'srv-403',
        date: '2026-07-02',
        location: 'Kakamega County — Lugari Produce Hub',
        client: 'Kakamega County Agri-Depot',
        system: 'Post-Harvest Maize & Vegetable Chiller',
        workDone: 'Cleaned microchannel condenser, refilled polyolester oil, tested automatic high-pressure cutout.',
        status: 'Completed',
        rating: 4.9
      }
    ];
  }

  return [
    {
      id: 'srv-def-1',
      date: '2026-08-01',
      location: `${tech.baseLocation}`,
      client: 'Kenfoss Commercial Client',
      system: 'Commercial Cold Room System',
      workDone: 'Complete diagnostic inspection, gas pressure test, and electrical safety check.',
      status: 'Completed',
      rating: 5.0
    },
    {
      id: 'srv-def-2',
      date: '2026-07-18',
      location: `${tech.counties?.[0] || 'Kenya Regional Depot'}`,
      client: 'Regional Cold Chain Partner',
      system: 'Multi-Deck Refrigeration Chiller',
      workDone: 'Replaced compressor oil filter, cleaned condenser coils, and verified setpoint stability.',
      status: 'Verified',
      rating: 4.9
    }
  ];
};

interface TechnicianMapTrackerProps {
  county: string;
  technician: Technician;
  isLoading?: boolean;
  onCallTechnician?: (phone: string) => void;
  onRequestDispatch?: () => void;
  onSelectTechnician?: (tech: Technician) => void;
  compact?: boolean;
}

export function getTechniciansForCounty(county: string, primaryTech?: Technician): Technician[] {
  const normCounty = (county || '').trim();
  const primary = primaryTech || {
    id: 'tech-001',
    name: 'Eng. David Mwangi',
    role: 'Senior Cold Storage & VRF Lead',
    specialty: 'Bitzer Compressors & Chiller Racks',
    phone: '+254 745 411 923',
    baseLocation: `${normCounty} Central HQ`,
    rating: 4.9,
    experienceYears: 12,
    status: 'Available',
    counties: [normCounty]
  };

  const pool: Technician[] = [
    primary,
    {
      id: 'tech-005',
      name: 'Eng. Peter Karanja',
      role: 'Supermarket & Industrial Chiller Lead',
      specialty: 'Blast Freezers & Commercial HVAC',
      phone: '+254 745 411 923',
      baseLocation: `${normCounty} Commercial Depot`,
      rating: 4.8,
      experienceYears: 10,
      status: 'Available',
      counties: [normCounty]
    },
    {
      id: 'tech-006',
      name: 'Eng. Wycliffe Barasa',
      role: 'Emergency SLA & Rapid Response Tech',
      specialty: '24/7 Leak Repair & Gas Re-charging',
      phone: '+254 745 411 923',
      baseLocation: `${normCounty} Mobile Response Unit`,
      rating: 4.7,
      experienceYears: 8,
      status: 'In-Field',
      counties: [normCounty]
    },
    {
      id: 'tech-007',
      name: 'Eng. Kevin Kamau',
      role: 'Solar Off-Grid Refrigeration Engineer',
      specialty: 'Solar Cold Storage & Thermal Batteries',
      phone: '+254 745 411 923',
      baseLocation: `${normCounty} Solar Clean Energy Hub`,
      rating: 4.9,
      experienceYears: 7,
      status: 'Available',
      counties: [normCounty]
    }
  ];

  const seen = new Set<string>();
  return pool.filter((t) => {
    const key = t.id || t.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getTechnicianLocationInCounty(
  county: string,
  techIndex: number
): { lat: number; lng: number; hubName: string } {
  const base = getCountyCoords(county);
  const offsets = [
    { lat: 0, lng: 0 },
    { lat: 0.016, lng: -0.014 },
    { lat: -0.015, lng: 0.018 },
    { lat: 0.021, lng: 0.012 },
  ];
  const offset = offsets[techIndex % offsets.length];
  return {
    lat: base.lat + offset.lat,
    lng: base.lng + offset.lng,
    hubName: base.hubName
  };
}

// Inner helper component to auto-recenter map when county coordinates change
const MapRecenterController: React.FC<{ coords: { lat: number; lng: number } }> = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (map && coords) {
      map.panTo(coords);
      map.setZoom(13);
    }
  }, [map, coords.lat, coords.lng]);

  return null;
};

export const TechnicianMapTracker: React.FC<TechnicianMapTrackerProps> = ({
  county,
  technician,
  isLoading = false,
  onCallTechnician,
  onRequestDispatch,
  onSelectTechnician,
  compact = false
}) => {
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  // List of all technicians available/assigned to this county
  const countyTechs = React.useMemo(() => {
    return getTechniciansForCounty(county, technician);
  }, [county, technician]);

  const [selectedTechId, setSelectedTechId] = useState<string>(technician.id);

  // Selected active technician
  const activeTechnician = countyTechs.find((t) => t.id === selectedTechId) || countyTechs[0] || technician;
  const activeTechIndex = countyTechs.findIndex((t) => t.id === activeTechnician.id);
  const activeBaseCoords = getTechnicianLocationInCounty(county, activeTechIndex >= 0 ? activeTechIndex : 0);

  const baseCoords = getCountyCoords(county);

  // Detailed Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'certifications' | 'history' | 'metrics' | 'team'>('certifications');

  // Sync prop changes
  useEffect(() => {
    setSelectedTechId(technician.id);
  }, [technician.id, county]);

  const handleSelectTechnician = (tech: Technician) => {
    setSelectedTechId(tech.id);
    setIsInfoWindowOpen(true);
    if (onSelectTechnician) {
      onSelectTechnician(tech);
    }
  };

  // Fullscreen expansion toggle state with localStorage persistence
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kenfoss_technician_map_expanded');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const certifications = getTechnicianCertifications(activeTechnician);
  const history = getTechnicianServiceHistory(activeTechnician);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kenfoss_technician_map_expanded', JSON.stringify(isFullscreen));
    } catch {
      // ignore quota or security exceptions
    }
  }, [isFullscreen]);

  // Keyboard shortcut listener to exit fullscreen or modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isProfileModalOpen]);

  // Simulated active micro GPS telemetry drift for live visual realism
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number }>(activeBaseCoords);
  const [telemetrySpeed, setTelemetrySpeed] = useState<number>(34); // km/h
  const [lastSignalTime, setLastSignalTime] = useState<string>('Just now');
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState<boolean>(true);

  // Reset live location when county or active technician changes
  useEffect(() => {
    setLiveLocation(activeBaseCoords);
    setIsInfoWindowOpen(true);
  }, [county, activeTechnician.id]);

  // Periodic micro GPS telemetry update simulation (every 6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLocation((prev) => {
        // Small random offset (~10-30 meters)
        const latOffset = (Math.random() - 0.5) * 0.0008;
        const lngOffset = (Math.random() - 0.5) * 0.0008;
        return {
          lat: prev.lat + latOffset,
          lng: prev.lng + lngOffset
        };
      });
      setTelemetrySpeed(Math.floor(25 + Math.random() * 20));
      setLastSignalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const isAvailable = technician.status === 'Available';

  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${liveLocation.lat},${liveLocation.lng}`;

  const renderMapContent = (heightStyle: string) => (
    <div className="relative w-full overflow-hidden" style={{ height: heightStyle }}>
      {/* Top Floating Controls: Expand / Minimize Button & Google Maps Directions */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps Application"
          className="bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-lg transition-all cursor-pointer"
        >
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="hidden xs:inline">Nav</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-amber-300 text-[10px] font-black flex items-center gap-1 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={isFullscreen ? 'Minimize Map View' : 'Expand to Fullscreen Map Overlay'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Minimize</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Expand Map</span>
            </>
          )}
        </button>
      </div>

      {hasValidKey ? (
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={liveLocation}
            defaultZoom={isFullscreen ? 14 : 12}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            zoomControl={true}
          >
            <MapRecenterController coords={liveLocation} />

            {/* Render Markers for ALL technicians in this county */}
            {countyTechs.map((tech, idx) => {
              const isSelected = tech.id === activeTechnician.id || tech.name === activeTechnician.name;
              const techPos = isSelected ? liveLocation : getTechnicianLocationInCounty(county, idx);
              const isTechAvail = tech.status === 'Available';

              if (isSelected) {
                return (
                  <AdvancedMarker
                    key={tech.id || `tech-marker-${idx}`}
                    position={techPos}
                    title={`${tech.name} (${tech.role}) • Active Selected View`}
                    onClick={() => {
                      setIsInfoWindowOpen(true);
                      setIsProfileModalOpen(true);
                    }}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      {/* Double pulse radar rings for active view */}
                      <div className="absolute -inset-4 bg-emerald-500/25 rounded-full animate-ping pointer-events-none" />
                      <div className="absolute -inset-2 bg-emerald-400/40 rounded-full animate-pulse pointer-events-none ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/50" />
                      <Pin
                        background={isTechAvail ? '#10B981' : '#F59E0B'}
                        borderColor="#064E3B"
                        glyphColor="#FFFFFF"
                      />
                      {/* Active Technician Name Tag */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileModalOpen(true);
                        }}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 hover:bg-amber-950 backdrop-blur-md text-white text-[9px] font-black px-1.5 py-0.5 rounded-md border border-emerald-400/50 hover:border-amber-400 whitespace-nowrap shadow-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        title="Click to view technician dossier & certifications"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>👨‍🔧 {tech.name.split(' ')[1] || tech.name}</span>
                        <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      </div>

                      {/* Status Tag */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-700 whitespace-nowrap shadow-xl flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tech.status === 'Available' ? 'bg-emerald-400 animate-pulse' :
                          tech.status === 'In-Field' ? 'bg-amber-400' : 'bg-cyan-400'
                        }`} />
                        <span className={`uppercase tracking-wider ${
                          tech.status === 'Available' ? 'text-emerald-300' :
                          tech.status === 'In-Field' ? 'text-amber-300' : 'text-cyan-300'
                        }`}>
                          {tech.status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              }

              // Secondary Technician Markers in County
              return (
                <AdvancedMarker
                  key={tech.id || `tech-marker-${idx}`}
                  position={techPos}
                  title={`Click to switch map view to ${tech.name} (${tech.role})`}
                  onClick={() => handleSelectTechnician(tech)}
                >
                  <div className="relative flex items-center justify-center cursor-pointer group hover:scale-110 transition-transform">
                    <Pin
                      background={isTechAvail ? '#3B82F6' : '#64748B'}
                      borderColor="#1E293B"
                      glyphColor="#FFFFFF"
                    />
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTechnician(tech);
                      }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 hover:bg-amber-900 text-slate-200 hover:text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-700 hover:border-amber-400 whitespace-nowrap shadow-md"
                    >
                      👨‍🔧 {tech.name.split(' ')[1] || tech.name}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {isInfoWindowOpen && (
              <InfoWindow
                position={liveLocation}
                onCloseClick={() => setIsInfoWindowOpen(false)}
              >
                <div className="p-1 max-w-[220px] text-slate-900 font-sans">
                  <div 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-1.5 mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to view full technician profile & service history"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-[10px] shrink-0">
                      {activeTechnician.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-extrabold text-slate-900 truncate flex items-center gap-1">
                        <span>{activeTechnician.name}</span>
                        <Award className="w-3 h-3 text-amber-600 shrink-0" />
                      </h5>
                      <p className="text-[9px] text-slate-600 truncate">{activeTechnician.role}</p>
                    </div>
                  </div>

                  <div className="text-[9px] space-y-1 bg-slate-100 p-1.5 rounded-md border border-slate-200 mb-1.5">
                    <p className="flex items-center justify-between text-slate-700">
                      <span>Base:</span>
                      <strong className="text-slate-900">{activeTechnician.baseLocation}</strong>
                    </p>
                    <p className="flex items-center justify-between text-slate-700">
                      <span>Status:</span>
                      <strong className={activeTechnician.status === 'Available' ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                        {activeTechnician.status}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between text-slate-700">
                      <span>GPS Coords:</span>
                      <span className="font-mono text-[8px] text-slate-600">
                        {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="w-full py-1 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded text-[9.5px] font-bold text-center flex items-center justify-center gap-1 transition-colors cursor-pointer border border-amber-500/30"
                    >
                      <Award className="w-2.5 h-2.5 text-amber-400" /> View Profile & Certs
                    </button>

                    <a
                      href={`tel:${activeTechnician.phone.replace(/\s+/g, '')}`}
                      className="w-full py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <Phone className="w-2.5 h-2.5" /> Call Tech
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      ) : (
        /* Fallback Animated Radar View if API Key is not set yet */
        <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-center">
          {/* Animated Radar Grid Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute w-48 h-48 border border-emerald-500/20 rounded-full animate-ping pointer-events-none" />
          <div className="absolute w-32 h-32 border border-emerald-500/30 rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>

            <div>
              <h4 
                onClick={() => setIsProfileModalOpen(true)}
                className="text-xs font-bold text-white hover:text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Click to view technician profile & certifications"
              >
                <span>GPS Telemetry: {activeTechnician.name}</span>
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </h4>
              <p className="text-[10px] text-emerald-400 font-mono font-semibold">
                Lat: {liveLocation.lat.toFixed(4)}° • Lng: {liveLocation.lng.toFixed(4)}°
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Active in <strong className="text-amber-300">{county} County</strong> • Station: {baseCoords.hubName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>View Profile & Service History</span>
            </button>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-left text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Key className="w-3 h-3" />
                <span>Google Maps API Key Setup</span>
              </div>
              <p className="text-slate-300 text-[9px] leading-tight">
                To view live interactive map, add key in <strong>Settings ⚙️ → Secrets</strong> as <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">GOOGLE_MAPS_PLATFORM_KEY</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Overlay Badge on Bottom Left of Map */}
      <div 
        onClick={() => setIsProfileModalOpen(true)}
        className="absolute bottom-2 left-2 z-10 bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/50 text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-102 group"
        title="Click to view technician profile, certifications & full service history"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-[10px] shrink-0 group-hover:scale-105 transition-transform">
          {activeTechnician.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white group-hover:text-amber-300 truncate max-w-[120px] transition-colors flex items-center gap-1">
            <span>{activeTechnician.name}</span>
            <Award className="w-3 h-3 text-amber-400 shrink-0" />
          </p>
          <p className="text-[8.5px] text-amber-300 font-bold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Profile & Certs 📜</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Normal Compact / Embedded Card View */}
      <div className="w-full bg-slate-900 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-xl text-white relative">
        {/* Top Telemetry Header Bar */}
        <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="truncate">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                Live GPS Field Telemetry
                <Signal className="w-3 h-3 text-emerald-400 animate-pulse" />
              </span>
              <p className="text-[10px] text-slate-300 font-medium truncate">
                {county} County • {baseCoords.hubName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
            <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/20">
              {telemetrySpeed} km/h
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              title="Expand to Fullscreen Map"
            >
              <Maximize2 className="w-3 h-3 text-amber-400" />
              <span>Expand</span>
            </button>
          </div>
        </div>

        {/* County Technician Toggle Selector Bar */}
        <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <span className="font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{county} Field Force ({countyTechs.length} Techs On Duty)</span>
            </span>
            <span className="text-[8.5px] text-slate-400">Click technician to switch map view</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-slate-700">
            {countyTechs.map((tech, idx) => {
              const isSelected = tech.id === activeTechnician.id || tech.name === activeTechnician.name;
              return (
                <button
                  key={tech.id || `tech-${idx}`}
                  type="button"
                  onClick={() => handleSelectTechnician(tech)}
                  className={`px-2.5 py-1 rounded-xl text-left flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-amber-400 text-white shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-5 h-5 rounded-md font-bold text-[8.5px] flex items-center justify-center ${
                      isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {tech.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                      tech.status === 'Available' ? 'bg-emerald-400' : tech.status === 'In-Field' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold truncate max-w-[100px] flex items-center gap-0.5">
                      <span>{tech.name.split(' ')[1] || tech.name}</span>
                      {isSelected && <span className="text-[7.5px] bg-amber-400 text-slate-950 font-black px-1 rounded">ACTIVE</span>}
                    </p>
                    <p className="text-[8px] text-slate-400 truncate max-w-[110px]">
                      {tech.role.split('&')[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Body */}
        {renderMapContent(compact ? '220px' : '300px')}

        {/* Bottom Technician Dispatch Card */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div 
            className="min-w-0 flex-1 cursor-pointer group"
            onClick={() => setIsProfileModalOpen(true)}
            title="Click to view technician certifications & full service history"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-200 group-hover:text-amber-300 text-[11px] truncate transition-colors flex items-center gap-1">
                <span>{activeTechnician.name}</span>
                <span className="text-[8.5px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">Dossier</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate pl-5">
              {activeTechnician.specialty} • <span className="text-emerald-400 font-bold">{activeTechnician.rating} ⭐ ({activeTechnician.experienceYears}Yrs)</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="View Profile & Full Service History"
            >
              <Award className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">Profile</span>
            </button>

            {onCallTechnician && (
              <button
                type="button"
                onClick={() => onCallTechnician(technician.phone)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <Phone className="w-3 h-3" />
                <span>Call Lead</span>
              </button>
            )}

            {onRequestDispatch && (
              <button
                type="button"
                onClick={onRequestDispatch}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-3 h-3" />
                <span>Dispatch</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive Map Modal Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 w-full h-full h-[100dvh] z-[99999] bg-slate-950/98 backdrop-blur-md flex flex-col p-2 sm:p-4 text-white animate-in fade-in zoom-in-95 duration-200 pointer-events-auto overflow-hidden"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
            paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
            height: '100dvh',
            maxHeight: '-webkit-fill-available',
          }}
        >
          {/* Top Bar inside Fullscreen Mode */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 mb-2 flex items-center justify-between shadow-xl shrink-0">
            <div 
              className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 cursor-pointer group"
              onClick={() => setIsProfileModalOpen(true)}
              title="Click to view technician profile & certifications"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 flex items-center gap-1.5 sm:gap-2 transition-colors">
                  <span className="truncate">{technician.name}</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shrink-0">
                    VIEW DOSSIER 📜
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                  {county} County • Hub: {baseCoords.hubName} • Coords: {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={googleNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all shadow-md"
              >
                <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Open in Maps</span>
              </a>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Close Fullscreen Map"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Map Canvas */}
          <div className="flex-1 min-h-0 w-full rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl relative bg-slate-900">
            {renderMapContent('100%')}
          </div>
        </div>
      )}

      {/* Detailed Technician Profile, Certifications & Full Service History Modal */}
      {isProfileModalOpen && (
        <div 
          className="fixed inset-0 z-[100000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 text-white animate-in fade-in zoom-in-95 duration-200 overflow-y-auto pointer-events-auto"
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileModalOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Modal Header Bar */}
            <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <span>Verified Lead Technician Dossier</span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      EBK REGISTERED
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Official Kenfoss Engineering Credentials & Complete Field Audit Log
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Close Profile Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Technician Bio Hero Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                  {/* Avatar Circle */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg border-2 border-amber-300">
                      {technician.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black text-[9px] shadow-md" title="Status: Active">
                      ✓
                    </span>
                  </div>

                  {/* Bio Info */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {technician.name}
                      </h2>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-amber-400" />
                        Master Lead
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{technician.role}</span>
                    </p>

                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Specialty: <strong className="text-white">{technician.specialty}</strong></span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
                      <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white">{technician.rating}</span> / 5.0 Rating
                      </span>
                      <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-bold">
                        <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-white">{technician.experienceYears} Years</span> Field Experience
                      </span>
                      <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{technician.baseLocation}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons inside Header */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Assigned Region: <strong className="text-emerald-400">{county} County</strong> & Surrounding Counties
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${technician.phone.replace(/\s+/g, '')}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md text-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {technician.name.split(' ')[1] || 'Lead'}</span>
                    </a>

                    {onRequestDispatch && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          onRequestDispatch();
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md text-xs cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Request Dispatch</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation Controls */}
              <div className="flex border-b border-slate-800 bg-slate-950 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('certifications')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeProfileTab === 'certifications'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Certifications ({certifications.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveProfileTab('history')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeProfileTab === 'history'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Service History ({history.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveProfileTab('metrics')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeProfileTab === 'metrics'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Signal className="w-3.5 h-3.5" />
                  <span>Field Metrics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveProfileTab('team')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeProfileTab === 'team'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>County Team ({countyTechs.length})</span>
                </button>
              </div>

              {/* Tab 1: Certifications & Licenses */}
              {activeProfileTab === 'certifications' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">Official Engineering & Refrigerant Safety Accreditations</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All Verified Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                            <BadgeCheck className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">
                                {cert.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Issued by: <strong className="text-slate-300">{cert.issuer}</strong>
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                License ID: {cert.code}
                              </span>
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                Issued: {cert.year}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Service History */}
              {activeProfileTab === 'history' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">Recent Field Dispatches & System Commissionings</span>
                    <span className="text-amber-300 font-bold">100% Audit Verified</span>
                  </div>

                  <div className="space-y-2.5">
                    {history.map((record) => (
                      <div
                        key={record.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="bg-slate-900 text-amber-300 border border-amber-500/20 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                              {record.date}
                            </span>
                            <span className="font-bold text-white truncate">{record.client}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {record.rating.toFixed(1)}
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {record.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="text-slate-300 font-semibold flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Location: {record.location}</span>
                          </p>
                          <p className="text-slate-300 font-semibold flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>System: <strong className="text-white">{record.system}</strong></span>
                          </p>
                          <p className="text-slate-400 text-[11px] leading-relaxed pt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                            "{record.workDone}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Metrics */}
              {activeProfileTab === 'metrics' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                      <p className="text-xl font-black text-amber-400">480+</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Field Projects</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                      <p className="text-xl font-black text-emerald-400">98.6%</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">First-Time Fix Rate</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                      <p className="text-xl font-black text-blue-400">99.4%</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">On-Time Arrival</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                      <p className="text-xl font-black text-purple-400">24 / 7</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Emergency Dispatch</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Operational Coverage & Supported Counties ({activeTechnician.counties?.length || 7})</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Lead dispatch engineer covering regional hub <strong className="text-amber-300">{activeTechnician.baseLocation}</strong> with rapid deployment across:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeTechnician.counties?.map((c) => (
                        <span key={c} className="bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[10px] px-2.5 py-1 rounded-lg">
                          🇰🇪 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: County Field Force Team */}
              {activeProfileTab === 'team' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">Engineers Assigned to {county} County</span>
                    <span className="text-amber-300 font-bold">{countyTechs.length} Technicians Available</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {countyTechs.map((tech) => {
                      const isSelected = tech.id === activeTechnician.id || tech.name === activeTechnician.name;
                      return (
                        <div
                          key={tech.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-slate-950 border-amber-400 ring-1 ring-amber-400/40'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                              {tech.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-extrabold text-white truncate">
                                  {tech.name}
                                </h4>
                                {isSelected && (
                                  <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                    ACTIVE VIEW
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-amber-300 font-semibold">{tech.role}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {tech.specialty} • <strong className="text-emerald-400">{tech.rating} ⭐ ({tech.experienceYears}Yrs)</strong>
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                            {!isSelected && (
                              <button
                                type="button"
                                onClick={() => handleSelectTechnician(tech)}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer"
                              >
                                Select View
                              </button>
                            )}
                            <a
                              href={`tel:${tech.phone.replace(/\s+/g, '')}`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> Call Tech
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-[11px] text-slate-400">
                Kenfoss Industrial Refrigeration • Engineering Division
              </span>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

