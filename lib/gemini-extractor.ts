// Google Gemini AI-powered flight extraction (fallback)

interface GeminiFlightData {
  confirmationCode?: string;
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureDate?: string;
  arrivalDate?: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function extractFlightWithGemini(
  subject: string,
  body: string
): Promise<GeminiFlightData | null> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured, skipping AI extraction');
    return null;
  }

  const prompt = `
You are a flight information extraction system. Extract flight booking details from this email.

IMPORTANT RULES:
1. ONLY extract if this is a flight BOOKING CONFIRMATION (not check-in reminders, marketing, or newsletters)
2. Flight number is MANDATORY - if no flight number exists, return null for ALL fields
3. Airport codes must be exactly 3 uppercase letters (IATA codes)
4. Dates must be in YYYY-MM-DD format
5. Return ONLY valid JSON - no markdown, no explanations, no commentary

Fields to extract (use null if not found):
- confirmationCode: booking reference/PNR/record locator (string)
- airline: full airline name (string)
- flightNumber: flight number with airline code, e.g., "AA123" or "BA456" (string)
- departureAirport: 3-letter IATA code (string, uppercase)
- arrivalAirport: 3-letter IATA code (string, uppercase)
- departureDate: departure date in YYYY-MM-DD format (string)
- arrivalDate: arrival date in YYYY-MM-DD format (string)

Email Subject: ${subject}

Email Body (first 3000 chars):
${body.slice(0, 3000)}

Return ONLY valid JSON. Example:
{"confirmationCode":"ABC123","airline":"British Airways","flightNumber":"BA456","departureAirport":"LHR","arrivalAirport":"JFK","departureDate":"2024-06-15","arrivalDate":"2024-06-15"}

If this is NOT a flight booking confirmation email, return: {"error":"not_a_flight_booking"}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return null;
    }

    // Parse JSON from response (strip markdown if present)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const flightData: GeminiFlightData = JSON.parse(jsonMatch[0]);
    
    // Check if Gemini explicitly marked this as not a flight booking
    if ('error' in flightData) {
      return null;
    }
    
    // Validate that we got at least airports AND flight number (mandatory)
    if (flightData.departureAirport && flightData.arrivalAirport && flightData.flightNumber) {
      return flightData;
    }

    return null;
  } catch (error) {
    console.error('Gemini extraction error:', error);
    return null;
  }
}
