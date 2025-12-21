import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import {
  MonthlyChart,
  LineChart as ReusableLineChart,
  ChartTooltip,
  PolarChart,
} from "../../components/charts";
import {
  DAILY_CHART_DATA,
  MONTHLY_CHART_DATA,
  FILTER_OPTIONS,
  CHART_COLORS,
  formatBankAmount,
} from "./utils";
import { BankAccount, ChartDataPoint } from "./types";
import { useRealAccountsData } from "./useRealAccountsData";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { 
  getMoMGrowthWithFallback,
  fetchAccountHistory,
} from "../../../../services/accountBalanceHistoryService";
import { fetchTransactions, TransactionFilters } from "../../../../services/transactionsService";

interface MobileAccountsProps {
  hideHeaderAndNav?: boolean;
}

const MobileAccounts: React.FC<MobileAccountsProps> = ({ hideHeaderAndNav = false }) => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { isDemo } = useDemoMode();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isDistributionExpanded, setIsDistributionExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState<
    "spend" | "invested" | "income"
  >("spend");
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"daily" | "monthly">("daily");
  const [accountChartDataPoint, setAccountChartDataPoint] = useState<
    number | null
  >(null);
  const [accountChartTooltipPos, setAccountChartTooltipPos] = useState({
    x: 0,
    y: 0,
  });
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // State for real historical data and MOM
  const [historicalChartData, setHistoricalChartData] = useState<number[]>([]);
  const [historicalChartLabels, setHistoricalChartLabels] = useState<string[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [monthlyChange, setMonthlyChange] = useState("+0.0%");
  const [momTrend, setMomTrend] = useState<"up" | "down" | "neutral">("neutral");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");

  // State for month navigation and transaction data
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [transactionChartLoading, setTransactionChartLoading] = useState(true);
  const [spendData, setSpendData] = useState<number[]>([]);
  const [incomeData, setIncomeData] = useState<number[]>([]);
  const [investedData, setInvestedData] = useState<number[]>([]);
  const [transactionLabels, setTransactionLabels] = useState<string[]>([]);
  
  // State for previous month data (for MOM comparison)
  const [previousSpendTotal, setPreviousSpendTotal] = useState(0);
  const [previousIncomeTotal, setPreviousIncomeTotal] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  // Fetch real accounts data from Supabase
  const {
    accounts: realAccounts,
    loading: accountsLoading,
    error: accountsError,
    totalBalance: realTotalBalance,
    refreshAccounts,
  } = useRealAccountsData();

  // Use real data if available, fallback to static data
  const accounts = realAccounts.length > 0 ? realAccounts : [];

  // Sort accounts by balance (descending - highest first) for chips
  const accountsSortedByBalance = [...accounts].sort(
    (a, b) => b.balance - a.balance
  );

  // Calculate displayed balance based on selected filter
  const displayedBalance =
    selectedFilter === "All"
      ? realTotalBalance || 0
      : accounts.find((acc) => acc.name === selectedFilter)?.balance || 0;

  // Create filter options dynamically from sorted accounts
  const filters = [
    "All",
    ...accountsSortedByBalance.map((acc) => acc.name),
    "Add Account",
  ];

  // Sort accounts based on sort order for distribution section
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (sortOrder === "desc") {
      return b.balance - a.balance; // Highest to lowest
    } else {
      return a.balance - b.balance; // Lowest to highest
    }
  });

  // Fetch historical chart data when accounts or filter changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setChartLoading(true);
        
        // Determine which account to fetch history for
        let accountIdToFetch: string | null = null;
        
        if (selectedFilter !== "All" && selectedFilter !== "Add Account") {
          // Find the selected account
          const selectedAccount = accounts.find(acc => acc.name === selectedFilter);
          if (selectedAccount) {
            accountIdToFetch = selectedAccount.id;
          }
        }
        
        // Fetch 12 months of historical data
        const history = await fetchAccountHistory(accountIdToFetch, 12, isDemo);
        
        if (history && history.length > 0) {
          // Transform and validate data for chart
          const validData: number[] = [];
          const validLabels: string[] = [];
          
          history.forEach(item => {
            // Validate that value exists and is a valid number
            const value = Number(item.value);
            if (!isNaN(value) && isFinite(value)) {
              const valueInLakhs = value / 100000; // Convert to lakhs
              // Only add if the converted value is also valid
              if (!isNaN(valueInLakhs) && isFinite(valueInLakhs)) {
                validData.push(valueInLakhs);
                const date = new Date(item.date);
                const label = date.toLocaleDateString("en-US", { month: "short" });
                validLabels.push(label);
              }
            }
          });
          
          // Only set data if we have valid values
          if (validData.length > 0) {
            setHistoricalChartData(validData);
            setHistoricalChartLabels(validLabels);
          } else {
            console.warn("No valid data points found in historical data");
            setHistoricalChartData([]);
            setHistoricalChartLabels([]);
          }
        } else {
          // Fallback to empty data
          setHistoricalChartData([]);
          setHistoricalChartLabels([]);
        }
      } catch (err) {
        console.error("Error fetching historical chart data:", err);
        // Fallback to empty data
        setHistoricalChartData([]);
        setHistoricalChartLabels([]);
      } finally {
        setChartLoading(false);
      }
    };

    if (!accountsLoading && accounts.length > 0) {
      fetchHistoricalData();
    } else if (!accountsLoading) {
      setChartLoading(false);
    }
  }, [accounts, isDemo, accountsLoading, selectedFilter]);

  // Calculate MOM growth when balance or filter changes
  useEffect(() => {
    const calculateMOM = async () => {
      // Use the displayed balance (filtered by selected account or total)
      const balanceToUse = displayedBalance;
      
      if (balanceToUse > 0) {
        try {
          const momData = await getMoMGrowthWithFallback(balanceToUse, isDemo);
          
          if (momData) {
            setMonthlyChange(momData.formattedChange);
            setMomTrend(momData.trend);
          }
        } catch (err) {
          console.error("Error calculating MOM:", err);
          setMonthlyChange("+0.0%");
          setMomTrend("neutral");
        }
      } else {
        // No balance, show neutral
        setMonthlyChange("0.0%");
        setMomTrend("neutral");
      }
    };

    if (!accountsLoading && accounts.length > 0) {
      calculateMOM();
    }
  }, [displayedBalance, isDemo, accountsLoading, accounts.length, selectedFilter]);

  // Update last updated timestamp
  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const dateString = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      
      // Check if it's today
      const today = new Date();
      const isToday = 
        now.getDate() === today.getDate() &&
        now.getMonth() === today.getMonth() &&
        now.getFullYear() === today.getFullYear();
      
      setLastUpdatedAt(
        isToday ? `Today at ${timeString}` : `${dateString} at ${timeString}`
      );
    };

    updateTimestamp();
    // Update timestamp every minute
    const interval = setInterval(updateTimestamp, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch transaction data for the selected month
  useEffect(() => {
    const fetchMonthlyTransactions = async () => {
      try {
        setTransactionChartLoading(true);

        // Get start and end dates for the selected month
        const startOfMonth = new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth(),
          1
        );
        const endOfMonth = new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth() + 1,
          0
        );

        // Get number of days in the month
        const daysInMonth = endOfMonth.getDate();

        // Create date range filter
        const dateRange = {
          start: startOfMonth,
          end: endOfMonth,
        };

        // Find selected account ID if a specific account is selected
        let accountIdToFilter: string | undefined = undefined;
        if (selectedFilter !== "All" && selectedFilter !== "Add Account") {
          const selectedAccount = accounts.find(acc => acc.name === selectedFilter);
          if (selectedAccount) {
            accountIdToFilter = selectedAccount.id;
          }
        }

        // Fetch expense transactions
        const expenseFilters: TransactionFilters = {
          type: "expense",
          dateRange,
          accountId: accountIdToFilter,
        };
        const expenseTransactions = await fetchTransactions(expenseFilters, isDemo);

        // Fetch income transactions
        const incomeFilters: TransactionFilters = {
          type: "income",
          dateRange,
          accountId: accountIdToFilter,
        };
        const incomeTransactions = await fetchTransactions(incomeFilters, isDemo);

        // Fetch previous month data for comparison
        const previousMonthDate = new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth() - 1,
          1
        );
        const startOfPreviousMonth = new Date(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          1
        );
        const endOfPreviousMonth = new Date(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth() + 1,
          0
        );

        const previousDateRange = {
          start: startOfPreviousMonth,
          end: endOfPreviousMonth,
        };

        // Fetch previous month expenses
        const previousExpenseFilters: TransactionFilters = {
          type: "expense",
          dateRange: previousDateRange,
          accountId: accountIdToFilter,
        };
        const previousExpenseTransactions = await fetchTransactions(previousExpenseFilters, isDemo);

        // Fetch previous month income
        const previousIncomeFilters: TransactionFilters = {
          type: "income",
          dateRange: previousDateRange,
          accountId: accountIdToFilter,
        };
        const previousIncomeTransactions = await fetchTransactions(previousIncomeFilters, isDemo);

        // Calculate previous month totals
        const prevSpendTotal = previousExpenseTransactions.reduce((sum, tx) => sum + tx.amount, 0) / 1000;
        const prevIncomeTotal = previousIncomeTransactions.reduce((sum, tx) => sum + tx.amount, 0) / 1000;
        
        setPreviousSpendTotal(prevSpendTotal);
        setPreviousIncomeTotal(prevIncomeTotal);

        // Group transactions by day
        const spendByDay = new Map<number, number>();
        const incomeByDay = new Map<number, number>();

        // Initialize all days with 0
        for (let day = 1; day <= daysInMonth; day++) {
          spendByDay.set(day, 0);
          incomeByDay.set(day, 0);
        }

        // Aggregate expense amounts by day
        expenseTransactions.forEach(tx => {
          const day = new Date(tx.date).getDate();
          const current = spendByDay.get(day) || 0;
          spendByDay.set(day, current + tx.amount);
        });

        // Aggregate income amounts by day
        console.log(`\n💰 Processing ${incomeTransactions.length} income transactions:`);
        incomeTransactions.forEach((tx, index) => {
          const day = new Date(tx.date).getDate();
          const current = incomeByDay.get(day) || 0;
          incomeByDay.set(day, current + tx.amount);
          if (index < 5) {
            console.log(`  ${index + 1}. Day ${day}: ₹${tx.amount} - ${tx.name || tx.description?.substring(0, 30)}`);
          }
        });
        console.log(`💰 Total income transactions processed: ${incomeTransactions.length}\n`);

        // Convert to arrays (in thousands for display)
        const spendArray: number[] = [];
        const incomeArray: number[] = [];
        const labelsArray: string[] = [];
        const investedArray: number[] = []; // Placeholder for now

        for (let day = 1; day <= daysInMonth; day++) {
          spendArray.push((spendByDay.get(day) || 0) / 1000);
          incomeArray.push((incomeByDay.get(day) || 0) / 1000);
          investedArray.push(0); // TODO: Implement invested calculation
          labelsArray.push(day.toString());
        }

        // For monthly view, we would aggregate differently
        // For now, keeping it simple with daily data
        setSpendData(spendArray);
        setIncomeData(incomeArray);
        setInvestedData(investedArray);
        setTransactionLabels(labelsArray);

        const monthTitle = selectedMonth.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        
        const totalSpend = spendArray.reduce((a, b) => a + b, 0);
        const totalIncome = incomeArray.reduce((a, b) => a + b, 0);
        
        const filterInfo = accountIdToFilter 
          ? ` - Filter: ${selectedFilter} (${accountIdToFilter})` 
          : " - Filter: All Accounts";
        
        console.log(`📊 Transaction Data for ${monthTitle}${filterInfo}`);
        console.log(`├─ 💰 Expenses:`);
        console.log(`│  ├─ Current Month: ${expenseTransactions.length} transactions = ₹${totalSpend.toFixed(1)}K`);
        console.log(`│  ├─ Previous Month: ${previousExpenseTransactions.length} transactions = ₹${prevSpendTotal.toFixed(1)}K`);
        console.log(`│  ├─ Change: ${((totalSpend - prevSpendTotal) / prevSpendTotal * 100).toFixed(1)}%`);
        console.log(`│  └─ Sample:`, expenseTransactions.slice(0, 3).map(tx => ({
          date: new Date(tx.date).toLocaleDateString(),
          amount: `₹${tx.amount}`,
          desc: tx.description?.substring(0, 30)
        })));
        console.log(`├─ 📈 Income:`);
        console.log(`│  ├─ Current Month: ${incomeTransactions.length} transactions = ₹${totalIncome.toFixed(1)}K`);
        console.log(`│  ├─ Previous Month: ${previousIncomeTransactions.length} transactions = ₹${prevIncomeTotal.toFixed(1)}K`);
        console.log(`│  ├─ Change: ${((totalIncome - prevIncomeTotal) / prevIncomeTotal * 100).toFixed(1)}%`);
        console.log(`│  └─ Sample:`, incomeTransactions.slice(0, 3).map(tx => ({
          date: new Date(tx.date).toLocaleDateString(),
          amount: `₹${tx.amount}`,
          desc: tx.description?.substring(0, 30)
        })));
        console.log(`└─ 📊 Chart Data Points: ${spendArray.length} days`);
        
        // Validation check
        const dbExpenseTotal = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const dbIncomeTotal = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const chartExpenseTotal = totalSpend * 1000;
        const chartIncomeTotal = totalIncome * 1000;
        
        if (Math.abs(dbExpenseTotal - chartExpenseTotal) > 1) {
          console.warn(`⚠️ Expense mismatch! DB: ₹${dbExpenseTotal}, Chart: ₹${chartExpenseTotal}`);
        } else {
          console.log(`✅ Expense data verified: ₹${dbExpenseTotal}`);
        }
        
        if (Math.abs(dbIncomeTotal - chartIncomeTotal) > 1) {
          console.warn(`⚠️ Income mismatch! DB: ₹${dbIncomeTotal}, Chart: ₹${chartIncomeTotal}`);
        } else {
          console.log(`✅ Income data verified: ₹${dbIncomeTotal}`);
        }

      } catch (error) {
        console.error("Error fetching monthly transactions:", error);
        // Set empty data on error
        setSpendData([]);
        setIncomeData([]);
        setInvestedData([]);
        setTransactionLabels([]);
      } finally {
        setTransactionChartLoading(false);
      }
    };

    if (!accountsLoading && accounts.length >= 0) {
      fetchMonthlyTransactions();
    }
  }, [selectedMonth, isDemo, accountsLoading, chartPeriod, selectedFilter, accounts]);

  const getCurrentChartData = () => {
    return chartPeriod === "daily" ? DAILY_CHART_DATA : MONTHLY_CHART_DATA;
  };

  const getChartColor = () => CHART_COLORS[activeChart];

  const handleDataPointPress = (index: number, x: number, y: number) => {
    setSelectedDataPoint(index);
    setTooltipPosition({ x, y });
  };

  // Month navigation handlers
  const handleMonthChange = (direction: "prev" | "next") => {
    setSelectedMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Format selected month for display
  const getMonthTitle = () => {
    return selectedMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const CustomChart = () => {
    const chartWidth = screenWidth - 40;
    const currentData = getCurrentChartData();
    const labels = currentData.map((d) => d.date);
    const dataset = currentData.map((d) => d[activeChart] / 1000);
    const lineColor = getChartColor();

    return (
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: dataset,
              color: () => lineColor,
              strokeWidth: 2,
            },
          ],
        }}
        width={chartWidth}
        height={180}
        withInnerLines={true}
        withOuterLines={false}
        withDots={true}
        withShadow={false}
        bezier
        chartConfig={{
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          color: () => colors.text,
          labelColor: () => colors.textSecondary,
          propsForDots: {
            r: "3",
            strokeWidth: "1.5",
            stroke: colors.background,
          },
          propsForBackgroundLines: {
            stroke: colors.border,
            strokeOpacity: 0.2,
          },
        }}
        style={{ borderRadius: 16, marginVertical: 4 }}
        formatYLabel={(v) =>
          `₹${Number(v).toFixed(chartPeriod === "daily" ? 1 : 0)}K`
        }
      />
    );
  };

  const renderFilterButton = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    // Find the bank account to get its balance
    const bankAccount = accounts.find((acc) => acc.name === item);
    const bankAmount = bankAccount
      ? formatBankAmount(bankAccount.balance)
      : null;

    // Remove " Bank" suffix from display name
    const displayName = item.replace(" Bank", "");

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.filterButton,
          {
            backgroundColor:
              selectedFilter === item ? colors.primary : colors.card,
            borderColor: colors.border,
          },
          item === "Add Account" && { backgroundColor: colors.primary },
        ]}
        onPress={() => setSelectedFilter(item)}
      >
        {item === "Add Account" && (
          <Ionicons
            name="add"
            size={14}
            color="white"
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={[
            styles.filterButtonText,
            {
              color:
                selectedFilter === item || item === "Add Account"
                  ? "white"
                  : colors.text,
            },
          ]}
        >
          {displayName}
        </Text>
        {bankAmount && (
          <Text
            style={[
              styles.filterBankAmount,
              {
                color: selectedFilter === item ? "white" : "#10B981",
              },
            ]}
          >
            {bankAmount}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderAccountItem = ({ item }: { item: BankAccount }) => (
    <View style={styles.accountItem}>
      <View
        style={[styles.accountIcon, { backgroundColor: `${item.color}20` }]}
      >
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.accountInfo}>
        <Text style={[styles.accountName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.accountBalance, { color: colors.textSecondary }]}>
          ₹{(item.balance / 1000).toFixed(1)}K • {item.percentage}%
        </Text>
      </View>
    </View>
  );

  return (
    <>
      {!hideHeaderAndNav && (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.card, borderBottomColor: colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Money
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                Manage your accounts and cards
              </Text>
            </View>
          </View>

          {/* Full Width Navigation Buttons */}
          <View
            style={[
              styles.fullNavContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[styles.fullNavButtonGroup, { backgroundColor: colors.card }]}
            >
              <TouchableOpacity
                style={[
                  styles.fullNavButton,
                  styles.activeFullNav,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="wallet" size={14} color="white" />
                <Text style={[styles.fullNavText, { color: "white" }]}>
                  Accounts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fullNavButton]}
                onPress={() => (navigation as any).navigate("MobileCredit")}
              >
                <Ionicons name="card" size={14} color={colors.textSecondary} />
                <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
                  Credit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fullNavButton]}
                onPress={() => (navigation as any).navigate("MobileNetWorth")}
              >
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
                  Net
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={hideHeaderAndNav ? { flex: 1 } : [styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Inline Filter Row: label + chips on a single line */}
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>
            Filter by:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter, index) =>
              renderFilterButton({ item: filter, index })
            )}
          </ScrollView>
        </View>

        {/* Combined Balance and Distribution Card */}
        <View style={[styles.combinedCard, { backgroundColor: colors.card }]}>
          <View style={styles.balanceTitleRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons name="tv-outline" size={16} color={colors.text} />
              <Text style={[styles.balanceTitle, { color: colors.text }]}>
                Accounts ({accounts.length})
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {/* Only show distribution button when "All" is selected and there are multiple accounts */}
              {selectedFilter === "All" && accounts.length > 1 && (
                <TouchableOpacity
                  onPress={() =>
                    setIsDistributionExpanded(!isDistributionExpanded)
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    backgroundColor: `${colors.primary}15`,
                  }}
                >
                  <Ionicons name="pie-chart" size={14} color={colors.primary} />
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Distribution
                  </Text>
                  <Ionicons
                    name={
                      isDistributionExpanded ? "chevron-up" : "chevron-down"
                    }
                    size={14}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginTop: 2,
            }}
          >
            <Text
              style={[
                styles.balanceAmount,
                { color: colors.text, fontSize: 28, marginRight: 8 },
              ]}
            >
              ₹
              {displayedBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>

            {/* Real MoM calculation from accountBalanceHistoryService */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
                backgroundColor: 
                  momTrend === "up" 
                    ? "#05966920" 
                    : momTrend === "down" 
                    ? "#DC262620" 
                    : "#3B82F620",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Ionicons
                name={
                  momTrend === "up" 
                    ? "trending-up" 
                    : momTrend === "down" 
                    ? "trending-down" 
                    : "remove"
                }
                size={11}
                color={
                  momTrend === "up" 
                    ? "#059669" 
                    : momTrend === "down" 
                    ? "#DC2626" 
                    : "#3B82F6"
                }
                style={{ marginRight: 3 }}
              />
              <Text
                style={{ 
                  color: momTrend === "up" 
                    ? "#059669" 
                    : momTrend === "down" 
                    ? "#DC2626" 
                    : "#3B82F6", 
                  fontSize: 11, 
                  fontWeight: "600" 
                }}
              >
                {monthlyChange}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 4, marginBottom: 10 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              Last updated: {lastUpdatedAt || "Loading..."}
            </Text>
          </View>

          {/* Account Balance Trend Chart */}
          <View
            style={{
              marginTop: 0,
              marginBottom: 4,
              height: 180,
              backgroundColor: colors.card,
              position: "relative",
            }}
          >
            {chartLoading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Loading chart...
                </Text>
              </View>
            ) : historicalChartData.length > 0 && 
               historicalChartLabels.length > 0 &&
               historicalChartData.length === historicalChartLabels.length ? (
              <>
                <ReusableLineChart
                  data={historicalChartData}
                  labels={historicalChartLabels}
                  width={screenWidth - 72}
                  height={150}
                  color={
                    momTrend === "up" 
                      ? "#059669" 
                      : momTrend === "down" 
                      ? "#DC2626" 
                      : "#22C55E"
                  }
                  backgroundColor={colors.card}
                  textColor={colors.text}
                  secondaryTextColor={colors.textSecondary}
                  borderColor={colors.border}
                  showYAxisLabels={true}
                  showXAxisLabels={true}
                  formatYLabel={(v) => {
                    const numValue = Number(v);
                    return !isNaN(numValue) && isFinite(numValue) 
                      ? `₹${numValue.toFixed(1)}L` 
                      : "₹0.0L";
                  }}
                  dotRadius={3}
                  lineThickness={2}
                  gridOpacity={0.2}
                  onPointClick={(index, x, y) => {
                    setAccountChartDataPoint(index);
                    setAccountChartTooltipPos({ x, y });
                  }}
                />

                {/* Tooltip for Account Chart */}
                {accountChartDataPoint !== null && 
                 accountChartDataPoint >= 0 && 
                 accountChartDataPoint < historicalChartData.length &&
                 !isNaN(historicalChartData[accountChartDataPoint]) &&
                 isFinite(historicalChartData[accountChartDataPoint]) && (
                  <ChartTooltip
                    x={accountChartTooltipPos.x}
                    y={accountChartTooltipPos.y}
                    value={historicalChartData[accountChartDataPoint]}
                    label={historicalChartLabels[accountChartDataPoint]}
                    color={
                      momTrend === "up" 
                        ? "#059669" 
                        : momTrend === "down" 
                        ? "#DC2626" 
                        : "#22C55E"
                    }
                    backgroundColor={colors.card}
                    textColor={colors.text}
                    borderColor={colors.border}
                    prefix="₹"
                    suffix="L"
                  />
                )}
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Ionicons 
                  name="bar-chart-outline" 
                  size={32} 
                  color={colors.textSecondary}
                  style={{ marginBottom: 8, opacity: 0.5 }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  No historical data available
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                  {selectedFilter !== "All" 
                    ? `No history for ${selectedFilter}` 
                    : "No account history found"}
                </Text>
              </View>
            )}
          </View>

          {/* Account Distribution Section - Dashboard Style */}
          {/* Only show distribution when "All" is selected, there are multiple accounts, and it's expanded */}
          {selectedFilter === "All" &&
            accounts.length > 1 &&
            isDistributionExpanded && (
              <View
                style={{
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: `${colors.border}50`,
                  marginTop: 8,
                }}
              >
                <View style={styles.distributionContent}>
                  {/* Polar Chart */}
                  <View style={styles.donutContainer}>
                    <PolarChart
                      data={sortedAccounts
                        .filter((account) => account.balance > 0)
                        .map((account) => ({
                          name: account.name.replace(" Bank", ""),
                          value: account.balance,
                          color: account.color,
                          percentage: account.percentage,
                        }))}
                      size={screenWidth - 40}
                      innerRadius={75}
                      outerRadius={125}
                      centerText={`${(realTotalBalance / 100000).toFixed(1)}L`}
                      centerSubtext="Total"
                      textColor={colors.text}
                      backgroundColor={colors.card}
                    />
                  </View>

                  {/* Interactive Account List with Percentage Bars */}
                  <View style={styles.accountsList}>
                    <View style={styles.accountListHeader}>
                      <Text
                        style={[
                          styles.accountListHeaderText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Account
                      </Text>
                      <Text
                        style={[
                          styles.accountListHeaderText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Balance
                      </Text>
                      <Text
                        style={[
                          styles.accountListHeaderText,
                          { color: colors.textSecondary, textAlign: "right" },
                        ]}
                      >
                        Share
                      </Text>
                    </View>

                    {accounts.length === 0 ? (
                      <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateIcon}>
                          <Ionicons
                            name="wallet-outline"
                            size={32}
                            color={`${colors.primary}80`}
                          />
                        </View>
                        <Text
                          style={[
                            styles.emptyStateTitle,
                            { color: colors.text },
                          ]}
                        >
                          No accounts yet
                        </Text>
                        <Text
                          style={[
                            styles.emptyStateMessage,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Add your first bank account to start tracking your
                          finances
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.emptyStateButton,
                            { backgroundColor: colors.primary },
                          ]}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="add" size={16} color="white" />
                          <Text style={styles.emptyStateButtonText}>
                            Add Account
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      sortedAccounts.map((account) => (
                        <TouchableOpacity
                          key={account.id}
                          style={[
                            styles.enhancedAccountItem,
                            selectedBank === account.name &&
                              styles.selectedAccountItem,
                          ]}
                          activeOpacity={0.7}
                          onPress={() =>
                            setSelectedBank(
                              selectedBank === account.name
                                ? null
                                : account.name
                            )
                          }
                        >
                          <View style={styles.accountItemHeader}>
                            <View style={styles.accountNameSection}>
                              <View
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  backgroundColor: account.color,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginRight: 6,
                                }}
                              >
                                <Ionicons
                                  name={account.icon as any}
                                  size={14}
                                  color="white"
                                />
                              </View>
                              <Text
                                style={[
                                  styles.accountName,
                                  { color: colors.text },
                                ]}
                                numberOfLines={1}
                              >
                                {account.name}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.accountBalance,
                                { color: colors.text },
                              ]}
                            >
                              ₹{(account.balance / 1000).toFixed(1)}K
                            </Text>
                            <View style={styles.accountPercentage}>
                              <Text
                                style={[
                                  styles.percentageText,
                                  { color: account.color },
                                ]}
                              >
                                {account.percentage}%
                              </Text>
                            </View>
                          </View>

                          <View style={styles.percentageBarContainer}>
                            <View
                              style={[
                                styles.percentageBar,
                                {
                                  width: `${account.percentage}%`,
                                  backgroundColor: account.color,
                                  opacity:
                                    selectedBank === account.name ? 1 : 0.7,
                                },
                              ]}
                            />
                          </View>

                          {selectedBank === account.name && (
                            <View style={styles.quickActions}>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="eye-outline"
                                  size={16}
                                  color={colors.primary}
                                />
                                <Text
                                  style={[
                                    styles.actionText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  View
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="arrow-up-outline"
                                  size={16}
                                  color={colors.primary}
                                />
                                <Text
                                  style={[
                                    styles.actionText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  Transfer
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="pencil-outline"
                                  size={16}
                                  color={colors.primary}
                                />
                                <Text
                                  style={[
                                    styles.actionText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  Edit
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>

                  <View style={styles.distributionFooter}>
                    <TouchableOpacity style={styles.footerButton}>
                      <Ionicons
                        name="arrow-down-circle-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.footerButtonText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Export
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.sortContainer}>
                      <Text
                        style={[
                          styles.sortLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Sort by:
                      </Text>
                      <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() =>
                          setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                        }
                      >
                        <Text
                          style={[
                            styles.sortButtonText,
                            { color: colors.text },
                          ]}
                        >
                          Balance
                        </Text>
                        <Ionicons
                          name={
                            sortOrder === "desc" ? "chevron-down" : "chevron-up"
                          }
                          size={14}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
        </View>

        {/* Month Navigation - Using MonthlyChart Component */}
        <View
          style={[
            styles.monthCard,
            {
              backgroundColor: colors.card,
              marginHorizontal: 16,
              marginVertical: 10,
            },
          ]}
        >
          {transactionChartLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Loading transactions...
              </Text>
            </View>
          ) : (
            <MonthlyChart
                data={{
                  spend: spendData.length > 0 ? spendData : [0],
                  invested: investedData.length > 0 ? investedData : [0],
                  income: incomeData.length > 0 ? incomeData : [0],
                }}
                labels={transactionLabels.length > 0 ? transactionLabels : ["1"]}
                activeChart={activeChart}
                chartPeriod={chartPeriod}
                title={getMonthTitle()}
                width={screenWidth - 32}
                height={220}
                backgroundColor={colors.card}
                textColor={colors.text}
                secondaryTextColor={colors.textSecondary}
                borderColor={colors.border}
                noPadding={false}
                onDataPointClick={(index, x, y) => {
                  setSelectedDataPoint(index);
                  setTooltipPosition({ x, y });
                }}
                onChartTypeChange={setActiveChart}
                onPeriodChange={setChartPeriod}
                onMonthChange={handleMonthChange}
                selectedBank={selectedBank}
                bankAmount={
                  selectedBank
                    ? formatBankAmount(
                        accounts.find((acc) => acc.name === selectedBank)
                          ?.balance || 0
                      )
                    : undefined
                }
                previousMonthData={{
                  spend: previousSpendTotal,
                  invested: 0,
                  income: previousIncomeTotal,
                }}
                chartColors={{
                  spend: "#EF4444",
                  invested: "#3B82F6",
                  income: "#22C55E",
                }}
                formatYLabel={(v) => `₹${v}K`}
              />
          )}
        </View>
      </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  fullNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fullNavButtonGroup: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 5,
  },
  activeFullNav: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  fullNavText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 12,
  },
  filtersScroll: {
    flexGrow: 1,
  },
  filtersContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterBankAmount: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  combinedCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  // balanceHeader styles replaced by inline styles
  balanceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  balanceTimeText: {
    fontSize: 12,
  },
  chartPreview: {
    alignItems: "center",
  },
  chartRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  chartSegment: {
    height: 4,
    borderRadius: 2,
    marginVertical: 1,
  },
  accountCount: {
    fontSize: 12,
  },
  kpiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  kpiPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  kpiText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // sparklineContainer removed in favor of full-width chart
  distributionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  distributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  distributionContent: {
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  donutChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F59E0B",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  donutSegment: {
    position: "absolute",
    width: "100%",
    borderRadius: 100,
  },
  donutCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  donutCenterAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  donutCenterLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  accountsList: {
    marginTop: 12,
  },
  enhancedAccountItem: {
    marginBottom: 6,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  selectedAccountItem: {
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 10,
  },
  accountItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  accountNameSection: {
    flexDirection: "row",
    alignItems: "center",
    width: "40%",
  },
  accountListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 3,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  accountListHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    width: "33%",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  accountIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  accountPercentage: {
    alignItems: "flex-end",
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "700",
  },
  percentageBarContainer: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  percentageBar: {
    height: "100%",
    borderRadius: 3,
  },
  addAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addAccountText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "600",
  },
  distributionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  footerButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLegend: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  chartLegendTitle: {
    fontSize: 10,
    opacity: 0.7,
    marginBottom: 0,
  },
  chartLegendValue: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  donutContainer: {
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 0,
  },
  accountInfo: {
    flex: 1,
    paddingRight: 8,
  },
  accountName: {
    fontSize: 13,
    fontWeight: "600",
  },
  accountBalance: {
    fontSize: 13,
    fontWeight: "500",
    width: "30%",
  },
  monthCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden", // Ensure chart content doesn't overflow the card
    padding: 0, // Remove padding to allow chart to fill the card
  },
});

export default MobileAccounts;
