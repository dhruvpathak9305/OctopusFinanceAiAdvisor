import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
} from "react-native-svg";

export interface PolarChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PolarChartProps {
  data: PolarChartData[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerText?: string;
  centerSubtext?: string;
  textColor?: string;
  backgroundColor?: string;
}

export const PolarChart: React.FC<PolarChartProps> = ({
  data,
  size = 280,
  innerRadius = 60,
  outerRadius = 100,
  centerText,
  centerSubtext,
  textColor = "#FFFFFF",
  backgroundColor = "#1F2937",
}) => {
  const center = size / 2;

  // Helper function to lighten/darken colors for gradient effect
  const adjustColor = (color: string, amount: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const R = Math.min(255, Math.max(0, (num >> 16) + amount));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  };

  // Calculate angles for each segment
  const calculatePath = (
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number
  ): string => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerR * Math.cos(startAngleRad);
    const y1 = center + outerR * Math.sin(startAngleRad);
    const x2 = center + outerR * Math.cos(endAngleRad);
    const y2 = center + outerR * Math.sin(endAngleRad);
    const x3 = center + innerR * Math.cos(endAngleRad);
    const y3 = center + innerR * Math.sin(endAngleRad);
    const x4 = center + innerR * Math.cos(startAngleRad);
    const y4 = center + innerR * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  // Calculate label position
  const calculateLabelPosition = (
    startAngle: number,
    endAngle: number,
    radius: number
  ) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    const x = center + radius * Math.cos(midAngleRad);
    const y = center + radius * Math.sin(midAngleRad);
    return { x, y };
  };

  let currentAngle = -90; // Start from top

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Create gradients for each segment */}
          {data.map((item, index) => (
            <LinearGradient
              key={`gradient-${index}`}
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor={adjustColor(item.color, 40)}
                stopOpacity="1"
              />
              <Stop offset="50%" stopColor={item.color} stopOpacity="1" />
              <Stop
                offset="100%"
                stopColor={adjustColor(item.color, -30)}
                stopOpacity="1"
              />
            </LinearGradient>
          ))}

          {/* Radial gradient for center circle */}
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={backgroundColor} stopOpacity="1" />
            <Stop offset="70%" stopColor={backgroundColor} stopOpacity="0.98" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </RadialGradient>
        </Defs>

        <G>
          {/* Outer shadow circles for depth */}
          <Circle
            cx={center}
            cy={center + 3}
            r={outerRadius + 30}
            fill="#000000"
            opacity={0.08}
          />
          <Circle
            cx={center}
            cy={center + 1}
            r={outerRadius + 28}
            fill="#000000"
            opacity={0.05}
          />

          {data.map((item, index) => {
            // For single segment with 100%, make it slightly less than 360 to render properly
            const segmentAngle =
              data.length === 1 && item.percentage === 100
                ? 359.9
                : (item.percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + segmentAngle;

            // Calculate different radius for each segment to create polar effect
            // Vary radius more dramatically like in the reference image
            const radiusVariations = [0, 20, 10, 28]; // Custom variation per segment
            const segmentOuterRadius =
              outerRadius + (radiusVariations[index] || index * 12);

            const path = calculatePath(
              startAngle,
              endAngle,
              innerRadius,
              segmentOuterRadius
            );

            // Shadow path for 3D depth
            const shadowPath = calculatePath(
              startAngle,
              endAngle,
              innerRadius - 1,
              segmentOuterRadius + 2
            );

            // Calculate label position
            const labelRadius = segmentOuterRadius + 28;
            const labelPos = calculateLabelPosition(
              startAngle,
              endAngle,
              labelRadius
            );

            // Calculate position for value on segment
            const valueRadius = (innerRadius + segmentOuterRadius) / 2;
            const valuePos = calculateLabelPosition(
              startAngle,
              endAngle,
              valueRadius
            );

            currentAngle = endAngle;

            return (
              <G key={index}>
                {/* Shadow for 3D effect */}
                <Path d={shadowPath} fill="#000000" opacity={0.15} />

                {/* Main segment with gradient */}
                <Path d={path} fill={`url(#gradient-${index})`} opacity={1} />

                {/* Highlight overlay for glossy effect */}
                <Path
                  d={path}
                  fill={adjustColor(item.color, 50)}
                  opacity={0.2}
                />

                {/* Segment border for definition */}
                <Path
                  d={path}
                  fill="none"
                  stroke={adjustColor(item.color, 30)}
                  strokeWidth={0.8}
                  opacity={0.4}
                />

                {/* External label with background circle */}
                <Circle
                  cx={labelPos.x}
                  cy={labelPos.y + 2}
                  r={24}
                  fill={backgroundColor}
                  opacity={0.75}
                />

                {/* Percentage label */}
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y - 2}
                  fill={item.color}
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {item.percentage}%
                </SvgText>

                {/* Name label */}
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  fill={textColor}
                  fontSize="9"
                  fontWeight="600"
                  opacity={0.7}
                  textAnchor="middle"
                >
                  {item.name}
                </SvgText>
              </G>
            );
          })}

          {/* Center circle shadow */}
          <Circle
            cx={center}
            cy={center + 2}
            r={innerRadius + 1}
            fill="#000000"
            opacity={0.12}
          />

          {/* Center circle with gradient */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="url(#centerGlow)"
          />

          {/* Inner decorative ring */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius - 4}
            fill="none"
            stroke={textColor}
            strokeWidth={0.5}
            opacity={0.15}
          />
        </G>

        {/* Center text with enhanced styling */}
        {centerText && (
          <G>
            {/* Text background for readability */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius - 15}
              fill={backgroundColor}
              opacity={0.3}
            />

            <SvgText
              x={center}
              y={center - 9}
              fill={textColor}
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              opacity={0.6}
              letterSpacing="0.5"
            >
              {centerSubtext || "Total"}
            </SvgText>
            <SvgText
              x={center}
              y={center + 13}
              fill={textColor}
              fontSize="24"
              fontWeight="800"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              {centerText}
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
