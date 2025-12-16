/**
 * Transactions Service
 *
 * This service handles all transaction-related operations and is the core of the financial tracking system.
 *
 * Use Cases:
 * - Fetch transactions with advanced filtering (type, date range, amount, category, search)
 * - Add new transactions (income, expenses, transfers, loans, debts)
 * - Update existing transaction details
 * - Delete transactions with user validation
 * - Generate transaction summaries and analytics
 * - Calculate monthly spending patterns and trends
 * - Handle transaction history for charts and reports
 * - Support recurring transactions and bill management
 * - Process credit card and bank account transactions
 *
 * Key Functions:
 * - fetchTransactions(): Advanced transaction filtering and retrieval
 * - fetchTransactionById(): Get specific transaction details
 * - addTransaction(): Create new financial transactions
 * - updateTransaction(): Modify existing transactions
 * - deleteTransaction(): Remove transactions safely
 * - fetchTransactionSummary(): Generate spending/income analytics
 * - fetchMonthlyTransactionSummary(): Monthly financial overview
 * - fetchTransactionHistory(): Historical data for charting
 *
 * Transaction Types Supported:
 * - Income (salary, freelance, investments)
 * - Expenses (bills, shopping, dining, etc.)
 * - Transfers (between accounts)
 * - Loans (money borrowed)
 * - Loan repayments
 * - Debt management
 * - Debt collection
 *
 * Advanced Features:
 * - Period-over-period comparison analytics
 * - Percentage change calculations
 * - Date range filtering with boundary handling
 * - Search across multiple fields (name, description, merchant)
 * - Category and subcategory relationship management
 * - Recurring transaction patterns
 * - Credit card vs bank account distinction
 * - Demo/production environment support
 *
 * Helper Functions:
 * - prepareTransactionForInsert(): Data transformation for database
 * - transformTransactionResponse(): Clean API response formatting
 * - getMonthlyDateRanges(): Date calculation utilities
 * - buildTransactionSelectQuery(): Dynamic query building
 *
 * This service is heavily used throughout the app for financial insights and transaction management.
 */

import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";
import { TABLE_NAMES, getTableName } from "../constants/TableNames";
import { addDays, subDays, startOfDay, endOfDay, format } from "date-fns";
import {
  getTableMap,
  validateTableConsistency,
  type TableMap,
  type RelationshipDefinition,
} from "../utils/tableMapping";
import { Transaction } from "../types/transactions";
import { emitBalanceUpdate } from "../utils/balanceEventEmitter";

// Re-export Transaction for backward compatibility
export type { Transaction };

export interface TransactionFilters {
  type?:
    | "income"
    | "expense"
    | "transfer"
    | "loan"
    | "loan_repayment"
    | "debt"
    | "debt_collection"
    | "all";
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min?: number;
    max?: number;
  };
  institution?: string;
  category?: string;
  subcategory?: string;
  accountId?: string;
  isCreditCard?: boolean;
  searchQuery?: string;
}

export interface TransactionSummary {
  total: number;
  count: number;
  averageAmount: number;
  periodComparison?: {
    current: number;
    previous: number;
    percentageChange: number;
  };
}

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);

  // Validate consistency during development
  if (process.env.NODE_ENV === "development") {
    validateTableConsistency(tableMap);
  }

  return tableMap;
};

// Helper function to build select query with proper relationships
const buildTransactionSelectQuery = (tableMap: TableMap): string => {
  // Define the relationships for transactions
  const relationships: RelationshipDefinition[] = [
    {
      table: "budget_categories",
      foreignKey: "category_id",
      columns: "name, ring_color, bg_color, icon",
      alias: "budget_categories",
    },
    {
      table: "budget_subcategories",
      foreignKey: "subcategory_id",
      columns: "name, icon, color",
      alias: "budget_subcategories",
    },
  ];

  // Build the select clause with proper foreign key names based on table mapping
  const isDemo = !tableMap.transactions.includes("_real");
  let selectClause = "*";

  if (relationships.length > 0) {
    const relationshipClauses = relationships.map((rel) => {
      const targetTable = tableMap[rel.table];
      const sourceTable = tableMap.transactions;

      // Generate proper foreign key name for the current mode
      const fkName = `${sourceTable}_${rel.foreignKey}_fkey`;
      const alias = rel.alias || (rel.table as string);

      return `${alias}:${targetTable}!${fkName}(${rel.columns})`;
    });

    selectClause = `*, ${relationshipClauses.join(", ")}`;
  }

  return selectClause;
};

