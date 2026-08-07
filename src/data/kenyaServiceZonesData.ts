import { RAW_COUNTY_DATA, getHierarchyCoords } from './kenyaHierarchyData';

export interface ServiceZone {
  id: string;
  name: string;
  nameSw: string;
  county: string;
  subCounty: string;
  distanceFromHQ: string;
  emergencySLA: string;
  standardSLA: string;
  status: 'Primary Hub' | 'Express Coverage' | 'Extended Zone' | 'Regional Hub' | 'Mobile Field Station' | 'On-Demand Nationwide';
  keyEstates: string[];
  keyIndustries: string[];
  isHQ?: boolean;
  serviceHours: string;
  contactDetails: {
    hotline: string;
    dispatchLead: string;
    email: string;
  };
  coordinates?: { lat: number; lng: number };
}

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

export const COUNTY_CODES_MAP: Record<string, string> = {
  'Mombasa': '001', 'Kwale': '002', 'Kilifi': '003', 'Tana River': '004', 'Lamu': '005',
  'Taita-Taveta': '006', 'Garissa': '007', 'Wajir': '008', 'Mandera': '009', 'Marsabit': '010',
  'Isiolo': '011', 'Meru': '012', 'Tharaka-Nithi': '013', 'Embu': '014', 'Kitui': '015',
  'Machakos': '016', 'Makueni': '017', 'Nyandarua': '018', 'Nyeri': '019', 'Kirinyaga': '020',
  'Murang\'a': '021', 'Kiambu': '022', 'Turkana': '023', 'West Pokot': '024', 'Samburu': '025',
  'Trans-Nzoia': '026', 'Uasin Gishu': '027', 'Elgeyo-Marakwet': '028', 'Nandi': '029', 'Baringo': '030',
  'Laikipia': '031', 'Nakuru': '032', 'Narok': '033', 'Kajiado': '034', 'Kericho': '035',
  'Bomet': '036', 'Kakamega': '037', 'Vihiga': '038', 'Bungoma': '039', 'Busia': '040',
  'Siaya': '041', 'Kisumu': '042', 'Homa Bay': '043', 'Migori': '044', 'Kisii': '045',
  'Nyamira': '046', 'Nairobi': '047'
};

