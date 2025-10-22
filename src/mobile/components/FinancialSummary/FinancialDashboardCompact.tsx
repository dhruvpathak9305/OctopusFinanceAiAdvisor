import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
// Using View with backgroundColor as LinearGradient alternative
import { useTheme } from "../../../../contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

// Mini Sparkline Chart Component
const MiniSparkline: React.FC<{
  data: number[];
  color: string;
  isPositive: boolean;
}> = ({ data, color, isPositive }) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <View style={styles.sparklineContainer}>
      {data.map((value, index) => {
        const height = range > 0 ? ((value - min) / range) * 12 + 2 : 7;
        return (
          <View
            key={index}
            style={[
              styles.sparklineBar,
              {
                height,
                backgroundColor: `${color}80`,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

// Animated Counter Component
const AnimatedCounter: React.FC<{
  value: string;
  style: any;
  duration?: number;
}> = ({ value, style, duration = 1000 }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [displayValue, setDisplayValue] = useState("$0");

  useEffect(() => {
    // Extract numeric value for animation
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (!isNaN(numericValue)) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: numericValue,
        duration,
        useNativeDriver: false,
      }).start();

      const listener = animatedValue.addListener(({ value: animValue }) => {
        const suffix = value.includes("L")
          ? "L"
          : value.includes("K")
          ? "K"
          : value.includes("CR")
          ? "CR"
          : "";
        setDisplayValue(`$${animValue.toFixed(1).replace(".0", "")}${suffix}`);
      });

      return () => animatedValue.removeListener(listener);
    }
  }, [value, animatedValue, duration]);

  return <Text style={style}>{displayValue}</Text>;
};

// Generate sample sparkline data
const generateSparklineData = (baseValue: number, trend: string): number[] => {
  const points = 7; // Week's worth of data
  const data = [];
  let value = baseValue * 0.95; // Start slightly below current

  const isPositive = trend.startsWith("+");
  const changePercent = parseFloat(
    trend.replace("%", "").replace("+", "").replace("-", "")
  );
  const dailyChange = (baseValue * (changePercent / 100)) / points;

  for (let i = 0; i < points; i++) {
    const randomVariation = (Math.random() - 0.5) * (baseValue * 0.02); // 2% random variation
    value += (isPositive ? dailyChange : -dailyChange) + randomVariation;
    data.push(Math.max(0, value));
  }

  return data;
};

interface CompactCardData {
  title: string;
  icon: string;
  value: string;
  change: string;
  themeColor: string;
  isPositive: boolean;
  isNeutral?: boolean;
  rawValue: number;
  sparklineData: number[];
}

interface FinancialDashboardCompactProps {
  netWorthData?: { total: number; change: string; loading?: boolean };
  accountsData?: {
    total: number;
    change: string;
    loading?: boolean;
    count?: number;
  };
  creditCardData?: { total: number; change: string; loading?: boolean };
  incomeData?: { total: number; change: string; loading?: boolean };
  expensesData?: { total: number; change: string; loading?: boolean };
}

const FinancialDashboardCompact: React.FC<FinancialDashboardCompactProps> = ({
  netWorthData,
  accountsData,
  creditCardData,
  incomeData,
  expensesData,
}) => {
  const { isDark } = useTheme();

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

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const isNegative = value < 0;

    let formattedValue: string;

    if (absValue >= 10000000) {
      // 1 Crore
      formattedValue = `${(absValue / 10000000).toFixed(1)}CR`;
    } else if (absValue >= 100000) {
      // 1 Lakh
      formattedValue = `${(absValue / 100000).toFixed(1)}L`;
    } else if (absValue >= 1000) {
      // 1 Thousand
      formattedValue = `${(absValue / 1000).toFixed(1)}K`;
    } else {
      formattedValue = absValue.toFixed(0);
    }

    // Remove .0 if present
    formattedValue = formattedValue.replace(".0", "");

    return `${isNegative ? "-" : ""}$${formattedValue}`;
  };

  // Default fallback values - only use if no real data available
  const getDefaultNetWorthData = () => netWorthData?.total ?? 0;
  const getDefaultAccountsData = () => accountsData?.total ?? 0;

  // Enhanced color palette for accessibility and colorblind-friendly design
  const colorPalette = {
    success: "#059669", // High contrast green
    warning: "#D97706", // High contrast amber
    danger: "#DC2626", // High contrast red
    info: "#2563EB", // High contrast blue
    neutral: "#6B7280", // Gray for neutral states
  };

  // Prepare compact card data with enhanced accessibility and sparkline data
  const netWorthValue = netWorthData?.total ?? 0;
  const accountsValue = accountsData?.total ?? 0;
  const creditCardValue = creditCardData?.total ?? 0;
  const incomeValue = incomeData?.total ?? 0;
  const expensesValue = expensesData?.total ?? 0;

  const compactCards: CompactCardData[] = [
    {
      title: "Net Worth",
      icon: "💰",
      value: formatCurrency(netWorthValue),
      change: netWorthData?.change ?? "0.0%", // Removed hardcoded +1.9%
      themeColor: colorPalette.success,
      isPositive: true,
      rawValue: netWorthValue,
      sparklineData: generateSparklineData(
        netWorthValue,
        netWorthData?.change ?? "0.0%" // Removed hardcoded +1.9%
      ),
    },
    {
      title: `Accounts${accountsData?.count ? ` (${accountsData.count})` : ""}`,
      icon: "🏛️",
      value: formatCurrency(accountsValue),
      change: accountsData?.change ?? "0.0%", // Removed hardcoded +2.8%, use real data from accountsData
      themeColor: colorPalette.info,
      isPositive: true,
      rawValue: accountsValue,
      sparklineData: generateSparklineData(
        accountsValue,
        accountsData?.change ?? "0.0%" // Removed hardcoded +2.8%
      ),
    },
    {
      title: "Credit Cards",
      icon: "💳",
      value: formatCurrency(creditCardValue),
      change: creditCardData?.change ?? "0.0%", // Removed hardcoded +0.8%
      themeColor: colorPalette.danger,
      isPositive: false,
      rawValue: creditCardValue,
      sparklineData: generateSparklineData(
        creditCardValue,
        creditCardData?.change ?? "0.0%" // Removed hardcoded +0.8%
      ),
    },
    {
      title: "Income",
      icon: "📈",
      value: formatCurrency(incomeValue),
      change: incomeData?.change ?? "0.0%",
      themeColor: colorPalette.success,
      isPositive: true,
      isNeutral: incomeData?.change === "0.0%",
      rawValue: incomeValue,
      sparklineData: generateSparklineData(
        incomeValue,
        incomeData?.change ?? "0.0%"
      ),
    },
    {
      title: "Expenses",
      icon: "📊",
      value: formatCurrency(expensesValue),
      change: expensesData?.change ?? "0.0%",
      themeColor: colorPalette.warning,
      isPositive: false,
      isNeutral: expensesData?.change === "0.0%",
      rawValue: expensesValue,
      sparklineData: generateSparklineData(
        expensesValue,
        expensesData?.change ?? "0.0%"
      ),
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<{
    index: number;
    text: string;
  } | null>(null);

  // Generate personalized insight
  const getPersonalizedInsight = (): {
    message: string;
    emoji: string;
    type: "positive" | "warning" | "neutral";
  } => {
    const netWorthChange = parseFloat(
      (netWorthData?.change ?? "0.0%").replace("%", "").replace("+", "") // Removed hardcoded +1.9%
    );
    const creditCardChange = parseFloat(
      (creditCardData?.change ?? "0.0%").replace("%", "").replace("+", "") // Removed hardcoded +0.8%
    );
    const incomeChange = parseFloat(
      (incomeData?.change ?? "0.0%").replace("%", "").replace("+", "")
    );
    const expensesChange = parseFloat(
      (expensesData?.change ?? "0.0%").replace("%", "").replace("+", "")
    );

    if (netWorthChange > 2) {
      return {
        message: "Excellent! Your net worth is growing strong this month.",
        emoji: "🚀",
        type: "positive",
      };
    } else if (creditCardChange > 5) {
      return {
        message: "Watch out! Credit card spending is increasing rapidly.",
        emoji: "⚠️",
        type: "warning",
      };
    } else if (incomeChange > expensesChange) {
      return {
        message: "Good job! You're saving more than you're spending.",
        emoji: "💚",
        type: "positive",
      };
    } else if (expensesChange > incomeChange + 2) {
      return {
        message: "Consider reviewing your expenses this month.",
        emoji: "🔍",
        type: "warning",
      };
    } else {
      return {
        message: "Your finances look stable. Keep up the good work!",
        emoji: "✨",
        type: "neutral",
      };
    }
  };

  const insight = getPersonalizedInsight();

  const renderMetricItem = (card: CompactCardData, index: number) => {
    const changeColor = card.isNeutral
      ? colorPalette.neutral
      : card.isPositive
      ? colorPalette.success
      : colorPalette.danger;

    const changeIcon = card.isNeutral
      ? "→"
      : card.isPositive
      ? "↗"
      : card.change.startsWith("+")
      ? "↗"
      : "↘";

    const isHovered = hoveredIndex === index;

    // Enhanced accessibility labels
    const accessibilityLabel = `${card.title}: ${card.value}, ${card.change
      .replace("+", "increased by ")
      .replace("-", "decreased by ")} from last month`;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.metricItem,
          {
            backgroundColor: isHovered ? `${card.themeColor}08` : "transparent",
            borderColor: isHovered ? `${card.themeColor}25` : "transparent",
          },
        ]}
        onPressIn={() => {
          setHoveredIndex(index);
          const tooltipText = `${card.title}: ${card.value} (${card.change} from last month)`;
          setShowTooltip({ index, text: tooltipText });
        }}
        onPressOut={() => {
          setHoveredIndex(null);
          setTimeout(() => setShowTooltip(null), 2000); // Hide tooltip after 2 seconds
        }}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint={`Tap for more details about ${card.title}`}
      >
        <View style={styles.metricIconContainer}>
          <View
            style={[
              styles.iconBackground,
              styles.gradientIcon,
              { backgroundColor: `${card.themeColor}20` },
            ]}
          >
            <Text
              style={[styles.metricIcon, { color: card.themeColor }]}
              accessibilityLabel={`${card.title} icon`}
            >
              {card.icon}
            </Text>
          </View>
        </View>

        <View style={styles.metricContent}>
          <Text
            style={[styles.metricTitle, { color: colors.textSecondary }]}
            accessibilityRole="text"
          >
            {card.title}
          </Text>
          <AnimatedCounter
            value={card.value}
            style={[styles.metricValue, { color: colors.text }]}
            duration={1200}
          />

          {/* Mini Sparkline Chart */}
          <MiniSparkline
            data={card.sparklineData}
            color={card.themeColor}
            isPositive={card.isPositive}
          />
        </View>

        <View style={styles.metricChangeContainer}>
          <View
            style={[
              styles.metricChange,
              {
                backgroundColor: `${changeColor}20`,
                borderLeftWidth: 3,
                borderLeftColor: changeColor,
              },
            ]}
          >
            <View style={styles.changeIndicatorRow}>
              <Text
                style={[styles.metricChangeIcon, { color: changeColor }]}
                accessibilityLabel={`Trend ${
                  card.isPositive
                    ? "positive"
                    : card.isNeutral
                    ? "neutral"
                    : "negative"
                }`}
              >
                {changeIcon}
              </Text>
              <Text
                style={[styles.metricChangeText, { color: changeColor }]}
                accessibilityLabel={`Change: ${card.change}`}
              >
                {card.change}
              </Text>
            </View>
          </View>
        </View>

        {/* Tooltip */}
        {showTooltip && showTooltip.index === index && (
          <View style={[styles.tooltip, { backgroundColor: colors.text }]}>
            <Text style={[styles.tooltipText, { color: colors.card }]}>
              {showTooltip.text}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.scrollContainer}>
      <View
        style={[
          styles.compactCard,
          {
            backgroundColor: isDark
              ? "rgba(31, 41, 55, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: colors.border,
            shadowColor: isDark ? "#000000" : "#000000",
          },
        ]}
      >
        <View
          style={styles.cardContent}
          accessibilityLabel="Financial Dashboard Summary"
          accessibilityRole="summary"
        >
          {/* Personalized Insight Header */}
          <View style={styles.insightContainer}>
            <View
              style={[
                styles.insightBadge,
                {
                  backgroundColor:
                    insight.type === "positive"
                      ? "rgba(5, 150, 105, 0.15)"
                      : insight.type === "warning"
                      ? "rgba(245, 101, 101, 0.15)"
                      : "rgba(107, 114, 128, 0.15)",
                },
              ]}
            >
              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
              <Text
                style={[
                  styles.insightText,
                  {
                    color:
                      insight.type === "positive"
                        ? colorPalette.success
                        : insight.type === "warning"
                        ? colorPalette.danger
                        : colors.textSecondary,
                  },
                ]}
              >
                {insight.message}
              </Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.topRow}>
              {compactCards
                .slice(0, 3)
                .map((card, index) => renderMetricItem(card, index))}
            </View>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <View style={styles.bottomRow}>
              {compactCards
                .slice(3, 5)
                .map((card, index) => renderMetricItem(card, index + 3))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: 24,
  },
  compactCard: {
    marginHorizontal: 16,
    minHeight: 280,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    // Enhanced glassmorphism depth with translucent background
  },
  cardContent: {
    flex: 1,
  },
  // Personalized Insight Styles
  insightContainer: {
    marginBottom: 20,
  },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  insightEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  // Sparkline Chart Styles
  sparklineContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 16,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  sparklineBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 0.5,
    minHeight: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
  },
  headerIconContainer: {
    marginRight: 12,
  },
  headerIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  cardHeaderSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.8,
  },
  metricsGrid: {
    flex: 1,
    gap: 12,
  },
  separator: {
    height: 1,
    marginHorizontal: 0,
    opacity: 0.2,
    marginVertical: 8,
  },
  topRow: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    minHeight: 110,
    minWidth: 44, // Accessibility minimum tap target
    // Enhanced shadow for floating effect
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIconContainer: {
    marginBottom: 10,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientIcon: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  metricIcon: {
    fontSize: 18,
    fontWeight: "600",
  },
  metricContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.4,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricChangeContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  metricChange: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  changeIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  metricChangeIcon: {
    fontSize: 12,
    marginRight: 4,
    fontWeight: "bold",
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tooltip: {
    position: "absolute",
    top: -45,
    left: -15,
    right: -15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 1000,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  tooltipText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});

export default FinancialDashboardCompact;
