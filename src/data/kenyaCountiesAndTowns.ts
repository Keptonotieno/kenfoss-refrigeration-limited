import { KENYA_COUNTY_COORDINATES, getCountyCoords } from './countyCoordinates';

export interface TownLocation {
  name: string;
  latOffset?: number;
  lngOffset?: number;
}

export const KENYA_COUNTIES_LIST: string[] = [
  'Nairobi',
  'Kiambu',
  'Mombasa',
  'Nakuru',
  'Kisumu',
  'Uasin Gishu',
  'Machakos',
  'Meru',
  'Kilifi',
  'Kwale',
  'Lamu',
  'Taita-Taveta',
  'Tana River',
  'Murang\'a',
  'Kirinyaga',
  'Nyandarua',
  'Nyeri',
  'Trans-Nzoia',
  'Kericho',
  'Bomet',
  'Narok',
  'Kajiado',
  'Laikipia',
  'Baringo',
  'Elgeyo-Marakwet',
  'Nandi',
  'Samburu',
  'Siaya',
  'Homa Bay',
  'Migori',
  'Kisii',
  'Nyamira',
  'Embu',
  'Tharaka-Nithi',
  'Isiolo',
  'Bungoma',
  'Busia',
  'Vihiga',
  'West Pokot',
  'Turkana',
  'Wajir',
  'Mandera',
  'Marsabit',
  'Kitui',
  'Makueni',
  'Garissa',
  'Kakamega'
].sort();

