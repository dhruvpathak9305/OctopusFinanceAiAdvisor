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
import { LineChart, PieChart } from "react-native-chart-kit";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { MonthlyChart } from "../../components/charts";
import {
  DAILY_CHART_DATA,
  MONTHLY_CHART_DATA,
  ACCOUNTS_DATA,
  FILTER_OPTIONS,
  CHART_COLORS,
  formatBankAmount,
} from "./utils";
import { BankAccount, ChartDataPoint } from "./types";

const MobileAccounts: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isDistributionExpanded, setIsDistributionExpanded] = useState(true);
  const [activeChart, setActiveChart] = useState<
    "spend" | "invested" | "income"
  >("spend");
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"daily" | "monthly">("daily");

  const screenWidth = Dimensions.get("window").width;

  // Use imported data
  const accounts = ACCOUNTS_DATA;
  const filters = FILTER_OPTIONS;

  const getCurrentChartData = () => {
    return chartPeriod === "daily" ? DAILY_CHART_DATA : MONTHLY_CHART_DATA;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
          {/* Dashboard style Total Balance Header */}
          <View>
            <View style={styles.balanceTitleRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons name="tv-outline" size={16} color={colors.text} />
                <Text style={[styles.balanceTitle, { color: colors.text }]}>
                  Accounts ({accounts.length})
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="add-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
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
                  { color: colors.text, fontSize: 28, marginRight: 6 },
                ]}
              >
                ₹{(totalBalance / 100000).toFixed(0)}L
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Ionicons
                  name="trending-up"
                  size={12}
                  color="#22C55E"
                  style={{ marginRight: 2 }}
                />
                <Text
                  style={{ color: "#22C55E", fontSize: 12, fontWeight: "500" }}
                >
                  +2.8% from last month
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 4, marginBottom: 10 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                Last updated: Today at 4:57 PM
              </Text>
            </View>

            {/* Full-width chart - Custom implementation */}
            <View
              style={{
                marginTop: 0,
                marginBottom: 4,
                height: 150,
                overflow: "hidden",
                backgroundColor: colors.card,
              }}
            >
              {/* Custom chart implementation for better control */}
              <View
                style={{
                  flex: 1,
                  paddingTop: 8,
                  paddingBottom: 16,
                  paddingLeft: 30,
                  paddingRight: 5,
                }}
              >
                {/* Horizontal grid lines */}
                <View
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 5,
                    top: 15,
                    height: 1,
                    backgroundColor: `${colors.border}30`,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 5,
                    top: 45,
                    height: 1,
                    backgroundColor: `${colors.border}30`,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 5,
                    top: 75,
                    height: 1,
                    backgroundColor: `${colors.border}30`,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 5,
                    top: 105,
                    height: 1,
                    backgroundColor: `${colors.border}30`,
                  }}
                />

                {/* Y-axis labels */}
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    bottom: 16,
                    left: 0,
                    width: 30,
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      color: colors.textSecondary,
                      textAlign: "right",
                      paddingRight: 3,
                    }}
                  >
                    ₹5.5L
                  </Text>
                  <Text
                    style={{
                      fontSize: 7,
                      color: colors.textSecondary,
                      textAlign: "right",
                      paddingRight: 3,
                    }}
                  >
                    ₹5.0L
                  </Text>
                  <Text
                    style={{
                      fontSize: 7,
                      color: colors.textSecondary,
                      textAlign: "right",
                      paddingRight: 3,
                    }}
                  >
                    ₹4.5L
                  </Text>
                  <Text
                    style={{
                      fontSize: 7,
                      color: colors.textSecondary,
                      textAlign: "right",
                      paddingRight: 3,
                    }}
                  >
                    ₹4.0L
                  </Text>
                </View>

                {/* X-axis month labels */}
                <View
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 5,
                    bottom: 0,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>
                    Feb
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>
                    Apr
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>
                    Jun
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>
                    Aug
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>
                    Oct
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>
                    Dec
                  </Text>
                </View>

                {/* The green curved line */}
                <View
                  style={{
                    position: "absolute",
                    width: "90%",
                    height: 2,
                    backgroundColor: "#22C55E",
                    top: 60,
                    left: 30,
                    borderRadius: 1,
                  }}
                />

                {/* Custom curve path simulation with varying heights */}
                <View
                  style={{
                    position: "absolute",
                    left: 30,
                    right: 5,
                    top: 8,
                    bottom: 16,
                    flexDirection: "row",
                  }}
                >
                  <View style={{ flex: 1, position: "relative" }}>
                    <View
                      style={{
                        position: "absolute",
                        left: "0%",
                        top: 100,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "10%",
                        top: 90,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "20%",
                        top: 70,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "30%",
                        top: 40,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "40%",
                        top: 60,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 50,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "60%",
                        top: 80,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "70%",
                        top: 65,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "80%",
                        top: 40,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: "90%",
                        top: 25,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#22C55E",
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Account Distribution Section - Dashboard Style */}
          <View
            style={{
              paddingTop: 2,
              paddingBottom: 0,
              borderTopWidth: 1,
              borderTopColor: `${colors.border}50`,
              marginTop: 2,
            }}
          >
            <TouchableOpacity
              style={[styles.distributionHeader, { paddingVertical: 4 }]}
              onPress={() => setIsDistributionExpanded(!isDistributionExpanded)}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="pie-chart" size={14} color="white" />
                </View>
                <Text
                  style={[styles.distributionTitle, { color: colors.text }]}
                >
                  Account Distribution
                </Text>
              </View>
              <Ionicons
                name={isDistributionExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {isDistributionExpanded && (
            <View style={styles.distributionContent}>
              {/* Interactive Donut Chart with Animation */}
              <View style={styles.donutContainer}>
                <View style={styles.chartLegend}>
                  <Text
                    style={[styles.chartLegendTitle, { color: colors.text }]}
                  >
                    Total Balance
                  </Text>
                  <Text
                    style={[styles.chartLegendValue, { color: colors.text }]}
                  >
                    ₹{(totalBalance / 100000).toFixed(1)}L
                  </Text>
                </View>
                <PieChart
                  data={[
                    {
                      name: "HDFC",
                      population: 60,
                      color: "#F59E0B",
                      legendFontColor: colors.textSecondary,
                      legendFontSize: 12,
                      gradientCenterColor: "#FCD34D",
                    },
                    {
                      name: "Axis",
                      population: 20,
                      color: "#8B5CF6",
                      legendFontColor: colors.textSecondary,
                      legendFontSize: 12,
                      gradientCenterColor: "#A78BFA",
                    },
                    {
                      name: "ICICI",
                      population: 20,
                      color: "#EF4444",
                      legendFontColor: colors.textSecondary,
                      legendFontSize: 12,
                      gradientCenterColor: "#FCA5A5",
                    },
                  ]}
                  width={screenWidth - 50}
                  height={120}
                  chartConfig={{
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    color: () => colors.text,
                    labelColor: () => colors.text,
                    strokeWidth: 2,
                    decimalPlaces: 0,
                    propsForLabels: {
                      fontSize: "10",
                    },
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="10"
                  hasLegend={false}
                  center={[0, 0]}
                  absolute
                  avoidFalseZero
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
                      style={[styles.emptyStateTitle, { color: colors.text }]}
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
                  accounts.map((account) => (
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
                          selectedBank === account.name ? null : account.name
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
                            style={[styles.accountName, { color: colors.text }]}
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
                              opacity: selectedBank === account.name ? 1 : 0.7,
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

              <TouchableOpacity
                style={[
                  styles.addAccountButton,
                  { borderColor: `${colors.primary}40` },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={18} color={colors.primary} />
                <Text
                  style={[styles.addAccountText, { color: colors.primary }]}
                >
                  Add New Account
                </Text>
              </TouchableOpacity>

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
                    style={[styles.sortLabel, { color: colors.textSecondary }]}
                  >
                    Sort by:
                  </Text>
                  <TouchableOpacity style={styles.sortButton}>
                    <Text
                      style={[styles.sortButtonText, { color: colors.text }]}
                    >
                      Balance
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
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