// Helper function to get the appropriate table name
const getTransactionTableName = (isDemo: boolean = false): string => {
  return getTableName("TRANSACTIONS", isDemo);
};

// Helper function to build date range filters (UTC, end-exclusive)
// We normalize both start and end to UTC midnight and treat the end
// as exclusive to avoid timezone boundary issues (e.g., 30th 00:00:00+00).
const buildDateRangeFilter = (dateRange?: { start: Date; end: Date }) => {
  if (!dateRange) return {} as { gte?: string; lt?: string };

  // Use LOCAL calendar components to preserve the intended calendar day,
  // then construct an equivalent UTC boundary. This avoids shifting the
  // day backward/forward due to timezone offsets.
  const start = new Date(Date.UTC(
    dateRange.start.getFullYear(),
    dateRange.start.getMonth(),
    dateRange.start.getDate(),
    0, 0, 0, 0
  ));

  // Make end exclusive by moving to the start of the next day in UTC
  const endExclusive = new Date(Date.UTC(
    dateRange.end.getFullYear(),
    dateRange.end.getMonth(),
    dateRange.end.getDate(),
    0, 0, 0, 0
  ));
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return {
    gte: start.toISOString(),
    lt: endExclusive.toISOString(),
  } as { gte: string; lt: string };
};

// Helper function to get current and previous month date ranges
export const getMonthlyDateRanges = (targetDate: Date = new Date()) => {
  const currentYear = targetDate.getUTCFullYear();
  const currentMonth = targetDate.getUTCMonth();

  // Current month
  const currentMonthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
  const currentMonthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

  // Previous month
  const previousMonthStart = new Date(
    Date.UTC(currentYear, currentMonth - 1, 1)
  );
  const previousMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0));

  return {
    current: { start: currentMonthStart, end: currentMonthEnd },
    previous: { start: previousMonthStart, end: previousMonthEnd },
  };
};

// Helper function to prepare transaction data for insert
export const prepareTransactionForInsert = (
  transaction: Omit<
    Transaction,
    "id" | "user_id" | "created_at" | "updated_at"
  >,
  userId: string
): any => {
  return {
    name: transaction.name || transaction.description,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    type: transaction.type,
    category_id: transaction.category_id,
    subcategory_id: transaction.subcategory_id,
    icon: transaction.icon,
    merchant: transaction.merchant,
    source_account_id: transaction.source_account_id,
    source_account_type: transaction.source_account_type || "bank",
    source_account_name: transaction.source_account_name,
    destination_account_id: transaction.destination_account_id,
    destination_account_type: transaction.destination_account_type,
    destination_account_name: transaction.destination_account_name,
    is_recurring: transaction.is_recurring || false,
    recurrence_pattern: transaction.recurrence_pattern,
    recurrence_end_date: transaction.recurrence_end_date,
    parent_transaction_id: transaction.parent_transaction_id,
    interest_rate: transaction.interest_rate,
    loan_term_months: transaction.loan_term_months,
    // ❌ EXCLUDE is_credit_card - it's a GENERATED column that's computed automatically
    user_id: userId,
    metadata: transaction.metadata || {},
    created_at: new Date().toISOString(),
  };
};

