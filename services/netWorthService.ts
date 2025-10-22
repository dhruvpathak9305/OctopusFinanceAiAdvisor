/**
 * =============================================================================
 * NET WORTH SERVICE - SUPABASE INTEGRATION
 * =============================================================================
 *
 * This service provides a comprehensive interface for managing net worth data
 * in the Octopus Finance AI Advisor application. It handles both demo and real
 * user data through a centralized table mapping system.
 *
 * Key Features:
 * - Asset and liability tracking across 11+ categories
 * - Integration with existing accounts and credit cards
 * - Real-time sync capabilities
 * - Historical snapshots for trend analysis
 * - Flexible metadata storage for asset properties
 * - Demo mode support for testing and onboarding
 *
 * Database Integration:
 * - Demo Mode (isDemo=true): Uses base tables (net_worth_categories, etc.)
 * - Production Mode (isDemo=false): Uses _real tables (net_worth_categories_real, etc.)
 *
 * The service automatically handles:
 * - RLS (Row Level Security) policies
 * - Data validation and type checking
 * - Error handling and logging
 * - Optimistic updates for better UX
 *
 * Related Services:
 * - accountsService.ts: For bank account integration
 * - creditCardService.ts: For credit card liability sync
 * - transactionsService.ts: For transaction-based asset tracking
 *
 * @see /src/db/migrations/supabase_net_worth_schema.sql - Demo tables schema
 * @see /src/db/migrations/net_worth_schema_real.sql - Real tables schema
 * @see /src/utils/tableMapping.ts - Table mapping system
 * =============================================================================
 */

import { supabase } from "../lib/supabase/client";
import {
  getTableMap,
  validateTableConsistency,
  type TableMap,
} from "../utils/tableMapping";
import { fetchAccountsWithBalances } from "./optimizedAccountsService";
import { fetchCreditCards } from "./creditCardService";
import { fetchFixedDepositsForNetWorth, getAggregatedFDSummary } from "./fixedDepositsService";

// =============================================================================
// TABLE MAPPING HELPER
// =============================================================================

/**
 * Helper function to get the appropriate table mapping based on demo mode
 * This ensures all net worth queries use consistent table references
 * @param isDemo - Whether the app is in demo mode
 * @returns TableMap object with resolved table names
 */
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);

  // Validate consistency during development
  if (process.env.NODE_ENV === "development") {
    validateTableConsistency(tableMap);
  }

  return tableMap;
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface DbNetWorthCategory {
  id: string;
  name: string;
  type: "asset" | "liability";
  icon?: string;
  color?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbNetWorthSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbNetWorthEntry {
  id: string;
  user_id: string;
  asset_name: string;
  category_id: string;
  subcategory_id: string;
  value: number;
  quantity?: number;
  market_price?: number;
  notes?: string;
  date: string;
  is_active: boolean;
  is_included_in_net_worth: boolean;
  linked_source_type: "account" | "credit_card" | "transaction" | "manual";
  linked_source_id?: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

export interface DbNetWorthEntryDetailed extends DbNetWorthEntry {
  category_name: string;
  category_type: "asset" | "liability";
  category_icon?: string;
  category_color?: string;
  subcategory_name: string;
}

export interface NetWorthSummary {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
}

export interface CategorySummary {
  category_name: string;
  category_type: "asset" | "liability";
  icon?: string;
  color?: string;
  asset_count: number;
  total_value: number;
  last_updated: string;
}

// =============================================================================
// CATEGORY MANAGEMENT
// =============================================================================

/**
 * Get all available categories
 */
export const fetchCategories = async (
  isDemo: boolean = false
): Promise<DbNetWorthCategory[]> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_categories;

  const { data, error } = await supabase
    .from(tableName as "net_worth_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data as DbNetWorthCategory[]) || [];
};

/**
 * Get subcategories for a specific category
 */
export const fetchSubcategories = async (
  categoryId: string,
  isDemo: boolean = false
): Promise<DbNetWorthSubcategory[]> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_subcategories;

  const { data, error } = await supabase
    .from(tableName as "net_worth_subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data as DbNetWorthSubcategory[]) || [];
};

/**
 * Create a new category
 */
export const createCategory = async (
  category: Omit<DbNetWorthCategory, "id" | "created_at" | "updated_at">,
  isDemo: boolean = false
): Promise<DbNetWorthCategory> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_categories;

  const { data, error } = await supabase
    .from(tableName as "net_worth_categories")
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthCategory;
};

/**
 * Create a new subcategory
 */
export const createSubcategory = async (
  subcategory: Omit<DbNetWorthSubcategory, "id" | "created_at" | "updated_at">,
  isDemo: boolean = false
): Promise<DbNetWorthSubcategory> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_subcategories;

  const { data, error } = await supabase
    .from(tableName as "net_worth_subcategories")
    .insert(subcategory)
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthSubcategory;
};

// =============================================================================
// NET WORTH ENTRIES MANAGEMENT
// =============================================================================

/**
 * Get all net worth entries for the current user
 */
export const fetchNetWorthEntries = async (
  isDemo: boolean = false
): Promise<DbNetWorthEntryDetailed[]> => {
  // Use raw SQL query to handle dynamic table names for detailed view
  const detailedViewName = isDemo
    ? "net_worth_entries_detailed"
    : "net_worth_entries_detailed_real";

  const { data, error } = await supabase
    .from(detailedViewName as "net_worth_entries_detailed")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("netWorthService - fetchNetWorthEntries error:", error);
    throw error;
  }

  return (data as DbNetWorthEntryDetailed[]) || [];
};

/**
 * Get entries by category
 */
