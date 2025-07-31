import React from 'react';
import FinancialSummaryCard from '../../../components/FinancialSummary/FinancialSummaryCard';

interface MonthlyExpenseCardProps {
  onPress?: () => void;
  onExpandedPress?: (data: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
    chartData: number[];
    backgroundColor: string;
    accentColor: string;
  }) => void;
}

const MonthlyExpenseCard: React.FC<MonthlyExpenseCardProps> = ({ onPress, onExpandedPress }) => {
  // Mock data - in production this would come from context/API
  const monthlyExpensesTotal = 3280;
  const monthlyChange = '+2.2%';
  const themeColor = '#f59e0b';
  
  // Generate 12-month trend data
  const chartData = [
    { month: 'Jan', value: 3100 },
    { month: 'Feb', value: 3200 },
    { month: 'Mar', value: 3280 },
    { month: 'Apr', value: 3150 },
    { month: 'May', value: 3280 },
    { month: 'Jun', value: 3300 },
    { month: 'Jul', value: 3280 },
    { month: 'Aug', value: 3350 },
    { month: 'Sep', value: 3400 },
    { month: 'Oct', value: 3375 },
    { month: 'Nov', value: 3450 },
    { month: 'Dec', value: 3280 },
  ];

  const handleViewAll = () => {
    console.log('Navigate to expenses page');
  };

  const handleAddNew = () => {
    console.log('Add new expense');
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: 'Monthly Expenses',
        value: `$${monthlyExpensesTotal.toLocaleString()}`,
        change: monthlyChange,
        trend: 'up',
        icon: '📊',
        chartData: chartData.map(item => item.value),
        backgroundColor: '#1F2937',
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  return (
    <FinancialSummaryCard
      title="Monthly Expenses"
      iconClass="📊"
      data={chartData}
      total={monthlyExpensesTotal}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default MonthlyExpenseCard; 