// Helper function to transform raw database response to standard Transaction format
export const transformTransactionResponse = (rawData: any): Transaction => {
  return {
    ...rawData,
    name: rawData.name || rawData.description,
    category_name:
      rawData.budget_categories?.name || rawData.category_name || null,
    subcategory_name:
      rawData.budget_subcategories?.name || rawData.subcategory_name || null,
    // Extract subcategory icon and color if available
    subcategory_icon: rawData.budget_subcategories?.icon || null,
    subcategory_color: rawData.budget_subcategories?.color || null,
    // Extract category icons and colors if available
    category_icon: rawData.budget_categories?.icon || null,
    category_ring_color: rawData.budget_categories?.ring_color || null,
    category_bg_color: rawData.budget_categories?.bg_color || null,
    // Remove nested objects to keep structure clean
    budget_categories: undefined,
    budget_subcategories: undefined,
  } as Transaction;
};

// Fetch single transaction by ID
export const fetchTransactionById = async (
  id: string,
  isDemo: boolean = false
): Promise<Transaction | null> => {
  try {
    // For demo mode, use existing Supabase flow
    if (isDemo) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);
      const selectQuery = buildTransactionSelectQuery(tableMap);

      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .select(selectQuery)
        .eq("user_id", user.id)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        if (error.code !== "PGRST116") {
          // Let caller handle error notifications
        }
        throw error;
      }

      return data ? transformTransactionResponse(data) : null;
    }

    // For real mode, use offline-first repository
    const { getTransactionsRepository } = await import('./repositories/repositoryAdapter');
    const repo = await getTransactionsRepository();
    
    return await repo.findById(id);
  } catch (error) {
    console.error("Error in fetchTransactionById:", error);
    throw error;
  }
};

// Fetch transactions with comprehensive filtering
export const fetchTransactions = async (
  filters: TransactionFilters = {},
  isDemo: boolean = false
): Promise<Transaction[]> => {
  try {
    // For demo mode, use existing Supabase flow
    if (isDemo) {
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
        console.error("fetchTransactions - auth error:", authError);
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);
      const selectQuery = buildTransactionSelectQuery(tableMap);

      // Use type assertion to handle dynamic table names
      let query = (supabase as any)
        .from(tableMap.transactions)
        .select(selectQuery)
        .eq("user_id", user.id);

      // Apply filters (existing logic)
      if (filters.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      if (filters.dateRange) {
        const dateFilter = buildDateRangeFilter(filters.dateRange) as {
          gte?: string;
          lt?: string;
        };
        if (dateFilter.gte) query = query.gte("date", dateFilter.gte);
        if (dateFilter.lt) query = query.lt("date", dateFilter.lt);
      }

      if (filters.institution) {
        query = query.eq("institution", filters.institution);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.subcategory) {
        query = query.eq("subcategory", filters.subcategory);
      }

      if (filters.accountId) {
        if (filters.type === "income") {
          query = query.eq("destination_account_id", filters.accountId);
        } else {
          query = query.eq("source_account_id", filters.accountId);
        }
      }

      if (filters.isCreditCard !== undefined) {
        query = query.eq("is_credit_card", filters.isCreditCard);
      }

      if (filters.amountRange?.min !== undefined) {
        query = query.gte("amount", filters.amountRange.min);
      }
      if (filters.amountRange?.max !== undefined) {
        query = query.lte("amount", filters.amountRange.max);
      }

      if (filters.searchQuery) {
        query = query.or(
          `description.ilike.%${filters.searchQuery}%,category.ilike.%${filters.searchQuery}%,subcategory.ilike.%${filters.searchQuery}%`
        );
      }

      query = query.order("date", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      const transactions = (data || []).map(transformTransactionResponse);
      return transactions;
    }

    // For real mode, use offline-first repository
    const { getTransactionsRepository, convertTransactionFilters, getRepositoryContext } = await import('./repositories/repositoryAdapter');
    const context = await getRepositoryContext();
    const repo = await getTransactionsRepository();
    
    const repoFilters = convertTransactionFilters(filters, context.userId);
    const transactions = await repo.findAll(repoFilters);
    
    return transactions;
  } catch (error) {
    console.error("Error in fetchTransactions:", error);
    throw error;
  }
};

// Fetch transaction summary with optional comparison
export const fetchTransactionSummary = async (
  filters: TransactionFilters = {},
  isDemo: boolean = false,
  includeComparison: boolean = true
): Promise<TransactionSummary> => {
  try {
    const transactions = await fetchTransactions(filters, isDemo);

    // Calculate basic summary
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const count = transactions.length;
    const averageAmount = count > 0 ? total / count : 0;

    let periodComparison;

    // If comparison is requested and we have a date range, calculate previous period
    if (includeComparison && filters.dateRange) {
      const { start, end } = filters.dateRange;
      const periodLength = end.getTime() - start.getTime();

      // Calculate previous period dates
      const previousEnd = new Date(start.getTime() - 1); // One day before current period start
      const previousStart = new Date(previousEnd.getTime() - periodLength);

      const previousFilters: TransactionFilters = {
        ...filters,
        dateRange: { start: previousStart, end: previousEnd },
      };

      const previousTransactions = await fetchTransactions(
        previousFilters,
        isDemo
      );
      const previousTotal = previousTransactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );

      const percentageChange =
        previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

      periodComparison = {
        current: total,
        previous: previousTotal,
        percentageChange,
      };
    }

    return {
      total,
      count,
      averageAmount,
      periodComparison,
    };
  } catch (error) {
    console.error("Error in fetchTransactionSummary:", error);
    throw error;
  }
};

