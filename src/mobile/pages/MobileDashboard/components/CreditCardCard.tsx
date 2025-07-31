import React from 'react';
import FinancialSummaryCard from '../../../components/FinancialSummary/FinancialSummaryCard';

interface CreditCardCardProps {
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

const CreditCardCard: React.FC<CreditCardCardProps> = ({ onPress, onExpandedPress }) => {
  // Mock data - in production this would come from context/API
  const totalDebt = 19574;
  const monthlyChange = '-5.2%';
  const themeColor = '#ef4444';
  
  // Generate 12-month trend data
  const chartData = [
    { month: 'Jan', value: 20000 },
    { month: 'Feb', value: 19800 },
    { month: 'Mar', value: 19900 },
    { month: 'Apr', value: 19574 },
    { month: 'May', value: 19200 },
    { month: 'Jun', value: 19574 },
    { month: 'Jul', value: 19300 },
    { month: 'Aug', value: 19000 },
    { month: 'Sep', value: 18800 },
    { month: 'Oct', value: 19100 },
    { month: 'Nov', value: 18900 },
    { month: 'Dec', value: 19574 },
  ];

  const handleViewAll = () => {
    console.log('Navigate to credit cards page');
  };

  const handleAddNew = () => {
    console.log('Add new credit card');
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: 'Credit Card Debt',
        value: `$${totalDebt.toLocaleString()}`,
        change: monthlyChange,
        trend: 'down',
        icon: '💳',
        chartData: chartData.map(item => item.value),
        backgroundColor: '#2D1B37',
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  return (
    <FinancialSummaryCard
      title="Credit Card Debt"
      iconClass="💳"
      data={chartData}
      total={totalDebt}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default CreditCardCard; 