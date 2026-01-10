import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../contexts/ThemeContext";

const { width } = Dimensions.get("window");

// Shimmer Component with Delay
const Shimmer: React.FC<{ 
  style?: any; 
  width: number | string; 
  height: number; 
  borderRadius?: number;
  delay?: number; // Added delay prop
}> = ({ 
  style, 
  width, 
  height, 
  borderRadius = 4,
  delay = 0 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();

  // Enhanced colors for "premium" feel - significantly brighter pop
  const shimmerColors = isDark 
    ? ["#1F2937", "#374151", "#1F2937"] as const // Match background (#1F2937) so static pills blend in
    : ["#E5E7EB", "#FFFFFF", "#E5E7EB"] as const;

  useEffect(() => {
    // Initial delay before starting the loop
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
            // Add a small pause at the end of loop for natural breathing room? 
            // Or just continuous flow. The user said "1.2s loop".
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Standard ease-in-out for more natural feel
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
            })
        ])
      ).start();
    };

    if (delay > 0) {
      setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
    
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300], 
  });

  return (
    <View style={[styles.shimmerContainer, { width, height, borderRadius, backgroundColor: shimmerColors[0] }, style]}>
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// Main Skeleton Component
const BudgetProgressSkeleton: React.FC = () => {
  const { isDark } = useTheme();
  
  // Exact colors from BudgetProgressSection.tsx
  // Summary Card uses: #374151 (Dark) / #FFFFFF (Light)
  const summaryBg = isDark ? '#1F2937' : '#FFFFFF'; // Changed to #1F2937 to match app background per user request
  const summaryBorder = isDark ? '#4B5563' : '#E5E7EB';
  
  // Category Cards use: #1F2937 (Dark) / #FFFFFF (Light)
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const cardBorder = isDark ? '#374151' : '#E5E7EB';

  return (
    <View style={styles.container}>
      {/* Total Budget Bar Skeleton */}
      <View style={[styles.summaryCard, { backgroundColor: summaryBg, borderColor: summaryBorder }]}>
        <View style={styles.summaryHeader}>
          <Shimmer width={80} height={12} borderRadius={6} />
          <Shimmer width={40} height={12} borderRadius={6} />
          <Shimmer width={80} height={12} borderRadius={6} />
        </View>
        <View style={styles.summaryBarContainer}>
          <Shimmer width="100%" height={8} borderRadius={4} />
        </View>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {[0, 1, 2].map((index) => (
          <View 
            key={index} 
            style={[
              styles.card, 
              { backgroundColor: cardBg, borderColor: cardBorder }
            ]}
          >
            {/* Icon - Exact match: 32x32 container, icon roughly 18-20px */}
            <View style={styles.iconContainer}>
              <Shimmer width={32} height={32} borderRadius={16} delay={index * 150} />
            </View>

            {/* Title - "Needs" - font size 12 */}
            <Shimmer width={50} height={10} borderRadius={5} style={styles.titleShim} delay={index * 150} />

            {/* Ring - Size 65 in real comp, 5 stroke */}
            <View style={styles.ringContainer}>
                 <View style={styles.ringWrapper}>
                    <Shimmer width={65} height={65} borderRadius={32.5} delay={index * 150} />
                    <View style={[styles.ringInner, { backgroundColor: cardBg }]} />
                 </View>
            </View>
            
            {/* Percent - "0%" - font size 11 */}
            <View style={styles.percentContainer}>
                 <Shimmer width={24} height={10} borderRadius={5} delay={index * 150} />
            </View>

            {/* Amount lines - font size 10 */}
            <Shimmer width={70} height={8} borderRadius={4} style={styles.amountShim} delay={index * 150} />
            <Shimmer width={50} height={8} borderRadius={4} style={styles.leftShim} delay={index * 150} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // No padding here, handled by parent
  },
  shimmerContainer: {
    overflow: "hidden",
  },
  shimmerGradient: {
    ...StyleSheet.absoluteFillObject,
    width: "200%",
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,      // MATCH: paddingVertical: 8
    paddingHorizontal: 12,   // MATCH: paddingHorizontal: 12
    marginBottom: 10,        // MATCH: marginBottom: 10
    width: "100%",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,         // MATCH: marginBottom: 6 (numbersRow)
    alignItems: 'center',
  },
  summaryBarContainer: {
    width: "100%",
    // ProgressBar wrapper in real code doesn't have padding, just width 100%
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,                 // MATCH: gap: 12
    flexWrap: 'wrap',
  },
  card: {
    width: "30%",            // MATCH: width: "30%"
    borderRadius: 12,        // MATCH: borderRadius: 12
    borderWidth: 1,
    padding: 10,             // MATCH: padding: 10
    alignItems: "center",
    height: 196,             // MATCH: populated height (~196px) to correct visual jump
  },
  iconContainer: {
    marginBottom: 6,         // MATCH: marginBottom: 6 (categoryIcon)
    // No marginTop in real code (it's first item in card)
  },
  titleShim: {
    marginBottom: 6,         // MATCH: marginBottom: 6 (categoryName)
  },
  ringContainer: {
    marginVertical: 8,       // MATCH: marginVertical: 8 (progressContainer)
    height: 64,              // MATCH: height: 64
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    width: 65,               // MATCH: size={65}
    height: 65,
    borderRadius: 32.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 55,               // 65 - (5 * 2) = 55
    height: 55,
    borderRadius: 27.5,
    position: 'absolute',
  },
  percentContainer: {
    position: 'absolute',
    top: 96,                 // Adjusted to center visually in the ring (which is top of container + half height approx)
                             // Actually ringContainer is relative.
                             // Wait, specific absolute positioning isn't needed if centered in ringContainer.
                             // But ringContainer has the ringWrapper.
                             // Let's position this absolutely within ringContainer to allow layering
                             // Actually just centering it within ringWrapper is strictly better.
                             // But my current structure has it outside. Let's fix.
    // Fixed: Overlay centered in ringWrapper 
    alignItems: 'center',
    justifyContent: 'center',
    height: 65,
    width: 65,
    zIndex: 10,
  },
  amountShim: {
    marginTop: 6,            // MATCH: marginTop: 6 (categoryAmount)
  },
  leftShim: {
    marginTop: 4,            // MATCH: marginTop: 4 (remainingAmount)
  },
});

export default BudgetProgressSkeleton;
