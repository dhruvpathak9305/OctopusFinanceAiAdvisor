import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search, SlidersHorizontal, Check, ArrowLeft, ArrowRight, ChevronDown, ArrowUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import AmountFilter from './AmountFilter';
import { useTheme } from "@/common/providers/ThemeProvider";
import MonthYearSelectorModal from '@/components/common/MonthYearSelectorModal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string) => void;
  initialSearchTerm?: string;
  onFilterChange?: (filters: SearchFilters) => void;
}

interface SearchFilters {
  period?: string;
  accounts?: string[];
  categories?: string[];
  amount?: {
    min?: number;
    max?: number;
  };
  month?: {
    month: number;
    year: number;
  };
  sortOrder?: 'newest' | 'oldest' | 'all' | 'income' | 'expense' | 'transfer';
}

// Mock data for filters
const periodOptions = [
  { label: 'Total', value: 'total' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annually', value: 'annually' },
  { label: 'Period', value: 'period' },
];

const categoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'NEEDS', value: 'needs', percentage: '34.73 %' },
  { label: 'WANTS', value: 'wants', percentage: '15.28 %' },
  { label: 'SAVE / INVEST', value: 'save_invest', percentage: '49.99 %' },
  { label: 'Other', value: 'other' },
  { label: 'Splitwise settle up', value: 'splitwise' },
  { label: 'Lent', value: 'lent' },
  { label: 'Credit Card Payment', value: 'credit_card_payment' },
  { label: 'ATM cash', value: 'atm_cash' },
  { label: 'Lent IN', value: 'lent_in' },
  { label: 'Credit card bill', value: 'credit_card_bill' },
];

