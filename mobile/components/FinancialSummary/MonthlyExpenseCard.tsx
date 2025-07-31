import React, { useState, useEffect } from 'react';
import { useTheme } from '@/common/providers/ThemeProvider';
import { useMonthlyExpenses } from '@/contexts/TransactionContext';
import FinancialSummaryCard from './FinancialSummaryCard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import type { TransactionSummary } from '@/services/transactionsService';

interface MonthlyExpenseCardProps {
  backgroundImage?: string;
}

// Generate mock data for fallback scenarios
const generateMockData = (baseValue: number): { month: string; value: number }[] => {
  const data = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate a value that fluctuates around the base value (±15%)
    const randomFactor = 0.85 + (Math.random() * 0.3); // Between 0.85 and 1.15
    const value = Math.round(baseValue * randomFactor);
    
    data.push({
      month: monthNames[monthIndex],
      value: value
    });
  }
  
  return data;
};

const MonthlyExpenseCardContent: React.FC<MonthlyExpenseCardProps> = ({ backgroundImage }) => {
  // State
  const [expenseSummary, setExpenseSummary] = useState<TransactionSummary | null>(null);
  const [expenseHistory, setExpenseHistory] = useState<{ month: string; value: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { resolvedTheme } = useTheme();
  const { getExpenseSummary, getExpenseHistory } = useMonthlyExpenses();

  // Fetch expense data
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch summary and history in parallel
        const [summary, history] = await Promise.all([
          getExpenseSummary(),
          getExpenseHistory(12)
        ]);
        
        setExpenseSummary(summary);
        setExpenseHistory(history);
        
      } catch (err) {
        console.error('Error fetching expense data:', err);
        setError('Failed to load expense data');
        
        // Use mock data on error
        const mockSummary: TransactionSummary = {
          total: 3450,
          count: 25,
          averageAmount: 138,
          periodComparison: {
            current: 3450,
            previous: 3250,
            percentageChange: 6.15
          }
        };
        
        setExpenseSummary(mockSummary);
        setExpenseHistory(generateMockData(3450));
        
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, []); // Empty dependency array to run only once

  // Prepare data for the chart - use expense history if available, otherwise mock data
  const chartData = expenseHistory.length > 0 ? expenseHistory : generateMockData(expenseSummary?.total || 3450);

  // Calculate display values
  const monthlyExpense = expenseSummary?.total || 0;
  const percentageChange = expenseSummary?.periodComparison?.percentageChange || 0;
  const monthlyChange = `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;

  // Theme-aware colors
  const chartLineColor = resolvedTheme === 'dark' ? '#ef4444' : '#dc2626';

  const handleViewAll = () => {
    // Navigate to expense analysis page
    console.log('View all expense transactions');
  };

  const handleAddExpense = () => {
    // Navigate to add expense transaction
    console.log('Add new expense transaction');
  };

  return (
    <FinancialSummaryCard
      title="Monthly Expenses"
      iconClass="fas fa-arrow-trend-down mr-1 text-red-500"
      data={chartData}
      total={monthlyExpense}
      monthlyChange={monthlyChange}
      themeColor={chartLineColor}
      loading={loading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddExpense}
    />
  );
};

const MonthlyExpenseCard: React.FC<MonthlyExpenseCardProps> = (props) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('MonthlyExpenseCard Error:', error, errorInfo);
        // TODO: Send error to monitoring service
      }}
      fallback={
        <FinancialSummaryCard
          title="Monthly Expenses"
          iconClass="fas fa-arrow-trend-down mr-1 text-red-500"
          data={generateMockData(3450)}
          total={3450}
          monthlyChange="+6.1%"
          themeColor="#ef4444"
          loading={false}
          error="Unable to load expense data"
          onViewAll={() => {}}
        />
      }
    >
      <MonthlyExpenseCardContent {...props} />
    </ErrorBoundary>
  );
};

export default MonthlyExpenseCard; 