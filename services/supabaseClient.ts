/**
 * Supabase Client Service
 * 
 * This service initializes and exports the Supabase client for database operations.
 * 
 * Use Cases:
 * - Centralized Supabase client configuration
 * - Environment variable management for Supabase connection
 * - Single source of truth for database client across the application
 * - Handles authentication, database queries, and real-time subscriptions
 * 
 * Configuration:
 * - NEXT_PUBLIC_SUPABASE_URL: The Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: The Supabase anonymous/public key
 * 
 * This client is used by all other services for database operations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 