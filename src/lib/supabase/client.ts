import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a single supabase client for interacting with your database
// IMPORTANT: This uses the SERVICE ROLE key and must NEVER be imported into a "use client" component.
// If the URL or Key are missing (e.g. during offline development or Demo Mode without Supabase),
// the client will gracefully fall back to null.
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
