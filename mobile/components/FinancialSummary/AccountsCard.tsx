import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useAccounts } from '@/contexts/AccountsContext';
import { useTheme } from '@/common/providers/ThemeProvider';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import FinancialSummaryCard from './FinancialSummaryCard';
import AddAccountModal from '@/components/common/AddAccountModal';

interface AccountsCardProps {
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

const AccountsCard: React.FC<AccountsCardProps> = ({ backgroundImage }) => {
  const { accounts, loading, error } = useAccounts();
  const { resolvedTheme } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Filter out credit cards and loans (liabilities)
  const bankAccounts = accounts.filter(account => 
    account.type !== 'Credit Card' && 
    account.type !== 'Credit' && 
    account.type !== 'Loan'
  );

  // Calculate total balance of bank accounts
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  console.log("🚀 ~ totalBalance:", totalBalance)

  // Format for display
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalBalance);

  // Calculate monthly change (this would ideally come from historical data)
  // For now, we'll use a placeholder value
  const monthlyChange = '+2.8%';

  // Get chart data using generated data for now
  const chartData = generateTestData(totalBalance);

  // Theme-aware colors
  const chartLineColor = resolvedTheme === 'dark' ? '#10b981' : '#059669';

  const handleAddAccount = () => {
    setIsAddModalOpen(true);
  };

  const handleViewAll = () => {
    navigate('/money');
  };

  return (
    <>
      <FinancialSummaryCard
        title="Accounts"
        iconClass="fas fa-university mr-1 text-green-500"
        data={chartData}
        total={totalBalance}
        monthlyChange={monthlyChange}
        themeColor={chartLineColor}
        loading={loading}
        error={error}
        onViewAll={handleViewAll}
        onAddNew={handleAddAccount}
      />
      
      <AddAccountModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        isCreditCard={false}
      />
    </>
  );
};

export default AccountsCard; 