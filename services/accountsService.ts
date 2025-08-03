/**
 * Accounts Service
 * 
 * This service manages user bank accounts and financial account operations.
 * 
 * Use Cases:
 * - Fetch all user accounts with balances and details
 * - Add new bank accounts (checking, savings, credit unions, etc.)
 * - Update existing account information and balances
 * - Delete accounts from user's portfolio
 * - Retrieve account balance history and trends over time
 * - Generate account performance analytics and charts
 * - Handle account data mapping between UI and database models
 * 
 * Key Functions:
 * - fetchAccounts(): Retrieves all accounts for authenticated user
 * - addAccount(): Creates a new account in the system
 * - updateAccount(): Modifies existing account details
 * - deleteAccount(): Removes an account (with user ownership validation)
 * - fetchAccountsHistory(): Gets historical balance data for charts
 * - fetchAccountBalanceHistory(): Specific user account balance trends
 * 
 * Account Types Supported:
 * - Checking accounts
 * - Savings accounts
 * - Credit union accounts
 * - Investment accounts
 * - Other financial institutions
 * 
 * Security Features:
 * - User authentication validation for all operations
 * - Account ownership verification before modifications
 * - Toast notifications for user feedback
 * - Error handling and logging
 * 
 * This service supports both demo and production data environments.
 */

import { supabase } from "../lib/supabase/client";
import Toast from 'react-native-toast-message';
import { Account } from "../contexts/AccountsContext";
import type { Database } from "../types/supabase";
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);
  
  // Validate consistency during development
  if (process.env.NODE_ENV === 'development') {
    validateTableConsistency(tableMap);
  }
  
  return tableMap;
};

// Maps the database account to the application account model
const mapDbAccountToModel = (dbAccount: Database["public"]["Tables"]["accounts"]["Row"]): Account => {
  return {
    id: dbAccount.id,
    name: dbAccount.name,
    type: dbAccount.type,
    institution: dbAccount.institution || "",
    balance: dbAccount.balance,
    account_number: dbAccount.account_number || undefined,
    logo_url: dbAccount.logo_url || undefined,
  };
};

// Maps the application account model to the database account
const mapModelToDbAccount = (account: Account, userId: string) => {
  return {
    name: account.name,
    type: account.type,
    institution: account.institution,
    balance: account.balance,
    account_number: account.account_number,
    logo_url: account.logo_url,
    user_id: userId,
  };
};

// Fetch all accounts for the current user
export const fetchAccounts = async (isDemo: boolean = false): Promise<Account[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Fetch accounts from the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch accounts", {
        description: error.message
      });
      throw error;
    }
    
    // Map and return the accounts
    return (data || []).map(account => mapDbAccountToModel(account));
  } catch (error) {
    console.error("Error in fetchAccounts:", error);
    throw error;
  }
};

// Add a new account
export const addAccount = async (account: Account, isDemo: boolean = false): Promise<Account> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Map the account to the database model
    const dbAccount = mapModelToDbAccount(account, user.id);
    
    // Insert the account into the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .insert(dbAccount)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding account:", error);
      toast.error("Failed to add account", {
        description: error.message
      });
      throw error;
    }
    
    toast.success("Account added successfully");
    return mapDbAccountToModel(data);
  } catch (error) {
    console.error("Error in addAccount:", error);
    throw error;
  }
};

// Update an existing account
export const updateAccount = async (account: Account, isDemo: boolean = false): Promise<Account> => {
  try {
    if (!account.id) {
      throw new Error("Account ID is required for updates");
    }
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Map the account to the database model
    const dbAccount = mapModelToDbAccount(account, user.id);
    
    // Update the account in the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .update(dbAccount)
      .eq('id', account.id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account", {
        description: error.message
      });
      throw error;
    }
    
    toast.success("Account updated successfully");
    return mapDbAccountToModel(data);
  } catch (error) {
    console.error("Error in updateAccount:", error);
    throw error;
  }
};

// Delete an account
export const deleteAccount = async (accountId: string, isDemo: boolean = false): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Delete the account from the database using dynamic table name
    const { error } = await (supabase as any)
      .from(tableMap.accounts)
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account", {
        description: error.message
      });
      throw error;
    }
    
    toast.success("Account deleted successfully");
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    throw error;
  }
};

// Add this function to fetch account balance history
export const fetchAccountsHistory = async (months: number = 12, isDemo: boolean = false): Promise<{ date: string; value: number }[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Fetch account transactions with timestamps to build a historical view
    // In a real app, you might have a dedicated table for historical balances
    // This is a simplified implementation that constructs history from transactions
    const { data, error } = await (supabase as any)
      .from(tableMap.transactions)
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    
    if (error) {
      console.error("Error fetching account history:", error);
      toast.error("Failed to fetch account history", {
        description: error.message
      });
      throw error;
    }
    
    // Construct a timeline of balances
    const now = new Date();
    const history: { date: string; value: number }[] = [];
    let runningBalance = 0;
    
    // Create data points for each month
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthString = date.toISOString().slice(0, 7); // YYYY-MM format
      
      // Find transactions for this month
      const monthTransactions = (data || []).filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.toISOString().slice(0, 7);
        return transactionMonth === monthString;
      });
      
      // Calculate balance change for the month
      const monthChange = monthTransactions.reduce((sum: number, tx: any) => {
        if (tx.type === 'income') {
          return sum + tx.amount;
        } else if (tx.type === 'expense') {
          return sum - tx.amount;
        }
        return sum;
      }, 0);
      
      runningBalance += monthChange;
      
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.max(0, runningBalance) // Ensure non-negative balance
      });
    }
    
    return history.length > 0 ? history : generatePlaceholderHistory(months);
  } catch (error) {
    console.error("Error in fetchAccountsHistory:", error);
    // Return placeholder data on error
    return generatePlaceholderHistory(months);
  }
};

// Generate placeholder history data
const generatePlaceholderHistory = (months: number = 12): { date: string; value: number }[] => {
  const history: { date: string; value: number }[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const baseValue = 2000 + Math.random() * 3000; // Random value between 2000-5000
    
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(baseValue)
    });
  }
  
  return history;
};

// Fetch account balance history from dedicated history table
export async function fetchAccountBalanceHistory(userId: string, months: number = 12, isDemo: boolean = false): Promise<{ date: string; value: number }[]> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);
    
    // Use dynamic table name for account balance history
    const { data, error } = await (supabase as any)
      .from(tableMap.account_balance_history || 'account_balance_history')
      .select('snapshot_date, total_balance')
      .eq('user_id', userId)
      .gte('snapshot_date', startDate.toISOString())
      .lte('snapshot_date', endDate.toISOString())
      .order('snapshot_date', { ascending: true });

    if (error) {
      console.error("Error fetching account balance history:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return generatePlaceholderHistory(months);
    }

    // Transform data to expected format
    return data.map((row: any) => ({
      date: new Date(row.snapshot_date).toLocaleDateString('en-US', { month: 'short' }),
      value: row.total_balance
    }));
  } catch (error) {
    console.error("Error in fetchAccountBalanceHistory:", error);
    return generatePlaceholderHistory(months);
  }
} 