export const fetchEntriesByCategory = async (
  categoryId: string,
  isDemo: boolean = false
): Promise<DbNetWorthEntryDetailed[]> => {
  const detailedViewName = isDemo
    ? "net_worth_entries_detailed"
    : "net_worth_entries_detailed_real";

  const { data, error } = await supabase
    .from(detailedViewName as "net_worth_entries_detailed")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as DbNetWorthEntryDetailed[]) || [];
};

/**
 * Create a new net worth entry
 */
export const addNetWorthEntry = async (
  entry: Omit<DbNetWorthEntry, "id" | "user_id" | "created_at" | "updated_at">,
  isDemo: boolean = false
): Promise<DbNetWorthEntry> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;

  const { data, error } = await supabase
    .from(tableName as "net_worth_entries")
    .insert({
      ...entry,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthEntry;
};

/**
 * Update an existing net worth entry
 */
export const updateNetWorthEntry = async (
  id: string,
  updates: Partial<Omit<DbNetWorthEntry, "id" | "user_id" | "created_at">>,
  isDemo: boolean = false
): Promise<DbNetWorthEntry> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;

  const { data, error } = await supabase
    .from(tableName as "net_worth_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthEntry;
};

/**
 * Delete a net worth entry (soft delete by setting is_active = false)
 */
export const deleteNetWorthEntry = async (
  id: string,
  isDemo: boolean = false
): Promise<void> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;

  const { error } = await supabase
    .from(tableName as "net_worth_entries")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
};

/**
 * Toggle entry visibility in net worth calculations
 */
export const toggleEntryVisibility = async (
  id: string,
  isDemo: boolean = false
): Promise<DbNetWorthEntry> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;

  // First get the current state
  const { data: currentEntry, error: fetchError } = await supabase
    .from(tableName as "net_worth_entries")
    .select("is_included_in_net_worth")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Update with opposite value
  const { data, error } = await supabase
    .from(tableName as "net_worth_entries")
    .update({
      is_included_in_net_worth: !currentEntry.is_included_in_net_worth,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthEntry;
};

// =============================================================================
// NET WORTH CALCULATIONS
// =============================================================================

/**
 * Calculate total net worth for current user
 */
export const calculateNetWorth = async (
  isDemo: boolean = false
): Promise<NetWorthSummary> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const functionName = isDemo
    ? "calculate_user_net_worth"
    : "calculate_user_net_worth_real";

  const { data, error } = await supabase.rpc(functionName as any, {
    user_uuid: user.id,
  });

  if (error) {
    console.error("netWorthService - calculateNetWorth error:", error);
    throw error;
  }

  return data && data[0]
    ? data[0]
    : { total_assets: 0, total_liabilities: 0, net_worth: 0 };
};

/**
 * Get category-wise summary
 */
export const fetchCategorySummary = async (
  isDemo: boolean = false
): Promise<CategorySummary[]> => {
  const summaryViewName = isDemo
    ? "user_net_worth_summary"
    : "user_net_worth_summary_real";

  const { data, error } = await supabase
    .from(summaryViewName as "user_net_worth_summary")
    .select("*")
    .order("total_value", { ascending: false });

  if (error) {
    console.error("netWorthService - fetchCategorySummary error:", error);
    throw error;
  }

  return (data as CategorySummary[]) || [];
};

/**
 * Create a snapshot of current net worth
 */
export const createSnapshot = async (
  isDemo: boolean = false
): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const functionName = isDemo
    ? "create_net_worth_snapshot"
    : "create_net_worth_snapshot_real";

  const { data, error } = await supabase.rpc(functionName as any, {
    user_uuid: user.id,
  });

  if (error) throw error;
  return data as string;
};

/**
 * Get historical snapshots for trend analysis
 */
export const fetchNetWorthSnapshots = async (
  isDemo: boolean = false,
  limit: number = 12
): Promise<{ date: string; value: number }[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const snapshotsTableName = isDemo
    ? "net_worth_snapshots"
    : "net_worth_snapshots_real";

  const { data, error } = await supabase
    .from(snapshotsTableName as "net_worth_snapshots")
    .select("snapshot_date, net_worth")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("netWorthService - fetchNetWorthSnapshots error:", error);
    throw error;
  }

  // Transform to chart format
  return (data || [])
    .map((snapshot) => ({
      date: snapshot.snapshot_date,
      value: Number(snapshot.net_worth),
    }))
    .reverse(); // Reverse to get chronological order
};

/**
 * Get month-over-month percentage change
 */
export const calculateNetWorthTrend = async (
  isDemo: boolean = false
): Promise<{ percentChange: number; monthlyChange: string }> => {
  const snapshots = await fetchNetWorthSnapshots(isDemo, 2);

  if (snapshots.length < 2) {
    return { percentChange: 0, monthlyChange: "+0.0%" };
  }

  const current = snapshots[snapshots.length - 1].value;
  const previous = snapshots[snapshots.length - 2].value;

  if (previous === 0) {
    return { percentChange: 0, monthlyChange: "+0.0%" };
  }

  const percentChange = ((current - previous) / Math.abs(previous)) * 100;
  const monthlyChange = `${percentChange > 0 ? "+" : ""}${percentChange.toFixed(
    1
  )}%`;

  return { percentChange, monthlyChange };
};

/**
 * Create monthly snapshots automatically
 */
export const createMonthlySnapshot = async (
  isDemo: boolean = false
): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const snapshotsTableName = isDemo
    ? "net_worth_snapshots"
    : "net_worth_snapshots_real";

  // Check if snapshot already exists for current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  const { data: existingSnapshot } = await supabase
    .from(snapshotsTableName as "net_worth_snapshots")
    .select("id")
    .eq("user_id", user.id)
    .gte("snapshot_date", `${currentMonth}-01`)
    .lt("snapshot_date", `${currentMonth}-31`)
    .single();

  if (existingSnapshot) {
    return existingSnapshot.id;
  }

  // Create new snapshot
  return await createSnapshot(isDemo);
};