export function cleanCountySearchString(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/['’\-_\s]+/g, '');
}

interface CountyMetadata {
  hubName: string;
  distanceRange: string;
  emergencySLA: string;
  standardSLA: string;
  status: 'Primary Hub' | 'Express Coverage' | 'Extended Zone' | 'Regional Hub' | 'Mobile Field Station' | 'On-Demand Nationwide';
  dispatchLead: string;
  hotline: string;
  email: string;
  serviceHours: string;
  defaultIndustries: string[];
}

const COUNTY_METADATA_MAP: Record<string, CountyMetadata> = {
  'Mombasa': {
    hubName: 'Mombasa Port & Coast Marine Dispatch Hub',
    distanceRange: '480 km',
    emergencySLA: '30 - 45 Mins (Coast Base)',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Hassan Ali (Coast Regional Lead)',
    hotline: '+254 745 411 923',
    email: 'mombasa@kenfoss.co.ke',
    serviceHours: '24/7 Marine Port & Hospitality Emergency Response',
    defaultIndustries: [
      'Kilindini Marine Port Containerized Reefer Units',
      'Beach Resort, Hotel & Cruise HVAC Systems',
      'Seafood & Fish Processing Export Cold Storage',
      'Industrial Ammonia & Freon Blast Freezers'
    ]
  },
  'Kwale': {
    hubName: 'Diani & Kwale South Coast Station',
    distanceRange: '510 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Omar Hamisi (South Coast Lead)',
    hotline: '+254 745 411 923',
    email: 'kwale@kenfoss.co.ke',
    serviceHours: '24/7 Emergency & Hotel Support',
    defaultIndustries: [
      'Beach Resort Air Conditioning & Refrigeration',
      'Fish & Seafood Export Cold Stores',
      'Sugarcane Processing Industrial Chillers',
      'Border Customs Inspection Reefer Units'
    ]
  },
  'Kilifi': {
    hubName: 'Kilifi & Malindi North Coast Hub',
    distanceRange: '490 km',
    emergencySLA: '40 - 55 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Suleiman Bakari (North Coast Commander)',
    hotline: '+254 745 411 923',
    email: 'kilifi@kenfoss.co.ke',
    serviceHours: '24/7 Hotel, Resort & Fisheries Support',
    defaultIndustries: [
      'Malindi & Watamu Resort Central HVAC',
      'Fish & Marine Product Blast Freezers',
      'Fruit Processing Packhouse Cold Storage',
      'Vipingo Industrial Park Refrigeration'
    ]
  },
  'Tana River': {
    hubName: 'Hola & Tana River Basin Station',
    distanceRange: '420 km',
    emergencySLA: '60 - 90 Mins',
    standardSLA: 'Same Day / 24h Team',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Juma Galgalo (Tana River Station Lead)',
    hotline: '+254 745 411 923',
    email: 'tanariver@kenfoss.co.ke',
    serviceHours: '06:00 - 20:00 Daily + 24/7 Emergency On-Call',
    defaultIndustries: [
      'Bura Irrigation Scheme Crop Cold Storage',
      'Livestock Abattoir Meat Chillers',
      'Solar Off-Grid Milk Cooling Units',
      'County Hospital Medical & Vaccine Storage'
    ]
  },
  'Lamu': {
    hubName: 'Lamu Port LAPSSET & Island Station',
    distanceRange: '540 km',
    emergencySLA: '60 - 90 Mins / Marine Shuttle',
    standardSLA: 'Turnkey Field Service',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Said Mohamed (LAPSSET Cold Chain Lead)',
    hotline: '+254 745 411 923',
    email: 'lamu@kenfoss.co.ke',
    serviceHours: '24/7 LAPSSET Marine & Port Emergency Support',
    defaultIndustries: [
      'LAPSSET Port Logistics Containerized Freezers',
      'Deep Sea Fisheries Export Cold Chain',
      'Shela Luxury Resort VRF Air Conditioning',
      'Agricultural Produce Refrigerated Storage'
    ]
  },
  'Taita-Taveta': {
    hubName: 'Voi Junction & Taveta Border Logistics Hub',
    distanceRange: '330 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Christopher Mwatela (Taita-Taveta Lead)',
    hotline: '+254 745 411 923',
    email: 'taitataveta@kenfoss.co.ke',
    serviceHours: '24/7 Transit Highway & Border Post Support',
    defaultIndustries: [
      'Taveta Cross-Border Produce Cold Storage',
      'Highway Transit Reefer Truck Refrigeration',
      'Hotel, Lodge & Safari Camp HVAC',
      'Mining Camp Commercial Water Coolers'
    ]
  },
  'Garissa': {
    hubName: 'Garissa & North Eastern Regional Station',
    distanceRange: '370 km',
    emergencySLA: '60 - 90 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Hussein Mohamed (North Eastern Station Lead)',
    hotline: '+254 745 411 923',
    email: 'garissa@kenfoss.co.ke',
    serviceHours: '24/7 Emergency Livestock & Solar Cold Chain Unit',
    defaultIndustries: [
      'Livestock Abattoir & Export Meat Cold Stores',
      'Solar-Powered Milk Cooling Centers',
      'County Hospital Vaccine & Blood Banks',
      'Commercial Cold Water Chillers'
    ]
  },
  'Wajir': {
    hubName: 'Wajir Airport & Solar Cold Chain Station',
    distanceRange: '620 km',
    emergencySLA: '2 - 3 Hours / Air Charter',
    standardSLA: 'Field Mobile Unit',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Abdi Noor (Wajir Mobile Unit Lead)',
    hotline: '+254 745 411 923',
    email: 'wajir@kenfoss.co.ke',
    serviceHours: '24/7 Emergency & Air Patrol',
    defaultIndustries: [
      'Solar Off-Grid Bulk Milk Coolers',
      'Meat Abattoir Blast Freezers',
      'Airport Cargo Cold Storage',
      'Hospital Medical & Vaccine Cold Chain'
    ]
  },
  'Mandera': {
    hubName: 'Mandera Border & Tri-State Cold Station',
    distanceRange: '820 km',
    emergencySLA: '3 - 4 Hours / Flight Charter',
    standardSLA: 'Scheduled Technical Patrols',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Ibrahim Hassan (Border Field Lead)',
    hotline: '+254 745 411 923',
    email: 'mandera@kenfoss.co.ke',
    serviceHours: '24/7 Cross-Border Emergency Response',
    defaultIndustries: [
      'Solar Powered Milk Cooling Tanks',
      'Meat Export Abattoir Cold Stores',
      'Medical & Vaccine Storage Facilities',
      'Government & NGO Facility Air Conditioning'
    ]
  },
  'Marsabit': {
    hubName: 'Marsabit & Moyale Border Station',
    distanceRange: '530 km',
    emergencySLA: '2 - 3 Hours',
    standardSLA: 'Mobile Field Dispatch',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Peter Leiyagu (Marsabit Station Lead)',
    hotline: '+254 745 411 923',
    email: 'marsabit@kenfoss.co.ke',
    serviceHours: '24/7 Moyale Corridor & Solar Unit Support',
    defaultIndustries: [
      'Moyale Border Post Customs Refrigeration',
      'Solar Milk Bulk Cooling Stations',
      'Livestock Meat Chillers',
      'Hospital Mortuary & Blood Storage'
    ]
  },
  'Isiolo': {
    hubName: 'Isiolo LAPSSET Junction Station',
    distanceRange: '270 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Mohamed Guyo (Isiolo LAPSSET Lead)',
    hotline: '+254 745 411 923',
    email: 'isiolo@kenfoss.co.ke',
    serviceHours: '24/7 LAPSSET Corridor & Resort Support',
    defaultIndustries: [
      'Export Abattoir Meat Chillers',
      'Airport Cargo Cold Rooms',
      'Game Reserve Safari Lodge HVAC',
      'Commercial Chilled Water Units'
    ]
  },
  'Meru': {
    hubName: 'Meru & Mt. Kenya North Hub',
    distanceRange: '220 km',
    emergencySLA: '40 - 55 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Martin Mwenda (Upper Eastern Lead)',
    hotline: '+254 745 411 923',
    email: 'meru@kenfoss.co.ke',
    serviceHours: '06:00 - 22:00 Daily + 24/7 Emergency On-Call',
    defaultIndustries: [
      'Avocado & Banana Cold Storage Facilities',
      'Miraa & Horticultural Export Produce Cooling',
      'Dairy Produce Processing Plants',
      'Hotel & Commercial Building HVAC'
    ]
  },
  'Tharaka-Nithi': {
    hubName: 'Chuka & Tharaka-Nithi Field Station',
    distanceRange: '180 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Dennis Mutuma (Tharaka-Nithi Lead)',
    hotline: '+254 745 411 923',
    email: 'tharakanithi@kenfoss.co.ke',
    serviceHours: '07:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Chogoria Hospital Mortuary & Cold Storage',
      'University Food Services Freezers',
      'Agricultural Produce Chillers',
      'Dairy Bulk Cooling Stations'
    ]
  },
  'Embu': {
    hubName: 'Embu & Mt. Kenya Eastern Dispatch Hub',
    distanceRange: '130 km',
    emergencySLA: '30 - 45 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Felix Mbogo (Embu & Mt. Kenya Regional Commander)',
    hotline: '+254 745 411 923',
    email: 'embu@kenfoss.co.ke',
    serviceHours: '24/7 Emergency Breakdown Team & Daily Field Service',
    defaultIndustries: [
      'Macadamia & Coffee Produce Processing Chillers',
      'Dairy Milk Bulk Cooling Centers',
      'Horticultural Export Packhouse Cold Rooms',
      'Private Hospital Mortuary & Laboratory Refrigeration',
      'Supermarket Display Cabinet Support'
    ]
  },
  'Kitui': {
    hubName: 'Kitui & Mwingi Eastern Station',
    distanceRange: '170 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Patrick Musyoka (Kitui Lead)',
    hotline: '+254 745 411 923',
    email: 'kitui@kenfoss.co.ke',
    serviceHours: '07:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Honey & Fruit Produce Processing Cold Storage',
      'County Hospital Medical Cold Chain',
      'Mining Camp HVAC Systems',
      'Dairy Milk Bulk Cooling Stations'
    ]
  },
  'Machakos': {
    hubName: 'Athi River EPZ & Machakos Corridor',
    distanceRange: '45 km',
    emergencySLA: '25 - 40 Mins',
    standardSLA: 'Immediate Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Francis Wambua (EPZ & Machakos Lead)',
    hotline: '+254 745 411 923',
    email: 'epz@kenfoss.co.ke',
    serviceHours: '24 Hours EPZ Export & Industrial Support',
    defaultIndustries: [
      'Export Processing Zone (EPZ) Cold Stores',
      'Beverage Bottling & Brewery Chillers',
      'Flower Export Freight Distribution',
      'Commercial Meat Abattoir Refrigeration'
    ]
  },
  'Makueni': {
    hubName: 'Wote & Emali Highway Transit Station',
    distanceRange: '120 km',
    emergencySLA: '40 - 55 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Boniface Muia (Makueni Lead)',
    hotline: '+254 745 411 923',
    email: 'makueni@kenfoss.co.ke',
    serviceHours: '24/7 Highway Transit & Agriculture Support',
    defaultIndustries: [
      'Mango & Citrus Fruit Processing Cold Chain',
      'Highway Transit Reefer Truck Maintenance',
      'SGR Logistics Depot Cooling',
      'Hospital Mortuary & Laboratory Freezers'
    ]
  },
  'Nyandarua': {
    hubName: 'Ol Kalou & Nyandarua Agri Cold Station',
    distanceRange: '110 km',
    emergencySLA: '35 - 50 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Samuel Kimani (Nyandarua Lead)',
    hotline: '+254 745 411 923',
    email: 'nyandarua@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Potato & Vegetable Packhouse Cold Storage',
      'Milk Bulk Cooling Plants',
      'Floriculture Cold Storage',
      'Commercial Supermarket Refrigeration'
    ]
  },
  'Nyeri': {
    hubName: 'Nyeri & Central Highlands Hub',
    distanceRange: '120 km',
    emergencySLA: '30 - 45 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Joseph Wachira (Nyeri Dispatch Commander)',
    hotline: '+254 745 411 923',
    email: 'nyeri@kenfoss.co.ke',
    serviceHours: '24/7 Emergency & Regular Field Patrol',
    defaultIndustries: [
      'Coffee & Tea Factory Industrial Chillers',
      'Dairy Milk Bulk Cooling Stations',
      'Hospital Mortuaries & Laboratory Refrigeration',
      'Commercial Supermarket Refrigeration'
    ]
  },
  'Kirinyaga': {
    hubName: 'Kerugoya & Mwea Rice Belt Station',
    distanceRange: '95 km',
    emergencySLA: '30 - 40 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Anthony Njeru (Kirinyaga Lead)',
    hotline: '+254 745 411 923',
    email: 'kirinyaga@kenfoss.co.ke',
    serviceHours: '24/7 Rice Mill & Agro-Processing Support',
    defaultIndustries: [
      'Rice Mill Aeration & Grain Chillers',
      'Horticultural Produce Packhouses',
      'Dairy Cooling Stations',
      'Hospital Freezers & Mortuaries'
    ]
  },
  'Murang\'a': {
    hubName: 'Murang\'a & Kenol Industrial Corridor',
    distanceRange: '50 km',
    emergencySLA: '20 - 35 Mins',
    standardSLA: 'Immediate Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. George Maina (Murang\'a Lead)',
    hotline: '+254 745 411 923',
    email: 'muranga@kenfoss.co.ke',
    serviceHours: '24/7 Emergency Mobile Dispatch',
    defaultIndustries: [
      'Avocado Oil & Produce Cold Storage',
      'Milk Processing Plants',
      'Tea Factory Chillers',
      'Commercial Building HVAC Systems'
    ]
  },
  'Kiambu': {
    hubName: 'Central HQ & Ruiru Industrial Corridor',
    distanceRange: '0 - 25 km',
    emergencySLA: '< 15 Mins',
    standardSLA: 'Immediate Dispatch',
    status: 'Primary Hub',
    dispatchLead: 'Eng. John Mwangi (Central HQ Commander)',
    hotline: '+254 745 411 923',
    email: 'dispatch@kenfoss.co.ke',
    serviceHours: '24/7 Non-Stop Emergency & Routine Mobile Fleet',
    defaultIndustries: [
      'Cold Storage Warehouses & Logistics Hubs',
      'Food & Meat Processing Plants',
      'Tatu City Industrial Park Cold Rooms',
      'Supermarket Distribution Chillers',
      'Floriculture & Horticultural Packhouses'
    ]
  },
  'Turkana': {
    hubName: 'Lodwar & Turkana Energy Cold Chain Station',
    distanceRange: '680 km',
    emergencySLA: '2 - 3 Hours / Flight Charter',
    standardSLA: 'Mobile Field Dispatch',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Ekiru Lomekwi (Turkana Project Lead)',
    hotline: '+254 745 411 923',
    email: 'turkana@kenfoss.co.ke',
    serviceHours: '24/7 Mobile Field Unit & Flight Dispatch',
    defaultIndustries: [
      'Oil Field Camp Refrigeration & HVAC',
      'Lake Turkana Fisheries Cold Chain',
      'Solar Off-Grid Cold Rooms',
      'Disaster Relief Vaccine Cold Storage'
    ]
  },
  'West Pokot': {
    hubName: 'Kapenguria & West Pokot Field Station',
    distanceRange: '420 km',
    emergencySLA: '60 - 90 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Emmanuel Pkoringo (West Pokot Lead)',
    hotline: '+254 745 411 923',
    email: 'westpokot@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Cement Factory Industrial Cooling',
      'Milk Cooling Centers',
      'Hospital Vaccine Storage',
      'Agricultural Produce Cold Storage'
    ]
  },
  'Samburu': {
    hubName: 'Maralal & Samburu Safari Station',
    distanceRange: '350 km',
    emergencySLA: '60 - 90 Mins',
    standardSLA: 'Field Mobile Unit',
    status: 'Mobile Field Station',
    dispatchLead: 'Eng. Lameck Leshitip (Samburu Lead)',
    hotline: '+254 745 411 923',
    email: 'samburu@kenfoss.co.ke',
    serviceHours: '24/7 Safari Lodge & Community Cold Chain Support',
    defaultIndustries: [
      'Game Reserve Luxury Safari Lodge HVAC',
      'Community Milk Cooling Tanks',
      'Meat Abattoir Freezers',
      'Hospital Cold Storage'
    ]
  },
  'Trans-Nzoia': {
    hubName: 'Kitale & Trans-Nzoia Seed Corridor Hub',
    distanceRange: '380 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Mark Wafula (Kitale Regional Lead)',
    hotline: '+254 745 411 923',
    email: 'kitale@kenfoss.co.ke',
    serviceHours: '24/7 Seed Cold Storage & Agricultural Support',
    defaultIndustries: [
      'Hybrid Seed Maize Aeration & Cold Storage',
      'Horticultural Packhouses',
      'Dairy Processing Chillers',
      'Commercial Supermarket Units'
    ]
  },
  'Uasin Gishu': {
    hubName: 'Eldoret North Rift Regional Hub',
    distanceRange: '310 km',
    emergencySLA: '35 - 50 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. James Kiptoo (North Rift Regional Commander)',
    hotline: '+254 745 411 923',
    email: 'eldoret@kenfoss.co.ke',
    serviceHours: '24/7 Emergency Field Team & Air Dispatch',
    defaultIndustries: [
      'Grain & Seed Storage Temperature Control',
      'Avocado & Horticultural Cold Storage',
      'Eldoret International Airport Cargo Cold Chain',
      'Hospital & Referral Lab Freezers'
    ]
  },
  'Elgeyo-Marakwet': {
    hubName: 'Iten & Cherangany Highland Station',
    distanceRange: '340 km',
    emergencySLA: '50 - 65 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Kipruto Kiptoo (Highland Lead)',
    hotline: '+254 745 411 923',
    email: 'elgeyomarakwet@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'High-Altitude Athletic Center HVAC',
      'Potato & Produce Storage',
      'Dairy Cooling Tanks',
      'Hospital Refrigeration'
    ]
  },
  'Nandi': {
    hubName: 'Kapsabet & Nandi Hills Tea Belt Station',
    distanceRange: '310 km',
    emergencySLA: '40 - 55 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Hillary Too (Nandi Lead)',
    hotline: '+254 745 411 923',
    email: 'nandi@kenfoss.co.ke',
    serviceHours: '24/7 Tea Factory & Dairy Emergency Response',
    defaultIndustries: [
      'Tea Factory Chilled Water Systems',
      'Dairy Bulk Milk Cooling',
      'Horticultural Produce Cold Storage',
      'Commercial Refrigeration'
    ]
  },
  'Baringo': {
    hubName: 'Kabarnet & Baringo Agri Station',
    distanceRange: '260 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Kipchirchir Bett (Baringo Lead)',
    hotline: '+254 745 411 923',
    email: 'baringo@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Geothermal Energy Plant Cooling',
      'Honey & Goat Meat Cold Chains',
      'Milk Cooling Stations',
      'Hospital Vaccine Freezers'
    ]
  },
  'Laikipia': {
    hubName: 'Nanyuki & Laikipia Safari Corridor Station',
    distanceRange: '190 km',
    emergencySLA: '35 - 50 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Jackson Mwangi (Laikipia Lead)',
    hotline: '+254 745 411 923',
    email: 'nanyuki@kenfoss.co.ke',
    serviceHours: '24/7 Military Base & Safari Lodge Emergency Response',
    defaultIndustries: [
      'Luxury Safari Lodge Refrigeration & VRF',
      'Military Base HVAC Systems',
      'Wheat & Grain Cold Aeration',
      'Beef Abattoir Chillers'
    ]
  },
  'Nakuru': {
    hubName: 'Nakuru & Naivasha Flower Belt Hub',
    distanceRange: '150 km',
    emergencySLA: '30 - 45 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Robert Cheruiyot (Rift Valley Regional Mgr)',
    hotline: '+254 745 411 923',
    email: 'nakuru@kenfoss.co.ke',
    serviceHours: '24/7 Floriculture Export & Emergency Service',
    defaultIndustries: [
      'Naivasha Lake Flower Farm Export Cold Stores',
      'Dairy Processing Bulk Milk Chillers',
      'Vegetable & Potato Packhouse Cold Storage',
      'Geothermal Cooling'
    ]
  },
  'Narok': {
    hubName: 'Narok & Maasai Mara Safari Hub',
    distanceRange: '180 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Joshua Ole Kaelo (Narok & Mara Lead)',
    hotline: '+254 745 411 923',
    email: 'narok@kenfoss.co.ke',
    serviceHours: '24/7 Game Reserve Lodge & Wheat Storage Support',
    defaultIndustries: [
      'Maasai Mara Safari Lodge Refrigeration',
      'Wheat & Barley Grain Cold Aeration',
      'Meat Abattoir Chillers',
      'Milk Bulk Coolers'
    ]
  },
  'Kajiado': {
    hubName: 'Kitengela Industrial & Kajiado Corridor',
    distanceRange: '45 km',
    emergencySLA: '25 - 40 Mins',
    standardSLA: 'Immediate Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Paul Ntetia (Kajiado & Kitengela Lead)',
    hotline: '+254 745 411 923',
    email: 'kajiado@kenfoss.co.ke',
    serviceHours: '24/7 Meat Processing & Industrial EPZ Support',
    defaultIndustries: [
      'Meat Processing & Export Abattoirs',
      'Namanga Border Post Cold Storage',
      'Commercial Air Conditioning',
      'Dairy Cooling Stations'
    ]
  },
  'Kericho': {
    hubName: 'Kericho Tea Belt & South Rift Hub',
    distanceRange: '260 km',
    emergencySLA: '40 - 55 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Gideon Langat (Kericho Regional Lead)',
    hotline: '+254 745 411 923',
    email: 'kericho@kenfoss.co.ke',
    serviceHours: '24/7 Tea Factory Chiller & Industrial Support',
    defaultIndustries: [
      'Multinational Tea Factory Industrial Chillers',
      'Dairy Bulk Cooling Plants',
      'Commercial Building HVAC',
      'Hospital Freezers'
    ]
  },
  'Bomet': {
    hubName: 'Bomet & Sotik Dairy Station',
    distanceRange: '240 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Wesley Yegon (Bomet Lead)',
    hotline: '+254 745 411 923',
    email: 'bomet@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Dairy Milk Bulk Cooling Stations',
      'Tea Factory Chilled Water Systems',
      'Hospital Mortuary Refrigeration',
      'Supermarket Units'
    ]
  },
  'Kakamega': {
    hubName: 'Kakamega Western Kenya Hub',
    distanceRange: '360 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Alex Shibanda (Western Kenya Lead)',
    hotline: '+254 745 411 923',
    email: 'kakamega@kenfoss.co.ke',
    serviceHours: '24/7 Industrial & Healthcare Cold Chain Support',
    defaultIndustries: [
      'Agro-Processing & Dairy Cold Storage',
      'Sugar Mill Cooling Systems',
      'Referral Hospital Blood & Vaccine Storage',
      'Hotel & Mall HVAC'
    ]
  },
  'Vihiga': {
    hubName: 'Mbale & Vihiga Central Station',
    distanceRange: '350 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Stephen Kedogo (Vihiga Lead)',
    hotline: '+254 745 411 923',
    email: 'vihiga@kenfoss.co.ke',
    serviceHours: '07:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Wholesale Market Produce Cold Rooms',
      'Dairy Milk Cooling Stations',
      'Hospital Vaccine Storage',
      'Commercial Air Conditioning'
    ]
  },
  'Bungoma': {
    hubName: 'Bungoma & Webuye Heavy Industrial Hub',
    distanceRange: '390 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Richard Wekesa (Bungoma Lead)',
    hotline: '+254 745 411 923',
    email: 'bungoma@kenfoss.co.ke',
    serviceHours: '24/7 Heavy Industrial & Cross-Border Support',
    defaultIndustries: [
      'Webuye Heavy Industrial Plant Chillers',
      'Sugar Processing Factory Cooling',
      'Grain Aeration Storage',
      'Malaba Border Transit Logistics'
    ]
  },
  'Busia': {
    hubName: 'Busia & Malaba Border Customs Hub',
    distanceRange: '430 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Fredrick Ojiambo (Busia Border Lead)',
    hotline: '+254 745 411 923',
    email: 'busia@kenfoss.co.ke',
    serviceHours: '24/7 Border Customs Reefer Truck & Fisheries Support',
    defaultIndustries: [
      'Customs Transit Container Reefer Maintenance',
      'Lake Victoria Fish Cold Stores',
      'Commercial Hotel HVAC',
      'Sugarcane Processing Chillers'
    ]
  },
  'Siaya': {
    hubName: 'Siaya & Bondo Fisheries Station',
    distanceRange: '380 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. George Omondi (Siaya Lead)',
    hotline: '+254 745 411 923',
    email: 'siaya@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Lake Victoria Fresh Fish Ice Plants & Cold Rooms',
      'Hospital Freezers',
      'Agricultural Produce Chillers',
      'Supermarket Display Cabinets'
    ]
  },
  'Kisumu': {
    hubName: 'Kisumu Lake Victoria Basin Hub',
    distanceRange: '350 km',
    emergencySLA: '35 - 50 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Victor Omondi (Lake Basin Regional Lead)',
    hotline: '+254 745 411 923',
    email: 'kisumu@kenfoss.co.ke',
    serviceHours: '24/7 Fisheries & Commercial Cold Storage Support',
    defaultIndustries: [
      'Lake Victoria Fresh Fish Export Cold Chain',
      'Sugar Industry Industrial Chillers',
      'Hospital Mortuary & Blood Bank Storage',
      'Mall HVAC'
    ]
  },
  'Homa Bay': {
    hubName: 'Homa Bay & Lake Port Station',
    distanceRange: '390 km',
    emergencySLA: '50 - 65 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Duncan Otieno (Homa Bay Lead)',
    hotline: '+254 745 411 923',
    email: 'homabay@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Lake Port Fresh Fish Blast Freezers',
      'Sugar Milling Chillers',
      'Hospital Cold Chain',
      'Commercial Supermarket Units'
    ]
  },
  'Migori': {
    hubName: 'Migori & Isebania Border Station',
    distanceRange: '380 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Samuel Maroa (Migori & Border Lead)',
    hotline: '+254 745 411 923',
    email: 'migori@kenfoss.co.ke',
    serviceHours: '24/7 Cross-Border Produce & Tobacco Cold Chain Support',
    defaultIndustries: [
      'Isebania Customs Border Logistics',
      'Sugarcane Factory Chillers',
      'Tobacco Produce Processing Cold Storage',
      'Hospital Freezers'
    ]
  },
  'Kisii': {
    hubName: 'Kisii & South Nyanza Hub',
    distanceRange: '310 km',
    emergencySLA: '35 - 50 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Regional Hub',
    dispatchLead: 'Eng. Kevin Nyaberi (South Nyanza Commander)',
    hotline: '+254 745 411 923',
    email: 'kisii@kenfoss.co.ke',
    serviceHours: '24/7 Field Response & Routine Audits',
    defaultIndustries: [
      'Banana & Produce Cold Storage Rooms',
      'Tea Factory Chiller Overhauls',
      'Hotel & Mortuary Refrigeration',
      'Supermarket Cooling Displays'
    ]
  },
  'Nyamira': {
    hubName: 'Nyamira & Highlands Tea Belt Station',
    distanceRange: '300 km',
    emergencySLA: '45 - 60 Mins',
    standardSLA: 'Same Day Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. Frankline Mochoge (Nyamira Lead)',
    hotline: '+254 745 411 923',
    email: 'nyamira@kenfoss.co.ke',
    serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency',
    defaultIndustries: [
      'Tea Factory Industrial Chillers',
      'Dairy Bulk Milk Coolers',
      'Hospital Vaccine Freezers',
      'Commercial Refrigeration'
    ]
  },
  'Nairobi': {
    hubName: 'Nairobi Metropolitan & Industrial Area Hub',
    distanceRange: '20 km',
    emergencySLA: '15 - 30 Mins',
    standardSLA: 'Immediate Dispatch',
    status: 'Express Coverage',
    dispatchLead: 'Eng. David Ochieng (Industrial & Commercial Lead)',
    hotline: '+254 745 411 923',
    email: 'nairobi@kenfoss.co.ke',
    serviceHours: '24/7 Industrial Emergency Response Unit',
    defaultIndustries: [
      'Industrial Area Meat & Poultry Processing',
      'Pharmaceutical Cold Chain & Vaccine Storage',
      '5-Star Hotels & Catering Chillers',
      'VRF Air Conditioning'
    ]
  }
};

