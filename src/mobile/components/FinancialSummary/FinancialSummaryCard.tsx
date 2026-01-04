import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency as formatINR } from "../../../../utils/currencyFormatter";
import { LineChart as RNChartKitLineChart } from "react-native-chart-kit";

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


  // Animation for trend badge - MUST be called before any early returns
  const trendBadgeAnim = useRef(new Animated.Value(0)).current;

  // Calculate trend from chart data
  const calculateChartTrend = () => {
    if (!data || data.length < 2) return null;
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    if (firstValue === 0) return null;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      percentage: change,
      isPositive: change >= 0,
    };
  };

  const chartTrend = calculateChartTrend();

  // Animate trend badge on mount - MUST be called before any early returns
  useEffect(() => {
    if (chartTrend) {
      Animated.spring(trendBadgeAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [chartTrend, trendBadgeAnim]);

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
        error: "#EF4444",
      }
    : {
        background: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        card: "#FFFFFF",
        error: "#DC2626",
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

    // Show last 6-12 months (prefer 6 for better visibility on cards)
    const monthsToShow = Math.min(data.length, 6);
    const chartData = data.slice(-monthsToShow);
    const chartValues = chartData.map((d) => d.value);
    const chartLabels = chartData.map((d) => d.month?.slice(0, 3) || "");

    console.log("📊 Chart data:", { dataPoints: chartData.length, values: chartValues });

    // Calculate chart dimensions for card
    const cardWidth = screenWidth * 0.7;
    const chartWidth = cardWidth - 32; // Account for padding
    const chartHeight = 80; // Increased height for better visibility

    // Format function for Y-axis labels
    const formatYLabel = (value: string) => {
      const numValue = Number(value);
      if (isNaN(numValue) || !isFinite(numValue)) return "0";
      
      // Format large numbers compactly
      if (numValue >= 10000000) {
        return `₹${(numValue / 10000000).toFixed(1)}Cr`;
      } else if (numValue >= 100000) {
        return `₹${(numValue / 100000).toFixed(1)}L`;
      } else if (numValue >= 1000) {
        return `₹${(numValue / 1000).toFixed(0)}K`;
      }
      return `₹${numValue.toFixed(0)}`;
    };

    return (
      <View style={styles.chartContainer}>
        {/* Trend indicator badge with animation */}
        {chartTrend && (
          <Animated.View
            style={[
              styles.trendBadge,
              {
                backgroundColor: chartTrend.isPositive ? `${themeColor}15` : `${colors.error}15`,
                borderColor: chartTrend.isPositive ? `${themeColor}30` : `${colors.error}30`,
                opacity: trendBadgeAnim,
                transform: [
                  {
                    scale: trendBadgeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name={chartTrend.isPositive ? "trending-up" : "trending-down"}
              size={11}
              color={chartTrend.isPositive ? themeColor : colors.error}
            />
            <Text
              style={[
                styles.trendText,
                {
                  color: chartTrend.isPositive ? themeColor : colors.error,
                },
              ]}
            >
              {chartTrend.isPositive ? "+" : ""}
              {chartTrend.percentage.toFixed(1)}%
            </Text>
          </Animated.View>
        )}

        <RNChartKitLineChart
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: chartValues,
                color: (opacity = 1) => themeColor,
                strokeWidth: 2.5,
              },
            ],
          }}
          width={chartWidth}
          height={chartHeight}
          withInnerLines={true}
          withOuterLines={false}
          withDots={true}
          withShadow={false}
          bezier
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => themeColor,
            labelColor: (opacity = 1) => colors.textSecondary,
            style: {
              borderRadius: 8,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.card,
            },
            propsForBackgroundLines: {
              strokeDasharray: "", // solid lines
              stroke: colors.border,
              strokeWidth: 1,
              strokeOpacity: 0.1,
            },
          }}
          style={styles.chartWrapper}
          formatYLabel={formatYLabel}
        />
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
    minHeight: 100, // Ensure minimum height for chart + labels
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
    position: "relative",
  },
  chartWrapper: {
    marginVertical: 0,
    marginHorizontal: 0,
    paddingBottom: 0,
    borderRadius: 8,
  },
  trendBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 10,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
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
});

export default FinancialSummaryCard;
