import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency as formatINR } from "../../../../utils/currencyFormatter";

const { width: screenWidth } = Dimensions.get("window");

interface FinancialSummaryCardProps {
  title: string;
  icon: string;
  data: Array<{ month: string; value: number }>;
  total: number;
  monthlyChange: string;
  themeColor: string;
  trend?: "up" | "down" | "neutral"; // Add trend prop for dynamic arrow
  loading: boolean;
  error: string | null;
  chartMessage?: string | null; // Message to display when no chart data
  onViewAll: () => void;
  onAddNew?: () => void;
  onInfoPress?: () => void;
  backgroundImage?: string;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  title,
  icon,
  data,
  total,
  monthlyChange,
  themeColor,
  trend = "neutral", // Default to neutral if not provided
  loading,
  error,
  chartMessage,
  onViewAll,
  onAddNew,
  onInfoPress,
  backgroundImage,
}) => {
  const { isDark } = useTheme();

  // Dynamic arrow icon based on trend
  const getArrowIcon = () => {
    if (trend === "up") return "↗"; // Up-right arrow for positive growth
    if (trend === "down") return "↘"; // Down-right arrow for negative growth
    return "→"; // Right arrow for neutral/no change
  };

  const colors = isDark
    ? {
        background: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        card: "#1F2937",
      }
    : {
        background: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        card: "#FFFFFF",
      };

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: "#EF4444" }]}>Error</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  const formatCurrency = (value: number) => {
    return formatINR(value, {
      currency: "INR",
      locale: "en-IN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderChart = () => {
    // If there's a chart message (error or info), display it
    if (chartMessage) {
      console.log("ℹ️ FinancialSummaryCard: Displaying chart message:", chartMessage);
      return (
        <View style={[styles.chartContainer, styles.chartMessageContainer]}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={colors.textSecondary} 
            style={{ marginBottom: 8 }} 
          />
          <Text style={[styles.chartMessageText, { color: colors.textSecondary }]}>
            {chartMessage}
          </Text>
        </View>
      );
    }

    // Check if we have valid data
    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
      console.log("⚠️ FinancialSummaryCard: No valid chart data available");
      return (
        <View style={[styles.chartContainer, styles.chartMessageContainer]}>
          <Ionicons 
            name="bar-chart-outline" 
            size={20} 
            color={colors.textSecondary} 
            style={{ marginBottom: 8 }} 
          />
          <Text style={[styles.chartMessageText, { color: colors.textSecondary }]}>
            Historical data will appear here
          </Text>
        </View>
      );
    }

    console.log("📊 FinancialSummaryCard: Rendering chart with REAL data:", data.length, "months");

    // Show last 12 months
    const chartData = data.slice(-12);
    const maxValue = Math.max(...chartData.map((d) => d.value));
    const minValue = Math.min(...chartData.map((d) => d.value));
    const range = maxValue - minValue;

    console.log("📊 Chart range:", { maxValue, minValue, range, dataPoints: chartData.length });

    // Enhanced chart background color based on theme
    const chartBgColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";

    return (
      <View style={[styles.chartContainer, { backgroundColor: chartBgColor, borderRadius: 8, padding: 8 }]}>
        <View style={styles.chartBars}>
          {chartData.map((dataPoint, index) => {
            const height =
              range > 0 ? ((dataPoint.value - minValue) / range) * 60 : 30;
            return (
              <View key={index} style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: Math.max(height, 8),
                      backgroundColor: themeColor,
                      opacity: 0.9,
                      shadowColor: themeColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          {chartData.map((dataPoint, index) => (
            <Text
              key={index}
              style={[styles.chartLabel, { color: colors.textSecondary, fontSize: 9 }]}
            >
              {index % 3 === 0 ? dataPoint.month?.slice(0, 3) || "" : ""}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.title, { color: colors.textSecondary }]}>
              {title}
            </Text>
          </View>
          <View style={styles.actionsContainer}>
            {onInfoPress && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Card information"
                onPress={onInfoPress}
                style={[
                  styles.infoButton,
                  {
                    borderColor: themeColor,
                    backgroundColor: `${themeColor}20`,
                  },
                ]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="information" size={14} color={themeColor} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: themeColor }]}>
                View All
              </Text>
            </TouchableOpacity>

            {onAddNew && (
              <TouchableOpacity onPress={onAddNew} style={styles.addButton}>
                <Text style={[styles.addIcon, { color: themeColor }]}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[styles.totalValue, { color: colors.text }]}>
          {formatCurrency(total)}
        </Text>

        <View
          style={[
            styles.changeContainer,
            { backgroundColor: `${themeColor}20` },
          ]}
        >
          <Text style={styles.changeIcon}>{getArrowIcon()}</Text>
          <Text style={[styles.changeText, { color: themeColor }]}>
            {monthlyChange} from last month
          </Text>
        </View>

        {renderChart()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.7,
    height: 210, // Increased from 180 to 210 for more chart space
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    textAlign: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  viewAllButton: {
    marginRight: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "500",
  },

  addButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6, // Reduced from 8 to 6
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3, // Reduced from 4 to 3
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8, // Reduced from 12 to 8
  },
  changeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  chartContainer: {
    flex: 1,
    minHeight: 80, // Ensure minimum height for chart
  },
  chartMessageContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  chartMessageText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    opacity: 0.8,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60, // Increased from 50 to 60
    marginBottom: 6,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 1,
  },
  chartBar: {
    width: 5, // Increased from 4 to 5 for better visibility
    borderRadius: 2.5,
    minHeight: 8, // Increased from 5 to 8
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  chartLabel: {
    fontSize: 10,
    flex: 1,
    textAlign: "center",
  },
});

export default FinancialSummaryCard;
