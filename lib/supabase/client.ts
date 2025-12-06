import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Database } from '../../types/supabase';

// Supabase configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://fzzbfgnmbchhmqepwmer.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

// Storage key that Supabase uses internally
const SUPABASE_AUTH_TOKEN_KEY = `sb-fzzbfgnmbchhmqepwmer-auth-token`;

// Custom storage that does NOT auto-restore sessions on cold start
// This prevents the "Network request failed" spam when offline
const LazySecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    // Only return stored session if we explicitly want it
    // Check for a flag that indicates user wants to stay logged in
    try {
      const stayLoggedIn = await SecureStore.getItemAsync('octopus_stay_logged_in');
      if (stayLoggedIn !== 'true') {
        // User hasn't explicitly logged in with "remember me" - don't restore session
        // This prevents network calls on cold start for users who didn't log in
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore getItem error:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
      // When setting auth token, mark that user should stay logged in
      if (key === SUPABASE_AUTH_TOKEN_KEY) {
        await SecureStore.setItemAsync('octopus_stay_logged_in', 'true');
      }
    } catch (e) {
      console.warn('SecureStore setItem error:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
      // When removing auth token, also clear the stay logged in flag
      if (key === SUPABASE_AUTH_TOKEN_KEY) {
        await SecureStore.deleteItemAsync('octopus_stay_logged_in');
      }
    } catch (e) {
      console.warn('SecureStore removeItem error:', e);
    }
  },
};

// Create Supabase client
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : LazySecureStoreAdapter,
    autoRefreshToken: true, // OK to refresh when user is actually logged in
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to clear all auth data (for logout or fresh start)
export const clearSupabaseAuth = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SUPABASE_AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync('octopus_stay_logged_in');
    console.log('Supabase auth storage cleared');
  } catch (e) {
    console.warn('Failed to clear Supabase auth:', e);
  }
};

// Helper to enable session persistence (call after successful login)
export const enableSessionPersistence = async (): Promise<void> => {
  try {
    await SecureStore.setItemAsync('octopus_stay_logged_in', 'true');
  } catch (e) {
    console.warn('Failed to enable session persistence:', e);
  }
};

export type { User, Session, AuthError } from '@supabase/supabase-js';
export type { Database } from '../../types/supabase';
