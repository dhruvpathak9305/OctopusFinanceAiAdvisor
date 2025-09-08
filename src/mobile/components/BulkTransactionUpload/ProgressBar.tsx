import React from "react";
import { View, StyleSheet, Animated } from "react-native";

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  color = "#007AFF",
  backgroundColor = "#e0e0e0",
  height = 8,
}: ProgressBarProps) {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  return (
    <View style={[styles.container, { backgroundColor, height }]}>
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: color,
            height,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 8,
  },
  progress: {
    borderRadius: 4,
  },
});
