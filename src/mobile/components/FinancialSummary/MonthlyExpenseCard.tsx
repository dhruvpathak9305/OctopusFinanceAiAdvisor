import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { fetchTransactions, fetchTransactionSummary, fetchTransactionHistory } from '../../../../services/transactionsService';
import { useDemoMode } from '../../../../contexts/DemoModeContext';
import FinancialSummaryCard from './FinancialSummaryCard';

interface MonthlyExpenseCardProps {
  backgroundImage?: string;
}

const MonthlyExpenseCard: React.FC<MonthlyExpenseCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();
  const { isDemo } = useDemoMode();
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [chartData, setChartData] = useState<Array<{ month: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch monthly expenses data
  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current month's date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch current month's expenses
        const currentMonthExpenses = await fetchTransactions({
          type: 'expense',
          dateRange: { start: startOfMonth, end: endOfMonth }
        }, isDemo);

        // Calculate total monthly expenses
        const totalExpenses = currentMonthExpenses.reduce((sum, transaction) => {
          return sum + Math.abs(transaction.amount);
        }, 0);

        setMonthlyExpenses(totalExpenses);

        // Fetch transaction history for chart
        const history = await fetchTransactionHistory({
          type: 'expense'
        }, isDemo, 6);

        if (history && history.length > 0) {
          setChartData(history);
        } else {
          // Fallback to generated data if no history
          setChartData(generateMockChartData(totalExpenses));
        }

        // Calculate percentage change from previous month
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const previousMonthExpenses = await fetchTransactions({
          type: 'expense',
          dateRange: { start: previousMonthStart, end: previousMonthEnd }
        }, isDemo);

        const previousTotal = previousMonthExpenses.reduce((sum, transaction) => {
          return sum + Math.abs(transaction.amount);
        }, 0);

        // Calculate percentage change
        if (previousTotal > 0) {
          const change = ((totalExpenses - previousTotal) / previousTotal) * 100;
          setPercentChange(change);
        } else {
          setPercentChange(0);
        }

      } catch (err) {
        console.error('Error fetching expenses data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load expenses data');
        // Fallback to mock data
        setMonthlyExpenses(3280.45);
        setPercentChange(2.2);
        setChartData(generateMockChartData(3280.45));
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesData();
  }, [isDemo]);

  // Generate mock chart data (fallback)
  const generateMockChartData = (baseValue: number) => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = baseValue * (1 + randomChange);
      data.push({
        month: months[i],
        value: Math.round(value)
      });
    }
    return data;
  };

  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  const handleViewAll = () => {
    // Navigate to expenses details page
    (navigation as any).navigate('Money', { tab: 'expenses' });
  };

  const handleAddNew = () => {
    // Navigate to add expense
    (navigation as any).navigate('Money', { tab: 'expenses', action: 'add' });
  };

  return (
    <FinancialSummaryCard
      title="Monthly Expenses"
      icon="📊"
      data={chartData}
      total={monthlyExpenses}
      monthlyChange={monthlyChange}
      themeColor="#F59E0B"
      loading={loading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default MonthlyExpenseCard; 