// =============================================================================
// SYNC SERVICES
// =============================================================================

/**
 * Sync account balances to net worth entries
 */
export const syncAccounts = async (isDemo: boolean = false): Promise<void> => {
  const functionName = isDemo
    ? "sync_accounts_to_net_worth"
    : "sync_accounts_to_net_worth_real";

  const { error } = await supabase.rpc(functionName as any);
  if (error) throw error;
};

/**
 * Sync credit card balances to net worth entries
 */
export const syncCreditCards = async (
  isDemo: boolean = false
): Promise<void> => {
  const functionName = isDemo
    ? "sync_credit_cards_to_net_worth"
    : "sync_credit_cards_to_net_worth_real";

  const { error } = await supabase.rpc(functionName as any);
  if (error) throw error;
};

/**
 * Sync all linked sources
 */
export const syncAllLinkedSources = async (
  isDemo: boolean = false
): Promise<void> => {
  await Promise.all([syncAccounts(isDemo), syncCreditCards(isDemo)]);
};

// =============================================================================
// DATA MAPPING UTILITIES
// =============================================================================

/**
 * Convert database entry to frontend Asset format
 */
export const dbEntryToAsset = (entry: DbNetWorthEntryDetailed): Asset => {
  return {
    id: entry.id,
    name: entry.asset_name,
    category: entry.category_id,
    subcategory: entry.subcategory_name,
    value: entry.value,
    lastUpdated: entry.updated_at,
    isActive: entry.is_active,
    includeInNetWorth: entry.is_included_in_net_worth,
    notes: entry.notes,
    marketPrice: entry.market_price,
    quantity: entry.quantity,
  };
};

/**
 * Convert frontend Asset to database entry format
 */
export const assetToDbEntry = (
  asset: Omit<Asset, "id" | "lastUpdated">,
  categoryId: string,
  subcategoryId: string
): Omit<DbNetWorthEntry, "id" | "user_id" | "created_at" | "updated_at"> => {
  return {
    asset_name: asset.name,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    value: asset.value,
    quantity: asset.quantity,
    market_price: asset.marketPrice,
    notes: asset.notes,
    date: new Date().toISOString().split("T")[0], // Current date
    is_active: asset.isActive,
    is_included_in_net_worth: asset.includeInNetWorth,
    linked_source_type: "manual",
  };
};

/**
 * Find category and subcategory IDs by names
 */
export const findCategoryIds = async (
  categoryName: string,
  subcategoryName: string,
  isDemo: boolean = false
): Promise<{ categoryId: string; subcategoryId: string }> => {
  const tableMap = getTableMapping(isDemo);

  // Find category
  const { data: category, error: catError } = await supabase
    .from(tableMap.net_worth_categories as "net_worth_categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (catError) throw catError;

  // Find subcategory
  const { data: subcategory, error: subError } = await supabase
    .from(tableMap.net_worth_subcategories as "net_worth_subcategories")
    .select("id")
    .eq("category_id", category.id)
    .eq("name", subcategoryName)
    .single();

  if (subError) throw subError;

  return {
    categoryId: category.id,
    subcategoryId: subcategory.id,
  };
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class NetWorthServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "NetWorthServiceError";
  }
}

/**
 * Wrap service calls with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("NetWorth Service Error:", error);
      throw new NetWorthServiceError(
        `Failed to execute ${fn.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error
      );
    }
  }) as T;
};

// =============================================================================
// ENHANCED CRUD OPERATIONS FOR CATEGORIES & SUBCATEGORIES
// =============================================================================

/**
 * Update an existing net worth category
 */
export const updateCategory = async (
  categoryData: {
    id: string;
    name?: string;
    color?: string;
    icon?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  },
  isDemo: boolean = false
): Promise<any> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    const { data, error } = await supabase
      .from(tableMap.net_worth_categories)
      .update({
        ...categoryData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryData.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  })();
};

/**
 * Delete (soft delete) a net worth category
 */
export const deleteCategory = async (
  categoryId: string,
  isDemo: boolean = false
): Promise<void> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    // Check if category has active entries
    const { data: entries } = await supabase
      .from(tableMap.net_worth_entries)
      .select("id")
      .eq("category_id", categoryId)
      .eq("is_active", true);

    if (entries && entries.length > 0) {
      throw new Error(
        "Cannot delete category with existing entries. Please move or delete entries first."
      );
    }

    // Soft delete the category
    const { error: categoryError } = await supabase
      .from(tableMap.net_worth_categories)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (categoryError) throw categoryError;

    // Soft delete associated subcategories
    const { error: subcategoriesError } = await supabase
      .from(tableMap.net_worth_subcategories)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("category_id", categoryId);

    if (subcategoriesError) throw subcategoriesError;
  })();
};

/**
 * Update an existing net worth subcategory
 */
export const updateSubcategory = async (
  subcategoryData: {
    id: string;
    name?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  },
  isDemo: boolean = false
): Promise<any> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    const { data, error } = await supabase
      .from(tableMap.net_worth_subcategories)
      .update({
        ...subcategoryData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subcategoryData.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  })();
};

/**
 * Delete (soft delete) a net worth subcategory
 */
export const deleteSubcategory = async (
  subcategoryId: string,
  isDemo: boolean = false
): Promise<void> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    // Check if subcategory has active entries
    const { data: entries } = await supabase
      .from(tableMap.net_worth_entries)
      .select("id")
      .eq("subcategory_id", subcategoryId)
      .eq("is_active", true);

    if (entries && entries.length > 0) {
      throw new Error(
        "Cannot delete subcategory with existing entries. Please move or delete entries first."
      );
    }

    // Soft delete the subcategory
    const { error } = await supabase
      .from(tableMap.net_worth_subcategories)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subcategoryId);

    if (error) throw error;
  })();
};

