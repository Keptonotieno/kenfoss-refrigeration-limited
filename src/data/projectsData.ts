import { ProjectItem } from '../types';
import coldRoomImg from '../assets/images/kenya_cold_room_1785251769488.jpg';
import supermarketChillersImg from '../assets/images/kenya_supermarket_chillers_1785252529044.jpg';
import pharmaColdchainImg from '../assets/images/kenya_pharma_coldchain_1785252543037.jpg';
import flowerFarmChillerImg from '../assets/images/kenya_flower_farm_chiller_1785252557554.jpg';
import coldRoomBuildImg from '../assets/images/kenya_coldroom_build_1785252517070.jpg';
import aboutImg from '../assets/images/about_african_engineers_1785117690454.jpg';

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'serena-hotel-nairobi-coldroom',
    title: '5-Star Hotel Multi-Temperature Cold Room Complex',
    client: 'Serena Hotels Nairobi',
    category: 'Cold Room',
    location: 'Central Nairobi, Kenya',
    completedDate: 'March 2026',
    imageBefore: coldRoomBuildImg,
    imageAfter: coldRoomImg,
    summary: 'Design, supply, and installation of a 120-cubic-meter dual chiller and blast freezer facility for executive banqueting and meat preservation.',
    specs: [
      { label: 'Chiller Room Volume', value: '80 m³ (+2°C to +4°C)' },
      { label: 'Freezer Room Volume', value: '40 m³ (-18°C to -22°C)' },
      { label: 'Refrigeration Racks', value: 'German Bitzer Semi-Hermetic' },
      { label: 'Control System', value: 'Dixell Microprocessor with GSM Alarm' },
      { label: 'Insulation', value: '120mm PUF Cam-Lock Panels' }
    ],
    challenge: 'The hotel required zero operational disruption during construction in their busy main basement kitchen, strict HACCP hygienic compliance, and precise humidity control for delicate pastry and imported meats.',
    solution: 'Kenfoss engineers fabricated modular PUF panels off-site, installed ultra-quiet Copeland scroll condensing units with acoustic enclosures, and fitted double-redundant backup compressors with auto-failover.',
    testimonial: {
      quote: "Kenfoss delivered a world-class cold room facility ahead of schedule. Their attention to food safety standards and thermal precision is unmatched in East Africa.",
      author: "Chef Antoine Dupont",
      title: "Executive Chef, Serena Hotels"
    }
  },
  {
    id: 'naivas-supermarket-central-chillers',
    title: 'Supermarket Central Display Refrigeration & HVAC',
    client: 'Naivas Supermarket Megastore',
    category: 'Supermarket',
    location: 'Westlands, Nairobi',
    completedDate: 'November 2025',
    imageBefore: aboutImg,
    imageAfter: supermarketChillersImg,
    summary: 'Complete refrigeration engineering and centralized VRF air conditioning for a 2,500 sq meter retail store.',
    specs: [
      { label: 'Display Cabinets', value: '32 Units (Meat, Dairy, Produce)' },
      { label: 'Central Rack Power', value: '45 HP Multi-Compressor System' },
      { label: 'HVAC Air Conditioning', value: 'Daikin VRV V 120 HP' },
      { label: 'Energy Savings', value: '32% Reduction via Inverter Controls' }
    ],
    challenge: 'Older refrigeration systems were consuming high electricity bills (over KSh 1.4M/month) with frequent gas leaks affecting perishable sales.',
    solution: 'Engineered a modern variable capacity rack system with eco-friendly refrigerant R404A/R448A, heat recovery for hot water, and energy-efficient night curtains.',
    testimonial: {
      quote: "Our energy bills dropped by over 30% in the first quarter post-installation. Kenfoss provides proactive maintenance that gives our management total peace of mind.",
      author: "Peter Mwaura",
      title: "Head of Operations & Facilities"
    }
  },
  {
    id: 'aga-khan-hospital-pharma-coldchain',
    title: 'Ultra-Low Temperature Pharmaceutical Cold Storage',
    client: 'Aga Khan University Hospital',
    category: 'Industrial',
    location: 'Parklands, Nairobi',
    completedDate: 'January 2026',
    imageBefore: aboutImg,
    imageAfter: pharmaColdchainImg,
    summary: 'Precision vaccine & blood plasma storage facility engineered to WHO & Ministry of Health regulations with dual solar-generator fallback.',
    specs: [
      { label: 'Temperature Tolerance', value: '±0.5°C Controlled' },
      { label: 'Operating Range', value: '-25°C & +4°C Redundant Zones' },
      { label: 'Monitoring', value: 'Cloud IoT Real-Time Telemetry' },
      { label: 'Backup Power', value: 'Automatic Genset & 10kVA UPS' }
    ],
    challenge: 'Vaccine storage mandates strict zero-downtime rules. A 15-minute power cut or temperature spike can ruin millions of shillings in biopharmaceuticals.',
    solution: 'Designed redundant dual refrigeration circuits (Duty + Standby) with automated failover logic, instant SMS/Email alerts to hospital engineers, and thermal battery energy retention.',
    testimonial: {
      quote: "Kenfoss engineers understand the critical nature of medical cold chains. Their precision and rapid response SLA are top-tier.",
      author: "Dr. Florence Omondi",
      title: "Chief Pharmacist & Medical Director"
    }
  },
  {
    id: 'naivasha-flower-farm-chiller',
    title: '150-Tonne Horticultural Fresh Flower Vacuum Chiller & Packhouse',
    client: 'Flora Tropical Africa Ltd',
    category: 'Cold Room',
    location: 'Naivasha, Rift Valley',
    completedDate: 'February 2026',
    imageBefore: coldRoomBuildImg,
    imageAfter: flowerFarmChillerImg,
    summary: 'Heavy industrial pre-cooling cold rooms designed for fresh rose exports to European markets.',
    specs: [
      { label: 'Daily Export Capacity', value: '150,000 Stems / Day' },
      { label: 'Temperature Range', value: '+1°C to +3°C Uniform' },
      { label: 'Evaporator Fans', value: 'Low-Velocity High-Humidity Air Circulation' },
      { label: 'Energy Source', value: 'Grid + 150kW Solar PV Integration' }
    ],
    challenge: 'Fresh cut flowers require rapid field heat removal within 45 minutes of harvest to ensure a 14-day vase life in Europe.',
    solution: 'Kenfoss built a high-cfm forced-air cooling room with custom micro-mist humidity management (95% RH) to prevent stem wilt.',
    testimonial: {
      quote: "Export rejection rates dropped to near zero. Kenfoss is our go-to partner for flower cold chain engineering in Kenya.",
      author: "Samuel Kipchumba",
      title: "General Manager, Naivasha Operations"
    }
  }
];
