import React from 'react';
import { useNavigation } from '@react-navigation/native';
import FinancialSummaryCard from './FinancialSummaryCard';

interface NetWorthCardProps {
  backgroundImage?: string;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();

  // Mock data - in real app, this would come from context or API
  const netWorthTotal = 42680;
  const percentChange = 3.6;
  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  // Generate mock chart data
  const generateChartData = () => {
    const data = [];
    const baseValue = netWorthTotal;
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

  const chartData = generateChartData();

  const handleViewAll = () => {
    // Navigate to net worth details page
    navigation.navigate('Money' as never, { tab: 'net-worth' } as never);
  };

  const handleAddNew = () => {
    // Navigate to add net worth entry
    navigation.navigate('Money' as never, { tab: 'net-worth', action: 'add' } as never);
  };

  return (
    <FinancialSummaryCard
      title="Net Worth"
      icon="💰"
      data={chartData}
      total={netWorthTotal}
      monthlyChange={monthlyChange}
      themeColor="#10B981"
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default NetWorthCard; 