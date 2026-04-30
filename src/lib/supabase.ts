import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey && 
                    supabaseUrl !== 'https://your-project-url.supabase.co' && 
                    supabaseAnonKey !== 'your-anon-key';

if (!isConfigured) {
  console.error('Supabase credentials missing or invalid. Please check your .env or Vercel environment variables.');
  if (!supabaseUrl) console.warn('Missing: VITE_SUPABASE_URL');
  if (!supabaseAnonKey) console.warn('Missing: VITE_SUPABASE_ANON_KEY');
}

const getSupabase = () => {
  try {
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder'
    );
  } catch (err) {
    console.error('Supabase initialization failed:', err);
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }
};

export const supabase = getSupabase();
