// =============================================================================
// NET WORTH HOOKS
// =============================================================================
// Custom hooks for managing net worth data using the NetWorth service
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import * as netWorthService from '../services/netWorthService';
import type { Asset } from '@/mobile/pages/Money/components/NetWorthSection';
import type { 
  DbNetWorthCategory, 
  DbNetWorthSubcategory, 
  DbNetWorthEntryDetailed,
  NetWorthSummary,
  CategorySummary 
} from '../services/netWorthService';
import { useDemoMode } from '../contexts/DemoModeContext';

// =============================================================================
// MAIN NETWORTH HOOK
// =============================================================================

export interface UseNetWorthReturn {
  // Data
  entries: DbNetWorthEntryDetailed[];
  categories: DbNetWorthCategory[];
  subcategories: Map<string, DbNetWorthSubcategory[]>; // Map of categoryId -> subcategories
  summary: NetWorthSummary | null;
  categorySummary: CategorySummary[];
  trendData: { date: string; value: number }[];
  trendPercentage: number;
  monthlyChangeText: string;
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  summaryLoading: boolean;
  trendLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchEntries: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSubcategories: (categoryId: string) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchCategorySummary: () => Promise<void>;
  fetchTrendData: () => Promise<void>;
  addEntry: (asset: Omit<Asset, 'id' | 'lastUpdated'>, categoryName: string, subcategoryName: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  syncData: () => Promise<void>;
  createSnapshot: () => Promise<string>;
  createMonthlySnapshot: () => Promise<string>;
  
  // Utility functions
  getAssetsByCategory: (categoryId: string) => DbNetWorthEntryDetailed[];
  convertToAssets: () => Asset[];
}

export const useNetWorth = (): UseNetWorthReturn => {
  // State
  const [entries, setEntries] = useState<DbNetWorthEntryDetailed[]>([]);
  const [categories, setCategories] = useState<DbNetWorthCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Map<string, DbNetWorthSubcategory[]>>(new Map());
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; value: number }[]>([]);
  const [trendPercentage, setTrendPercentage] = useState(0);
  const [monthlyChangeText, setMonthlyChangeText] = useState('+0.0%');
  
