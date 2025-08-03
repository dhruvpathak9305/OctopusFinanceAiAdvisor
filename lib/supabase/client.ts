import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_CONFIG, AUTH_CONFIG, REALTIME_CONFIG, ERROR_CONFIG } from './config';

// Custom storage implementation for React Native
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (ERROR_CONFIG.logErrors) {
        console.error('Error getting item from SecureStore:', error);
      }
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      if (ERROR_CONFIG.logErrors) {
        console.error('Error setting item in SecureStore:', error);
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      if (ERROR_CONFIG.logErrors) {
        console.error('Error removing item from SecureStore:', error);
      }
    }
  },
};

// Create Supabase client with React Native configuration
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: AUTH_CONFIG.autoRefreshToken,
    persistSession: AUTH_CONFIG.persistSession,
    detectSessionInUrl: AUTH_CONFIG.detectSessionInUrl,
    flowType: AUTH_CONFIG.flowType,
  },
  realtime: {
    params: {
      eventsPerSecond: REALTIME_CONFIG.eventsPerSecond,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'octopus-finance-ai-advisor',
    },
  },
});

// Export types for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';

// Helper function to check if Supabase is properly initialized
export const isSupabaseInitialized = (): boolean => {
  return !!supabase && !!SUPABASE_CONFIG.url && !!SUPABASE_CONFIG.anonKey;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      if (ERROR_CONFIG.logErrors) {
        console.error('Error getting current user:', error);
      }
      return null;
    }
    return user;
  } catch (error) {
    if (ERROR_CONFIG.logErrors) {
      console.error('Error getting current user:', error);
    }
    return null;
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, context: string): string => {
  if (ERROR_CONFIG.logErrors) {
    console.error(`Supabase error in ${context}:`, error);
  }
  
  if (ERROR_CONFIG.showUserFriendlyErrors) {
    if (error?.message) {
      return error.message;
    }
    if (error?.details) {
      return error.details;
    }
    return `An error occurred while ${context}`;
  }
  
  return error?.message || 'Unknown error occurred';
};

// Helper function to retry Supabase operations
export const retrySupabaseOperation = async <T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = ERROR_CONFIG.maxRetries
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        if (ERROR_CONFIG.logErrors) {
          console.warn(`Retry ${attempt}/${maxRetries} for ${context}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, ERROR_CONFIG.retryDelay * attempt));
      }
    }
  }
  
  throw lastError;
}; 