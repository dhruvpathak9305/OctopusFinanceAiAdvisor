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
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
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

  const notificationScale = useSharedValue(1);
  
  // Simple notification animation only
  useEffect(() => {
    notificationScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );

    return () => {
      notificationScale.value = 1;
    };
  }, [notificationScale]);

  const notificationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: notificationScale.value }],
  }));

  const handleUPIPress = () => {
    // Simple press without animations
    onUPIPress?.();
  };
  
  // Simple icon press handlers without animations
  const handleIconPress = (callback?: () => void) => {
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
            onPress={() => handleIconPress(navItems[0]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[0]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <View style={styles.iconContainer}>
              <Ionicons
                name="home-outline"
                size={19}
                color={navItems[0]?.active ? colors.text : colors.textSecondary}
              />
            </View>
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
            onPress={() => handleIconPress(navItems[1]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[1]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <View style={styles.iconContainer}>
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
            </View>
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
            <TouchableOpacity
              style={styles.upiButton}
              onPress={handleUPIPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5', '#E5E5E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.upiGradient}
              >
                <Text style={styles.upiText}>UPI</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* REWARDS */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleIconPress(navItems[2]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[2]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <View style={styles.iconContainer}>
              <Ionicons
                name="gift-outline"
                size={19}
                color={navItems[2]?.active ? colors.text : colors.textSecondary}
              />
            </View>
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
            onPress={() => handleIconPress(navItems[3]?.onPress)}
            activeOpacity={0.7}
          >
            {navItems[3]?.active && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.text }]} />
            )}
            <View style={styles.iconContainer}>
              <Ionicons
                name="grid-outline"
                size={19}
                color={navItems[3]?.active ? colors.text : colors.textSecondary}
              />
            </View>
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
    backgroundColor: '#1F2937', // Dark gray matching Financial Dashboard cards
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
  upiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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

