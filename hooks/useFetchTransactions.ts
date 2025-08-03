import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '../contexts/DemoModeContext';
import { Transaction } from '../types/transactions';
import { 
  fetchTransactions, 
  addTransaction as addTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  TransactionFilters
} from '../services/transactionsService';

export type { Transaction, TransactionFilters };

export type TransactionFilter = {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense' | 'transfer' | 'all';
  categoryId?: string;
  accountId?: string;
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
};

export type GroupedTransactions = {
  [date: string]: {
    income: number;
    expense: number;
    transfer: number;
    transactions: Transaction[];
  };
};

// Helper function to convert TransactionFilter to TransactionFilters
const convertFilter = (filter: TransactionFilter): TransactionFilters => {
  const filters: TransactionFilters = {};
  
  // Convert type
  if (filter.type && filter.type !== 'all') {
    filters.type = filter.type;
  }
  
  // Convert date range
  if (filter.dateRange === 'custom' && filter.startDate && filter.endDate) {
    filters.dateRange = {
      start: new Date(filter.startDate),
      end: new Date(filter.endDate)
    };
  } else {
    const now = new Date();
    let startDate = new Date();
    
    switch (filter.dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to last month
    }
    
    filters.dateRange = { start: startDate, end: now };
  }
  
  // Convert other filters
  if (filter.categoryId) {
    filters.category = filter.categoryId;
  }
  
  if (filter.accountId) {
    filters.accountId = filter.accountId;
  }
  
  if (filter.searchTerm) {
    filters.searchQuery = filter.searchTerm;
  }
  
  if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
    filters.amountRange = {
      min: filter.minAmount,
      max: filter.maxAmount
    };
  }
  
  return filters;
};

export function useFetchTransactions(filter: TransactionFilter = { dateRange: 'month', limit: 50 }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransactions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get demo mode state
  const { isDemo } = useDemoMode();

  // Function to refresh/refetch transactions
  const refreshTransactions = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Helper function to sort transactions by date and created_at (most recent first)
  const sortTransactions = (transactionsList: Transaction[]): Transaction[] => {
    return [...transactionsList].sort((a, b) => {
      // First compare by date (newest first)
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are the same, compare by created_at if available
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      // Fall back to comparing by ID if created_at is not available
      return a.id.localeCompare(b.id);
    });
  };

  // Helper function to update grouped transactions
  const updateGroupedTransactions = (transactionsList: Transaction[]) => {
    const grouped = transactionsList.reduce((acc: GroupedTransactions, transaction) => {
      // Format the date (Month DD, YYYY)
      const transactionDate = new Date(transaction.date);
      const dateKey = transactionDate.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric', 
        year: 'numeric'
      });

      // Create the date group if it doesn't exist
      if (!acc[dateKey]) {
        acc[dateKey] = {
          income: 0,
          expense: 0,
          transfer: 0,
          transactions: []
        };
      }

      // Add the transaction to the appropriate group
      acc[dateKey].transactions.push(transaction);
      
      // Sort transactions within each group by created_at or id
      acc[dateKey].transactions.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.id.localeCompare(b.id);
      });

      // Update the totals
      if (transaction.type === 'income') {
        acc[dateKey].income += Number(transaction.amount);
      } else if (transaction.type === 'expense') {
        acc[dateKey].expense += Number(transaction.amount);
      } else if (transaction.type === 'transfer') {
        acc[dateKey].transfer += Number(transaction.amount);
      }

      return acc;
    }, {});

    setGroupedTransactions(grouped);
  };

  // Function to add a transaction to the local state
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      setError(null);
      
      // Use service layer to add transaction
      const newTransaction = await addTransactionService(transaction, isDemo);
      
      // Add to local state to avoid refetching
      setTransactions(prev => {
        const updated = [...prev, newTransaction];
        // Sort by date (descending) and then by created_at (descending)
        return sortTransactions(updated);
      });
      
      // Update grouped transactions
      updateGroupedTransactions([...transactions, newTransaction]);
      
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      return null;
    }
  }, [transactions, isDemo]);

  // Function to update a transaction
  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      setError(null);
      
      // Use service layer to update transaction
      const updatedTransaction = await updateTransactionService(id, updates, isDemo);
      
      // Update local state
      setTransactions(prev => {
        const updatedTransactions = prev.map(t => 
          t.id === id ? updatedTransaction : t
        );
        // Sort again in case date changed
        return sortTransactions(updatedTransactions);
      });
      
      // Update grouped transactions based on the updated transactions
      const updatedTransactionsList = transactions.map(t => 
        t.id === id ? updatedTransaction : t
      );
      
      updateGroupedTransactions(updatedTransactionsList);
      
      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      return null;
    }
  }, [transactions, isDemo]);

  // Function to delete a transaction
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // Use service layer to delete transaction
      await deleteTransactionService(id, isDemo);
      
      // Remove from local state
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Update grouped transactions
      const updatedTransactions = transactions.filter(t => t.id !== id);
      updateGroupedTransactions(updatedTransactions);
      
      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      return false;
    }
  }, [transactions, isDemo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert the filter format
        const serviceFilters = convertFilter(filter);
        
        // Apply limit if specified
        if (filter.limit) {
          // Note: Service layer doesn't currently support limit, so we'll slice afterwards
        }

        // Use service layer to fetch transactions
        const data = await fetchTransactions(serviceFilters, isDemo);
        
        // Apply limit if specified
        const limitedData = filter.limit ? data.slice(0, filter.limit) : data;
        
        // Sort transactions by date and created_at (most recent first)
        const sortedTransactions = sortTransactions(limitedData);
        
        setTransactions(sortedTransactions);
        
        // Group transactions by date
        updateGroupedTransactions(sortedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, refreshTrigger, isDemo]);

  return { 
    transactions, 
    groupedTransactions, 
    loading, 
    error,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
} 