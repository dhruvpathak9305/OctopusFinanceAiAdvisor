import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { fetchTransactions, fetchTransactionSummary, fetchTransactionHistory } from '../../../../services/transactionsService';
import { useDemoMode } from '../../../../contexts/DemoModeContext';
import FinancialSummaryCard from './FinancialSummaryCard';

interface MonthlyIncomeCardProps {
  backgroundImage?: string;
}

const MonthlyIncomeCard: React.FC<MonthlyIncomeCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();
  const { isDemo } = useDemoMode();
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [chartData, setChartData] = useState<Array<{ month: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch monthly income data
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current month's date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch current month's income
        const currentMonthIncome = await fetchTransactions({
          type: 'income',
          dateRange: { start: startOfMonth, end: endOfMonth }
        }, isDemo);

        // Calculate total monthly income
        const totalIncome = currentMonthIncome.reduce((sum, transaction) => {
          return sum + Math.abs(transaction.amount);
        }, 0);

        setMonthlyIncome(totalIncome);

        // Fetch transaction history for chart
        const history = await fetchTransactionHistory({
          type: 'income'
        }, isDemo, 6);

        if (history && history.length > 0) {
          setChartData(history);
        } else {
          // Fallback to generated data if no history
          setChartData(generateMockChartData(totalIncome));
        }

        // Calculate percentage change from previous month
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const previousMonthIncome = await fetchTransactions({
          type: 'income',
          dateRange: { start: previousMonthStart, end: previousMonthEnd }
        }, isDemo);

        const previousTotal = previousMonthIncome.reduce((sum, transaction) => {
          return sum + Math.abs(transaction.amount);
        }, 0);

        // Calculate percentage change
        if (previousTotal > 0) {
          const change = ((totalIncome - previousTotal) / previousTotal) * 100;
          setPercentChange(change);
        } else {
          setPercentChange(0);
        }

      } catch (err) {
        console.error('Error fetching income data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load income data');
        // Fallback to mock data
        setMonthlyIncome(4850);
        setPercentChange(3.8);
        setChartData(generateMockChartData(4850));
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, [isDemo]);

  // Generate mock chart data (fallback)
  const generateMockChartData = (baseValue: number) => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      const randomChange = (Math.random() - 0.5) * 0.12; // ±6% variation
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
    // Navigate to income details page
    (navigation as any).navigate('Money', { tab: 'income' });
  };

  const handleAddNew = () => {
    // Navigate to add income
    (navigation as any).navigate('Money', { tab: 'income', action: 'add' });
  };

  return (
    <FinancialSummaryCard
      title="Monthly Income"
      icon="📈"
      data={chartData}
      total={monthlyIncome}
      monthlyChange={monthlyChange}
      themeColor="#10B981"
      loading={loading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default MonthlyIncomeCard; 