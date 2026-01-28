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

// Common airline names for detection (order matters - check longer names first)
const AIRLINES = [
  'American Airlines', 'United Airlines', 'Delta Air Lines', 'Delta', 'Southwest Airlines', 'Southwest',
  'JetBlue Airways', 'JetBlue', 'Alaska Airlines', 'Spirit Airlines', 'Frontier Airlines',
  'British Airways', 'Lufthansa', 'Air France', 'KLM Royal Dutch Airlines', 'KLM',
  'Emirates', 'Qatar Airways', 'Turkish Airlines', 'Etihad Airways', 'Etihad',
  'Virgin Atlantic', 'Virgin America', 'Iberia', 'Ryanair', 'easyJet',
  'Air Canada', 'WestJet', 'Qantas', 'Virgin Australia',
  'Singapore Airlines', 'Cathay Pacific', 'ANA', 'All Nippon Airways', 'Japan Airlines', 'JAL',
  'Thai Airways', 'Bangkok Airways', 'Thai Smile', 'Air Asia', 'AirAsia',
  'Malaysia Airlines', 'Garuda Indonesia', 'EVA Air', 'China Airlines',
  'Air China', 'China Eastern', 'China Southern', 'Hainan Airlines',
  'Korean Air', 'Asiana Airlines', 'Hawaiian Airlines', 'Air New Zealand',
  'South African Airways', 'Ethiopian Airlines', 'Kenya Airways', 'Egypt Air',
  'Avianca', 'LATAM', 'Copa Airlines', 'Aeromexico', 'Volaris', 'Interjet',
  'Norwegian', 'Wizz Air', 'Vueling', 'TAP Air Portugal', 'Alitalia', 'ITA Airways', 'Swiss', 'Austrian Airlines',
  'SAS', 'Finnair', 'Icelandair', 'Aer Lingus', 'LOT Polish Airlines',
];

const CONFIRMATION_PATTERNS = [
  /confirmation\s*(?:code|number)?:?\s*([A-Z0-9]{5,8})/i,
  /booking\s*(?:reference|code)?:?\s*([A-Z0-9]{5,8})/i,
  /PNR:?\s*([A-Z0-9]{5,8})/i,
  /record\s*locator:?\s*([A-Z0-9]{5,8})/i,
  /reservation\s*(?:code|number)?:?\s*([A-Z0-9]{5,8})/i,
  /ref(?:erence)?:?\s*([A-Z0-9]{5,8})/i,
  /ticket\s*(?:number)?:?\s*([A-Z0-9]{5,8})/i,
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
  const lowerText = text.toLowerCase();
  
  // MUST have one of these (actual booking confirmation indicators)
  const mustHave = [
    'booking confirmation',
    'flight confirmation', 
    'ticket confirmation',
    'your booking',
    'itinerary',
    'e-ticket',
    'eticket',
    'travel confirmation',
    'reservation confirmed',
    'booking reference',
    'pnr',
    'record locator',
    'boarding pass',
    'ticket receipt',
    'flight receipt',
  ];
  
  // REJECT if it has any of these (check-in reminders, marketing, etc.)
  const rejectIf = [
    'check-in now',
    'online check-in',
    'check in online',
    'checking in',
    'web check-in',
    'mobile check-in',
    'newsletter',
    'special offer',
    'sale',
    'discount',
    'subscribe',
    'unsubscribe',
    'promotional',
    'advertisement',
  ];
  
  // Check for rejection keywords first
  if (rejectIf.some(keyword => lowerText.includes(keyword))) {
    return false;
  }
  
  // Must have at least one confirmation keyword
  return mustHave.some(keyword => lowerText.includes(keyword));
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