const DEFAULT_METADATA: CountyMetadata = {
  hubName: 'Regional Mobile Dispatch Unit',
  distanceRange: '100 - 350 km',
  emergencySLA: '45 - 75 Mins',
  standardSLA: 'Same Day Dispatch',
  status: 'Extended Zone',
  dispatchLead: 'Eng. James Kiptoo (National Regional Lead)',
  hotline: '+254 745 411 923',
  email: 'dispatch@kenfoss.co.ke',
  serviceHours: '06:00 - 21:00 Daily + 24/7 Emergency On-Call',
  defaultIndustries: [
    'Agricultural Produce Cold Storage',
    'Dairy Milk Cooling Facilities',
    'Hospital & Clinic Vaccine Refrigeration',
    'Commercial Supermarket Refrigeration',
    'VRF Air Conditioning Systems'
  ]
};

/**
 * Dynamically generates full ServiceZone objects for ANY county in Kenya
 * using RAW_COUNTY_DATA so every county has 100% complete, non-empty, interactive data.
 */
export function getServiceZonesForCounty(countyName: string): ServiceZone[] {
  const norm = (countyName || 'Kiambu').trim();

  // Handle "All" or "All 47 Counties"
  if (norm === 'All' || norm === 'All 47 Counties') {
    return getAllFeaturedZones();
  }

  // Find exact or case-insensitive matching county in RAW_COUNTY_DATA
  const matchedKey = Object.keys(RAW_COUNTY_DATA).find(
    k => k.toLowerCase() === norm.toLowerCase()
  ) || 'Kiambu';

  const subCounties = RAW_COUNTY_DATA[matchedKey] || [];
  const meta = COUNTY_METADATA_MAP[matchedKey] || {
    ...DEFAULT_METADATA,
    hubName: `${matchedKey} County Dispatch Zone`,
    dispatchLead: `Eng. ${matchedKey} Regional Dispatch Commander`,
    email: `${matchedKey.toLowerCase().replace(/[^a-z]/g, '')}@kenfoss.co.ke`
  };

  if (subCounties.length === 0) {
    // Fallback single zone
    return [{
      id: `${matchedKey.toLowerCase()}-central`,
      name: `${matchedKey} County Central Zone`,
      nameSw: `Eneo la Kati la Kaunti ya ${matchedKey}`,
      county: matchedKey,
      subCounty: `${matchedKey} Central`,
      distanceFromHQ: meta.distanceRange,
      emergencySLA: meta.emergencySLA,
      standardSLA: meta.standardSLA,
      status: meta.status,
      keyEstates: [`${matchedKey} Town`, `${matchedKey} Market`, 'Industrial Zone', 'Central Ward'],
      keyIndustries: meta.defaultIndustries,
      serviceHours: meta.serviceHours,
      contactDetails: {
        hotline: meta.hotline,
        dispatchLead: meta.dispatchLead,
        email: meta.email
      },
      coordinates: getHierarchyCoords(matchedKey, `${matchedKey} Central`, 'Township', 'Main')
    }];
  }

  return subCounties.map((sc, index) => {
    const isPrimarySubCounty = index === 0;
    const isHqCounty = matchedKey === 'Kiambu' && sc.name.toLowerCase().includes('ruiru');
    
    // SLA tweaks for sub-counties
    const emergencySla = isHqCounty ? '< 15 Mins' : isPrimarySubCounty ? meta.emergencySLA : `${parseInt(meta.emergencySLA) || 40} - ${parseInt(meta.emergencySLA) + 20 || 60} Mins`;

    const estates = sc.wards && sc.wards.length > 0 
      ? sc.wards.map(w => `${w}`) 
      : [`${sc.name} Central`, `${sc.name} Market`, `${sc.name} Estate`];

    return {
      id: `${matchedKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${sc.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${sc.name} & ${matchedKey} ${index === 0 ? 'Hub' : 'Sector'} Zone`,
      nameSw: `Eneo la ${sc.name}, Kaunti ya ${matchedKey}`,
      county: matchedKey,
      subCounty: sc.name,
      distanceFromHQ: isHqCounty ? '0 km (Central HQ)' : meta.distanceRange,
      emergencySLA: emergencySla,
      standardSLA: meta.standardSLA,
      status: isHqCounty ? 'Primary Hub' : isPrimarySubCounty ? meta.status : 'Extended Zone',
      keyEstates: estates,
      keyIndustries: meta.defaultIndustries,
      isHQ: isHqCounty,
      serviceHours: meta.serviceHours,
      contactDetails: {
        hotline: meta.hotline,
        dispatchLead: meta.dispatchLead,
        email: meta.email
      },
      coordinates: getHierarchyCoords(matchedKey, sc.name, estates[0] || 'Central', 'HQ')
    };
  });
}

/**
 * Returns a comprehensive curated set of featured primary zones across key regions in Kenya.
 */
export function getAllFeaturedZones(): ServiceZone[] {
  const featuredCounties = ['Kiambu', 'Nairobi', 'Machakos', 'Embu', 'Mombasa', 'Nakuru', 'Uasin Gishu', 'Kisumu', 'Meru', 'Nyeri', 'Kakamega', 'Garissa'];
  
  const allZones: ServiceZone[] = [];
  featuredCounties.forEach(county => {
    const zones = getServiceZonesForCounty(county);
    if (zones.length > 0) {
      // Pick up to 2 top zones per featured county
      allZones.push(...zones.slice(0, 2));
    }
  });

  return allZones;
}

/**
 * Returns ALL zones across ALL 47 counties for global location searching.
 */
export function getAll47CountyZones(): ServiceZone[] {
  const all47: ServiceZone[] = [];
  KENYA_47_COUNTIES.forEach(county => {
    all47.push(...getServiceZonesForCounty(county));
  });
  return all47;
}
