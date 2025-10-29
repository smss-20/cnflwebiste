


import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js';

const supabaseUrl = 'https://qgjkldeadywivirpkxqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnamtsZGVhZHl3aXZpcnBreHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjAxODQsImV4cCI6MjA3NzMzNjE4NH0.0fev626AoSYJNe3I9_aQmLx_hsEIN50_VLXa_kVauSQ';

let supabase: SupabaseClient | null = null;
let supabaseError: { title: string; description: string } | null = null;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e: any) {
  supabaseError = {
    title: 'Supabase Configuration Error',
    description: `There was an error initializing the Supabase client: ${e?.message ?? String(e)}.`
  };
  console.error(supabaseError.title + ': ' + supabaseError.description);
}

export { supabase, supabaseError };