/**
 * Bulk create categories with default subcategories
 */
export const bulkCreateCategories = async (
  categories: Array<{
    name: string;
    type: "asset" | "liability";
    color?: string;
    icon?: string;
    description?: string;
    sort_order?: number;
    subcategories?: string[];
  }>,
  isDemo: boolean = false
): Promise<any[]> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);
    const results = [];

    for (const categoryData of categories) {
      // Create category
      const { subcategories, ...categoryFields } = categoryData;
      const category = await createCategory(categoryFields, isDemo);

      // Create subcategories if provided
      if (subcategories && subcategories.length > 0) {
        const subcategoryPromises = subcategories.map((name, index) =>
          createSubcategory(
            {
              category_id: category.id,
              name,
              sort_order: index + 1,
            },
            isDemo
          )
        );

        const createdSubcategories = await Promise.all(subcategoryPromises);
        results.push({
          category,
          subcategories: createdSubcategories,
        });
      } else {
        results.push({ category, subcategories: [] });
      }
    }

    return results;
  })();
};

/**
 * Reorder categories by updating sort_order
 */
export const reorderCategories = async (
  items: Array<{ id: string; sort_order: number }>,
  isDemo: boolean = false
): Promise<void> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    const updatePromises = items.map((item) =>
      supabase
        .from(tableMap.net_worth_categories)
        .update({
          sort_order: item.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      throw new Error(
        `Failed to reorder categories: ${errors[0].error?.message}`
      );
    }
  })();
};

/**
 * Reorder subcategories within a category
 */
export const reorderSubcategories = async (
  categoryId: string,
  items: Array<{ id: string; sort_order: number }>,
  isDemo: boolean = false
): Promise<void> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    const updatePromises = items.map((item) =>
      supabase
        .from(tableMap.net_worth_subcategories)
        .update({
          sort_order: item.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .eq("category_id", categoryId)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      throw new Error(
        `Failed to reorder subcategories: ${errors[0].error?.message}`
      );
    }
  })();
};

/**
 * Get categories with their subcategories
 */
export const fetchCategoriesWithSubcategories = async (
  type?: "asset" | "liability",
  isDemo: boolean = false
): Promise<any[]> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    let query = supabase
      .from(tableMap.net_worth_categories)
      .select(
        `
        *,
        subcategories:${tableMap.net_worth_subcategories}(*)
      `
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Sort subcategories within each category
    return (
      data?.map((category) => ({
        ...category,
        subcategories:
          category.subcategories
            ?.filter((sub: any) => sub.is_active !== false)
            ?.sort((a: any, b: any) => {
              if (a.sort_order && b.sort_order) {
                return a.sort_order - b.sort_order;
              }
              return a.name.localeCompare(b.name);
            }) || [],
      })) || []
    );
  })();
};

/**
 * Search categories and subcategories
 */
