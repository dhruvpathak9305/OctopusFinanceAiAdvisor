import React from 'react';
import { useAccounts } from '../../../../../contexts/AccountsContext';
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
  const { accounts, loading, error } = useAccounts();
  
  // Filter out credit cards and loans (liabilities) - matching working component
  const bankAccounts = accounts.filter(account => 
    account.type !== 'Credit Card' && 
    account.type !== 'Credit' && 
    account.type !== 'Loan'
  );
  
  // Calculate total balance of bank accounts
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  console.log("🚀 ~ totalBalance:", totalBalance);
  
  // Format for display using Indian currency (matching working component)
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(totalBalance);
  
  // Calculate monthly change (this would ideally come from historical data)
  // For now, we'll use a placeholder value
  const monthlyChange = '+2.8%';
  const themeColor = '#059669';
  
  // Generate dynamic chart data based on real balance
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate a value that fluctuates around the base value (±20%)
      const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
      const value = Math.round(totalBalance * randomFactor);
      
      data.push({
        month: monthNames[monthIndex],
        value: value
      });
    }
    
    return data;
  };
  
  const chartData = generateChartData();

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
        value: formattedBalance,
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
      loading={loading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default AccountsCard; 