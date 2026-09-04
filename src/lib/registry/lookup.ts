import { supabase } from '../supabase/client';
import { syntheticPassportRegistry, RegistryPassport } from './passports';

export async function getRegistryRecord(documentNumber: string): Promise<{ record: RegistryPassport | null, source: 'Supabase' | 'Local Fallback' }> {
  console.log(`\n--- SUPABASE DIAGNOSTICS ---`);
  console.log(`SUPABASE CONFIG: ${supabase ? 'AVAILABLE' : 'UNAVAILABLE'}`);

  // Attempt Supabase connection first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('synthetic_registry')
        .select('*')
        .eq('document_number', documentNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Log errors other than "no rows returned"
        console.log(`REGISTRY LOOKUP: FAILED`);
        console.log(`Supabase query error:`, error.message);
      } else {
        console.log(`REGISTRY LOOKUP: SUCCESS`);
      }

      if (data) {
        console.log(`REGISTRY RECORD FOUND: YES`);
        // Map snake_case DB columns to camelCase RegistryPassport type
        return {
          record: {
            documentType: data.document_type,
            documentNumber: data.document_number,
            surname: data.surname,
            givenName: data.given_name,
            dateOfBirth: data.date_of_birth,
            nationality: data.nationality,
            sex: data.sex,
            dateOfIssue: data.date_of_issue,
            dateOfExpiry: data.date_of_expiry,
            status: data.status,
          },
          source: 'Supabase'
        };
      }
      
      // If we made it here, Supabase is connected but no record was found.
      console.log(`REGISTRY RECORD FOUND: NO`);
      return { record: null, source: 'Supabase' };
      
    } catch (err: any) {
      console.log(`REGISTRY LOOKUP: FAILED`);
      console.warn('Supabase lookup failed entirely, falling back to local registry', err.message || err);
    }
  } else {
    console.log('Supabase client unavailable. Using local synthetic registry fallback.');
  }

  // Fallback to local hardcoded array if Supabase is offline or env vars missing
  const localRecord = syntheticPassportRegistry.find(r => r.documentNumber === documentNumber);
  return { record: localRecord || null, source: 'Local Fallback' };
}
