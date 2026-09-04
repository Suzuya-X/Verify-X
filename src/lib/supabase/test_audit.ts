import { supabase } from './client';
import { verifyPassport } from '../verification/verifyPassport';

async function checkDatabase() {
  if (!supabase) {
    console.error('Supabase client unavailable.');
    return;
  }

  console.log('Running test verification to trigger audit...');
  const result = await verifyPassport({
    documentType: 'verifyx_demo_id',
    documentNumber: 'VX1234567',
    surname: 'SHARMA',
    givenName: 'RAHUL',
    dateOfBirth: '2002-08-14',
    nationality: 'DEMO',
    sex: 'M',
    dateOfIssue: '2022-06-13',
    dateOfExpiry: '2032-06-12'
  } as any);

  console.log('Verification returned status:', result.status);
  console.log('Audit Storage tag on result:', result.auditStorage);

  console.log('\nQuerying verification_audits table...');
  const { data, error } = await supabase
    .from('verification_audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Failed to query DB:', error.message);
  } else {
    console.log(`Found ${data?.length} rows.`);
    if (data && data.length > 0) {
      console.log('Most recent row:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  }
}

checkDatabase();
