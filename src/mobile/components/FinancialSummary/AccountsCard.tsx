import React from 'react';
import { useNavigation } from '@react-navigation/native';
import FinancialSummaryCard from './FinancialSummaryCard';

interface AccountsCardProps {
  backgroundImage?: string;
}

const AccountsCard: React.FC<AccountsCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();

  // Mock data - in real app, this would come from context or API
  const accountsTotal = 4000;
  const percentChange = 1.0;
  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  // Generate mock chart data
  const generateChartData = () => {
    const data = [];
    const baseValue = accountsTotal;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      const randomChange = (Math.random() - 0.5) * 0.08; // ±4% variation
      const value = baseValue * (1 + randomChange);
      data.push({
        month: months[i],
        value: Math.round(value)
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const handleViewAll = () => {
    // Navigate to accounts details page
    navigation.navigate('Money' as never, { tab: 'accounts' } as never);
  };

  const handleAddNew = () => {
    // Navigate to add account
    navigation.navigate('Money' as never, { tab: 'accounts', action: 'add' } as never);
  };

  return (
    <FinancialSummaryCard
      title="Accounts"
      icon="🏛️"
      data={chartData}
      total={accountsTotal}
      monthlyChange={monthlyChange}
      themeColor="#3B82F6"
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default AccountsCard; 