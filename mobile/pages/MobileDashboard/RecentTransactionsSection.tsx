import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ErrorBoundary from '@/common/components/ErrorBoundary';
import TransactionGroup from '@/mobile/components/transactions/TransactionGroup';
import { PlusCircle, Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchTransactions, TransactionFilter, GroupedTransactions as ApiGroupedTransactions, Transaction as ApiTransaction } from '@/hooks/useFetchTransactions';
import { getIconConfig } from '@/shared/icons/categoryIcons';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import TransactionDialog from '@/components/common/QuickAddButton/components/TransactionDialog';
import { mapFormDataToTransaction } from '@/utils/transactionFormHelpers';
import { TransactionFormData } from '@/types/transactions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCreditCards } from '@/contexts/CreditCardContext';

interface RecentTransactionsSectionProps {
  className?: string;
}

// Define UI transaction type
interface UITransaction {
  id: number | string;
  description: string;
  isRecurring?: boolean;
  account?: string;
  fromAccount?: string;
  toAccount?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  category?: string;
  subcategory?: string;
  note?: string;
  icon: string;
  originalTransaction?: ApiTransaction; // Reference to the original API transaction
}

// Define UI grouped transactions type
interface UIGroupedTransactions {
  [date: string]: {
    income: number;
    expense: number;
    transfer: number;
    transactions: UITransaction[];
  };
}

// Function to map database transaction to UI transaction format
const mapTransactionForUI = (transaction: ApiTransaction): UITransaction => {
  // Get appropriate icon based on category and subcategory
  const iconConfig = getIconConfig(
    transaction.category_name || transaction.type,
    transaction.subcategory_name
  );

  return {
    // Keep the original ID for accurate reference
    id: transaction.id,
    description: transaction.name,
    isRecurring: transaction.is_recurring || false,
    account: transaction.source_account_name || transaction.source_account_type,
    fromAccount: transaction.source_account_name,
    toAccount: transaction.destination_account_name,
    type: transaction.type as 'income' | 'expense' | 'transfer',
    amount: transaction.amount.toString(),
    category: transaction.category_name || '',
    subcategory: transaction.subcategory_name || '',
    note: transaction.description || '',
    // Use the icon from our mapping or fall back to a default
    icon: transaction.icon || `fa-${iconConfig.icon}`,
    // Store the original transaction for reference
    originalTransaction: transaction
  };
};