  // Loading states - start as false to allow components to trigger loading
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Demo mode
  const { isDemo } = useDemoMode();

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await netWorthService.fetchNetWorthEntries(isDemo);
      console.log('useNetWorth - fetchEntries success:', data.length, 'entries');
      setEntries(data);
    } catch (err) {
      console.error('useNetWorth - fetchEntries error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch net worth entries');
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      const data = await netWorthService.fetchCategories(isDemo);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, [isDemo]);

  // Fetch subcategories for a specific category
  const fetchSubcategories = useCallback(async (categoryId: string) => {
    try {
      const data = await netWorthService.fetchSubcategories(categoryId, isDemo);
      setSubcategories(prev => new Map(prev.set(categoryId, data)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subcategories');
    }
  }, [isDemo]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setError(null);
      const data = await netWorthService.calculateNetWorth(isDemo);
      console.log('useNetWorth - fetchSummary success:', `₹${(data.net_worth / 100000).toFixed(1)}L`);
      setSummary(data);
    } catch (err) {
      console.error('useNetWorth - fetchSummary error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch net worth summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [isDemo]);

  // Fetch category summary
  const fetchCategorySummary = useCallback(async () => {
    try {
      const data = await netWorthService.fetchCategorySummary(isDemo);
      console.log('useNetWorth - fetchCategorySummary success:', data.length, 'categories');
      setCategorySummary(data);
    } catch (err) {
      console.error('useNetWorth - fetchCategorySummary error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch category summary');
    }
  }, [isDemo]);

  // Fetch trend data
  const fetchTrendData = useCallback(async () => {
    try {
      setTrendLoading(true);
      setError(null);
      
      // Fetch historical snapshots
      const snapshots = await netWorthService.fetchNetWorthSnapshots(isDemo);
      setTrendData(snapshots);
      
      // Calculate trend percentage
      const trendInfo = await netWorthService.calculateNetWorthTrend(isDemo);
      setTrendPercentage(trendInfo.percentChange);
      setMonthlyChangeText(trendInfo.monthlyChange);
      
      console.log('useNetWorth - fetchTrendData success:', snapshots.length, 'snapshots');
    } catch (err) {
      console.error('useNetWorth - fetchTrendData error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trend data');
    } finally {
      setTrendLoading(false);
    }
  }, [isDemo]);

  // Create monthly snapshot
  const createMonthlySnapshot = useCallback(async (): Promise<string> => {
    try {
      const snapshotId = await netWorthService.createMonthlySnapshot(isDemo);
      
      // Refresh trend data after creating snapshot
      await fetchTrendData();
      
      return snapshotId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create monthly snapshot');
      throw err;
    }
  }, [isDemo, fetchTrendData]);

  // Add new entry
  const addEntry = useCallback(async (asset: Omit<Asset, 'id' | 'lastUpdated'>, categoryName: string, subcategoryName: string) => {
    try {
      const { categoryId, subcategoryId } = await netWorthService.findCategoryIds(categoryName, subcategoryName, isDemo);
      const dbEntry = netWorthService.assetToDbEntry(asset, categoryId, subcategoryId);
      await netWorthService.addNetWorthEntry(dbEntry, isDemo);
      
      // Refresh data
      await Promise.all([fetchEntries(), fetchSummary(), fetchCategorySummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
      throw err; // Re-throw for component handling
    }
  }, [isDemo, fetchEntries, fetchSummary, fetchCategorySummary]);

  // Update entry
  const updateEntry = useCallback(async (id: string, updates: Partial<Asset>) => {
    try {
      const dbUpdates: Partial<any> = {
        asset_name: updates.name,
        value: updates.value,
        quantity: updates.quantity,
        market_price: updates.marketPrice,
        notes: updates.notes,
        is_active: updates.isActive,
        is_included_in_net_worth: updates.includeInNetWorth
      };
      
      await netWorthService.updateNetWorthEntry(id, dbUpdates, isDemo);
      
      // Update local state
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...dbUpdates } : entry
      ));
      
      // Refresh summary
      await Promise.all([fetchSummary(), fetchCategorySummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  }, [isDemo, fetchSummary, fetchCategorySummary]);

  // Delete entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      await netWorthService.deleteNetWorthEntry(id, isDemo);
      
      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      // Refresh summary
      await Promise.all([fetchSummary(), fetchCategorySummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  }, [isDemo, fetchSummary, fetchCategorySummary]);

  // Toggle visibility
  const toggleVisibility = useCallback(async (id: string) => {
    try {
      await netWorthService.toggleEntryVisibility(id, isDemo);
      
      // Update local state
      setEntries(prev => prev.map(entry => 
        entry.id === id 
          ? { ...entry, is_included_in_net_worth: !entry.is_included_in_net_worth }
          : entry
      ));
      
      // Refresh summary
      await Promise.all([fetchSummary(), fetchCategorySummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle visibility');
      throw err;
    }
  }, [isDemo, fetchSummary, fetchCategorySummary]);

  // Sync data
  const syncData = useCallback(async () => {
    try {
      await netWorthService.syncAllLinkedSources(isDemo);
      
      // Refresh all data after sync
      await Promise.all([fetchEntries(), fetchSummary(), fetchCategorySummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      throw err;
    }
  }, [isDemo, fetchEntries, fetchSummary, fetchCategorySummary]);

  // Create snapshot
  const createSnapshot = useCallback(async (): Promise<string> => {
    try {
      const snapshotId = await netWorthService.createSnapshot(isDemo);
      return snapshotId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create snapshot');
      throw err;
    }
  }, [isDemo]);

  // Utility function to get assets by category
  const getAssetsByCategory = useCallback((categoryId: string): DbNetWorthEntryDetailed[] => {
    return entries.filter(entry => entry.category_id === categoryId && entry.is_active);
  }, [entries]);

  // Convert to Asset format (for compatibility with existing components)
  const convertToAssets = useCallback((): Asset[] => {
    return entries.map(netWorthService.dbEntryToAsset);
  }, [entries]);

  // Note: Removed automatic initial data load to prevent infinite re-renders
  // Components should explicitly call fetch functions when needed

  return {
    // Data
    entries,
    categories,
    subcategories,
    summary,
    categorySummary,
    trendData,
    trendPercentage,
    monthlyChangeText,
    
    // Loading states
    loading,
    categoriesLoading,
    summaryLoading,
    trendLoading,
    
    // Error state
    error,
    
    // Actions
    fetchEntries,
    fetchCategories,
    fetchSubcategories,
    fetchSummary,
    fetchCategorySummary,
    fetchTrendData,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleVisibility,
    syncData,
    createSnapshot,
    createMonthlySnapshot,
    
    // Utility functions
    getAssetsByCategory,
    convertToAssets
  };
};

// =============================================================================
// SPECIALIZED HOOKS
// =============================================================================

/**
 * Hook for syncing net worth with accounts and credit cards
 */
export const useNetWorthSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const { isDemo } = useDemoMode();

  const syncAccounts = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await netWorthService.syncAccounts(isDemo);
      setLastSyncTime(new Date());
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync accounts');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [isDemo]);

  const syncCreditCards = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await netWorthService.syncCreditCards(isDemo);
      setLastSyncTime(new Date());
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync credit cards');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [isDemo]);

  const syncAll = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await netWorthService.syncAllLinkedSources(isDemo);
      setLastSyncTime(new Date());
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync all data');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [isDemo]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    syncAccounts,
    syncCreditCards,
    syncAll
  };
};

/**
 * Hook for managing net worth categories and subcategories
 */
export const useNetWorthCategories = () => {
  const [categories, setCategories] = useState<DbNetWorthCategory[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Map<string, DbNetWorthSubcategory[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isDemo } = useDemoMode();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await netWorthService.fetchCategories(isDemo);
      setCategories(data);
      
      // Load subcategories for all categories
      const subcategoriesPromises = data.map(async (category) => {
        const subcategories = await netWorthService.fetchSubcategories(category.id, isDemo);
        return { categoryId: category.id, subcategories };
      });
      
      const subcategoriesResults = await Promise.all(subcategoriesPromises);
      const newSubcategoriesMap = new Map();
      subcategoriesResults.forEach(({ categoryId, subcategories }) => {
        newSubcategoriesMap.set(categoryId, subcategories);
      });
      setSubcategoriesMap(newSubcategoriesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  const createCategory = useCallback(async (category: Omit<DbNetWorthCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCategory = await netWorthService.createCategory(category, isDemo);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.sort_order - b.sort_order));
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  }, [isDemo]);

  const createSubcategory = useCallback(async (subcategory: Omit<DbNetWorthSubcategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSubcategory = await netWorthService.createSubcategory(subcategory, isDemo);
      setSubcategoriesMap(prev => {
        const existing = prev.get(subcategory.category_id) || [];
        const updated = [...existing, newSubcategory].sort((a, b) => a.sort_order - b.sort_order);
        return new Map(prev.set(subcategory.category_id, updated));
      });
      return newSubcategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subcategory');
      throw err;
    }
  }, [isDemo]);

  const getSubcategories = useCallback((categoryId: string): DbNetWorthSubcategory[] => {
    return subcategoriesMap.get(categoryId) || [];
  }, [subcategoriesMap]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    subcategoriesMap,
    loading,
    error,
    fetchCategories,
    createCategory,
    createSubcategory,
    getSubcategories
  };
}; 