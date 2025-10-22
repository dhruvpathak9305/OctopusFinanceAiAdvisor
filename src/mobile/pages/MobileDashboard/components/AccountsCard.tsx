import React, { useState, useEffect } from "react";
import { useAccounts } from "../../../../../contexts/AccountsContext";
import FinancialSummaryCard from "../../../components/FinancialSummary/FinancialSummaryCard";
import { useDemoMode } from "../../../../../contexts/DemoModeContext";
import { useBalances } from "../../../../../contexts/BalanceContext";
import { getMoMGrowthWithFallback } from "../../../../../services/accountBalanceHistoryService";

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

  // State for MoM growth data
  const [monthlyChange, setMonthlyChange] = useState("+0.0%");
  const [momTrend, setMomTrend] = useState<"up" | "down" | "neutral">("neutral");
  const [momLoading, setMomLoading] = useState(true);

  // Combined loading and error states
  const loading = accountsLoading || balancesLoading || momLoading;
  const error = accountsError || balancesError;

  console.log("🚀 ~ totalBalance from balance_real context:", totalBalance);

  // Format for display using Indian currency (matching working component)
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalBalance);

  // Determine theme color based on MoM trend
  const themeColor =
    momTrend === "up" ? "#059669" : momTrend === "down" ? "#DC2626" : "#3B82F6"; // Blue for neutral

  // Fetch MoM growth data
  useEffect(() => {
    const fetchMoMGrowth = async () => {
      try {
        setMomLoading(true);
        const momData = await getMoMGrowthWithFallback(totalBalance, isDemo);
        
        if (momData) {
          setMonthlyChange(momData.formattedChange);
          setMomTrend(momData.trend);
          
          console.log("📊 MoM Growth data loaded:", {
            change: momData.formattedChange,
            trend: momData.trend,
            currentTotal: momData.currentMonthTotal,
            previousTotal: momData.previousMonthTotal,
          });
        }
      } catch (error) {
        console.error("Error fetching MoM growth:", error);
        // Keep default values on error
      } finally {
        setMomLoading(false);
      }
    };

    // Only fetch when we have a valid balance
    if (totalBalance > 0 && !balancesLoading) {
      fetchMoMGrowth();
    } else if (!balancesLoading) {
      setMomLoading(false);
    }
  }, [totalBalance, isDemo, balancesLoading]);

  // Note: Balance fetching is now handled by BalanceContext with real-time updates

  // State for historical chart data - NO dummy data, only real data or null
  const [chartData, setChartData] = useState<Array<{ month: string; value: number }> | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Fetch historical balance data for the last 12 months - ONLY REAL DATA
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setChartError(null);
        const data = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        // Import the function we need
        const { fetchMonthEndBalances } = await import("../../../../../services/accountBalanceHistoryService");

        console.log("📊 Fetching historical balance data for last 12 months...");

        // Fetch last 12 months of data
        let hasRealData = false;
        for (let i = 11; i >= 0; i--) {
          const monthOffset = currentMonth - i;
          const targetMonth = ((monthOffset % 12) + 12) % 12;
          const targetYear = currentYear + Math.floor(monthOffset / 12);

          const monthBalances = await fetchMonthEndBalances(targetYear, targetMonth, isDemo);
          const monthTotal = monthBalances.reduce((sum, b) => sum + b.balance, 0);

          data.push({
            month: monthNames[targetMonth],
            value: monthTotal,
          });

          if (monthTotal > 0) {
            hasRealData = true;
          }
        }

        console.log("📊 Historical data fetched:", { 
          months: data.length, 
          hasRealData,
          sample: data.slice(-3)
        });

        // Only set chart data if we have REAL historical data
        if (hasRealData && data.some(d => d.value > 0)) {
          console.log("✅ Real historical data found, displaying chart");
          setChartData(data);
          setChartError(null);
        } else {
          console.log("⚠️ No historical data available in database");
          setChartData(null);
          setChartError("No historical data available yet. Historical balance tracking will begin from this month.");
        }
      } catch (error) {
        console.error("❌ Error fetching historical chart data:", error);
        setChartData(null);
        setChartError("Unable to load historical data. Please try again later.");
      }
    };

    if (totalBalance > 0 && !balancesLoading) {
      fetchHistoricalData();
    }
  }, [totalBalance, isDemo, balancesLoading]);

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
        trend: momTrend === "neutral" ? "up" : momTrend, // Use actual trend, default to "up" for neutral
        icon: "🏦",
        chartData: chartData?.map((item) => item.value) || [],
        backgroundColor: "#1F2937",
        accentColor: themeColor,
      });
    }
    onPress?.();
  };

  // Log when rendering
  console.log("🎨 AccountsCard rendering with:", {
    hasChartData: chartData !== null,
    chartDataLength: chartData?.length || 0,
    chartError,
    totalBalance,
    monthlyChange,
    momTrend,
    themeColor,
  });

  return (
    <FinancialSummaryCard
      title={`Accounts${
        bankAccountBalances.length > 0 ? ` (${bankAccountBalances.length})` : ""
      }`}
      icon="🏦"
      data={chartData || []}
      total={totalBalance}
      monthlyChange={monthlyChange}
      themeColor={themeColor}
      trend={momTrend} // Pass the actual trend (up/down/neutral)
      loading={loading || balancesLoading}
      error={error}
      chartMessage={chartError}
      onViewAll={handleViewAll}
      onAddNew={handleAddNew}
    />
  );
};

export default AccountsCard;
