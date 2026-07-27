import React from 'react';

export const BrandsSection: React.FC = () => {
  const brands = [
    { name: 'Samsung', category: 'Inverter Refrigeration & AC' },
    { name: 'LG Business', category: 'VRF Air Conditioning & Freezers' },
    { name: 'Bosch Professional', category: 'Appliance Engineering' },
    { name: 'Danfoss', category: 'Cold Room Controls & Valves' },
    { name: 'Bitzer', category: 'German Cold Room Racks' },
    { name: 'Copeland', category: 'Scroll Compressors' },
    { name: 'Daikin', category: 'Central HVAC Systems' },
    { name: 'Carrier', category: 'Commercial Refrigeration' },
    { name: 'Ramtons', category: 'Domestic Appliances' },
    { name: 'Hisense', category: 'Refrigerators & Freezers' },
    { name: 'Whirlpool', category: 'Commercial Laundry & Cooling' },
    { name: 'Haier', category: 'Ultra-Low Medical Freezers' },
    { name: 'Von', category: 'Home Appliances' },
    { name: 'Mika', category: 'Water Dispensers & Fridges' },
    { name: 'Panasonic', category: 'Inverter Compressors' }
  ];

  return (
    <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold text-[#00AEEF] uppercase tracking-widest">
            Authorized OEM Service Partners
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Brands We Engineer, Service & Supply Parts For
          </h2>
          <p className="text-xs text-slate-400">
            100% Genuine manufacturer spare parts with factory warranty support across Kenya.
          </p>
        </div>

        {/* Brands Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands.map((brand, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/80 transition-all duration-300 text-center group cursor-default flex flex-col justify-center items-center"
            >
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-400 group-hover:text-white group-hover:scale-105 transition-all">
                {brand.name}
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-[#00AEEF] transition-colors mt-0.5">
                {brand.category}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
