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

  // Border animation values - only shadow animations (scale removed to avoid driver conflicts)
  const shadowOpacityAnim = useRef(new Animated.Value(0.3)).current;
  const shadowRadiusAnim = useRef(new Animated.Value(4)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Theme-specific logo images
  // Note: These files must exist in assets/ folder
  const lightLogo: ImageSourcePropType = require('../../assets/octopus-logo-light.webp');
  const darkLogo: ImageSourcePropType = require('../../assets/octopus-logo-dark.webp');

  useEffect(() => {
    // Stop any existing animation first
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Stop all animated values to clear any native driver flags
    shadowOpacityAnim.stopAnimation();
    shadowRadiusAnim.stopAnimation();

    // Set static values - animations disabled to avoid native driver conflicts
    // The animated values may have been marked as native from previous runs
    shadowOpacityAnim.setValue(0.5);
    shadowRadiusAnim.setValue(8);

    // Animation disabled to prevent native driver conflicts
    // The animated values retain their native state from previous animations
    // which causes conflicts when trying to use JS driver
    
    return () => {
      // Cleanup: stop animation and reset values
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      shadowOpacityAnim.stopAnimation();
      shadowRadiusAnim.stopAnimation();
      // Reset to static values
      shadowOpacityAnim.setValue(0.5);
      shadowRadiusAnim.setValue(8);
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
              borderRadius: 24, // More rounded corners for better appearance
              borderWidth: 2, // Fixed border width
              borderColor: '#10B981', // Green accent color
              // Static shadow effect (animations disabled to avoid native driver conflicts)
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: shadowOpacityAnim,
              shadowRadius: shadowRadiusAnim,
              elevation: 8, // Android shadow
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
          <Text style={[styles.text, { color: isDark ? '#FFFFFF' : '#111827' }]}>Octopus Organizer</Text>
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
    borderRadius: 20,
  },
  logo: {
    borderRadius: 16,
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