export const searchCategoriesAndSubcategories = async (
  searchTerm: string,
  type?: "asset" | "liability",
  isDemo: boolean = false
): Promise<{
  categories: any[];
  subcategories: any[];
}> => {
  return withErrorHandling(async () => {
    const tableMap = getTableMap(isDemo);

    // Search categories
    let categoryQuery = supabase
      .from(tableMap.net_worth_categories)
      .select("*")
      .eq("is_active", true)
      .ilike("name", `%${searchTerm}%`);

    if (type) {
      categoryQuery = categoryQuery.eq("type", type);
    }

    // Search subcategories
    let subcategoryQuery = supabase
      .from(tableMap.net_worth_subcategories)
      .select(
        `
        *,
        category:${tableMap.net_worth_categories}(*)
      `
      )
      .eq("is_active", true)
      .ilike("name", `%${searchTerm}%`);

    const [categoriesResult, subcategoriesResult] = await Promise.all([
      categoryQuery,
      subcategoryQuery,
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (subcategoriesResult.error) throw subcategoriesResult.error;

    // Filter subcategories by type if specified
    let filteredSubcategories = subcategoriesResult.data || [];
    if (type) {
      filteredSubcategories = filteredSubcategories.filter(
        (sub: any) => sub.category?.type === type
      );
    }

    return {
      categories: categoriesResult.data || [],
      subcategories: filteredSubcategories,
    };
  })();
};

/**
 * Get formatted categories for mobile UI display
 */
export const fetchFormattedCategoriesForUI = async (
  type: "asset" | "liability",
  isDemo: boolean = false
): Promise<any[]> => {
  return withErrorHandling(async () => {
    // First get categories with their subcategories
    const categoriesWithSubs = await fetchCategoriesWithSubcategories(
      type,
      isDemo
    );

    // Get entries for each category to calculate values
    const entriesPromises = categoriesWithSubs.map(async (category) => {
      const entries = await fetchEntriesByCategory(category.id, isDemo);
      return { category, entries };
    });

    const categoriesWithEntries = await Promise.all(entriesPromises);

    // Special handling for Fixed Deposits - auto-sync from fixed_deposits_real table
    try {
      console.log("💰 Checking for Fixed Deposits integration...");
      const fdData = await fetchFixedDepositsForNetWorth(isDemo);
      console.log("💰 FD data fetched:", fdData);
      
      if (fdData.length > 0) {
        // Find "Debt & Fixed Income" or similar category
        const fixedIncomeCategory = categoriesWithEntries.find((cat) =>
          cat.category.name.toLowerCase().includes("debt") ||
          cat.category.name.toLowerCase().includes("fixed income") ||
          cat.category.name.toLowerCase().includes("fixed")
        );

        if (fixedIncomeCategory) {
          console.log("💰 Found Fixed Income category:", fixedIncomeCategory.category.name);
          
          // Find "Fixed Deposits" subcategory
          const fdSubcategory = fixedIncomeCategory.category.subcategories?.find(
            (sub: any) => sub.name.toLowerCase().includes("fixed deposit")
          );

          if (fdSubcategory) {
            console.log("💰 Found Fixed Deposits subcategory, adding FD data");
            
            // Add FD entries to this subcategory
            // Calculate total FD value
            const totalFDValue = fdData.reduce((sum, bank) => sum + bank.value, 0);
            
            // Update the entries for this category to include FDs
            fixedIncomeCategory.entries = [
              ...fixedIncomeCategory.entries,
              ...fdData.flatMap((bank) =>
                bank.subcategories.map((fd) => ({
                  id: fd.id,
                  user_id: "", // Will be filled by system
                  asset_name: fd.name,
                  category_id: fixedIncomeCategory.category.id,
                  subcategory_id: fdSubcategory.id,
                  value: fd.value,
                  quantity: 1,
                  market_price: fd.principal,
                  notes: `${fd.institution} | ${fd.interest_rate}% | Matures: ${fd.maturity_date}`,
                  date: new Date().toISOString().split("T")[0],
                  is_active: true,
                  is_included_in_net_worth: true,
                  linked_source_type: "fixed_deposit" as any,
                  linked_source_id: fd.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  category_name: fixedIncomeCategory.category.name,
                  category_type: type,
                  category_icon: fixedIncomeCategory.category.icon,
                  category_color: fixedIncomeCategory.category.color,
                  subcategory_name: fdSubcategory.name,
                }))
              ),
            ];
            
            console.log("💰 FD entries added to category:", fixedIncomeCategory.entries.length);
          }
        }
      }
    } catch (error) {
      console.error("💰 Error integrating Fixed Deposits:", error);
      // Continue without FD data if there's an error
    }

    // Get accounts and credit cards data
    let systemCards = [];
    if (type === "asset") {
      try {
        console.log("🔍 Fetching accounts for net worth...");
        const accountsCard = await fetchAccountsForNetWorth(isDemo);
        console.log("🔍 Accounts card result:", accountsCard);
        if (accountsCard) {
          console.log(
            "✅ Adding accounts card to system cards (items:",
            accountsCard.items,
            ")"
          );
          systemCards.push(accountsCard);
        } else {
          console.log("⚠️ No accounts card returned");
        }
      } catch (error) {
        console.error("❌ Error fetching accounts for net worth:", error);
        console.warn("Could not fetch accounts for net worth:", error);
      }
    } else if (type === "liability") {
      try {
        console.log("🔍 Fetching credit cards for net worth...");
        const creditCardsCard = await fetchCreditCardsForNetWorth(isDemo);
        console.log("🔍 Credit cards result:", creditCardsCard);
        if (creditCardsCard) {
          console.log(
            "✅ Adding credit cards to system cards (items:",
            creditCardsCard.items,
            ")"
          );
          systemCards.push(creditCardsCard);
        } else {
          console.log("⚠️ No credit cards card returned");
        }
      } catch (error) {
        console.error("❌ Error fetching credit cards for net worth:", error);
        console.warn("Could not fetch credit cards for net worth:", error);
      }
    }

    // Calculate total value for percentage calculation (including system cards)
    const regularCategoriesValue = categoriesWithEntries.reduce(
      (sum, { entries }) => {
        return (
          sum + entries.reduce((entrySum, entry) => entrySum + entry.value, 0)
        );
      },
      0
    );

    const systemCardsValue = systemCards.reduce(
      (sum, card) => sum + card.value,
      0
    );
    const totalPortfolioValue = regularCategoriesValue + systemCardsValue;

    // Format regular categories for mobile UI
    const formattedCategories = categoriesWithEntries.map(
      ({ category, entries }) => {
        const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
        const itemCount = entries.length;

        // Calculate percentage based on total portfolio value of this type
        const percentage =
          totalPortfolioValue > 0
            ? (totalValue / totalPortfolioValue) * 100
            : 0;

        return {
          id: category.id,
          name: category.name,
          value: totalValue,
          percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
          items: category.subcategories?.length || 0, // Show subcategory count instead of entry count
          icon: category.icon || (type === "asset" ? "trending-up" : "card"),
          color: category.color || (type === "asset" ? "#10B981" : "#EF4444"),
          assets:
            category.subcategories?.map((sub: any) => {
              const subEntries = entries.filter(
                (entry) => entry.subcategory_id === sub.id
              );
              const subValue = subEntries.reduce(
                (sum, entry) => sum + entry.value,
                0
              );
              const subPercentage =
                totalValue > 0 ? (subValue / totalValue) * 100 : 0;

              return {
                id: sub.id,
                name: sub.name,
                category: category.name,
                value: subValue,
                percentage: Math.round(subPercentage),
                icon: sub.icon || category.icon || "cash",
                color: sub.color || category.color || "#10B981",
              };
            }) || [],
        };
      }
    );

    // Format system cards with calculated percentages
    const formattedSystemCards = systemCards.map((card) => ({
      ...card,
      percentage:
        totalPortfolioValue > 0
          ? Math.round((card.value / totalPortfolioValue) * 100 * 10) / 10
          : 0,
      assets:
        card.subcategories?.map((sub: any) => ({
          ...sub,
          category: card.name,
          percentage:
            card.value > 0 ? Math.round((sub.value / card.value) * 100) : 0,
        })) || [],
    }));

    // Combine system cards with regular categories
    // System cards appear first for better visibility
    const finalResult = [...formattedSystemCards, ...formattedCategories];

    console.log("🎯 Final result for type", type, ":", finalResult);
    console.log("🎯 System cards count:", formattedSystemCards.length);
    console.log("🎯 Regular categories count:", formattedCategories.length);

    return finalResult;
  })();
};

/**
 * Create sample net worth entries for testing and demonstration
 */
export const createSampleNetWorthEntries = async (
  isDemo: boolean = false
): Promise<void> => {
  return withErrorHandling(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get categories with subcategories
    const categories = await fetchCategoriesWithSubcategories(
      undefined,
      isDemo
    );

    const sampleEntries = [
      // Cash & Cash Equivalents
      {
        categoryName: "Cash & Cash Equivalents",
        subcategoryName: "Savings Account",
        entries: [
          { name: "HDFC Savings Account", value: 250000 },
          { name: "SBI Savings Account", value: 150000 },
        ],
      },
      {
        categoryName: "Cash & Cash Equivalents",
        subcategoryName: "Checking Account",
        entries: [{ name: "ICICI Current Account", value: 75000 }],
      },
      {
        categoryName: "Cash & Cash Equivalents",
        subcategoryName: "Cash",
        entries: [{ name: "Physical Cash", value: 25000 }],
      },
      // Real Estate
      {
        categoryName: "Real Estate",
        subcategoryName: "Primary Residence",
        entries: [{ name: "Mumbai Apartment", value: 8500000 }],
      },
      {
        categoryName: "Real Estate",
        subcategoryName: "Investment Property",
        entries: [{ name: "Pune Property", value: 4200000 }],
      },
      // Investments
      {
        categoryName: "Equity Investments",
        subcategoryName: "Stocks",
        entries: [
          { name: "TCS Shares", value: 180000 },
          { name: "Reliance Shares", value: 120000 },
        ],
      },
      {
        categoryName: "Equity Investments",
        subcategoryName: "Mutual Funds",
        entries: [
          { name: "SBI Bluechip Fund", value: 350000 },
          { name: "HDFC Top 100 Fund", value: 200000 },
        ],
      },
      // Retirement
      {
        categoryName: "Retirement & Pension Funds",
        subcategoryName: "EPF",
        entries: [{ name: "Employee Provident Fund", value: 450000 }],
      },
      {
        categoryName: "Retirement & Pension Funds",
        subcategoryName: "PPF",
        entries: [{ name: "Public Provident Fund", value: 280000 }],
      },
      // Vehicles
      {
        categoryName: "Vehicles",
        subcategoryName: "Car",
        entries: [{ name: "Honda City", value: 850000 }],
      },
      // Liabilities - Housing Loans
      {
        categoryName: "Housing Loans",
        subcategoryName: "Home Loan",
        entries: [{ name: "HDFC Home Loan", value: 3200000 }],
      },
      // Liabilities - Vehicle Loans
      {
        categoryName: "Vehicle Loans",
        subcategoryName: "Car Loan",
        entries: [{ name: "Car Loan - Honda City", value: 320000 }],
      },
      // Liabilities - Credit Cards
      {
        categoryName: "Credit Card Debt",
        subcategoryName: "Credit Card",
        entries: [
          { name: "HDFC Credit Card", value: 45000 },
          { name: "SBI Credit Card", value: 28000 },
        ],
      },
    ];

    const tableMap = getTableMapping(isDemo);

    // Check if entries already exist to avoid duplicates
    const existingEntries = await supabase
      .from(tableMap.net_worth_entries as "net_worth_entries")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingEntries.data && existingEntries.data.length > 0) {
      console.log("Sample entries already exist, skipping creation");
      return;
    }

    // Create entries
    for (const sampleCategory of sampleEntries) {
      try {
        // Find the category and subcategory
        const category = categories.find(
          (cat) =>
            cat.name
              .toLowerCase()
              .includes(sampleCategory.categoryName.toLowerCase()) ||
            sampleCategory.categoryName
              .toLowerCase()
              .includes(cat.name.toLowerCase())
        );

        if (!category) {
          console.warn(`Category not found: ${sampleCategory.categoryName}`);
          continue;
        }

        const subcategory = category.subcategories?.find(
          (sub) =>
            sub.name
              .toLowerCase()
              .includes(sampleCategory.subcategoryName.toLowerCase()) ||
            sampleCategory.subcategoryName
              .toLowerCase()
              .includes(sub.name.toLowerCase())
        );

        if (!subcategory) {
          console.warn(
            `Subcategory not found: ${sampleCategory.subcategoryName} in ${category.name}`
          );
          continue;
        }

        // Create entries for this subcategory
        for (const entry of sampleCategory.entries) {
          await addNetWorthEntry(
            {
              asset_name: entry.name,
              category_id: category.id,
              subcategory_id: subcategory.id,
              value: entry.value,
              date: new Date().toISOString().split("T")[0],
              is_active: true,
              is_included_in_net_worth: true,
              linked_source_type: "manual",
            },
            isDemo
          );
        }
      } catch (error) {
        console.error(
          `Error creating entries for ${sampleCategory.categoryName}:`,
          error
        );
      }
    }

    console.log("Sample net worth entries created successfully");
  })();
};

