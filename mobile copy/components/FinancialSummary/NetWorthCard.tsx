import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetWorthData, useNetWorthActions } from '@/contexts/NetWorthContext';
import FinancialSummaryCard from './FinancialSummaryCard';
import { generateNetWorthTrendData } from './utils/trendDataGenerator';

interface NetWorthCardProps {
  backgroundImage?: string;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ backgroundImage }) => {
  const { 
    summary, 
    loading, 
    error, 
    entries, 
    trendData, 
    trendPercentage, 
    monthlyChangeText,
    isInitialized
  } = useNetWorthData();
  const navigate = useNavigate();

  // Calculate net worth from summary or default to 0
  const netWorthTotal = summary?.net_worth || 0;
  
  // Use database trend data if available, otherwise fallback to generated data
  const chartData = trendData.length > 0 
    ? trendData.map(point => ({ 
        month: new Date(point.date).toLocaleDateString('en-US', { month: 'short' }),
        value: point.value 
      }))
    : generateNetWorthTrendData(netWorthTotal);

  // Use database trend percentage if available, otherwise fallback to mock
  const percentChange = trendPercentage || 8.5;
  const monthlyChange = monthlyChangeText || `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  const handleViewAll = () => {
    navigate('/money?tab=net-worth');
  };

  const handleAddNew = () => {
    navigate('/money?tab=net-worth&action=add');
  };

  // Show loading only when truly loading (not just waiting for initialization)
  const isLoading = loading || !isInitialized;

  return (
    <FinancialSummaryCard
      title="Net Worth"
      iconClass="fas fa-chart-line mr-1 text-yellow-500"
      data={chartData}
      total={netWorthTotal}
      monthlyChange={monthlyChange}
      themeColor="#10b981"
      loading={isLoading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default NetWorthCard; 