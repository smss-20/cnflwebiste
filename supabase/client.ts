import { createClient } from '@supabase/supabase-js';

// =================================================================
// This file contains your Supabase connection details.
// =================================================================
const supabaseUrl = 'https://qgjkldeadywivirpkxqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnamtsZGVhZHl3aXZpcnBreHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjAxODQsImV4cCI6MjA3NzMzNjE4NH0.0fev626AoSYJNe3I9_aQmLx_hsEIN50_VLXa_kVauSQ';

let supabase: any = null;
let supabaseError: { title: string; description: string; } | null = null;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e: any) {
  // This block will only run if the URL or Key are fundamentally invalid.
  supabaseError = {
    title: "Supabase Configuration Error",
    description: `There was an error initializing the Supabase client: ${e.message}. Please check that the URL and Key in supabase/client.ts are correct.`
  };
   console.error(supabaseError.title + ": " + supabaseError.description);
}

export { supabase, supabaseError };
