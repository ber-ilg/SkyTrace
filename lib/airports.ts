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
  // Major International Hubs
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
  
  // US Airports
  'EWR': { code: 'EWR', city: 'Newark', country: 'United States', lat: 40.6895, lng: -74.1745 },
  'LGA': { code: 'LGA', city: 'New York', country: 'United States', lat: 40.7769, lng: -73.8740 },
  'BOS': { code: 'BOS', city: 'Boston', country: 'United States', lat: 42.3656, lng: -71.0096 },
  'IAH': { code: 'IAH', city: 'Houston', country: 'United States', lat: 29.9902, lng: -95.3368 },
  'MIA': { code: 'MIA', city: 'Miami', country: 'United States', lat: 25.7959, lng: -80.2870 },
  'PHX': { code: 'PHX', city: 'Phoenix', country: 'United States', lat: 33.4352, lng: -112.0101 },
  'IAD': { code: 'IAD', city: 'Washington', country: 'United States', lat: 38.9531, lng: -77.4565 },
  'SEA': { code: 'SEA', city: 'Seattle', country: 'United States', lat: 47.4502, lng: -122.3088 },
  'LAS': { code: 'LAS', city: 'Las Vegas', country: 'United States', lat: 36.0840, lng: -115.1537 },
  'MCO': { code: 'MCO', city: 'Orlando', country: 'United States', lat: 28.4312, lng: -81.3081 },
  'DTW': { code: 'DTW', city: 'Detroit', country: 'United States', lat: 42.2162, lng: -83.3554 },
  'PHL': { code: 'PHL', city: 'Philadelphia', country: 'United States', lat: 39.8744, lng: -75.2424 },
  'MSP': { code: 'MSP', city: 'Minneapolis', country: 'United States', lat: 44.8848, lng: -93.2223 },
  'BWI': { code: 'BWI', city: 'Baltimore', country: 'United States', lat: 39.1774, lng: -76.6684 },
  'SLC': { code: 'SLC', city: 'Salt Lake City', country: 'United States', lat: 40.7899, lng: -111.9791 },
  'SAN': { code: 'SAN', city: 'San Diego', country: 'United States', lat: 32.7336, lng: -117.1897 },
  'TPA': { code: 'TPA', city: 'Tampa', country: 'United States', lat: 27.9755, lng: -82.5332 },
  'PDX': { code: 'PDX', city: 'Portland', country: 'United States', lat: 45.5898, lng: -122.5951 },
  'HNL': { code: 'HNL', city: 'Honolulu', country: 'United States', lat: 21.3187, lng: -157.9225 },
  
  // European Airports
  'MAD': { code: 'MAD', city: 'Madrid', country: 'Spain', lat: 40.4719, lng: -3.5626 },
  'BCN': { code: 'BCN', city: 'Barcelona', country: 'Spain', lat: 41.2974, lng: 2.0833 },
  'FCO': { code: 'FCO', city: 'Rome', country: 'Italy', lat: 41.7999, lng: 12.2462 },
  'MXP': { code: 'MXP', city: 'Milan', country: 'Italy', lat: 45.6306, lng: 8.7281 },
  'MUC': { code: 'MUC', city: 'Munich', country: 'Germany', lat: 48.3537, lng: 11.7750 },
  'ZRH': { code: 'ZRH', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lng: 8.5492 },
  'VIE': { code: 'VIE', city: 'Vienna', country: 'Austria', lat: 48.1103, lng: 16.5697 },
  'BRU': { code: 'BRU', city: 'Brussels', country: 'Belgium', lat: 50.9008, lng: 4.4856 },
  'CPH': { code: 'CPH', city: 'Copenhagen', country: 'Denmark', lat: 55.6180, lng: 12.6508 },
  'OSL': { code: 'OSL', city: 'Oslo', country: 'Norway', lat: 60.1939, lng: 11.1004 },
  'ARN': { code: 'ARN', city: 'Stockholm', country: 'Sweden', lat: 59.6498, lng: 17.9238 },
  'DUB': { code: 'DUB', city: 'Dublin', country: 'Ireland', lat: 53.4264, lng: -6.2499 },
  'LGW': { code: 'LGW', city: 'London', country: 'United Kingdom', lat: 51.1537, lng: -0.1821 },
  'MAN': { code: 'MAN', city: 'Manchester', country: 'United Kingdom', lat: 53.3587, lng: -2.2730 },
  'LIS': { code: 'LIS', city: 'Lisbon', country: 'Portugal', lat: 38.7742, lng: -9.1342 },
  'ATH': { code: 'ATH', city: 'Athens', country: 'Greece', lat: 37.9364, lng: 23.9484 },
  
  // Asian Airports
  'PVG': { code: 'PVG', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083 },
  'PEK': { code: 'PEK', city: 'Beijing', country: 'China', lat: 40.0801, lng: 116.5846 },
  'CAN': { code: 'CAN', city: 'Guangzhou', country: 'China', lat: 23.3924, lng: 113.2988 },
  'KUL': { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7099 },
  'CGK': { code: 'CGK', city: 'Jakarta', country: 'Indonesia', lat: -6.1255, lng: 106.6560 },
  'MNL': { code: 'MNL', city: 'Manila', country: 'Philippines', lat: 14.5086, lng: 121.0194 },
  'DEL': { code: 'DEL', city: 'New Delhi', country: 'India', lat: 28.5562, lng: 77.1000 },
  'BOM': { code: 'BOM', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656 },
  'TPE': { code: 'TPE', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lng: 121.2342 },
  'HND': { code: 'HND', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798 },
  'KIX': { code: 'KIX', city: 'Osaka', country: 'Japan', lat: 34.4347, lng: 135.2441 },
  
  // Middle East
  'DOH': { code: 'DOH', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6080 },
  'AUH': { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4330, lng: 54.6511 },
  'CAI': { code: 'CAI', city: 'Cairo', country: 'Egypt', lat: 30.1219, lng: 31.4056 },
  'TLV': { code: 'TLV', city: 'Tel Aviv', country: 'Israel', lat: 32.0114, lng: 34.8867 },
  
  // Turkey
  'SAW': { code: 'SAW', city: 'Istanbul', country: 'Turkey', lat: 40.8986, lng: 29.3092 },
  'AYT': { code: 'AYT', city: 'Antalya', country: 'Turkey', lat: 36.8987, lng: 30.8005 },
  'ESB': { code: 'ESB', city: 'Ankara', country: 'Turkey', lat: 40.1281, lng: 32.9951 },
  
  // Thailand
  'DMK': { code: 'DMK', city: 'Bangkok', country: 'Thailand', lat: 13.9126, lng: 100.6067 },
  'CNX': { code: 'CNX', city: 'Chiang Mai', country: 'Thailand', lat: 18.7668, lng: 98.9629 },
  'HKT': { code: 'HKT', city: 'Phuket', country: 'Thailand', lat: 8.1132, lng: 98.3169 },
  
  // Other
  'GRU': { code: 'GRU', city: 'Sao Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731 },
  'MEX': { code: 'MEX', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lng: -99.0721 },
  'YVR': { code: 'YVR', city: 'Vancouver', country: 'Canada', lat: 49.1967, lng: -123.1815 },
  'JNB': { code: 'JNB', city: 'Johannesburg', country: 'South Africa', lat: -26.1392, lng: 28.2460 },
};

export function isValidIataCode(code: string): boolean {
  return VALID_IATA_CODES.has(code.toUpperCase());
}

export function getAirportInfo(code: string): AirportInfo | null {
  return AIRPORT_DATA[code.toUpperCase()] || null;
}
