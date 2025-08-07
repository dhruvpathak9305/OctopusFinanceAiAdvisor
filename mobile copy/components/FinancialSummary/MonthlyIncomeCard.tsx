import React, { useState, useEffect } from 'react';
import { useTheme } from '@/common/providers/ThemeProvider';
import { useMonthlyIncome } from '@/contexts/TransactionContext';
import FinancialSummaryCard from './FinancialSummaryCard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import type { TransactionSummary } from '@/services/transactionsService';

interface MonthlyIncomeCardProps {
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

const MonthlyIncomeCardContent: React.FC<MonthlyIncomeCardProps> = ({ backgroundImage }) => {
  // State
  const [incomeSummary, setIncomeSummary] = useState<TransactionSummary | null>(null);
  const [incomeHistory, setIncomeHistory] = useState<{ month: string; value: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { resolvedTheme } = useTheme();
  const { getIncomeSummary, getIncomeHistory } = useMonthlyIncome();

  // Fetch income data
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch summary and history in parallel
        const [summary, history] = await Promise.all([
          getIncomeSummary(),
          getIncomeHistory(12)
        ]);
        
        setIncomeSummary(summary);
        setIncomeHistory(history);
        
      } catch (err) {
        console.error('Error fetching income data:', err);
        setError('Failed to load income data');
        
        // Use mock data on error
        const mockSummary: TransactionSummary = {
          total: 5280,
          count: 12,
          averageAmount: 440,
          periodComparison: {
            current: 5280,
            previous: 5100,
            percentageChange: 3.53
          }
        };
        
        setIncomeSummary(mockSummary);
        setIncomeHistory(generateMockData(5280));
        
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, []); // Empty dependency array to run only once

  // Prepare data for the chart - use expense history if available, otherwise mock data
  const chartData = incomeHistory.length > 0 ? incomeHistory : generateMockData(incomeSummary?.total || 5280);

  // Calculate display values
  const monthlyIncome = incomeSummary?.total || 0;
  const percentageChange = incomeSummary?.periodComparison?.percentageChange || 0;
  const monthlyChange = `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;

  // Theme-aware colors
  const chartLineColor = resolvedTheme === 'dark' ? '#10b981' : '#059669';

  const handleViewAll = () => {
    // Navigate to income analysis page
    console.log('View all income transactions');
  };

  const handleAddIncome = () => {
    // Navigate to add income transaction
    console.log('Add new income transaction');
  };

  return (
    <FinancialSummaryCard
      title="Monthly Income"
      iconClass="fas fa-arrow-trend-up mr-1 text-green-500"
      data={chartData}
      total={monthlyIncome}
      monthlyChange={monthlyChange}
      themeColor={chartLineColor}
      loading={loading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddIncome}
    />
  );
};

const MonthlyIncomeCard: React.FC<MonthlyIncomeCardProps> = (props) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('MonthlyIncomeCard Error:', error, errorInfo);
        // TODO: Send error to monitoring service
      }}
      fallback={
        <FinancialSummaryCard
          title="Monthly Income"
          iconClass="fas fa-arrow-trend-up mr-1 text-green-500"
          data={generateMockData(5280)}
          total={5280}
          monthlyChange="+3.5%"
          themeColor="#10b981"
          loading={false}
          error="Unable to load income data"
          onViewAll={() => {}}
        />
      }
    >
      <MonthlyIncomeCardContent {...props} />
    </ErrorBoundary>
  );
};

export default MonthlyIncomeCard; 