// Fetch monthly transaction summary (current vs previous month)
export const fetchMonthlyTransactionSummary = async (
  type: "income" | "expense" | "all" = "all",
  isDemo: boolean = false,
  targetDate: Date = new Date()
): Promise<TransactionSummary> => {
  try {
    const { current, previous } = getMonthlyDateRanges(targetDate);

    // Fetch current month
    const currentFilters: TransactionFilters = {
      type: type === "all" ? undefined : type,
      dateRange: current,
    };

    // Fetch previous month
    const previousFilters: TransactionFilters = {
      type: type === "all" ? undefined : type,
      dateRange: previous,
    };

    const [currentTransactions, previousTransactions] = await Promise.all([
      fetchTransactions(currentFilters, isDemo),
      fetchTransactions(previousFilters, isDemo),
    ]);

    // Calculate totals
    const currentTotal = currentTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const previousTotal = previousTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const count = currentTransactions.length;
    const averageAmount = count > 0 ? currentTotal / count : 0;

    // Calculate percentage change
    const percentageChange =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
      total: currentTotal,
      count,
      averageAmount,
      periodComparison: {
        current: currentTotal,
        previous: previousTotal,
        percentageChange,
      },
    };
  } catch (error) {
    console.error("Error in fetchMonthlyTransactionSummary:", error);
    throw error;
  }
};

// Fetch transaction history for charts (multiple months)
export const fetchTransactionHistory = async (
  filters: TransactionFilters = {},
  isDemo: boolean = false,
  months: number = 12
): Promise<{ month: string; value: number }[]> => {
  try {
    const results: { month: string; value: number }[] = [];
    const currentDate = new Date();

    // Generate data for each month
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const startOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0
      );

      const monthFilters: TransactionFilters = {
        ...filters,
        dateRange: { start: startOfMonth, end: endOfMonth },
      };

      try {
        const monthTransactions = await fetchTransactions(monthFilters, isDemo);
        const total = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);

        results.push({
          month: monthDate.toLocaleDateString("en-US", { month: "short" }),
          value: total,
        });
      } catch (error) {
        console.error(
          `Error fetching data for ${monthDate.toLocaleDateString()}:`,
          error
        );
        // Add placeholder data for failed months
        results.push({
          month: monthDate.toLocaleDateString("en-US", { month: "short" }),
          value: 0,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in fetchTransactionHistory:", error);
    // Return placeholder data if there's a general error
    return generatePlaceholderHistory(months);
  }
};

// Generate placeholder history data
const generatePlaceholderHistory = (
  months: number = 12
): { month: string; value: number }[] => {
  const results: { month: string; value: number }[] = [];
  const currentDate = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const baseValue = Math.random() * 1000 + 500; // Random value between 500-1500

    results.push({
      month: monthDate.toLocaleDateString("en-US", { month: "short" }),
      value: Math.round(baseValue),
    });
  }

  return results;
};

