// Improved flight extraction with IATA validation
import { isValidIataCode, getAirportInfo } from './airports';

interface ExtractedFlight {
  confirmationCode?: string;
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureDate?: Date;
  arrivalDate?: Date;
}

// Common airline names for detection
const AIRLINES = [
  'American Airlines', 'Delta', 'United', 'Southwest', 'JetBlue', 'Alaska Airlines',
  'British Airways', 'Lufthansa', 'Air France', 'KLM', 'Emirates', 'Qatar Airways',
  'Turkish Airlines', 'Etihad', 'Virgin Atlantic', 'Iberia', 'Ryanair', 'easyJet',
  'Air Canada', 'Qantas', 'Singapore Airlines', 'Cathay Pacific', 'ANA', 'JAL',
  'Thai Airways', 'Malaysia Airlines', 'Garuda Indonesia', 'Air Asia',
];

const CONFIRMATION_PATTERNS = [
  /confirmation\s*(?:code|number)?:?\s*([A-Z0-9]{5,8})/i,
  /booking\s*(?:reference|code)?:?\s*([A-Z0-9]{5,8})/i,
  /PNR:?\s*([A-Z0-9]{5,8})/i,
];

// Flight number patterns (airline code + number)
const FLIGHT_NUMBER_PATTERN = /\b([A-Z]{2})\s*(\d{1,4})\b/g;

// Date patterns
const DATE_PATTERNS = [
  // 2024-01-28, 2024/01/28
  /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
  // 28 Jan 2024, 28 January 2024
  /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
  // January 28, 2024
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
];

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function extractFlightFromEmailImproved(
  subject: string,
  body: string
): ExtractedFlight | null {
  const text = `${subject}\n${body}`;
  
  // Check if this looks like a flight email
  if (!isFlightEmail(text)) {
    return null;
  }
  
  const flight: ExtractedFlight = {};
  
  // Extract confirmation code
  for (const pattern of CONFIRMATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      flight.confirmationCode = match[1];
      break;
    }
  }
  
  // Extract airline
  for (const airline of AIRLINES) {
    if (text.includes(airline)) {
      flight.airline = airline;
      break;
    }
  }
  
  // Extract flight number
  const flightMatches = Array.from(text.matchAll(FLIGHT_NUMBER_PATTERN));
  if (flightMatches.length > 0) {
    const match = flightMatches[0];
    flight.flightNumber = `${match[1]}${match[2]}`;
  }
  
  // Extract airport codes (validate with IATA list)
  const airportCodes = extractAirportCodes(text);
  if (airportCodes.length >= 2) {
    flight.departureAirport = airportCodes[0];
    flight.arrivalAirport = airportCodes[1];
  }
  
  // Extract dates
  const dates = extractDates(text);
  if (dates.length > 0) {
    flight.departureDate = dates[0];
    if (dates.length > 1) {
      flight.arrivalDate = dates[1];
    }
  }
  
  // Only return if we found at least airports
  if (flight.departureAirport && flight.arrivalAirport) {
    return flight;
  }
  
  return null;
}

function isFlightEmail(text: string): boolean {
  const keywords = [
    'flight', 'booking', 'itinerary', 'boarding pass', 
    'confirmation', 'departure', 'arrival', 'check-in',
    'airline', 'airport', 'passenger'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

function extractAirportCodes(text: string): string[] {
  // Find all 3-letter uppercase codes
  const potentialCodes = text.match(/\b[A-Z]{3}\b/g) || [];
  
  // Filter to only valid IATA codes
  const validCodes = potentialCodes.filter(code => isValidIataCode(code));
  
  // Remove duplicates while preserving order
  return [...new Set(validCodes)];
}

function extractDates(text: string): Date[] {
  const dates: Date[] = [];
  
  for (const pattern of DATE_PATTERNS) {
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    
    for (const match of matches) {
      let date: Date | null = null;
      
      if (pattern === DATE_PATTERNS[0]) {
        // YYYY-MM-DD or YYYY/MM/DD
        const [_, year, month, day] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (pattern === DATE_PATTERNS[1]) {
        // DD Mon YYYY
        const [_, day, monthStr, year] = match;
        const month = MONTH_MAP[monthStr.toLowerCase().slice(0, 3)];
        if (month !== undefined) {
          date = new Date(parseInt(year), month, parseInt(day));
        }
      } else if (pattern === DATE_PATTERNS[2]) {
        // Mon DD, YYYY
        const [_, monthStr, day, year] = match;
        const month = MONTH_MAP[monthStr.toLowerCase().slice(0, 3)];
        if (month !== undefined) {
          date = new Date(parseInt(year), month, parseInt(day));
        }
      }
      
      if (date && !isNaN(date.getTime())) {
        dates.push(date);
      }
    }
  }
  
  return dates;
}
