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
  loading: boolean;
  error: string | null;
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
  loading,
  error,
  onViewAll,
  onAddNew,
  onInfoPress,
  backgroundImage,
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
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.slice(-6).map((dataPoint, index) => {
            const height =
              range > 0 ? ((dataPoint.value - minValue) / range) * 40 : 20;
            return (
              <View key={index} style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: Math.max(height, 4),
                      backgroundColor: themeColor,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          {data.slice(-6).map((_, index) => (
            <Text
              key={index}
              style={[styles.chartLabel, { color: colors.textSecondary }]}
            >
              {index % 2 === 0 ? data[index]?.month?.slice(0, 3) || "M" : ""}
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
          <Text style={styles.changeIcon}>↗</Text>
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
    height: 180,
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
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
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
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 40,
    marginBottom: 4,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
  },
  chartBar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
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
