import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { MonthlyChartProps } from "./types";
import LineChart from "./LineChart";
import ChartTooltip from "./ChartTooltip";
import ChartSummary from "./ChartSummary";
import { MonthHeader, ChartTypeSelector, PeriodToggle } from "./ChartControls";

const { width: screenWidth } = Dimensions.get("window");

// Default chart colors
const DEFAULT_CHART_COLORS = {
  spend: "#EF4444",
  invested: "#3B82F6",
  income: "#22C55E",
};

/**
 * A comprehensive monthly/daily chart component that includes:
 * - Month navigation header
 * - Chart type selector (Spend, Invested, Income)
 * - Chart summary with current/previous values and percentage change
 * - Interactive line chart with tooltips
 * - Period toggle (Daily/Monthly)
 */
const MonthlyChart: React.FC<MonthlyChartProps> = ({
  data,
  labels,
  activeChart = "spend",
  chartPeriod = "daily",
  title = "August 2025",
  width = screenWidth - 40,
  height = 180,
  backgroundColor = "#121D2A",
  textColor = "#FFFFFF",
  secondaryTextColor = "#94A3B8",
  borderColor = "#334155",
  showYAxisLabels = true,
  showXAxisLabels = true,
  noPadding = false,
  containerStyle,
  chartStyle,
  onDataPointClick,
  onChartTypeChange,
  onPeriodChange,
  onMonthChange,
  chartColors = DEFAULT_CHART_COLORS,
  formatYLabel = (v) => `₹${v}K`,
  selectedBank,
  bankAmount,
}) => {
  // Local state for selected data point and tooltip position
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Get the current chart data based on the active chart type
  const currentChartData = data[activeChart];

  // Get the color for the active chart
  const chartColor = chartColors[activeChart];

  // Handle data point click/press
  const handlePointClick = (index: number, x: number, y: number) => {
    // If index is -1, it means we're not hovering anymore
    if (index === -1) {
      setSelectedDataPoint(null);
    } else {
      setSelectedDataPoint(index);
      setTooltipPosition({ x, y });

      if (onDataPointClick) {
        onDataPointClick(index, x, y);
      }
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (type: "spend" | "invested" | "income") => {
    setSelectedDataPoint(null); // Clear selected point when changing chart type
    if (onChartTypeChange) {
      onChartTypeChange(type);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: "daily" | "monthly") => {
    setSelectedDataPoint(null); // Clear selected point when changing period
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  // Handle month navigation
  const handleMonthChange = (direction: "prev" | "next") => {
    setSelectedDataPoint(null); // Clear selected point when changing month
    if (onMonthChange) {
      onMonthChange(direction);
    }
  };

  // Format values for the chart summary
  const formatValue = (value: number): string => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${(value / 1000).toFixed(1)}K`;
  };

  // Sample data for the chart summary (would come from props in a real implementation)
  const summaryData = {
    spend: {
      current: "₹1.2L",
      previous: "₹1.1L",
      budget: "₹91.0K",
      change: -7.7,
    },
    invested: {
      current: "₹64.5K",
      previous: "₹68.6K",
      change: -7.7,
    },
    income: {
      current: "₹68.1K",
      previous: "₹63.6K",
      change: 7.0,
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          padding: noPadding ? 16 : 20,
          borderRadius: 12,
        },
        containerStyle,
      ]}
    >
      {/* Month Header */}
      <MonthHeader
        title={title}
        onPrevMonth={() => handleMonthChange("prev")}
        onNextMonth={() => handleMonthChange("next")}
        textColor={textColor}
      />

      {/* Chart Type Selector */}
      <ChartTypeSelector
        activeChart={activeChart}
        onChange={handleChartTypeChange}
        colors={{
          spend: chartColors.spend,
          invested: chartColors.invested,
          income: chartColors.income,
          text: textColor,
          background: backgroundColor,
        }}
      />

      {/* Chart Summary */}
      <ChartSummary
        activeChart={activeChart}
        currentValue={summaryData[activeChart].current}
        previousValue={summaryData[activeChart].previous}
        percentageChange={summaryData[activeChart].change}
        budgetValue={
          activeChart === "spend" ? summaryData.spend.budget : undefined
        }
        textColor={textColor}
        secondaryTextColor={secondaryTextColor}
        chartColors={chartColors}
      />

      {/* Line Chart */}
      <View
        style={[
          styles.chartWrapper,
          { marginHorizontal: noPadding ? 0 : -16 }, // Adjusted negative margin
          { marginBottom: 10 }, // Add some space below the chart
        ]}
      >
        <LineChart
          data={currentChartData}
          labels={labels}
          width={width}
          height={height}
          color={chartColor}
          backgroundColor={backgroundColor}
          textColor={textColor}
          secondaryTextColor={secondaryTextColor}
          borderColor={borderColor}
          showYAxisLabels={showYAxisLabels}
          showXAxisLabels={showXAxisLabels}
          onPointClick={handlePointClick}
          formatYLabel={formatYLabel}
          containerStyle={chartStyle}
        />

        {/* Tooltip - Only show when actively hovering */}
        {selectedDataPoint !== null && (
          <ChartTooltip
            x={tooltipPosition.x}
            y={tooltipPosition.y}
            value={currentChartData[selectedDataPoint]}
            label={
              chartPeriod === "daily"
                ? `Day ${labels[selectedDataPoint]}`
                : labels[selectedDataPoint]
            }
            color={chartColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderColor={borderColor}
            prefix="₹"
            suffix="K"
            secondaryLabel={selectedBank || undefined}
            secondaryValue={bankAmount || undefined}
          />
        )}
      </View>

      {/* Period Toggle */}
      <PeriodToggle
        activePeriod={chartPeriod}
        onChange={handlePeriodChange}
        textColor={textColor}
        backgroundColor={backgroundColor}
        secondaryTextColor={secondaryTextColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartWrapper: {
    position: "relative",
    marginTop: 16,
    marginVertical: 10,
    marginHorizontal: 0,
  },
});

export default MonthlyChart;
