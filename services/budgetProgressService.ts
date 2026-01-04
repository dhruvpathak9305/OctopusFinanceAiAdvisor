// =====================================================
// STEP 5: TYPESCRIPT SERVICE IMPLEMENTATION
// =====================================================
// Purpose: TypeScript service layer for budget progress functionality
// Expected Outcome: Type-safe API for React Native components to consume budget data
// Dependencies: Database functions from STEP 2, 3, 4 must be created first
// Usage: Import and use in React Native components for budget progress features
// =====================================================

import { supabase } from "./supabaseClient";
import networkMonitor from "./sync/networkMonitor";

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface BudgetProgressItem {
  category_id: string;
  category_name: string;
  category_type: "expense" | "income";
  budget_limit: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: "under_budget" | "on_budget" | "over_budget" | "not_set";
  ring_color: string;
  bg_color: string;
  icon: string;
  display_order: number;
}

export interface BudgetSummary {
  category_type: "expense" | "income";
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_percentage: number;
  category_count: number;
  over_budget_count: number;
  under_budget_count: number;
}

export interface SubcategoryProgress {
  subcategory_id: string;
  subcategory_name: string;
  budget_limit: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  color: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  transaction_count: number;
}

export interface CategoryDetails {
  category_id: string;
  category_name: string;
  category_type: "expense" | "income";
  budget_limit: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: "under_budget" | "on_budget" | "over_budget" | "not_set";
  ring_color: string;
  bg_color: string;
  icon: string;
  subcategory_count: number;
  active_subcategory_count: number;
  recent_transactions_count: number;
  period_start: string;
  period_end: string;
}

export interface BudgetOverview {
  total_income_budget: number;
  total_income_actual: number;
  total_expense_budget: number;
  total_expense_actual: number;
  net_budget: number;
  net_actual: number;
  savings_rate: number;
  categories_over_budget: number;
  categories_under_budget: number;
  total_categories: number;
}

export interface SubcategoryTransaction {
  transaction_id: string;
  transaction_name: string;
  amount: number;
  date: string;
  merchant?: string;
  description?: string;
}

export type PeriodType = "monthly" | "quarterly" | "yearly";
export type TransactionType = "expense" | "income" | "all";

// =====================================================
// MAIN SERVICE FUNCTIONS
// =====================================================

/**
 * Get budget progress for all categories (powers main Budget Progress section)
 * @param userId - User UUID
 * @param transactionType - Type of transactions to include
 * @param periodType - Time period for calculations
 * @returns Array of budget progress items for each category
 */
export async function getBudgetProgress(
  userId: string,
  transactionType: TransactionType = "expense",
  periodType: PeriodType = "monthly",
  retryCount: number = 0
): Promise<BudgetProgressItem[]> {
  try {
    // Check network status before making request
    const isOnline = networkMonitor.isCurrentlyOnline();
    if (!isOnline) {
      // Silently return empty array when offline - don't log as error
      return [];
    }

    // Add a small delay before retries to prevent overwhelming the server
    if (retryCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500 * retryCount));
    }

    const { data, error } = await (supabase as any).rpc("get_budget_progress", {
      p_user_id: userId,
      p_transaction_type: transactionType,
      p_period_type: periodType,
    });

    if (error) {
      // Check if it's a network error
      const isNetworkError = 
        error.message?.includes("Network request failed") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("network") ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT";

      // Retry logic for network errors (up to 2 retries)
      if (isNetworkError && retryCount < 2) {
        console.log(
          `Retrying getBudgetProgress (attempt ${retryCount + 1})...`
        );
        return getBudgetProgress(
          userId,
          transactionType,
          periodType,
          retryCount + 1
        );
      }

      // Use console.warn instead of console.error for handled errors
      // This prevents React Native from showing the red error screen
      if (isNetworkError) {
        console.warn(
          `Network error fetching budget progress (offline or connection issue):`,
          error.message
        );
      } else {
        console.warn(
          `Failed to fetch budget progress after ${retryCount} retries:`,
          error.message
        );
      }
      return [];
    }

    return (data || []) as BudgetProgressItem[];
  } catch (error: any) {
    // Check if it's a network error
    const isNetworkError = 
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("Failed to fetch") ||
      error?.message?.includes("network") ||
      error?.code === "ECONNREFUSED" ||
      error?.code === "ETIMEDOUT";

    // Use console.warn for network errors, console.error only for unexpected errors
    if (isNetworkError) {
      console.warn("Network error in getBudgetProgress (handled gracefully):", error?.message || "Network request failed");
    } else {
      console.error("Unexpected error in getBudgetProgress:", error);
    }

    // For all errors, return empty array instead of throwing
    // This prevents the UI from freezing due to unhandled exceptions
    return [];
  }
}

