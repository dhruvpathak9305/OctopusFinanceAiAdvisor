import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useDemoMode } from './DemoModeContext';
import * as transactionService from '../services/transactionsService';
import type { 
  Transaction, 
  TransactionFilters, 
  TransactionSummary 
} from '../services/transactionsService';

export interface TransactionContextType {
  // Data
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  summary: TransactionSummary | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  updateFilter: (key: keyof TransactionFilters, value: any) => void;
  clearFilters: () => void;
  
  // Actions
  refreshTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Convenience methods
  getMonthlyExpenseSummary: () => Promise<TransactionSummary>;
  getMonthlyIncomeSummary: () => Promise<TransactionSummary>;
  getTransactionHistory: (type?: 'income' | 'expense' | 'all', months?: number) => Promise<{ month: string; value: number }[]>;
}

const defaultFilters: TransactionFilters = {
  type: 'all',
  dateRange: undefined,
  amountRange: undefined,
  institution: undefined,
  category: undefined,
  subcategory: undefined,
  accountId: undefined,
  isCreditCard: undefined,
  searchQuery: undefined,
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  
  const { isDemo } = useDemoMode();

  // Memoized filter functions to prevent infinite loops
  const applyFilters = useCallback((allTransactions: Transaction[], currentFilters: TransactionFilters): Transaction[] => {
    let filtered = [...allTransactions];

    // Type filter
    if (currentFilters.type && currentFilters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === currentFilters.type);
    }

    // Date range filter
    if (currentFilters.dateRange) {
      const { start, end } = currentFilters.dateRange;
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= start && txDate <= end;
      });
    }

    // Amount range filter
    if (currentFilters.amountRange) {
      const { min, max } = currentFilters.amountRange;
      if (min !== undefined) {
        filtered = filtered.filter(tx => tx.amount >= min);
      }
      if (max !== undefined) {
        filtered = filtered.filter(tx => tx.amount <= max);
      }
    }

    // Institution filter
    if (currentFilters.institution) {
      filtered = filtered.filter(tx => tx.merchant === currentFilters.institution);
    }

    // Category filter
    if (currentFilters.category) {
      filtered = filtered.filter(tx => tx.category_name === currentFilters.category);
    }

    // Subcategory filter
    if (currentFilters.subcategory) {
      filtered = filtered.filter(tx => tx.subcategory_name === currentFilters.subcategory);
    }

    // Account filter
    if (currentFilters.accountId) {
      filtered = filtered.filter(tx => tx.source_account_id === currentFilters.accountId);
    }

    // Credit card filter
    if (currentFilters.isCreditCard !== undefined) {
      filtered = filtered.filter(tx => tx.is_credit_card === currentFilters.isCreditCard);
    }

    // Search query filter
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(query) ||
        tx.category_name?.toLowerCase().includes(query) ||
        tx.merchant?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, []);

  // Memoized summary calculation
  const calculateSummary = useCallback((filtered: Transaction[]): TransactionSummary => {
    const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
    const count = filtered.length;
    const averageAmount = count > 0 ? total / count : 0;

    return {
      total,
      count,
      averageAmount,
    };
  }, []);

  // Fetch all transactions - removed filters from dependencies to prevent infinite loops
  const refreshTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allTransactions = await transactionService.fetchTransactions({}, isDemo);
      setTransactions(allTransactions);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [isDemo]); // Only depend on isDemo

  // Update filter and reapply filtering
  const updateFilter = useCallback((key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Add transaction
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await transactionService.addTransaction(transaction, isDemo);
      await refreshTransactions(); // Refresh to get updated list
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  }, [isDemo, refreshTransactions]);

  // Update transaction
  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      await transactionService.updateTransaction(id, updates, isDemo);
      await refreshTransactions(); // Refresh to get updated list
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  }, [isDemo, refreshTransactions]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionService.deleteTransaction(id, isDemo);
      await refreshTransactions(); // Refresh to get updated list
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  }, [isDemo, refreshTransactions]);

  // Memoized convenience methods that don't cause re-renders
  const getMonthlyExpenseSummary = useCallback(async (): Promise<TransactionSummary> => {
    try {
      return await transactionService.fetchMonthlyTransactionSummary('expense', isDemo);
    } catch (err) {
      console.error('Error fetching monthly expense summary:', err);
      throw err;
    }
  }, [isDemo]);

  const getMonthlyIncomeSummary = useCallback(async (): Promise<TransactionSummary> => {
    try {
      return await transactionService.fetchMonthlyTransactionSummary('income', isDemo);
    } catch (err) {
      console.error('Error fetching monthly income summary:', err);
      throw err;
    }
  }, [isDemo]);

  const getTransactionHistory = useCallback(async (
    type: 'income' | 'expense' | 'all' = 'all', 
    months: number = 12
  ): Promise<{ month: string; value: number }[]> => {
    try {
      const filterType = type === 'all' ? undefined : type;
      return await transactionService.fetchTransactionHistory(
        { type: filterType },
        isDemo,
        months
      );
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      throw err;
    }
  }, [isDemo]);

  // Effect: Refresh transactions only when demo mode changes
  useEffect(() => {
    refreshTransactions();
  }, [isDemo]); // Removed refreshTransactions dependency to prevent loops

  // Effect: Apply filters when transactions or filters change
  useEffect(() => {
    const filtered = applyFilters(transactions, filters);
    setFilteredTransactions(filtered);
    
    const newSummary = calculateSummary(filtered);
    setSummary(newSummary);
  }, [transactions, filters, applyFilters, calculateSummary]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo((): TransactionContextType => ({
    // Data
    transactions,
    filteredTransactions,
    summary,
    
    // State
    loading,
    error,
    
    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    
    // Actions
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Convenience methods
    getMonthlyExpenseSummary,
    getMonthlyIncomeSummary,
    getTransactionHistory,
  }), [
    transactions,
    filteredTransactions,
    summary,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyExpenseSummary,
    getMonthlyIncomeSummary,
    getTransactionHistory,
  ]);

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use the transaction context
export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

// Additional convenient hooks for specific use cases - memoized to prevent re-renders
export const useMonthlyExpenses = () => {
  const { getMonthlyExpenseSummary, getTransactionHistory } = useTransactions();
  
  return useMemo(() => ({
    getExpenseSummary: getMonthlyExpenseSummary,
    getExpenseHistory: (months?: number) => getTransactionHistory('expense', months),
  }), [getMonthlyExpenseSummary, getTransactionHistory]);
};

export const useMonthlyIncome = () => {
  const { getMonthlyIncomeSummary, getTransactionHistory } = useTransactions();
  
  return useMemo(() => ({
    getIncomeSummary: getMonthlyIncomeSummary,
    getIncomeHistory: (months?: number) => getTransactionHistory('income', months),
  }), [getMonthlyIncomeSummary, getTransactionHistory]);
}; 