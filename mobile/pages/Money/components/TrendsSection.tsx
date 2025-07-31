import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import TrendsTabs, { TrendTab } from './TrendsTabs';
import MonthSelector from './MonthSelector';
import SpendSummaryHeader from './SpendSummaryHeader';
import TrendChart from './TrendChart';
import { useTrendData } from '@/hooks/useTrendData';

export interface TrendsSectionProps {
  className?: string;
  selectedAccountId?: string | null;
  selectedInstitution?: string;
}

const TrendsSection: React.FC<TrendsSectionProps> = ({ 
  className,
  selectedAccountId = null,
  selectedInstitution = "All"
}) => {
  const [activeTab, setActiveTab] = useState<TrendTab>('spend');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly'>('daily');

  const { loading, error, getDataForTab } = useTrendData(
    currentMonth, 
    selectedAccountId, 
    selectedInstitution, 
    chartPeriod
  );

  const currentData = getDataForTab(activeTab);

  const handleBudgetEdit = (newBudget: number) => {
    // In a real app, this would update the budget via API
    console.log('Budget updated:', newBudget);
  };

  /**
   * Get tab colors matching Add Transactions modal:
   * Expense/Spend → Red, Income → Green, Invest → Blue
   */
  const getTabColor = (tab: TrendTab): string => {
    switch (tab) {
      case 'spend': return '#EF4444'; // Red for expense
      case 'income': return '#10B981'; // Green for income  
      case 'invested': return '#3B82F6'; // Blue for invest
      default: return '#6B7280'; // gray
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)} data-testid="trends-section">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)} data-testid="trends-section">
        <CardContent className="p-6">
          <div className="text-center py-12 text-destructive">
            <p>Error loading trends data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Card className={cn("w-full", className)} data-testid="trends-section">
          <CardContent className="p-6">
            <div className="text-center py-12 text-destructive">
              <p>Unable to load trend data. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      }
      onError={(error, errorInfo) => {
        console.error('TrendsSection Error:', error, errorInfo);
      }}
      data-testid="error-boundary"
    >
      <Card className={cn("w-full", className)} data-testid="trends-section">
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Month Selector */}
          <MonthSelector
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />

          {/* Trends Tabs */}
          <TrendsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Summary Header - Full width container */}
          <div className="w-full">
            <SpendSummaryHeader
              data={currentData.summaryData}
              onBudgetEdit={activeTab === 'spend' ? handleBudgetEdit : undefined}
            />
          </div>

          {/* Trend Chart - Matching container width */}
          <div className="w-full">
            <TrendChart
              data={currentData.chartData}
              chartType="line"
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              showBudgetLine={activeTab === 'spend'}
              budget={currentData.summaryData.budget}
              color={getTabColor(activeTab)}
            />
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default TrendsSection; 