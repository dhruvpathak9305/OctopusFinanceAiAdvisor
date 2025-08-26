import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CircularProgress from "../../common/CircularProgress";
import { BudgetCategory } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";
import {
  formatCurrency,
  formatPercentage,
  getProgressColor,
} from "../utils/budgetCalculations";

export interface BudgetSummaryProps {
  category: BudgetCategory;
  totalSpent: number;
  totalBudget: number;
  totalPercentage: number;
  colors: ThemeColors;
  onAddSubcategory: () => void;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  category,
  totalSpent,
  totalBudget,
  totalPercentage,
  colors,
  onAddSubcategory,
}) => {
  const progressColor = getProgressColor(totalSpent, totalBudget, colors);

  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Header with category info and add button */}
      <View style={styles.summaryHeader}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: category.ring_color + "15" }, // 15% opacity like Quick Actions
          ]}
        >
          <Text style={styles.categoryIconText}>🏠</Text>
        </View>

        <View style={styles.summaryInfo}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {category.name}
          </Text>
          <Text
            style={[styles.summarySubtitle, { color: colors.textSecondary }]}
          >
            Budget breakdown and progress
          </Text>
        </View>

        <TouchableOpacity
          onPress={onAddSubcategory}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Metrics with circular progress */}
      <View style={styles.summaryMetrics}>
        {/* Spent amount */}
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            SPENT
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        {/* Central circular progress - percentage only inside */}
        <View style={styles.progressContainer}>
          <CircularProgress
            percentage={Math.min(totalPercentage, 100)}
            size={80}
            strokeWidth={4} // Consistent stroke thickness across all progress circles
            color={progressColor}
            backgroundColor={colors.border + "30"}
          />
        </View>

        {/* Budget limit */}
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            LIMIT
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatCurrency(totalBudget)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    marginHorizontal: 16,
    // Quick Actions card styling
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16, // Reduced from 20
  },
  categoryIcon: {
    // Match FinancialSummaryCard icon container
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    // Background will be set dynamically with 15% opacity like Quick Actions
  },
  categoryIconText: {
    fontSize: 14, // Match FinancialSummaryCard icon size
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 28, // Match FinancialSummaryCard value size
    fontWeight: "800", // Match FinancialSummaryCard bold style
    marginBottom: 6,
    letterSpacing: -0.8, // Match FinancialSummaryCard letter spacing
  },
  summarySubtitle: {
    fontSize: 14, // Match FinancialSummaryCard title size
    color: "#9CA3AF", // Fixed color - softer gray for subtitles
    fontWeight: "600", // Match FinancialSummaryCard title weight
    opacity: 1, // Remove opacity, use fixed color instead
  },
  addButton: {
    // Match Quick Actions floating button design
    width: 44,
    height: 44,
    borderRadius: 22, // Circular
    justifyContent: "center",
    alignItems: "center",
    // Enhanced shadow to match Quick Actions
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Removed marginBottom since no status section
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 10, // Smaller, uniform labels
    marginBottom: 6,
    color: "#9CA3AF", // Fixed softer gray color
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800", // Bold values matching Quick Actions
    letterSpacing: -0.2,
    color: "#FFFFFF", // Fixed white for dark theme
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 15, // Slightly smaller for better balance
    fontWeight: "800", // Bold like Quick Actions
    letterSpacing: -0.3,
    color: "#FFFFFF", // Fixed white for better contrast
  },
  // Removed status-related styles as per requirements
});

export default BudgetSummary;
