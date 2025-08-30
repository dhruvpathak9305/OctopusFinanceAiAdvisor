import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOptimizedAccounts } from "../../../../contexts/OptimizedAccountsContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import { getAccountBalanceHistory } from "../../../../services/optimizedAccountsService";
import FinancialSummaryCard from "./FinancialSummaryCard";
import AddAccountModal from "../../components/AddAccountModal";

interface OptimizedAccountsCardProps {
  backgroundImage?: string;
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

const OptimizedAccountsCard: React.FC<OptimizedAccountsCardProps> = ({
  backgroundImage,
  onPress,
  onExpandedPress,
}) => {
  const navigation = useNavigation();
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    totalBalance,
    accountCount,
    getBankAccounts,
  } = useOptimizedAccounts();
  const { isDemo } = useDemoMode();
  const { isDark } = useTheme();

  const [chartData, setChartData] = useState<
    Array<{ month: string; value: number }>
  >([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  const colors = isDark
    ? {
        background: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        card: "#1F2937",
      }
    : {
        background: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        card: "#FFFFFF",
      };

  // Get only bank accounts (exclude credit cards and loans)
  const bankAccounts = getBankAccounts();

  // Calculate monthly change (this would ideally come from historical data)
  const monthlyChange = "+2.8%"; // This could be calculated from historical data

  // Theme-aware colors (using a consistent green theme)
  const chartLineColor = "#059669";

  // Fetch historical data for chart
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);

        if (bankAccounts.length === 0) {
          setChartData(generateTestData(0));
          setChartLoading(false);
          return;
        }

        // Get history for the primary account (first account) or aggregate all accounts
        const primaryAccount = bankAccounts[0];
        if (primaryAccount) {
          const history = await getAccountBalanceHistory(
            primaryAccount.id,
            12,
            isDemo
          );

          // Transform the data to match the expected format
          const transformedData = history.map((item) => ({
            month: item.month,
            value: item.balance,
          }));

          setChartData(transformedData);
        } else {
          setChartData(generateTestData(totalBalance));
        }
      } catch (err) {
        console.error("Error fetching accounts history:", err);
        // Fallback to generated data if history fetch fails
        setChartData(generateTestData(totalBalance));
      } finally {
        setChartLoading(false);
      }
    };

    if (!loading) {
      fetchChartData();
    }
  }, [bankAccounts, totalBalance, isDemo, loading]);

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
        value: Math.max(0, value),
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

  const handleAccountAdded = async (newAccount: any) => {
    await fetchAccounts(); // Refresh accounts in context
    setShowAddAccountModal(false);
  };

  const handleCardPress = () => {
    if (onExpandedPress) {
      onExpandedPress({
        title: `Accounts (${accountCount})`,
        value: formatCurrency(totalBalance),
        change: monthlyChange,
        trend: "up",
        icon: "🏦",
        chartData: chartData.map((item) => item.value),
        backgroundColor: "#1F2937",
        accentColor: chartLineColor,
      });
    }
    onPress?.();
  };

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const isNegative = value < 0;

    let formattedValue: string;

    if (absValue >= 10000000) {
      // 1 Crore
      formattedValue = `${(absValue / 10000000).toFixed(1)}CR`;
    } else if (absValue >= 100000) {
      // 1 Lakh
      formattedValue = `${(absValue / 100000).toFixed(1)}L`;
    } else if (absValue >= 1000) {
      // 1 Thousand
      formattedValue = `${(absValue / 1000).toFixed(1)}K`;
    } else {
      formattedValue = absValue.toFixed(0);
    }

    // Remove .0 if present
    formattedValue = formattedValue.replace(".0", "");

    return `${isNegative ? "-" : ""}₹${formattedValue}`;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={chartLineColor} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Calculating balances...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: "#EF4444" }]}>Error</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={fetchAccounts} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: chartLineColor }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handleCardPress}>
        <FinancialSummaryCard
          title={`Accounts${accountCount > 0 ? ` (${accountCount})` : ""}`}
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
      </TouchableOpacity>

      <AddAccountModal
        visible={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={handleAccountAdded}
      />

      {/* Balance Summary Overlay */}
      {!loading && accountCount > 0 && (
        <View
          style={[
            styles.summaryOverlay,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Real-time from {accountCount} account{accountCount !== 1 ? "s" : ""}
          </Text>
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Total Balance:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(totalBalance)}
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    left: 8,
    borderRadius: 8,
    padding: 12,
    opacity: 0.9,
  },
  summaryText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OptimizedAccountsCard;