/**
 * Get budget summary by category type (powers Needs/Wants/Save cards)
 * @param userId - User UUID
 * @param transactionType - Type of transactions to include
 * @param periodType - Time period for calculations
 * @returns Array of budget summaries by category type
 */
export async function getBudgetSummary(
  userId: string,
  transactionType: TransactionType = "expense",
  periodType: PeriodType = "monthly"
): Promise<BudgetSummary[]> {
  try {
    const { data, error } = await (supabase as any).rpc("get_budget_summary", {
      p_user_id: userId,
      p_transaction_type: transactionType,
      p_period_type: periodType,
    });

    if (error) {
      console.error("Error fetching budget summary:", error);
      throw new Error(`Failed to fetch budget summary: ${error.message}`);
    }

    return (data || []) as BudgetSummary[];
  } catch (error) {
    console.error("getBudgetSummary error:", error);
    throw error;
  }
}

/**
 * Get detailed information for a specific category
 * @param userId - User UUID
 * @param categoryId - Category UUID
 * @param transactionType - Type of transactions to include
 * @param periodType - Time period for calculations
 * @returns Detailed category information
 */
export async function getCategoryDetails(
  userId: string,
  categoryId: string,
  transactionType: TransactionType = "expense",
  periodType: PeriodType = "monthly"
): Promise<CategoryDetails | null> {
  try {
    const { data, error } = await (supabase as any).rpc(
      "get_category_details",
      {
        p_user_id: userId,
        p_category_id: categoryId,
        p_transaction_type: transactionType,
        p_period_type: periodType,
      }
    );

    if (error) {
      console.error("Error fetching category details:", error);
      throw new Error(`Failed to fetch category details: ${error.message}`);
    }

    return (data?.[0] || null) as CategoryDetails | null;
  } catch (error) {
    console.error("getCategoryDetails error:", error);
    throw error;
  }
}

/**
 * Get subcategory progress within a category (powers Budget Details modal)
 * @param userId - User UUID
 * @param categoryId - Category UUID
 * @param transactionType - Type of transactions to include
 * @param periodType - Time period for calculations
 * @returns Array of subcategory progress items
 */
export async function getSubcategoryProgress(
  userId: string,
  categoryId: string,
  transactionType: TransactionType = "expense",
  periodType: PeriodType = "monthly"
): Promise<SubcategoryProgress[]> {
  try {
    const { data, error } = await (supabase as any).rpc(
      "get_subcategory_progress",
      {
        p_user_id: userId,
        p_category_id: categoryId,
        p_transaction_type: transactionType,
        p_period_type: periodType,
      }
    );

    if (error) {
      console.error("Error fetching subcategory progress:", error);
      throw new Error(`Failed to fetch subcategory progress: ${error.message}`);
    }

    return (data || []) as SubcategoryProgress[];
  } catch (error) {
    console.error("getSubcategoryProgress error:", error);
    throw error;
  }
}

/**
 * Get complete budget overview (powers high-level dashboard metrics)
 * @param userId - User UUID
 * @param periodType - Time period for calculations
 * @returns Complete budget overview with income/expense totals
 */
