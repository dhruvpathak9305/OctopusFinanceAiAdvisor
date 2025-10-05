import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BaseChartProps } from "./types";
import Svg, { Path, Circle, Line } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Props for the LineChart component
 */
interface LineChartProps extends BaseChartProps {
  data: number[];
  labels?: string[];
  color: string;
  onPointClick?: (index: number, x: number, y: number) => void;
  formatYLabel?: (value: string) => string;
  dotRadius?: number;
  lineThickness?: number;
  gridOpacity?: number;
}

/**
 * A reusable line chart component that renders a line with data points
 */
const LineChart: React.FC<LineChartProps> = ({
  data,
  labels = [],
  width = screenWidth,
  height = 200,
  color = "#22C55E",
  backgroundColor = "#121D2A",
  textColor = "#FFFFFF",
  secondaryTextColor = "#94A3B8",
  borderColor = "#334155",
  showYAxisLabels = true,
  showXAxisLabels = true,
  onPointClick,
  formatYLabel = (v) => v,
  dotRadius = 3,
  lineThickness = 2,
  gridOpacity = 0.2,
  containerStyle,
}) => {
  const chartRef = useRef<View>(null);

  // Calculate the max and min values for the Y-axis scale
  const maxValue = Math.max(...data) * 1.1; // Add 10% padding
  const minValue = Math.min(...data) * 0.9; // Subtract 10% padding

  // Generate Y-axis labels
  const yAxisLabels = [
    formatYLabel(maxValue.toFixed(1)),
    formatYLabel((maxValue - (maxValue - minValue) * 0.33).toFixed(1)),
    formatYLabel((maxValue - (maxValue - minValue) * 0.66).toFixed(1)),
    formatYLabel(minValue.toFixed(1)),
  ];

  // State to track if we're currently hovering/touching
  const [isHovering, setIsHovering] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null
  );

  // Handle touch events on the chart
  const handleChartTouch = (e: any) => {
    if (!chartRef.current || !onPointClick) return;

    // Set hovering state to true
    setIsHovering(true);

    const { locationX, locationY } = e.nativeEvent;
    const chartWidth = width - 50; // Adjusted for left (35) and right (15) padding
    const i = Math.max(
      0,
      Math.min(
        data.length - 1,
        Math.round((locationX / chartWidth) * (data.length - 1))
      )
    );

    setSelectedDataPoint(i);
    onPointClick(i, locationX, locationY);
  };

  // Handle touch end events
  const handleTouchEnd = () => {
    setIsHovering(false);
    setSelectedDataPoint(null);
    if (onPointClick) {
      onPointClick(-1, 0, 0); // Send -1 to indicate no point is selected
    }
  };

  return (
    <View
      style={[
        styles.chartContainer,
        { height: height + 40, width, backgroundColor, overflow: "hidden" },
        containerStyle,
      ]}
      ref={chartRef}
    >
      <View
        style={{ height: height, width: width }}
        onTouchStart={handleChartTouch}
        onTouchMove={handleChartTouch}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <View style={styles.chartOverlay}>
          {/* Y-axis grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <View
              key={`hgrid-${i}`}
              style={[
                styles.gridLine,
                {
                  top: 12 + (i * (height - 32)) / 3,
                  backgroundColor: `${borderColor}${Math.round(
                    gridOpacity * 255
                  )
                    .toString(16)
                    .padStart(2, "0")}`,
                },
              ]}
            />
          ))}

          {/* Vertical grid lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={`vgrid-${i}`}
              style={[
                styles.verticalGridLine,
                {
                  left: 35 + (i * (width - 50)) / 5,
                  backgroundColor: `${borderColor}${Math.round(
                    gridOpacity * 255
                  )
                    .toString(16)
                    .padStart(2, "0")}`,
                },
              ]}
            />
          ))}

          {/* Y-axis labels */}
          {showYAxisLabels && (
            <View style={styles.yAxisLabels}>
              {yAxisLabels.map((label, i) => (
                <View
                  key={`y-${i}`}
                  style={[
                    styles.yLabelContainer,
                    {
                      top: 8 + (i * (height - 32)) / 3,
                    },
                  ]}
                >
                  <View style={styles.yLabelTextContainer}>
                    {typeof label === "string" && (
                      <Text
                        style={[
                          styles.yLabelText,
                          { color: secondaryTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Chart SVG content goes here */}

          {/* SVG Chart Line and Points */}
          <View style={styles.chartLineContainer}>
            <Svg width={width} height={height}>
              {/* Create a continuous path for the line */}
              <Path
                d={data
                  .map((value, i) => {
                    const x = (i / (data.length - 1)) * (width - 50) + 35;
                    const y =
                      height -
                      20 -
                      ((value - minValue) / (maxValue - minValue)) *
                        (height - 32);

                    return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
                  })
                  .join(" ")}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke={color}
                strokeWidth={lineThickness}
                fill="none"
              />

              {/* Add data points as circles */}
              {data.map((value, i) => {
                const x = (i / (data.length - 1)) * (width - 50) + 35;
                const y =
                  height -
                  20 -
                  ((value - minValue) / (maxValue - minValue)) * (height - 32);

                return (
                  <Circle
                    key={`point-${i}`}
                    cx={x}
                    cy={y}
                    r={dotRadius}
                    fill={color}
                    stroke={backgroundColor}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Add vertical dotted line for the selected point */}
              {isHovering &&
                selectedDataPoint !== null &&
                selectedDataPoint >= 0 && (
                  <Line
                    x1={
                      (selectedDataPoint / (data.length - 1)) * (width - 50) +
                      35
                    }
                    y1={0}
                    x2={
                      (selectedDataPoint / (data.length - 1)) * (width - 50) +
                      35
                    }
                    y2={height - 20}
                    stroke={color}
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    strokeOpacity={0.7}
                  />
                )}
            </Svg>
          </View>
        </View>
      </View>

      {/* X-axis labels - Moved to bottom */}
      {showXAxisLabels && labels.length > 0 && (
        <View style={styles.xAxisLabels}>
          {labels.map((label, i) => {
            // For daily data (30 days), show every 3rd label (1, 4, 7, 10, 13, 16, 19, 22, 25, 28)
            // For monthly data (12 months), show all labels
            const interval = labels.length > 20 ? 3 : 1;
            const shouldShow = i % interval === 0 || i === labels.length - 1;

            return shouldShow ? (
              <View
                key={`x-${i}`}
                style={[
                  styles.xLabelContainer,
                  {
                    left: (i / (labels.length - 1)) * (width - 50) + 35,
                  },
                ]}
              >
                <Text
                  style={[styles.xLabelText, { color: secondaryTextColor }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            ) : null;
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    borderRadius: 8,
    paddingBottom: 5,
    marginTop: 0,
    marginBottom: 15,
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
    right: 15,
    height: 1,
  },
  verticalGridLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  yAxisLabels: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 45,
  },
  yLabelContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  yLabelTextContainer: {
    position: "absolute",
    right: 3,
  },
  yLabelText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  yLabelTextContent: {
    paddingHorizontal: 2,
  },
  yLabelTextInner: {
    fontSize: 9,
  },
  xAxisLabels: {
    position: "relative",
    left: 0,
    right: 0,
    height: 30,
    marginTop: 5,
    zIndex: 5,
  },
  xLabelContainer: {
    position: "absolute",
    top: 0,
    transform: [{ translateX: -10 }],
  },
  xLabelText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
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
    height: 3,
    borderRadius: 1.5,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
});

export default LineChart;
