import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedPassport } from '../verification/types';

/**
 * Extracts structured data from a passport image using the Gemini API.
 * This function must ONLY be run server-side to protect the API key.
 */
export async function extractPassportFromImage(
  imageBuffer: Buffer,
  mimeType: 'image/jpeg' | 'image/png'
): Promise<ExtractedPassport> {
  // 1. Ensure API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  // 2. Initialize the SDK
  const ai = new GoogleGenAI({ apiKey });

  // 3. Define the strict JSON schema matching the ExtractedPassport type
  const passportSchema = {
    type: Type.OBJECT,
    properties: {
      documentType: { type: Type.STRING, description: 'Type of the document (e.g., verifyx_demo_id, passport)' },
      documentNumber: { type: Type.STRING, description: 'The unique document number or passport number' },
      surname: { type: Type.STRING, description: 'Surname or last name of the holder' },
      givenName: { type: Type.STRING, description: 'Given name(s) or first name of the holder' },
      dateOfBirth: { type: Type.STRING, description: 'Date of birth in YYYY-MM-DD format' },
      nationality: { type: Type.STRING, description: 'Nationality code (e.g., IND or DEMO)' },
      sex: { type: Type.STRING, description: 'Sex/Gender (e.g., M or F)' },
      dateOfIssue: { type: Type.STRING, description: 'Date of issue in YYYY-MM-DD format' },
      dateOfExpiry: { type: Type.STRING, description: 'Date of expiry in YYYY-MM-DD format' },
      mrz: { type: Type.STRING, description: 'The Machine Readable Zone text (two or three lines)' }
    },
    required: [
      'documentType',
      'documentNumber',
      'surname',
      'givenName',
      'dateOfBirth',
      'nationality',
      'sex',
      'dateOfIssue',
      'dateOfExpiry',
      'mrz'
    ],
  };

  const prompt = `You are a document extraction system.
Extract information from the provided identity document image.
Return ONLY valid JSON.
Do not determine whether the document is genuine.
Do not determine whether the document is fake.
Do not make verification decisions.

Extract only the following fields:
documentType
documentNumber
surname
givenName
dateOfBirth
nationality
sex
dateOfIssue
dateOfExpiry
mrz

Normalize dates to YYYY-MM-DD.
If a field cannot be read confidently, return null.
Do not invent missing information.`;

  try {
    // 4. Call Gemini Model
    // Using gemini-3.6-flash as discovered via models.list()
    const modelName = 'gemini-3.6-flash';
    console.log(`[Gemini] Using model ${modelName}. Payload: ${(imageBuffer.byteLength / 1024).toFixed(1)} KB (Base64: ~${((imageBuffer.byteLength * 4 / 3) / 1024).toFixed(1)} KB)`);
    
    const t0 = Date.now();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: passportSchema,
        temperature: 0.0 // Lowest temperature for deterministic extraction
      }
    });

    const responseText = response.text;
    console.log(`[Gemini] API call completed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    // 5. Parse and cast response
    const extractedData: ExtractedPassport = JSON.parse(responseText);

    // Basic validation to ensure the JSON matches our expected structure minimally
    if (!extractedData.documentNumber && !extractedData.surname) {
       throw new Error('Gemini failed to extract mandatory document fields.');
    }

    return extractedData;
  } catch (error: any) {
    console.error('Gemini API Error (Server):', error);
    // Return the actual error message so the caller sees it
    throw new Error(error?.message || 'Failed to process image with Gemini API.');
  }
}
