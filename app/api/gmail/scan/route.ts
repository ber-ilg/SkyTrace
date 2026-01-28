import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';
import { extractFlightFromEmailImproved } from '@/lib/flight-extractor-improved';
import { extractFlightWithGemini } from '@/lib/gemini-extractor';
import { getAirportInfo } from '@/lib/airports';
import { extractTextFromPdfBase64 } from '@/lib/pdf-extractor';
import { ScanLogger } from '@/lib/scan-logger';

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
    // More specific query to avoid check-in reminders and marketing
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const afterDate = Math.floor(twoYearsAgo.getTime() / 1000);

    // Expanded search keywords for better coverage
    const query = `("booking confirmation" OR "flight confirmation" OR "itinerary" OR "e-ticket" OR "ticket confirmation" OR "travel confirmation" OR "reservation confirmed" OR "your flight" OR "booking reference" OR "PNR" OR "boarding pass") -"check-in now" -"web check-in" after:${afterDate}`;
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 500, // Increased from 100 → 500 for broader scan
    });

    const messages = response.data.messages || [];
    let emailsScanned = 0;
    let flightsFound = 0;
    const logger = new ScanLogger();
    
    // Track PNRs to prevent duplicates within the same scan
    const seenPnrs = new Set<string>();

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
      const from = headers.find(h => h.name === 'From')?.value || '';
      const dateHeader = headers.find(h => h.name === 'Date')?.value || '';
      
      // Enhanced body extraction: try text/plain, then text/html, then nested parts
      let body = '';
      
      const extractBody = (parts: any[]): string => {
        for (const part of parts) {
          // Recursive check for nested parts
          if (part.parts) {
            const nested = extractBody(part.parts);
            if (nested) return nested;
          }
          
          // Try text/plain first (cleanest)
          if (part.mimeType === 'text/plain' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
        
        // Fallback to HTML if no plain text found
        for (const part of parts) {
          if (part.mimeType === 'text/html' && part.body?.data) {
            const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
            // Strip HTML tags for basic text extraction
            return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
          }
        }
        
        return '';
      };
      
      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload?.parts) {
        body = extractBody(payload.parts);
      }
      
      // Extract text from PDF attachments
      let pdfText = '';
      if (payload?.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'application/pdf' && part.body?.attachmentId) {
            try {
              const attachment = await gmail.users.messages.attachments.get({
                userId: 'me',
                messageId: message.id!,
                id: part.body.attachmentId,
              });
              
              if (attachment.data.data) {
                const extractedText = await extractTextFromPdfBase64(attachment.data.data);
                pdfText += '\n' + extractedText;
              }
            } catch (error) {
              console.error('PDF attachment fetch error:', error);
            }
          }
        }
      }
      
      // Combine body and PDF text
      const fullText = body + pdfText;

      // Hybrid extraction: Try improved regex first (using fullText with PDF content)
      let flightData = extractFlightFromEmailImproved(subject, fullText);
      
      // If regex failed, try Gemini AI (if API key is configured)
      if (!flightData || !flightData.departureAirport || !flightData.arrivalAirport) {
        const geminiData = await extractFlightWithGemini(subject, fullText);
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
        // STRICT RULE: Only process if we have a flight number
        // This filters out check-in reminders, marketing emails, etc.
        if (!flightData.flightNumber) {
          logger.log({
            emailId: message.id!,
            subject,
            from,
            date: dateHeader,
            status: 'skipped',
            reason: 'No flight number found',
            extractedData: flightData,
          });
          continue;
        }
        
        // PNR-based deduplication within this scan
        if (flightData.confirmationCode) {
          const pnrKey = `${flightData.confirmationCode}-${flightData.departureAirport}-${flightData.arrivalAirport}`;
          if (seenPnrs.has(pnrKey)) {
            logger.log({
              emailId: message.id!,
              subject,
              from,
              date: dateHeader,
              status: 'skipped',
              reason: 'Duplicate PNR in current scan',
              extractedData: flightData,
            });
            continue;
          }
          seenPnrs.add(pnrKey);
        }

        // Smart deduplication: Check by PNR first (most reliable)
        if (flightData.confirmationCode) {
          const { data: existingByPnr } = await supabase
            .from('flights')
            .select('id')
            .eq('user_id', userId)
            .eq('confirmation_code', flightData.confirmationCode)
            .maybeSingle();

          if (existingByPnr) {
            logger.log({
              emailId: message.id!,
              subject,
              from,
              date: dateHeader,
              status: 'skipped',
              reason: 'Duplicate PNR in database',
              extractedData: flightData,
            });
            continue;
          }
        }
        
        // Check for duplicates using flight number as secondary check
        const { data: existingByFlightNum } = await supabase
          .from('flights')
          .select('id')
          .eq('user_id', userId)
          .eq('flight_number', flightData.flightNumber)
          .eq('departure_airport', flightData.departureAirport)
          .eq('arrival_airport', flightData.arrivalAirport)
          .maybeSingle();

        if (existingByFlightNum) {
          logger.log({
            emailId: message.id!,
            subject,
            from,
            date: dateHeader,
            status: 'skipped',
            reason: 'Duplicate flight number',
            extractedData: flightData,
          });
          continue;
        }

        // Also check by date if available (same flight, same day = duplicate)
        if (flightData.departureDate) {
          const { data: existingByDate } = await supabase
            .from('flights')
            .select('id')
            .eq('user_id', userId)
            .eq('departure_airport', flightData.departureAirport)
            .eq('arrival_airport', flightData.arrivalAirport)
            .eq('departure_date', flightData.departureDate.toISOString())
            .maybeSingle();

          if (existingByDate) {
            logger.log({
              emailId: message.id!,
              subject,
              from,
              date: dateHeader,
              status: 'skipped',
              reason: 'Duplicate by date',
              extractedData: flightData,
            });
            continue;
          }
        }

        // Enrich with airport data (try static first, then API fallback)
        const depData = await getAirportInfo(flightData.departureAirport);
        const arrData = await getAirportInfo(flightData.arrivalAirport);

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
          logger.log({
            emailId: message.id!,
            subject,
            from,
            date: dateHeader,
            status: 'failed',
            reason: `Database insert error: ${insertError.message}`,
            extractedData: flightData,
          });
        } else {
          flightsFound++;
          logger.log({
            emailId: message.id!,
            subject,
            from,
            date: dateHeader,
            status: 'success',
            extractedData: flightData,
          });
        }
      } else {
        // No flight data extracted
        logger.log({
          emailId: message.id!,
          subject,
          from,
          date: dateHeader,
          status: 'no_flight_data',
          reason: 'Could not extract flight information',
        });
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

    const logSummary = logger.getSummary();
    const unparseableEmails = logger.getUnparseableEmails();
    
    console.log('Scan Summary:', logSummary);
    console.log('Unparseable Emails:', unparseableEmails.length);

    return NextResponse.json({
      success: true,
      emailsScanned,
      flightsFound,
      summary: logSummary,
      unparseableEmails: unparseableEmails.slice(0, 10), // Return first 10 for debugging
    });
  } catch (error: any) {
    console.error('Gmail scan error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to scan emails' },
      { status: 500 }
    );
  }
}
