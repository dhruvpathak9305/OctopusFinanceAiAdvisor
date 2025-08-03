/**
 * Supabase Client Service
 * 
 * This service re-exports the centralized Supabase client for database operations.
 * 
 * Use Cases:
 * - Centralized Supabase client configuration
 * - Environment variable management for Supabase connection
 * - Single source of truth for database client across the application
 * - Handles authentication, database queries, and real-time subscriptions
 * 
 * Configuration:
 * - EXPO_PUBLIC_SUPABASE_URL: The Supabase project URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY: The Supabase anonymous/public key
 * 
 * This client is used by all other services for database operations.
 */

// Re-export the centralized Supabase client
export { supabase } from '../lib/supabase/client';
export type { Database } from '../types/supabase';
export type { User, Session, AuthError } from '@supabase/supabase-js'; 