import React from 'react';
import FinancialSummaryCard from '../../../components/FinancialSummary/FinancialSummaryCard';

interface AccountsCardProps {
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

const AccountsCard: React.FC<AccountsCardProps> = ({ onPress, onExpandedPress }) => {
  // Mock data - in production this would come from context/API
  const totalBalance = 8459;
  const monthlyChange = '+12.5%';
  const themeColor = '#059669';
  
  // Generate 12-month trend data
  const chartData = [
    { month: 'Jan', value: 7500 },
    { month: 'Feb', value: 7800 },
    { month: 'Mar', value: 8100 },
    { month: 'Apr', value: 8300 },
    { month: 'May', value: 8459 },
    { month: 'Jun', value: 8200 },
    { month: 'Jul', value: 8459 },
    { month: 'Aug', value: 8700 },
    { month: 'Sep', value: 8900 },
    { month: 'Oct', value: 8750 },
    { month: 'Nov', value: 9000 },
    { month: 'Dec', value: 8459 },
  ];

  const handleViewAll = () => {
    console.log('Navigate to accounts page');
  };

  const handleAddNew = () => {
    console.log('Add new account');
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: 'Accounts',
        value: `$${totalBalance.toLocaleString()}`,
        change: monthlyChange,
        trend: 'up',
        icon: '🏦',
        chartData: chartData.map(item => item.value),
        backgroundColor: '#1F2937',
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  return (
    <FinancialSummaryCard
      title="Accounts"
      iconClass="🏦"
      data={chartData}
      total={totalBalance}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default AccountsCard; 