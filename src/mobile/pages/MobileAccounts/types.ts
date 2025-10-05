/**
 * Types for MobileAccounts components and logic
 */

/**
 * Represents a bank account with balance and display properties
 */
export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  percentage: number;
  color: string;
  icon: string;
}

/**
 * Represents a single data point in a chart
 */
export interface ChartDataPoint {
  date: string;
  spend: number;
  invested: number;
  income: number;
}

/**
 * Chart period type
 */
export type ChartPeriod = "daily" | "monthly";

/**
 * Chart type for financial data
 */
export type ChartType = "spend" | "invested" | "income";

/**
 * Props for the AccountTrendChart component
 */
export interface AccountTrendChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  width?: number;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  borderColor?: string;
  totalBalance: string;
  percentageChange: number;
  lastUpdated: string;
  onPointClick?: (index: number, x: number, y: number) => void;
  showTooltip?: boolean;
  showYAxisLabels?: boolean;
  showXAxisLabels?: boolean;
  formatYLabel?: (value: string) => string;
}

/**
 * Props for tooltip in chart
 */
export interface TooltipProps {
  x: number;
  y: number;
  value: number;
  date: string;
  color: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}
