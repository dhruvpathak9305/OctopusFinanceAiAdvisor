import { supabase } from "./supabaseClient";

export interface AccountBalance {
  id: string;
  account_id: string;
  user_id: string;
  opening_balance: number;
  current_balance: number;
  last_updated: string;
  created_at: string;
  // Include account details for convenience
  account_name?: string;
  account_type?: string;
  account_institution?: string;
  account_number?: string;
  currency?: string;
}

export interface BalanceSummary {
  total_balance: number;
  accounts_count: number;
  last_updated: string;
  balances_by_type: {
    [key: string]: {
      balance: number;
      count: number;
    };
  };
}

/**
 * Balance Service - Handles all balance-related operations
 * Balances are automatically updated via database triggers when transactions change
 */
export class BalanceService {
  /**
   * Fetch all account balances for a user
   */
  static async fetchAccountBalances(
    userId?: string,
    isDemo: boolean = false
  ): Promise<AccountBalance[]> {
    try {
      if (isDemo) {
        return this.getMockAccountBalances();
      }

      // Get current user for verification
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Use simplified query with denormalized fields - no JOIN needed!
      const { data, error } = await (supabase as any)
        .from("balance_real")
        .select("*")
        .order("last_updated", { ascending: false });

      if (error) {
        console.error("Error fetching account balances:", error);
        throw error;
      }

      // Transform the data using denormalized fields (no JOIN needed!)
      const transformedData = (data || []).map((balance: any) => {
        const transformed = {
          id: balance.id,
          account_id: balance.account_id,
          user_id: balance.user_id,
          opening_balance: parseFloat(balance.opening_balance) || 0,
          current_balance: parseFloat(balance.current_balance) || 0,
          last_updated: balance.last_updated,
          created_at: balance.created_at,
          account_name: balance.account_name, // From denormalized field
          account_type: balance.account_type, // From denormalized field
          account_institution: balance.institution_name, // From denormalized field
          account_number: balance.account_number, // From denormalized field
          currency: balance.currency || "INR", // From denormalized field
        };
        return transformed;
      });

      const totalCurrentBalance = transformedData.reduce(
        (sum: number, b: AccountBalance) => sum + b.current_balance,
        0
      );

      return transformedData;
    } catch (error) {
      console.error("Error in fetchAccountBalances:", error);
      throw error;
    }
  }