/**
 * Initialize default categories and subcategories
 */
export const initializeDefaultCategories = async (
  isDemo: boolean = false
): Promise<void> => {
  return withErrorHandling(async () => {
    const defaultAssetCategories = [
      {
        name: "Cash & Cash Equivalents",
        type: "asset" as const,
        icon: "💰",
        color: "#10B981",
        sort_order: 1,
        subcategories: [
          "Savings Account",
          "Checking Account",
          "Money Market",
          "Cash",
        ],
      },
      {
        name: "Investments",
        type: "asset" as const,
        icon: "📈",
        color: "#3B82F6",
        sort_order: 2,
        subcategories: [
          "Stocks",
          "Bonds",
          "Mutual Funds",
          "ETFs",
          "Cryptocurrency",
        ],
      },
      {
        name: "Real Estate",
        type: "asset" as const,
        icon: "🏠",
        color: "#F59E0B",
        sort_order: 3,
        subcategories: ["Primary Residence", "Investment Property", "REITs"],
      },
      {
        name: "Retirement Accounts",
        type: "asset" as const,
        icon: "🏦",
        color: "#8B5CF6",
        sort_order: 4,
        subcategories: ["401(k)", "IRA", "Roth IRA", "Pension"],
      },
      {
        name: "Personal Property",
        type: "asset" as const,
        icon: "🚗",
        color: "#EF4444",
        sort_order: 5,
        subcategories: [
          "Vehicles",
          "Jewelry",
          "Art & Collectibles",
          "Electronics",
        ],
      },
    ];

    const defaultLiabilityCategories = [
      {
        name: "Credit Cards",
        type: "liability" as const,
        icon: "💳",
        color: "#EF4444",
        sort_order: 1,
        subcategories: [
          "Visa",
          "Mastercard",
          "American Express",
          "Store Cards",
        ],
      },
      {
        name: "Loans",
        type: "liability" as const,
        icon: "🏦",
        color: "#F59E0B",
        sort_order: 2,
        subcategories: [
          "Personal Loan",
          "Auto Loan",
          "Student Loan",
          "Business Loan",
        ],
      },
      {
        name: "Mortgages",
        type: "liability" as const,
        icon: "🏠",
        color: "#8B5CF6",
        sort_order: 3,
        subcategories: ["Primary Mortgage", "Second Mortgage", "HELOC"],
      },
      {
        name: "Other Debts",
        type: "liability" as const,
        icon: "📄",
        color: "#6B7280",
        sort_order: 4,
        subcategories: ["Medical Debt", "Tax Debt", "Family Loans", "Other"],
      },
    ];

    // Check if categories already exist
    const existingCategories = await fetchCategories(isDemo);
    if (existingCategories.length > 0) {
      console.log("Categories already exist, skipping initialization");
      return;
    }

    // Create default categories
    await bulkCreateCategories(
      [...defaultAssetCategories, ...defaultLiabilityCategories],
      isDemo
    );

    console.log(
      "Default categories and subcategories initialized successfully"
    );
  })();
};

