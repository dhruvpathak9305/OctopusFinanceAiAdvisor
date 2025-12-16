import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, View, Text, ImageSourcePropType, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoProps {
  size?: number;
  showText?: boolean;
  style?: any;
  animated?: boolean; // Enable/disable animation
}

/**
 * Theme-aware Logo component with animated border
 * Uses blue logo for light theme and black logo for dark theme
 * 
 * Required files:
 * - assets/octopus-logo-light.webp (blue octopus for light theme)
 * - assets/octopus-logo-dark.webp (black octopus for dark theme)
 */
export const Logo: React.FC<LogoProps> = ({ 
  size = 52, 
  showText = false,
  style,
  animated = true,
}) => {
  const { isDark } = useTheme();

  // Border animation values (only opacity - borderWidth doesn't support native driver)
  const borderOpacityAnim = useRef(new Animated.Value(0.6)).current;

  // Theme-specific logo images
  // Note: These files must exist in assets/ folder
  const lightLogo: ImageSourcePropType = require('../../assets/octopus-logo-light.webp');
  const darkLogo: ImageSourcePropType = require('../../assets/octopus-logo-dark.webp');

  useEffect(() => {
    if (!animated) {
      // Set to final values if animation disabled
      borderOpacityAnim.setValue(0.6);
      return;
    }

    // Animated border pulse - only opacity (borderWidth doesn't work well with native driver)
    // Use separate animations to avoid mixing native and non-native drivers
    const opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(borderOpacityAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(borderOpacityAnim, {
            toValue: 0.6,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
      ])
    );

    opacityAnimation.start();

    return () => {
      // Cleanup: stop all animations
      opacityAnimation.stop();
      borderOpacityAnim.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.logoWrapper}>
        <Animated.View
          style={[
            styles.borderContainer,
            {
              width: size + 8, // Add padding for border
              height: size + 8,
              borderRadius: 12, // Square border with rounded corners (matches logo borderRadius)
              borderWidth: 2, // Fixed border width (animation removed to avoid native driver conflict)
              borderColor: '#10B981', // Green accent color
              opacity: borderOpacityAnim,
            },
          ]}
        >
          <Image
            source={isDark ? darkLogo : lightLogo}
            style={[
              styles.logo,
              {
                width: size,
                height: size,
              },
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: isDark ? '#FFFFFF' : '#111827' }]}>OctopusFinancer</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  logo: {
    borderRadius: 8,
    // Ensure logo is visible and not clipped
    minWidth: 32,
    minHeight: 32,
  },
  fallbackEmoji: {
    textAlign: 'center',
  },
  textContainer: {
    marginLeft: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
});

