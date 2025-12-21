/**
 * =============================================================================
 * RIPPLE BUTTON COMPONENT
 * =============================================================================
 * 
 * Interactive button with ripple tap effect
 * Adapts web RippleButton to React Native with Animated API
 */

import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const RippleEffect: React.FC<{ ripple: Ripple; onComplete: () => void }> = ({
  ripple,
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    scale.value = withTiming(4, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        onComplete();
      }
    });
  }, [onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: ripple.x - 10,
          top: ripple.y - 10,
        },
        animatedStyle,
      ]}
    />
  );
};

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  
  const buttonScale = useSharedValue(1);

  // Ensure ripples is always an array
  const safeRipples = Array.isArray(ripples) ? ripples : [];

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return;

      const { locationX, locationY } = e.nativeEvent;
      const newRipple: Ripple = {
        id: Date.now(),
        x: locationX,
        y: locationY,
      };

      setRipples((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, newRipple];
      });

      // Enhanced button scale animation (matching web whileHover/whileTap)
      buttonScale.value = withSequence(
        withTiming(1.03, { duration: 80, easing: Easing.out(Easing.cubic) }),
        withTiming(0.97, { duration: 80, easing: Easing.in(Easing.cubic) }),
        withSpring(1, { damping: 12, stiffness: 400 })
      );

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return safePrev.filter((r) => r.id !== newRipple.id);
        });
      }, 600);

      onPress?.(e);
    },
    [disabled, onPress, buttonScale]
  );

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onLayout={handleLayout}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={[styles.container, animatedButtonStyle]}>
        {children}
        {safeRipples.map((ripple) => (
          <RippleEffect
            key={ripple.id}
            ripple={ripple}
            onComplete={() => {
              setRipples((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                return safePrev.filter((r) => r.id !== ripple.id);
              });
            }}
          />
        ))}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  },
});

