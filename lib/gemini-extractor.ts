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
Extract flight information from this email. Return ONLY a JSON object with these fields (use null if not found):
- confirmationCode: booking reference/PNR (string)
- airline: airline name (string)
- flightNumber: flight number including airline code (string)
- departureAirport: 3-letter IATA code (string, uppercase)
- arrivalAirport: 3-letter IATA code (string, uppercase)
- departureDate: ISO date string YYYY-MM-DD (string)
- arrivalDate: ISO date string YYYY-MM-DD (string)

Email Subject: ${subject}

Email Body:
${body.slice(0, 2000)}

Return ONLY valid JSON, no markdown, no explanations.
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
    
    // Validate that we got at least airports
    if (flightData.departureAirport && flightData.arrivalAirport) {
      return flightData;
    }

    return null;
  } catch (error) {
    console.error('Gemini extraction error:', error);
    return null;
  }
}
