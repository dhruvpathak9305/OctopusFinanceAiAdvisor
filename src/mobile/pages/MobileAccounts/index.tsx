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
  ACCOUNT_BALANCE_TREND,
  ACCOUNT_BALANCE_LABELS,
} from "./utils";
import { BankAccount, ChartDataPoint } from "./types";
import { useRealAccountsData } from "./useRealAccountsData";

const MobileAccounts: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
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

  const getCurrentChartData = () => {
    return chartPeriod === "daily" ? DAILY_CHART_DATA : MONTHLY_CHART_DATA;
  };

  const getChartColor = () => CHART_COLORS[activeChart];

  const handleDataPointPress = (index: number, x: number, y: number) => {
    setSelectedDataPoint(index);
    setTooltipPosition({ x, y });
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
                color: "#10B981",
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
            <Ionicons name="wallet" size={16} color="white" />
            <Text style={[styles.fullNavText, { color: "white" }]}>
              Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate("MobileCredit")}
          >
            <Ionicons name="card" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Credit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="trending-up"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Net
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
                backgroundColor: "#10B98120",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Ionicons
                name="trending-up"
                size={11}
                color="#10B981"
                style={{ marginRight: 3 }}
              />
              <Text
                style={{ color: "#10B981", fontSize: 11, fontWeight: "600" }}
              >
                +2.8%
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 4, marginBottom: 10 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              Last updated: Today at 4:57 PM
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
            <ReusableLineChart
              data={ACCOUNT_BALANCE_TREND}
              labels={ACCOUNT_BALANCE_LABELS}
              width={screenWidth - 72}
              height={150}
              color="#22C55E"
              backgroundColor={colors.card}
              textColor={colors.text}
              secondaryTextColor={colors.textSecondary}
              borderColor={colors.border}
              showYAxisLabels={true}
              showXAxisLabels={true}
              formatYLabel={(v) => `₹${v}L`}
              dotRadius={3}
              lineThickness={2}
              gridOpacity={0.2}
              onPointClick={(index, x, y) => {
                setAccountChartDataPoint(index);
                setAccountChartTooltipPos({ x, y });
              }}
            />

            {/* Tooltip for Account Chart */}
            {accountChartDataPoint !== null && accountChartDataPoint >= 0 && (
              <ChartTooltip
                x={accountChartTooltipPos.x}
                y={accountChartTooltipPos.y}
                value={ACCOUNT_BALANCE_TREND[accountChartDataPoint]}
                label={ACCOUNT_BALANCE_LABELS[accountChartDataPoint]}
                color="#22C55E"
                backgroundColor={colors.card}
                textColor={colors.text}
                borderColor={colors.border}
                prefix="₹"
                suffix="L"
              />
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
          <MonthlyChart
            data={{
              spend:
                chartPeriod === "daily"
                  ? DAILY_CHART_DATA.map((d: ChartDataPoint) => d.spend / 1000)
                  : MONTHLY_CHART_DATA.map(
                      (d: ChartDataPoint) => d.spend / 1000
                    ),
              invested:
                chartPeriod === "daily"
                  ? DAILY_CHART_DATA.map(
                      (d: ChartDataPoint) => d.invested / 1000
                    )
                  : MONTHLY_CHART_DATA.map(
                      (d: ChartDataPoint) => d.invested / 1000
                    ),
              income:
                chartPeriod === "daily"
                  ? DAILY_CHART_DATA.map((d: ChartDataPoint) => d.income / 1000)
                  : MONTHLY_CHART_DATA.map(
                      (d: ChartDataPoint) => d.income / 1000
                    ),
            }}
            labels={
              chartPeriod === "daily"
                ? DAILY_CHART_DATA.map((d: ChartDataPoint) => d.date)
                : MONTHLY_CHART_DATA.map((d: ChartDataPoint) => d.date)
            }
            activeChart={activeChart}
            chartPeriod={chartPeriod}
            title="August 2025"
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
            onMonthChange={(direction) => {
              console.log(`Month changed: ${direction}`);
              // In a real app, this would update the current month
            }}
            selectedBank={selectedBank}
            bankAmount={
              selectedBank
                ? formatBankAmount(
                    accounts.find((acc) => acc.name === selectedBank)
                      ?.balance || 0
                  )
                : undefined
            }
            chartColors={{
              spend: "#EF4444",
              invested: "#3B82F6",
              income: "#22C55E",
            }}
            formatYLabel={(v) => `₹${v}K`}
          />
        </View>
      </ScrollView>
    </View>
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
    paddingVertical: 16,
  },
  fullNavButtonGroup: {
    flexDirection: "row",
    borderRadius: 25,
    padding: 4,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeFullNav: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullNavText: {
    fontSize: 14,
    fontWeight: "600",
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
