/**
 * Supabase Client Configuration
 * Handles database connection and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables will be set by user
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe database queries will be added once schema is defined
