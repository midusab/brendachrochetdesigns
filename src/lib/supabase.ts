import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any).env.VITE_SUPABASE_URL;
const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if configuration is valid
export const isConfigured = !!(url && typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) && !!(key && typeof key === 'string' && key.length > 0);

// Ensure we have a valid URL if VITE_SUPABASE_URL is junk or missing
const supabaseUrl = isConfigured ? url : 'https://placeholder.supabase.co';
const supabaseAnonKey = isConfigured ? key : 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
