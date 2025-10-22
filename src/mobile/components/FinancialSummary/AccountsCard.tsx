import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAccounts } from "../../../../contexts/AccountsContext";
import { fetchAccountsHistory } from "../../../../services/accountsService";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { useBalances } from "../../../../contexts/BalanceContext";
import { getMoMGrowthWithFallback } from "../../../../services/accountBalanceHistoryService";
import FinancialSummaryCard from "./FinancialSummaryCard";
import AddAccountModal from "../AddAccountModal";

interface AccountsCardProps {
  backgroundImage?: string;
}

const AccountsCard: React.FC<AccountsCardProps> = ({ backgroundImage }) => {
  const navigation = useNavigation();
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    fetchAccounts,
  } = useAccounts();
  const { isDemo } = useDemoMode();
  const {
    bankAccountBalances,
    totalBalance,
    loading: balancesLoading,
    error: balancesError,
    refreshBalances,
    debugComparison,
  } = useBalances();
  const [chartData, setChartData] = useState<
    Array<{ month: string; value: number }>
  >([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // MoM growth state
  const [monthlyChange, setMonthlyChange] = useState("+0.0%");
  const [momTrend, setMomTrend] = useState<"up" | "down" | "neutral">("neutral");
  const [momLoading, setMomLoading] = useState(true);

  // Combined loading and error states
  const loading = accountsLoading || balancesLoading || momLoading;
  const error = accountsError || balancesError;

  // State is ready for rendering

  // Theme-aware colors based on MoM trend
  const chartLineColor =
    momTrend === "up" ? "#059669" : momTrend === "down" ? "#DC2626" : "#3B82F6";

  // Note: Balance fetching is now handled by BalanceContext with real-time updates

  // Fetch MoM growth data
  useEffect(() => {
    const fetchMoMGrowth = async () => {
      try {
        setMomLoading(true);
        const momData = await getMoMGrowthWithFallback(totalBalance, isDemo);
        
        if (momData) {
          setMonthlyChange(momData.formattedChange);
          setMomTrend(momData.trend);
          
          console.log("📊 [AccountsCard] MoM Growth data loaded:", {
            change: momData.formattedChange,
            trend: momData.trend,
            currentTotal: momData.currentMonthTotal,
            previousTotal: momData.previousMonthTotal,
          });
        }
      } catch (error) {
        console.error("❌ [AccountsCard] Error fetching MoM growth:", error);
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

  // Fetch historical data for chart
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const history = await fetchAccountsHistory(12, isDemo);

        // Transform the data to match the expected format
        const transformedData = history.map((item) => ({
          month: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
          }),
          value: item.value,
        }));

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching accounts history:", err);
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
      const value = Math.round(baseValue * randomFactor);

      data.push({
        month: monthNames[monthIndex],
        value: value,
      });
    }

    return data;
  };

  const handleViewAll = () => {
    // Navigate to accounts details page
    (navigation as any).navigate("MobileAccounts");
  };

  const handleAddNew = () => {
    setShowAddAccountModal(true);
  };

  const handleAccountAdded = (newAccount: any) => {
    fetchAccounts();
    // Refresh balances from context after adding new account
    refreshBalances();
    setShowAddAccountModal(false);
  };

  // Debug function to force refresh balances and run comparison
  const handleDebugRefresh = async () => {
    console.log("🔄 AccountsCard: Manual balance refresh triggered");
    await refreshBalances();
    await debugComparison();
  };

  return (
    <>
      <FinancialSummaryCard
        title={`Accounts${
          bankAccountBalances.length > 0
            ? ` (${bankAccountBalances.length})`
            : ""
        }`}
        icon="🏛️"
        data={chartData}
        total={totalBalance}
        monthlyChange={monthlyChange}
        themeColor={chartLineColor}
        trend={momTrend} // Pass the actual MoM trend
        loading={loading || chartLoading || balancesLoading}
        error={error}
        onViewAll={handleViewAll}
        onAddNew={handleAddNew}
        backgroundImage={backgroundImage}
      />

      <AddAccountModal
        visible={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={handleAccountAdded}
      />
    </>
  );
};

export default AccountsCard;
