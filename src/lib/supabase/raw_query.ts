import { supabase } from './client';

async function queryDB() {
  if (!supabase) return;

  console.log('Querying: SELECT * FROM verification_audits ORDER BY created_at DESC LIMIT 5;');
  const { data, error } = await supabase
    .from('verification_audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Successfully retrieved ${data?.length} rows.`);
    console.log(JSON.stringify(data, null, 2));
  }
}

queryDB();
