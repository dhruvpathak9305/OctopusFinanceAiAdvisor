/**
 * Real Data Helper Utilities
 * 
 * Helper functions to work with real data from accounts_real table
 * and verify database connectivity
 */

import { supabase } from '../lib/supabase/client';
import * as accountsService from '../services/accountsService';

/**
 * Check if accounts_real table has data
 */
export const checkRealDataExists = async (): Promise<{
  hasData: boolean;
  count: number;
  error?: string;
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { hasData: false, count: 0, error: 'User not authenticated' };
    }

    const { data, error, count } = await supabase
      .from('accounts_real')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (error) {
      return { hasData: false, count: 0, error: error.message };
    }

    return {
      hasData: (count || 0) > 0,
      count: count || 0
    };
  } catch (err) {
    return {
      hasData: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};

/**
 * Get sample real account data directly from database
 */
export const getSampleRealAccounts = async (): Promise<{
  accounts: any[];
  totalBalance: number;
  error?: string;
}> => {
  try {
    const realAccounts = await accountsService.fetchAccounts(false); // false = real data
    
    const totalBalance = realAccounts.reduce((sum, account) => sum + account.balance, 0);
    
    return {
      accounts: realAccounts,
      totalBalance,
    };
  } catch (err) {
    return {
      accounts: [],
      totalBalance: 0,
      error: err instanceof Error ? err.message : 'Failed to fetch real accounts'
    };
  }
};

/**
 * Add sample account to accounts_real table (for testing)
 */
export const addSampleRealAccount = async (): Promise<{
  success: boolean;
  account?: any;
  error?: string;
}> => {
  try {
    const sampleAccount = {
      name: 'Chase Checking',
      type: 'Checking',
      balance: 5250.75,
      institution: 'Chase Bank',
      account_number: '****1234',
    };

    const newAccount = await accountsService.addAccount(sampleAccount as any, false); // false = real data
    
    return {
      success: true,
      account: newAccount
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add sample account'
    };
  }
};

/**
 * Compare demo vs real data counts
 */
export const compareDataSources = async (): Promise<{
  demoCount: number;
  realCount: number;
  demoBalance: number;
  realBalance: number;
  error?: string;
}> => {
  try {
    // Fetch demo data
    const demoAccounts = await accountsService.fetchAccounts(true); // true = demo data
    const demoBalance = demoAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Fetch real data
    const realAccounts = await accountsService.fetchAccounts(false); // false = real data
    const realBalance = realAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    return {
      demoCount: demoAccounts.length,
      realCount: realAccounts.length,
      demoBalance,
      realBalance
    };
  } catch (err) {
    return {
      demoCount: 0,
      realCount: 0,
      demoBalance: 0,
      realBalance: 0,
      error: err instanceof Error ? err.message : 'Failed to compare data sources'
    };
  }
};

/**
 * Verify database connection and table access
 */
export const verifyDatabaseConnection = async (): Promise<{
  connected: boolean;
  authenticated: boolean;
  tablesAccessible: boolean;
  error?: string;
}> => {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        connected: false,
        authenticated: false,
        tablesAccessible: false,
        error: 'Not authenticated'
      };
    }

    // Test table access
    const { error: tableError } = await supabase
      .from('accounts_real')
      .select('count')
      .limit(1);

    if (tableError) {
      return {
        connected: true,
        authenticated: true,
        tablesAccessible: false,
        error: `Table access error: ${tableError.message}`
      };
    }

    return {
      connected: true,
      authenticated: true,
      tablesAccessible: true
    };
  } catch (err) {
    return {
      connected: false,
      authenticated: false,
      tablesAccessible: false,
      error: err instanceof Error ? err.message : 'Connection failed'
    };
  }
};
