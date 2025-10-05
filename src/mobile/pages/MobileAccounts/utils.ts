import { useState } from "react";
import { Dimensions } from "react-native";
import { BankAccount, ChartDataPoint, ChartPeriod, ChartType } from "./types";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Sample bank accounts data
 */
export const ACCOUNTS_DATA: BankAccount[] = [
  {
    id: "1",
    name: "Axis Bank",
    balance: 100000,
    percentage: 20,
    color: "#8B5CF6",
    icon: "trending-up",
  },
  {
    id: "2",
    name: "HDFC Bank",
    balance: 300000,
    percentage: 60,
    color: "#F59E0B",
    icon: "add",
  },
  {
    id: "3",
    name: "ICICI Bank",
    balance: 100000,
    percentage: 20,
    color: "#EF4444",
    icon: "information",
  },
];

/**
 * Filter options for accounts
 */
export const FILTER_OPTIONS = [
  "All",
  "Axis Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Add Account",
];

/**
 * Chart color mapping by chart type
 */
export const CHART_COLORS = {
  spend: "#EF4444",
  invested: "#3B82F6",
  income: "#22C55E",
};

/**
 * 30 days of daily chart data
 */
export const DAILY_CHART_DATA: ChartDataPoint[] = [
  { date: "1", spend: 2700, invested: 900, income: 0 },
  { date: "2", spend: 1800, invested: 1200, income: 0 },
  { date: "3", spend: 3200, invested: 3600, income: 50000 },
  { date: "4", spend: 2100, invested: 800, income: 0 },
  { date: "5", spend: 2500, invested: 900, income: 0 },
  { date: "6", spend: 3800, invested: 1500, income: 0 },
  { date: "7", spend: 4200, invested: 2700, income: 0 },
  { date: "8", spend: 1900, invested: 1100, income: 0 },
  { date: "9", spend: 3800, invested: 2400, income: 0 },
  { date: "10", spend: 2200, invested: 1800, income: 0 },
  { date: "11", spend: 1500, invested: 3200, income: 0 },
  { date: "12", spend: 3400, invested: 1600, income: 0 },
  { date: "13", spend: 4500, invested: 900, income: 0 },
  { date: "14", spend: 2800, invested: 2100, income: 0 },
  { date: "15", spend: 1200, invested: 1400, income: 0 },
  { date: "16", spend: 3600, invested: 1900, income: 0 },
  { date: "17", spend: 5200, invested: 3600, income: 0 },
  { date: "18", spend: 2900, invested: 1300, income: 0 },
  { date: "19", spend: 4800, invested: 2900, income: 0 },
  { date: "20", spend: 2100, invested: 1700, income: 0 },
  { date: "21", spend: 3300, invested: 2200, income: 0 },
  { date: "22", spend: 3000, invested: 1800, income: 0 },
  { date: "23", spend: 4100, invested: 2500, income: 0 },
  { date: "24", spend: 1700, invested: 1000, income: 0 },
  { date: "25", spend: 2400, invested: 2700, income: 0 },
  { date: "26", spend: 3900, invested: 1400, income: 0 },
  { date: "27", spend: 2600, invested: 1900, income: 0 },
  { date: "28", spend: 4200, invested: 3100, income: 0 },
  { date: "29", spend: 3100, invested: 2300, income: 0 },
  { date: "30", spend: 1800, invested: 3000, income: 0 },
];

/**
 * 12 months of monthly chart data
 */
export const MONTHLY_CHART_DATA: ChartDataPoint[] = [
  { date: "Oct", spend: 62000, invested: 55000, income: 0 },
  { date: "Nov", spend: 45000, invested: 48000, income: 0 },
  { date: "Dec", spend: 52000, invested: 42000, income: 0 },
  { date: "Jan", spend: 48000, invested: 51000, income: 0 },
  { date: "Feb", spend: 35000, invested: 63000, income: 0 },
  { date: "Mar", spend: 58000, invested: 39000, income: 0 },
  { date: "Apr", spend: 41000, invested: 67000, income: 0 },
  { date: "May", spend: 55000, invested: 44000, income: 0 },
  { date: "Jun", spend: 73000, invested: 71000, income: 0 },
  { date: "Jul", spend: 67000, invested: 52000, income: 0 },
  { date: "Aug", spend: 62000, invested: 64000, income: 68100 },
  { date: "Sep", spend: 42000, invested: 64000, income: 68100 },
];

/**
 * Account balance trend data for the line chart
 */
export const ACCOUNT_BALANCE_TREND = [
  4.5, 4.6, 4.7, 4.8, 4.9, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.0,
];

/**
 * X-axis labels for the account balance trend chart
 */
export const ACCOUNT_BALANCE_LABELS = [
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
  "Jan",
];

/**
 * Hook for managing account data and state
 */
export const useAccountData = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isDistributionExpanded, setIsDistributionExpanded] = useState(true);
  const [activeChart, setActiveChart] = useState<ChartType>("spend");
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("daily");

  /**
   * Get the current chart data based on the selected period
   */
  const getCurrentChartData = () => {
    return chartPeriod === "daily" ? DAILY_CHART_DATA : MONTHLY_CHART_DATA;
  };

  /**
   * Calculate the total balance from all accounts
   */
  const totalBalance = ACCOUNTS_DATA.reduce((sum, acc) => sum + acc.balance, 0);

  /**
   * Format the total balance in lakhs (L)
   */
  const totalBalanceL = (totalBalance / 100000).toFixed(1);

  /**
   * Monthly percentage change in balance
   */
  const monthlyChange = 2.8; // Sample value, could be calculated from historical data

  /**
   * Get the chart color based on the active chart type
   */
  const getChartColor = () => CHART_COLORS[activeChart];

  /**
   * Handle data point click/press in the chart
   */
  const handleDataPointPress = (index: number, x: number, y: number) => {
    setSelectedDataPoint(index);
    setTooltipPosition({ x, y });
  };

  /**
   * Filter accounts based on the selected filter
   */
  const filteredAccounts =
    selectedFilter === "All"
      ? ACCOUNTS_DATA
      : ACCOUNTS_DATA.filter((account) => account.name === selectedFilter);

  return {
    selectedFilter,
    setSelectedFilter,
    isDistributionExpanded,
    setIsDistributionExpanded,
    activeChart,
    setActiveChart,
    selectedDataPoint,
    setSelectedDataPoint,
    tooltipPosition,
    setTooltipPosition,
    selectedBank,
    setSelectedBank,
    chartPeriod,
    setChartPeriod,
    accounts: ACCOUNTS_DATA,
    filters: FILTER_OPTIONS,
    filteredAccounts,
    totalBalance,
    totalBalanceL,
    monthlyChange,
    getCurrentChartData,
    getChartColor,
    handleDataPointPress,
    screenWidth,
  };
};

/**
 * Format a currency value in lakhs (L) or thousands (K)
 */
export const formatCurrency = (
  value: number,
  format: "L" | "K" = "K",
  decimals: number = 1
) => {
  if (format === "L") {
    return `₹${(value / 100000).toFixed(decimals)}L`;
  }
  return `₹${(value / 1000).toFixed(decimals)}K`;
};

/**
 * Get the last updated timestamp string
 */
export const getLastUpdatedString = () => {
  return "Today at 4:57 PM";
};

/**
 * Format bank amount with appropriate suffix (K, L, Cr)
 */
export const formatBankAmount = (amount: number): string => {
  if (amount >= 10000000) {
    // 1 Crore or more
    return `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    // 1 Lakh or more
    return `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    // 1 Thousand or more
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return `${amount}`;
};
