/**
 * =============================================================================
 * CREDIT CARD BOTTOM NAVIGATION
 * =============================================================================
 * 
 * Bottom navigation with UPI center button (inspired by reference design)
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_WIDTH = 400; // Max width for centered layout

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
  hasNotification?: boolean;
  onPress?: () => void;
}

interface CreditCardBottomNavProps {
  navItems?: NavItem[];
  onUPIPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CreditCardBottomNav: React.FC<CreditCardBottomNavProps> = ({
  navItems = [
    { icon: 'home-outline', label: 'HOME', active: false },
    { icon: 'card-outline', label: 'CARDS', active: true, hasNotification: true },
    { icon: 'gift-outline', label: 'REWARDS', active: false },
    { icon: 'grid-outline', label: 'MORE', active: false },
  ],
  onUPIPress,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  const upiScale = useSharedValue(1);
  const upiGlowScale = useSharedValue(1.4);
  const upiGlowOpacity = useSharedValue(0.3);
  const notificationScale = useSharedValue(1);
  
  // Icon rotation animations (matching web whileHover)
  const homeRotate = useSharedValue(0);
  const cardsRotate = useSharedValue(0);
  const rewardsRotate = useSharedValue(0);
  const moreRotate = useSharedValue(0);
  
  // Icon scale animations
  const homeScale = useSharedValue(1);
  const cardsScale = useSharedValue(1);
  const rewardsScale = useSharedValue(1);
  const moreScale = useSharedValue(1);

  // ENHANCED Pulsing glow animation for UPI - MORE DRAMATIC
  useEffect(() => {
    upiGlowScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 800, easing: Easing.inOut(Easing.ease) }), // Increased from 1.6 to 1.8, faster
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }) // Decreased from 1.4 to 1.3 for more contrast
      ),
      -1,
      false
    );
    
    upiGlowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }), // Increased from 0.6 to 0.8
        withTiming(0.4, { duration: 800 }) // Increased from 0.3 to 0.4
      ),
      -1,
      false
    );

    notificationScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 650 }), // Increased from 1.3 to 1.4, faster
        withTiming(1, { duration: 650 })
      ),
      -1,
      false
    );

    // Cleanup function to cancel animations on unmount
    return () => {
      upiGlowScale.value = 1.4;
      upiGlowOpacity.value = 0.3;
      notificationScale.value = 1;
    };
  }, [upiGlowScale, upiGlowOpacity, notificationScale]);

  const upiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: upiScale.value }],
  }));

  const upiGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: upiGlowScale.value }],
    opacity: upiGlowOpacity.value,
  }));

  const notificationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: notificationScale.value }],
  }));
  
  // Icon animated styles
  const homeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${homeRotate.value}deg` }, { scale: homeScale.value }],
  }));
  
  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${cardsRotate.value}deg` }, { scale: cardsScale.value }],
  }));
  
  const rewardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rewardsRotate.value}deg` }, { scale: rewardsScale.value }],
  }));
  
  const moreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${moreRotate.value}deg` }, { scale: moreScale.value }],
  }));

  const handleUPIPress = () => {
    // Smooth, simple press animation (matching web whileTap)
    upiScale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );
    onUPIPress?.();
  };
  
  // Icon press handlers with rotation animation (matching web)
  const handleIconPress = (iconName: 'home' | 'cards' | 'rewards' | 'more', callback?: () => void) => {
    const rotateValue = iconName === 'home' ? homeRotate : 
                        iconName === 'cards' ? cardsRotate :
                        iconName === 'rewards' ? rewardsRotate : moreRotate;
    const scaleValue = iconName === 'home' ? homeScale : 
                       iconName === 'cards' ? cardsScale :
                       iconName === 'rewards' ? rewardsScale : moreScale;
    
    // ENHANCED: Rotation wiggle animation (more visible)
    rotateValue.value = withSequence(
      withTiming(-15, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withTiming(15, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
      withSpring(0, { damping: 10, stiffness: 300 })
    );
    
    // ENHANCED: Scale animation with more bounce
    scaleValue.value = withSequence(
      withTiming(0.85, { duration: 80, easing: Easing.out(Easing.cubic) }),
      withSpring(1.1, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    
    callback?.();
  };

  return (
    <View style={styles.wrapper}>
      {/* Gradient fade at top */}
      <LinearGradient
        colors={['transparent', colors.background || '#000']}
        style={styles.gradientFade}
        pointerEvents="none"
      />
      
      <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={[styles.navContent, { maxWidth: MAX_WIDTH }]}>
          {/* HOME */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleIconPress('home', navItems[0]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[0]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <Animated.View style={[styles.iconContainer, homeAnimatedStyle]}>
              <Ionicons
                name="home-outline"
                size={19}
                color={navItems[0]?.active ? colors.text : colors.textSecondary}
              />
            </Animated.View>
            <Text
              style={[
                styles.navLabel,
                {
                  color: navItems[0]?.active ? colors.text : colors.textSecondary,
                  fontWeight: navItems[0]?.active ? '700' : '600',
                },
              ]}
            >
              HOME
            </Text>
          </TouchableOpacity>

          {/* CARDS */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleIconPress('cards', navItems[1]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[1]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <Animated.View style={[styles.iconContainer, cardsAnimatedStyle]}>
              <Ionicons
                name="card-outline"
                size={19}
                color={navItems[1]?.active ? colors.text : colors.textSecondary}
              />
              {navItems[1]?.hasNotification && (
                <Animated.View 
                  style={[
                    styles.notificationDot, 
                    { backgroundColor: '#EF4444' },
                    notificationAnimatedStyle
                  ]} 
                />
              )}
            </Animated.View>
            <Text
              style={[
                styles.navLabel,
                {
                  color: navItems[1]?.active ? colors.text : colors.textSecondary,
                  fontWeight: navItems[1]?.active ? '700' : '600',
                },
              ]}
            >
              CARDS
            </Text>
          </TouchableOpacity>

          {/* UPI (CENTER) */}
          <View style={styles.upiContainer}>
            {/* Pulsing glow effect */}
            <Animated.View style={[styles.upiGlow, upiGlowStyle]} />
            
            <AnimatedTouchable
              style={[styles.upiButton, upiAnimatedStyle]}
              onPress={handleUPIPress}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5', '#E5E5E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.upiGradient}
              >
                <Text style={styles.upiText}>UPI</Text>
              </LinearGradient>
            </AnimatedTouchable>
          </View>

          {/* REWARDS */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleIconPress('rewards', navItems[2]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[2]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <Animated.View style={[styles.iconContainer, rewardsAnimatedStyle]}>
              <Ionicons
                name="gift-outline"
                size={19}
                color={navItems[2]?.active ? colors.text : colors.textSecondary}
              />
            </Animated.View>
            <Text
              style={[
                styles.navLabel,
                {
                  color: navItems[2]?.active ? colors.text : colors.textSecondary,
                  fontWeight: navItems[2]?.active ? '700' : '600',
                },
              ]}
            >
              REWARDS
            </Text>
          </TouchableOpacity>

          {/* MORE */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleIconPress('more', navItems[3]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[3]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <Animated.View style={[styles.iconContainer, moreAnimatedStyle]}>
              <Ionicons
                name="grid-outline"
                size={19}
                color={navItems[3]?.active ? colors.text : colors.textSecondary}
              />
            </Animated.View>
            <Text
              style={[
                styles.navLabel,
                {
                  color: navItems[3]?.active ? colors.text : colors.textSecondary,
                  fontWeight: navItems[3]?.active ? '700' : '600',
                },
              ]}
            >
              MORE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  gradientFade: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    height: 80,
    pointerEvents: 'none',
  },
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Darker background matching image
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingBottom: 8,
    gap: 5,
    position: 'relative',
    minWidth: 50,
  },
  iconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  upiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    position: 'relative',
    width: 60,
    marginHorizontal: 4,
  },
  upiGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  upiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    // Enhanced shadow matching web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    // White glow effect
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upiGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  upiText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#1a1a1a',
  },
});

