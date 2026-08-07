export interface CountyLocation {
  county: string;
  lat: number;
  lng: number;
  hubName: string;
  region: string;
}

export const KENYA_COUNTY_COORDINATES: Record<string, CountyLocation> = {
  'Nairobi': { county: 'Nairobi', lat: -1.286389, lng: 36.817223, hubName: 'Nairobi Central HQ', region: 'Central' },
  'Kiambu': { county: 'Kiambu', lat: -1.1461, lng: 36.9602, hubName: 'Ruiru Bypass Central HQ', region: 'Central' },
  'Mombasa': { county: 'Mombasa', lat: -4.0435, lng: 39.6682, hubName: 'Mombasa Port Hub', region: 'Coast' },
  'Nakuru': { county: 'Nakuru', lat: -0.3031, lng: 36.0800, hubName: 'Nakuru Industrial Depot', region: 'Rift Valley' },
  'Kisumu': { county: 'Kisumu', lat: -0.0917, lng: 34.7680, hubName: 'Kisumu Lake Basin Depot', region: 'Lake Region' },
  'Nyeri': { county: 'Nyeri', lat: -0.4201, lng: 36.9476, hubName: 'Nyeri Regional Station', region: 'Mt. Kenya' },
  'Kakamega': { county: 'Kakamega', lat: 0.2827, lng: 34.7519, hubName: 'Kakamega Response Unit', region: 'Western' },
  'Garissa': { county: 'Garissa', lat: -0.4532, lng: 39.6460, hubName: 'Garissa North-Eastern Station', region: 'Arid' },
  'Uasin Gishu': { county: 'Uasin Gishu', lat: 0.5143, lng: 35.2698, hubName: 'Eldoret Logistics Hub', region: 'Rift Valley' },
  'Machakos': { county: 'Machakos', lat: -1.5177, lng: 37.2634, hubName: 'Machakos Industrial Hub', region: 'Eastern' },
  'Meru': { county: 'Meru', lat: 0.0463, lng: 37.6559, hubName: 'Meru Agri-Cold Depot', region: 'Mt. Kenya' },
  'Kilifi': { county: 'Kilifi', lat: -3.6307, lng: 39.8499, hubName: 'Kilifi Coast Unit', region: 'Coast' },
  'Kwale': { county: 'Kwale', lat: -4.1737, lng: 39.4521, hubName: 'Ukunda / Kwale Station', region: 'Coast' },
  'Lamu': { county: 'Lamu', lat: -2.2717, lng: 40.9020, hubName: 'Lamu Port Hub', region: 'Coast' },
  'Taita-Taveta': { county: 'Taita-Taveta', lat: -3.3963, lng: 38.5564, hubName: 'Voi Transit Base', region: 'Coast' },
  'Tana River': { county: 'Tana River', lat: -1.5026, lng: 40.0334, hubName: 'Hola Base', region: 'Coast' },
  'Murang\'a': { county: 'Murang\'a', lat: -0.7210, lng: 37.1526, hubName: 'Murang\'a Station', region: 'Central' },
  'Kirinyaga': { county: 'Kirinyaga', lat: -0.5000, lng: 37.2800, hubName: 'Kerugoya Hub', region: 'Central' },
  'Nyandarua': { county: 'Nyandarua', lat: -0.2643, lng: 36.3788, hubName: 'Ol Kalou Base', region: 'Central' },
  'Trans-Nzoia': { county: 'Trans-Nzoia', lat: 1.0157, lng: 35.0062, hubName: 'Kitale Packhouse Depot', region: 'Rift Valley' },
  'Kericho': { county: 'Kericho', lat: -0.3689, lng: 35.2863, hubName: 'Kericho Tea Cold Hub', region: 'Rift Valley' },
  'Bomet': { county: 'Bomet', lat: -0.7813, lng: 35.3416, hubName: 'Bomet Service Unit', region: 'Rift Valley' },
  'Narok': { county: 'Narok', lat: -1.0783, lng: 35.8601, hubName: 'Narok Station', region: 'Rift Valley' },
  'Kajiado': { county: 'Kajiado', lat: -1.8524, lng: 36.7768, hubName: 'Kitengela / Kajiado Base', region: 'Rift Valley' },
  'Laikipia': { county: 'Laikipia', lat: 0.0167, lng: 37.0722, hubName: 'Nanyuki Station', region: 'Rift Valley' },
  'Baringo': { county: 'Baringo', lat: 0.4919, lng: 35.7430, hubName: 'Kabarnet Base', region: 'Rift Valley' },
  'Elgeyo-Marakwet': { county: 'Elgeyo-Marakwet', lat: 0.6703, lng: 35.5081, hubName: 'Iten Station', region: 'Rift Valley' },
  'Nandi': { county: 'Nandi', lat: 0.1833, lng: 35.1000, hubName: 'Kapsabet Station', region: 'Rift Valley' },
  'Samburu': { county: 'Samburu', lat: 1.0968, lng: 36.6980, hubName: 'Maralal Base', region: 'Rift Valley' },
  'Siaya': { county: 'Siaya', lat: 0.0607, lng: 34.2882, hubName: 'Siaya Station', region: 'Lake Region' },
  'Homa Bay': { county: 'Homa Bay', lat: -0.5273, lng: 34.4571, hubName: 'Homa Bay Lake Base', region: 'Lake Region' },
  'Migori': { county: 'Migori', lat: -1.0634, lng: 34.4731, hubName: 'Migori Border Hub', region: 'Lake Region' },
  'Kisii': { county: 'Kisii', lat: -0.6817, lng: 34.7667, hubName: 'Kisii Highland Depot', region: 'Lake Region' },
  'Nyamira': { county: 'Nyamira', lat: -0.5633, lng: 34.9358, hubName: 'Nyamira Base', region: 'Lake Region' },
  'Embu': { county: 'Embu', lat: -0.5341, lng: 37.4571, hubName: 'Embu Station', region: 'Mt. Kenya' },
  'Tharaka-Nithi': { county: 'Tharaka-Nithi', lat: -0.3333, lng: 37.6500, hubName: 'Chuka Station', region: 'Mt. Kenya' },
  'Isiolo': { county: 'Isiolo', lat: 0.3546, lng: 37.5823, hubName: 'Isiolo Logistics Hub', region: 'Arid / North' },
  'Bungoma': { county: 'Bungoma', lat: 0.5635, lng: 34.5606, hubName: 'Bungoma Station', region: 'Western' },
  'Busia': { county: 'Busia', lat: 0.4608, lng: 34.1115, hubName: 'Busia Border Depot', region: 'Western' },
  'Vihiga': { county: 'Vihiga', lat: 0.0805, lng: 34.7226, hubName: 'Mbale Base', region: 'Western' },
  'West Pokot': { county: 'West Pokot', lat: 1.2389, lng: 35.1119, hubName: 'Kapenguria Base', region: 'Western' },
  'Turkana': { county: 'Turkana', lat: 3.1191, lng: 35.5973, hubName: 'Lodwar Base', region: 'Western / North' },
  'Wajir': { county: 'Wajir', lat: 1.7471, lng: 40.0573, hubName: 'Wajir Station', region: 'Arid' },
  'Mandera': { county: 'Mandera', lat: 3.9373, lng: 41.8569, hubName: 'Mandera Station', region: 'Arid' },
  'Marsabit': { county: 'Marsabit', lat: 2.3284, lng: 37.9899, hubName: 'Marsabit Base', region: 'Arid' },
  'Kitui': { county: 'Kitui', lat: -1.3670, lng: 38.0106, hubName: 'Kitui Base', region: 'Eastern' },
  'Makueni': { county: 'Makueni', lat: -1.7808, lng: 37.6288, hubName: 'Wote Station', region: 'Eastern' }
};

export function getCountyCoords(countyName: string): { lat: number; lng: number; hubName: string } {
  const normalized = (countyName || '').trim();
  const match = Object.keys(KENYA_COUNTY_COORDINATES).find(
    (key) => key.toLowerCase() === normalized.toLowerCase()
  );

  if (match && KENYA_COUNTY_COORDINATES[match]) {
    const loc = KENYA_COUNTY_COORDINATES[match];
    return { lat: loc.lat, lng: loc.lng, hubName: loc.hubName };
  }

  // Default fallback to Ruiru HQ / Nairobi
  return { lat: -1.1461, lng: 36.9602, hubName: 'Ruiru HQ Central' };
}
