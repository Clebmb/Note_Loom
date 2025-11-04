import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * This file contains all Supabase-related configuration including:
 * - Project URL
 * - API Key (anon/public key)
 * - Additional client options
 * 
 * IMPORTANT: Set these environment variables in your .env.local file:
 * - VITE_SUPABASE_URL=your_supabase_project_url
 * - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
 */

// Supabase project URL - Load from environment variable
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Supabase anon/public API key - Load from environment variable
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured (optional feature)
export const isSupabaseConfigured = (): boolean => {
  const isConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  if (!isConfigured) {
    console.log('[Supabase Config] Environment variables check:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_ANON_KEY,
      urlValue: SUPABASE_URL || 'MISSING',
      keyValue: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING',
      allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    });
    console.log('[Supabase Config] Full import.meta.env.VITE_ keys:', 
      Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    );
  }
  return isConfigured;
};

// Export the values (will be undefined if not set, which is intentional)
export { SUPABASE_URL, SUPABASE_ANON_KEY };

// Supabase client options
export const SUPABASE_OPTIONS = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // Add any other global client options here
};

/**
 * Create and export the Supabase client instance
 * 
 * Usage:
 * import { supabase, isSupabaseConfigured } from './supabase.config';
 * 
 * if (isSupabaseConfigured()) {
 *   const { data, error } = await supabase.from('table_name').select('*');
 * }
 * 
 * Note: Supabase is optional - the app works without it using local storage only.
 * If not configured, Supabase functions will be skipped gracefully.
 */
// Create and export the Supabase client instance
// Only create client if credentials are provided (Supabase is optional)
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, SUPABASE_OPTIONS)
  : createClient('https://placeholder.supabase.co', 'placeholder-key', SUPABASE_OPTIONS);

// Export configuration object for reference
export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  options: SUPABASE_OPTIONS,
};

