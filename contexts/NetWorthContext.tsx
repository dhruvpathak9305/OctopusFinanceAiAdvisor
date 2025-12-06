/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps */
import React, { createContext, useContext, ReactNode, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNetWorth, useNetWorthSync, type UseNetWorthReturn } from '../hooks/useNetWorth';
import { fetchCategories } from '../services/netWorthService';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useUnifiedAuth } from './UnifiedAuthContext';
import type { Asset } from '../src/mobile/pages/Money/components/NetWorthSection';
import type { 
  DbNetWorthCategory, 
  DbNetWorthSubcategory, 
  DbNetWorthEntryDetailed,
  NetWorthSummary,
  CategorySummary 
} from '../services/netWorthService';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface NetWorthContextType extends UseNetWorthReturn {
  // Additional context-specific functionality
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Initialization state
  isInitialized: boolean;
  initializeData: () => Promise<void>;
  
  // Sync functionality
  syncState: {
    isSyncing: boolean;
    lastSyncTime: Date | null;
    syncError: string | null;
  };
  syncActions: {
    syncAccounts: () => Promise<void>;
    syncCreditCards: () => Promise<void>;
    syncAll: () => Promise<void>;
  };
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

export const NetWorthContext = createContext<NetWorthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const NetWorthProvider = ({ children }: { children: ReactNode }) => {
  // Authentication check - CRITICAL: Don't fetch data before user is logged in
  const { isAuthenticated, user } = useUnifiedAuth();
  
  // Main net worth hook
  const netWorthHook = useNetWorth();
  
  // Sync hook
  const {
    isSyncing,
    lastSyncTime,
    syncError,
    syncAccounts,
    syncCreditCards,
    syncAll
  } = useNetWorthSync();
  
  // Demo mode
  const { isDemo } = useDemoMode();
  
  // Initialization tracking
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  const isInitializedRef = useRef(false);

  // Centralized data initialization - prevents duplicate API calls
  const initializeData = useCallback(async () => {
    // If already initialized or currently initializing, return the existing promise
    if (isInitializedRef.current || initializationPromiseRef.current) {
      return initializationPromiseRef.current || Promise.resolve();
    }

    // Safety check: Don't fetch data if user is not authenticated
    if (!user || !isAuthenticated) {
      console.log('ℹ️ NetWorthProvider: Skipping initialization - user not authenticated');
      return Promise.resolve();
    }

    console.log('NetWorthProvider - Starting centralized data initialization...');
    
    // Create and store the initialization promise
    initializationPromiseRef.current = (async () => {
      try {
        // Step 1: Fetch categories first
        await netWorthHook.fetchCategories();
        
        // Step 2: Get categories directly from service to get immediate access
        const categoriesData = await fetchCategories(isDemo);
        
        // Step 3: Fetch subcategories for all categories
        const subcategoryPromises = categoriesData.map(category => 
          netWorthHook.fetchSubcategories(category.id)
        );
        
        // Step 4: Fetch all other data in parallel with subcategories
        await Promise.all([
          netWorthHook.fetchEntries(),
          netWorthHook.fetchSummary(),
          netWorthHook.fetchCategorySummary(),
          netWorthHook.fetchTrendData(),
          ...subcategoryPromises
        ]);
        
        isInitializedRef.current = true;
        console.log('NetWorthProvider - Centralized data initialization completed successfully');
      } catch (error) {
        console.error('NetWorthProvider - Centralized data initialization failed:', error);
        // Reset initialization state on error to allow retry
        isInitializedRef.current = false;
        initializationPromiseRef.current = null;
        throw error;
      }
    })();

    return initializationPromiseRef.current;
  }, [
    netWorthHook.fetchEntries,
    netWorthHook.fetchCategories,
    netWorthHook.fetchSubcategories,
    netWorthHook.fetchSummary,
    netWorthHook.fetchCategorySummary,
    netWorthHook.fetchTrendData,
    isDemo,
    user,
    isAuthenticated
  ]);

  // Auto-initialize data when provider mounts - ONLY if user is authenticated
  useEffect(() => {
    // Skip initialization if user is not authenticated
    if (!isAuthenticated || !user) {
      console.log('⏳ NetWorthProvider: Waiting for authentication before initializing data...');
      return;
    }
    
    console.log('✅ NetWorthProvider: User authenticated, initializing data...');
    initializeData().catch(err => {
      console.error('NetWorthProvider - Auto-initialization failed:', err);
    });
  }, [initializeData, isAuthenticated, user]);

  // Memoize refreshData to prevent infinite re-renders
  const refreshData = useCallback(async () => {
    // Reset initialization state to force fresh data
    isInitializedRef.current = false;
    initializationPromiseRef.current = null;
    
    // Re-initialize with fresh data
    await initializeData();
  }, [initializeData]);

  const clearError = useCallback(() => {
    // Reset error state in the hook
    // Note: This would require exposing a clearError method from the hook
    // For now, errors will clear on the next successful operation
  }, []);

  // Memoize enhanced sync actions that also refresh data
  const enhancedSyncAccounts = useCallback(async () => {
    await syncAccounts();
    await refreshData();
  }, [syncAccounts, refreshData]);

  const enhancedSyncCreditCards = useCallback(async () => {
    await syncCreditCards();
    await refreshData();
  }, [syncCreditCards, refreshData]);

  const enhancedSyncAll = useCallback(async () => {
    await syncAll();
    await refreshData();
  }, [syncAll, refreshData]);

  // Memoize sync state and actions to prevent unnecessary re-renders
  const syncState = useMemo(() => ({
    isSyncing,
    lastSyncTime,
    syncError
  }), [isSyncing, lastSyncTime, syncError]);

  const syncActions = useMemo(() => ({
    syncAccounts: enhancedSyncAccounts,
    syncCreditCards: enhancedSyncCreditCards,
    syncAll: enhancedSyncAll
  }), [enhancedSyncAccounts, enhancedSyncCreditCards, enhancedSyncAll]);

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo((): NetWorthContextType => ({
    // Spread all net worth hook values
    ...netWorthHook,
    
    // Additional context functionality
    refreshData,
    clearError,
    
    // Initialization state
    isInitialized: isInitializedRef.current,
    initializeData,
    
    // Sync state and actions
    syncState,
    syncActions
  }), [
    netWorthHook,
    refreshData,
    clearError,
    initializeData,
    syncState,
    syncActions
  ]);

  return (
    <NetWorthContext.Provider value={contextValue}>
      {children}
    </NetWorthContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOK TO USE CONTEXT
// =============================================================================

/**
 * Custom hook to use the NetWorth context
 * Throws an error if used outside of NetWorthProvider
 */
export const useNetWorthContext = (): NetWorthContextType => {
  const context = useContext(NetWorthContext);
  if (context === undefined) {
    throw new Error('useNetWorthContext must be used within a NetWorthProvider');
  }
  return context;
};

// =============================================================================
// CONVENIENCE HOOKS - Memoized to prevent unnecessary re-renders
// =============================================================================

/**
 * Hook to get only the net worth data (without actions)
 * Now includes automatic initialization on first use
 */
export const useNetWorthData = () => {
  const context = useNetWorthContext();
  
  // Auto-initialize if not already done
  useEffect(() => {
    if (!context.isInitialized && !context.loading) {
      context.initializeData().catch(err => {
        console.error('useNetWorthData - Auto-initialization failed:', err);
      });
    }
  }, [context.isInitialized, context.loading, context.initializeData]);
  
  return useMemo(() => ({
    entries: context.entries,
    categories: context.categories,
    subcategories: context.subcategories,
    summary: context.summary,
    categorySummary: context.categorySummary,
    trendData: context.trendData,
    trendPercentage: context.trendPercentage,
    monthlyChangeText: context.monthlyChangeText,
    loading: context.loading,
    categoriesLoading: context.categoriesLoading,
    summaryLoading: context.summaryLoading,
    trendLoading: context.trendLoading,
    error: context.error,
    isInitialized: context.isInitialized
  }), [
    context.entries,
    context.categories,
    context.subcategories,
    context.summary,
    context.categorySummary,
    context.trendData,
    context.trendPercentage,
    context.monthlyChangeText,
    context.loading,
    context.categoriesLoading,
    context.summaryLoading,
    context.trendLoading,
    context.error,
    context.isInitialized
  ]);
};

/**
 * Hook to get only the net worth actions
 */
export const useNetWorthActions = () => {
  const context = useNetWorthContext();
  
  return useMemo(() => ({
    fetchEntries: context.fetchEntries,
    fetchCategories: context.fetchCategories,
    fetchSubcategories: context.fetchSubcategories,
    fetchSummary: context.fetchSummary,
    fetchCategorySummary: context.fetchCategorySummary,
    fetchTrendData: context.fetchTrendData,
    addEntry: context.addEntry,
    updateEntry: context.updateEntry,
    deleteEntry: context.deleteEntry,
    toggleVisibility: context.toggleVisibility,
    syncData: context.syncData,
    createSnapshot: context.createSnapshot,
    createMonthlySnapshot: context.createMonthlySnapshot,
    refreshData: context.refreshData,
    clearError: context.clearError,
    getAssetsByCategory: context.getAssetsByCategory,
    convertToAssets: context.convertToAssets,
    initializeData: context.initializeData
  }), [
    context.fetchEntries,
    context.fetchCategories,
    context.fetchSubcategories,
    context.fetchSummary,
    context.fetchCategorySummary,
    context.fetchTrendData,
    context.addEntry,
    context.updateEntry,
    context.deleteEntry,
    context.toggleVisibility,
    context.syncData,
    context.createSnapshot,
    context.createMonthlySnapshot,
    context.refreshData,
    context.clearError,
    context.getAssetsByCategory,
    context.convertToAssets,
    context.initializeData
  ]);
};

/**
 * Hook to get sync-related functionality
 */
export const useNetWorthSyncContext = () => {
  const context = useNetWorthContext();
  
  return useMemo(() => ({
    ...context.syncState,
    ...context.syncActions
  }), [context.syncState, context.syncActions]);
};

/**
 * Hook to get utility functions
 */
export const useNetWorthUtils = () => {
  const context = useNetWorthContext();
  
  return useMemo(() => ({
    getAssetsByCategory: context.getAssetsByCategory,
    convertToAssets: context.convertToAssets
  }), [context.getAssetsByCategory, context.convertToAssets]);
};

// =============================================================================
// HOC TYPES
// =============================================================================

export interface WithNetWorthDataProps {
  netWorth: {
    entries: DbNetWorthEntryDetailed[];
    categories: DbNetWorthCategory[];
    summary: NetWorthSummary | null;
    loading: boolean;
    error: string | null;
  };
}

export interface WithNetWorthActionsProps {
  netWorthActions: {
    addEntry: (asset: Omit<Asset, 'id' | 'lastUpdated'>, categoryName: string, subcategoryName: string) => Promise<void>;
    updateEntry: (id: string, updates: Partial<Asset>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    toggleVisibility: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
  };
}

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

export const withNetWorthData = <P extends WithNetWorthDataProps>(
  Component: React.ComponentType<P>
) => {
  return React.memo((props: Omit<P, 'netWorth'>) => {
    const { entries, categories, summary, loading, error } = useNetWorthData();
    
    const netWorthData = useMemo(() => ({
      entries,
      categories,
      summary,
      loading,
      error
    }), [entries, categories, summary, loading, error]);

    return (
      <Component 
        {...(props as P)} 
        netWorth={netWorthData}
      />
    );
  });
};

export const withNetWorthActions = <P extends WithNetWorthActionsProps>(
  Component: React.ComponentType<P>
) => {
  return React.memo((props: Omit<P, 'netWorthActions'>) => {
    const { addEntry, updateEntry, deleteEntry, toggleVisibility, refreshData } = useNetWorthActions();
    
    const netWorthActions = useMemo(() => ({
      addEntry,
      updateEntry,
      deleteEntry,
      toggleVisibility,
      refreshData
    }), [addEntry, updateEntry, deleteEntry, toggleVisibility, refreshData]);

    return (
      <Component 
        {...(props as P)} 
        netWorthActions={netWorthActions}
      />
    );
  });
}; 