/**
 * Create a new net worth entry
 */
export const createNetWorthEntry = async (
  entryData: {
    name: string;
    description?: string;
    amount: number;
    category_id: string;
    subcategory_id: string;
    type: "asset" | "liability";
    acquisition_date?: string;
    current_value?: number;
    appreciation_rate?: number;
    interest_rate?: number;
    monthly_payment?: number;
    maturity_date?: string;
    institution?: string;
    account_number?: string;
    notes?: string;
  },
  isDemo: boolean = false
) => {
  return withErrorHandling(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    // 1. Create the main entry data (fields that exist in net_worth_entries_real table)
    const mainEntry = {
      asset_name: entryData.name,
      category_id: entryData.category_id,
      subcategory_id: entryData.subcategory_id,
      value: entryData.amount,
      date: entryData.acquisition_date || null,
      market_price: entryData.current_value || null,
      notes: entryData.description || entryData.notes || null,
      user_id: user.id,
      is_active: true,
      is_included_in_net_worth: true,
      linked_source_type: "manual",
      quantity: 1, // Default quantity
    };

    console.log("Creating main entry:", mainEntry);

    // Insert the main entry
    const { data, error } = await (supabase as any)
      .from(tableMap.net_worth_entries)
      .insert([mainEntry])
      .select()
      .single();

    if (error) {
      console.error("Error creating net worth entry:", error);
      throw new Error(`Failed to create net worth entry: ${error.message}`);
    }

    console.log("Net worth entry created successfully:", data);

    // 2. Create metadata entries for additional fields
    const metadataEntries = [];

    if (
      entryData.appreciation_rate !== undefined &&
      entryData.appreciation_rate !== null
    ) {
      metadataEntries.push({
        entry_id: data.id,
        key: "appreciation_rate",
        value: entryData.appreciation_rate,
      });
    }

    if (
      entryData.interest_rate !== undefined &&
      entryData.interest_rate !== null
    ) {
      metadataEntries.push({
        entry_id: data.id,
        key: "interest_rate",
        value: entryData.interest_rate,
      });
    }

    if (
      entryData.monthly_payment !== undefined &&
      entryData.monthly_payment !== null
    ) {
      metadataEntries.push({
        entry_id: data.id,
        key: "monthly_payment",
        value: entryData.monthly_payment,
      });
    }

    if (entryData.maturity_date) {
      metadataEntries.push({
        entry_id: data.id,
        key: "maturity_date",
        value: entryData.maturity_date,
      });
    }

    if (entryData.institution) {
      metadataEntries.push({
        entry_id: data.id,
        key: "institution",
        value: entryData.institution,
      });
    }

    if (entryData.account_number) {
      metadataEntries.push({
        entry_id: data.id,
        key: "account_number",
        value: entryData.account_number,
      });
    }

    // Insert metadata entries if any exist
    if (metadataEntries.length > 0) {
      console.log("Creating metadata entries:", metadataEntries);

      const { error: metadataError } = await (supabase as any)
        .from(tableMap.net_worth_entry_metadata)
        .insert(metadataEntries);

      if (metadataError) {
        console.error("Error creating metadata entries:", metadataError);
        // Don't throw error for metadata - main entry was successful
        console.warn(
          "Metadata insertion failed, but main entry was created successfully"
        );
      } else {
        console.log("Metadata entries created successfully");
      }
    }

    return data;
  })();
};