// Add transaction
export const addTransaction = async (
  transaction: Omit<
    Transaction,
    "id" | "user_id" | "created_at" | "updated_at"
  >,
  isDemo: boolean = false
): Promise<Transaction> => {
  try {
    // For demo mode, use existing Supabase flow
    if (isDemo) {
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
        console.error("addTransaction - auth error:", authError);
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);
      const selectQuery = buildTransactionSelectQuery(tableMap);
      const transactionData = prepareTransactionForInsert(transaction, user.id);

      // Insert the transaction using dynamic table name
      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .insert([transactionData])
        .select(selectQuery)
        .single();

      if (error) {
        console.error("Error adding transaction:", error);
        throw error;
      }

      const newTransaction = transformTransactionResponse(data);
      emitBalanceUpdate("transaction-added", newTransaction.id);
      return newTransaction;
    }

    // For real mode, use offline-first repository
    const { getTransactionsRepository, getRepositoryContext } = await import('./repositories/repositoryAdapter');
    const context = await getRepositoryContext();
    const repo = await getTransactionsRepository();
    
    const transactionData = {
      ...transaction,
      user_id: context.userId,
    };

    const newTransaction = await repo.create(transactionData as any);
    
    // Emit balance update event
    emitBalanceUpdate("transaction-added", newTransaction.id);

    return newTransaction;
  } catch (error) {
    console.error("Error in addTransaction:", error);
    throw error;
  }
};

// Update transaction
export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>,
  isDemo: boolean = false
): Promise<Transaction> => {
  try {
    // For demo mode, use existing Supabase flow
    if (isDemo) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);
      const selectQuery = buildTransactionSelectQuery(tableMap);

      const updateData: Record<string, any> = { ...updates };
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.created_at;
      delete updateData.category_name;
      delete updateData.subcategory_name;
      delete updateData.budget_categories;
      delete updateData.budget_subcategories;

      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select(selectQuery)
        .single();

      if (error) {
        console.error("Error updating transaction:", error);
        throw error;
      }

      const updatedTransaction = transformTransactionResponse(data);
      emitBalanceUpdate("transaction-updated", updatedTransaction.id);
      return updatedTransaction;
    }

    // For real mode, use offline-first repository
    const { getTransactionsRepository } = await import('./repositories/repositoryAdapter');
    const repo = await getTransactionsRepository();
    
    const updateData: any = { ...updates };
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;
    
    const updatedTransaction = await repo.update(id, updateData);
    
    emitBalanceUpdate("transaction-updated", updatedTransaction.id);
    return updatedTransaction;
  } catch (error) {
    console.error("Error in updateTransaction:", error);
    throw error;
  }
};

// Delete transaction
export const deleteTransaction = async (
  id: string,
  isDemo: boolean = false
): Promise<void> => {
  try {
    // For demo mode, use existing Supabase flow
    if (isDemo) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);

      const { error } = await (supabase as any)
        .from(tableMap.transactions)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting transaction:", error);
        throw error;
      }

      emitBalanceUpdate("transaction-deleted", id);
      return;
    }

    // For real mode, use offline-first repository
    const { getTransactionsRepository } = await import('./repositories/repositoryAdapter');
    const repo = await getTransactionsRepository();
    
    await repo.delete(id);
    
    emitBalanceUpdate("transaction-deleted", id);
  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    throw error;
  }
};

/**
 * Fetch transactions for a specific account with single-entry transfer system support.
 * This handles both:
 * - Transactions where the account is the SOURCE (outgoing: expenses, transfers out, income)
 * - Transfers where the account is the DESTINATION (incoming transfers)
 * 
 * @param accountId - The account ID to fetch transactions for
 * @param isDemo - Whether to use demo tables
 * @returns Combined array of transactions with direction indicator
 */
