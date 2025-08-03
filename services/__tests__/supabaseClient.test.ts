/**
 * Unit tests for supabaseClient.ts
 * Tests Supabase client initialization and configuration
 */

import { createClient } from '@supabase/supabase-js';

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Mock environment variables
const originalEnv = process.env;

describe('supabaseClient', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env to original state
    process.env = { ...originalEnv };
    
    // Create a mock client
    mockClient = {
      from: jest.fn().mockReturnThis(),
      auth: { 
        getUser: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn()
      },
      storage: { 
        from: jest.fn().mockReturnThis(),
        upload: jest.fn(),
        download: jest.fn()
      }
    };
    
    (createClient as jest.Mock).mockReturnValue(mockClient);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should create Supabase client with environment variables', () => {
    // Set up environment variables
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Re-import the module to trigger initialization with new env vars
    jest.isolateModules(() => {
      require('../supabaseClient');
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  it('should create Supabase client with fallback values when env vars are missing', () => {
    // Remove environment variables
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    // Re-import the module to trigger initialization
    jest.isolateModules(() => {
      require('../supabaseClient');
    });

    // Should use fallback values instead of empty strings
    expect(createClient).toHaveBeenCalledWith(
      'https://fzzbfgnmbchhmqepwmer.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U'
    );
  });

  it('should export a valid supabase client instance', () => {
    // Set up environment variables for this test
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Import the client
    const { supabase } = require('../supabaseClient');
    
    expect(supabase).toBeDefined();
    expect(typeof supabase).toBe('object');
  });

  it('should handle client methods', () => {
    // Set up environment variables for this test
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Import the client
    const { supabase } = require('../supabaseClient');
    
    // Test that common Supabase methods are available
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
    expect(typeof supabase.storage).toBe('object');
  });
}); 