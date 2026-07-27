import { ServiceItem } from '../types';
import coldRoomImg from '../assets/images/service_cold_room_1785117713918.jpg';
import commRefImg from '../assets/images/service_commercial_1785117738944.jpg';
import fridgeRepairImg from '../assets/images/service_refrigerator_repair_1785117702454.jpg';
import hvacImg from '../assets/images/service_hvac_1785117727139.jpg';
import maintImg from '../assets/images/service_maintenance_1785117752181.jpg';
import heroImg from '../assets/images/hero_african_engineer_1785117677250.jpg';
import washingMachineImg from '../assets/images/service_washing_machine_repair_1785118413942.jpg';
import waterDispenserImg from '../assets/images/service_water_dispenser_ice_machine_1785118399721.jpg';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'cold-room-installation',
    title: 'Cold Room Design & Installation',
    category: 'industrial',
    shortDesc: 'Turnkey walk-in chillers, blast freezers & pharmaceutical cold storage solutions engineered to European & NEMA standards.',
    fullDesc: 'Kenfoss engineers design and construct high-efficiency cold rooms for hotels, flower farms, slaughterhouses, supermarkets, and pharmaceutical hubs across Kenya. Utilizing high-density Polyurethane (PUF) insulation panels and precision Danfoss/Bitzer refrigeration racks.',
    iconName: 'Warehouse',
    image: coldRoomImg,
    startingPrice: 'Custom Quotation Required',
    pricingNote: 'Site Assessment Required',
    ctaLabel: 'Request a Quote',
    estimatedTime: '3 - 10 Days Installation',
    features: [
      'PUF Insulated Panels (80mm - 150mm Thickness)',
      'German Bitzer / Copeland Scroll Compressors',
      'Dixell / Carel Digital Microprocessor Controllers',
      'Stainless Steel Anti-Slip Floor Options',
      'Solar-Hybrid Power Backup Compatibility',
      '24/7 Remote IoT Temperature Telemetry & Alarms'
    ],
    commonIssues: [
      'Inadequate temperature pull-down',
      'Excess frost buildup on evaporators',
      'Compressor overheating',
      'Panel door seal energy loss'
    ]
  },
  {
    id: 'commercial-refrigeration',
    title: 'Commercial Refrigeration Systems',
    category: 'commercial',
    shortDesc: 'Display chillers, saladette counters, blast chillers, and undercounter freezers for hotels, restaurants & supermarkets.',
    fullDesc: 'We supply, install, and service heavy-duty commercial refrigeration equipment designed to withstand high ambient temperatures in East Africa. Our systems maintain strict HACCP food safety standards.',
    iconName: 'Store',
    image: commRefImg,
    startingPrice: 'Quotation Available on Request',
    pricingNote: 'Contact for Pricing',
    ctaLabel: 'Request a Quote',
    estimatedTime: 'Same Day Repairs',
    features: [
      'Multi-Deck Supermarket Display Refrigerators',
      'Meat & Delicatessen Chillers',
      'Stainless Steel Commercial Kitchen Freezers',
      'Beverage Cooling Racks & Draft Beer Systems',
      'Energy-Saving EC Fan Motors & LED Lighting'
    ]
  },
  {
    id: 'refrigerator-repair',
    title: 'Domestic & Commercial Refrigerator Repair',
    category: 'residential',
    shortDesc: 'Rapid repair for double door, side-by-side, French door, and inverter fridges (Samsung, LG, Bosch, Whirlpool, etc.).',
    fullDesc: 'Our EPRA-certified engineers carry advanced digital diagnostics to fix non-cooling fridges, gas leaks, faulty compressors, inverter board failures, and ice maker breakdowns on-site at your home or facility.',
    iconName: 'Refrigerator',
    image: fridgeRepairImg,
    startingPrice: 'Diagnostic Inspection Required',
    pricingNote: 'Quote Provided After Inspection',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 2 Hours',
    features: [
      '100% Genuine Manufacturer Spare Parts',
      'Environmentally Safe R600a / R134a Gas Re-gassing',
      'Inverter PCB Board Repair & Micro-soldering',
      'Defrost Sensor & Heater Replacement',
      '90-Day Parts & Workmanship Guarantee'
    ],
    commonIssues: [
      'Fridge running but not cooling',
      'Water leaking on floor',
      'Loud clicking noise from compressor',
      'Freezer icing up completely'
    ]
  },
  {
    id: 'hvac-air-conditioning',
    title: 'HVAC & Commercial Air Conditioning',
    category: 'commercial',
    shortDesc: 'VRF/VRV central air conditioning, cassette units, ductable split systems, and clean room ventilation.',
    fullDesc: 'End-to-end HVAC engineering solutions for corporate headquarters, medical centers, commercial banks, and luxury residences. We focus on energy performance, acoustic comfort, and indoor air quality.',
    iconName: 'Wind',
    image: hvacImg,
    startingPrice: 'Custom Quotation Required',
    pricingNote: 'Site Assessment Required',
    ctaLabel: 'Request a Quote',
    estimatedTime: '1 Day Installation',
    features: [
      'Daikin, LG & Carrier Inverter VRF Systems',
      'HEPA Air Filtration & Cleanroom Conditioning',
      'Chilled Water Fan Coil Units (FCU)',
      'Fresh Air Louvers & Exhaust Air Ducting',
      'Smart Thermostat & BMS Building Integration'
    ]
  },
  {
    id: 'preventive-maintenance-contracts',
    title: 'Preventive Maintenance Contracts (AMC)',
    category: 'commercial',
    shortDesc: 'Custom maintenance programs for facilities to prevent costly breakdowns, slash energy bills & extend equipment lifespan.',
    fullDesc: 'Avoid sudden operational halts in your hotel, hospital, or factory. Kenfoss AMC agreements provide scheduled quarterly chemical coil cleaning, gas level audits, electrical torque checks, and priority 2-hour emergency hotline access.',
    iconName: 'ShieldCheck',
    image: maintImg,
    startingPrice: 'Quotation Available on Request',
    pricingNote: 'Contact for Pricing',
    ctaLabel: 'Request a Quote',
    estimatedTime: 'Scheduled Quarterly Visits',
    features: [
      'Scheduled 4x Annual Maintenance Audits',
      '24/7 Priority Emergency Dispatch SLA',
      '15% Discount on All Genuine Replacement Parts',
      'Detailed Asset Health & Energy Efficiency Reports',
      'Dedicated Senior Project Engineer Assigned'
    ]
  },
  {
    id: 'emergency-repairs-247',
    title: '24/7 Emergency Breakdown Service',
    category: 'industrial',
    shortDesc: 'Immediate response mobile units fully equipped for urgent cold room, server room AC, and hospital refrigeration failures.',
    fullDesc: 'When perishable stock worth millions is at risk, Kenfoss rapid dispatch engineers arrive within 60 to 120 minutes in Nairobi and surrounding counties with emergency backup condensing units and recovery gases.',
    iconName: 'Zap',
    image: heroImg,
    startingPrice: 'Diagnostic Inspection Required',
    pricingNote: 'Quote Provided After Inspection',
    ctaLabel: 'Book Emergency Service',
    estimatedTime: '< 2 Hour Arrival in Nairobi',
    features: [
      'Direct Emergency Hotline: +254 712 345 678',
      'Mobile Field Vans Loaded with Gas & Spare Parts',
      'Temporary Rental Mobile Chillers Available',
      'Emergency Leak Sealing & Pressure Testing'
    ]
  },
  {
    id: 'washing-machine-repair',
    title: 'Washing Machine & Commercial Laundry Repair',
    category: 'residential',
    shortDesc: 'Expert repair of front-load, top-load washers, dryers, and commercial laundromat extractors.',
    fullDesc: 'We diagnose drum bearing failures, inlet valve faults, control module errors, drain pump blockages, and motor brush wear across Samsung, Bosch, LG, Electrolux, and Speed Queen machines.',
    iconName: 'WashingMachine',
    image: washingMachineImg,
    startingPrice: 'Diagnostic Inspection Required',
    pricingNote: 'Quote Provided After Inspection',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 3 Hours',
    features: [
      'Drum Bearing & Oil Seal Overhauls',
      'Inverter DirectDrive Motor Diagnostics',
      'Heating Element & Thermostat Testing',
      'Door Gasket / Boot Seal Replacement'
    ]
  },
  {
    id: 'water-dispenser-ice-machines',
    title: 'Water Dispenser & Ice Machine Servicing',
    category: 'commercial',
    shortDesc: 'Sanitization, cooling repair, compressor replacement, and water filter cartridge overhaul.',
    fullDesc: 'Ensure safe, ice-cold water and clear bullet/cube ice for your office or restaurant. We offer ozone sanitization, descaling, gas charging, and filter upgrades for all commercial water dispensers and Scotsman/Brema ice makers.',
    iconName: 'Droplets',
    image: waterDispenserImg,
    startingPrice: 'Diagnostic Inspection Required',
    pricingNote: 'Quote Provided After Inspection',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 Hour',
    features: [
      'Deep Sanitization & Algae Mold Removal',
      'Thermostat & Hot/Cold Tank Repair',
      'Industrial Ice Maker Water Pump Overhaul',
      'Multi-Stage Carbon & Sediment Filter Change'
    ]
  }
];

export const INITIAL_SERVICES_DATA = SERVICES_DATA;
