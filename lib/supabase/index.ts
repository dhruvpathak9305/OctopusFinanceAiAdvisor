// Export Supabase client and utilities
export { 
  supabase, 
  isSupabaseInitialized, 
  getCurrentUser,
  handleSupabaseError,
  retrySupabaseOperation
} from './client';

// Export configuration
export * from './config';

// Export database types
export type { Database } from '../../types/supabase';

// Re-export commonly used Supabase types
export type { 
  User, 
  Session, 
  AuthError,
  SupabaseClient,
  PostgrestError,
  RealtimeChannel
} from '@supabase/supabase-js';