import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";

interface SkeletonProps {
  style?: any;
}

const SkeletonTransactionItem: React.FC<SkeletonProps> = ({ style }) => {
  const { isDark } = useTheme();

  // Animation for pulse effect
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  const colors = isDark
    ? {
        card: "#1F2937",
        border: "#374151",
        skeleton: "rgba(255, 255, 255, 0.1)",
      }
    : {
        card: "#FFFFFF",
        border: "#E5E7EB",
        skeleton: "rgba(0, 0, 0, 0.06)",
      };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.leftContent}>
        {/* Icon Skeleton */}
        <Animated.View
          style={[
            styles.iconSkeleton,
            { backgroundColor: colors.skeleton, opacity: pulseAnim },
          ]}
        />

        <View style={styles.infoSkeleton}>
          {/* Title Line */}
          <Animated.View
            style={[
              styles.textLine,
              styles.titleLine,
              { backgroundColor: colors.skeleton, opacity: pulseAnim },
            ]}
          />
          {/* Subtitle/Source Line */}
          <Animated.View
            style={[
              styles.textLine,
              styles.subtitleLine,
              { backgroundColor: colors.skeleton, opacity: pulseAnim },
            ]}
          />
        </View>
      </View>

      <View style={styles.rightContent}>
        {/* Amount Line */}
        <Animated.View
          style={[
            styles.textLine,
            styles.amountLine,
            { backgroundColor: colors.skeleton, opacity: pulseAnim },
          ]}
        />
        {/* Date/Time Line - simplified representation */}
        <Animated.View
          style={[
            styles.textLine,
            styles.dateLine,
            { backgroundColor: colors.skeleton, opacity: pulseAnim },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  infoSkeleton: {
    flex: 1,
    justifyContent: "center",
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
  },
  textLine: {
    borderRadius: 4,
  },
  titleLine: {
    width: "60%",
    height: 14,
    marginBottom: 8,
  },
  subtitleLine: {
    width: "40%",
    height: 10,
  },
  amountLine: {
    width: 70,
    height: 14,
    marginBottom: 8,
  },
  dateLine: {
    width: 40,
    height: 10,
  },
});

export default SkeletonTransactionItem;
