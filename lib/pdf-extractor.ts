// PDF attachment parsing for e-tickets and itineraries
import pdf from 'pdf-parse';

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
}

export async function extractTextFromPdfBase64(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    return await extractTextFromPdfBuffer(buffer);
  } catch (error) {
    console.error('PDF base64 parsing error:', error);
    return '';
  }
}
