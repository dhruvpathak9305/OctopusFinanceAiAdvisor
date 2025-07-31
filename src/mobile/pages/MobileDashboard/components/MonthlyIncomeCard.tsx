import React from 'react';
import FinancialSummaryCard from '../../../components/FinancialSummary/FinancialSummaryCard';

interface MonthlyIncomeCardProps {
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

const MonthlyIncomeCard: React.FC<MonthlyIncomeCardProps> = ({ onPress, onExpandedPress }) => {
  // Mock data - in production this would come from context/API
  const monthlyIncomeTotal = 4850;
  const monthlyChange = '+3.8%';
  const themeColor = '#10b981';
  
  // Generate 12-month trend data
  const chartData = [
    { month: 'Jan', value: 4600 },
    { month: 'Feb', value: 4700 },
    { month: 'Mar', value: 4850 },
    { month: 'Apr', value: 4900 },
    { month: 'May', value: 4850 },
    { month: 'Jun', value: 4950 },
    { month: 'Jul', value: 4850 },
    { month: 'Aug', value: 5000 },
    { month: 'Sep', value: 5100 },
    { month: 'Oct', value: 5050 },
    { month: 'Nov', value: 5150 },
    { month: 'Dec', value: 4850 },
  ];

  const handleViewAll = () => {
    console.log('Navigate to income page');
  };

  const handleAddNew = () => {
    console.log('Add new income source');
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: 'Monthly Income',
        value: `$${monthlyIncomeTotal.toLocaleString()}`,
        change: monthlyChange,
        trend: 'up',
        icon: '📈',
        chartData: chartData.map(item => item.value),
        backgroundColor: '#1F2937',
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  return (
    <FinancialSummaryCard
      title="Monthly Income"
      iconClass="📈"
      data={chartData}
      total={monthlyIncomeTotal}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default MonthlyIncomeCard; 