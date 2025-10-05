import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ChartTooltipProps } from "./types";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Reusable tooltip component for displaying data point information on charts
 */
const ChartTooltip: React.FC<ChartTooltipProps> = ({
  x,
  y,
  value,
  label,
  color,
  backgroundColor,
  textColor,
  borderColor = "rgba(255,255,255,0.1)",
  prefix = "",
  suffix = "",
  secondaryValue,
  secondaryLabel,
}) => {
  // Position the tooltip to ensure it stays within screen bounds
  const left = Math.min(Math.max(x - 50, 10), screenWidth - 120);

  return (
    <View
      style={[
        styles.tooltip,
        {
          backgroundColor,
          borderColor,
          left,
          top: y - 80,
        },
      ]}
    >
      <Text style={[styles.tooltipTitle, { color: textColor }]}>{label}</Text>
      <Text style={[styles.tooltipValue, { color }]}>
        {prefix}
        {typeof value === "number" ? value.toFixed(1) : value}
        {suffix}
      </Text>

      {secondaryValue && secondaryLabel && (
        <View style={styles.secondaryContainer}>
          <Text style={[styles.tooltipSecondary, { color: textColor }]}>
            {secondaryLabel}
          </Text>
          <Text style={[styles.tooltipSecondaryValue, { color }]}>
            {secondaryValue}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    minWidth: 100,
  },
  tooltipTitle: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  tooltipSecondary: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.8,
  },
  secondaryContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  tooltipSecondaryValue: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default ChartTooltip;
