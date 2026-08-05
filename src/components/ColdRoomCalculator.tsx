import React, { useState } from 'react';
import { 
  Calculator, 
  Thermometer, 
  Box, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  ShieldCheck,
  Sun,
  Download
} from 'lucide-react';

interface ColdRoomCalculatorProps {
  onOpenBooking: (type?: string, prefillDetails?: string) => void;
}

export const ColdRoomCalculator: React.FC<ColdRoomCalculatorProps> = ({ onOpenBooking }) => {
  const [roomType, setRoomType] = useState<'chiller' | 'freezer' | 'blast'>('chiller');
  const [lengthM, setLengthM] = useState(4);
  const [widthM, setWidthM] = useState(3);
  const [heightM, setHeightM] = useState(2.8);
  const [commodity, setCommodity] = useState('Horticulture & Vegetables');
  const [includeSolar, setIncludeSolar] = useState(false);
  const [includeIot, setIncludeIot] = useState(true);
  const [includeStainless, setIncludeStainless] = useState(true);

  // Math calculation logic for engineering estimates
  const volumeM3 = Math.round(lengthM * widthM * heightM * 10) / 10;
  
  // Base cooling factor per m3 depending on room type
  let baseFactorKWPerM3 = 0.18; // Chiller
  let pufThickness = '100mm PUF Cam-Lock';
  let tempRange = '+2°C to +6°C';

  if (roomType === 'freezer') {
    baseFactorKWPerM3 = 0.32;
    pufThickness = '120mm - 150mm High-Density PUF';
    tempRange = '-18°C to -22°C';
  } else if (roomType === 'blast') {
    baseFactorKWPerM3 = 0.65;
    pufThickness = '150mm High-Density PUF Stainless Clad';
    tempRange = '-35°C to -40°C Fast Pull-down';
  }

  const estimatedKW = Math.round(volumeM3 * baseFactorKWPerM3 * 10) / 10;
  const estimatedTR = Math.round((estimatedKW / 3.517) * 10) / 10;
  const compressorHP = Math.max(2, Math.round(estimatedTR * 1.5 * 2) / 2);

  // Power cost estimation based on Kenyan KPLC electricity tariffs (~KSh 28/kWh)
  const estHoursDaily = roomType === 'chiller' ? 12 : 16;
  const kwhMonthly = estimatedKW * estHoursDaily * 30;
  const estPowerMonthlyKsh = Math.round(kwhMonthly * 28);

  // Turnkey cost range estimation
  let baseCostPerM3 = roomType === 'chiller' ? 45000 : roomType === 'freezer' ? 68000 : 110000;
  let totalEstKsh = volumeM3 * baseCostPerM3;
  if (includeSolar) totalEstKsh += 350000;
  if (includeIot) totalEstKsh += 45000;
  if (includeStainless) totalEstKsh += volumeM3 * 4000;

  const minCostKsh = Math.round((totalEstKsh * 0.9) / 10000) * 10000;
  const maxCostKsh = Math.round((totalEstKsh * 1.15) / 10000) * 10000;

  const handleRequestQuotation = () => {
    const summary = `Cold Room Sizing RFQ: ${roomType.toUpperCase()} Room (${lengthM}x${widthM}x${heightM}m = ${volumeM3}m3), Temp: ${tempRange}, Commodity: ${commodity}, Est Capacity: ${estimatedTR} TR (${estimatedKW} kW), Compressor: ${compressorHP} HP, Solar: ${includeSolar ? 'Yes' : 'No'}`;
    onOpenBooking('quote', summary);
  };

  return (
    <section id="calculator" className="py-20 bg-slate-900 text-white relative overflow-hidden scroll-mt-[76px] md:scroll-mt-[112px]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-950 text-[#00AEEF] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-blue-800">
            <Calculator className="w-4 h-4" />
            <span>Interactive Engineering Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Commercial Cold Room Sizing & Cost Estimator
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Instantly calculate refrigeration capacity, PUF insulation specs, power consumption, and turn-key installation budget for your business in Kenya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Form Column */}
          <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            {/* Step 1: Temperature & Room Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Temperature Operating Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'chiller', label: 'Chiller Room', temp: '+2°C to +8°C' },
                  { id: 'freezer', label: 'Freezer Room', temp: '-18°C to -22°C' },
                  { id: 'blast', label: 'Blast Freezer', temp: '-35°C Fast Pull-down' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRoomType(type.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      roomType === type.id
                        ? 'bg-[#0057B8] border-[#00AEEF] text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-xs font-bold">{type.label}</p>
                    <p className="text-[10px] text-blue-200 mt-1">{type.temp}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Room Dimensions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Room Dimensions (Meters)
                </label>
                <span className="text-xs font-bold text-[#00AEEF] bg-blue-950 px-2.5 py-0.5 rounded border border-blue-900">
                  Volume: {volumeM3} m³ ({Math.round(volumeM3 * 35.3147)} cu ft)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Length (M)</label>
                  <input
                    type="number"
                    min="1.5"
                    max="30"
                    step="0.5"
                    value={lengthM}
                    onChange={(e) => setLengthM(parseFloat(e.target.value) || 2)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-bold outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Width (M)</label>
                  <input
                    type="number"
                    min="1.5"
                    max="30"
                    step="0.5"
                    value={widthM}
                    onChange={(e) => setWidthM(parseFloat(e.target.value) || 2)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-bold outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Height (M)</label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    step="0.2"
                    value={heightM}
                    onChange={(e) => setHeightM(parseFloat(e.target.value) || 2.4)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-bold outline-none focus:border-[#00AEEF]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Commodity Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Primary Commodity to Store
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-3 font-medium outline-none focus:border-[#00AEEF]"
              >
                <option value="Horticulture & Vegetables">Fresh Fruits, Vegetables & Horticulture (Naivasha/Limuru)</option>
                <option value="Fresh Meat & Poultry">Slaughterhouse Fresh Meat & Poultry</option>
                <option value="Dairy & Milk Cooling">Dairy, Milk & Yogurt Bulk Chilling</option>
                <option value="Pharmaceuticals & Vaccines">Pharmaceuticals, Blood Bank & Vaccines (MOH Standard)</option>
                <option value="Flowers & Cut Roses">Export Cut Roses & Floriculture</option>
                <option value="General Supermarket Goods">Supermarket General Perishables & Bakery</option>
              </select>
            </div>

            {/* Step 4: Add-On Modules */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                4. Engineering Upgrades & Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Solar PV Hybrid Power Backup</p>
                      <p className="text-[10px] text-slate-400">Reduce KPLC grid dependency during daytime</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSolar}
                    onChange={(e) => setIncludeSolar(e.target.checked)}
                    className="w-4 h-4 text-[#FF7A00] rounded focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-[#00AEEF]" />
                    <div>
                      <p className="text-xs font-bold text-white">24/7 Remote IoT Telemetry & SMS Alarms</p>
                      <p className="text-[10px] text-slate-400">Live phone notifications if temperature shifts</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeIot}
                    onChange={(e) => setIncludeIot(e.target.checked)}
                    className="w-4 h-4 text-[#FF7A00] rounded focus:ring-0"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Results Summary Card Column */}
          <div className="lg:col-span-5 bg-gradient-to-b from-blue-950 to-slate-900 border border-blue-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            
            <div className="border-b border-blue-800 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white">Engineering Sizing Results</h3>
                <p className="text-xs text-blue-300">Custom specification for Kenfoss build</p>
              </div>
              <span className="bg-[#FF7A00] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                ESTIMATE
              </span>
            </div>

            {/* Calculated Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900/80 border border-blue-900/80 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cooling Capacity</span>
                <span className="text-xl font-black text-[#00AEEF]">{estimatedTR} TR</span>
                <span className="text-[10px] text-blue-200 block">({estimatedKW} kW thermal)</span>
              </div>

              <div className="p-3 bg-slate-900/80 border border-blue-900/80 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Compressor HP</span>
                <span className="text-xl font-black text-emerald-400">{compressorHP} HP</span>
                <span className="text-[10px] text-slate-300 block">Bitzer / Copeland Scroll</span>
              </div>
            </div>

            {/* Technical Specs List */}
            <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-blue-900/40">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Insulation Spec:</span>
                <span className="font-bold text-white">{pufThickness}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Temp Zone:</span>
                <span className="font-bold text-white">{tempRange}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Est. Monthly Power (KPLC):</span>
                <span className="font-bold text-emerald-400">~KSh {estPowerMonthlyKsh.toLocaleString()}</span>
              </div>
            </div>

            {/* Turnkey Engineering Quotation */}
            <div className="p-4 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-700/60 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-widest block">
                Turnkey Cold Room Project Quotation
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                Custom Quotation Required
              </div>
              <span className="text-[11px] text-slate-300 block">
                Official quotation prepared following site technical assessment, PUF panel thickness selection, and compressor rack specifications.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRequestQuotation}
                className="w-full py-3.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                <FileText className="w-4 h-4" />
                <span>Request Official Signed Quotation</span>
              </button>

              <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engineered in compliance with EPRA & KEBS Refrigeration Guidelines</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