const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({
  className = "",
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("month");
  const [transactionToEdit, setTransactionToEdit] = useState<ApiTransaction | null>(null);
  const navigate = useNavigate();

  // Get demo mode state and account data
  const { isDemo } = useDemoMode();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();

  // Transaction dialog state - simplified for new TransactionDialog component
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  // Create a filter state for the transactions hook
  const [filter, setFilter] = useState<TransactionFilter>({
    dateRange: 'month',
    limit: 50
  });

  // Fetch transactions using our custom hook with the enhanced functionality
  const {
    groupedTransactions,
    loading,
    error,
    refreshTransactions,
    updateTransaction,
    deleteTransaction
  } = useFetchTransactions(filter);

  // Update filter when dropdown selection changes
  useEffect(() => {
    setFilter(prev => ({
      ...prev,
      dateRange: selectedFilter as 'week' | 'month' | 'quarter'
    }));
  }, [selectedFilter]);

  // Function to handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };



  // Handle form submission
  const handleTransactionSubmit = async (formData: TransactionFormData) => {
    try {
      if (dialogMode === 'edit' && transactionToEdit) {
        // Use mapFormDataToTransaction to properly format the data for API with account mapping
        const transactionData = mapFormDataToTransaction(
          formData, 
          (transactionToEdit as any).originalTransaction,
          accounts.map(acc => ({ id: acc.id, name: acc.name, type: acc.type })),
          creditCards.map(cc => ({ id: cc.id!, name: cc.name }))
        );

        // Call the updateTransaction function
        await updateTransaction(String(transactionToEdit.id), transactionData);

        toast({
          title: "Transaction updated",
          description: "Transaction updated successfully",
        });

        // Close dialog and refresh
        handleDialogClose();
      } else {
        // For add mode, the TransactionDialog will handle the submission internally
        toast({
          title: "Transaction added",
          description: "Transaction added successfully",
        });
        
        // Close dialog and refresh
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    }
  };



  // Function to handle transaction edit
  const handleEditTransaction = useCallback((transactionId: number | string) => {
    // Find the transaction in our grouped transactions
    for (const date in groupedTransactions) {
      const transaction = groupedTransactions[date].transactions.find(t => t.id === transactionId);
      if (transaction) {
        // Add type assertion when setting the transaction
        setTransactionToEdit(transaction as any);
        setDialogMode('edit');
        setIsDialogOpen(true);
        return;
      }
    }
  }, [groupedTransactions]);

  // Function to handle transaction delete
  const handleDeleteTransaction = useCallback(async (transactionId: number | string) => {
    try {
      // First convert to the DB ID format if needed
      const dbId = typeof transactionId === 'string' ? transactionId : transactionId.toString();

      // Call the delete function from our hook
      const success = await deleteTransaction(dbId);

      if (success) {
        toast({
          title: "Transaction deleted",
          description: "The transaction has been successfully deleted",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the transaction",
        variant: "destructive",
      });
      return false;
    }
  }, [deleteTransaction]);

  // Handle dialog close and reset edit state
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setTransactionToEdit(null);
    setDialogMode('add');
    // Refresh transactions after dialog closes (in case any changes were made)
    refreshTransactions();
  }, [refreshTransactions]);

  // Check if we have any transactions
  const isEmpty = !loading && Object.keys(groupedTransactions).length === 0;

  return (
    <ErrorBoundary>
      <div className={`mb-6 ${className}`}>
        <Card className="pt-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden relative">

          <div className="flex justify-between items-center mb-3 px-4">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">Recent Transactions</h4>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[110px] h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-medium text-emerald dark:text-emerald hover:text-emerald hover:bg-green-50 dark:hover:text-emerald dark:hover:bg-green-900/20 p-0"
                onClick={() => navigate('/transactions')}
              >
                View all
              </Button>
            </div>
          </div>

          <div className="px-3">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader className="h-8 w-8 text-primary animate-spin mb-2 dark:text-green-400" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-8">
                <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
              </div>
            ) : isEmpty ? (
              <Card className="flex flex-col items-center justify-center py-8 px-4 bg-background/50 dark:bg-gray-900/50 border border-dashed border-border">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <i className="fas fa-receipt text-2xl text-primary dark:text-primary"></i>
                  </div>
                  <h5 className="text-base font-semibold text-foreground mb-2">No Transactions Yet</h5>
                  <p className="text-sm text-muted-foreground mb-4">Start by adding your first transaction!</p>
                </div>
              </Card>
            ) : (

              <div className="overflow-y-auto max-h-[450px] pr-1 rounded-lg overflow-x-hidden relative">
                {Object.entries(groupedTransactions).map(([date, dayData]) => {
                  // Map the API transactions to UI transactions for each date group
                  const uiTransactions = dayData.transactions.map(mapTransactionForUI);

                  // Create a UI-friendly day data object
                  const uiDayData = {
                    income: dayData.income,
                    expense: dayData.expense,
                    transfer: dayData.transfer,
                    transactions: uiTransactions
                  };

                  return (
                    <TransactionGroup
                      key={date}
                      date={date}
                      dayData={uiDayData}
                      onEditTransaction={handleEditTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction Dialog - Using the refactored component */}
      <TransactionDialog
        mode={dialogMode}
        open={isDialogOpen}
        transactionData={(transactionToEdit as any)?.originalTransaction || undefined}
        onClose={handleDialogClose}
        onSubmit={handleTransactionSubmit}
        defaultActiveTab="manual"
      />
    </ErrorBoundary>
  );
};

export default RecentTransactionsSection; 