export const fetchAccountTransactions = async (
  accountId: string,
  isDemo: boolean = false
): Promise<(Transaction & { direction: 'outgoing' | 'incoming' })[]> => {
  try {
    const tableMap = getTableMapping(isDemo);
    const selectQuery = buildTransactionSelectQuery(tableMap);

    // 1. Get transactions where account is SOURCE (all types)
    const { data: sourceTransactions, error: sourceError } = await (supabase as any)
      .from(tableMap.transactions)
      .select(selectQuery)
      .eq("source_account_id", accountId)
      .order("date", { ascending: false });

    if (sourceError) {
      console.error("Error fetching source transactions:", sourceError);
      throw sourceError;
    }

    // 2. Get transfers where account is DESTINATION (incoming only)
    const { data: destinationTransfers, error: destError } = await (supabase as any)
      .from(tableMap.transactions)
      .select(selectQuery)
      .eq("destination_account_id", accountId)
      .eq("type", "transfer")  // Only transfers have destination accounts
      .order("date", { ascending: false });

    if (destError) {
      console.error("Error fetching destination transfers:", destError);
      throw destError;
    }

    // 3. Combine and mark direction
    const sourceWithDirection = (sourceTransactions || []).map((tx: any) => ({
      ...transformTransactionResponse(tx),
      direction: 'outgoing' as const
    }));

    const destinationWithDirection = (destinationTransfers || []).map((tx: any) => ({
      ...transformTransactionResponse(tx),
      direction: 'incoming' as const
    }));

    // 4. Combine and sort by date
    const allTransactions = [...sourceWithDirection, ...destinationWithDirection].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log(
      `✅ fetchAccountTransactions: Found ${sourceWithDirection.length} outgoing + ${destinationWithDirection.length} incoming = ${allTransactions.length} total transactions`
    );

    return allTransactions;
  } catch (error) {
    console.error("Error in fetchAccountTransactions:", error);
    throw error;
  }
};

/**
 * Calculate the current balance for an account using single-entry transfer system.
 * Formula:
 * Balance = initial_balance 
 *           + income (source)
 *           - expenses (source)
 *           - transfers OUT (source)
 *           + transfers IN (destination)
 * 
 * @param accountId - The account ID to calculate balance for
 * @param isDemo - Whether to use demo tables
 * @returns The calculated current balance
 */
export const calculateAccountBalance = async (
  accountId: string,
  isDemo: boolean = false
): Promise<number> => {
  try {
    const tableMap = getTableMapping(isDemo);

    // 1. Get account's initial balance
    const { data: account, error: accountError } = await (supabase as any)
      .from(tableMap.accounts)
      .select("initial_balance, current_balance")
      .eq("id", accountId)
      .single();

    if (accountError) {
      console.error("Error fetching account:", accountError);
      throw accountError;
    }

    let calculatedBalance = parseFloat(account?.initial_balance || 0);

    // 2. Get all transactions where this account is SOURCE
    const { data: sourceTransactions, error: sourceError } = await (supabase as any)
      .from(tableMap.transactions)
      .select("type, amount")
      .eq("source_account_id", accountId);

    if (sourceError) {
      console.error("Error fetching source transactions:", sourceError);
      throw sourceError;
    }

    // 3. Apply source transactions
    (sourceTransactions || []).forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") {
        calculatedBalance += amount;  // Add income
      } else {
        calculatedBalance -= amount;  // Subtract expenses/transfers
      }
    });

    // 4. Get all transfers where this account is DESTINATION
    const { data: incomingTransfers, error: destError } = await (supabase as any)
      .from(tableMap.transactions)
      .select("amount")
      .eq("destination_account_id", accountId)
      .eq("type", "transfer");

    if (destError) {
      console.error("Error fetching incoming transfers:", destError);
      throw destError;
    }

    // 5. Add incoming transfers
    (incomingTransfers || []).forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      calculatedBalance += amount;  // Add incoming transfers
    });

    console.log(
      `💰 Balance calculation for ${accountId}:`,
      {
        initial: account?.initial_balance,
        calculated: calculatedBalance,
        stored: account?.current_balance,
        sourceCount: sourceTransactions?.length || 0,
        incomingCount: incomingTransfers?.length || 0
      }
    );

    return calculatedBalance;
  } catch (error) {
    console.error("Error in calculateAccountBalance:", error);
    throw error;
  }
};
