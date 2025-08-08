import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAccounts } from '../../../../contexts/AccountsContext';
import { fetchAccountsHistory } from '../../../../services/accountsService';
import { useDemoMode } from '../../../../contexts/DemoModeContext';
import FinancialSummaryCard from './FinancialSummaryCard';

interface AccountsCardProps {
  backgroundImage?: string;
}

const AccountsCard: React.FC<AccountsCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();
  const { accounts, loading, error } = useAccounts();
  const { isDemo } = useDemoMode();
  const [chartData, setChartData] = useState<Array<{ month: string; value: number }>>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Filter out credit cards and loans (liabilities) - matching working component
  const bankAccounts = accounts.filter(account => 
    account.type !== 'Credit Card' && 
    account.type !== 'Credit' && 
    account.type !== 'Loan'
  );

  // Calculate total balance of bank accounts
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  // Calculate monthly change (this would ideally come from historical data)
  const monthlyChange = '+2.8%'; // This could be calculated from historical data

  // Theme-aware colors (using a consistent green theme)
  const chartLineColor = '#059669';

  // Fetch historical data for chart
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const history = await fetchAccountsHistory(12, isDemo);
        
        // Transform the data to match the expected format
        const transformedData = history.map(item => ({
          month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
          value: item.value
        }));
        
        setChartData(transformedData);
      } catch (err) {
        console.error('Error fetching accounts history:', err);
        // Fallback to generated data if history fetch fails
        setChartData(generateTestData(totalBalance));
      } finally {
        setChartLoading(false);
      }
    };

    if (totalBalance > 0) {
      fetchChartData();
    } else {
      setChartData(generateTestData(0));
      setChartLoading(false);
    }
  }, [totalBalance, isDemo]);

  // Generate monthly data for the last 12 months (fallback)
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

  const handleViewAll = () => {
    // Navigate to accounts details page
    (navigation as any).navigate('Money', { tab: 'accounts' });
  };

  const handleAddNew = () => {
    // Navigate to add account
    (navigation as any).navigate('Money', { tab: 'accounts', action: 'add' });
  };

  return (
    <FinancialSummaryCard
      title="Accounts"
      icon="🏛️"
      data={chartData}
      total={totalBalance}
      monthlyChange={monthlyChange}
      themeColor={chartLineColor}
      loading={loading || chartLoading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      backgroundImage={backgroundImage}
    />
  );
};

export default AccountsCard; 