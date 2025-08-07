import React from 'react';
import { useNavigation } from '@react-navigation/native';
import FinancialSummaryCard from './FinancialSummaryCard';

interface MonthlyIncomeCardProps {
  backgroundImage?: string;
}

const MonthlyIncomeCard: React.FC<MonthlyIncomeCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();

  // Mock data - in real app, this would come from context or API
  const monthlyIncome = 4850;
  const percentChange = 3.8;
  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  // Generate mock chart data
  const generateChartData = () => {
    const data = [];
    const baseValue = monthlyIncome;
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

  const chartData = generateChartData();

  const handleViewAll = () => {
    // Navigate to income details page
    navigation.navigate('Money' as never, { tab: 'income' } as never);
  };

  const handleAddNew = () => {
    // Navigate to add income
    navigation.navigate('Money' as never, { tab: 'income', action: 'add' } as never);
  };

  return (
    <FinancialSummaryCard
      title="Monthly Income"
      icon="📈"
      data={chartData}
      total={monthlyIncome}
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

export default MonthlyIncomeCard; 