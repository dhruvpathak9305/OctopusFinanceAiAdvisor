import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Database } from '../../types/supabase';

// Supabase configuration - prioritize environment variables for EAS builds
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   Constants.expoConfig?.extra?.supabaseUrl || 
                   'https://fzzbfgnmbchhmqepwmer.supabase.co';

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       Constants.expoConfig?.extra?.supabaseAnonKey || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNqbwOSrm1AiWpBbZjiRmNn0U';

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

const SUPABASE_AUTH_TOKEN_KEY = 'sb-fzzbfgnmbchhmqepwmer-auth-token';

const LazySecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const stayLoggedIn = await SecureStore.getItemAsync('octopus_stay_logged_in');
      if (stayLoggedIn !== 'true') {
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
      if (key === SUPABASE_AUTH_TOKEN_KEY) {
        await SecureStore.deleteItemAsync('octopus_stay_logged_in');
      }
    } catch (e) {
      console.warn('SecureStore removeItem error:', e);
    }
  },
};

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : LazySecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const clearSupabaseAuth = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SUPABASE_AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync('octopus_stay_logged_in');
    console.log('Supabase auth storage cleared');
  } catch (e) {
    console.warn('Failed to clear Supabase auth:', e);
  }
};

export const enableSessionPersistence = async (): Promise<void> => {
  try {
    await SecureStore.setItemAsync('octopus_stay_logged_in', 'true');
  } catch (e) {
    console.warn('Failed to enable session persistence:', e);
  }
};

export type { User, Session, AuthError } from '@supabase/supabase-js';
export type { Database } from '../../types/supabase';
