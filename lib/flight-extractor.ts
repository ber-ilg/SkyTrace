// Flight information extraction from emails
// MVP: Simple regex patterns for common flight confirmation formats

interface ExtractedFlight {
  confirmationCode?: string;
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureDate?: Date;
  arrivalDate?: Date;
}

const AIRPORT_CODE_REGEX = /\b([A-Z]{3})\b/g;
const FLIGHT_NUMBER_REGEX = /\b([A-Z]{2}|[A-Z][0-9]|[0-9][A-Z])\s*(\d{1,4})\b/g;
const CONFIRMATION_REGEX = /confirmation\s*(?:code|number)?:?\s*([A-Z0-9]{5,8})/i;

// Common airline keywords for detection
const AIRLINES = [
  'American Airlines', 'Delta', 'United', 'Southwest', 'JetBlue',
  'British Airways', 'Lufthansa', 'Air France', 'Emirates', 'Qatar Airways',
  'Turkish Airlines', 'KLM', 'Ryanair', 'easyJet', 'Virgin Atlantic'
];

export function extractFlightFromEmail(
  subject: string,
  body: string
): ExtractedFlight | null {
  const text = `${subject}\n${body}`;
  
  // Check if this looks like a flight confirmation
  if (!isFlightEmail(text)) {
    return null;
  }
  
  const flight: ExtractedFlight = {};
  
  // Extract confirmation code
  const confMatch = text.match(CONFIRMATION_REGEX);
  if (confMatch) {
    flight.confirmationCode = confMatch[1];
  }
  
  // Extract airline
  for (const airline of AIRLINES) {
    if (text.includes(airline)) {
      flight.airline = airline;
      break;
    }
  }
  
  // Extract airport codes (first two are usually departure and arrival)
  const airportMatches = text.match(AIRPORT_CODE_REGEX);
  if (airportMatches && airportMatches.length >= 2) {
    flight.departureAirport = airportMatches[0];
    flight.arrivalAirport = airportMatches[1];
  }
  
  // Extract flight number
  const flightMatch = text.match(FLIGHT_NUMBER_REGEX);
  if (flightMatch) {
    flight.flightNumber = `${flightMatch[1]}${flightMatch[2]}`;
  }
  
  // Only return if we found at least departure and arrival airports
  if (flight.departureAirport && flight.arrivalAirport) {
    return flight;
  }
  
  return null;
}

function isFlightEmail(text: string): boolean {
  const keywords = [
    'flight confirmation',
    'booking confirmation',
    'itinerary',
    'boarding pass',
    'check-in',
    'departure',
    'arrival'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

// Airport data lookup (we'll use an API for this later, hardcode some common ones for MVP)
const AIRPORT_DATA: Record<string, { city: string; country: string; lat: number; lng: number }> = {
  'LHR': { city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543 },
  'JFK': { city: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781 },
  'LAX': { city: 'Los Angeles', country: 'United States', lat: 33.9416, lng: -118.4085 },
  'DXB': { city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lng: 55.3657 },
  'CDG': { city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  'BKK': { city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
  'IST': { city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519 },
  'SFO': { city: 'San Francisco', country: 'United States', lat: 37.6213, lng: -122.3790 },
  // Add more as needed...
};

export function getAirportData(code: string) {
  return AIRPORT_DATA[code] || null;
}
