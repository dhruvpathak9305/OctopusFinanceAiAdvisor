import { useState, useEffect, useMemo } from 'react';
import { TrendTab } from '@/mobile/pages/Money/components/TrendsTabs';
import { TrendChartData } from '@/mobile/pages/Money/components/TrendChart';
import { SpendSummaryData } from '@/mobile/pages/Money/components/SpendSummaryHeader';

export interface TrendDataState {
  spend: TrendChartData[];
  invested: TrendChartData[];
  income: TrendChartData[];
  summary: {
    spend: SpendSummaryData;
    invested: SpendSummaryData;
    income: SpendSummaryData;
  };
  loading: boolean;
  error: string | null;
}

export interface AccountFilter {
  id?: string | null; // null for "All Accounts"
  institution?: string; // for filtering by bank
}

// Generate last 12 months data for monthly view
const generateMonthlyData = (type: TrendTab, currentMonth: Date): TrendChartData[] => {
  const data: TrendChartData[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
    let baseValue = 0;
    
    switch (type) {
      case 'spend':
        baseValue = Math.random() * 50000 + 30000; // ₹30K-₹80K monthly spend
        break;
      case 'invested':
        baseValue = Math.random() * 25000 + 10000; // ₹10K-₹35K monthly investment
        break;
      case 'income':
        baseValue = Math.random() * 20000 + 80000; // ₹80K-₹100K monthly income
        break;
    }
    
    data.push({
      date: date.toISOString(),
      value: Math.round(baseValue),
      budget: type === 'spend' ? 3000 : undefined, // Daily budget for spend
    });
  }
  
  return data;
};

// Mock data generator for demonstration
const generateMockTrendData = (
  type: TrendTab, 
  currentMonth: Date,
  period: 'daily' | 'monthly' = 'daily',
  accountFilter?: AccountFilter
): { data: TrendChartData[]; summary: SpendSummaryData } => {
  
  let data: TrendChartData[];
  
  if (period === 'monthly') {
    data = generateMonthlyData(type, currentMonth);
  } else {
    // Generate daily data for current month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      let baseValue = 0;
      
      switch (type) {
        case 'spend':
          baseValue = Math.random() * 5000 + 1000; // ₹1K-₹6K daily spend
          break;
        case 'invested':
          baseValue = Math.random() * 3000 + 500; // ₹500-₹3.5K daily investment
          break;
        case 'income':
          baseValue = day === 1 ? 50000 : Math.random() * 1000; // Salary on 1st, small amounts other days
          break;
      }
      
      data.push({
        date: date.toISOString(),
        value: Math.round(baseValue),
        budget: type === 'spend' ? 3000 : undefined, // Budget only for spend
      });
    }
  }
  
  // Apply account filter effect (simulate reduced values for specific accounts)
  if (accountFilter?.id && accountFilter.id !== 'all') {
    data = data.map(item => ({
      ...item,
      value: Math.round(item.value * (0.3 + Math.random() * 0.4)) // 30-70% of total for individual accounts
    }));
  }
  
  const currentTotal = data.reduce((sum, item) => sum + item.value, 0);
  const lastMonthTotal = currentTotal * (0.8 + Math.random() * 0.4); // ±20% variation
  const percentageChange = ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100;
  
  const summary: SpendSummaryData = {
    currentSpend: currentTotal,
    budget: type === 'spend' ? 91000 : undefined, // Monthly budget
    lastMonthSpend: Math.round(lastMonthTotal),
    percentageChange: Math.round(percentageChange * 10) / 10,
  };
  
  return { data, summary };
};

export const useTrendData = (
  currentMonth: Date, 
  selectedAccountId?: string | null,
  selectedInstitution?: string,
  period: 'daily' | 'monthly' = 'daily'
) => {
  const [state, setState] = useState<TrendDataState>({
    spend: [],
    invested: [],
    income: [],
    summary: {
      spend: { currentSpend: 0, lastMonthSpend: 0, percentageChange: 0 },
      invested: { currentSpend: 0, lastMonthSpend: 0, percentageChange: 0 },
      income: { currentSpend: 0, lastMonthSpend: 0, percentageChange: 0 },
    },
    loading: true,
    error: null,
  });

  // Memoize the account filter to prevent infinite re-renders
  const accountFilter = useMemo<AccountFilter>(() => ({
    id: selectedAccountId,
    institution: selectedInstitution !== "All" ? selectedInstitution : undefined
  }), [selectedAccountId, selectedInstitution]);

  // Simulate data fetching
  useEffect(() => {
    const fetchTrendData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate mock data for all trend types
        const spendResult = generateMockTrendData('spend', currentMonth, period, accountFilter);
        const investedResult = generateMockTrendData('invested', currentMonth, period, accountFilter);
        const incomeResult = generateMockTrendData('income', currentMonth, period, accountFilter);
        
        setState({
          spend: spendResult.data,
          invested: investedResult.data,
          income: incomeResult.data,
          summary: {
            spend: spendResult.summary,
            invested: investedResult.summary,
            income: incomeResult.summary,
          },
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch trend data',
        }));
      }
    };

    fetchTrendData();
  }, [currentMonth, accountFilter.id, accountFilter.institution, period]);

  // Memoize the data for each tab
  const getDataForTab = useMemo(() => {
    return (tab: TrendTab) => ({
      chartData: state[tab],
      summaryData: state.summary[tab],
    });
  }, [state]);

  return {
    ...state,
    getDataForTab,
    refetch: () => {
      setState(prev => ({ ...prev, loading: true }));
      // Trigger useEffect to refetch data
    },
  };
}; 