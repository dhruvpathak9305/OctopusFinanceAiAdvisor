import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
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
  formatValue,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate tooltip entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [x, y]);

  // Position the tooltip to ensure it stays within screen bounds
  const left = Math.min(Math.max(x - 50, 10), screenWidth - 120);
  const topPosition = Math.max(y - 80, 10);

  // Format the value using custom formatter or default formatting
  const formattedValue = typeof value === "number" && formatValue
    ? formatValue(value)
    : typeof value === "number"
    ? `${prefix}${value.toFixed(1)}${suffix}`
    : value;

  return (
    <Animated.View
      style={[
        styles.tooltip,
        {
          backgroundColor,
          borderColor,
          left,
          top: topPosition,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={[styles.tooltipTitle, { color: textColor }]}>{label}</Text>
      <Text style={[styles.tooltipValue, { color }]}>
        {formattedValue}
      </Text>

      {secondaryValue && secondaryLabel && (
        <View style={[styles.secondaryContainer, { borderTopColor: borderColor }]}>
          <Text style={[styles.tooltipSecondary, { color: textColor }]}>
            {secondaryLabel}
          </Text>
          <Text style={[styles.tooltipSecondaryValue, { color }]}>
            {secondaryValue}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
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
