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
import type { Asset } from '@/mobile/pages/Money/components/NetWorthSection';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

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
  if (process.env.NODE_ENV === 'development') {
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
  type: 'asset' | 'liability';
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
  linked_source_type: 'account' | 'credit_card' | 'transaction' | 'manual';
  linked_source_id?: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

export interface DbNetWorthEntryDetailed extends DbNetWorthEntry {
  category_name: string;
  category_type: 'asset' | 'liability';
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
  category_type: 'asset' | 'liability';
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
export const fetchCategories = async (isDemo: boolean = false): Promise<DbNetWorthCategory[]> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_categories;
  
  const { data, error } = await supabase
    .from(tableName as 'net_worth_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data as DbNetWorthCategory[] || [];
};

/**
 * Get subcategories for a specific category
 */
export const fetchSubcategories = async (categoryId: string, isDemo: boolean = false): Promise<DbNetWorthSubcategory[]> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_subcategories;
  
  const { data, error } = await supabase
    .from(tableName as 'net_worth_subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data as DbNetWorthSubcategory[] || [];
};

/**
 * Create a new category
 */
export const createCategory = async (category: Omit<DbNetWorthCategory, 'id' | 'created_at' | 'updated_at'>, isDemo: boolean = false): Promise<DbNetWorthCategory> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_categories;
  
  const { data, error } = await supabase
    .from(tableName as 'net_worth_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthCategory;
};

/**
 * Create a new subcategory
 */
export const createSubcategory = async (subcategory: Omit<DbNetWorthSubcategory, 'id' | 'created_at' | 'updated_at'>, isDemo: boolean = false): Promise<DbNetWorthSubcategory> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_subcategories;
  
  const { data, error } = await supabase
    .from(tableName as 'net_worth_subcategories')
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
export const fetchNetWorthEntries = async (isDemo: boolean = false): Promise<DbNetWorthEntryDetailed[]> => {
  // Use raw SQL query to handle dynamic table names for detailed view
  const detailedViewName = isDemo ? 'net_worth_entries_detailed' : 'net_worth_entries_detailed_real';
  
  const { data, error } = await supabase
    .from(detailedViewName as 'net_worth_entries_detailed')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('netWorthService - fetchNetWorthEntries error:', error);
    throw error;
  }
  
  return data as DbNetWorthEntryDetailed[] || [];
};

/**
 * Get entries by category
 */
export const fetchEntriesByCategory = async (categoryId: string, isDemo: boolean = false): Promise<DbNetWorthEntryDetailed[]> => {
  const detailedViewName = isDemo ? 'net_worth_entries_detailed' : 'net_worth_entries_detailed_real';
  
  const { data, error } = await supabase
    .from(detailedViewName as 'net_worth_entries_detailed')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as DbNetWorthEntryDetailed[] || [];
};

/**
 * Create a new net worth entry
 */
export const addNetWorthEntry = async (entry: Omit<DbNetWorthEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>, isDemo: boolean = false): Promise<DbNetWorthEntry> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;
  
  const { data, error } = await supabase
    .from(tableName as 'net_worth_entries')
    .insert({
      ...entry,
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthEntry;
};

/**
 * Update an existing net worth entry
 */
export const updateNetWorthEntry = async (id: string, updates: Partial<Omit<DbNetWorthEntry, 'id' | 'user_id' | 'created_at'>>, isDemo: boolean = false): Promise<DbNetWorthEntry> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;
  
  const { data, error } = await supabase
    .from(tableName as 'net_worth_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as DbNetWorthEntry;
};

/**
 * Delete a net worth entry (soft delete by setting is_active = false)
 */
export const deleteNetWorthEntry = async (id: string, isDemo: boolean = false): Promise<void> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;
  
  const { error } = await supabase
    .from(tableName as 'net_worth_entries')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

/**
 * Toggle entry visibility in net worth calculations
 */
export const toggleEntryVisibility = async (id: string, isDemo: boolean = false): Promise<DbNetWorthEntry> => {
  const tableMap = getTableMapping(isDemo);
  const tableName = tableMap.net_worth_entries;
  
  // First get the current state
  const { data: currentEntry, error: fetchError } = await supabase
    .from(tableName as 'net_worth_entries')
    .select('is_included_in_net_worth')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Update with opposite value
  const { data, error } = await supabase
    .from(tableName as 'net_worth_entries')
    .update({ is_included_in_net_worth: !currentEntry.is_included_in_net_worth })
    .eq('id', id)
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
export const calculateNetWorth = async (isDemo: boolean = false): Promise<NetWorthSummary> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const functionName = isDemo ? 'calculate_user_net_worth' : 'calculate_user_net_worth_real';
  
  const { data, error } = await supabase
    .rpc(functionName as any, { user_uuid: user.id });

  if (error) {
    console.error('netWorthService - calculateNetWorth error:', error);
    throw error;
  }
  
  return (data && data[0]) ? data[0] : { total_assets: 0, total_liabilities: 0, net_worth: 0 };
};

/**
 * Get category-wise summary
 */
export const fetchCategorySummary = async (isDemo: boolean = false): Promise<CategorySummary[]> => {
  const summaryViewName = isDemo ? 'user_net_worth_summary' : 'user_net_worth_summary_real';
  
  const { data, error } = await supabase
    .from(summaryViewName as 'user_net_worth_summary')
    .select('*')
    .order('total_value', { ascending: false });

  if (error) {
    console.error('netWorthService - fetchCategorySummary error:', error);
    throw error;
  }
  
  return data as CategorySummary[] || [];
};

/**
 * Create a snapshot of current net worth
 */
export const createSnapshot = async (isDemo: boolean = false): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const functionName = isDemo ? 'create_net_worth_snapshot' : 'create_net_worth_snapshot_real';
  
  const { data, error } = await supabase
    .rpc(functionName as any, { user_uuid: user.id });

  if (error) throw error;
  return data as string;
};

/**
 * Get historical snapshots for trend analysis
 */
export const fetchNetWorthSnapshots = async (isDemo: boolean = false, limit: number = 12): Promise<{ date: string; value: number }[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const snapshotsTableName = isDemo ? 'net_worth_snapshots' : 'net_worth_snapshots_real';
  
  const { data, error } = await supabase
    .from(snapshotsTableName as 'net_worth_snapshots')
    .select('snapshot_date, net_worth')
    .eq('user_id', user.id)
    .order('snapshot_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('netWorthService - fetchNetWorthSnapshots error:', error);
    throw error;
  }

  // Transform to chart format
  return (data || []).map(snapshot => ({
    date: snapshot.snapshot_date,
    value: Number(snapshot.net_worth)
  })).reverse(); // Reverse to get chronological order
};

/**
 * Get month-over-month percentage change
 */
export const calculateNetWorthTrend = async (isDemo: boolean = false): Promise<{ percentChange: number; monthlyChange: string }> => {
  const snapshots = await fetchNetWorthSnapshots(isDemo, 2);
  
  if (snapshots.length < 2) {
    return { percentChange: 0, monthlyChange: '+0.0%' };
  }

  const current = snapshots[snapshots.length - 1].value;
  const previous = snapshots[snapshots.length - 2].value;
  
  if (previous === 0) {
    return { percentChange: 0, monthlyChange: '+0.0%' };
  }

  const percentChange = ((current - previous) / Math.abs(previous)) * 100;
  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  return { percentChange, monthlyChange };
};

/**
 * Create monthly snapshots automatically
 */
export const createMonthlySnapshot = async (isDemo: boolean = false): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const snapshotsTableName = isDemo ? 'net_worth_snapshots' : 'net_worth_snapshots_real';
  
  // Check if snapshot already exists for current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const { data: existingSnapshot } = await supabase
    .from(snapshotsTableName as 'net_worth_snapshots')
    .select('id')
    .eq('user_id', user.id)
    .gte('snapshot_date', `${currentMonth}-01`)
    .lt('snapshot_date', `${currentMonth}-31`)
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
  const functionName = isDemo ? 'sync_accounts_to_net_worth' : 'sync_accounts_to_net_worth_real';
  
  const { error } = await supabase.rpc(functionName as any);
  if (error) throw error;
};

