/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/common/hooks/use-toast';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { BudgetCategory, BudgetSubcategory } from '@/services/budgetService';
import { Transaction as ServiceTransaction } from '@/types/transactions';
import { 
  fetchTransactions,
  addTransaction as addTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  TransactionFilters
} from '@/services/transactionsService';

// Extended transaction type with mobile-specific fields and legacy compatibility
export type Transaction = ServiceTransaction & {
  // loaded relations
  category?: BudgetCategory;
  subcategory?: BudgetSubcategory;
  // legacy mappings for backward compatibility
  bank?: string;
  destinationAccount?: string;
};

export const useTransactions = (limit = 5) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDemo } = useDemoMode();

  const fetchTransactionData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use service layer to fetch transactions with basic date filter
      const now = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      
      const filters: TransactionFilters = {
        dateRange: { start: monthAgo, end: now }
      };
      
      const data = await fetchTransactions(filters, isDemo);
      
      // Apply limit and transform data for mobile compatibility
      const limitedData = data.slice(0, limit);
      const transformedData = limitedData.map(item => {
        const transaction: Transaction = {
          ...item,
          // Add compatibility mappings from actual fields
          bank: item.source_account_name || undefined,
          destinationAccount: item.destination_account_name || undefined,
          // Note: category and subcategory from service are strings, 
          // but mobile expects full objects - these will be undefined for now
          category: undefined,
          subcategory: undefined,
        } as Transaction;
        return transaction;
      });
      
      setTransactions(transformedData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error fetching transactions',
        description: error.message,
        variant: 'destructive',
        duration: 500,
      });
    } finally {
      setLoading(false);
    }
  }, [user, limit, isDemo, toast]);

  useEffect(() => {
    fetchTransactionData();
    
    // Set up real-time subscription based on demo mode
    const tableName = isDemo ? 'transactions' : 'transactions_real';
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        async () => {
          await fetchTransactionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactionData, isDemo]);

  // Utility function to convert between mobile and service transaction formats
  const transformMobileToService = (transaction: Omit<Transaction, 'id'>) => {
    const serviceTransaction = { ...transaction };
    
    // Handle legacy field mappings
    if (transaction.bank && !transaction.source_account_name) {
      serviceTransaction.source_account_name = transaction.bank;
    }
    if (transaction.destinationAccount && !transaction.destination_account_name) {
      serviceTransaction.destination_account_name = transaction.destinationAccount;
    }
    
    return serviceTransaction;
  };

  const transformServiceToMobile = (serviceTransaction: ServiceTransaction): Transaction => {
    return {
      ...serviceTransaction,
      bank: serviceTransaction.source_account_name || undefined,
      destinationAccount: serviceTransaction.destination_account_name || undefined,
      // Mobile expects full category/subcategory objects, but service returns strings
      category: undefined,
      subcategory: undefined,
    } as Transaction;
  };

  // Local state management functions that delegate DB operations to service
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Convert to service format
      const serviceTransaction = transformMobileToService(transaction);

      // Use service layer to add transaction (service handles DB operation)
      const newTransaction = await addTransactionService(serviceTransaction, isDemo);
      
      // Transform for mobile compatibility
      const mobileTransaction = transformServiceToMobile(newTransaction);
      
      // Update local state
      setTransactions(prev => [mobileTransaction, ...prev.slice(0, limit - 1)]);
      
      // Show success toast
      toast({
        title: 'Transaction added',
        description: 'Your transaction has been added successfully',
        duration: 500,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error adding transaction',
        description: error.message,
        variant: 'destructive',
        duration: 500,
      });
      return { success: false, error };
    }
  };

  const editTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Convert to service format
      const updateData = transformMobileToService(updates as Omit<Transaction, 'id'>);

      // Use service layer to update transaction (service handles DB operation)
      const updatedTransaction = await updateTransactionService(id, updateData, isDemo);
      
      // Transform for mobile compatibility
      const mobileTransaction = transformServiceToMobile(updatedTransaction);
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === id ? mobileTransaction : t)
      );
      
      // Show success toast
      toast({
        title: 'Transaction updated',
        description: 'Your transaction has been updated successfully',
        duration: 500,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Error updating transaction',
        description: error.message,
        variant: 'destructive',
        duration: 500,
      });
      return { success: false, error };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Use service layer to delete transaction (service handles DB operation)
      await deleteTransactionService(id, isDemo);
      
      // Update local state
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Show success toast
      toast({
        title: 'Transaction deleted',
        description: 'Your transaction has been deleted successfully',
        duration: 500,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error deleting transaction',
        description: error.message,
        variant: 'destructive',
        duration: 500,
      });
      return { success: false, error };
    }
  };

  return { 
    transactions, 
    loading, 
    addTransaction, 
    editTransaction, 
    deleteTransaction,
    fetchTransactions: fetchTransactionData 
  };
};
