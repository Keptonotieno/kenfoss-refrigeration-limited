import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Phone, UserCheck, Sparkles, Navigation, Signal, ShieldCheck, RefreshCw, Key, ExternalLink, Zap, Maximize2, Minimize2, X } from 'lucide-react';
import { Technician } from './FloatingWhatsApp';
import { getCountyCoords } from '../data/countyCoordinates';

interface TechnicianMapTrackerProps {
  county: string;
  technician: Technician;
  isLoading?: boolean;
  onCallTechnician?: (phone: string) => void;
  onRequestDispatch?: () => void;
  compact?: boolean;
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
  compact = false
}) => {
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  const baseCoords = getCountyCoords(county);

  // Fullscreen expansion toggle state with localStorage persistence
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kenfoss_technician_map_expanded');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kenfoss_technician_map_expanded', JSON.stringify(isFullscreen));
    } catch {
      // ignore quota or security exceptions
    }
  }, [isFullscreen]);

  // Keyboard shortcut listener to exit fullscreen on ESC key

  // Keyboard shortcut listener to exit fullscreen on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Simulated active micro GPS telemetry drift for live visual realism
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number }>(baseCoords);
  const [telemetrySpeed, setTelemetrySpeed] = useState<number>(34); // km/h
  const [lastSignalTime, setLastSignalTime] = useState<string>('Just now');
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState<boolean>(true);

  // Reset live location when county changes
  useEffect(() => {
    const coords = getCountyCoords(county);
    setLiveLocation(coords);
    setIsInfoWindowOpen(true);
  }, [county, technician.id]);

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

            <AdvancedMarker
              position={liveLocation}
              title={`${technician.name} (${technician.role}) • Status: ${technician.status || 'Available'}`}
              onClick={() => setIsInfoWindowOpen((prev) => !prev)}
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                {/* Double pulse radar rings */}
                <div className="absolute -inset-4 bg-emerald-500/25 rounded-full animate-ping pointer-events-none" />
                <div className="absolute -inset-2 bg-emerald-400/40 rounded-full animate-pulse pointer-events-none ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/50" />
                <Pin
                  background={isAvailable ? '#10B981' : '#F59E0B'}
                  borderColor="#064E3B"
                  glyphColor="#FFFFFF"
                />
                {/* Technician Name Tag above icon */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-[9px] font-black px-1.5 py-0.5 rounded-md border border-emerald-400/50 whitespace-nowrap shadow-xl flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>👨‍🔧 {technician.name.split(' ')[1] || technician.name}</span>
                </div>

                {/* Technician Status Tag below icon */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-700 whitespace-nowrap shadow-xl flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    technician.status === 'Available' ? 'bg-emerald-400 animate-pulse' :
                    technician.status === 'In-Field' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  <span className={`uppercase tracking-wider ${
                    technician.status === 'Available' ? 'text-emerald-300' :
                    technician.status === 'In-Field' ? 'text-amber-300' : 'text-cyan-300'
                  }`}>
                    {technician.status || 'Available'}
                  </span>
                </div>
              </div>
            </AdvancedMarker>

            {isInfoWindowOpen && (
              <InfoWindow
                position={liveLocation}
                onCloseClick={() => setIsInfoWindowOpen(false)}
              >
                <div className="p-1 max-w-[220px] text-slate-900 font-sans">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-[10px] shrink-0">
                      {technician.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-extrabold text-slate-900 truncate">{technician.name}</h5>
                      <p className="text-[9px] text-slate-600 truncate">{technician.role}</p>
                    </div>
                  </div>

                  <div className="text-[9px] space-y-1 bg-slate-100 p-1.5 rounded-md border border-slate-200 mb-1.5">
                    <p className="flex items-center justify-between text-slate-700">
                      <span>Base:</span>
                      <strong className="text-slate-900">{technician.baseLocation}</strong>
                    </p>
                    <p className="flex items-center justify-between text-slate-700">
                      <span>Status:</span>
                      <strong className={isAvailable ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                        {technician.status}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between text-slate-700">
                      <span>GPS Coords:</span>
                      <span className="font-mono text-[8px] text-slate-600">
                        {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <a
                      href={`tel:${technician.phone.replace(/\s+/g, '')}`}
                      className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
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
              <h4 className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span>GPS Telemetry: {technician.name}</span>
              </h4>
              <p className="text-[10px] text-emerald-400 font-mono font-semibold">
                Lat: {liveLocation.lat.toFixed(4)}° • Lng: {liveLocation.lng.toFixed(4)}°
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Active in <strong className="text-amber-300">{county} County</strong> • Station: {baseCoords.hubName}
              </p>
            </div>

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
      <div className="absolute bottom-2 left-2 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs shadow-lg flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-[10px] shrink-0">
          {technician.name.replace('Eng. ', '').split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white truncate max-w-[120px]">{technician.name}</p>
          <p className="text-[9px] text-emerald-400 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            {technician.status} ({county})
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

        {/* Map Body */}
        {renderMapContent(compact ? '220px' : '300px')}

        {/* Bottom Technician Dispatch Card */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-200 text-[11px] truncate">
                {technician.specialty}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate pl-5">
              Base: {technician.baseLocation} • Phone: <span className="font-mono text-emerald-400 font-bold">{technician.phone}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
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
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 sm:gap-2">
                  <span className="truncate">Field Telemetry — {technician.name}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold hidden sm:inline-block shrink-0">
                    LIVE GPS ACTIVE
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
    </>
  );
};