/**
 * Sync credit card balances to net worth entries
 */
export const syncCreditCards = async (isDemo: boolean = false): Promise<void> => {
  const functionName = isDemo ? 'sync_credit_cards_to_net_worth' : 'sync_credit_cards_to_net_worth_real';
  
  const { error } = await supabase.rpc(functionName as any);
  if (error) throw error;
};

/**
 * Sync all linked sources
 */
export const syncAllLinkedSources = async (isDemo: boolean = false): Promise<void> => {
  await Promise.all([
    syncAccounts(isDemo),
    syncCreditCards(isDemo)
  ]);
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
    quantity: entry.quantity
  };
};

/**
 * Convert frontend Asset to database entry format
 */
export const assetToDbEntry = (asset: Omit<Asset, 'id' | 'lastUpdated'>, categoryId: string, subcategoryId: string): Omit<DbNetWorthEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  return {
    asset_name: asset.name,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    value: asset.value,
    quantity: asset.quantity,
    market_price: asset.marketPrice,
    notes: asset.notes,
    date: new Date().toISOString().split('T')[0], // Current date
    is_active: asset.isActive,
    is_included_in_net_worth: asset.includeInNetWorth,
    linked_source_type: 'manual'
  };
};

/**
 * Find category and subcategory IDs by names
 */
export const findCategoryIds = async (categoryName: string, subcategoryName: string, isDemo: boolean = false): Promise<{ categoryId: string; subcategoryId: string }> => {
  const tableMap = getTableMapping(isDemo);
  
  // Find category
  const { data: category, error: catError } = await supabase
    .from(tableMap.net_worth_categories as 'net_worth_categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (catError) throw catError;

  // Find subcategory
  const { data: subcategory, error: subError } = await supabase
    .from(tableMap.net_worth_subcategories as 'net_worth_subcategories')
    .select('id')
    .eq('category_id', category.id)
    .eq('name', subcategoryName)
    .single();

  if (subError) throw subError;

  return {
    categoryId: category.id,
    subcategoryId: subcategory.id
  };
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class NetWorthServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NetWorthServiceError';
  }
}

/**
 * Wrap service calls with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('NetWorth Service Error:', error);
      throw new NetWorthServiceError(
        `Failed to execute ${fn.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }) as T;
};