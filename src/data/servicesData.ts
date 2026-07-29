import { ServiceItem } from '../types';
import freezerRepairImg from '../assets/images/kenya_freezer_repair_1785251736978.jpg';
import fridgeRepairNewImg from '../assets/images/kenya_fridge_repair_1785251752515.jpg';
import coldRoomNewImg from '../assets/images/kenya_cold_room_1785251769488.jpg';
import microwaveImg from '../assets/images/kenya_microwave_repair_1785251865437.jpg';
import ovenImg from '../assets/images/kenya_oven_repair_1785251880547.jpg';
import dishwasherImg from '../assets/images/kenya_dishwasher_repair_1785251896358.jpg';
import dryerImg from '../assets/images/kenya_dryer_repair_1785251910813.jpg';
import singleDoorFridgeImg from '../assets/images/kenya_single_door_fridge_1785252155392.jpg';
import miniFridgeImg from '../assets/images/kenya_mini_fridge_repair_1785252169253.jpg';
import fridgeInstallImg from '../assets/images/kenya_fridge_install_1785252502002.jpg';
import coldRoomBuildImg from '../assets/images/kenya_coldroom_build_1785252517070.jpg';
import hvacAcImg from '../assets/images/kenya_hvac_ac_1785253019004.jpg';
import preventiveMaintImg from '../assets/images/kenya_preventive_maint_1785253033702.jpg';
import emergencyRepairImg from '../assets/images/kenya_emergency_repair_1785253048831.jpg';
import waterIceServicingImg from '../assets/images/kenya_water_ice_servicing_1785253063233.jpg';
import washerRepairImg from '../assets/images/kenya_washer_repair_1785253077335.jpg';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'freezer-repair',
    title: 'Freezer Repair',
    category: 'residential',
    shortDesc: 'Expert repair for chest freezers, deep freezers, upright freezers, and commercial display freezers.',
    fullDesc: 'Kenfoss certified refrigeration technicians deliver rapid on-site diagnosis and repairs for all chest and upright freezers across Kenya. We specialize in resolving cooling failures, gas leaks, thermostat glitches, compressor clicking, and frost overload using 100% genuine replacement components.',
    iconName: 'Refrigerator',
    image: freezerRepairImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 2 Hours On-Site',
    enabled: true,
    features: [
      'Genuine Danfoss & Secop Compressor Replacement',
      'Environmentally Friendly R600a / R134a Gas Refill',
      'Defrost Heater & Bi-Metal Sensor Replacement',
      'Thermostat & Digital Control Board Calibration',
      'Door Magnetic Gasket Seal Replacement',
      '90-Day EPRA Parts & Workmanship Warranty'
    ],
    equipmentServiced: [
      'Chest Freezers (100L - 800L)',
      'Upright Deep Freezers',
      'Commercial Glass Door Display Freezers',
      'Supermarket Island Freezers',
      'Ice Cream Dipping Cabinets'
    ],
    commonIssues: [
      'Freezer motor running but not freezing',
      'Excessive frost and ice buildup on evaporator coils',
      'Loud clicking or buzzing noise from compressor',
      'Freezer leaking water or oil on the floor',
      'Temperature fluctuating and spoiling frozen stock'
    ],
    benefits: [
      'Prevents costly food spoilage and stock loss',
      'Saves up to 30% energy with re-calibrated thermostat and seals',
      'Mobile field vans equipped with common spare parts',
      'Certified technicians adhering to EPRA safety standards'
    ],
    industriesServed: [
      'Residential Homes & Apartments',
      'Restaurants & Food Joints',
      'Supermarkets & Mini-Marts',
      'Butcheries & Fishmongers',
      'Ice Cream Parlors & Bakeries'
    ]
  },
  {
    id: 'refrigerator-freezer-repair',
    title: 'Refrigerator & Freezer Repair',
    category: 'residential',
    shortDesc: 'Comprehensive repair for double door, side-by-side, French door, and smart inverter combo units.',
    fullDesc: 'Complete diagnostic and repair service for dual-zone refrigeration and freezing appliances. Whether your Samsung Smart Inverter, LG Linear, Bosch, Whirlpool, or Ramtons unit has a broken inverter PCB, defrost cycle error, or refrigerant leak, Kenfoss engineers restore optimal cooling on the first visit.',
    iconName: 'Refrigerator',
    image: fridgeRepairNewImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 3 Hours On-Site',
    enabled: true,
    features: [
      'Inverter Linear Compressor & Micro-Soldering PCB Repair',
      'Dual-Evaporator Fan Motor & Sensor Overhaul',
      'Automatic Ice Maker & Water Dispenser Repair',
      'Refrigerant Leak Detection & Vacuum Pressure Re-Gas',
      'Digital Temperature Calibrations',
      '90-Day Guarantee on Parts & Labor'
    ],
    equipmentServiced: [
      'Side-by-Side Fridge-Freezers',
      'French Door 3-Door & 4-Door Units',
      'Double Door Top & Bottom Mount Fridges',
      'Smart Connected Appliances (Samsung Family Hub, LG ThinQ)'
    ],
    commonIssues: [
      'Fridge compartment warm while freezer remains cold',
      'Constant error codes on front digital screen (e.g. Er FF, 22E)',
      'Water pooling beneath vegetable crisper drawers',
      'Ice maker failing to dump cubes or frozen water line'
    ],
    benefits: [
      'Specialized inverter electronics repair down to chip level',
      'Reduces electricity bills with optimized gas pressures',
      'Original manufacturer parts guaranteed',
      'Prompt mobile dispatch in Nairobi, Kiambu, Machakos & Nakuru'
    ],
    industriesServed: [
      'Residential Estates & Villas',
      'Executive Suites & Serviced Apartments',
      'Airbnb Properties & Guest Houses',
      'Corporate Staff Kitchens'
    ]
  },
  {
    id: 'refrigerator-repair',
    title: 'Refrigerator Repair',
    category: 'residential',
    shortDesc: 'Precision diagnostic and repair for single door, double door, and undercounter refrigerators.',
    fullDesc: 'Kenfoss offers dependable, fast-turnaround domestic and commercial refrigerator repair. Our technicians diagnose non-cooling fridges, electrical trips, gas leakages, and noisy fans on-site using modern digital equipment and genuine spare parts.',
    iconName: 'Refrigerator',
    image: singleDoorFridgeImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 2 Hours',
    enabled: true,
    features: [
      'Comprehensive Refrigeration Cycle Leak Testing',
      'Compressor Relay, Overload & Capacitor Replacement',
      'Thermostat Adjustment & Replacement',
      'Internal Fan Motor & Light Switch Replacement',
      'R600a Eco-Refrigerant Charging with Precision Scales'
    ],
    equipmentServiced: [
      'Single Door Domestic Fridges',
      'Double Door Standard Refrigerators',
      'Undercounter Kitchen Fridges',
      'Beverage Display Fridges'
    ],
    commonIssues: [
      'Fridge running continuously without shutting off',
      'Fridge tripping main house circuit breaker',
      'Food freezing in the fresh food section',
      'Bad odor or water leaking from drain hole'
    ],
    benefits: [
      'Transparent upfront pricing before work begins',
      'Fast 1-hour arrival window across Nairobi Metro',
      'Extended 90-day parts warranty',
      'EPRA certified safety compliance'
    ],
    industriesServed: [
      'Residential Households',
      'Rental Apartments',
      'Office Breakrooms',
      'Small Retail Shops'
    ]
  },
  {
    id: 'mini-refrigerator-repair',
    title: 'Mini Refrigerator Repair',
    category: 'residential',
    shortDesc: 'Fast on-site repair for hotel minibars, compact office fridges, and wine coolers.',
    fullDesc: 'Specialized maintenance and repair for compact minibars, wine chillers, and bedroom mini fridges. Ideal for hotel operators, office boardrooms, and student housing needing quiet, efficient, low-vibration cooling.',
    iconName: 'Refrigerator',
    image: miniFridgeImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Corporate Rates Available',
    ctaLabel: 'Book Inspection',
    estimatedTime: '45 Mins - 1.5 Hours',
    enabled: true,
    features: [
      'Silent Absorption & Thermoelectric Cooling Diagnostics',
      'Compact Compressor & Relay Replacement',
      'Precision Wine Cellar Humidity & Temp Calibration',
      'Door Hinge Re-alignment & Seal Replacement',
      'Quiet Fan Motor Overhaul'
    ],
    equipmentServiced: [
      'Hotel Room Minibars (30L - 70L)',
      'Compact Bedroom & Office Mini Fridges',
      'Wine Storage Cellars & Chillers',
      'Glass Door Countertop Beverage Coolers'
    ],
    commonIssues: [
      'Minibar not chilling drinks for hotel guests',
      'Excessive heat emitting from sides of mini fridge',
      'Wine cooler failing to hold set 12°C - 16°C range',
      'Noisy fan disturbing room quietness'
    ],
    benefits: [
      'Discreet, low-noise servicing suitable for occupied hotel rooms',
      'Discounts for commercial hotel fleet maintenance',
      'Extended component life cycle'
    ],
    industriesServed: [
      'Hotels, Resorts & Lodges',
      'Executive Offices & Boardrooms',
      'Hospital Patient Rooms',
      'Student Hostels & Apartments'
    ]
  },
  {
    id: 'walk-in-cooler-repair',
    title: 'Walk-in Cooler Repair',
    category: 'commercial',
    shortDesc: 'Urgent diagnostic and repair for walk-in coolers, flower farm chillers, and fresh produce storage.',
    fullDesc: 'When walk-in coolers suffer temperature spikes or refrigerant leaks, millions of Shillings in perishable goods are at stake. Kenfoss rapid dispatch teams arrive equipped with heavy-duty diagnostic gear, nitrogen pressure testing, Danfoss valves, and high-capacity condensing units to guarantee zero downtime.',
    iconName: 'Store',
    image: coldRoomNewImg,
    startingPrice: 'Custom Quotation',
    pricingNote: '24/7 Priority Dispatch',
    ctaLabel: 'Request Emergency Repair',
    estimatedTime: '2 Hours Arrival SLA',
    enabled: true,
    features: [
      'High-Capacity Bitzer / Copeland Scroll Compressor Repair',
      'Evaporator Fan Motor & Expansion Valve Replacement',
      'Hot Gas Defrost & Electrical Control Panel Debugging',
      'PUF Insulated Panel Door Seal & Heater Strip Fitting',
      'Nitrogen Leak Pressure Testing & Gas Re-charge',
      'Remote IoT Temperature Sensor Calibration'
    ],
    equipmentServiced: [
      'Hotel Kitchen Walk-in Coolers',
      'Flower Farm Packhouse Cold Rooms',
      'Supermarket Dairy & Produce Vaults',
      'Pharmaceutical Vaccine Chillers',
      'Slaughterhouse Meat Storage Coolers'
    ],
    commonIssues: [
      'Temperature rising above set point (+2°C to +8°C)',
      'Heavy ice blockages choking evaporator fan airflow',
      'High pressure trip error on compressor rack',
      'Panel door failing to seal tight causing moisture entry'
    ],
    benefits: [
      'Guaranteed 2-hour dispatch for emergency breakdowns in Nairobi Metro',
      'Prevents agricultural export and food inventory loss',
      'Certified industrial HVAC/R engineers',
      'Emergency mobile rental cooling units available'
    ],
    industriesServed: [
      'Hotels & Conference Centers',
      'Floriculture & Horticultural Exporters',
      'Supermarket & Hypermarket Chains',
      'Hospitals & Medical Laboratories',
      'Food Processing Plants'
    ]
  },
  {
    id: 'refrigerator-installation',
    title: 'Refrigerator Installation',
    category: 'residential',
    shortDesc: 'Professional unboxing, leveling, water line plumbing for ice makers, and power surge protection setup.',
    fullDesc: 'Ensure your brand-new or relocated refrigerator is installed to perfection. Kenfoss engineers handle unboxing, precise floor leveling, custom door hinge reversal, plumbed water lines for ice & water dispensers, and installation of Solatek AVS power guards to protect your inverter electronics from KPLC voltage spikes.',
    iconName: 'Refrigerator',
    image: fridgeInstallImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Includes Power Guard Advice',
    ctaLabel: 'Book Installation',
    estimatedTime: '1 Hour',
    enabled: true,
    features: [
      'Precision Laser Leveling to Prevent Door Alignment Sag',
      'Copper/Braided Water Line Connection for Ice Makers',
      'Inline Water Filter Assembly & Flushing',
      'Voltage Surge Protector (AVS30 / Solatek) Wiring',
      'Manufacturer Air Ventilation Clearance Audit',
      'Commissioning & Initial Temperature Pull-Down Check'
    ],
    equipmentServiced: [
      'Built-in Custom Kitchen Refrigerators',
      'Side-by-Side & French Door Smart Fridges',
      'Commercial Glass Door Display Fridges',
      'Under-counter Kitchen Wine Units'
    ],
    commonIssues: [
      'Improper ventilation causing premature compressor burnout',
      'Unleveled fridge causing door leaks and frost buildup',
      'Improper water pressure bursting ice maker tubing',
      'Power surges destroying sensitive inverter PCB boards'
    ],
    benefits: [
      'Protects your expensive manufacturer warranty',
      'Eliminates water leak hazards with high-grade fittings',
      'Ensures optimal energy efficiency from Day 1'
    ],
    industriesServed: [
      'Residential Homeowners',
      'Interior Designers & Architects',
      'Real Estate Developers',
      'Commercial Kitchens & Bars'
    ]
  },
  {
    id: 'cold-room-installation',
    title: 'Cold Room Installation',
    category: 'industrial',
    shortDesc: 'Turnkey walk-in chillers, blast freezers & pharmaceutical cold storage solutions engineered to European & NEMA standards.',
    fullDesc: 'Kenfoss engineers design, construct, and commission high-efficiency cold rooms for hotels, flower farms, slaughterhouses, supermarkets, and pharmaceutical hubs across Kenya. Utilizing high-density Polyurethane (PUF) insulation panels and precision Danfoss/Bitzer refrigeration racks.',
    iconName: 'Warehouse',
    image: coldRoomBuildImg,
    startingPrice: 'Custom Quotation Required',
    pricingNote: 'Site Assessment Required',
    ctaLabel: 'Request a Quote',
    estimatedTime: '3 - 10 Days Installation',
    enabled: true,
    features: [
      'PUF Insulated Panels (80mm - 150mm Thickness, Fire Retardant)',
      'German Bitzer / Copeland Scroll & Semi-Hermetic Compressors',
      'Dixell / Carel Digital Microprocessor Controllers',
      'Stainless Steel & Aluminum Anti-Slip Floor Options',
      'Solar-Hybrid Power Backup & Generator Auto-Sync',
      '24/7 Remote IoT Temperature Telemetry & SMS Alarms'
    ],
    equipmentServiced: [
      'Walk-in Chillers (+2°C to +8°C)',
      'Blast Freezers (-30°C to -40°C)',
      'Pharmaceutical Vaccine Vaults',
      'Mortuary Cold Rooms',
      'Solar Powered Farm-Gate Cold Stores'
    ],
    commonIssues: [
      'Thermal bridging caused by inferior panel assembly',
      'Inadequate temperature pull-down time',
      'Excess frost buildup on evaporator fins',
      'Door seal energy loss and ice formation on threshold'
    ],
    benefits: [
      'Turnkey solution from thermodynamic load calculations to handover',
      'Saves up to 40% electricity compared to standard units',
      'Fully compliant with KEBS, NEMA, and EPRA regulations',
      'Includes 1-year free maintenance and warranty'
    ],
    industriesServed: [
      'Agricultural & Horticultural Exporters',
      'Meat & Meat Processing Factories',
      'Supermarkets & Logistics Distribution Centers',
      'Hospitals & Medical Research Centers',
      'Hotels & Catering Enterprises'
    ]
  },
  {
    id: 'dishwasher-repair',
    title: 'Dishwasher Repair',
    category: 'residential',
    shortDesc: 'Commercial and domestic dishwasher repairs, wash pump overhauls, heating element replacement, and descaling.',
    fullDesc: 'Restore sparkling clean sanitation to your home or commercial kitchen. Kenfoss engineers diagnose dishwasher water heating faults, wash pump jams, spray arm blockages, error codes, and water leaks across Bosch, Siemens, Samsung, Hobart, and Winterhalter machines.',
    iconName: 'WashingMachine',
    image: dishwasherImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 2 Hours',
    enabled: true,
    features: [
      'Circulation Wash Pump & Impeller Overhaul',
      'High-Wattage Heating Element & Thermostat Replacement',
      'Drain Pump Unblocking & Valve Replacement',
      'Water Softener Salt System & Resin Calibration',
      'Door Latch & Water-tight Gasket Fitting',
      'System Chemical Descaling & Sanitization Run'
    ],
    equipmentServiced: [
      'Built-in Domestic Dishwashers',
      'Undercounter Commercial Bar Dishwashers',
      'Pass-Through Hood Dishwashers for Restaurants',
      'Rack Conveyor Industrial Warewashers'
    ],
    commonIssues: [
      'Dishes coming out dirty, cloudy, or with food residue',
      'Dishwasher not draining water (e.g. Bosch E24 error)',
      'Water not heating up during wash cycle',
      'Water leaking from bottom door seal onto floor'
    ],
    benefits: [
      'Ensures HACCP hygiene compliance for food businesses',
      'Extends equipment lifespan by removing hard water scale',
      'Original spare parts with 90-day guarantee'
    ],
    industriesServed: [
      'Residential Kitchens',
      'Hotels & Fine Dining Restaurants',
      'School & Hospital Cafeterias',
      'Bakeries & Coffee Shops'
    ]
  },
  {
    id: 'washing-machine-repair',
    title: 'Washing Machine Repair',
    category: 'residential',
    shortDesc: 'Expert repair of front-load, top-load washers, dryers, and commercial laundromat extractors.',
    fullDesc: 'We diagnose drum bearing failures, inlet valve faults, control module errors, drain pump blockages, and motor brush wear across Samsung, Bosch, LG, Electrolux, Ramtons, and Speed Queen machines.',
    iconName: 'WashingMachine',
    image: washerRepairImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 3 Hours',
    enabled: true,
    features: [
      'Heavy Duty Drum Bearing & Water Seal Replacement',
      'Inverter DirectDrive Motor & PCB Repair',
      'Drain Pump Blockage Removal & Motor Swap',
      'Inlet Solenoid Valve & Pressure Switch Fitting',
      'Door Boot Gasket / Rubber Seal Fitting',
      '90-Day Guarantee on Parts & Labor'
    ],
    equipmentServiced: [
      'Front-Load Automatic Washing Machines',
      'Top-Load Washing Machines',
      'Washer-Dryer Combination Units',
      'Commercial Laundromat Wash Extractors'
    ],
    commonIssues: [
      'Excessive shaking and grinding noise during spin cycle',
      'Machine stopping mid-cycle with error code (OE, UE, LE, E02)',
      'Water leaking from front door or underneath unit',
      'Drum refusing to spin or agitate clothes'
    ],
    benefits: [
      'Avoids buying expensive new washing machines unnecessarily',
      'High grade water seals prevent repeat bearing failures',
      'Fast same-day response in Nairobi Metropolitan area'
    ],
    industriesServed: [
      'Residential Households',
      'Commercial Laundromats',
      'Hotels & Lodges',
      'Hospitals & Care Facilities'
    ]
  },
  {
    id: 'dryer-repair',
    title: 'Dryer Repair',
    category: 'residential',
    shortDesc: 'Fast repair for heat-pump dryers, condenser dryers, gas dryers, and commercial tumble dryers.',
    fullDesc: 'Avoid damp clothes and high electricity bills. Kenfoss technicians specialize in heat pump, condenser, vented, and gas tumble dryers. We fix drum motor failures, heating coils, thermal fuses, drive belts, and clogged lint ducting safely.',
    iconName: 'WashingMachine',
    image: dryerImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 2 Hours',
    enabled: true,
    features: [
      'Heat Pump Compressor & Refrigerant Refill',
      'Heating Element & Thermal Fuse Replacement',
      'Heavy Duty Drum Drive Belt & Idler Pulley Swap',
      'Drum Roller Support Wheel Lubrication & Replacement',
      'Exhaust Duct Fire-Safety Cleanout & Airflow Audit',
      'Digital Humidity Sensor Calibration'
    ],
    equipmentServiced: [
      'Energy-Efficient Heat Pump Dryers',
      'Condenser Electric Clothes Dryers',
      'Vented Tumble Dryers',
      'Commercial Gas-Fired Laundromat Dryers'
    ],
    commonIssues: [
      'Dryer drum tumbling but clothes remaining soaking wet',
      'Dryer shutting off after 5 minutes due to overheating',
      'Loud squeaking, thumping, or grinding sound while running',
      'Burning smell emitting from tumble dryer'
    ],
    benefits: [
      'Eliminates dryer lint fire hazards',
      'Restores fast drying times and lowers energy draw',
      'Genuine replacement drive belts and heating elements'
    ],
    industriesServed: [
      'Residential Homes',
      'Spas, Salons & Gyms',
      'Commercial Laundromats',
      'Hotels, Lodges & Airbnb Properties'
    ]
  },
  {
    id: 'microwave-repair',
    title: 'Microwave Repair',
    category: 'residential',
    shortDesc: 'Safety-first repair for countertop microwaves, over-the-range units, and commercial heavy-duty microwave ovens.',
    fullDesc: 'Microwaves carry high voltage capacitors and magnetrons that demand professional servicing. Kenfoss certified technicians repair non-heating microwaves, sparking chambers, dead touchpads, and noisy turntable motors safely with full radiation emission testing.',
    iconName: 'Zap',
    image: microwaveImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Fast Same-Day Service',
    ctaLabel: 'Book Inspection',
    estimatedTime: '45 Mins - 1 Hour',
    enabled: true,
    features: [
      'Magnetron Replacement & Radiation Leak Testing',
      'High Voltage Transformer & Diode Repair',
      'Interlock Door Switch Assembly Replacement',
      'Touch Membrane Switch & Control Board Repair',
      'Glass Turntable Motor & Coupler Replacement',
      'Microwave Mica Waveguide Cover Replacement'
    ],
    equipmentServiced: [
      'Domestic Countertop Microwaves',
      'Over-the-Range Microwave Hood Combos',
      'Convection Microwave Ovens',
      'Commercial High-Wattage Restaurant Microwaves'
    ],
    commonIssues: [
      'Microwave running but food remains stone cold',
      'Sparks and arcing noise inside microwave cavity',
      'Microwave blowing house fuse as soon as Start is pressed',
      'Turntable glass plate not spinning'
    ],
    benefits: [
      'Rigorous microwave leakage safety verification',
      'Much more affordable than replacing commercial units',
      'Quick in-shop or home visit service options'
    ],
    industriesServed: [
      'Residential Households',
      'Office Lunchrooms & Breakrooms',
      'Fast Food Outlets & Petrol Stations',
      'Restaurants & Cafes'
    ]
  },
  {
    id: 'oven-repair',
    title: 'Oven Repair',
    category: 'residential',
    shortDesc: 'Precision repair for electric wall ovens, gas ranges, deck ovens, convection ovens, and bakery equipment.',
    fullDesc: 'From home baking enthusiasts to commercial bakeries and hotel kitchens, Kenfoss repairs all electric and gas ovens. We fix uneven heating, faulty thermostats, defective heating coils, broken door seals, and electronic igniters accurately.',
    iconName: 'Zap',
    image: ovenImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Official Quote Prepared by Management',
    ctaLabel: 'Book Inspection',
    estimatedTime: '1 - 2 Hours',
    enabled: true,
    features: [
      'Bake & Broil Heating Element Replacement',
      'Capillary & Digital Thermostat Calibration',
      'Gas Oven Igniter & Safety Valve Overhaul',
      'Convection Blower Fan Motor Fitting',
      'High-Temperature Glass & Door Rubber Gasket Seals',
      'Gas Leak Pressure Test & Safety Certification'
    ],
    equipmentServiced: [
      'Built-in Electric Wall Ovens',
      'Free-standing Gas Cookers & Ranges',
      'Commercial Bakery Deck Ovens',
      'Hot Air Convection Ovens & Combi Steamer Ovens'
    ],
    commonIssues: [
      'Oven not reaching set temperature or burning food on one side',
      'Gas oven igniter glowing red but not lighting flame',
      'Oven door not closing tight, letting heat escape into room',
      'Digital display error codes and unresponsive knobs'
    ],
    benefits: [
      'Restores perfect bake consistency for bakers and chefs',
      'Eliminates dangerous gas leakage risks',
      'High-grade heat-resistant spare parts'
    ],
    industriesServed: [
      'Residential Kitchens',
      'Bakeries & Pastry Shops',
      'Hotels, Restaurants & Pizzerias',
      'Institutional Catering Kitchens'
    ]
  },
  {
    id: 'hvac-air-con',
    title: 'Commercial Air Conditioning & HVAC',
    category: 'commercial',
    shortDesc: 'VRF/VRV central AC systems, ceiling cassettes, ducting, and cleanroom air handling for corporate offices and hospitals.',
    fullDesc: 'Kenfoss delivers complete HVAC climate control engineering. From Daikin VRF multi-splits to surgical theatre cleanroom air handling units (AHU), our certified HVAC engineers ensure optimized energy efficiency, precise humidity control, and zero downtime.',
    iconName: 'Wind',
    image: hvacAcImg,
    startingPrice: 'Custom Quotation Required',
    pricingNote: 'Site Assessment Required',
    ctaLabel: 'Request a Quote',
    estimatedTime: '1 Day Installation',
    enabled: true,
    features: [
      'Daikin, LG & Carrier Inverter VRF Systems',
      'HEPA Air Filtration & Cleanroom Conditioning',
      'Fresh Air Louvers & Exhaust Air Ducting',
      'Smart Thermostat & BMS Building Integration'
    ],
    equipmentServiced: [
      'VRF/VRV Central HVAC Systems',
      'Ceiling Cassette & Ductable Split ACs',
      'Chillers & Air Handling Units (AHU)',
      'Precision Air Conditioners for Server Rooms'
    ],
    commonIssues: [
      'AC blowing warm air due to refrigerant leak',
      'Water leaking from indoor ceiling cassette',
      'Excessive noise from compressor or blower fan',
      'High power consumption due to dirty coils'
    ],
    benefits: [
      'Up to 40% energy reduction with inverter VRF technology',
      'Improved indoor air quality with HEPA filtration',
      'Professional duct layout and airflow balancing'
    ],
    industriesServed: [
      'Corporate Offices & Banks',
      'Hospitals & Cleanrooms',
      'Hotels & Shopping Malls',
      'Data Centers & Server Rooms'
    ]
  },
  {
    id: 'preventive-maintenance',
    title: 'Preventive Maintenance AMC Contracts',
    category: 'commercial',
    shortDesc: 'Quarterly maintenance contracts (AMC) for hotels, supermarkets, hospitals, and commercial facilities.',
    fullDesc: 'Avoid sudden operational halts in your hotel, hospital, or factory. Kenfoss AMC agreements provide scheduled quarterly chemical coil cleaning, gas level audits, electrical torque checks, and priority 2-hour emergency hotline access.',
    iconName: 'ShieldCheck',
    image: preventiveMaintImg,
    startingPrice: 'Custom Quotation Available',
    pricingNote: 'Quarterly / Annual Plans',
    ctaLabel: 'Request a Quote',
    estimatedTime: 'Scheduled Quarterly Visits',
    enabled: true,
    features: [
      'Scheduled 4x Annual Maintenance Audits',
      '24/7 Priority Emergency Dispatch SLA',
      'Detailed Asset Health & Energy Efficiency Reports',
      'Dedicated Senior Project Engineer Assigned'
    ],
    equipmentServiced: [
      'All Cold Rooms & Walk-in Freezers',
      'Commercial Refrigeration Displays',
      'HVAC & VRF Central Air Conditioning',
      'Kitchen Heavy Equipment'
    ],
    commonIssues: [
      'Preventable compressor failures from dirty coils',
      'Unplanned emergency downtime during peak hours',
      'Creeping electricity bills from unmaintained motors'
    ],
    benefits: [
      'Reduces emergency breakdown risk by over 80%',
      'Extends equipment service life by 5+ years',
      'Compliant with insurance and health inspection standards'
    ],
    industriesServed: [
      'Hotels, Resorts & Lodges',
      'Supermarket Chains & Malls',
      'Hospitals & Medical Centers',
      'Factories & Food Processing Plants'
    ]
  },
  {
    id: 'emergency-breakdown',
    title: '24/7 Emergency Refrigeration Repair',
    category: 'industrial',
    shortDesc: 'Rapid 60-120 minute dispatch for urgent commercial cold room & supermarket cooling failures across Kenya.',
    fullDesc: 'When perishable stock worth millions is at risk, Kenfoss rapid dispatch engineers arrive within 60 to 120 minutes in Nairobi and surrounding counties with emergency backup condensing units and recovery gases.',
    iconName: 'Zap',
    image: emergencyRepairImg,
    startingPrice: 'Emergency Inspection SLA',
    pricingNote: 'Official Quote On-Site',
    ctaLabel: 'Book Emergency Service',
    estimatedTime: '< 2 Hour Arrival in Nairobi',
    enabled: true,
    features: [
      'Direct Emergency Hotline: 0745 411 923',
      'Mobile Field Vans Loaded with Gas & Spare Parts',
      'Temporary Rental Mobile Chillers Available',
      'Emergency Leak Sealing & Pressure Testing'
    ],
    equipmentServiced: [
      'Commercial Cold Rooms & Blast Freezers',
      'Hospital Blood Bank & Vaccine Refrigerators',
      'Server Room Precision Air Conditioners',
      'Supermarket Central Compressor Racks'
    ],
    commonIssues: [
      'Total power trip or compressor burnout',
      'Rapid temperature rise threatening high-value stock',
      'Sudden refrigerant blowout'
    ],
    benefits: [
      'Available 365 days a year, 24 hours a day',
      'Field teams carry emergency spare parts and gases',
      'Temporary backup cooling deployment if needed'
    ],
    industriesServed: [
      'Hospitals & Blood Banks',
      'Flower Exporters & Agro-Hubs',
      'Supermarkets & Wholesale Cold Stores',
      'Hotels & Food Logistics'
    ]
  },
  {
    id: 'water-dispenser-ice-machine',
    title: 'Water Dispenser & Ice Machine Servicing',
    category: 'commercial',
    shortDesc: 'Sanitization, gas refill, thermostat calibration, and filter replacements for water dispensers and ice makers.',
    fullDesc: 'Ensure safe, ice-cold water and clear bullet/cube ice for your office or restaurant. We offer ozone sanitization, descaling, gas charging, and filter upgrades for all commercial water dispensers and Scotsman/Brema ice makers.',
    iconName: 'Droplets',
    image: waterIceServicingImg,
    startingPrice: 'Quote Upon Assessment',
    pricingNote: 'Filter Replacements Extra',
    ctaLabel: 'Book Servicing',
    estimatedTime: '1 Hour On-Site',
    enabled: true,
    features: [
      'Deep Ozone Sanitization & Algae Mold Removal',
      'Thermostat & Hot/Cold Tank Sensor Repair',
      'Industrial Ice Maker Water Pump Overhaul',
      'Multi-Stage Carbon & Sediment Filter Change',
      'Compressor Gas Refill & Re-Sealing'
    ],
    equipmentServiced: [
      'Commercial Ice Cube & Flake Makers (Scotsman, Brema, Manitowoc)',
      'Office Hot & Cold Water Dispensers',
      'Undercounter Water Chilling Units'
    ],
    commonIssues: [
      'Ice machine producing thin, hollow, or misshapen ice',
      'Water dispenser leaking water or failing to chill',
      'Foul taste or odor in drinking water',
      'Ice harvest cycle hanging mid-way'
    ],
    benefits: [
      'Keeps water supply 100% hygienic and mineral-pure',
      'Prevents scale buildup from ruining expensive ice maker pumps',
      'Same-day service for offices and restaurants'
    ],
    industriesServed: [
      'Corporate Offices & Co-working Spaces',
      'Hotels, Bars & Nightclubs',
      'Restaurants & Fast Food Outlets',
      'Hospitals & Dental Clinics'
    ]
  }
];

export const INITIAL_SERVICES_DATA = SERVICES_DATA;

