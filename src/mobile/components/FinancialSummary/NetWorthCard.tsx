import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { fetchFormattedCategoriesForUI } from "../../../../services/netWorthService";
import FinancialSummaryCard from "./FinancialSummaryCard";

interface NetWorthCardProps {
  backgroundImage?: string;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();
  const { isDemo } = useDemoMode();
  const [netWorthTotal, setNetWorthTotal] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [chartData, setChartData] = useState<
    Array<{ month: string; value: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate real net worth from assets and liabilities (same as Money page)
  useEffect(() => {
    const calculateNetWorth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assets and liabilities using the same service as Money page
        const [assets, liabilities] = await Promise.all([
          fetchFormattedCategoriesForUI("asset", isDemo),
          fetchFormattedCategoriesForUI("liability", isDemo),
        ]);

        // Calculate totals (including bank accounts, investments, properties, etc.)
        const assetsTotal = assets.reduce((sum, cat) => sum + cat.value, 0);
        const liabilitiesTotal = liabilities.reduce((sum, cat) => sum + cat.value, 0);
        const netWorth = assetsTotal - liabilitiesTotal;

        setTotalAssets(assetsTotal);
        setTotalLiabilities(liabilitiesTotal);
        setNetWorthTotal(netWorth);

        // Generate chart data based on net worth trend
        const chartData = generateChartDataFromNetWorth(netWorth);
        setChartData(chartData);

        // TODO: Calculate real percentage change from historical data
        const change = Math.random() * 8 - 2;
        setPercentChange(change);
      } catch (err) {
        console.error("Error calculating net worth:", err);
        setError(
          err instanceof Error ? err.message : "Failed to calculate net worth"
        );
        setNetWorthTotal(0);
        setPercentChange(0);
        setChartData(generateMockChartData(0));
      } finally {
        setLoading(false);
      }
    };

    calculateNetWorth();
  }, [isDemo]);

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
      `Net Worth = Total Assets - Total Liabilities\n\n` +
      `Assets: ₹${totalAssets.toLocaleString("en-IN")}\n` +
      `Liabilities: ₹${totalLiabilities.toLocaleString("en-IN")}\n\n` +
      `Includes bank accounts, investments, properties, credit cards, and loans.`,
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
      loading={loading}
      error={error}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
      onInfoPress={handleInfo}
      backgroundImage={backgroundImage}
    />
  );
};

export default NetWorthCard;