export const COUNTY_TOWNS_MAP: Record<string, string[]> = {
  'Nairobi': [
    'Nairobi CBD',
    'Industrial Area / Enterprise Rd',
    'Westlands / Parklands',
    'Kilimani / Hurlingham',
    'Karen / Lang\'ata',
    'Kasarani / Roysambu',
    'Ruaka / Two Rivers border',
    'Embakasi / Airport North Rd',
    'South B / South C',
    'Eastleigh / Juja Rd',
    'Lavington / Kileleshwa',
    'Ruaraka / Baba Dogo Industrial',
    'Donholm / Buruburu',
    'Gigiri / Runda',
    'Upper Hill',
    'Dagoretti / Waithaka',
    'Kibra / Ngong Rd',
    'Pangani / Muthaiga'
  ],
  'Kiambu': [
    'Ruiru Bypass & Industrial Park (HQ Base)',
    'Thika Town / Del Monte Zone',
    'Juja HighPoint / Kalimoni',
    'Tatu City Industrial Zone',
    'Membley / Kahawa Sukari',
    'Ruaka / Muchatha',
    'Kiambu Town / Kirigiti',
    'Kikuyu / Zambezi',
    'Limuru / Tigoni Tea Estates',
    'Githunguri',
    'Karuri / Banana',
    'Lari / Kimende',
    'Gatundu Town / Kimunyu',
    'Kahawa Wendani',
    'Witeithie / Mang\'u'
  ],
  'Mombasa': [
    'Nyali / City Mall Zone',
    'Mombasa Island / CBD',
    'Changamwe / Port Industrial Area',
    'Kisauni / Bamburi',
    'Likoni / Shelly Beach',
    'Tudor / Port Reitz',
    'Jomvu / Miritini SGR Hub',
    'Shanzu / Mtwapa border'
  ],
  'Nakuru': [
    'Nakuru CBD / Industrial Area',
    'Naivasha Town / Flower Farm Corridor',
    'Gilgil / Kariandusi',
    'Molo Town',
    'Njoro / Egerton Zone',
    'Bahati / Maili Tisa',
    'Subukia',
    'Mai Mahiu Inland Container Depot',
    'Salgaa Industrial Hub'
  ],
  'Kisumu': [
    'Kisumu City CBD / Main Port',
    'Kondele / Kibos Industrial',
    'Milimani / Riat Hills',
    'Ahero / Rice Irrigation Hub',
    'Muhoroni / Sugar Belt',
    'Maseno University Town',
    'Kisumu West / Otonglo'
  ],
  'Uasin Gishu': [
    'Eldoret CBD / Uganda Rd Corridor',
    'Langas / Kapseret',
    'Kipkaren Industrial Park',
    'Chepkoilel / University Zone',
    'Moiben Agri-Zone',
    'Burnt Forest',
    'Turbo Town'
  ],
  'Machakos': [
    'Athi River EPZ & Cement Hub',
    'Machakos Town CBD',
    'Syokimau / Gateway Mall Area',
    'Mlolongo Industrial Strip',
    'Kangundo / Tala',
    'Matungulu',
    'Mwala / Masii',
    'Kipeto / Lukenya'
  ],
  'Kajiado': [
    'Kitengela Industrial & Residential',
    'Ongata Rongai / Kiserian',
    'Ngong Town / Bulbul',
    'Kajiado Town CBD',
    'Namanga Border Post',
    'Loitokitok Agri-Cold Zone',
    'Isinya Processing Area'
  ],
  'Meru': [
    'Meru Town CBD',
    'Nanyuki / Timau Agri-Cold Corridor',
    'Maua Town',
    'Nkubu Market',
    'Laare',
    'Imenti North / South'
  ],
  'Kilifi': [
    'Kilifi Town / Pwani Zone',
    'Mtwapa Commercial Strip',
    'Malindi Town / Airport Area',
    'Watamu Resort Belt',
    'Mariakani Logistics Depot',
    'Vipingo Ridge Area',
    'Kaloleni'
  ],
  'Kwale': [
    'Diani Beach / Ukunda Hub',
    'Kwale Town CBD',
    'Lunga Lunga Border',
    'Msambweni Hospital Area',
    'Kinango',
    'Shimoni Port Area'
  ],
  'Lamu': [
    'Lamu Port (LAPSSET Hub)',
    'Lamu Island / Shela',
    'Mpeketoni Agri-Zone',
    'Mokowe Mainland HQ',
    'Witu'
  ],
  'Taita-Taveta': [
    'Voi Junction & Logistics Hub',
    'Taveta Border Trade Zone',
    'Wundanyi Town',
    'Mwatate',
    'Mackinnon Road'
  ],
  'Tana River': [
    'Hola Town CBD',
    'Garsen Junction',
    'Bura Irrigation Scheme Area',
    'Madogo'
  ],
  'Murang\'a': [
    'Murang\'a Town CBD',
    'Kenol / Kabati Industrial Hub',
    'Maragua Town',
    'Kangaroo / Mukurwe-ini border',
    'Kangema',
    'Gatanga / Thika West border'
  ],
  'Kirinyaga': [
    'Kerugoya Town CBD',
    'Kutus County HQ',
    'Wang\'uru / Mwea Rice Mills',
    'Sagana Industrial Park',
    'Kagio Market'
  ],
  'Nyandarua': [
    'Ol Kalou County HQ',
    'Njabini / Elephant Hill Zone',
    'Engineer Town',
    'Mairo Inya / Nyahururu border',
    'Miharati'
  ],
  'Nyeri': [
    'Nyeri Town CBD',
    'Karatina Market & Processing Hub',
    'Othaya Town',
    'Mweiga Agri-Cold Zone',
    'Mukurwe-ini',
    'Naro Moru'
  ],
  'Trans-Nzoia': [
    'Kitale Town CBD & Seed Depot',
    'Endebess Agri-Processing',
    'Kiminini',
    'Saboti',
    'Cherangany'
  ],
  'Kericho': [
    'Kericho Town CBD / Tea Processing Zone',
    'Litein Market',
    'Kipkelion',
    'Londiani',
    'Sotik border'
  ],
  'Bomet': [
    'Bomet Town CBD',
    'Sotik Town',
    'Longisa',
    'Mulot Market Area',
    'Chepalungu'
  ],
  'Narok': [
    'Narok Town CBD',
    'Kilgoris Town',
    'Maasai Mara Gate Area',
    'Nairagie Enkare',
    'Suswa Energy Corridor'
  ],
  'Laikipia': [
    'Nanyuki Town CBD & Military Zone',
    'Nyahururu Town',
    'Rumuruti County HQ',
    'Kinamba',
    'Doldol'
  ],
  'Baringo': [
    'Kabarnet Town CBD',
    'Marigat Junction',
    'Eldama Ravine',
    'Mogotio Processing Hub',
    'Chemochei'
  ],
  'Elgeyo-Marakwet': [
    'Iten High Altitude Hub',
    'Kapsowar',
    'Tambach',
    'Flourspar / Chepkorio'
  ],
  'Nandi': [
    'Kapsabet Town CBD',
    'Nandi Hills Tea Processing',
    'Mosoriot',
    'Chepterwai',
    'Kabiyet'
  ],
  'Samburu': [
    'Maralal Town CBD',
    'Baragoi',
    'Wamba',
    'Archer\'s Post'
  ],
  'Siaya': [
    'Siaya Town CBD',
    'Bondo Town / Fish Processing',
    'Ugunja Market',
    'Yala Town',
    'Usenge Beach',
    'Ugenya'
  ],
  'Homa Bay': [
    'Homa Bay Town CBD & Lake Port',
    'Mbita Point / Rusinga',
    'Oyugis Town',
    'Kendu Bay',
    'Ndhiwa Sugar Zone'
  ],
  'Migori': [
    'Migori Town CBD',
    'Isebania Border Post',
    'Rongo University Town',
    'Awendo Sugar Belt',
    'Kehancha',
    'Kuria West'
  ],
  'Kisii': [
    'Kisii Town CBD / Highland Hub',
    'Ogembo Market',
    'Suneka Airport Zone',
    'Keroka border',
    'Tabaka Soapstone Zone',
    'Nyamache'
  ],
  'Nyamira': [
    'Nyamira Town CBD',
    'Nyyamaiya',
    'Keroka Market Hub',
    'Ekerenyo',
    'Manga'
  ],
  'Embu': [
    'Embu Town CBD',
    'Runyenjes Market',
    'Siakago',
    'Ishara',
    'Manyatta Coffee Belt'
  ],
  'Tharaka-Nithi': [
    'Chuka Town & University Area',
    'Kathwana County HQ',
    'Marimanti',
    'Chogoria Hospital Zone'
  ],
  'Isiolo': [
    'Isiolo Town CBD (LAPSSET Hub)',
    'Garbatulla',
    'Merti',
    'Oldonyiro'
  ],
  'Bungoma': [
    'Bungoma Town CBD',
    'Webuye Heavy Industry Zone',
    'Kimilili Market',
    'Malaba Border Corridor',
    'Sirisia',
    'Chwele Market'
  ],
  'Busia': [
    'Busia Border Post CBD',
    'Malaba Border Customs Depot',
    'Nambale',
    'Port Victoria Fish Cold Storage',
    'Funyula',
    'Butula'
  ],
  'Vihiga': [
    'Mbale Town CBD',
    'Chavakali Junction',
    'Luanda Wholesale Market',
    'Hamisi',
    'Majengo'
  ],
  'West Pokot': [
    'Kapenguria Town CBD',
    'Makutano Market',
    'Ortum Cement Zone',
    'Sigor',
    'Chepareria'
  ],
  'Turkana': [
    'Lodwar Town CBD & Oil Hub',
    'Kakuma Trade Center',
    'Lokichogio Border',
    'Lokichar Basin',
    'Kalokol Lake Zone'
  ],
  'Wajir': [
    'Wajir Town CBD & Airport Base',
    'Habaswein',
    'Tarbaj',
    'Eldas',
    'Buna'
  ],
  'Mandera': [
    'Mandera Town CBD & Border Gate',
    'Elwak Trade Hub',
    'Rhamu',
    'Lafey',
    'Banissa'
  ],
  'Marsabit': [
    'Marsabit Town CBD',
    'Moyale Border Customs Hub',
    'Laisamis',
    'North Horr',
    'Sololo'
  ],
  'Kitui': [
    'Kitui Town CBD',
    'Mwingi Town Market',
    'Mutomo Mining Zone',
    'Kwa Vonza',
    'Kabati'
  ],
  'Makueni': [
    'Wote Town CBD',
    'Emali SGR & Highway Junction',
    'Sultan Hamud',
    'Kibwezi Agri-Cold Zone',
    'Mtito Andei Transit Base',
    'Makindu'
  ],
  'Garissa': [
    'Garissa Town CBD',
    'Dadaab Commercial Hub',
    'Masalani',
    'Bura East',
    'Modogashe'
  ],
  'Kakamega': [
    'Kakamega Town CBD & University Area',
    'Mumias Sugar Industry Zone',
    'Malava Market',
    'Butere Town',
    'Lugari processing Hub',
    'Khwisero'
  ]
};

