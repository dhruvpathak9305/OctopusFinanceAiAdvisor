import { useState } from "react";
import { Dimensions } from "react-native";
import { BankAccount, ChartDataPoint, ChartPeriod, ChartType } from "./types";
import { generateColorShade } from "../../../../utils/colors/SubcategoryColorGenerator";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Application theme colors for charts
 * Using green, teal, and golden shades
 */
export const THEME_COLORS = {
  green: "#10B981", // Primary green
  teal: "#14B8A6", // Teal/cyan
  golden: "#F59E0B", // Golden/amber
  emerald: "#059669", // Darker green
  cyan: "#06B6D4", // Lighter cyan
  amber: "#FBBF24", // Lighter golden
};

/**
 * Sample bank accounts data with theme colors
 */
export const ACCOUNTS_DATA: BankAccount[] = [
  {
    id: "1",
    name: "Axis Bank",
    balance: 100000,
    percentage: 20,
    color: THEME_COLORS.teal, // Teal for first bank
    icon: "trending-up",
  },
  {
    id: "2",
    name: "HDFC Bank",
    balance: 300000,
    percentage: 60,
    color: THEME_COLORS.golden, // Golden for second bank
    icon: "add",
  },
  {
    id: "3",
    name: "ICICI Bank",
    balance: 100000,
    percentage: 20,
    color: THEME_COLORS.green, // Green for third bank
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
 * Daily chart data (30 days)
 */
export const DAILY_CHART_DATA: ChartDataPoint[] = Array.from(
  { length: 30 },
  (_, i) => ({
    date: `${i + 1}`,
    spend: Math.random() * 5000 + 2000,
    invested: Math.random() * 3000 + 1000,
    income: Math.random() * 6000 + 3000,
  })
);

/**
 * Monthly chart data (12 months)
 */
export const MONTHLY_CHART_DATA: ChartDataPoint[] = [
  { date: "Feb", spend: 3200, invested: 1500, income: 4500 },
  { date: "Mar", spend: 2800, invested: 2000, income: 5000 },
  { date: "Apr", spend: 3500, invested: 1800, income: 4800 },
  { date: "May", spend: 4000, invested: 2200, income: 5200 },
  { date: "Jun", spend: 3800, invested: 1900, income: 4900 },
  { date: "Jul", spend: 3300, invested: 2100, income: 5100 },
  { date: "Aug", spend: 3600, invested: 2300, income: 5300 },
  { date: "Sep", spend: 3900, invested: 2000, income: 5000 },
  { date: "Oct", spend: 3400, invested: 2400, income: 5400 },
  { date: "Nov", spend: 3700, invested: 2200, income: 5200 },
  { date: "Dec", spend: 4200, invested: 2500, income: 5500 },
  { date: "Jan", spend: 3100, invested: 1700, income: 4700 },
];

/**
 * Account balance trend data for line chart (in lakhs)
 */
export const ACCOUNT_BALANCE_TREND = [
  3.2, 3.5, 3.3, 3.8, 4.0, 4.2, 4.5, 4.3, 4.7, 4.9, 5.0, 5.0,
];

/**
 * Account balance trend labels (months)
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

/**
 * Generate theme-appropriate colors for accounts dynamically
 * Uses green, teal, and golden base colors with variations
 *
 * @param count - Number of colors needed
 * @returns Array of color hex strings
 */
export const generateAccountColors = (count: number): string[] => {
  const baseColors = [
    THEME_COLORS.teal,
    THEME_COLORS.golden,
    THEME_COLORS.green,
  ];
  const colors: string[] = [];

  // For 2 banks: use teal and golden
  if (count === 2) {
    return [THEME_COLORS.teal, THEME_COLORS.golden];
  }

  // For 3 banks: use teal, golden, and green
  if (count === 3) {
    return [THEME_COLORS.teal, THEME_COLORS.golden, THEME_COLORS.green];
  }

  // For more banks: generate variations using the color generator
  for (let i = 0; i < count; i++) {
    const baseColorIndex = i % baseColors.length;
    const baseColor = baseColors[baseColorIndex];

    if (i < baseColors.length) {
      // Use base colors for first few
      colors.push(baseColor);
    } else {
      // Generate variations for additional banks
      const variation = Math.floor(i / baseColors.length);
      const intensity = 15 + variation * 10;
      colors.push(generateColorShade(baseColor, variation % 4, intensity));
    }
  }

  return colors;
};
