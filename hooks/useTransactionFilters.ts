import { useMemo, useCallback } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import type { TransactionFilters, Transaction } from '../services/transactionsService';

export interface UseTransactionFiltersReturn {
  // Current filtered data
  transactions: Transaction[];
  summary: {
    total: number;
    count: number;
    averageAmount: number;
  } | null;
  
  // Filter state
  activeFilters: TransactionFilters;
  hasActiveFilters: boolean;
  
  // Filter actions
  setTypeFilter: (type: 'income' | 'expense' | 'transfer' | 'all') => void;
  setDateRangeFilter: (start: Date, end: Date) => void;
  setAmountRangeFilter: (min?: number, max?: number) => void;
  setInstitutionFilter: (institution?: string) => void;
  setCategoryFilter: (category?: string) => void;
  setSubcategoryFilter: (subcategory?: string) => void;
  setAccountFilter: (accountId?: string) => void;
  setCreditCardFilter: (isCreditCard?: boolean) => void;
  setSearchFilter: (query?: string) => void;
  clearAllFilters: () => void;
  
  // Convenience methods
  filterByCurrentMonth: () => void;
  filterByLastMonth: () => void;
  filterByCurrentYear: () => void;
  filterByDateRange: (months: number) => void;
}

export const useTransactionFilters = (): UseTransactionFiltersReturn => {
  const {
    filteredTransactions,
    summary,
    filters,
    updateFilter,
    clearFilters
  } = useTransactions();

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      (filters.type && filters.type !== 'all') ||
      filters.dateRange ||
      filters.amountRange ||
      filters.institution ||
      filters.category ||
      filters.subcategory ||
      filters.accountId ||
      filters.isCreditCard !== undefined ||
      filters.searchQuery
    );
  }, [filters]);

  // Filter setters
  const setTypeFilter = useCallback((type: 'income' | 'expense' | 'transfer' | 'all') => {
    updateFilter('type', type);
  }, [updateFilter]);

  const setDateRangeFilter = useCallback((start: Date, end: Date) => {
    updateFilter('dateRange', { start, end });
  }, [updateFilter]);

  const setAmountRangeFilter = useCallback((min?: number, max?: number) => {
    updateFilter('amountRange', { min, max });
  }, [updateFilter]);

  const setInstitutionFilter = useCallback((institution?: string) => {
    updateFilter('institution', institution);
  }, [updateFilter]);

  const setCategoryFilter = useCallback((category?: string) => {
    updateFilter('category', category);
  }, [updateFilter]);

  const setSubcategoryFilter = useCallback((subcategory?: string) => {
    updateFilter('subcategory', subcategory);
  }, [updateFilter]);

  const setAccountFilter = useCallback((accountId?: string) => {
    updateFilter('accountId', accountId);
  }, [updateFilter]);

  const setCreditCardFilter = useCallback((isCreditCard?: boolean) => {
    updateFilter('isCreditCard', isCreditCard);
  }, [updateFilter]);

  const setSearchFilter = useCallback((query?: string) => {
    updateFilter('searchQuery', query);
  }, [updateFilter]);

  const clearAllFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Convenience methods for common date ranges
  const filterByCurrentMonth = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateRangeFilter(start, end);
  }, [setDateRangeFilter]);

  const filterByLastMonth = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setDateRangeFilter(start, end);
  }, [setDateRangeFilter]);

  const filterByCurrentYear = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    setDateRangeFilter(start, end);
  }, [setDateRangeFilter]);

  const filterByDateRange = useCallback((months: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const end = now;
    setDateRangeFilter(start, end);
  }, [setDateRangeFilter]);

  return {
    // Current filtered data
    transactions: filteredTransactions,
    summary,
    
    // Filter state
    activeFilters: filters,
    hasActiveFilters,
    
    // Filter actions
    setTypeFilter,
    setDateRangeFilter,
    setAmountRangeFilter,
    setInstitutionFilter,
    setCategoryFilter,
    setSubcategoryFilter,
    setAccountFilter,
    setCreditCardFilter,
    setSearchFilter,
    clearAllFilters,
    
    // Convenience methods
    filterByCurrentMonth,
    filterByLastMonth,
    filterByCurrentYear,
    filterByDateRange,
  };
};

// Hook for expense-specific filtering
export const useExpenseFilters = () => {
  const filters = useTransactionFilters();
  
  // Auto-apply expense filter
  const setExpenseTypeFilter = useCallback(() => {
    filters.setTypeFilter('expense');
  }, [filters]);

  return {
    ...filters,
    setExpenseTypeFilter,
  };
};

// Hook for income-specific filtering
export const useIncomeFilters = () => {
  const filters = useTransactionFilters();
  
  // Auto-apply income filter
  const setIncomeTypeFilter = useCallback(() => {
    filters.setTypeFilter('income');
  }, [filters]);

  return {
    ...filters,
    setIncomeTypeFilter,
  };
}; 