  /**
   * Get balance for a specific account
   */
  static async fetchAccountBalance(
    accountId: string,
    isDemo: boolean = false
  ): Promise<AccountBalance | null> {
    try {
      if (isDemo) {
        const mockBalances = this.getMockAccountBalances();
        return mockBalances.find((b) => b.account_id === accountId) || null;
      }

      const { data, error } = await (supabase as any)
        .from("balance_real")
        .select("*")
        .eq("account_id", accountId)
        .single();

      if (error) {
        console.error("Error fetching account balance:", error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        account_id: data.account_id,
        user_id: data.user_id,
        opening_balance: parseFloat(data.opening_balance) || 0,
        current_balance: parseFloat(data.current_balance) || 0,
        last_updated: data.last_updated,
        created_at: data.created_at,
        account_name: data.account_name, // From denormalized field
        account_type: data.account_type, // From denormalized field
        account_institution: data.institution_name, // From denormalized field
        account_number: data.account_number, // From denormalized field
        currency: data.currency || "INR", // From denormalized field
      };
    } catch (error) {
      console.error("Error in fetchAccountBalance:", error);
      throw error;
    }
  }

  /**
   * Get balance summary (total balance, counts by type, etc.)
   */
  static async getBalanceSummary(
    userId?: string,
    isDemo: boolean = false
  ): Promise<BalanceSummary> {
    try {
      const accountBalances = await this.fetchAccountBalances(userId, isDemo);

      const totalBalance = accountBalances.reduce(
        (sum, balance) => sum + balance.current_balance,
        0
      );
      const accountsCount = accountBalances.length;
      const lastUpdated =
        accountBalances.length > 0
          ? accountBalances.reduce(
              (latest, balance) =>
                new Date(balance.last_updated) > new Date(latest)
                  ? balance.last_updated
                  : latest,
              accountBalances[0].last_updated
            )
          : new Date().toISOString();

      // Group balances by account type
      const balancesByType = accountBalances.reduce((groups: any, balance) => {
        const type = balance.account_type || "unknown";
        if (!groups[type]) {
          groups[type] = { balance: 0, count: 0 };
        }
        groups[type].balance += balance.current_balance;
        groups[type].count += 1;
        return groups;
      }, {});

      return {
        total_balance: totalBalance,
        accounts_count: accountsCount,
        last_updated: lastUpdated,
        balances_by_type: balancesByType,
      };
    } catch (error) {
      console.error("Error in getBalanceSummary:", error);
      throw error;
    }
  }

  /**
   * Create initial balance record for a new account
   * Note: This is typically handled by database triggers, but can be called manually
   */
  static async createAccountBalance(
    accountId: string,
    userId: string,
    initialBalance: number = 0,
    isDemo: boolean = false
  ): Promise<AccountBalance> {
    try {
      if (isDemo) {
        throw new Error("Cannot create balance records in demo mode");
      }

      const { data, error } = await (supabase as any)
        .from("balance_real")
        .insert({
          account_id: accountId,
          user_id: userId,
          opening_balance: initialBalance,
          current_balance: initialBalance,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating account balance:", error);
        throw error;
      }

      return {
        id: data.id,
        account_id: data.account_id,
        user_id: data.user_id,
        opening_balance: parseFloat(data.opening_balance) || 0,
        current_balance: parseFloat(data.current_balance) || 0,
        last_updated: data.last_updated,
        created_at: data.created_at,
        account_name: data.account_name, // From denormalized field
        account_type: data.account_type, // From denormalized field
        account_institution: data.institution_name, // From denormalized field
        account_number: data.account_number, // From denormalized field
        currency: data.currency || "INR", // From denormalized field
      };
    } catch (error) {
      console.error("Error in createAccountBalance:", error);
      throw error;
    }
  }

  /**
   * Set opening balance for a new account (updates both opening and current balance)
   */
  static async setOpeningBalance(
    accountId: string,
    openingBalance: number,
    isDemo: boolean = false
  ): Promise<AccountBalance> {
    try {
      if (isDemo) {
        throw new Error("Cannot set opening balance in demo mode");
      }

      const { data, error } = await (supabase as any)
        .from("balance_real")
        .update({
          opening_balance: openingBalance,
          current_balance: openingBalance, // Set current balance to opening balance
          last_updated: new Date().toISOString(),
        })
        .eq("account_id", accountId)
        .select("*")
        .single();

      if (error) {
        console.error("Error setting opening balance:", error);
        throw error;
      }

      return {
        id: data.id,
        account_id: data.account_id,
        user_id: data.user_id,
        opening_balance: parseFloat(data.opening_balance) || 0,
        current_balance: parseFloat(data.current_balance) || 0,
        last_updated: data.last_updated,
        created_at: data.created_at,
        account_name: data.account_name, // From denormalized field
        account_type: data.account_type, // From denormalized field
        account_institution: data.institution_name, // From denormalized field
        account_number: data.account_number, // From denormalized field
        currency: data.currency || "INR", // From denormalized field
      };
    } catch (error) {
      console.error("Error in setOpeningBalance:", error);
      throw error;
    }
  }

  /**
   * Manual balance adjustment (for corrections, not typical transaction flow)
   */
  static async adjustAccountBalance(
    accountId: string,
    newBalance: number,
    reason: string = "Manual adjustment",
    isDemo: boolean = false
  ): Promise<AccountBalance> {
    try {
      if (isDemo) {
        throw new Error("Cannot adjust balance in demo mode");
      }

      const { data, error } = await (supabase as any)
        .from("balance_real")
        .update({
          current_balance: newBalance,
          last_updated: new Date().toISOString(),
        })
        .eq("account_id", accountId)
        .select("*")
        .single();

      if (error) {
        console.error("Error adjusting account balance:", error);
        throw error;
      }

      return {
        id: data.id,
        account_id: data.account_id,
        user_id: data.user_id,
        opening_balance: parseFloat(data.opening_balance) || 0,
        current_balance: parseFloat(data.current_balance) || 0,
        last_updated: data.last_updated,
        created_at: data.created_at,
        account_name: data.account_name, // From denormalized field
        account_type: data.account_type, // From denormalized field
        account_institution: data.institution_name, // From denormalized field
        account_number: data.account_number, // From denormalized field
        currency: data.currency || "INR", // From denormalized field
      };
    } catch (error) {
      console.error("Error in adjustAccountBalance:", error);
      throw error;
    }
  }

  /**
   * Recalculate balance for an account based on all its transactions
   * Useful for data integrity checks or initial setup
   */
  static async recalculateAccountBalance(
    accountId: string,
    isDemo: boolean = false
  ): Promise<AccountBalance> {
    try {
      if (isDemo) {
        throw new Error("Cannot recalculate balance in demo mode");
      }

      // Get the account's opening balance
      const currentBalance = await this.fetchAccountBalance(accountId, false);
      if (!currentBalance) {
        throw new Error("Account balance record not found");
      }

      // Calculate balance based on all transactions
      const { data: transactions, error: transactionError } = await (
        supabase as any
      )
        .from("transactions_real")
        .select("amount, source_account_id, destination_account_id")
        .or(
          `source_account_id.eq.${accountId},destination_account_id.eq.${accountId}`
        );

      if (transactionError) {
        throw transactionError;
      }

      let calculatedBalance = currentBalance.opening_balance;

      transactions?.forEach((transaction: any) => {
        const amount = parseFloat(transaction.amount) || 0;

        if (transaction.source_account_id === accountId) {
          // Money going out (subtract)
          calculatedBalance -= amount;
        }
        if (transaction.destination_account_id === accountId) {
          // Money coming in (add)
          calculatedBalance += amount;
        }
      });

      // Update the balance record
      return await this.adjustAccountBalance(
        accountId,
        calculatedBalance,
        "Recalculated from transactions",
        false
      );
    } catch (error) {
      console.error("Error in recalculateAccountBalance:", error);
      throw error;
    }
  }

  /**
   * Mock data for demo mode
   */
  private static getMockAccountBalances(): AccountBalance[] {
    return [
      {
        id: "mock-balance-1",
        account_id: "mock-account-1",
        user_id: "demo-user",
        opening_balance: 500000,
        current_balance: 1841719,
        last_updated: new Date().toISOString(),
        created_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        account_name: "ICICI Savings",
        account_type: "savings",
        account_institution: "ICICI Bank",
        account_number: "****1234",
        currency: "INR",
      },
      {
        id: "mock-balance-2",
        account_id: "mock-account-2",
        user_id: "demo-user",
        opening_balance: 100000,
        current_balance: 875000,
        last_updated: new Date().toISOString(),
        created_at: new Date(
          Date.now() - 25 * 24 * 60 * 60 * 1000
        ).toISOString(),
        account_name: "HDFC Current",
        account_type: "current",
        account_institution: "HDFC Bank",
        account_number: "****5678",
        currency: "INR",
      },
      {
        id: "mock-balance-3",
        account_id: "mock-account-3",
        user_id: "demo-user",
        opening_balance: 200000,
        current_balance: 1425000,
        last_updated: new Date().toISOString(),
        created_at: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        account_name: "SBI PPF",
        account_type: "investment",
        account_institution: "State Bank of India",
        account_number: "****9012",
        currency: "INR",
      },
      {
        id: "mock-balance-4",
        account_id: "mock-account-4",
        user_id: "demo-user",
        opening_balance: 0,
        current_balance: 700000,
        last_updated: new Date().toISOString(),
        created_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        account_name: "Axis Salary",
        account_type: "salary",
        account_institution: "Axis Bank",
        account_number: "****3456",
        currency: "INR",
      },
    ];
  }
}

export default BalanceService;
