import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace with your project's URL and Anon Key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

let supabase: any = null;
let supabaseError: { title: string; description: string; } | null = null;

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  supabaseError = {
    title: "Supabase Not Configured",
    description: "The application is not connected to a backend database. Please follow the setup instructions in gihub_vcxel_supabase.txt and update the credentials in supabase/client.ts."
  };
  console.error(supabaseError.title + ": " + supabaseError.description);
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e: any) {
    supabaseError = {
      title: "Supabase Configuration Error",
      description: `There was an error initializing the Supabase client: ${e.message}. Please check that the URL and Key in supabase/client.ts are correct.`
    };
     console.error(supabaseError.title + ": " + supabaseError.description);
  }
}

export { supabase, supabaseError };