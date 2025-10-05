import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChartSummaryProps } from "./types";

/**
 * Reusable chart summary component that displays current value, previous value,
 * percentage change, and optional budget information
 */
const ChartSummary: React.FC<ChartSummaryProps> = ({
  activeChart,
  currentValue,
  previousValue,
  percentageChange,
  budgetValue,
  textColor,
  secondaryTextColor,
  chartColors,
}) => {
  // Determine if the change is positive based on chart type:
  // - For spend: decrease is good (green), increase is bad (red)
  // - For invested: increase is good (green), decrease is bad (red)
  // - For income: increase is good (green), decrease is bad (red)
  const isPositiveChange =
    activeChart === "spend"
      ? percentageChange < 0 // Negative change (decrease) is good for spend
      : percentageChange > 0; // Positive change (increase) is good for invested/income

  const changeColor = isPositiveChange ? "#22C55E" : "#EF4444";

  // Arrow direction should match the actual change direction
  // Increase (positive %) = upward arrow, Decrease (negative %) = downward arrow
  const changeArrow = percentageChange > 0 ? "↗" : "↘";
  const changeText = percentageChange < 0 ? "decrease" : "increase";

  // Get the color for the current chart type
  const chartColor = chartColors[activeChart];

  return (
    <View style={styles.monthSummary}>
      <View style={styles.summaryLeft}>
        <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>
          This month so far
        </Text>
        <View style={styles.summaryAmountRow}>
          <Text style={[styles.summaryAmount, { color: chartColor }]}>
            {currentValue}
          </Text>
          {budgetValue && activeChart === "spend" && (
            <>
              <Text
                style={[styles.summaryBudget, { color: secondaryTextColor }]}
              >
                / {budgetValue}
              </Text>
              <Ionicons name="pencil" size={10} color={secondaryTextColor} />
            </>
          )}
        </View>
        <Text style={[styles.summaryChange, { color: changeColor }]}>
          {changeArrow} {Math.abs(percentageChange).toFixed(1)}% {changeText}{" "}
          from last month
        </Text>
      </View>
      <View style={styles.summaryRight}>
        <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>
          Last month
        </Text>
        <Text style={[styles.lastMonthAmount, { color: textColor }]}>
          {previousValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: "700",
  },
  summaryBudget: {
    fontSize: 14,
  },
  summaryChange: {
    fontSize: 12,
    fontWeight: "500",
  },
  lastMonthAmount: {
    fontSize: 22,
    fontWeight: "600",
  },
});

export default ChartSummary;