export function getTownsForCounty(countyName: string): string[] {
  if (!countyName || countyName === 'All' || countyName === 'All 47 Counties') {
    return ['Ruiru HQ', 'Thika', 'Westlands', 'Embu', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru', 'Garissa', 'Malindi', 'Machakos', 'Kakamega', 'Kisii', 'Kitale'];
  }

  const normalized = countyName.trim().toLowerCase().replace(/['’\-_\s]+/g, '');
  const matchKey = Object.keys(COUNTY_TOWNS_MAP).find(
    (k) => k.toLowerCase().replace(/['’\-_\s]+/g, '') === normalized
  );

  if (matchKey && COUNTY_TOWNS_MAP[matchKey]) {
    return COUNTY_TOWNS_MAP[matchKey];
  }

  // Fallback default towns
  return [
    `${countyName} Central Town`,
    `${countyName} Industrial Zone`,
    `${countyName} Market Centre`,
    `${countyName} Suburbs`
  ];
}

export function getAreaCoords(
  countyName: string,
  townName?: string
): { lat: number; lng: number; hubName: string } {
  const countyBase = getCountyCoords(countyName);
  
  if (!townName) {
    return countyBase;
  }

  // Generate deterministic subtle micro offset for town pin visualization
  let hash = 0;
  for (let i = 0; i < townName.length; i++) {
    hash = townName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash % 100) / 1000) * 0.15; // ~1-3km offset
  const lngOffset = (((hash >> 3) % 100) / 1000) * 0.15;

  return {
    lat: countyBase.lat + latOffset,
    lng: countyBase.lng + lngOffset,
    hubName: countyBase.hubName
  };
}