// Fetch unique institutions from accounts table for picker
export const fetchInstitutions = async (isDemo: boolean = false) => {
  return withErrorHandling(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    // Fetch unique institutions from accounts table
    const { data, error } = await (supabase as any)
      .from(tableMap.accounts)
      .select("institution")
      .eq("user_id", user.id)
      .not("institution", "is", null)
      .order("institution");

    if (error) throw error;

    // Get unique institutions and filter out empty/null values
    const uniqueInstitutions = Array.from(
      new Set(
        (data || [])
          .map((item: any) => item.institution)
          .filter((institution: string) => institution && institution.trim())
      )
    ).map((institution: string) => ({
      id: institution,
      name: institution,
      icon: "business-outline", // Default icon for institutions
    }));

    return uniqueInstitutions;
  })();
};

// =============================================================================
// ACCOUNTS & CREDIT CARDS INTEGRATION
// =============================================================================

/**
 * Fetch accounts data formatted for Net Worth display
 */
export const fetchAccountsForNetWorth = async (isDemo: boolean = false) => {
  return withErrorHandling(async () => {
    console.log("🏦 fetchAccountsForNetWorth called with isDemo:", isDemo);

    try {
      const accounts = await fetchAccountsWithBalances(isDemo);
      console.log("🏦 Raw accounts data:", accounts);
      console.log("🏦 Number of accounts:", accounts.length);

      // Calculate total value (including negative balances)
      const totalValue = accounts.reduce(
        (sum, account) => sum + (account.current_balance ?? 0),
        0
      );
      console.log("🏦 Total accounts value:", totalValue);

      // Format as Net Worth category
      const result = {
        id: "bank-accounts",
        name: "Bank Accounts",
        type: "asset",
        value: totalValue,
        percentage: 0, // Will be calculated in UI
        items: accounts.length,
        icon: "business", // Changed from "card-outline" to better represent bank accounts
        color: "#10B981",
        subcategories: accounts.map((account) => ({
          id: account.id,
          name: account.name,
          value: account.current_balance ?? 0, // Keep actual value including negatives
          percentage:
            totalValue > 0
              ? Math.round(
                  ((account.current_balance ?? 0) / totalValue) * 100 * 10
                ) / 10
              : 0,
          institution: account.institution,
          account_type: account.type,
          account_number: account.account_number,
          icon: "business-outline", // Changed from "card-outline" to match parent category
          color: "#10B981",
          isSystemCard: true, // Mark as non-deletable
        })),
        isSystemCard: true, // Mark as non-deletable
        last_calculated_at: new Date().toISOString(),
      };

      console.log("🏦 Final accounts card result:", result);
      return result;
    } catch (error) {
      console.error("🏦 Error fetching accounts:", error);

      // Return empty accounts card as fallback
      const fallbackResult = {
        id: "bank-accounts",
        name: "Bank Accounts",
        type: "asset",
        value: 0,
        percentage: 0,
        items: 0,
        icon: "business-outline", // Changed from "card-outline" to better represent bank accounts
        color: "#10B981",
        subcategories: [],
        isSystemCard: true,
        last_calculated_at: new Date().toISOString(),
      };

      console.log("🏦 Returning fallback result:", fallbackResult);
      return fallbackResult;
    }
  })();
};

/**
 * Fetch credit cards data formatted for Net Worth display
 */
export const fetchCreditCardsForNetWorth = async (isDemo: boolean = false) => {
  return withErrorHandling(async () => {
    console.log("💳 fetchCreditCardsForNetWorth called with isDemo:", isDemo);

    try {
      const creditCards = await fetchCreditCards(isDemo);
      console.log("💳 Raw credit cards data:", creditCards);
      console.log("💳 Number of credit cards:", creditCards.length);

      // Calculate total debt (positive value representing liability)
      const totalValue = creditCards.reduce(
        (sum, card) => sum + Math.abs(card.currentBalance || 0),
        0
      );
      console.log("💳 Total credit cards value:", totalValue);

      // Format as Net Worth category
      const result = {
        id: "credit-cards",
        name: "Credit Cards",
        type: "liability",
        value: totalValue,
        percentage: 0, // Will be calculated in UI
        items: creditCards.length,
        icon: "card",
        color: "#EF4444",
        subcategories: creditCards.map((card) => ({
          id: card.id,
          name: card.name,
          value: Math.abs(card.currentBalance || 0), // Always positive for liability
          percentage:
            totalValue > 0
              ? Math.round(
                  (Math.abs(card.currentBalance || 0) / totalValue) * 100 * 10
                ) / 10
              : 0,
          institution: card.institution || "Unknown", // Use correct field name
          credit_limit: card.creditLimit,
          available_credit:
            (card.creditLimit || 0) - Math.abs(card.currentBalance || 0),
          card_number: card.lastFourDigits
            ? `****${card.lastFourDigits}`
            : "****", // Use correct field name
          icon: "card",
          color: "#EF4444",
          isSystemCard: true, // Mark as non-deletable
        })),
        isSystemCard: true, // Mark as non-deletable
        last_calculated_at: new Date().toISOString(),
      };

      console.log("💳 Final credit cards result:", result);
      return result;
    } catch (error) {
      console.error("💳 Error fetching credit cards:", error);

      // Return empty credit cards card as fallback
      const fallbackResult = {
        id: "credit-cards",
        name: "Credit Cards",
        type: "liability",
        value: 0,
        percentage: 0,
        items: 0,
        icon: "card",
        color: "#EF4444",
        subcategories: [],
        isSystemCard: true,
        last_calculated_at: new Date().toISOString(),
      };

      console.log("💳 Returning fallback result:", fallbackResult);
      return fallbackResult;
    }
  })();
};
