import { supabase } from './client';
import { VerificationResult } from '../verification/types';

export async function saveAuditRecord(
  result: VerificationResult, 
  documentType: string | undefined, 
  documentNumber: string
): Promise<'Supabase' | 'Local Fallback'> {
  
  if (!supabase) {
    console.log('Supabase offline. Skipping audit persistence (Local Fallback).');
    return 'Local Fallback';
  }

  try {
    const payload: any = {
      verification_id: result.verificationId,
      document_number: documentNumber,
      document_type: documentType || 'unknown',
      status: result.status,
      verification_score: result.verificationScore,
      timestamp: result.timestamp,
      result_hash: result.resultHash,
      matches: result.comparisons,
      fabric_transaction_id: result.fabricTransactionId,
      fabric_status: result.fabricStatus
    };

    let { error } = await supabase.from('verification_audits').insert(payload);

    // Fallback if the user hasn't run the ALTER TABLE schema migration yet
    if (error && error.message.includes('Could not find the \'fabric_status\' column')) {
      console.warn('Fabric schema migration missing. Retrying insert without Fabric columns.');
      delete payload.fabric_transaction_id;
      delete payload.fabric_status;
      const retry = await supabase.from('verification_audits').insert(payload);
      error = retry.error;
    }

    if (error) {
      console.log('AUDIT INSERT: FAILED');
      console.error('Failed to insert audit record into Supabase:', error.message);
      return 'Local Fallback';
    }

    console.log('AUDIT INSERT: SUCCESS');
    return 'Supabase';
  } catch (err: any) {
    console.log('AUDIT INSERT: FAILED');
    console.error('Exception during audit persistence:', err.message || err);
    return 'Local Fallback';
  }
}
