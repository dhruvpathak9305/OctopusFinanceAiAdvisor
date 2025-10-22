/**
 * Common chart component types
 */

/**
 * Base chart props that all charts share
 */
export interface BaseChartProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  borderColor?: string;
  showYAxisLabels?: boolean;
  showXAxisLabels?: boolean;
  noPadding?: boolean; // Control whether to apply padding
  containerStyle?: any; // Additional style for the chart container
  chartStyle?: any; // Additional style for the chart itself
}

/**
 * Props for the chart tooltip component
 */
export interface ChartTooltipProps {
  x: number;
  y: number;
  value: number | string;
  label: string;
  color: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  prefix?: string;
  suffix?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  formatValue?: (value: number) => string; // Custom formatter function
}

/**
 * Props for the MonthlyChart component
 */
export interface MonthlyChartProps extends BaseChartProps {
  data: {
    spend: number[];
    invested: number[];
    income: number[];
  };
  labels: string[];
  activeChart: "spend" | "invested" | "income";
  chartPeriod: "daily" | "monthly";
  title: string;
  onDataPointClick?: (index: number, x: number, y: number) => void;
  onChartTypeChange?: (type: "spend" | "invested" | "income") => void;
  onPeriodChange?: (period: "daily" | "monthly") => void;
  onMonthChange?: (direction: "prev" | "next") => void;
  chartColors?: {
    spend: string;
    invested: string;
    income: string;
  };
  formatYLabel?: (value: string) => string;
  selectedBank?: string | null;
  bankAmount?: string; // Formatted bank amount like "3K", "6L", "70Cr"
  previousMonthData?: {
    spend: number;
    invested: number;
    income: number;
  }; // Previous month totals for MOM comparison
}

/**
 * Props for the chart type selector component
 */
export interface ChartTypeSelectorProps {
  activeChart: "spend" | "invested" | "income";
  onChange: (type: "spend" | "invested" | "income") => void;
  colors: {
    spend: string;
    invested: string;
    income: string;
    text: string;
    background: string;
  };
}

/**
 * Props for the period toggle component
 */
export interface PeriodToggleProps {
  activePeriod: "daily" | "monthly";
  onChange: (period: "daily" | "monthly") => void;
  textColor: string;
  backgroundColor: string;
  secondaryTextColor: string;
}

/**
 * Props for the month header component
 */
export interface MonthHeaderProps {
  title: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  textColor: string;
}

/**
 * Props for the chart summary component
 */
export interface ChartSummaryProps {
  activeChart: "spend" | "invested" | "income";
  currentValue: string;
  previousValue: string;
  percentageChange: number;
  budgetValue?: string;
  textColor: string;
  secondaryTextColor: string;
  chartColors: {
    spend: string;
    invested: string;
    income: string;
  };
}
