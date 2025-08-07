import React from 'react';
import { useNavigation } from '@react-navigation/native';
import FinancialSummaryCard from './FinancialSummaryCard';

interface CreditCardCardProps {
  backgroundImage?: string;
}

const CreditCardCard: React.FC<CreditCardCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();

  // Mock data - in real app, this would come from context or API
  const creditCardDebt = 2000;
  const percentChange = -2.7; // Negative for debt reduction
  const monthlyChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  // Generate mock chart data
  const generateChartData = () => {
    const data = [];
    const baseValue = creditCardDebt;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      const randomChange = (Math.random() - 0.5) * 0.06; // ±3% variation
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
    // Navigate to credit card details page
    navigation.navigate('Money' as never, { tab: 'credit-cards' } as never);
  };

  const handleAddNew = () => {
    // Navigate to add credit card
    navigation.navigate('Money' as never, { tab: 'credit-cards', action: 'add' } as never);
  };

  return (
    <FinancialSummaryCard
      title="Credit Card Debt"
      icon="💳"
      data={chartData}
      total={creditCardDebt}
      monthlyChange={monthlyChange}
      themeColor="#EF4444"
      loading={false}
      error={null}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default CreditCardCard; 