"use server";

import { extractPassportFromImage } from '@/lib/ai/gemini';
import { ExtractedPassport } from '@/lib/verification/types';

export type ExtractionResponse = 
  | { success: true; data: ExtractedPassport }
  | { success: false; error: string };

import { verifyPassport } from '@/lib/verification/verifyPassport';
import { VerificationResult } from '@/lib/verification/types';
import { verifyBlockchainIntegrity } from '@/lib/blockchain/adapter';
import { IntegrityCheckResponse } from '@/lib/blockchain/types';

export async function verifyDocumentAction(extracted: ExtractedPassport): Promise<VerificationResult> {
  return await verifyPassport(extracted);
}

export async function verifyIntegrityAction(verificationId: string, currentHash: string): Promise<IntegrityCheckResponse> {
  return await verifyBlockchainIntegrity(verificationId, currentHash);
}

/**
 * Server Action to handle document extraction securely on the backend.
 * This ensures the Gemini API key and logic are never exposed to the browser.
 */
export async function extractDocumentAction(formData: FormData): Promise<ExtractionResponse> {
  try {
    const file = formData.get('document') as File | null;
    
    if (!file) {
      return { success: false, error: 'No document file provided.' };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Invalid file format. For this MVP, only JPG and PNG are supported for extraction.' 
      };
    }

    // Convert the uploaded File into a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Log incoming payload size (server-side, after client compression)
    console.log(`[Gemini] Received payload: ${file.name} (${file.type}), Size: ${(buffer.byteLength / 1024).toFixed(1)} KB`);

    // Call our server-side Gemini module
    const extractedData = await extractPassportFromImage(buffer, file.type as 'image/jpeg' | 'image/png');

    return {
      success: true,
      data: extractedData
    };
    
  } catch (error: any) {
    console.error('Server Action Error (extractDocumentAction):', error);
    
    // Ensure we don't accidentally leak API keys if they appear in the error message
    let errorMessage = error?.message || 'An unexpected error occurred during document extraction.';
    if (errorMessage.includes(process.env.GEMINI_API_KEY || 'HIDDEN_KEY')) {
      errorMessage = 'Gemini API Error (Key redacted). Please check server logs.';
    }

    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
