import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';
import { extractFlightFromEmailImproved } from '@/lib/flight-extractor-improved';
import { extractFlightWithGemini } from '@/lib/gemini-extractor';
import { getAirportInfo } from '@/lib/airports';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('User creation error:', userError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const userId = userData.id;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Update sync status to in_progress
    await supabase
      .from('email_sync_status')
      .upsert({
        user_id: userId,
        sync_status: 'in_progress',
        last_sync_at: new Date().toISOString(),
      });

    // Search for flight-related emails in the last 2 years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const afterDate = Math.floor(twoYearsAgo.getTime() / 1000);

    const query = `(flight OR booking OR confirmation OR itinerary) after:${afterDate}`;
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100, // Start with 100 for MVP
    });

    const messages = response.data.messages || [];
    let emailsScanned = 0;
    let flightsFound = 0;

    for (const message of messages) {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      emailsScanned++;

      const payload = fullMessage.data.payload;
      const headers = payload?.headers || [];
      
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      
      // Get body (simplified - would need better parsing for complex emails)
      let body = '';
      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload?.parts) {
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      // Hybrid extraction: Try improved regex first
      let flightData = extractFlightFromEmailImproved(subject, body);
      
      // If regex failed, try Gemini AI (if API key is configured)
      if (!flightData || !flightData.departureAirport || !flightData.arrivalAirport) {
        const geminiData = await extractFlightWithGemini(subject, body);
        if (geminiData && geminiData.departureAirport && geminiData.arrivalAirport) {
          flightData = {
            confirmationCode: geminiData.confirmationCode,
            airline: geminiData.airline,
            flightNumber: geminiData.flightNumber,
            departureAirport: geminiData.departureAirport,
            arrivalAirport: geminiData.arrivalAirport,
            departureDate: geminiData.departureDate ? new Date(geminiData.departureDate) : undefined,
            arrivalDate: geminiData.arrivalDate ? new Date(geminiData.arrivalDate) : undefined,
          };
        }
      }
      
      if (flightData && flightData.departureAirport && flightData.arrivalAirport) {
        // Enrich with airport data
        const depData = getAirportInfo(flightData.departureAirport);
        const arrData = getAirportInfo(flightData.arrivalAirport);

        // Insert into database
        const { error: insertError } = await supabase.from('flights').insert({
          user_id: userId,
          confirmation_code: flightData.confirmationCode,
          airline: flightData.airline,
          flight_number: flightData.flightNumber,
          departure_airport: flightData.departureAirport,
          departure_city: depData?.city,
          departure_country: depData?.country,
          departure_lat: depData?.lat,
          departure_lng: depData?.lng,
          departure_date: flightData.departureDate?.toISOString(),
          arrival_airport: flightData.arrivalAirport,
          arrival_city: arrData?.city,
          arrival_country: arrData?.country,
          arrival_lat: arrData?.lat,
          arrival_lng: arrData?.lng,
          arrival_date: flightData.arrivalDate?.toISOString(),
          raw_email_subject: subject,
        });

        if (insertError) {
          console.error('Flight insert error:', insertError);
        } else {
          flightsFound++;
        }
      }
    }

    // Update sync status to completed
    await supabase
      .from('email_sync_status')
      .upsert({
        user_id: userId,
        sync_status: 'completed',
        emails_scanned: emailsScanned,
        flights_found: flightsFound,
        last_sync_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      emailsScanned,
      flightsFound,
    });
  } catch (error: any) {
    console.error('Gmail scan error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to scan emails' },
      { status: 500 }
    );
  }
}
