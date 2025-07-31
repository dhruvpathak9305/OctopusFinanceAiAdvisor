import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useCreditCards } from '@/contexts/CreditCardContext';
import { useTheme } from '@/common/providers/ThemeProvider';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import FinancialSummaryCard from './FinancialSummaryCard';
import AddAccountModal from '@/components/common/AddAccountModal';

interface CreditCardCardProps {
  backgroundImage?: string;
}

// Generate monthly data for the last 12 months
const generateTestData = (baseValue: number) => {
  const data = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate a value that fluctuates around the base value (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
    const value = Math.round(baseValue * randomFactor);
    
    data.push({
      month: monthNames[monthIndex],
      value: value
    });
  }
  
  return data;
};

const CreditCardCard: React.FC<CreditCardCardProps> = ({ backgroundImage }) => {
  const { creditCards, loading, error } = useCreditCards();
  const { resolvedTheme } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate total credit card debt
  const totalDebt = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);

  // Format for display
  const formattedDebt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalDebt);

  // Calculate monthly change (this would ideally come from historical data)
  // For now, use a placeholder
  const monthlyChange = '-5.2%';

  // Get chart data using generated data
  const chartData = generateTestData(totalDebt);

  // Theme-aware colors
  const chartLineColor = resolvedTheme === 'dark' ? '#ef4444' : '#ef4444';

  const handleAddCreditCard = () => {
    setIsAddModalOpen(true);
  };

  const handleViewAll = () => {
    navigate('/money?tab=credit-cards');  
  };

  return (
    <>
      <FinancialSummaryCard
        title="Credit Card Debt"
        iconClass="fas fa-credit-card mr-1 text-red-500"
        data={chartData}
        total={totalDebt}
        monthlyChange={monthlyChange}
        themeColor={chartLineColor}
        loading={loading}
        error={error}
        onViewAll={handleViewAll}
        onAddNew={handleAddCreditCard}
      />
      
      <AddAccountModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        isCreditCard={true}
      />
    </>
  );
};

export default CreditCardCard; 