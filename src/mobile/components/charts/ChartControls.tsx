import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ChartTypeSelectorProps,
  MonthHeaderProps,
  PeriodToggleProps,
} from "./types";

/**
 * Month header component with navigation controls
 */
export const MonthHeader: React.FC<MonthHeaderProps> = ({
  title,
  onPrevMonth,
  onNextMonth,
  textColor,
}) => {
  return (
    <View style={styles.monthHeader}>
      <TouchableOpacity
        onPress={onPrevMonth}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={16} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.monthTitle, { color: textColor }]}>{title}</Text>
      <TouchableOpacity
        onPress={onNextMonth}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={16} color={textColor} />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Chart type selector component (Spend, Invested, Income)
 */
export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  activeChart,
  onChange,
  colors,
}) => {
  const chartTypes = [
    { id: "spend", label: "Spend", icon: "trending-down" },
    { id: "invested", label: "Invested", icon: "trending-up" },
    { id: "income", label: "Income", icon: "cash" },
  ] as const;

  return (
    <View style={styles.chartTypeContainer}>
      {chartTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.chartTypeButton,
            activeChart === type.id && { backgroundColor: colors[type.id] },
          ]}
          onPress={() => onChange(type.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={type.icon}
            size={14}
            color={activeChart === type.id ? "white" : colors.text}
          />
          <Text
            style={[
              styles.chartTypeText,
              { color: activeChart === type.id ? "white" : colors.text },
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Period toggle component (Daily/Monthly)
 */
export const PeriodToggle: React.FC<PeriodToggleProps> = ({
  activePeriod,
  onChange,
  textColor,
  backgroundColor,
  secondaryTextColor,
}) => {
  const periods = [
    { id: "daily", label: "Daily" },
    { id: "monthly", label: "Monthly" },
  ] as const;

  return (
    <View style={styles.periodToggle}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.id}
          style={[
            styles.periodButton,
            {
              backgroundColor:
                activePeriod === period.id ? "#10B981" : "transparent",
              borderWidth: activePeriod === period.id ? 0 : 1,
              borderColor: secondaryTextColor,
            },
          ]}
          onPress={() => onChange(period.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.periodButtonText,
              {
                color:
                  activePeriod === period.id ? "#FFFFFF" : secondaryTextColor,
                fontWeight: activePeriod === period.id ? "600" : "500",
              },
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  chartTypeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    marginTop: 4,
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  chartTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  periodToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 4,
  },
  periodButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
