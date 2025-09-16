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
import Toast from "react-native-toast-message";
import { Account } from "../contexts/AccountsContext";
import type { Database } from "../types/supabase";
import BalanceService from "./balanceService";
import {
  getTableMap,
  validateTableConsistency,
  type TableMap,
} from "../utils/tableMapping";

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);

  // Validate consistency during development
  if (process.env.NODE_ENV === "development") {
    validateTableConsistency(tableMap);
  }

  return tableMap;
};

// Maps the database account to the application account model
const mapDbAccountToModel = (
  dbAccount: Database["public"]["Tables"]["accounts"]["Row"]
): Account => {
  return {
    id: dbAccount.id,
    name: dbAccount.name,
    type: dbAccount.type,
    institution: dbAccount.institution || "",
    balance: 0, // Balance is now managed smeparately in balance_real table
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
    // Note: balance is now handled separately in balance_real table
    account_number: account.account_number,
    logo_url: account.logo_url,
    user_id: userId,
  };
};

// Fetch all accounts for the current user
export const fetchAccounts = async (
  isDemo: boolean = false
): Promise<Account[]> => {
  try {
    // Get the current user - try session first, then getUser
    let user = null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      user = session?.user || null;

      if (!user) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        user = authUser;
      }
    } catch (authError) {
      console.error("fetchAccounts - auth error:", authError);
    }

    if (!user) {
      console.error("fetchAccounts - no user found in session or getUser");
      throw new Error("User not authenticated");
    }

    const tableMap = getTableMapping(isDemo);

    // Fetch accounts from the database using dynamic table name
    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching accounts:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch accounts",
        text2: error.message,
      });
      return [];
    }

    return (data || []).map((account: any) => mapDbAccountToModel(account));
  } catch (error) {
    console.error("Error in fetchAccounts:", error);
    Toast.show({
      type: "error",
      text1: "Failed to fetch accounts",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
};

// Add a new account
export const addAccount = async (
  account: Account,
  isDemo: boolean = false
): Promise<Account> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const tableMap = getTableMapping(isDemo);
    const dbAccount = mapModelToDbAccount(account, user.id);

    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .insert([dbAccount])
      .select()
      .single();

    if (error) {
      console.error("Error adding account:", error);
      Toast.show({
        type: "error",
        text1: "Failed to add account",
        text2: error.message,
      });
      throw error;
    }

    // Update balance record created by trigger with actual opening balance (only in production mode)
    if (!isDemo && account.balance && account.balance !== 0) {
      try {
        // The trigger automatically created a balance record with 0 values
        // Now update it with the actual opening balance
        await BalanceService.setOpeningBalance(data.id, account.balance, false);
      } catch (balanceError) {
        console.error("Error setting opening balance:", balanceError);
        // Don't throw error - account creation was successful
        // Balance can be updated manually later
      }
    }

    Toast.show({
      type: "success",
      text1: "Account added successfully",
    });

    return mapDbAccountToModel(data);
  } catch (error) {
    console.error("Error in addAccount:", error);
    Toast.show({
      type: "error",
      text1: "Failed to add account",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

// Update an existing account
export const updateAccount = async (
  account: Account,
  isDemo: boolean = false
): Promise<Account> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const tableMap = getTableMapping(isDemo);
    const dbAccount = mapModelToDbAccount(account, user.id);

    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .update(dbAccount)
      .eq("id", account.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating account:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update account",
        text2: error.message,
      });
      throw error;
    }

    Toast.show({
      type: "success",
      text1: "Account updated successfully",
    });

    return mapDbAccountToModel(data);
  } catch (error) {
    console.error("Error in updateAccount:", error);
    Toast.show({
      type: "error",
      text1: "Failed to update account",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

// Delete an account
export const deleteAccount = async (
  accountId: string,
  isDemo: boolean = false
): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const tableMap = getTableMapping(isDemo);

    const { error } = await (supabase as any)
      .from(tableMap.accounts)
      .delete()
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting account:", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete account",
        text2: error.message,
      });
      throw error;
    }

    Toast.show({
      type: "success",
      text1: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    Toast.show({
      type: "error",
      text1: "Failed to delete account",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

// Fetch account balance history for charts
export const fetchAccountsHistory = async (
  months: number = 12,
  isDemo: boolean = false
): Promise<{ date: string; value: number }[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Toast.show({
        type: "error",
        text1: "User not authenticated",
      });
      return generatePlaceholderHistory(months);
    }

    const tableMap = getTableMapping(isDemo);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await (supabase as any)
      .from(tableMap.account_balance_history)
      .select("snapshot_date, balance")
      .eq("user_id", user.id)
      .gte("snapshot_date", startDate.toISOString().split("T")[0])
      .lte("snapshot_date", endDate.toISOString().split("T")[0])
      .order("snapshot_date", { ascending: true });

    if (error) {
      console.error("Error fetching account history:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch account history",
        text2: error.message,
      });
      return generatePlaceholderHistory(months);
    }

    // Group by date and sum balances
    const balanceByDate = new Map<string, number>();
    data?.forEach((record: any) => {
      const date = record.snapshot_date;
      const currentBalance = balanceByDate.get(date) || 0;
      balanceByDate.set(date, currentBalance + record.balance);
    });

    // Convert to array and sort by date
    return Array.from(balanceByDate.entries())
      .map(([date, balance]) => ({ date, value: balance }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error in fetchAccountsHistory:", error);
    Toast.show({
      type: "error",
      text1: "Failed to fetch account history",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    return generatePlaceholderHistory(months);
  }
};

// Generate placeholder data for charts when no real data is available
const generatePlaceholderHistory = (
  months: number = 12
): { date: string; value: number }[] => {
  const history = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    history.push({
      date: date.toISOString().split("T")[0],
      value: Math.random() * 10000 + 5000, // Random balance between 5000-15000
    });
  }

  return history;
};

// Fetch account balance history for a specific user (for admin purposes)
export async function fetchAccountBalanceHistory(
  userId: string,
  months: number = 12,
  isDemo: boolean = false
): Promise<{ date: string; value: number }[]> {
  try {
    const tableMap = getTableMapping(isDemo);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await (supabase as any)
      .from(tableMap.account_balance_history)
      .select("snapshot_date, balance")
      .eq("user_id", userId)
      .gte("snapshot_date", startDate.toISOString().split("T")[0])
      .lte("snapshot_date", endDate.toISOString().split("T")[0])
      .order("snapshot_date", { ascending: true });

    if (error) {
      console.error("Error fetching account balance history:", error);
      return generatePlaceholderHistory(months);
    }

    // Group by date and sum balances
    const balanceByDate = new Map<string, number>();
    data?.forEach((record: any) => {
      const date = record.snapshot_date;
      const currentBalance = balanceByDate.get(date) || 0;
      balanceByDate.set(date, currentBalance + record.balance);
    });

    // Convert to array and sort by date
    return Array.from(balanceByDate.entries())
      .map(([date, balance]) => ({ date, value: balance }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error in fetchAccountBalanceHistory:", error);
    return generatePlaceholderHistory(months);
  }
}
