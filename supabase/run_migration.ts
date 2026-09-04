import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const { data, error } = await sb
    .from('synthetic_registry')
    .update({ nationality: 'IND', document_type: 'passport' })
    .eq('nationality', 'DEMO')
    .select('document_number, nationality, document_type');

  if (error) {
    console.error('Migration FAILED:', error.message);
  } else {
    console.log('Migration SUCCESS. Updated rows:');
    console.log(JSON.stringify(data, null, 2));
  }
}

migrate();
