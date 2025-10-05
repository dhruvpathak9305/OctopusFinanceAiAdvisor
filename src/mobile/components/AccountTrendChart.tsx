import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AccountTrendChartProps,
  TooltipProps,
} from "../pages/MobileAccounts/types";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Tooltip component for displaying data point information
 */
const Tooltip = ({
  x,
  y,
  value,
  date,
  color,
  backgroundColor,
  textColor,
  borderColor,
}: TooltipProps) => {
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
      <Text style={[styles.tooltipValue, { color }]}>₹{value.toFixed(1)}L</Text>
      <Text style={[styles.tooltipDate, { color: textColor }]}>{date}</Text>
    </View>
  );
};

/**
 * A reusable chart component for displaying account trends
 */
const AccountTrendChart: React.FC<AccountTrendChartProps> = ({
  data,
  labels = [],
  height = 150,
  width = screenWidth - 32,
  color = "#22C55E",
  backgroundColor = "#121D2A",
  textColor = "#FFFFFF",
  secondaryTextColor = "#B0BEC5",
  borderColor = "#2A3A4D",
  totalBalance,
  percentageChange,
  lastUpdated,
  onPointClick,
  showTooltip = true,
  showYAxisLabels = true,
  showXAxisLabels = true,
  formatYLabel = (v) => `₹${v}L`,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    i: number;
  } | null>(null);
  const chartRef = useRef<View>(null);

  // Calculate the max value for the Y-axis scale
  const maxValue = Math.max(...data) * 1.1; // Add 10% padding
  const minValue = Math.min(...data) * 0.9; // Subtract 10% padding

  // Generate Y-axis labels
  const yAxisLabels = [
    formatYLabel(maxValue.toFixed(1)),
    formatYLabel((maxValue - (maxValue - minValue) * 0.33).toFixed(1)),
    formatYLabel((maxValue - (maxValue - minValue) * 0.66).toFixed(1)),
    formatYLabel(minValue.toFixed(1)),
  ];

  // Handle touch events on the chart
  const handleChartTouch = (e: any) => {
    if (!chartRef.current) return;

    const { locationX, locationY } = e.nativeEvent;
    const chartWidth = width - 35; // Adjust for Y-axis labels
    const i = Math.max(
      0,
      Math.min(
        data.length - 1,
        Math.round((locationX / chartWidth) * (data.length - 1))
      )
    );

    setSelectedPoint({ x: locationX, y: locationY, i });

    if (onPointClick) {
      onPointClick(i, locationX, locationY);
    }
  };

  return (
    <View>
      {/* Header with balance info */}
      <View style={styles.balanceHeader}>
        <View>
          <Text style={[styles.balanceAmount, { color: textColor }]}>
            ₹{totalBalance}L
          </Text>
          <Text style={[styles.lastUpdated, { color: secondaryTextColor }]}>
            {lastUpdated}
          </Text>
        </View>
        <View
          style={[
            styles.percentageChip,
            {
              backgroundColor:
                percentageChange >= 0
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
            },
          ]}
        >
          <Ionicons
            name={percentageChange >= 0 ? "trending-up" : "trending-down"}
            size={14}
            color={percentageChange >= 0 ? "#22C55E" : "#EF4444"}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.percentageText,
              { color: percentageChange >= 0 ? "#22C55E" : "#EF4444" },
            ]}
          >
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange}%
          </Text>
        </View>
      </View>

      {/* Chart container */}
      <View
        style={[
          styles.chartContainer,
          { height, width, backgroundColor, overflow: "visible" },
        ]}
        ref={chartRef}
      >
        <View onTouchStart={handleChartTouch} onTouchMove={handleChartTouch}>
          <View style={styles.chartOverlay}>
            {/* Y-axis grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <View
                key={`grid-${i}`}
                style={[
                  styles.gridLine,
                  {
                    top: 12 + (i * (height - 32)) / 3,
                    backgroundColor: `${borderColor}30`,
                  },
                ]}
              />
            ))}

            {/* Y-axis labels */}
            {showYAxisLabels && (
              <View style={styles.yAxisLabels}>
                {yAxisLabels.map((label, i) => (
                  <Text
                    key={`y-${i}`}
                    style={[
                      styles.axisLabel,
                      {
                        color: secondaryTextColor,
                        top: 8 + (i * (height - 32)) / 3,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>
            )}

            {/* X-axis labels */}
            {showXAxisLabels && labels.length > 0 && (
              <View style={styles.xAxisLabels}>
                {labels.map((label, i) =>
                  i % Math.ceil(labels.length / 6) === 0 ? (
                    <Text
                      key={`x-${i}`}
                      style={[styles.axisLabel, { color: secondaryTextColor }]}
                    >
                      {label}
                    </Text>
                  ) : null
                )}
              </View>
            )}

            {/* Chart line */}
            <View style={styles.chartLineContainer}>
              {data.map((value, i) => {
                // Skip first point as we can't draw a line from nothing
                if (i === 0) return null;

                const prevValue = data[i - 1];
                const prevX = ((i - 1) / (data.length - 1)) * (width - 35);
                const prevY =
                  height -
                  20 -
                  ((prevValue - minValue) / (maxValue - minValue)) *
                    (height - 32);
                const currentX = (i / (data.length - 1)) * (width - 35);
                const currentY =
                  height -
                  20 -
                  ((value - minValue) / (maxValue - minValue)) * (height - 32);

                return (
                  <View
                    key={`line-${i}`}
                    style={[
                      styles.chartLine,
                      {
                        left: prevX + 30,
                        top: prevY,
                        width: currentX - prevX,
                        height: 2,
                        backgroundColor: color,
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              currentY - prevY,
                              currentX - prevX
                            )}rad`,
                          },
                        ],
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Data points */}
            <View style={styles.dataPointsContainer}>
              {data.map((value, i) => {
                const x = (i / (data.length - 1)) * (width - 35);
                const y =
                  height -
                  20 -
                  ((value - minValue) / (maxValue - minValue)) * (height - 32);

                return (
                  <View
                    key={`point-${i}`}
                    style={[
                      styles.dataPoint,
                      {
                        left: x + 30,
                        top: y - 2,
                        backgroundColor: color,
                        borderColor: backgroundColor,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Tooltip */}
        {showTooltip && selectedPoint && (
          <Tooltip
            x={selectedPoint.x}
            y={selectedPoint.y}
            value={data[selectedPoint.i]}
            date={labels[selectedPoint.i] || `Day ${selectedPoint.i + 1}`}
            color={color}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderColor={borderColor}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
  },
  lastUpdated: {
    fontSize: 12,
    marginTop: 2,
  },
  percentageChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chartContainer: {
    position: "relative",
    borderRadius: 8,
    paddingBottom: 14,
    marginTop: 10,
  },
  chartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gridLine: {
    position: "absolute",
    left: 35,
    right: 5,
    height: 1,
  },
  yAxisLabels: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 35,
  },
  xAxisLabels: {
    position: "absolute",
    left: 35,
    right: 5,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  axisLabel: {
    fontSize: 9,
    fontWeight: "500",
    position: "absolute",
    textAlign: "right",
    paddingRight: 3,
  },
  chartLineContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartLine: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
  },
  dataPointsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataPoint: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
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
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  tooltipDate: {
    fontSize: 10,
  },
});

export default AccountTrendChart;
