import React, { useState, useEffect, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { useBalances } from "../../../../contexts/BalanceContext";
import FinancialSummaryCard from "./FinancialSummaryCard";

interface NetWorthCardProps {
  backgroundImage?: string;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();
  const {
    totalBalance,
    loading: balancesLoading,
    error: balancesError,
  } = useBalances();
  const [netWorthTotal, setNetWorthTotal] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [chartData, setChartData] = useState<
    Array<{ month: string; value: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For now, mirror Accounts card: use sum of balance_real (bank accounts) only
  const accountsTotal = useMemo(() => totalBalance || 0, [totalBalance]);

  // Calculate displayed total and chart based on accounts total
  useEffect(() => {
    const calculateNetWorth = async () => {
      try {
        setLoading(true);
        setError(null);

        const netWorth = accountsTotal;
        setNetWorthTotal(netWorth);

        // Generate chart data based on accounts total trend placeholder
        const chartData = generateChartDataFromNetWorth(netWorth);
        setChartData(chartData);

        // Percentage change placeholder
        const change = Math.random() * 8 - 2;
        setPercentChange(change);
      } catch (err) {
        console.error("Error calculating net worth:", err);
        setError(
          err instanceof Error ? err.message : "Failed to calculate net worth"
        );
        setNetWorthTotal(accountsTotal);
        setPercentChange(3.6);
        setChartData(generateMockChartData(accountsTotal));
      } finally {
        setLoading(false);
      }
    };

    if (!balancesLoading) {
      calculateNetWorth();
    }
  }, [balancesLoading, accountsTotal]);

  // Generate chart data from net worth
  const generateChartDataFromNetWorth = (currentNetWorth: number) => {
    const data: Array<{ month: string; value: number }> = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    for (let i = 0; i < 6; i++) {
      const progressFactor = (i + 1) / 6;
      const baseValue = currentNetWorth * 0.7;
      const targetValue = currentNetWorth;
      const value = baseValue + (targetValue - baseValue) * progressFactor;
      const randomChange = (Math.random() - 0.5) * 0.1;
      const finalValue = value * (1 + randomChange);
      data.push({ month: months[i], value: Math.round(finalValue) });
    }
    return data;
  };

  // Generate mock chart data (fallback)
  const generateMockChartData = (baseValue: number) => {
    const data = [] as Array<{ month: string; value: number }>;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    for (let i = 0; i < 6; i++) {
      const randomChange = (Math.random() - 0.5) * 0.1;
      const value = baseValue * (1 + randomChange);
      data.push({ month: months[i], value: Math.round(value) });
    }
    return data;
  };

  const monthlyChange = `${percentChange > 0 ? "+" : ""}${percentChange.toFixed(
    1
  )}%`;

  const handleViewAll = () => {
    (navigation as any).navigate("MobileNetWorth");
  };

  const handleAddNew = () => {
    (navigation as any).navigate("MobileNetWorth", { showAddAssetModal: true });
  };

  const handleInfo = () => {
    Alert.alert(
      "How we calculate Net Worth",
      "Now showing: Accounts Total from balance_real",
      [{ text: "OK" }]
    );
  };

  return (
    <FinancialSummaryCard
      title="Net Worth"
      icon="💰"
      data={chartData}
      total={netWorthTotal}
      monthlyChange={monthlyChange}
      themeColor="#10B981"
      loading={loading || balancesLoading}
      error={error || balancesError}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      onInfoPress={handleInfo}
      backgroundImage={backgroundImage}
    />
  );
};

export default NetWorthCard;
