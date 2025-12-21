import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from './styles/sharedStyles';

export const SkeletonCard = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Shimmer overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.leftTop}>
            <View style={styles.bankName} />
            <View style={styles.cardNumber} />
          </View>
          <View style={styles.rightTop}>
            <View style={styles.amount} />
            <View style={styles.dueDate} />
          </View>
        </View>

        {/* Chip */}
        <View style={styles.chip} />

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.holderName} />
          <View style={styles.button} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 224, // h-56 (56 * 4 = 224px)
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(13, 13, 13, 0.5)', // card/50
    overflow: 'hidden',
    marginHorizontal: SPACING.lg,
  },
  content: {
    padding: SPACING.xl,
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftTop: {
    gap: SPACING.sm,
  },
  bankName: {
    height: 20,
    width: 96, // w-24
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(31, 31, 31, 0.3)', // muted/30
  },
  cardNumber: {
    height: 12,
    width: 64, // w-16
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(31, 31, 31, 0.2)', // muted/20
  },
  rightTop: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  amount: {
    height: 24,
    width: 80, // w-20
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(31, 31, 31, 0.3)',
  },
  dueDate: {
    height: 12,
    width: 56, // w-14
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(31, 31, 31, 0.2)',
  },
  chip: {
    width: 40, // w-10
    height: 32, // h-8
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(31, 31, 31, 0.3)',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderName: {
    height: 16,
    width: 112, // w-28
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(31, 31, 31, 0.3)',
  },
  button: {
    height: 40,
    width: 96, // w-24
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(31, 31, 31, 0.3)',
  },
});

