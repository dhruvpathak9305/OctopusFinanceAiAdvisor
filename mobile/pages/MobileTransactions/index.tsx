import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/common/components/ErrorBoundary';
import TransactionGroup from '@/mobile/components/transactions/TransactionGroup';
import { Loader, Filter, MoreVertical, ArrowLeft, Search } from 'lucide-react';
import SearchModal from '@/mobile/components/transactions/SearchModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFetchTransactions, TransactionFilter, Transaction as ApiTransaction } from '@/hooks/useFetchTransactions';
import { getIconConfig } from '@/shared/icons/categoryIcons';
import { toast } from '@/components/ui/use-toast';
import MonthYearSelectorModal from '@/components/common/MonthYearSelectorModal';
import { useTheme } from '@/common/providers/ThemeProvider';
import QuickAddButton from '@/components/common/QuickAddButton';
import TransactionDialog from '@/components/common/QuickAddButton/components/TransactionDialog';
import { mapFormDataToTransaction } from '@/utils/transactionFormHelpers';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCreditCards } from '@/contexts/CreditCardContext';

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'ALL', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

const mapTransactionForUI = (transaction: ApiTransaction) => {
  const iconConfig = getIconConfig(
    transaction.category_name || transaction.type,
    transaction.subcategory_name
  );
  return {
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
    icon: transaction.icon || `fa-${iconConfig.icon}`,
    originalTransaction: transaction,
  };
};

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<ApiTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>({
    dateRange: 'year',
    type: 'all',
    searchTerm: '',
    limit: 30,
  });
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const {
    groupedTransactions,
    loading,
    error,
    refreshTransactions,
    updateTransaction,
    deleteTransaction,
  } = useFetchTransactions(filter);

  useEffect(() => {
    if (!loaderRef.current || loading) return;
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setFilter((prev) => ({ ...prev, limit: (prev.limit || 30) + 30 }));
      }
    }, { threshold: 1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, hasMore, loading]);

  useEffect(() => {
    const totalLoaded = Object.values(groupedTransactions).reduce((acc, day) => acc + day.transactions.length, 0);
    setHasMore(totalLoaded >= (filter.limit || 30));
  }, [groupedTransactions, filter.limit]);

  const summary = useMemo(() => {
    let income = 0, expense = 0, transfer = 0;
    Object.values(groupedTransactions).forEach((day) => {
      income += day.income;
      expense += day.expense;
      transfer += day.transfer;
    });
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [groupedTransactions]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (['all', 'income', 'expense', 'transfer'].includes(value)) {
      setFilter(prev => ({
        ...prev,
        type: value as 'all' | 'income' | 'expense' | 'transfer'
      }));
    }
  };

  const handleSummaryCardClick = (type: 'income' | 'expense' | 'transfer') => {
    setSortBy(type);
    setFilter(prev => ({
      ...prev,
      type
    }));
  };

  const handleEditTransaction = useCallback((transactionId: number | string) => {
    for (const date in groupedTransactions) {
      const transaction = groupedTransactions[date].transactions.find((t) => t.id === transactionId);
      if (transaction) {
        setTransactionToEdit(transaction as any);
        setIsDialogOpen(true);
        return;
      }
    }
  }, [groupedTransactions]);

  const handleDeleteTransaction = useCallback(async (transactionId: number | string) => {
    try {
      const dbId = typeof transactionId === 'string' ? transactionId : transactionId.toString();
      const success = await deleteTransaction(dbId);
      if (success) {
        toast({
          title: 'Transaction deleted',
          description: 'The transaction has been successfully deleted',
          variant: 'default',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete transaction',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the transaction',
        variant: 'destructive',
      });
      return false;
    }
  }, [deleteTransaction]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setTransactionToEdit(null);
    refreshTransactions();
  }, [refreshTransactions]);

  const isEmpty = !loading && Object.keys(groupedTransactions).length === 0;

  const handleYearChange = (increment: number) => {
    setSelectedYear((prev) => prev + increment);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setShowMonthSelector(false);
    // Optionally, update filter here if needed
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex-1 text-center">Transactions</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Month Selector and Quick Filters */}
        <div className="flex gap-2 px-4 py-2 bg-white dark:bg-gray-900 sticky top-[56px] z-10 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            className="flex-1 h-8 text-xs font-medium"
            onClick={() => setShowMonthSelector(true)}
          >
            <span>{monthNames[selectedMonth]} {selectedYear}</span>
          </Button>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="flex-1 h-8 text-xs font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-3 px-4 py-3 bg-white dark:bg-gray-900 sticky top-[104px] z-10 border-b border-gray-100 dark:border-gray-800">
          <Card 
            className="flex-1 flex flex-col items-center py-2 bg-green-50/80 dark:bg-green-900/20 cursor-pointer transition-colors hover:bg-green-100/80 dark:hover:bg-green-900/30"
            onClick={() => handleSummaryCardClick('income')}
          >
            <span className="text-xs text-gray-500 font-medium mb-1">Income</span>
            <span className="text-lg font-bold text-emerald">+${summary.income.toFixed(2)}</span>
          </Card>
          <Card 
            className="flex-1 flex flex-col items-center py-2 bg-red-50/80 dark:bg-red-900/20 cursor-pointer transition-colors hover:bg-red-100/80 dark:hover:bg-red-900/30"
            onClick={() => handleSummaryCardClick('expense')}
          >
            <span className="text-xs text-gray-500 font-medium mb-1">Expenses</span>
            <span className="text-lg font-bold text-coral">-${summary.expense.toFixed(2)}</span>
          </Card>
          <Card 
            className="flex-1 flex flex-col items-center py-2 bg-blue-50/80 dark:bg-blue-900/20 cursor-pointer transition-colors hover:bg-blue-100/80 dark:hover:bg-blue-900/30"
            onClick={() => handleSummaryCardClick('transfer')}
          >
            <span className="text-xs text-gray-500 font-medium mb-1">Net</span>
            <span className="text-lg font-bold text-blue-500">${summary.net.toFixed(2)}</span>
          </Card>
        </div>

        {/* Transaction List */}
        <main className="flex-1 overflow-y-auto px-2 pb-24 bg-gray-50 dark:bg-gray-900 mt-4">
          {loading && !filter.limit ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="h-8 w-8 text-primary animate-spin mb-2 dark:text-green-400" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
            </div>
          ) : isEmpty ? (
            <Card className="flex flex-col items-center justify-center py-8 px-4 bg-background/50 dark:bg-gray-900/50 border border-dashed border-border mt-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <i className="fas fa-receipt text-2xl text-primary dark:text-primary"></i>
                </div>
                <h5 className="text-base font-semibold text-foreground mb-2">No Transactions Yet</h5>
                <p className="text-sm text-muted-foreground mb-4">Start by adding your first transaction!</p>
              </div>
            </Card>
          ) : (
            <div className="overflow-y-auto max-h-[calc(100vh-260px)] pr-1 rounded-lg overflow-x-hidden relative">
              {Object.entries(groupedTransactions).map(([date, dayData]) => {
                const uiTransactions = dayData.transactions.map(mapTransactionForUI);
                const uiDayData = {
                  income: dayData.income,
                  expense: dayData.expense,
                  transfer: dayData.transfer,
                  transactions: uiTransactions,
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
              {/* Infinite scroll loader */}
              <div ref={loaderRef} className="flex justify-center py-4">
                {hasMore && <Loader className="h-6 w-6 text-primary animate-spin dark:text-green-400" />}
              </div>
            </div>
          )}
        </main>

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={setSearchTerm}
          initialSearchTerm={searchTerm}
        />

        {/* MonthYearSelectorModal with theme support */}
        {showMonthSelector && (
          <MonthYearSelectorModal
            isDark={isDark}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onClose={() => setShowMonthSelector(false)}
            onYearChange={handleYearChange}
            onMonthSelect={handleMonthSelect}
            monthNames={monthNames}
          />
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-50">
          <QuickAddButton bottomSpacing={20} rightSpacing={4} />
        </div>

        {/* Transaction Dialog */}
        <TransactionDialog
          mode="edit"
          open={isDialogOpen}
          transactionData={(transactionToEdit as any) || undefined}
          onClose={handleDialogClose}
          onSubmit={async (formData) => {
            try {
              if (transactionToEdit?.id) {
                // Convert form data to transaction format for API with proper account mapping
                const transactionData = mapFormDataToTransaction(
                  formData, 
                  transactionToEdit as any,
                  accounts.map(acc => ({ id: acc.id, name: acc.name, type: acc.type })),
                  creditCards.map(cc => ({ id: cc.id!, name: cc.name }))
                );
                
                await updateTransaction(String(transactionToEdit.id), transactionData);
                toast({
                  title: 'Success',
                  description: 'Transaction updated successfully',
                  variant: 'default',
                });
              }
              handleDialogClose();
            } catch (error) {
              console.error('Error updating transaction:', error);
              toast({
                title: 'Error',
                description: 'Failed to update transaction',
                variant: 'destructive',
              });
            }
          }}
          defaultActiveTab="manual"
        />
      </div>
    </ErrorBoundary>
  );
};

export default TransactionsPage; 