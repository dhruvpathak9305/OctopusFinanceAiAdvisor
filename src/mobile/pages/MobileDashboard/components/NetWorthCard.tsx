import React from 'react';
import FinancialSummaryCard from '../../../components/FinancialSummary/FinancialSummaryCard';

interface NetWorthCardProps {
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

const NetWorthCard: React.FC<NetWorthCardProps> = ({ onPress, onExpandedPress }) => {
  // Mock data - in production this would come from context/API
  const netWorthTotal = 42680;
  const monthlyChange = '+3.6%';
  const themeColor = '#10b981';
  
  // Generate 12-month trend data
  const chartData = [
    { month: 'Jan', value: 38000 },
    { month: 'Feb', value: 39500 },
    { month: 'Mar', value: 41000 },
    { month: 'Apr', value: 42000 },
    { month: 'May', value: 42680 },
    { month: 'Jun', value: 41800 },
    { month: 'Jul', value: 42680 },
    { month: 'Aug', value: 43500 },
    { month: 'Sep', value: 44200 },
    { month: 'Oct', value: 43800 },
    { month: 'Nov', value: 44500 },
    { month: 'Dec', value: 42680 },
  ];

  const handleViewAll = () => {
    console.log('Navigate to net worth page');
  };

  const handleAddNew = () => {
    console.log('Add new asset');
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: 'Net Worth',
        value: `$${netWorthTotal.toLocaleString()}`,
        change: monthlyChange,
        trend: 'up',
        icon: '📈',
        chartData: chartData.map(item => item.value),
        backgroundColor: '#1B2B1F',
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  return (
    <FinancialSummaryCard
      title="Net Worth"
      iconClass="📈"
      data={chartData}
      total={netWorthTotal}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default NetWorthCard; 