const accountOptions = [
  { label: 'All', value: 'all' },
  { label: 'Cash', value: 'cash', group: 'Cash' },
  { label: 'ICICI', value: 'icici', group: 'Accounts' },
  { label: 'HDFC', value: 'hdfc', group: 'Accounts' },
  { label: 'Axis Bank', value: 'axis', group: 'Accounts' },
  { label: 'Kotak Joint Acc', value: 'kotak_joint', group: 'Accounts' },
  { label: 'Kotak mother', value: 'kotak_mother', group: 'Accounts' },
  { label: 'IDFC BANK', value: 'idfc', group: 'Accounts' },
  { label: 'Jupiter', value: 'jupiter', group: 'Accounts' },
  { label: 'Fi Money', value: 'fi', group: 'Accounts' },
];

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialSearchTerm = '',
  onFilterChange
}) => {
  const { resolvedTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilterSections, setShowFilterSections] = useState(false);
  const [activePeriodSelector, setActivePeriodSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('total');
  
  // Get current date for default values
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedSortOrder, setSelectedSortOrder] = useState<'newest' | 'oldest' | 'all' | 'income' | 'expense' | 'transfer'>('newest');
  
  const [filters, setFilters] = useState<SearchFilters>({
    period: 'total',
    accounts: undefined,
    categories: undefined,
    amount: {
      min: undefined,
      max: undefined
    },
    month: {
      month: selectedMonth,
      year: selectedYear
    },
    sortOrder: 'newest'
  });

  // Reset search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialSearchTerm);
    }
  }, [isOpen, initialSearchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  // Handle amount filter
  const handleAmountFilter = (min: number | undefined, max: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      amount: { min, max }
    }));
    onFilterChange?.({ ...filters, amount: { min, max } });
    setActiveFilter(null);
  };

  // Handle period selection
  const handlePeriodSelect = (value: string) => {
    setSelectedPeriod(value);
    setFilters(prev => ({
      ...prev,
      period: value
    }));
    onFilterChange?.({ ...filters, period: value });
    setActivePeriodSelector(false);
  };
  
  // Handle month selection
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setFilters(prev => ({
      ...prev,
      month: { 
        month: month,
        year: selectedYear
      }
    }));
    onFilterChange?.({
      ...filters,
      month: { 
        month: month,
        year: selectedYear
      }
    });
    setShowMonthSelector(false);
  };
  
  // Handle year change
  const handleYearChange = (increment: number) => {
    const newYear = selectedYear + increment;
    setSelectedYear(newYear);
    setFilters(prev => ({
      ...prev,
      month: { 
        month: selectedMonth,
        year: newYear
      }
    }));
    onFilterChange?.({
      ...filters, 
      month: { 
        month: selectedMonth,
        year: newYear
      }
    });
  };
  
  // Handle sort order selection
  const handleSortOrderSelect = (order: 'newest' | 'oldest' | 'all' | 'income' | 'expense' | 'transfer') => {
    setSelectedSortOrder(order);
    setFilters(prev => ({
      ...prev,
      sortOrder: order
    }));
    onFilterChange?.({ ...filters, sortOrder: order });
    setShowSortOptions(false);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "p-0 gap-0 max-w-full h-full sm:h-[90vh] flex flex-col",
        isDark ? "bg-slate-900" : "bg-white"
      )}>
        {/* Header */}
        <div
          className={cn(
            "relative flex items-center justify-between p-3 h-14",
            isDark ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-slate-200"
          )}
        >
          {/* Left: Filter Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0 z-10"
            onClick={() => setShowFilterSections(!showFilterSections)}
          >
            <SlidersHorizontal
              className={cn("h-5 w-5", isDark ? "text-slate-200" : "text-slate-800")}
            />
          </Button>

          {/* Center: Title */}
          <h1
            className={cn(
              "absolute left-1/2 transform -translate-x-1/2 text-base font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Transactions
          </h1>
        </div>

        {/* Search Bar */}
        <div className={cn(
          "px-3 py-2 h-12",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          <div className="relative flex items-center h-full">
            <Search className={cn("absolute left-3 h-4 w-4", isDark ? "text-slate-400" : "text-slate-500")} />
            <Input
              type="text"
              placeholder="Search transactions"
              value={searchTerm}
              onChange={handleSearchChange}
              className={cn(
                "pl-9 pr-9 py-1 h-full text-sm rounded-lg",
                isDark
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500"
              )}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute right-1 p-0 h-6 w-6",
                  isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                )}
                onClick={handleClearSearch}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Bar with Month Selector and Sort Options */}
        <div className={cn(
          "px-3 py-2 flex justify-between items-center border-b",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          {/* Month Selector */}
          <button 
            className={cn(
              "flex items-center space-x-1 py-1.5 px-3 rounded-md",
              isDark ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            )}
            onClick={() => setShowMonthSelector(true)}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{monthNames[selectedMonth]} {selectedYear}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
          
          {/* Sort Options */}
          <button
            className={cn(
              "flex items-center py-1.5 px-3 rounded-md",
              isDark ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            )}
            onClick={() => setShowSortOptions(!showSortOptions)}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            <span className="text-sm">{selectedSortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
          
          {/* Sort Options Dropdown */}
          {showSortOptions && (
            <div className={cn(
              "absolute right-3 top-[6.75rem] z-50 w-40 rounded-md shadow-lg",
              isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"
            )}>
              <div className="py-1">
                <button
                  className={cn(
                    "block w-full text-start px-4 py-2 text-sm",
                    selectedSortOrder === 'newest' ? (isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900") : "",
                    isDark ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                  )}
                  onClick={() => handleSortOrderSelect('newest')}
                >
                  Newest First
                </button>
                <button
                  className={cn(
                    "block w-full text-start px-4 py-2 text-sm",
                    selectedSortOrder === 'oldest' ? (isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900") : "",
                    isDark ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                  )}
                  onClick={() => handleSortOrderSelect('oldest')}
                >
                  Oldest First
                </button>
                <button
                  className={cn(
                    "block w-full text-start px-4 py-2 text-sm",
                    selectedSortOrder === 'all' ? (isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900") : "",
                    isDark ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                  )}
                  onClick={() => handleSortOrderSelect('all')}
                >
                  ALL
                </button>
                <button
                  className={cn(
                    "block w-full text-start px-4 py-2 text-sm",
                    selectedSortOrder === 'income' ? (isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900") : "",
                    isDark ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                  )}
                  onClick={() => handleSortOrderSelect('income')}
                >
                  Income
                </button>
                <button
                  className={cn(
                    "block w-full text-start px-4 py-2 text-sm",
                    selectedSortOrder === 'expense' ? (isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900") : "",
                    isDark ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                  )}
                  onClick={() => handleSortOrderSelect('expense')}
                >
                  Expense
                </button>
                <button
                  className={cn(
                    "block w-full text-start px-4 py-2 text-sm",
                    selectedSortOrder === 'transfer' ? (isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900") : "",
                    isDark ? "text-white hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"
                  )}
                  onClick={() => handleSortOrderSelect('transfer')}
                >
                  Transfers
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter Sections */}
        {showFilterSections && (
          <div className={cn(
            "px-3 py-1",
            isDark ? "bg-slate-900" : "bg-white"
          )}>
            {/* Period Filter */}
            <div className={cn(
              "py-2 border-b",
              isDark ? "border-slate-800" : "border-slate-200"
            )}>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setActivePeriodSelector(true)}
              >
                <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Period</span>
                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                  {periodOptions.find(p => p.value === selectedPeriod)?.label || 'Total'}
                </span>
              </div>
            </div>

            {/* Accounts Filter */}
            <div className={cn(
              "py-2 border-b",
              isDark ? "border-slate-800" : "border-slate-200"
            )}>
              <div className="flex justify-between items-center">
                <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Accounts</span>
              </div>
            </div>

            {/* Category Filter */}
            <div className={cn(
              "py-2 border-b",
              isDark ? "border-slate-800" : "border-slate-200"
            )}>
              <div className="flex justify-between items-center">
                <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Category</span>
              </div>
            </div>

            {/* Amount Filter */}
            <div className="py-2">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm w-16", isDark ? "text-slate-400" : "text-slate-500")}>Amount</span>
                <div className="flex-1 flex items-center gap-2">
                  <button
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-md text-start text-xs",
                      isDark
                        ? "bg-slate-800 text-slate-400 border border-slate-700"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}
                    onClick={() => setActiveFilter('amount')}
                  >
                    Min.
                  </button>
                  <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>~</span>
                  <button
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-md text-start text-xs",
                      isDark
                        ? "bg-slate-800 text-slate-400 border border-slate-700"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}
                    onClick={() => setActiveFilter('amount')}
                  >
                    Max.
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Month-Year Selector Modal */}
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

        {/* Period Selection Modal */}
        {activePeriodSelector && (
          <div className="fixed inset-0 z-50 bg-opacity-60 bg-black flex flex-col justify-end">
            <div className={cn(
              "rounded-t-xl w-full",
              isDark ? "bg-slate-800" : "bg-white"
            )}>
              <div className={cn(
                "p-3 border-b flex justify-between items-center",
                isDark ? "border-slate-700" : "border-slate-200"
              )}>
                <button
                  className={cn(
                    "text-start text-sm font-medium w-full py-1",
                    selectedPeriod === 'total'
                      ? "text-primary"
                      : isDark ? "text-white" : "text-slate-900"
                  )}
                  onClick={() => handlePeriodSelect('total')}
                >
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    {selectedPeriod === 'total' && <Check className="text-primary h-4 w-4" />}
                  </div>
                </button>
              </div>

              {periodOptions.slice(1).map((option) => (
                <div key={option.value} className={cn(
                  "p-3 border-b",
                  isDark ? "border-slate-700" : "border-slate-200"
                )}>
                  <button
                    className={cn(
                      "text-start text-sm w-full py-1",
                      selectedPeriod === option.value
                        ? "text-primary font-medium"
                        : isDark ? "text-white" : "text-slate-900"
                    )}
                    onClick={() => handlePeriodSelect(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {selectedPeriod === option.value && <Check className="text-primary h-4 w-4" />}
                    </div>
                  </button>
                </div>
              ))}

              <button
                className={cn(
                  "w-full p-3 text-center text-sm font-medium",
                  isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                )}
                onClick={() => setActivePeriodSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Amount Filter Modal */}
        {activeFilter === 'amount' && (
          <AmountFilter
            onClose={() => setActiveFilter(null)}
            onConfirm={handleAmountFilter}
            initialMin={filters.amount?.min}
            initialMax={filters.amount?.max}
          />
        )}

        {/* Content Area */}
        <ScrollArea className={cn(
          "flex-1",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          {/* Transaction list will be rendered by parent component */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal; 