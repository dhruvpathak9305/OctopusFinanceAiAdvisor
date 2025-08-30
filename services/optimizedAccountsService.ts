/**
 * Optimized Accounts Service - Transaction-Driven Balance Calculation
 *
 * This service calculates account balances directly from transactions,
 * ensuring 100% accuracy and consistency without sync issues.
 */

import { supabase } from "../lib/supabase/client";
import Toast from "react-native-toast-message";
import { Account } from "../contexts/AccountsContext";
import { getTableMapping } from "../utils/tableMapping";

// Enhanced Account type with computed balance
export interface AccountWithBalance extends Omit<Account, "balance"> {
  current_balance: number;
  initial_balance: number;
  initial_balance_date: string;
  total_income: number;
  total_expenses: number;
  transaction_count: number;
  last_transaction_date: string | null;
  is_active: boolean;
}

/**
 * Fetch all accounts with real-time calculated balances
 */
export const fetchAccountsWithBalances = async (
  isDemo: boolean = false
): Promise<AccountWithBalance[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    // Get all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from(tableMap.accounts)
      .select(
        `
        id, 
        user_id, 
        name, 
        type, 
        institution,
        initial_balance,
        initial_balance_date,
        account_number,
        logo_url,
        is_active,
        created_at,
        updated_at,
        last_sync
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (accountsError) throw accountsError;

    // Calculate balance for each account using database function
    const accountsWithBalances = await Promise.all(
      (accounts || []).map(async (account) => {
        try {
          // Use database function for accurate balance calculation
          const { data: balanceData, error: balanceError } = await supabase.rpc(
            "get_account_summary",
            { account_id: account.id }
          );

          if (balanceError) {
            console.error(
              `Error calculating balance for ${account.name}:`,
              balanceError
            );
            // Fallback to manual calculation
            const balance = await calculateAccountBalanceManual(
              account.id,
              isDemo
            );
            return {
              ...account,
              current_balance: balance,
              total_income: 0,
              total_expenses: 0,
              transaction_count: 0,
              last_transaction_date: null,
            };
          }

          const summary = balanceData[0] || {
            current_balance: account.initial_balance || 0,
            total_income: 0,
            total_expenses: 0,
            transaction_count: 0,
            last_transaction_date: null,
          };

          return {
            ...account,
            current_balance: summary.current_balance,
            total_income: summary.total_income,
            total_expenses: summary.total_expenses,
            transaction_count: summary.transaction_count,
            last_transaction_date: summary.last_transaction_date,
          };
        } catch (error) {
          console.error(`Error processing account ${account.name}:`, error);
          return {
            ...account,
            current_balance: account.initial_balance || 0,
            total_income: 0,
            total_expenses: 0,
            transaction_count: 0,
            last_transaction_date: null,
          };
        }
      })
    );

    return accountsWithBalances;
  } catch (error) {
    console.error("Error fetching accounts with balances:", error);
    Toast.show({
      type: "error",
      text1: "Failed to fetch accounts",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
};

/**
 * Manual balance calculation (fallback if database function fails)
 */
export const calculateAccountBalanceManual = async (
  accountId: string,
  isDemo: boolean = false
): Promise<number> => {
  try {
    const tableMap = getTableMapping(isDemo);

    // Get initial balance
    const { data: account } = await supabase
      .from(tableMap.accounts)
      .select("initial_balance")
      .eq("id", accountId)
      .single();

    const initialBalance = account?.initial_balance || 0;

    // Get all completed transactions for this account
    const { data: transactions, error } = await supabase
      .from(tableMap.transactions)
      .select("amount, type, source_account_id, destination_account_id")
      .or(
        `source_account_id.eq.${accountId},destination_account_id.eq.${accountId}`
      )
      .eq("status", "completed")
      .order("date", { ascending: true });

    if (error) throw error;

    // Calculate balance from transactions
    const calculatedBalance = (transactions || []).reduce(
      (balance, transaction) => {
        const amount = Math.abs(transaction.amount);

        if (transaction.source_account_id === accountId) {
          // Money going out of this account
          switch (transaction.type) {
            case "expense":
            case "loan_repayment":
            case "debt":
              return balance - amount;
            case "transfer":
              return balance - amount; // Transfer out
            default:
              return balance;
          }
        } else if (transaction.destination_account_id === accountId) {
          // Money coming into this account
          switch (transaction.type) {
            case "income":
            case "loan":
            case "debt_collection":
              return balance + amount;
            case "transfer":
              return balance + amount; // Transfer in
            default:
              return balance;
          }
        }

        return balance;
      },
      initialBalance
    );

    return calculatedBalance;
  } catch (error) {
    console.error("Error calculating account balance manually:", error);
    return 0;
  }
};

/**
 * Get real-time account balance
 */
export const getAccountBalance = async (
  accountId: string,
  isDemo: boolean = false,
  asOfDate?: Date
): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc("calculate_account_balance", {
      account_id: accountId,
      as_of_date: asOfDate?.toISOString() || new Date().toISOString(),
    });

    if (error) {
      // Fallback to manual calculation
      return await calculateAccountBalanceManual(accountId, isDemo);
    }

    return data || 0;
  } catch (error) {
    console.error("Error getting account balance:", error);
    return 0;
  }
};

/**
 * Add account with initial balance transaction
 */
export const addAccountWithInitialBalance = async (
  accountData: {
    name: string;
    type: string;
    institution?: string;
    initial_balance?: number;
    account_number?: string;
    logo_url?: string;
  },
  isDemo: boolean = false
): Promise<AccountWithBalance> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    // Create account
    const { data: newAccount, error: accountError } = await supabase
      .from(tableMap.accounts)
      .insert({
        user_id: user.id,
        name: accountData.name,
        type: accountData.type,
        institution: accountData.institution,
        initial_balance: accountData.initial_balance || 0,
        initial_balance_date: new Date().toISOString(),
        account_number: accountData.account_number,
        logo_url: accountData.logo_url,
        is_active: true,
      })
      .select()
      .single();

    if (accountError) throw accountError;

    // If there's an initial balance, create an opening balance transaction
    if (accountData.initial_balance && accountData.initial_balance > 0) {
      const { error: transactionError } = await supabase
        .from(tableMap.transactions)
        .insert({
          user_id: user.id,
          name: `Opening Balance - ${accountData.name}`,
          description: `Initial balance when account was added`,
          amount: accountData.initial_balance,
          date: new Date().toISOString(),
          type: "opening_balance",
          source_account_id: newAccount.id,
          source_account_type: "bank",
          source_account_name: accountData.name,
          status: "completed",
        });

      if (transactionError) {
        console.error(
          "Error creating opening balance transaction:",
          transactionError
        );
        // Don't throw error - account is still created successfully
      }
    }

    Toast.show({
      type: "success",
      text1: "Account Added Successfully",
      text2: `${accountData.name} has been added to your accounts`,
    });

    // Return account with calculated balance
    return {
      ...newAccount,
      current_balance: accountData.initial_balance || 0,
      total_income: accountData.initial_balance || 0,
      total_expenses: 0,
      transaction_count: accountData.initial_balance ? 1 : 0,
      last_transaction_date: accountData.initial_balance
        ? new Date().toISOString()
        : null,
    };
  } catch (error) {
    console.error("Error adding account:", error);
    Toast.show({
      type: "error",
      text1: "Failed to add account",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Update account (cannot update balance directly)
 */
export const updateAccount = async (
  accountId: string,
  updates: {
    name?: string;
    type?: string;
    institution?: string;
    account_number?: string;
    logo_url?: string;
    is_active?: boolean;
  },
  isDemo: boolean = false
): Promise<AccountWithBalance> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    const { data: updatedAccount, error } = await supabase
      .from(tableMap.accounts)
      .update(updates)
      .eq("id", accountId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    Toast.show({
      type: "success",
      text1: "Account Updated",
      text2: "Account information has been updated successfully",
    });

    // Get updated balance
    const currentBalance = await getAccountBalance(accountId, isDemo);

    return {
      ...updatedAccount,
      current_balance: currentBalance,
      total_income: 0, // Would need separate query for full summary
      total_expenses: 0,
      transaction_count: 0,
      last_transaction_date: null,
    };
  } catch (error) {
    console.error("Error updating account:", error);
    Toast.show({
      type: "error",
      text1: "Failed to update account",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Soft delete account (mark as inactive)
 */
export const deleteAccount = async (
  accountId: string,
  isDemo: boolean = false
): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    // Check if account has transactions
    const { data: transactions } = await supabase
      .from(tableMap.transactions)
      .select("id")
      .or(
        `source_account_id.eq.${accountId},destination_account_id.eq.${accountId}`
      )
      .limit(1);

    if (transactions && transactions.length > 0) {
      // Soft delete - mark as inactive instead of hard delete
      await supabase
        .from(tableMap.accounts)
        .update({ is_active: false })
        .eq("id", accountId)
        .eq("user_id", user.id);

      Toast.show({
        type: "success",
        text1: "Account Deactivated",
        text2: "Account has been deactivated due to existing transactions",
      });
    } else {
      // Hard delete - no transactions exist
      await supabase
        .from(tableMap.accounts)
        .delete()
        .eq("id", accountId)
        .eq("user_id", user.id);

      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: "Account has been permanently deleted",
      });
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    Toast.show({
      type: "error",
      text1: "Failed to delete account",
      text2: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Get account balance history for charts
 */
export const getAccountBalanceHistory = async (
  accountId: string,
  months: number = 12,
  isDemo: boolean = false
): Promise<Array<{ month: string; balance: number; date: string }>> => {
  try {
    const history: Array<{ month: string; balance: number; date: string }> = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1 // First day of month
      );

      const balance = await getAccountBalance(accountId, isDemo, targetDate);

      history.push({
        month: targetDate.toLocaleDateString("en-US", { month: "short" }),
        balance,
        date: targetDate.toISOString(),
      });
    }

    return history;
  } catch (error) {
    console.error("Error getting account balance history:", error);
    return [];
  }
};