export async function getBudgetOverview(
  userId: string,
  periodType: PeriodType = "monthly"
): Promise<BudgetOverview | null> {
  try {
    const { data, error } = await (supabase as any).rpc("get_budget_overview", {
      p_user_id: userId,
      p_period_type: periodType,
    });

    if (error) {
      console.error("Error fetching budget overview:", error);
      throw new Error(`Failed to fetch budget overview: ${error.message}`);
    }

    return (data?.[0] || null) as BudgetOverview | null;
  } catch (error) {
    console.error("getBudgetOverview error:", error);
    throw error;
  }
}

/**
 * Get recent transactions for a specific subcategory
 * @param userId - User UUID
 * @param subcategoryId - Subcategory UUID
 * @param transactionType - Type of transactions to include
 * @param periodType - Time period for calculations
 * @param limit - Maximum number of transactions to return
 * @returns Array of recent transactions
 */
export async function getSubcategoryTransactions(
  userId: string,
  subcategoryId: string,
  transactionType: TransactionType = "expense",
  periodType: PeriodType = "monthly",
  limit: number = 10
): Promise<SubcategoryTransaction[]> {
  try {
    const { data, error } = await (supabase as any).rpc(
      "get_subcategory_transactions",
      {
        p_user_id: userId,
        p_subcategory_id: subcategoryId,
        p_transaction_type: transactionType,
        p_period_type: periodType,
        p_limit: limit,
      }
    );

    if (error) {
      console.error("Error fetching subcategory transactions:", error);
      throw new Error(
        `Failed to fetch subcategory transactions: ${error.message}`
      );
    }

    return (data || []) as SubcategoryTransaction[];
  } catch (error) {
    console.error("getSubcategoryTransactions error:", error);
    throw error;
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format currency amount for display
 * @param amount - Numeric amount
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 * @param percentage - Numeric percentage (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Get status color based on budget usage
 * @param status - Budget status
 * @returns Color string for UI display
 */
export function getStatusColor(status: BudgetProgressItem["status"]): string {
  switch (status) {
    case "under_budget":
      return "#10B981"; // Green
    case "on_budget":
      return "#F59E0B"; // Yellow
    case "over_budget":
      return "#EF4444"; // Red
    case "not_set":
      return "#6B7280"; // Gray
    default:
      return "#6B7280";
  }
}

/**
 * Calculate budget health score (0-100)
 * @param budgetItems - Array of budget progress items
 * @returns Health score number
 */
export function calculateBudgetHealthScore(
  budgetItems: BudgetProgressItem[]
): number {
  if (budgetItems.length === 0) return 0;

  const scores = budgetItems.map((item) => {
    if (item.status === "under_budget") return 100;
    if (item.status === "on_budget") return 80;
    if (item.status === "over_budget")
      return Math.max(0, 100 - (item.percentage_used - 100));
    return 50; // not_set
  });

  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
}

// =====================================================
// USAGE EXAMPLES
// =====================================================
/*
// Example 1: Get budget progress for main dashboard
const budgetProgress = await getBudgetProgress(userId, 'expense', 'monthly');

// Example 2: Get summary for Needs/Wants/Save cards
const budgetSummary = await getBudgetSummary(userId, 'expense', 'monthly');

// Example 3: Get detailed category info when user clicks a category
const categoryDetails = await getCategoryDetails(userId, categoryId, 'expense', 'monthly');

// Example 4: Get subcategory breakdown for Budget Details modal
const subcategories = await getSubcategoryProgress(userId, categoryId, 'expense', 'monthly');

// Example 5: Get complete financial overview
const overview = await getBudgetOverview(userId, 'monthly');
*/

// =====================================================
// ERROR HANDLING BEST PRACTICES
// =====================================================
/*
try {
  const data = await getBudgetProgress(userId, 'expense', 'monthly');
  // Handle success
} catch (error) {
  // Handle error - show user-friendly message
  console.error('Budget progress error:', error);
  // Maybe show a toast or fallback UI
}
*/
