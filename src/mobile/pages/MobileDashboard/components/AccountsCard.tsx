import React, { useState, useEffect } from "react";
import { useAccounts } from "../../../../../contexts/AccountsContext";
import FinancialSummaryCard from "../../../components/FinancialSummary/FinancialSummaryCard";
import { useDemoMode } from "../../../../../contexts/DemoModeContext";
import { useBalances } from "../../../../../contexts/BalanceContext";

interface AccountsCardProps {
  onPress?: () => void;
  onExpandedPress?: (data: {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: string;
    chartData: number[];
    backgroundColor: string;
    accentColor: string;
  }) => void;
}

const AccountsCard: React.FC<AccountsCardProps> = ({
  onPress,
  onExpandedPress,
}) => {
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const { isDemo } = useDemoMode();
  const {
    bankAccountBalances,
    totalBalance,
    loading: balancesLoading,
    error: balancesError,
  } = useBalances();

  // Combined loading and error states
  const loading = accountsLoading || balancesLoading;
  const error = accountsError || balancesError;

  console.log("🚀 ~ totalBalance from balance_real context:", totalBalance);

  // Format for display using Indian currency (matching working component)
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalBalance);

  // Calculate monthly change (this would ideally come from historical data)
  // For now, we'll use a placeholder value
  const monthlyChange = "+2.8%";
  const themeColor = "#059669";

  // Note: Balance fetching is now handled by BalanceContext with real-time updates

  // Generate dynamic chart data based on real balance
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    const currentMonth = now.getMonth();

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Generate a value that fluctuates around the base value (±20%)
      const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
      const value = Math.round(totalBalance * randomFactor);

      data.push({
        month: monthNames[monthIndex],
        value: value,
      });
    }

    return data;
  };

  const chartData = generateChartData();

  const handleViewAll = () => {
    console.log("Navigate to accounts page");
  };

  const handleAddNew = () => {
    console.log("Add new account");
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: "Accounts",
        value: formattedBalance,
        change: monthlyChange,
        trend: "up",
        icon: "🏦",
        chartData: chartData.map((item) => item.value),
        backgroundColor: "#1F2937",
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  return (
    <FinancialSummaryCard
      title={`Accounts${
        bankAccountBalances.length > 0 ? ` (${bankAccountBalances.length})` : ""
      }`}
      icon="🏦"
      data={chartData}
      total={totalBalance}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      loading={loading || balancesLoading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default AccountsCard;
