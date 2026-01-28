// Common IATA airport codes for validation
// This is a subset - full list would be ~9000 codes
export const VALID_IATA_CODES = new Set([
  // Major International Hubs
  'LHR', 'JFK', 'LAX', 'ORD', 'DXB', 'CDG', 'AMS', 'FRA', 'IST', 'SIN',
  'HKG', 'NRT', 'ICN', 'PEK', 'PVG', 'CAN', 'SYD', 'MEL', 'YYZ', 'YVR',
  
  // US Major Airports
  'ATL', 'DFW', 'DEN', 'SFO', 'SEA', 'LAS', 'MCO', 'EWR', 'BOS', 'IAH',
  'MIA', 'PHX', 'IAD', 'MSP', 'DTW', 'PHL', 'LGA', 'BWI', 'MDW', 'SLC',
  'SAN', 'TPA', 'PDX', 'STL', 'HNL', 'AUS', 'BNA', 'OAK', 'RDU', 'SMF',
  
  // European Major Airports
  'MAD', 'BCN', 'FCO', 'MXP', 'VCE', 'MUC', 'ZRH', 'VIE', 'BRU', 'CPH',
  'OSL', 'ARN', 'HEL', 'WAW', 'PRG', 'BUD', 'ATH', 'LIS', 'OPO', 'DUB',
  'MAN', 'EDI', 'GLA', 'LGW', 'STN', 'LTN', 'BHX', 'NCL',
  
  // Asian Major Airports
  'BKK', 'KUL', 'CGK', 'MNL', 'HAN', 'SGN', 'DEL', 'BOM', 'BLR', 'HYD',
  'TPE', 'KHH', 'OSA', 'NGO', 'FUK', 'CTU', 'XIY', 'WUH', 'SZX', 'SHA',
  
  // Middle East
  'DOH', 'AUH', 'KWI', 'RUH', 'JED', 'CAI', 'AMM', 'BEY', 'TLV',
  
  // Latin America
  'GRU', 'GIG', 'EZE', 'SCL', 'LIM', 'BOG', 'MEX', 'PTY', 'UIO',
  
  // Africa
  'JNB', 'CPT', 'NBO', 'ADD', 'LOS', 'ACC', 'CMN', 'TUN',
  
  // Oceania
  'AKL', 'CHC', 'WLG', 'BNE', 'PER', 'ADL',
  
  // Turkey (since user is Turkish)
  'IST', 'SAW', 'AYT', 'ADB', 'ESB', 'DLM', 'BJV', 'TZX', 'ASR',
  
  // Thailand (user grew up there)
  'BKK', 'DMK', 'CNX', 'HKT', 'USM', 'HDY',
]);

export interface AirportInfo {
  code: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

// Extended airport data for common airports
export const AIRPORT_DATA: Record<string, AirportInfo> = {
  'LHR': { code: 'LHR', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543 },
  'JFK': { code: 'JFK', city: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781 },
  'LAX': { code: 'LAX', city: 'Los Angeles', country: 'United States', lat: 33.9416, lng: -118.4085 },
  'DXB': { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lng: 55.3657 },
  'CDG': { code: 'CDG', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  'BKK': { code: 'BKK', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
  'IST': { code: 'IST', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519 },
  'SFO': { code: 'SFO', city: 'San Francisco', country: 'United States', lat: 37.6213, lng: -122.3790 },
  'ORD': { code: 'ORD', city: 'Chicago', country: 'United States', lat: 41.9742, lng: -87.9073 },
  'AMS': { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683 },
  'FRA': { code: 'FRA', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622 },
  'SIN': { code: 'SIN', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
  'HKG': { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lng: 113.9185 },
  'NRT': { code: 'NRT', city: 'Tokyo', country: 'Japan', lat: 35.7653, lng: 140.3863 },
  'ICN': { code: 'ICN', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407 },
  'SYD': { code: 'SYD', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753 },
  'YYZ': { code: 'YYZ', city: 'Toronto', country: 'Canada', lat: 43.6777, lng: -79.6248 },
  'ATL': { code: 'ATL', city: 'Atlanta', country: 'United States', lat: 33.6407, lng: -84.4277 },
  'DFW': { code: 'DFW', city: 'Dallas', country: 'United States', lat: 32.8998, lng: -97.0403 },
  'DEN': { code: 'DEN', city: 'Denver', country: 'United States', lat: 39.8561, lng: -104.6737 },
  // Add more as needed...
};

export function isValidIataCode(code: string): boolean {
  return VALID_IATA_CODES.has(code.toUpperCase());
}

export function getAirportInfo(code: string): AirportInfo | null {
  return AIRPORT_DATA[code.toUpperCase()] || null;
}
