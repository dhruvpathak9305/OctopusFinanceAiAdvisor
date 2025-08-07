import React from 'react';
import { useNavigation } from '@react-navigation/native';
import FinancialSummaryCard from './FinancialSummaryCard';

interface MonthlyExpenseCardProps {
  backgroundImage?: string;
}

const MonthlyExpenseCard: React.FC<MonthlyExpenseCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();

  // Mock data - in real app, this would come from context or API
  const monthlyExpenses = 3280.45;
  const percentChange = 2.2;
  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  // Generate mock chart data
  const generateChartData = () => {
    const data = [];
    const baseValue = monthlyExpenses;
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
    // Navigate to expenses details page
    navigation.navigate('Money' as never, { tab: 'expenses' } as never);
  };

  const handleAddNew = () => {
    // Navigate to add expense
    navigation.navigate('Money' as never, { tab: 'expenses', action: 'add' } as never);
  };

  return (
    <FinancialSummaryCard
      title="Monthly Expenses"
      icon="📊"
      data={chartData}
      total={monthlyExpenses}
      monthlyChange={monthlyChange}
      themeColor="#F59E0B"
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default MonthlyExpenseCard; 