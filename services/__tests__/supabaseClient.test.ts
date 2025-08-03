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
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Re-import the module to trigger initialization with new env vars
    jest.isolateModules(() => {
      require('../supabaseClient');
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  it('should create Supabase client with empty strings when env vars are missing', () => {
    // Remove environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Re-import the module to trigger initialization
    jest.isolateModules(() => {
      require('../supabaseClient');
    });

    expect(createClient).toHaveBeenCalledWith('', '');
  });

  it('should export a valid supabase client instance', () => {
    // Set up environment variables for this test
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Import the client
    const { supabase } = require('../supabaseClient');
    
    expect(supabase).toBeDefined();
    expect(typeof supabase).toBe('object');
  });

  it('should handle client methods', () => {
    // Set up environment variables for this test
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Import the client
    const { supabase } = require('../supabaseClient');
    
    // Test that common Supabase methods are available
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
    expect(typeof supabase.storage).toBe('object');
  });
}); 